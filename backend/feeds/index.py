"""Загрузка и парсинг рекламных фидов (YML, CSV).
Файл прилетает в base64, кладётся в S3, парсится в feed_items.
"""
import json
import os
import base64
import csv
import io
import re
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime

import boto3
import psycopg2
from psycopg2.extras import RealDictCursor


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
}

MAX_FILE_BYTES = 50 * 1024 * 1024  # 50 МБ


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


def _get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def _detect_format(filename: str) -> str:
    ext = (filename.rsplit('.', 1)[-1] if '.' in filename else '').lower()
    if ext in ('yml', 'xml'):
        return 'YML'
    if ext == 'csv':
        return 'CSV'
    if ext in ('xlsx', 'xls'):
        return 'Excel'
    return 'CSV'


def _parse_yml(content: bytes):
    """Парсит YML/XML фид Яндекс.Маркета."""
    items = []
    try:
        text = content.decode('utf-8', errors='ignore')
        root = ET.fromstring(text)
        # Ищем offers
        for offer in root.iter('offer'):
            def t(tag, default=''):
                el = offer.find(tag)
                return (el.text or default).strip() if el is not None and el.text else default
            sku = (offer.get('id') or '').strip()[:255]
            name = t('name', t('model', ''))[:1000]
            price = 0.0
            try:
                price = float(t('price', '0').replace(',', '.'))
            except Exception:
                price = 0.0
            currency = t('currencyId', 'RUB')[:8]
            url = t('url', '')[:2000]
            description = t('description', '')[:5000]
            picture = t('picture', '')[:2000]
            vendor = t('vendor', '')[:255]
            category_id = t('categoryId', '')
            available = (offer.get('available') or 'true').lower() == 'true'
            items.append({
                'sku': sku, 'name': name, 'price': price, 'currency': currency,
                'url': url, 'description': description, 'image_url': picture,
                'vendor': vendor, 'category': category_id, 'available': available,
            })
    except Exception as e:
        return items, f'YML parse error: {e}'
    return items, ''


def _parse_csv(content: bytes):
    """Парсит CSV. Угадывает колонки по русским и английским названиям."""
    items = []
    try:
        text = content.decode('utf-8-sig', errors='ignore')
        # Авто-детект разделителя
        sample = text[:4096]
        delim = ','
        for cand in [';', '\t', '|', ',']:
            if sample.count(cand) > sample.count(delim):
                delim = cand
        reader = csv.DictReader(io.StringIO(text), delimiter=delim)
        col_map = {}
        for col in (reader.fieldnames or []):
            low = col.lower().strip()
            if any(k in low for k in ['артикул', 'sku', 'код', 'id товара']):
                col_map['sku'] = col
            elif any(k in low for k in ['название', 'наименование', 'name', 'title', 'товар']):
                col_map['name'] = col
            elif any(k in low for k in ['цена', 'price', 'стоимость']):
                col_map['price'] = col
            elif any(k in low for k in ['валюта', 'currency']):
                col_map['currency'] = col
            elif any(k in low for k in ['категория', 'category']):
                col_map['category'] = col
            elif any(k in low for k in ['бренд', 'производитель', 'vendor', 'brand']):
                col_map['vendor'] = col
            elif any(k in low for k in ['описание', 'description']):
                col_map['description'] = col
            elif any(k in low for k in ['ссылк', 'url', 'link']):
                col_map['url'] = col
            elif any(k in low for k in ['картин', 'фото', 'image', 'picture', 'photo']):
                col_map['image_url'] = col

        cnt = 0
        for row in reader:
            cnt += 1
            if cnt > 10000:
                break
            def g(k):
                col = col_map.get(k)
                return (row.get(col, '') or '').strip() if col else ''
            try:
                price = float((g('price') or '0').replace(',', '.').replace(' ', ''))
            except Exception:
                price = 0.0
            items.append({
                'sku': g('sku')[:255],
                'name': (g('name') or 'Товар')[:1000],
                'price': price,
                'currency': (g('currency') or 'RUB')[:8],
                'category': g('category')[:500],
                'vendor': g('vendor')[:255],
                'description': g('description')[:5000],
                'url': g('url')[:2000],
                'image_url': g('image_url')[:2000],
                'available': True,
            })
    except Exception as e:
        return items, f'CSV parse error: {e}'
    return items, ''


def _parse_file(filename: str, content: bytes):
    fmt = _detect_format(filename)
    if fmt == 'YML':
        return _parse_yml(content)
    if fmt == 'CSV':
        return _parse_csv(content)
    return [], 'Excel-парсинг будет добавлен позже. Сохраните файл как CSV или YML.'


def _list_feeds(cur, user_id):
    cur.execute(f"""
        SELECT id, name, type, size, size_bytes, products, status, original_filename,
               cdn_url, parse_error, created_at, updated_at
        FROM feeds WHERE user_id = {int(user_id)}
        ORDER BY updated_at DESC
        LIMIT 200
    """)
    out = []
    for r in cur.fetchall():
        d = dict(r)
        out.append(d)
    return {'feeds': out}


def _save_to_s3(content: bytes, filename: str, user_id: int) -> tuple:
    safe_name = re.sub(r'[^A-Za-z0-9._-]', '_', filename)[:80] or 'feed'
    key = f"feeds/u{user_id}/{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}_{safe_name}"
    ct = 'application/xml' if safe_name.endswith(('.yml', '.xml')) else (
        'text/csv' if safe_name.endswith('.csv') else 'application/octet-stream'
    )
    s3 = _get_s3()
    s3.put_object(Bucket='files', Key=key, Body=content, ContentType=ct)
    cdn = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return key, cdn


def _upload_feed(cur, user_id, body):
    filename = (body.get('filename') or 'feed.csv').strip()
    file_b64 = body.get('content_base64') or ''
    if not file_b64:
        return {'error': 'Файл не передан'}
    try:
        content = base64.b64decode(file_b64)
    except Exception:
        return {'error': 'Некорректный base64'}
    if len(content) > MAX_FILE_BYTES:
        return {'error': 'Файл больше 50 МБ'}

    fmt = _detect_format(filename)
    items, parse_err = _parse_file(filename, content)

    # Заливаем в S3
    s3_key = ''
    cdn_url = ''
    s3_err = ''
    try:
        s3_key, cdn_url = _save_to_s3(content, filename, int(user_id))
    except Exception as e:
        s3_err = f'S3: {e}'

    name_clean = re.sub(r'\.[^.]+$', '', filename)[:255].replace("'", "''")
    safe_filename = filename[:500].replace("'", "''")
    safe_s3_key = s3_key.replace("'", "''")
    safe_cdn = cdn_url.replace("'", "''")
    safe_err = (parse_err + (' | ' + s3_err if s3_err else '')).replace("'", "''")[:1000]
    size_mb = len(content) / 1024 / 1024
    size_str = (f"{size_mb:.1f} МБ" if size_mb >= 0.1 else f"{int(len(content) / 1024)} КБ").replace("'", "''")
    fmt_safe = fmt.replace("'", "''")
    status = 'warning' if (parse_err or not items) else 'ok'

    cur.execute(f"""
        INSERT INTO feeds (workspace_id, user_id, name, type, size, size_bytes, products, status,
                           s3_key, cdn_url, original_filename, parse_error, source_url)
        VALUES (0, {int(user_id)}, '{name_clean}', '{fmt_safe}', '{size_str}', {len(content)},
                {len(items)}, '{status}', '{safe_s3_key}', '{safe_cdn}', '{safe_filename}', '{safe_err}', '{safe_cdn}')
        RETURNING id
    """)
    feed_id = cur.fetchone()['id']

    # Записываем товары пачкой
    if items:
        for it in items[:5000]:
            sku = (it.get('sku') or '').replace("'", "''")[:255]
            name = (it.get('name') or '').replace("'", "''")[:1000]
            price = float(it.get('price') or 0)
            currency = (it.get('currency') or 'RUB').replace("'", "''")[:8]
            category = (it.get('category') or '').replace("'", "''")[:500]
            vendor = (it.get('vendor') or '').replace("'", "''")[:255]
            descr = (it.get('description') or '').replace("'", "''")[:5000]
            url = (it.get('url') or '').replace("'", "''")[:2000]
            img = (it.get('image_url') or '').replace("'", "''")[:2000]
            avail = 'TRUE' if it.get('available') else 'FALSE'
            cur.execute(f"""
                INSERT INTO feed_items
                (feed_id, sku, name, price, currency, category, vendor, description, url, image_url, available)
                VALUES ({int(feed_id)}, '{sku}', '{name}', {price}, '{currency}',
                        '{category}', '{vendor}', '{descr}', '{url}', '{img}', {avail})
            """)

    return {'ok': True, 'id': feed_id, 'products': len(items), 'parse_error': parse_err or s3_err}


def _delete_feed(cur, user_id, body):
    fid = int(body.get('id') or 0)
    if not fid:
        return {'error': 'id required'}
    cur.execute(f"SELECT id, s3_key FROM feeds WHERE id = {fid} AND user_id = {int(user_id)} LIMIT 1")
    row = cur.fetchone()
    if not row:
        return {'error': 'not found'}
    cur.execute(f"DELETE FROM feed_items WHERE feed_id = {fid}")
    cur.execute(f"DELETE FROM feeds WHERE id = {fid}")
    if row.get('s3_key'):
        try:
            _get_s3().delete_object(Bucket='files', Key=row['s3_key'])
        except Exception:
            pass
    return {'ok': True}


def _get_items(cur, user_id, feed_id):
    fid = int(feed_id)
    cur.execute(f"SELECT id FROM feeds WHERE id = {fid} AND user_id = {int(user_id)} LIMIT 1")
    if not cur.fetchone():
        return {'error': 'not found'}
    cur.execute(f"""
        SELECT id, sku, name, price, currency, category, vendor, url, image_url, available
        FROM feed_items WHERE feed_id = {fid}
        ORDER BY id ASC LIMIT 200
    """)
    items = []
    for r in cur.fetchall():
        d = dict(r)
        d['price'] = float(d['price'] or 0)
        items.append(d)
    return {'items': items}


def handler(event, context):
    """Загрузка/парсинг/CRUD рекламных фидов с хранением в S3"""
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'isBase64Encoded': False, 'body': ''}

    headers = event.get('headers') or {}
    headers_lower = {k.lower(): v for k, v in headers.items()}
    token = headers_lower.get('x-auth-token', '')

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    body_raw = event.get('body') or '{}'
    if event.get('isBase64Encoded'):
        try:
            body_raw = base64.b64decode(body_raw).decode('utf-8')
        except Exception:
            body_raw = '{}'
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
            return _resp(200, _list_feeds(cur, uid))

        if method == 'GET' and action == 'items':
            fid = params.get('id') or 0
            return _resp(200, _get_items(cur, uid, fid))

        if method == 'POST' and action == 'upload':
            return _resp(200, _upload_feed(cur, uid, body))

        if method == 'POST' and action == 'delete':
            return _resp(200, _delete_feed(cur, uid, body))

        return _resp(400, {'error': 'Неизвестное действие'})
    except Exception as e:
        import traceback, sys
        print(f"[FEEDS ERROR] {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return _resp(500, {'error': str(e)[:500]})
    finally:
        cur.close()
        conn.close()
