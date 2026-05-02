"""Расписание событий по кампаниям: запуск, пауза, отчёт."""
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

ALLOWED_ACTIONS = {'launch', 'pause', 'report', 'custom'}


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


def _list_events(cur, user_id, params):
    fr = (params.get('from') or '').replace("'", "''")[:32]
    to = (params.get('to') or '').replace("'", "''")[:32]
    where = [f"user_id = {int(user_id)}"]
    if fr:
        where.append(f"event_date >= '{fr}'")
    if to:
        where.append(f"event_date <= '{to}'")
    cur.execute(f"""
        SELECT e.id, e.user_id, e.campaign_id, e.event_date, e.event_time,
               e.action, e.title, e.notes, e.done, e.created_at, e.updated_at,
               c.name AS campaign_name, c.campaign_type
        FROM schedule_events e
        LEFT JOIN yd_campaigns c ON c.id = e.campaign_id
        WHERE {' AND '.join(where)}
        ORDER BY e.event_date ASC, e.event_time ASC
        LIMIT 1000
    """)
    out = []
    for r in cur.fetchall():
        d = dict(r)
        out.append(d)
    return {'events': out}


def _create_event(cur, user_id, body):
    campaign_id = body.get('campaign_id')
    if campaign_id:
        try:
            campaign_id = int(campaign_id)
        except Exception:
            campaign_id = None
    event_date = (body.get('event_date') or '').strip().replace("'", "''")[:32]
    event_time = (body.get('event_time') or '12:00').strip().replace("'", "''")[:16]
    action = (body.get('action') or 'launch').strip()
    if action not in ALLOWED_ACTIONS:
        return {'error': 'Неизвестное действие'}
    if not event_date:
        return {'error': 'Дата обязательна'}
    safe_action = action.replace("'", "''")
    title = (body.get('title') or '').replace("'", "''")[:255]
    notes = (body.get('notes') or '').replace("'", "''")[:5000]
    cid_sql = str(int(campaign_id)) if campaign_id else 'NULL'
    cur.execute(f"""
        INSERT INTO schedule_events
        (user_id, campaign_id, event_date, event_time, action, title, notes)
        VALUES ({int(user_id)}, {cid_sql}, '{event_date}', '{event_time}', '{safe_action}', '{title}', '{notes}')
        RETURNING id
    """)
    new_id = cur.fetchone()['id']
    return {'ok': True, 'id': new_id}


def _update_event(cur, user_id, body):
    eid = int(body.get('id') or 0)
    if not eid:
        return {'error': 'id required'}
    cur.execute(f"SELECT id FROM schedule_events WHERE id = {eid} AND user_id = {int(user_id)} LIMIT 1")
    if not cur.fetchone():
        return {'error': 'not found'}
    fields = []
    if 'campaign_id' in body:
        cid = body.get('campaign_id')
        if cid:
            fields.append(f"campaign_id = {int(cid)}")
        else:
            fields.append("campaign_id = NULL")
    if 'event_date' in body:
        v = (body.get('event_date') or '').replace("'", "''")[:32]
        if v:
            fields.append(f"event_date = '{v}'")
    if 'event_time' in body:
        v = (body.get('event_time') or '').replace("'", "''")[:16]
        if v:
            fields.append(f"event_time = '{v}'")
    if 'action' in body:
        v = (body.get('action') or 'launch').strip()
        if v in ALLOWED_ACTIONS:
            fields.append(f"action = '{v}'")
    if 'title' in body:
        v = (body.get('title') or '').replace("'", "''")[:255]
        fields.append(f"title = '{v}'")
    if 'notes' in body:
        v = (body.get('notes') or '').replace("'", "''")[:5000]
        fields.append(f"notes = '{v}'")
    if 'done' in body:
        fields.append(f"done = {'TRUE' if body.get('done') else 'FALSE'}")
    if not fields:
        return {'error': 'no fields'}
    fields.append("updated_at = NOW()")
    cur.execute(f"UPDATE schedule_events SET {', '.join(fields)} WHERE id = {eid}")
    return {'ok': True}


def _delete_event(cur, user_id, body):
    eid = int(body.get('id') or 0)
    if not eid:
        return {'error': 'id required'}
    cur.execute(f"DELETE FROM schedule_events WHERE id = {eid} AND user_id = {int(user_id)}")
    return {'ok': True}


def handler(event, context):
    """Расписание событий по кампаниям"""
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

        if method == 'GET' and action == 'list':
            return _resp(200, _list_events(cur, uid, params))
        if method == 'POST' and action == 'create':
            return _resp(200, _create_event(cur, uid, body))
        if method == 'POST' and action == 'update':
            return _resp(200, _update_event(cur, uid, body))
        if method == 'POST' and action == 'delete':
            return _resp(200, _delete_event(cur, uid, body))

        return _resp(400, {'error': 'Неизвестное действие'})
    except Exception as e:
        import traceback, sys
        print(f"[SCHEDULE ERROR] {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()
