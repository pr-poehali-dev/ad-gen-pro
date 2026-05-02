import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
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


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}${digest}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split('$', 1)
    except ValueError:
        return False
    check = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return secrets.compare_digest(check, digest)


def _create_session(cur, user_id: int, ua: str, ip: str) -> str:
    token = secrets.token_urlsafe(48)
    expires = datetime.now(timezone.utc) + timedelta(days=30)
    safe_ua = ua.replace("'", "''")[:500]
    safe_ip = ip[:64].replace("'", "''")
    cur.execute(
        f"INSERT INTO sessions (user_id, token, user_agent, ip, expires_at) "
        f"VALUES ({user_id}, '{token}', '{safe_ua}', '{safe_ip}', '{expires.isoformat()}')"
    )
    return token


def _user_by_token(cur, token: str):
    safe = token.replace("'", "''")
    cur.execute(
        f"SELECT u.id, u.email, u.name, u.company, u.role, u.plan, u.is_admin "
        f"FROM users u JOIN sessions s ON s.user_id = u.id "
        f"WHERE s.token = '{safe}' AND s.expires_at > NOW() LIMIT 1"
    )
    return cur.fetchone()


def handler(event, context):
    """Авторизация: регистрация, вход, выход, проверка сессии"""
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

    ip = (event.get('requestContext', {}) or {}).get('identity', {}).get('sourceIp', '')
    ua = headers_lower.get('user-agent', '')[:500]

    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return _resp(500, {'error': 'DATABASE_URL is not configured'})

    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'POST' and action == 'register':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            name = (body.get('name') or '').strip()
            company = (body.get('company') or '').strip()

            if not email or '@' not in email:
                return _resp(400, {'error': 'Некорректный email'})
            if len(password) < 6:
                return _resp(400, {'error': 'Пароль должен быть не менее 6 символов'})

            safe_email = email.replace("'", "''")
            cur.execute(f"SELECT id FROM users WHERE email = '{safe_email}' LIMIT 1")
            if cur.fetchone():
                return _resp(409, {'error': 'Пользователь с таким email уже существует'})

            pwd_hash = _hash_password(password)
            safe_name = name.replace("'", "''")[:255]
            safe_company = company.replace("'", "''")[:255]

            # Первый зарегистрированный пользователь автоматически становится админом
            cur.execute("SELECT COUNT(*) AS c FROM users")
            is_first_user = (cur.fetchone()['c'] or 0) == 0
            role_val = 'admin' if is_first_user else 'user'
            is_admin_val = 'TRUE' if is_first_user else 'FALSE'

            cur.execute(
                f"INSERT INTO users (email, password_hash, name, company, role, is_admin) "
                f"VALUES ('{safe_email}', '{pwd_hash}', '{safe_name}', '{safe_company}', '{role_val}', {is_admin_val}) "
                f"RETURNING id, email, name, company, role, plan, is_admin"
            )
            user = cur.fetchone()
            cur.execute(f"INSERT INTO user_state (user_id) VALUES ({user['id']}) ON CONFLICT (user_id) DO NOTHING")
            new_token = _create_session(cur, user['id'], ua, ip)
            return _resp(200, {'user': dict(user), 'token': new_token})

        if method == 'POST' and action == 'login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            if not email or not password:
                return _resp(400, {'error': 'Введите email и пароль'})

            safe_email = email.replace("'", "''")
            cur.execute(
                f"SELECT id, email, password_hash, name, company, role, plan, is_admin "
                f"FROM users WHERE email = '{safe_email}' LIMIT 1"
            )
            row = cur.fetchone()
            if not row or not _verify_password(password, row['password_hash']):
                return _resp(401, {'error': 'Неверный email или пароль'})

            new_token = _create_session(cur, row['id'], ua, ip)
            user_data = {k: row[k] for k in ('id', 'email', 'name', 'company', 'role', 'plan', 'is_admin')}
            return _resp(200, {'user': user_data, 'token': new_token})

        if method == 'GET' and action == 'me':
            if not token:
                return _resp(401, {'error': 'Не авторизован'})
            user = _user_by_token(cur, token)
            if not user:
                return _resp(401, {'error': 'Сессия истекла'})
            return _resp(200, {'user': dict(user)})

        if method == 'POST' and action == 'logout':
            if token:
                safe = token.replace("'", "''")
                cur.execute(f"UPDATE sessions SET expires_at = NOW() WHERE token = '{safe}'")
            return _resp(200, {'ok': True})

        return _resp(400, {'error': 'Неизвестное действие'})

    except Exception as e:
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()