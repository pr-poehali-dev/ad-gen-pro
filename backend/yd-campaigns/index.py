"""Эксперт-режим настройки рекламных кампаний (как в Яндекс Директ).
CRUD по кампаниям, группам, объявлениям, фразам.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime


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


def _list_campaigns(cur, user_id):
    cur.execute(f"""
        SELECT c.id, c.name, c.campaign_type, c.status, c.strategy_type,
               c.daily_budget, c.weekly_budget, c.created_at, c.updated_at, c.step,
               (select count(*) from yd_ad_groups g where g.campaign_id = c.id) as groups_count,
               (select count(*) from yd_ads a join yd_ad_groups g on g.id = a.group_id where g.campaign_id = c.id) as ads_count,
               (select count(*) from yd_keywords k join yd_ad_groups g on g.id = k.group_id where g.campaign_id = c.id) as keywords_count
        FROM yd_campaigns c
        WHERE c.user_id = {int(user_id)}
        ORDER BY c.updated_at DESC
        LIMIT 200
    """)
    rows = cur.fetchall()
    out = []
    for r in rows:
        d = dict(r)
        d['daily_budget'] = float(d['daily_budget'] or 0)
        d['weekly_budget'] = float(d['weekly_budget'] or 0)
        out.append(d)
    return {'campaigns': out}


def _get_campaign(cur, user_id, campaign_id):
    cur.execute(f"""
        SELECT * FROM yd_campaigns WHERE id = {int(campaign_id)} AND user_id = {int(user_id)} LIMIT 1
    """)
    c = cur.fetchone()
    if not c:
        return None
    cid = c['id']
    cur.execute(f"SELECT * FROM yd_ad_groups WHERE campaign_id = {int(cid)} ORDER BY sort_order, id")
    groups = [dict(r) for r in cur.fetchall()]
    group_ids = [g['id'] for g in groups]
    ads_by_group = {gid: [] for gid in group_ids}
    keywords_by_group = {gid: [] for gid in group_ids}
    if group_ids:
        ids_sql = ','.join(str(int(g)) for g in group_ids)
        cur.execute(f"SELECT * FROM yd_ads WHERE group_id IN ({ids_sql}) ORDER BY sort_order, id")
        for r in cur.fetchall():
            ads_by_group.setdefault(r['group_id'], []).append(dict(r))
        cur.execute(f"SELECT * FROM yd_keywords WHERE group_id IN ({ids_sql}) ORDER BY id")
        for r in cur.fetchall():
            keywords_by_group.setdefault(r['group_id'], []).append(dict(r))
    for g in groups:
        g['ads'] = ads_by_group.get(g['id'], [])
        g['keywords'] = keywords_by_group.get(g['id'], [])
        for a in g['ads']:
            pass
        for k in g['keywords']:
            k['bid'] = float(k['bid'] or 0)
    out = dict(c)
    out['daily_budget'] = float(out['daily_budget'] or 0)
    out['weekly_budget'] = float(out['weekly_budget'] or 0)
    out['groups'] = groups
    return out


def _create_campaign(cur, user_id, body):
    name = (body.get('name') or 'Без названия').replace("'", "''")[:255]
    ctype = (body.get('campaign_type') or 'text').replace("'", "''")[:32]
    cur.execute(f"""
        INSERT INTO yd_campaigns (user_id, name, campaign_type, status, step)
        VALUES ({int(user_id)}, '{name}', '{ctype}', 'draft', 1)
        RETURNING id
    """)
    cid = cur.fetchone()['id']
    return {'id': cid}


def _save_campaign(cur, user_id, body):
    cid = int(body.get('id') or 0)
    if not cid:
        return {'error': 'id required'}
    cur.execute(f"SELECT id FROM yd_campaigns WHERE id = {cid} AND user_id = {int(user_id)} LIMIT 1")
    if not cur.fetchone():
        return {'error': 'not found'}

    fields = []
    if 'name' in body:
        v = (body.get('name') or '').replace("'", "''")[:255]
        fields.append(f"name = '{v}'")
    if 'campaign_type' in body:
        v = (body.get('campaign_type') or 'text').replace("'", "''")[:32]
        fields.append(f"campaign_type = '{v}'")
    if 'status' in body:
        v = (body.get('status') or 'draft').replace("'", "''")[:16]
        fields.append(f"status = '{v}'")
    if 'strategy_type' in body:
        v = (body.get('strategy_type') or 'manual_cpc').replace("'", "''")[:48]
        fields.append(f"strategy_type = '{v}'")
    if 'strategy_settings' in body:
        v = json.dumps(body.get('strategy_settings') or {}).replace("'", "''")
        fields.append(f"strategy_settings = '{v}'::jsonb")
    if 'daily_budget' in body:
        try: fields.append(f"daily_budget = {float(body.get('daily_budget') or 0)}")
        except: pass
    if 'weekly_budget' in body:
        try: fields.append(f"weekly_budget = {float(body.get('weekly_budget') or 0)}")
        except: pass
    if 'counter_id' in body:
        v = (body.get('counter_id') or '').replace("'", "''")[:32]
        fields.append(f"counter_id = '{v}'")
    if 'counter_goals' in body:
        v = (body.get('counter_goals') or '').replace("'", "''")[:2000]
        fields.append(f"counter_goals = '{v}'")
    if 'schedule' in body:
        v = json.dumps(body.get('schedule') or {}).replace("'", "''")
        fields.append(f"schedule = '{v}'::jsonb")
    if 'regions' in body:
        v = json.dumps(body.get('regions') or []).replace("'", "''")
        fields.append(f"regions = '{v}'::jsonb")
    if 'negative_keywords' in body:
        v = (body.get('negative_keywords') or '').replace("'", "''")[:20000]
        fields.append(f"negative_keywords = '{v}'")
    if 'utm_template' in body:
        v = (body.get('utm_template') or '').replace("'", "''")[:1000]
        fields.append(f"utm_template = '{v}'")
    if 'notes' in body:
        v = (body.get('notes') or '').replace("'", "''")[:5000]
        fields.append(f"notes = '{v}'")
    if 'step' in body:
        try: fields.append(f"step = {int(body.get('step') or 1)}")
        except: pass

    if fields:
        fields.append("updated_at = NOW()")
        cur.execute(f"UPDATE yd_campaigns SET {', '.join(fields)} WHERE id = {cid}")

    # Replace groups/ads/keywords if provided
    if 'groups' in body:
        # Soft delete by removing old children for this campaign
        cur.execute(f"""
            DELETE FROM yd_keywords WHERE group_id IN (SELECT id FROM yd_ad_groups WHERE campaign_id = {cid})
        """)
        cur.execute(f"""
            DELETE FROM yd_ads WHERE group_id IN (SELECT id FROM yd_ad_groups WHERE campaign_id = {cid})
        """)
        cur.execute(f"DELETE FROM yd_ad_groups WHERE campaign_id = {cid}")

        for gi, g in enumerate(body.get('groups') or []):
            gname = (g.get('name') or f'Группа {gi+1}').replace("'", "''")[:255]
            geo = json.dumps(g.get('geo') or []).replace("'", "''")
            devices = json.dumps(g.get('devices') or []).replace("'", "''")
            audience = json.dumps(g.get('audience_targets') or []).replace("'", "''")
            cur.execute(f"""
                INSERT INTO yd_ad_groups (campaign_id, name, geo, devices, audience_targets, sort_order)
                VALUES ({cid}, '{gname}', '{geo}'::jsonb, '{devices}'::jsonb, '{audience}'::jsonb, {gi})
                RETURNING id
            """)
            new_gid = cur.fetchone()['id']
            for ai, a in enumerate(g.get('ads') or []):
                ad_type = (a.get('ad_type') or 'text').replace("'", "''")[:32]
                t1 = (a.get('title1') or '').replace("'", "''")[:56]
                t2 = (a.get('title2') or '').replace("'", "''")[:30]
                body_text = (a.get('body') or '').replace("'", "''")[:81]
                disp = (a.get('display_url') or '').replace("'", "''")[:20]
                href = (a.get('href') or '').replace("'", "''")[:2000]
                img = (a.get('image_url') or '').replace("'", "''")[:2000]
                sl = json.dumps(a.get('sitelinks') or []).replace("'", "''")
                co = json.dumps(a.get('callouts') or []).replace("'", "''")
                cur.execute(f"""
                    INSERT INTO yd_ads (group_id, ad_type, title1, title2, body, display_url, href, image_url, sitelinks, callouts, sort_order)
                    VALUES ({new_gid}, '{ad_type}', '{t1}', '{t2}', '{body_text}', '{disp}', '{href}', '{img}', '{sl}'::jsonb, '{co}'::jsonb, {ai})
                """)
            for k in (g.get('keywords') or []):
                phrase = (k.get('phrase') or '').replace("'", "''")[:4000]
                if not phrase:
                    continue
                try:
                    bid = float(k.get('bid') or 0)
                except:
                    bid = 0
                mt = (k.get('match_type') or 'broad').replace("'", "''")[:16]
                cur.execute(f"""
                    INSERT INTO yd_keywords (group_id, phrase, bid, match_type)
                    VALUES ({new_gid}, '{phrase}', {bid}, '{mt}')
                """)
    return {'ok': True, 'id': cid}


def _list_groups(cur, user_id):
    """Список всех групп пользователя для выпадающего списка."""
    cur.execute(f"""
        SELECT g.id, g.name, g.campaign_id, c.name AS campaign_name, c.campaign_type,
               (SELECT COUNT(*) FROM yd_ads a WHERE a.group_id = g.id) AS ads_count
        FROM yd_ad_groups g
        JOIN yd_campaigns c ON c.id = g.campaign_id
        WHERE c.user_id = {int(user_id)}
        ORDER BY c.updated_at DESC, g.sort_order, g.id
        LIMIT 500
    """)
    return {'groups': [dict(r) for r in cur.fetchall()]}


def _add_ads_to_group(cur, user_id, body):
    """Добавить пачку объявлений в существующую группу (используется AI-генератором)."""
    gid = int(body.get('group_id') or 0)
    if not gid:
        return {'error': 'group_id required'}
    # Проверяем владельца
    cur.execute(f"""
        SELECT g.id, g.campaign_id FROM yd_ad_groups g
        JOIN yd_campaigns c ON c.id = g.campaign_id
        WHERE g.id = {gid} AND c.user_id = {int(user_id)} LIMIT 1
    """)
    row = cur.fetchone()
    if not row:
        return {'error': 'group not found'}

    ads = body.get('ads') or []
    if not ads:
        return {'error': 'ads required'}

    # Узнаём текущий max sort_order
    cur.execute(f"SELECT COALESCE(MAX(sort_order), -1) AS m FROM yd_ads WHERE group_id = {gid}")
    next_order = (cur.fetchone()['m'] or -1) + 1

    inserted = 0
    for a in ads:
        ad_type = (a.get('ad_type') or 'text').replace("'", "''")[:32]
        t1 = (a.get('title1') or '').replace("'", "''")[:56]
        t2 = (a.get('title2') or '').replace("'", "''")[:30]
        body_text = (a.get('body') or '').replace("'", "''")[:81]
        disp = (a.get('display_url') or '').replace("'", "''")[:20]
        href = (a.get('href') or '').replace("'", "''")[:2000]
        img = (a.get('image_url') or '').replace("'", "''")[:2000]
        sl = json.dumps(a.get('sitelinks') or []).replace("'", "''")
        co = json.dumps(a.get('callouts') or []).replace("'", "''")
        cur.execute(f"""
            INSERT INTO yd_ads (group_id, ad_type, title1, title2, body, display_url, href, image_url, sitelinks, callouts, sort_order)
            VALUES ({gid}, '{ad_type}', '{t1}', '{t2}', '{body_text}', '{disp}', '{href}', '{img}', '{sl}'::jsonb, '{co}'::jsonb, {next_order})
        """)
        next_order += 1
        inserted += 1

    # Обновляем updated_at кампании
    cur.execute(f"UPDATE yd_campaigns SET updated_at = NOW() WHERE id = {int(row['campaign_id'])}")

    # Добавим ключевые фразы (если переданы)
    keywords = body.get('keywords') or []
    if keywords:
        for kw in keywords:
            phrase = (kw if isinstance(kw, str) else (kw.get('phrase') or '')).replace("'", "''")[:4000]
            if not phrase:
                continue
            cur.execute(f"""
                INSERT INTO yd_keywords (group_id, phrase, bid, match_type)
                VALUES ({gid}, '{phrase}', 0, 'broad')
            """)

    return {'ok': True, 'inserted': inserted, 'group_id': gid, 'campaign_id': row['campaign_id']}


def _delete_campaign(cur, user_id, campaign_id):
    cid = int(campaign_id)
    cur.execute(f"SELECT id FROM yd_campaigns WHERE id = {cid} AND user_id = {int(user_id)} LIMIT 1")
    if not cur.fetchone():
        return {'error': 'not found'}
    cur.execute(f"""DELETE FROM yd_keywords WHERE group_id IN (SELECT id FROM yd_ad_groups WHERE campaign_id = {cid})""")
    cur.execute(f"""DELETE FROM yd_ads WHERE group_id IN (SELECT id FROM yd_ad_groups WHERE campaign_id = {cid})""")
    cur.execute(f"DELETE FROM yd_ad_groups WHERE campaign_id = {cid}")
    cur.execute(f"DELETE FROM yd_campaigns WHERE id = {cid}")
    return {'ok': True}


def handler(event, context):
    """Эксперт-режим настройки рекламных кампаний: CRUD по кампаниям и вложенным сущностям"""
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
            return _resp(200, _list_campaigns(cur, uid))

        if method == 'GET' and action == 'get':
            cid = params.get('id') or 0
            data = _get_campaign(cur, uid, cid)
            if not data:
                return _resp(404, {'error': 'Кампания не найдена'})
            return _resp(200, data)

        if method == 'POST' and action == 'create':
            return _resp(200, _create_campaign(cur, uid, body))

        if method == 'POST' and action == 'save':
            return _resp(200, _save_campaign(cur, uid, body))

        if method == 'POST' and action == 'delete':
            cid = body.get('id') or 0
            return _resp(200, _delete_campaign(cur, uid, cid))

        if method == 'GET' and action == 'groups':
            return _resp(200, _list_groups(cur, uid))

        if method == 'POST' and action == 'add_ads':
            return _resp(200, _add_ads_to_group(cur, uid, body))

        return _resp(400, {'error': 'Неизвестное действие'})

    except Exception as e:
        import traceback, sys
        print(f"[YD ERROR] {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()