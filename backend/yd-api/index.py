"""Интеграция с Яндекс Директ API: OAuth + отправка кампаний + получение статистики.
Документация: https://yandex.ru/dev/direct/doc/start/concepts/auth.html
"""
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

YD_PROVIDER = 'yandex_direct'
YD_API_BASE = 'https://api.direct.yandex.com/json/v5'
YD_OAUTH_TOKEN_URL = 'https://oauth.yandex.ru/token'
YD_OAUTH_AUTHORIZE_URL = 'https://oauth.yandex.ru/authorize'


def _resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, default=str),
    }


def _user_by_token(cur, token):
    if not token:
        return None
    safe = token.replace("'", "''")
    cur.execute(
        f"SELECT u.id, u.email FROM users u "
        f"JOIN sessions s ON s.user_id = u.id "
        f"WHERE s.token = '{safe}' AND s.expires_at > NOW() LIMIT 1"
    )
    return cur.fetchone()


def _log(cur, user_id, campaign_id, operation, success, code=None, error='', summary=''):
    safe_op = operation.replace("'", "''")[:32]
    safe_err = error.replace("'", "''")[:2000]
    safe_sum = summary.replace("'", "''")[:1000]
    cid = int(campaign_id) if campaign_id else 'NULL'
    code_sql = str(int(code)) if code else 'NULL'
    cur.execute(f"""
        INSERT INTO yd_api_logs
        (user_id, campaign_id, operation, success, response_code, error_message, request_summary)
        VALUES ({int(user_id)}, {cid}, '{safe_op}',
                {'TRUE' if success else 'FALSE'}, {code_sql}, '{safe_err}', '{safe_sum}')
    """)


def _get_token_row(cur, user_id):
    cur.execute(f"""
        SELECT api_key, refresh_token, token_expires_at, scope, account_login, is_active
        FROM user_api_keys
        WHERE user_id = {int(user_id)} AND provider = '{YD_PROVIDER}'
        LIMIT 1
    """)
    return cur.fetchone()


def _save_token(cur, user_id, access_token, refresh_token, expires_in, scope='', account_login=''):
    expires_at = datetime.utcnow() + timedelta(seconds=int(expires_in or 0))
    safe_a = (access_token or '').replace("'", "''")[:5000]
    safe_r = (refresh_token or '').replace("'", "''")[:5000]
    safe_s = (scope or '').replace("'", "''")[:500]
    safe_login = (account_login or '').replace("'", "''")[:255]

    cur.execute(f"""
        SELECT id FROM user_api_keys
        WHERE user_id = {int(user_id)} AND provider = '{YD_PROVIDER}' LIMIT 1
    """)
    row = cur.fetchone()
    if row:
        cur.execute(f"""
            UPDATE user_api_keys
            SET api_key = '{safe_a}', refresh_token = '{safe_r}',
                token_expires_at = '{expires_at.isoformat()}',
                scope = '{safe_s}', account_login = '{safe_login}',
                is_active = TRUE, updated_at = NOW()
            WHERE id = {row['id']}
        """)
    else:
        cur.execute(f"""
            INSERT INTO user_api_keys
            (user_id, provider, api_key, refresh_token, token_expires_at, scope, account_login, is_active)
            VALUES ({int(user_id)}, '{YD_PROVIDER}', '{safe_a}', '{safe_r}',
                    '{expires_at.isoformat()}', '{safe_s}', '{safe_login}', TRUE)
        """)


def _build_auth_url(client_id, redirect_uri, state):
    """Возвращает URL для редиректа пользователя на Яндекс OAuth."""
    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'state': state,
        'scope': 'direct:api',
        'force_confirm': 'yes',
    }
    return f"{YD_OAUTH_AUTHORIZE_URL}?{urllib.parse.urlencode(params)}"


def _exchange_code_for_token(client_id, client_secret, code, redirect_uri):
    data = urllib.parse.urlencode({
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
    }).encode('utf-8')
    req = urllib.request.Request(YD_OAUTH_TOKEN_URL, data=data, method='POST',
                                  headers={'Content-Type': 'application/x-www-form-urlencoded'})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode('utf-8'))


def _refresh_token(client_id, client_secret, refresh_token):
    data = urllib.parse.urlencode({
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': client_id,
        'client_secret': client_secret,
    }).encode('utf-8')
    req = urllib.request.Request(YD_OAUTH_TOKEN_URL, data=data, method='POST',
                                  headers={'Content-Type': 'application/x-www-form-urlencoded'})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode('utf-8'))


def _get_valid_token(cur, user_id):
    """Возвращает актуальный access_token, обновляя при необходимости через refresh."""
    row = _get_token_row(cur, user_id)
    if not row or not row.get('api_key'):
        return None, 'Не подключено'

    # Проверяем срок
    expires_at = row.get('token_expires_at')
    if expires_at:
        try:
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at.replace('Z', ''))
            if expires_at > datetime.utcnow() + timedelta(minutes=2):
                return row['api_key'], None
        except Exception:
            pass

    # Нужен refresh
    client_id = os.environ.get('YANDEX_OAUTH_CLIENT_ID')
    client_secret = os.environ.get('YANDEX_OAUTH_CLIENT_SECRET')
    if not client_id or not client_secret:
        return None, 'YANDEX_OAUTH_CLIENT_ID / SECRET не настроены'

    if not row.get('refresh_token'):
        return None, 'Refresh-токен отсутствует — переподключите аккаунт'

    try:
        tok = _refresh_token(client_id, client_secret, row['refresh_token'])
        if 'access_token' not in tok:
            return None, f"Ошибка обновления токена: {tok.get('error_description') or tok}"
        _save_token(cur, user_id,
                    tok['access_token'], tok.get('refresh_token') or row['refresh_token'],
                    tok.get('expires_in', 0), row.get('scope', ''), row.get('account_login', ''))
        _log(cur, user_id, None, 'oauth_refresh', True, 200, summary='Token refreshed')
        return tok['access_token'], None
    except Exception as e:
        _log(cur, user_id, None, 'oauth_refresh', False, error=str(e))
        return None, f'Ошибка обновления токена: {e}'


def _yd_api_call(token, service, method, params, login=''):
    """Вызов Яндекс Директ API v5."""
    payload = json.dumps({'method': method, 'params': params}).encode('utf-8')
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept-Language': 'ru',
        'Content-Type': 'application/json; charset=utf-8',
    }
    if login:
        headers['Client-Login'] = login
    req = urllib.request.Request(f'{YD_API_BASE}/{service}', data=payload, method='POST', headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.getcode(), json.loads(resp.read().decode('utf-8'))


# ====================== ACTIONS ======================

def _action_status(cur, user_id):
    """Текущее состояние подключения."""
    row = _get_token_row(cur, user_id)
    client_id = os.environ.get('YANDEX_OAUTH_CLIENT_ID')
    client_secret = os.environ.get('YANDEX_OAUTH_CLIENT_SECRET')
    return {
        'oauth_configured': bool(client_id and client_secret),
        'connected': bool(row and row.get('api_key') and row.get('is_active')),
        'account_login': (row or {}).get('account_login') or '',
        'token_expires_at': str((row or {}).get('token_expires_at') or ''),
        'scope': (row or {}).get('scope') or '',
    }


def _action_connect_url(body, user_id):
    """Возвращает URL для перехода на Яндекс OAuth."""
    client_id = os.environ.get('YANDEX_OAUTH_CLIENT_ID')
    if not client_id:
        return {'error': 'YANDEX_OAUTH_CLIENT_ID не настроен в секретах проекта'}
    redirect_uri = (body.get('redirect_uri') or '').strip()
    if not redirect_uri:
        return {'error': 'redirect_uri обязателен'}
    # state = user_id для возврата контекста после ЯД
    state = f"u{int(user_id)}"
    return {'auth_url': _build_auth_url(client_id, redirect_uri, state)}


def _action_callback(cur, user_id, body):
    """Обмен code на access/refresh токены."""
    client_id = os.environ.get('YANDEX_OAUTH_CLIENT_ID')
    client_secret = os.environ.get('YANDEX_OAUTH_CLIENT_SECRET')
    if not client_id or not client_secret:
        return {'error': 'OAuth не настроен (нет client_id/secret)'}
    code = (body.get('code') or '').strip()
    redirect_uri = (body.get('redirect_uri') or '').strip()
    if not code:
        return {'error': 'code обязателен'}

    try:
        tok = _exchange_code_for_token(client_id, client_secret, code, redirect_uri)
    except Exception as e:
        _log(cur, user_id, None, 'oauth_connect', False, error=str(e))
        return {'error': f'Не удалось обменять code: {e}'}

    if 'access_token' not in tok:
        msg = tok.get('error_description') or tok.get('error') or 'Неизвестная ошибка'
        _log(cur, user_id, None, 'oauth_connect', False, error=str(msg))
        return {'error': f'Yandex OAuth: {msg}'}

    # Логин аккаунта получим отдельным запросом
    account_login = ''
    try:
        ureq = urllib.request.Request(
            'https://login.yandex.ru/info?format=json',
            headers={'Authorization': f'OAuth {tok["access_token"]}'}
        )
        with urllib.request.urlopen(ureq, timeout=15) as r:
            uinfo = json.loads(r.read().decode('utf-8'))
            account_login = uinfo.get('login') or ''
    except Exception:
        pass

    _save_token(cur, user_id,
                tok['access_token'], tok.get('refresh_token', ''),
                tok.get('expires_in', 0), tok.get('scope', ''), account_login)
    _log(cur, user_id, None, 'oauth_connect', True, 200,
         summary=f"Connected as {account_login}")
    return {'ok': True, 'account_login': account_login}


def _action_disconnect(cur, user_id):
    cur.execute(f"""
        UPDATE user_api_keys
        SET api_key = '', refresh_token = '', is_active = FALSE, updated_at = NOW()
        WHERE user_id = {int(user_id)} AND provider = '{YD_PROVIDER}'
    """)
    return {'ok': True}


def _action_send_campaign(cur, user_id, body):
    """Отправка кампании в Яндекс Директ через API.
    На первом этапе создаём только Campaign (без групп/объявлений) — даём пользователю
    рабочий пайплайн отправки и доделаем вложенные сущности после реальных тестов."""
    cid = int(body.get('id') or 0)
    if not cid:
        return {'error': 'id required'}

    cur.execute(f"""
        SELECT * FROM yd_campaigns WHERE id = {cid} AND user_id = {int(user_id)} LIMIT 1
    """)
    campaign = cur.fetchone()
    if not campaign:
        return {'error': 'not found'}

    token, err = _get_valid_token(cur, user_id)
    if err:
        return {'error': err}

    # Минимальная структура Campaign для ЯД API v5
    name = (campaign.get('name') or 'Кампания')[:255]
    daily = float(campaign.get('daily_budget') or 0)
    weekly = float(campaign.get('weekly_budget') or 0)

    bid_strategy = {
        'Search': {'BiddingStrategyType': 'HIGHEST_POSITION'},
        'Network': {'BiddingStrategyType': 'SERVING_OFF'},
    }
    if campaign.get('strategy_type') == 'max_clicks_with_budget' and weekly > 0:
        bid_strategy = {
            'Search': {
                'BiddingStrategyType': 'WB_MAXIMUM_CLICKS',
                'WbMaximumClicks': {'WeeklySpendLimit': int(weekly * 1_000_000)},
            },
            'Network': {'BiddingStrategyType': 'SERVING_OFF'},
        }

    yd_payload = {
        'Campaigns': [{
            'Name': name,
            'StartDate': datetime.utcnow().strftime('%Y-%m-%d'),
            'TextCampaign': {
                'BiddingStrategy': bid_strategy,
                'Settings': [],
            }
        }]
    }
    if daily > 0:
        yd_payload['Campaigns'][0]['DailyBudget'] = {
            'Amount': int(daily * 1_000_000),
            'Mode': 'STANDARD',
        }

    row = _get_token_row(cur, user_id)
    login = (row or {}).get('account_login') or ''

    try:
        code, resp = _yd_api_call(token, 'campaigns', 'add', yd_payload, login=login)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore') if e.fp else str(e)
        _log(cur, user_id, cid, 'send', False, e.code, err_body[:1000])
        cur.execute(f"""
            UPDATE yd_campaigns SET yd_sync_error = '{err_body[:500].replace("'", "''")}' WHERE id = {cid}
        """)
        return {'error': f'YD API HTTP {e.code}: {err_body[:300]}'}
    except Exception as e:
        _log(cur, user_id, cid, 'send', False, error=str(e))
        return {'error': f'YD API: {e}'}

    # Парсим ответ
    add_results = (resp.get('result') or {}).get('AddResults') or []
    if add_results and add_results[0].get('Id'):
        ext_id = str(add_results[0]['Id'])
        cur.execute(f"""
            UPDATE yd_campaigns
            SET yd_external_id = '{ext_id}', yd_sent_at = NOW(),
                yd_sync_error = '', status = 'sent', updated_at = NOW()
            WHERE id = {cid}
        """)
        _log(cur, user_id, cid, 'send', True, code, summary=f'campaign_id={ext_id}')
        return {'ok': True, 'yd_campaign_id': ext_id}
    else:
        err_msg = (resp.get('error') or {}).get('error_string') or json.dumps(resp)[:500]
        cur.execute(f"""
            UPDATE yd_campaigns SET yd_sync_error = '{err_msg[:500].replace("'", "''")}' WHERE id = {cid}
        """)
        _log(cur, user_id, cid, 'send', False, code, err_msg[:1000])
        return {'error': err_msg}


def _action_logs(cur, user_id, params):
    cid = params.get('campaign_id')
    where = [f"user_id = {int(user_id)}"]
    if cid:
        try:
            where.append(f"campaign_id = {int(cid)}")
        except Exception:
            pass
    cur.execute(f"""
        SELECT id, campaign_id, operation, success, response_code,
               error_message, request_summary, created_at
        FROM yd_api_logs
        WHERE {' AND '.join(where)}
        ORDER BY created_at DESC LIMIT 100
    """)
    return {'logs': [dict(r) for r in cur.fetchall()]}


# ====================== HANDLER ======================

def handler(event, context):
    """Интеграция с Яндекс Директ API: OAuth и отправка кампаний"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'isBase64Encoded': False, 'body': ''}

    headers = event.get('headers') or {}
    headers_lower = {k.lower(): v for k, v in headers.items()}
    token = headers_lower.get('x-auth-token', '')

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw) if body_raw else {}
    except Exception:
        body = {}

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return _resp(500, {'error': 'DATABASE_URL is not configured'})

    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        user = _user_by_token(cur, token)
        if not user:
            return _resp(401, {'error': 'Не авторизован'})
        uid = user['id']

        if method == 'GET' and action == 'status':
            return _resp(200, _action_status(cur, uid))
        if method == 'POST' and action == 'connect_url':
            return _resp(200, _action_connect_url(body, uid))
        if method == 'POST' and action == 'callback':
            return _resp(200, _action_callback(cur, uid, body))
        if method == 'POST' and action == 'disconnect':
            return _resp(200, _action_disconnect(cur, uid))
        if method == 'POST' and action == 'send':
            return _resp(200, _action_send_campaign(cur, uid, body))
        if method == 'GET' and action == 'logs':
            return _resp(200, _action_logs(cur, uid, params))

        return _resp(400, {'error': 'Неизвестное действие'})
    except Exception as e:
        import traceback, sys
        print(f"[YD-API ERROR] {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()
