import json
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr, formatdate
from email.header import Header
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}


def _send_email(to_email: str, subject: str, html_body: str, text_body: str = '') -> bool:
    """Отправка письма через SMTP. Возвращает True/False, не падает при ошибке."""
    host = os.environ.get('SMTP_HOST', '')
    port_str = os.environ.get('SMTP_PORT', '465')
    user = os.environ.get('SMTP_USER', '')
    password = os.environ.get('SMTP_PASSWORD', '')
    if not (host and user and password and to_email):
        print(f'[email] SMTP not configured or no recipient', flush=True)
        return False
    try:
        port = int(port_str)
    except Exception:
        port = 465
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = formataddr((str(Header('mat-ad.ru', 'utf-8')), user))
        msg['To'] = to_email
        msg['Subject'] = str(Header(subject, 'utf-8'))
        msg['Date'] = formatdate(localtime=True)
        if text_body:
            msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        ctx = ssl.create_default_context()
        if port == 465:
            with smtplib.SMTP_SSL(host, port, context=ctx, timeout=15) as s:
                s.login(user, password)
                s.sendmail(user, [a.strip() for a in to_email.split(',') if a.strip()], msg.as_string())
        else:
            with smtplib.SMTP(host, port, timeout=15) as s:
                s.starttls(context=ctx)
                s.login(user, password)
                s.sendmail(user, [a.strip() for a in to_email.split(',') if a.strip()], msg.as_string())
        return True
    except Exception as e:
        print(f'[email] send failed: {e}', flush=True)
        return False


def _notify_lead(name, phone, email, service, comment, utm):
    """Шлёт письмо менеджеру и подтверждение клиенту."""
    manager_to = os.environ.get('LEAD_NOTIFY_EMAIL', '')
    utm_block = ''
    if utm:
        rows = []
        for k in ('utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'yclid', 'gclid', 'referrer'):
            v = utm.get(k)
            if v:
                rows.append(f'<tr><td style="padding:4px 8px;color:#666;">{k}</td><td style="padding:4px 8px;font-family:monospace;">{v}</td></tr>')
        if rows:
            utm_block = '<table style="border-collapse:collapse;border:1px solid #eee;margin-top:12px;font-size:12px;"><tbody>' + ''.join(rows) + '</tbody></table>'

    # 1. Менеджеру
    if manager_to:
        html = f"""<!doctype html><html><body style="font-family:Arial,sans-serif;color:#222;background:#f7f7f9;padding:20px;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #eee;">
            <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Новая заявка с mat-ad.ru</div>
            <h2 style="margin:0 0 16px;font-size:20px;">{name}</h2>
            <table style="width:100%;font-size:14px;">
                <tr><td style="padding:6px 0;color:#666;width:120px;">Телефон</td><td style="padding:6px 0;font-weight:bold;"><a href="tel:{phone}" style="color:#0a8;text-decoration:none;">{phone or '—'}</a></td></tr>
                <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;font-weight:bold;"><a href="mailto:{email}" style="color:#0a8;text-decoration:none;">{email or '—'}</a></td></tr>
                <tr><td style="padding:6px 0;color:#666;">Услуга</td><td style="padding:6px 0;">{service or '—'}</td></tr>
                <tr><td style="padding:6px 0;color:#666;vertical-align:top;">Комментарий</td><td style="padding:6px 0;">{comment or '—'}</td></tr>
            </table>
            {utm_block}
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999;">
                Свяжитесь с клиентом в течение 30 минут — конверсия в сделку выше в 7 раз при быстром отклике.
            </div>
        </div></body></html>"""
        text = f"Новая заявка: {name}\nТелефон: {phone or '—'}\nEmail: {email or '—'}\nУслуга: {service or '—'}\nКомментарий: {comment or '—'}"
        _send_email(manager_to, f'Новая заявка: {name} ({service or "услуга"})', html, text)

    # 2. Клиенту — подтверждение
    if email:
        html = f"""<!doctype html><html><body style="font-family:Arial,sans-serif;color:#222;background:#f7f7f9;padding:20px;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #eee;">
            <h2 style="margin:0 0 12px;font-size:22px;">Спасибо за заявку, {name}!</h2>
            <p style="font-size:14px;line-height:1.5;color:#444;">
                Мы получили вашу заявку{f' по услуге «{service}»' if service else ''} и свяжемся в течение <b>30 минут</b> в рабочее время.
            </p>
            <p style="font-size:14px;line-height:1.5;color:#444;">
                Если у вас срочный вопрос — напишите нам в Telegram: <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" style="color:#0a8;">@matad_community</a>
            </p>
            <div style="margin-top:24px;padding:16px;background:#f4faff;border-radius:8px;font-size:13px;color:#555;">
                <b>Что дальше:</b><br>
                1. Менеджер свяжется по {phone or email}<br>
                2. Уточним задачу и подберём решение<br>
                3. Пришлём предложение по почте
            </div>
            <div style="margin-top:24px;font-size:12px;color:#999;">
                — Команда mat-ad.ru<br>
                Максимально автоматизированные технологии рекламы
            </div>
        </div></body></html>"""
        text = f"Спасибо за заявку, {name}! Мы свяжемся в течение 30 минут.\n— mat-ad.ru"
        _send_email(email, f'Заявка получена — mat-ad.ru', html, text)


def _resp(status, body):
    return {
        'statusCode': status,
        'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps(body, default=str),
    }


def _admin_by_token(cur, token: str):
    if not token:
        return None
    safe = token.replace("'", "''")
    cur.execute(
        f"SELECT u.id, u.email, u.name, u.is_admin, u.role "
        f"FROM users u JOIN sessions s ON s.user_id = u.id "
        f"WHERE s.token = '{safe}' AND s.expires_at > NOW() LIMIT 1"
    )
    row = cur.fetchone()
    if not row:
        return None
    if not (row.get('is_admin') or row.get('role') == 'admin'):
        return None
    return row


def _log_event(cur, admin_id, event_type, target_type='', target_id='', description=''):
    et = event_type.replace("'", "''")[:64]
    tt = (target_type or '').replace("'", "''")[:64]
    ti = (str(target_id or '')).replace("'", "''")[:100]
    desc = (description or '').replace("'", "''")[:1000]
    cur.execute(
        f"INSERT INTO admin_events (admin_id, event_type, target_type, target_id, description) "
        f"VALUES ({admin_id}, '{et}', '{tt}', '{ti}', '{desc}')"
    )


def get_overview(cur):
    now = datetime.now()
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    stats = {}

    cur.execute("SELECT COUNT(*) AS c FROM users")
    stats['users_total'] = cur.fetchone()['c']

    cur.execute(f"SELECT COUNT(*) AS c FROM users WHERE created_at >= '{today.isoformat()}'")
    stats['users_today'] = cur.fetchone()['c']

    cur.execute(f"SELECT COUNT(*) AS c FROM users WHERE created_at >= '{week_ago.isoformat()}'")
    stats['users_week'] = cur.fetchone()['c']

    cur.execute(f"SELECT COUNT(*) AS c FROM users WHERE created_at >= '{month_ago.isoformat()}'")
    stats['users_month'] = cur.fetchone()['c']

    cur.execute("SELECT COUNT(*) AS c, COALESCE(SUM(amount), 0) AS sum FROM orders WHERE status = 'paid'")
    row = cur.fetchone()
    stats['orders_paid_total'] = row['c']
    stats['revenue_total'] = float(row['sum'] or 0)

    cur.execute(f"SELECT COUNT(*) AS c, COALESCE(SUM(amount), 0) AS sum FROM orders WHERE status = 'paid' AND paid_at >= '{today.isoformat()}'")
    row = cur.fetchone()
    stats['orders_today'] = row['c']
    stats['revenue_today'] = float(row['sum'] or 0)

    cur.execute(f"SELECT COUNT(*) AS c, COALESCE(SUM(amount), 0) AS sum FROM orders WHERE status = 'paid' AND paid_at >= '{week_ago.isoformat()}'")
    row = cur.fetchone()
    stats['orders_week'] = row['c']
    stats['revenue_week'] = float(row['sum'] or 0)

    cur.execute(f"SELECT COUNT(*) AS c, COALESCE(SUM(amount), 0) AS sum FROM orders WHERE status = 'paid' AND paid_at >= '{month_ago.isoformat()}'")
    row = cur.fetchone()
    stats['orders_month'] = row['c']
    stats['revenue_month'] = float(row['sum'] or 0)

    cur.execute("SELECT COUNT(*) AS c FROM orders WHERE status = 'pending'")
    stats['orders_pending'] = cur.fetchone()['c']

    cur.execute("SELECT COUNT(*) AS c FROM leads")
    stats['leads_total'] = cur.fetchone()['c']

    cur.execute("SELECT COUNT(*) AS c FROM leads WHERE status = 'new'")
    stats['leads_new'] = cur.fetchone()['c']

    cur.execute(f"SELECT COUNT(*) AS c FROM leads WHERE created_at >= '{week_ago.isoformat()}'")
    stats['leads_week'] = cur.fetchone()['c']

    cur.execute(f"""
        SELECT DATE(paid_at) AS day, COALESCE(SUM(amount), 0) AS sum, COUNT(*) AS c
        FROM orders
        WHERE status = 'paid' AND paid_at >= '{(today - timedelta(days=29)).isoformat()}'
        GROUP BY DATE(paid_at) ORDER BY day ASC
    """)
    revenue_chart = [
        {'day': str(r['day']), 'revenue': float(r['sum'] or 0), 'count': r['c']}
        for r in cur.fetchall()
    ]

    cur.execute(f"""
        SELECT DATE(created_at) AS day, COUNT(*) AS c
        FROM users
        WHERE created_at >= '{(today - timedelta(days=29)).isoformat()}'
        GROUP BY DATE(created_at) ORDER BY day ASC
    """)
    users_chart = [{'day': str(r['day']), 'count': r['c']} for r in cur.fetchall()]

    paid_count = stats['orders_paid_total']
    if stats['users_total'] > 0:
        stats['conversion_rate'] = round(paid_count * 100.0 / stats['users_total'], 1)
    else:
        stats['conversion_rate'] = 0
    if paid_count > 0:
        stats['avg_check'] = round(stats['revenue_total'] / paid_count, 2)
    else:
        stats['avg_check'] = 0

    cur.execute("""
        SELECT product_name, COUNT(*) AS c, COALESCE(SUM(product_price * quantity), 0) AS sum
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status = 'paid'
        GROUP BY product_name ORDER BY sum DESC LIMIT 5
    """)
    top_products = [
        {'name': r['product_name'] or '—', 'count': r['c'], 'revenue': float(r['sum'] or 0)}
        for r in cur.fetchall()
    ]

    return {
        'stats': stats,
        'revenue_chart': revenue_chart,
        'users_chart': users_chart,
        'top_products': top_products,
    }


def get_clients(cur, params):
    search = (params.get('search') or '').strip().replace("'", "''")[:100]
    stage = (params.get('stage') or '').replace("'", "''")[:32]
    limit = min(int(params.get('limit') or 50), 200)

    where = []
    if search:
        where.append(f"(LOWER(u.email) LIKE LOWER('%{search}%') OR LOWER(u.name) LIKE LOWER('%{search}%') OR u.phone LIKE '%{search}%')")
    if stage:
        where.append(f"u.lifecycle_stage = '{stage}'")
    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''

    cur.execute(f"""
        SELECT u.id, u.email, u.name, u.phone, u.created_at, u.last_login_at,
               u.is_admin, u.role, u.plan, u.tags, u.lifecycle_stage,
               (SELECT COUNT(*) FROM orders o WHERE o.user_email = u.email AND o.status = 'paid') AS paid_count,
               (SELECT COALESCE(SUM(amount),0) FROM orders o WHERE o.user_email = u.email AND o.status = 'paid') AS total_spent
        FROM users u
        {where_sql}
        ORDER BY u.created_at DESC
        LIMIT {limit}
    """)
    rows = cur.fetchall()
    clients = []
    for r in rows:
        d = dict(r)
        d['total_spent'] = float(d['total_spent'] or 0)
        clients.append(d)
    return {'clients': clients}


def get_client_details(cur, user_id):
    safe = str(int(user_id))
    cur.execute(f"""
        SELECT id, email, name, phone, avatar_url, created_at, last_login_at,
               is_admin, role, plan, notes, tags, lifecycle_stage
        FROM users WHERE id = {safe} LIMIT 1
    """)
    user = cur.fetchone()
    if not user:
        return None

    cur.execute(f"""
        SELECT id, order_number, amount, status, created_at, paid_at, payment_url
        FROM orders WHERE user_email = '{user['email'].replace(chr(39), chr(39)+chr(39))}'
        ORDER BY created_at DESC LIMIT 50
    """)
    orders = []
    for r in cur.fetchall():
        d = dict(r)
        d['amount'] = float(d['amount'] or 0)
        orders.append(d)

    cur.execute(f"""
        SELECT id, source, service, status, comment, created_at, pipeline_stage, amount
        FROM leads WHERE LOWER(email) = LOWER('{user['email'].replace(chr(39), chr(39)+chr(39))}')
        ORDER BY created_at DESC LIMIT 20
    """)
    leads = []
    for r in cur.fetchall():
        d = dict(r)
        d['amount'] = float(d['amount'] or 0)
        leads.append(d)

    return {'user': dict(user), 'orders': orders, 'leads': leads}


def update_client(cur, admin_id, body):
    user_id = int(body.get('id') or 0)
    if not user_id:
        return {'error': 'id required'}
    fields = []
    if 'notes' in body:
        v = (body.get('notes') or '').replace("'", "''")[:5000]
        fields.append(f"notes = '{v}'")
    if 'tags' in body:
        v = (body.get('tags') or '').replace("'", "''")[:500]
        fields.append(f"tags = '{v}'")
    if 'lifecycle_stage' in body:
        v = (body.get('lifecycle_stage') or '').replace("'", "''")[:32]
        fields.append(f"lifecycle_stage = '{v}'")
    if 'plan' in body:
        v = (body.get('plan') or '').replace("'", "''")[:32]
        fields.append(f"plan = '{v}'")
    if not fields:
        return {'error': 'no fields'}
    cur.execute(f"UPDATE users SET {', '.join(fields)} WHERE id = {user_id}")
    _log_event(cur, admin_id, 'client_updated', 'user', user_id, ', '.join(fields))
    return {'ok': True}


def get_orders(cur, params):
    status = (params.get('status') or '').replace("'", "''")[:32]
    search = (params.get('search') or '').replace("'", "''")[:100]
    limit = min(int(params.get('limit') or 100), 500)
    where = []
    if status:
        where.append(f"status = '{status}'")
    if search:
        where.append(f"(LOWER(user_email) LIKE LOWER('%{search}%') OR order_number LIKE '%{search}%')")
    where_sql = ('WHERE ' + ' AND '.join(where)) if where else ''
    cur.execute(f"""
        SELECT id, order_number, user_email, user_name, user_phone, amount, status,
               yookassa_payment_id, payment_url, created_at, paid_at,
               utm_source, utm_medium, utm_campaign, utm_term, utm_content,
               yclid, gclid, fbclid, referrer, landing
        FROM orders {where_sql}
        ORDER BY created_at DESC LIMIT {limit}
    """)
    orders = []
    for r in cur.fetchall():
        d = dict(r)
        d['amount'] = float(d['amount'] or 0)
        orders.append(d)
    return {'orders': orders}


def submit_lead(cur, body):
    """Публичный приём лидов с лендинга (с UTM)."""
    name = (body.get('name') or '').strip().replace("'", "''")[:255]
    if not name:
        return {'error': 'name required'}
    phone = (body.get('phone') or '').strip().replace("'", "''")[:64]
    email = (body.get('email') or '').strip().lower().replace("'", "''")[:255]
    if not phone and not email:
        return {'error': 'phone or email required'}
    service = (body.get('service') or '').replace("'", "''")[:255]
    comment = (body.get('comment') or '').replace("'", "''")[:5000]
    source = (body.get('source') or 'website').replace("'", "''")[:64]
    utm = body.get('utm') or {}
    def _u(key, max_len=255):
        return str(utm.get(key) or '').replace("'", "''")[:max_len]
    cur.execute(f"""
        INSERT INTO leads
        (source, service, name, phone, email, comment,
         utm_source, utm_medium, utm_campaign, utm_term, utm_content,
         yclid, gclid, fbclid, referrer, landing)
        VALUES ('{source}', '{service}', '{name}', '{phone}', '{email}', '{comment}',
                '{_u('utm_source')}', '{_u('utm_medium')}', '{_u('utm_campaign')}',
                '{_u('utm_term')}', '{_u('utm_content')}',
                '{_u('yclid')}', '{_u('gclid')}', '{_u('fbclid')}',
                '{_u('referrer', 1000)}', '{_u('landing', 1000)}')
        RETURNING id
    """)
    new_id = cur.fetchone()['id']

    # Email-уведомление (не падает если SMTP не настроен)
    try:
        _notify_lead(
            name=body.get('name') or '',
            phone=body.get('phone') or '',
            email=body.get('email') or '',
            service=body.get('service') or '',
            comment=body.get('comment') or '',
            utm=body.get('utm') or {},
        )
    except Exception as e:
        print(f'[submit_lead] notify failed: {e}', flush=True)

    return {'ok': True, 'id': new_id}


def get_leads(cur, params):
    stage = (params.get('stage') or '').replace("'", "''")[:32]
    where_sql = f"WHERE pipeline_stage = '{stage}'" if stage else ''
    cur.execute(f"""
        SELECT id, source, service, name, email, phone, comment, status, pipeline_stage,
               amount, notes, created_at, updated_at,
               utm_source, utm_medium, utm_campaign, utm_term, utm_content,
               yclid, gclid, fbclid, referrer, landing
        FROM leads {where_sql}
        ORDER BY created_at DESC LIMIT 200
    """)
    leads = []
    for r in cur.fetchall():
        d = dict(r)
        d['amount'] = float(d['amount'] or 0)
        leads.append(d)
    return {'leads': leads}


def update_lead(cur, admin_id, body):
    lead_id = int(body.get('id') or 0)
    if not lead_id:
        return {'error': 'id required'}
    fields = []
    if 'pipeline_stage' in body:
        v = (body.get('pipeline_stage') or '').replace("'", "''")[:32]
        fields.append(f"pipeline_stage = '{v}'")
    if 'status' in body:
        v = (body.get('status') or '').replace("'", "''")[:32]
        fields.append(f"status = '{v}'")
    if 'notes' in body:
        v = (body.get('notes') or '').replace("'", "''")[:5000]
        fields.append(f"notes = '{v}'")
    if 'amount' in body:
        try:
            v = float(body.get('amount') or 0)
            fields.append(f"amount = {v}")
        except Exception:
            pass
    if not fields:
        return {'error': 'no fields'}
    fields.append("updated_at = NOW()")
    cur.execute(f"UPDATE leads SET {', '.join(fields)} WHERE id = {lead_id}")
    _log_event(cur, admin_id, 'lead_updated', 'lead', lead_id, ', '.join(fields))
    return {'ok': True}


def get_tasks(cur, admin_id):
    cur.execute(f"""
        SELECT t.id, t.title, t.description, t.due_at, t.completed_at, t.priority,
               t.related_user_id, t.related_lead_id, t.created_at,
               u.name AS related_user_name, u.email AS related_user_email
        FROM admin_tasks t
        LEFT JOIN users u ON u.id = t.related_user_id
        WHERE t.admin_id = {admin_id}
        ORDER BY t.completed_at NULLS FIRST, t.due_at ASC NULLS LAST, t.created_at DESC
        LIMIT 100
    """)
    return {'tasks': [dict(r) for r in cur.fetchall()]}


def create_task(cur, admin_id, body):
    title = (body.get('title') or '').replace("'", "''")[:255]
    if not title:
        return {'error': 'title required'}
    description = (body.get('description') or '').replace("'", "''")[:2000]
    priority = (body.get('priority') or 'normal').replace("'", "''")[:16]
    due_at = (body.get('due_at') or '').replace("'", "''")[:30]
    related_user_id = int(body.get('related_user_id') or 0) or 'NULL'
    related_lead_id = int(body.get('related_lead_id') or 0) or 'NULL'
    due_sql = f"'{due_at}'" if due_at else 'NULL'
    cur.execute(f"""
        INSERT INTO admin_tasks (admin_id, title, description, priority, due_at, related_user_id, related_lead_id)
        VALUES ({admin_id}, '{title}', '{description}', '{priority}', {due_sql}, {related_user_id}, {related_lead_id})
        RETURNING id
    """)
    new_id = cur.fetchone()['id']
    _log_event(cur, admin_id, 'task_created', 'task', new_id, title)
    return {'ok': True, 'id': new_id}


def complete_task(cur, admin_id, body):
    task_id = int(body.get('id') or 0)
    if not task_id:
        return {'error': 'id required'}
    completed = bool(body.get('completed', True))
    if completed:
        cur.execute(f"UPDATE admin_tasks SET completed_at = NOW() WHERE id = {task_id} AND admin_id = {admin_id}")
    else:
        cur.execute(f"UPDATE admin_tasks SET completed_at = NULL WHERE id = {task_id} AND admin_id = {admin_id}")
    return {'ok': True}


def get_events(cur, admin_id):
    cur.execute(f"""
        SELECT e.id, e.event_type, e.target_type, e.target_id, e.description, e.created_at,
               u.email AS admin_email, u.name AS admin_name
        FROM admin_events e
        LEFT JOIN users u ON u.id = e.admin_id
        ORDER BY e.created_at DESC LIMIT 100
    """)
    return {'events': [dict(r) for r in cur.fetchall()]}


def get_ai_insights(cur):
    insights = []

    cur.execute("""
        SELECT u.id, u.email, u.name, u.created_at,
               (SELECT COUNT(*) FROM orders o WHERE o.user_email = u.email AND o.status = 'paid') AS paid_cnt
        FROM users u
        WHERE u.created_at >= NOW() - INTERVAL '7 days'
          AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_email = u.email AND o.status = 'paid')
        ORDER BY u.created_at DESC LIMIT 10
    """)
    cold = [dict(r) for r in cur.fetchall()]
    if cold:
        insights.append({
            'type': 'cold_users',
            'priority': 'high',
            'title': f'{len(cold)} новых пользователей без оплаты',
            'description': 'Эти клиенты зарегистрировались за неделю, но ещё не оплачивали — самое время написать им персональное предложение',
            'items': cold,
        })

    cur.execute("""
        SELECT id, order_number, user_email, amount, created_at
        FROM orders WHERE status = 'pending'
          AND created_at >= NOW() - INTERVAL '24 hours'
          AND created_at <= NOW() - INTERVAL '30 minutes'
        ORDER BY created_at DESC LIMIT 10
    """)
    abandoned = [dict(r) for r in cur.fetchall()]
    for a in abandoned:
        a['amount'] = float(a['amount'] or 0)
    if abandoned:
        insights.append({
            'type': 'abandoned_carts',
            'priority': 'high',
            'title': f'{len(abandoned)} брошенных оплат',
            'description': 'Клиенты создали счёт, но не завершили оплату. Напомни им — конверсия после реактивации до 30%',
            'items': abandoned,
        })

    cur.execute("""
        SELECT u.id, u.email, u.name, COUNT(o.id) AS orders_cnt, COALESCE(SUM(o.amount), 0) AS total
        FROM users u
        JOIN orders o ON o.user_email = u.email AND o.status = 'paid'
        GROUP BY u.id, u.email, u.name
        HAVING COUNT(o.id) >= 2
        ORDER BY total DESC LIMIT 10
    """)
    vip = []
    for r in cur.fetchall():
        d = dict(r)
        d['total'] = float(d['total'] or 0)
        vip.append(d)
    if vip:
        insights.append({
            'type': 'vip_clients',
            'priority': 'normal',
            'title': f'{len(vip)} VIP-клиентов с повторными оплатами',
            'description': 'Самые лояльные клиенты — предложи им расширенный тариф или партнёрскую программу',
            'items': vip,
        })

    cur.execute("""
        SELECT id, name, email, phone, service, created_at
        FROM leads WHERE status = 'new' AND created_at >= NOW() - INTERVAL '3 days'
        ORDER BY created_at DESC LIMIT 10
    """)
    hot_leads = [dict(r) for r in cur.fetchall()]
    if hot_leads:
        insights.append({
            'type': 'hot_leads',
            'priority': 'high',
            'title': f'{len(hot_leads)} горячих лидов ждут связи',
            'description': 'Заявки за последние 3 дня без обработки. Перезвони в первую очередь — скорость ответа повышает конверсию в 2 раза',
            'items': hot_leads,
        })

    return {'insights': insights}


def handler(event, context):
    """Админ-кабинет: статистика, клиенты, заказы, лиды, задачи, ИИ-инсайты"""
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
        # Публичный эндпоинт приёма лидов (без токена) — нужен для лендинга
        if method == 'POST' and action == 'submit_lead':
            return _resp(200, submit_lead(cur, body))

        admin = _admin_by_token(cur, token)
        if not admin:
            return _resp(403, {'error': 'Доступ только для администраторов'})

        if method == 'GET' and action == 'overview':
            return _resp(200, get_overview(cur))

        if method == 'GET' and action == 'clients':
            return _resp(200, get_clients(cur, params))

        if method == 'GET' and action == 'client':
            uid = params.get('id') or 0
            data = get_client_details(cur, uid)
            if not data:
                return _resp(404, {'error': 'Клиент не найден'})
            return _resp(200, data)

        if method == 'POST' and action == 'update_client':
            return _resp(200, update_client(cur, admin['id'], body))

        if method == 'GET' and action == 'orders':
            return _resp(200, get_orders(cur, params))

        if method == 'GET' and action == 'leads':
            return _resp(200, get_leads(cur, params))

        if method == 'POST' and action == 'update_lead':
            return _resp(200, update_lead(cur, admin['id'], body))

        if method == 'GET' and action == 'tasks':
            return _resp(200, get_tasks(cur, admin['id']))

        if method == 'POST' and action == 'create_task':
            return _resp(200, create_task(cur, admin['id'], body))

        if method == 'POST' and action == 'complete_task':
            return _resp(200, complete_task(cur, admin['id'], body))

        if method == 'GET' and action == 'events':
            return _resp(200, get_events(cur, admin['id']))

        if method == 'GET' and action == 'ai_insights':
            return _resp(200, get_ai_insights(cur))

        return _resp(400, {'error': 'Неизвестное действие'})

    except Exception as e:
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()