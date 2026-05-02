"""Дашборд: агрегированные данные о кампаниях, фидах, событиях, автоматизациях
для одной страницы обзора."""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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


def _get_overview(cur, user_id):
    """Сводный отчёт для главного дашборда."""
    uid = int(user_id)
    out = {}

    # ===== Кампании =====
    cur.execute(f"""
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'draft') AS draft,
            COUNT(*) FILTER (WHERE status = 'ready') AS ready,
            COUNT(*) FILTER (WHERE status = 'exported') AS exported,
            COUNT(*) FILTER (WHERE status = 'sent') AS sent,
            COUNT(*) FILTER (WHERE campaign_type = 'text') AS type_text,
            COUNT(*) FILTER (WHERE campaign_type = 'network') AS type_network,
            COUNT(*) FILTER (WHERE campaign_type = 'master') AS type_master,
            COALESCE(SUM(daily_budget), 0) AS total_daily_budget,
            COALESCE(SUM(weekly_budget), 0) AS total_weekly_budget
        FROM yd_campaigns WHERE user_id = {uid}
    """)
    row = cur.fetchone() or {}
    out['campaigns'] = {
        'total': int(row.get('total') or 0),
        'by_status': {
            'draft': int(row.get('draft') or 0),
            'ready': int(row.get('ready') or 0),
            'exported': int(row.get('exported') or 0),
            'sent': int(row.get('sent') or 0),
        },
        'by_type': {
            'text': int(row.get('type_text') or 0),
            'network': int(row.get('type_network') or 0),
            'master': int(row.get('type_master') or 0),
        },
        'total_daily_budget': float(row.get('total_daily_budget') or 0),
        'total_weekly_budget': float(row.get('total_weekly_budget') or 0),
    }

    # ===== Группы / Объявления / Фразы =====
    cur.execute(f"""
        SELECT
            (SELECT COUNT(*) FROM yd_ad_groups g WHERE g.campaign_id IN
                (SELECT id FROM yd_campaigns WHERE user_id = {uid})) AS groups_count,
            (SELECT COUNT(*) FROM yd_ads a WHERE a.group_id IN
                (SELECT g.id FROM yd_ad_groups g WHERE g.campaign_id IN
                    (SELECT id FROM yd_campaigns WHERE user_id = {uid}))) AS ads_count,
            (SELECT COUNT(*) FROM yd_keywords k WHERE k.group_id IN
                (SELECT g.id FROM yd_ad_groups g WHERE g.campaign_id IN
                    (SELECT id FROM yd_campaigns WHERE user_id = {uid}))) AS keywords_count
    """)
    counts = cur.fetchone() or {}
    out['structure'] = {
        'groups': int(counts.get('groups_count') or 0),
        'ads': int(counts.get('ads_count') or 0),
        'keywords': int(counts.get('keywords_count') or 0),
    }

    # ===== Фиды =====
    cur.execute(f"""
        SELECT COUNT(*) AS cnt, COALESCE(SUM(products), 0) AS total_products
        FROM feeds WHERE user_id = {uid}
    """)
    row = cur.fetchone() or {}
    out['feeds'] = {
        'count': int(row.get('cnt') or 0),
        'products': int(row.get('total_products') or 0),
    }

    # ===== Расписание =====
    cur.execute(f"""
        SELECT
            COUNT(*) FILTER (WHERE event_date >= CURRENT_DATE AND NOT done) AS upcoming,
            COUNT(*) FILTER (WHERE event_date < CURRENT_DATE AND NOT done) AS overdue,
            COUNT(*) FILTER (WHERE done) AS done_count
        FROM schedule_events WHERE user_id = {uid}
    """)
    row = cur.fetchone() or {}
    out['schedule'] = {
        'upcoming': int(row.get('upcoming') or 0),
        'overdue': int(row.get('overdue') or 0),
        'done': int(row.get('done_count') or 0),
    }

    # Ближайшие 5 событий
    cur.execute(f"""
        SELECT e.id, e.event_date, e.event_time, e.action, e.title,
               c.name AS campaign_name
        FROM schedule_events e
        LEFT JOIN yd_campaigns c ON c.id = e.campaign_id
        WHERE e.user_id = {uid} AND e.event_date >= CURRENT_DATE AND NOT e.done
        ORDER BY e.event_date ASC, e.event_time ASC
        LIMIT 5
    """)
    out['next_events'] = [dict(r) for r in cur.fetchall()]

    # ===== Автоматизации =====
    cur.execute(f"""
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE enabled) AS enabled,
            COALESCE(SUM(runs_count), 0) AS runs,
            COALESCE(SUM(triggers_count), 0) AS triggers
        FROM automation_rules WHERE user_id = {uid}
    """)
    row = cur.fetchone() or {}
    out['automations'] = {
        'total': int(row.get('total') or 0),
        'enabled': int(row.get('enabled') or 0),
        'total_runs': int(row.get('runs') or 0),
        'total_triggers': int(row.get('triggers') or 0),
    }

    # Последние 5 срабатываний
    cur.execute(f"""
        SELECT r.id, r.triggered, r.target_label, r.metric_value,
               r.action_taken, r.created_at,
               ar.name AS rule_name, ar.metric, ar.action_type
        FROM automation_runs r
        JOIN automation_rules ar ON ar.id = r.rule_id
        WHERE r.user_id = {uid}
        ORDER BY r.created_at DESC
        LIMIT 8
    """)
    runs = []
    for r in cur.fetchall():
        d = dict(r)
        d['metric_value'] = float(d.get('metric_value') or 0)
        runs.append(d)
    out['recent_runs'] = runs

    # ===== Лиды (если есть) =====
    cur.execute(f"""
        SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS last_week,
            COUNT(*) FILTER (WHERE pipeline_stage = 'new') AS new_count,
            COUNT(*) FILTER (WHERE pipeline_stage = 'won') AS won_count,
            COALESCE(SUM(amount) FILTER (WHERE pipeline_stage = 'won'), 0) AS won_amount
        FROM leads
        WHERE LOWER(email) = (SELECT LOWER(email) FROM users WHERE id = {uid})
    """)
    row = cur.fetchone() or {}
    out['leads'] = {
        'total': int(row.get('total') or 0),
        'last_week': int(row.get('last_week') or 0),
        'new': int(row.get('new_count') or 0),
        'won': int(row.get('won_count') or 0),
        'won_amount': float(row.get('won_amount') or 0),
    }

    # ===== Активность по дням за 14 дней =====
    cur.execute(f"""
        SELECT DATE(updated_at) AS day, COUNT(*) AS cnt
        FROM yd_campaigns
        WHERE user_id = {uid} AND updated_at >= NOW() - INTERVAL '14 days'
        GROUP BY DATE(updated_at)
        ORDER BY day ASC
    """)
    out['activity'] = [
        {'day': str(r['day']), 'count': int(r['cnt'])}
        for r in cur.fetchall()
    ]

    return out


def handler(event, context):
    """Сводный дашборд пользователя"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'isBase64Encoded': False, 'body': ''}

    headers = event.get('headers') or {}
    headers_lower = {k.lower(): v for k, v in headers.items()}
    token = headers_lower.get('x-auth-token', '')

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

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

        if method == 'GET' and action == 'overview':
            return _resp(200, _get_overview(cur, user['id']))

        return _resp(400, {'error': 'Неизвестное действие'})
    except Exception as e:
        import traceback, sys
        print(f"[DASHBOARD ERROR] {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()
