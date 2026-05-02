"""Автоматизации: правила управления ставками и кампаниями.
CRUD + ручной запуск/превью с симуляцией метрик.
"""
import json
import os
import random
import psycopg2
from psycopg2.extras import RealDictCursor


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

ALLOWED_RULE_TYPES = {'bid_adjust', 'pause_campaign', 'alert', 'add_negative'}
ALLOWED_METRICS = {'ctr', 'cpc', 'cpa', 'spend', 'impressions', 'clicks', 'conversions', 'position'}
ALLOWED_OPERATORS = {'<', '<=', '>', '>=', '==', '!='}
ALLOWED_PERIODS = {'1d', '3d', '7d', '14d', '30d'}
ALLOWED_ACTIONS = {'notify', 'decrease_bid', 'increase_bid', 'pause', 'set_bid'}
ALLOWED_SCOPES = {'all', 'campaign', 'group'}


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


def _list_rules(cur, user_id):
    cur.execute(f"""
        SELECT r.id, r.name, r.description, r.rule_type, r.enabled,
               r.target_scope, r.target_campaign_id, r.metric, r.operator,
               r.threshold, r.period, r.action_type, r.action_value,
               r.notify_email, r.notify_telegram,
               r.last_run_at, r.runs_count, r.triggers_count,
               r.created_at, r.updated_at,
               c.name AS campaign_name
        FROM automation_rules r
        LEFT JOIN yd_campaigns c ON c.id = r.target_campaign_id
        WHERE r.user_id = {int(user_id)}
        ORDER BY r.enabled DESC, r.updated_at DESC
        LIMIT 200
    """)
    out = []
    for r in cur.fetchall():
        d = dict(r)
        d['threshold'] = float(d['threshold'] or 0)
        d['action_value'] = float(d['action_value'] or 0)
        out.append(d)
    return {'rules': out}


def _create_rule(cur, user_id, body):
    name = (body.get('name') or 'Новое правило').replace("'", "''")[:255]
    rule_type = body.get('rule_type') or 'bid_adjust'
    if rule_type not in ALLOWED_RULE_TYPES:
        return {'error': 'Неизвестный тип правила'}
    cur.execute(f"""
        INSERT INTO automation_rules (user_id, name, rule_type, enabled, metric, operator, threshold, period, action_type, action_value)
        VALUES ({int(user_id)}, '{name}', '{rule_type}', TRUE, 'ctr', '<', 2.0, '7d', 'notify', 0)
        RETURNING id
    """)
    return {'ok': True, 'id': cur.fetchone()['id']}


def _save_rule(cur, user_id, body):
    rid = int(body.get('id') or 0)
    if not rid:
        return {'error': 'id required'}
    cur.execute(f"SELECT id FROM automation_rules WHERE id = {rid} AND user_id = {int(user_id)} LIMIT 1")
    if not cur.fetchone():
        return {'error': 'not found'}

    fields = []
    if 'name' in body:
        v = (body.get('name') or '').replace("'", "''")[:255]
        fields.append(f"name = '{v}'")
    if 'description' in body:
        v = (body.get('description') or '').replace("'", "''")[:5000]
        fields.append(f"description = '{v}'")
    if 'rule_type' in body and body['rule_type'] in ALLOWED_RULE_TYPES:
        fields.append(f"rule_type = '{body['rule_type']}'")
    if 'enabled' in body:
        fields.append(f"enabled = {'TRUE' if body['enabled'] else 'FALSE'}")
    if 'target_scope' in body and body['target_scope'] in ALLOWED_SCOPES:
        fields.append(f"target_scope = '{body['target_scope']}'")
    if 'target_campaign_id' in body:
        cid = body.get('target_campaign_id')
        fields.append(f"target_campaign_id = {int(cid)}" if cid else "target_campaign_id = NULL")
    if 'metric' in body and body['metric'] in ALLOWED_METRICS:
        fields.append(f"metric = '{body['metric']}'")
    if 'operator' in body and body['operator'] in ALLOWED_OPERATORS:
        fields.append(f"operator = '{body['operator']}'")
    if 'threshold' in body:
        try: fields.append(f"threshold = {float(body['threshold'])}")
        except Exception: pass
    if 'period' in body and body['period'] in ALLOWED_PERIODS:
        fields.append(f"period = '{body['period']}'")
    if 'action_type' in body and body['action_type'] in ALLOWED_ACTIONS:
        fields.append(f"action_type = '{body['action_type']}'")
    if 'action_value' in body:
        try: fields.append(f"action_value = {float(body['action_value'])}")
        except Exception: pass
    if 'notify_email' in body:
        fields.append(f"notify_email = {'TRUE' if body['notify_email'] else 'FALSE'}")
    if 'notify_telegram' in body:
        fields.append(f"notify_telegram = {'TRUE' if body['notify_telegram'] else 'FALSE'}")

    if not fields:
        return {'error': 'no fields'}
    fields.append("updated_at = NOW()")
    cur.execute(f"UPDATE automation_rules SET {', '.join(fields)} WHERE id = {rid}")
    return {'ok': True}


def _toggle_rule(cur, user_id, body):
    rid = int(body.get('id') or 0)
    if not rid:
        return {'error': 'id required'}
    enabled = bool(body.get('enabled', True))
    cur.execute(f"""
        UPDATE automation_rules SET enabled = {'TRUE' if enabled else 'FALSE'}, updated_at = NOW()
        WHERE id = {rid} AND user_id = {int(user_id)}
    """)
    return {'ok': True}


def _delete_rule(cur, user_id, body):
    rid = int(body.get('id') or 0)
    if not rid:
        return {'error': 'id required'}
    cur.execute(f"DELETE FROM automation_runs WHERE rule_id = {rid} AND user_id = {int(user_id)}")
    cur.execute(f"DELETE FROM automation_rules WHERE id = {rid} AND user_id = {int(user_id)}")
    return {'ok': True}


def _check_condition(value, op, threshold):
    if op == '<': return value < threshold
    if op == '<=': return value <= threshold
    if op == '>': return value > threshold
    if op == '>=': return value >= threshold
    if op == '==': return abs(value - threshold) < 1e-6
    if op == '!=': return abs(value - threshold) >= 1e-6
    return False


def _action_label(action_type, action_value):
    if action_type == 'notify': return 'Отправлено уведомление'
    if action_type == 'decrease_bid': return f'Ставка понижена на {action_value}%'
    if action_type == 'increase_bid': return f'Ставка повышена на {action_value}%'
    if action_type == 'pause': return 'Кампания поставлена на паузу'
    if action_type == 'set_bid': return f'Ставка установлена в {action_value} ₽'
    return action_type


def _simulate_metric(metric, target_label):
    """Пока нет реальных данных от ЯД API — симулируем правдоподобные значения для проверки правила."""
    seed = sum(ord(c) for c in (target_label or 'x'))
    random.seed(seed)
    if metric == 'ctr': return round(random.uniform(0.5, 12.0), 2)
    if metric == 'cpc': return round(random.uniform(5, 250), 2)
    if metric == 'cpa': return round(random.uniform(150, 5000), 2)
    if metric == 'spend': return round(random.uniform(500, 50000), 2)
    if metric == 'impressions': return random.randint(500, 200000)
    if metric == 'clicks': return random.randint(10, 5000)
    if metric == 'conversions': return random.randint(0, 200)
    if metric == 'position': return round(random.uniform(1.0, 10.0), 1)
    return 0


def _run_rule(cur, user_id, body):
    """Ручной запуск правила: проходит по подходящим кампаниям, проверяет условие, пишет лог."""
    rid = int(body.get('id') or 0)
    if not rid:
        return {'error': 'id required'}
    cur.execute(f"""
        SELECT r.*, c.name AS campaign_name
        FROM automation_rules r
        LEFT JOIN yd_campaigns c ON c.id = r.target_campaign_id
        WHERE r.id = {rid} AND r.user_id = {int(user_id)} LIMIT 1
    """)
    rule = cur.fetchone()
    if not rule:
        return {'error': 'not found'}

    # Список целей: если scope=campaign и target_campaign_id указан — одна кампания, иначе все кампании пользователя
    targets = []
    if rule['target_scope'] == 'campaign' and rule['target_campaign_id']:
        cur.execute(f"SELECT id, name FROM yd_campaigns WHERE id = {int(rule['target_campaign_id'])} LIMIT 1")
        row = cur.fetchone()
        if row:
            targets.append({'id': row['id'], 'label': row['name'] or f"Кампания #{row['id']}"})
    else:
        cur.execute(f"SELECT id, name FROM yd_campaigns WHERE user_id = {int(user_id)} LIMIT 50")
        for row in cur.fetchall():
            targets.append({'id': row['id'], 'label': row['name'] or f"Кампания #{row['id']}"})

    if not targets:
        targets.append({'id': None, 'label': 'Демо-кампания'})

    triggered_count = 0
    results = []
    metric = rule['metric']
    op = rule['operator']
    threshold = float(rule['threshold'] or 0)
    action_type = rule['action_type']
    action_value = float(rule['action_value'] or 0)

    for t in targets:
        value = _simulate_metric(metric, t['label'])
        triggered = _check_condition(value, op, threshold)
        if triggered:
            triggered_count += 1
        action_label = _action_label(action_type, action_value) if triggered else 'Условие не выполнено — без действия'
        safe_label = (t['label'] or '').replace("'", "''")[:500]
        safe_action = action_label.replace("'", "''")[:255]
        details = f"metric={metric} value={value} {op} threshold={threshold}"
        safe_details = details.replace("'", "''")[:1000]
        cur.execute(f"""
            INSERT INTO automation_runs (rule_id, user_id, triggered, target_label, metric_value, action_taken, details)
            VALUES ({rid}, {int(user_id)}, {'TRUE' if triggered else 'FALSE'}, '{safe_label}', {value}, '{safe_action}', '{safe_details}')
        """)
        results.append({
            'target': t['label'],
            'metric_value': value,
            'triggered': triggered,
            'action': action_label,
        })

    cur.execute(f"""
        UPDATE automation_rules
        SET last_run_at = NOW(),
            runs_count = runs_count + 1,
            triggers_count = triggers_count + {triggered_count}
        WHERE id = {rid}
    """)
    return {'ok': True, 'triggered': triggered_count, 'total': len(results), 'results': results}


def _list_runs(cur, user_id, params):
    rule_id = params.get('rule_id')
    where = [f"user_id = {int(user_id)}"]
    if rule_id:
        try:
            where.append(f"rule_id = {int(rule_id)}")
        except Exception:
            pass
    cur.execute(f"""
        SELECT id, rule_id, triggered, target_label, metric_value, action_taken, details, created_at
        FROM automation_runs
        WHERE {' AND '.join(where)}
        ORDER BY created_at DESC LIMIT 100
    """)
    out = []
    for r in cur.fetchall():
        d = dict(r)
        d['metric_value'] = float(d['metric_value'] or 0)
        out.append(d)
    return {'runs': out}


def handler(event, context):
    """Автоматизации: правила управления ставками и кампаниями"""
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
            return _resp(200, _list_rules(cur, uid))
        if method == 'GET' and action == 'runs':
            return _resp(200, _list_runs(cur, uid, params))
        if method == 'POST' and action == 'create':
            return _resp(200, _create_rule(cur, uid, body))
        if method == 'POST' and action == 'save':
            return _resp(200, _save_rule(cur, uid, body))
        if method == 'POST' and action == 'toggle':
            return _resp(200, _toggle_rule(cur, uid, body))
        if method == 'POST' and action == 'delete':
            return _resp(200, _delete_rule(cur, uid, body))
        if method == 'POST' and action == 'run':
            return _resp(200, _run_rule(cur, uid, body))

        return _resp(400, {'error': 'Неизвестное действие'})
    except Exception as e:
        import traceback, sys
        print(f"[AUTOMATIONS ERROR] {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()
