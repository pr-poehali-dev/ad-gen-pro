"""Профиль пользователя и API-ключи внешних рекламных платформ."""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

ALLOWED_PROVIDERS = {'yandex_direct', 'google_ads', 'polza_ai', 'vk_ads'}


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
        f"SELECT u.id, u.email, u.role, u.is_admin "
        f"FROM users u JOIN sessions s ON s.user_id = u.id "
        f"WHERE s.token = '{safe}' AND s.expires_at > NOW() LIMIT 1"
    )
    return cur.fetchone()


def _mask_key(key: str) -> str:
    if not key:
        return ''
    s = str(key)
    if len(s) <= 8:
        return '•' * len(s)
    return s[:4] + '•' * 12 + s[-4:]


def _get_profile(cur, user_id):
    cur.execute(f"""
        SELECT id, email, name, first_name, last_name, company, phone, role, is_admin, plan, created_at
        FROM users WHERE id = {int(user_id)} LIMIT 1
    """)
    u = cur.fetchone()
    if not u:
        return {'error': 'Пользователь не найден'}
    cur.execute(f"""
        SELECT provider, api_key, extra, is_active, updated_at
        FROM user_api_keys WHERE user_id = {int(user_id)}
    """)
    keys = []
    for r in cur.fetchall():
        keys.append({
            'provider': r['provider'],
            'masked': _mask_key(r['api_key']),
            'has_value': bool(r['api_key']),
            'is_active': r['is_active'],
            'extra': r['extra'] or {},
            'updated_at': r['updated_at'],
        })
    return {'user': dict(u), 'api_keys': keys}


def _save_profile(cur, user_id, body):
    fields = []
    if 'name' in body:
        v = (body.get('name') or '').replace("'", "''")[:255]
        fields.append(f"name = '{v}'")
    if 'first_name' in body:
        v = (body.get('first_name') or '').replace("'", "''")[:255]
        fields.append(f"first_name = '{v}'")
    if 'last_name' in body:
        v = (body.get('last_name') or '').replace("'", "''")[:255]
        fields.append(f"last_name = '{v}'")
    if 'company' in body:
        v = (body.get('company') or '').replace("'", "''")[:255]
        fields.append(f"company = '{v}'")
    if 'phone' in body:
        v = (body.get('phone') or '').replace("'", "''")[:64]
        fields.append(f"phone = '{v}'")
    if not fields:
        return {'error': 'Нет полей для сохранения'}
    cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = {int(user_id)}")
    return {'ok': True}


def _save_api_key(cur, user_id, body):
    provider = (body.get('provider') or '').strip()
    if provider not in ALLOWED_PROVIDERS:
        return {'error': 'Неизвестный провайдер'}
    api_key = (body.get('api_key') or '').strip()
    safe_provider = provider.replace("'", "''")
    safe_key = api_key.replace("'", "''")[:5000]
    extra = body.get('extra') or {}
    safe_extra = json.dumps(extra).replace("'", "''")

    cur.execute(f"""
        SELECT id FROM user_api_keys
        WHERE user_id = {int(user_id)} AND provider = '{safe_provider}' LIMIT 1
    """)
    row = cur.fetchone()
    if row:
        cur.execute(f"""
            UPDATE user_api_keys
            SET api_key = '{safe_key}', extra = '{safe_extra}'::jsonb,
                is_active = TRUE, updated_at = NOW()
            WHERE id = {row['id']}
        """)
    else:
        cur.execute(f"""
            INSERT INTO user_api_keys (user_id, provider, api_key, extra, is_active)
            VALUES ({int(user_id)}, '{safe_provider}', '{safe_key}', '{safe_extra}'::jsonb, TRUE)
        """)
    return {'ok': True}


def _delete_api_key(cur, user_id, body):
    provider = (body.get('provider') or '').strip()
    if provider not in ALLOWED_PROVIDERS:
        return {'error': 'Неизвестный провайдер'}
    safe_provider = provider.replace("'", "''")
    cur.execute(f"""
        UPDATE user_api_keys SET api_key = '', is_active = FALSE, updated_at = NOW()
        WHERE user_id = {int(user_id)} AND provider = '{safe_provider}'
    """)
    return {'ok': True}


def handler(event, context):
    """Профиль пользователя и его API-ключи рекламных платформ"""
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

        if method == 'GET' and action == 'me':
            return _resp(200, _get_profile(cur, uid))

        if method == 'POST' and action == 'save_profile':
            return _resp(200, _save_profile(cur, uid, body))

        if method == 'POST' and action == 'save_api_key':
            return _resp(200, _save_api_key(cur, uid, body))

        if method == 'POST' and action == 'delete_api_key':
            return _resp(200, _delete_api_key(cur, uid, body))

        return _resp(400, {'error': 'Неизвестное действие'})
    except Exception as e:
        import traceback, sys
        print(f"[SETTINGS ERROR] {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()
