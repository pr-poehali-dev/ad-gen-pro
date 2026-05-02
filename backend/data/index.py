import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def _resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, default=str),
    }


def _user_by_token(cur, token: str):
    safe = token.replace("'", "''")
    cur.execute(
        f"SELECT u.id FROM users u JOIN sessions s ON s.user_id = u.id "
        f"WHERE s.token = '{safe}' AND s.expires_at > NOW() LIMIT 1"
    )
    return cur.fetchone()


def _q(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"


def _num(v, default=0):
    try:
        return float(v)
    except Exception:
        return default


def _int(v, default=0):
    try:
        return int(v)
    except Exception:
        return default


def handler(event, context):
    """Синхронизация пользовательских кампаний, фидов и состояния"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'isBase64Encoded': False, 'body': ''}

    headers = event.get('headers') or {}
    headers_lower = {k.lower(): v for k, v in headers.items()}
    token = headers_lower.get('x-auth-token', '')

    if not token:
        return _resp(401, {'error': 'Не авторизован'})

    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', '')

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
            return _resp(401, {'error': 'Сессия истекла'})
        user_id = user['id']

        if method == 'GET' and resource == 'all':
            cur.execute(
                f"SELECT client_id, name, platform, status, budget, spent, impressions, clicks, conversions, data, "
                f"created_at, updated_at FROM user_campaigns WHERE user_id = {user_id} ORDER BY created_at DESC"
            )
            campaigns = [dict(r) for r in cur.fetchall()]

            cur.execute(
                f"SELECT client_id, name, format, products, status, source_url, data, created_at, updated_at "
                f"FROM user_feeds WHERE user_id = {user_id} ORDER BY created_at DESC"
            )
            feeds = [dict(r) for r in cur.fetchall()]

            cur.execute(f"SELECT leads, requested_services, settings FROM user_state WHERE user_id = {user_id}")
            state_row = cur.fetchone()
            state = dict(state_row) if state_row else {'leads': [], 'requested_services': [], 'settings': {}}

            return _resp(200, {'campaigns': campaigns, 'feeds': feeds, 'state': state})

        if method == 'POST' and resource == 'sync':
            campaigns = body.get('campaigns') or []
            feeds = body.get('feeds') or []
            state = body.get('state') or {}

            cur.execute(f"DELETE FROM user_campaigns WHERE user_id = {user_id}")
            for c in campaigns:
                client_id = _q(str(c.get('id', '')))
                name = _q(str(c.get('name', 'Без названия'))[:255])
                platform = _q(str(c.get('platform', ''))[:50])
                status = _q(str(c.get('status', 'draft'))[:50])
                budget = _num(c.get('budget'))
                spent = _num(c.get('spent'))
                impressions = _int(c.get('impressions'))
                clicks = _int(c.get('clicks'))
                conversions = _int(c.get('conversions'))
                data = _q(json.dumps(c, ensure_ascii=False))
                cur.execute(
                    f"INSERT INTO user_campaigns (user_id, client_id, name, platform, status, budget, spent, "
                    f"impressions, clicks, conversions, data) "
                    f"VALUES ({user_id}, {client_id}, {name}, {platform}, {status}, {budget}, {spent}, "
                    f"{impressions}, {clicks}, {conversions}, {data}::jsonb)"
                )

            cur.execute(f"DELETE FROM user_feeds WHERE user_id = {user_id}")
            for f in feeds:
                client_id = _q(str(f.get('id', '')))
                name = _q(str(f.get('name', 'Фид'))[:255])
                fmt = _q(str(f.get('format', ''))[:50])
                products = _int(f.get('products'))
                status = _q(str(f.get('status', 'active'))[:50])
                source_url = _q(str(f.get('sourceUrl', f.get('source_url', '')))[:2000])
                data = _q(json.dumps(f, ensure_ascii=False))
                cur.execute(
                    f"INSERT INTO user_feeds (user_id, client_id, name, format, products, status, source_url, data) "
                    f"VALUES ({user_id}, {client_id}, {name}, {fmt}, {products}, {status}, {source_url}, {data}::jsonb)"
                )

            leads_json = _q(json.dumps(state.get('leads') or [], ensure_ascii=False))
            req_json = _q(json.dumps(state.get('requested_services') or state.get('requestedServices') or [], ensure_ascii=False))
            settings_json = _q(json.dumps(state.get('settings') or {}, ensure_ascii=False))
            cur.execute(
                f"INSERT INTO user_state (user_id, leads, requested_services, settings, updated_at) "
                f"VALUES ({user_id}, {leads_json}::jsonb, {req_json}::jsonb, {settings_json}::jsonb, NOW()) "
                f"ON CONFLICT (user_id) DO UPDATE SET "
                f"leads = EXCLUDED.leads, requested_services = EXCLUDED.requested_services, "
                f"settings = EXCLUDED.settings, updated_at = NOW()"
            )

            return _resp(200, {'ok': True, 'campaigns': len(campaigns), 'feeds': len(feeds)})

        return _resp(400, {'error': 'Неизвестный ресурс'})

    except Exception as e:
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()
