"""
Генерация рекламных объявлений через polza.ai (GPT-4o).
Принимает либо feed_id (тогда вытаскивает товары из БД), либо явный список products.
Возвращает объявления в формате, совместимом с yd_ads (title1, title2, body).
"""
import json
import os
import urllib.request
import psycopg2
from psycopg2.extras import RealDictCursor


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Content-Type': 'application/json',
}


def _user_by_token(cur, token):
    if not token:
        return None
    safe = token.replace("'", "''")
    cur.execute(
        f"SELECT u.id FROM users u JOIN sessions s ON s.user_id = u.id "
        f"WHERE s.token = '{safe}' AND s.expires_at > NOW() LIMIT 1"
    )
    return cur.fetchone()


def _load_feed_context(cur, user_id, feed_id):
    """Достаёт фид и до 12 товаров для контекста промпта."""
    cur.execute(
        f"SELECT id, name FROM feeds WHERE id = {int(feed_id)} AND user_id = {int(user_id)} LIMIT 1"
    )
    feed = cur.fetchone()
    if not feed:
        return None, []
    cur.execute(
        f"SELECT name, price, currency, category, vendor "
        f"FROM feed_items WHERE feed_id = {int(feed_id)} ORDER BY id ASC LIMIT 12"
    )
    items = []
    for r in cur.fetchall():
        d = dict(r)
        d['price'] = float(d['price'] or 0)
        items.append(d)
    return feed['name'], items


def handler(event: dict, context) -> dict:
    """Генерация объявлений через polza.ai. Принимает feed_id или явные products."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Method not allowed'})}

    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return {'statusCode': 500, 'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'POLZA_API_KEY не настроен'})}

    body = json.loads(event.get('body') or '{}')
    feed_id = body.get('feed_id')
    feed_name = body.get('feed_name') or 'каталог товаров'
    ad_type = body.get('ad_type') or 'search'
    tone = body.get('tone') or 'Продажи'
    count = min(int(body.get('count') or 3), 10)
    products = body.get('products') or []
    custom_context = (body.get('context') or '').strip()

    # Если передан feed_id — подтягиваем товары из БД (нужен токен)
    feed_items_lines = []
    if feed_id:
        headers = event.get('headers') or {}
        headers_lower = {k.lower(): v for k, v in headers.items()}
        token = headers_lower.get('x-auth-token', '')
        dsn = os.environ.get('DATABASE_URL')
        if dsn and token:
            try:
                conn = psycopg2.connect(dsn)
                conn.autocommit = True
                cur = conn.cursor(cursor_factory=RealDictCursor)
                user = _user_by_token(cur, token)
                if user:
                    fname, items = _load_feed_context(cur, user['id'], feed_id)
                    if fname:
                        feed_name = fname
                    for it in items:
                        line = it.get('name') or ''
                        if it.get('price'):
                            line += f" — {int(it['price'])} {it.get('currency') or 'RUB'}"
                        if it.get('vendor'):
                            line += f" ({it['vendor']})"
                        if line:
                            feed_items_lines.append(line)
                cur.close()
                conn.close()
            except Exception as e:
                print(f"[generate-ads feed load error] {e}")

    ad_type_map = {
        'search': 'поисковые текстовые объявления Яндекс Директ. Заголовок 1 до 56 символов, заголовок 2 до 30 символов, текст до 81 символа',
        'banner': 'медийные баннерные объявления (заголовок до 35, текст до 60)',
        'product': 'товарные объявления с ценой и преимуществами (заголовок до 50, текст до 90)',
        'smart': 'смарт-баннеры с динамическим контентом (заголовок до 40, текст до 70)',
    }

    tone_map = {
        'Продажи': 'продающий, призыв к действию',
        'Экспертный': 'экспертный, авторитетный, профессиональный',
        'Дружелюбный': 'дружелюбный, тёплый',
        'Срочность': 'создающий срочность, ограниченное предложение',
        'Выгода': 'акцент на выгоде и экономии',
    }

    products_hint = ''
    if feed_items_lines:
        products_hint = '\nТовары из фида:\n- ' + '\n- '.join(feed_items_lines[:12])
    elif products:
        products_hint = f'\nТовары: {", ".join(products[:12])}'
    if custom_context:
        products_hint += f'\nДополнительный контекст: {custom_context}'

    prompt = f"""Ты эксперт по контекстной рекламе Яндекс Директ. Создай {count} вариантов рекламных объявлений.

Источник: {feed_name}{products_hint}
Тип объявления: {ad_type_map.get(ad_type, ad_type_map['search'])}
Тон: {tone_map.get(tone, tone)}

Каждое объявление — JSON-объект с полями:
- title1: заголовок 1 (СТРОГО до 56 символов, цепляющий)
- title2: заголовок 2 (СТРОГО до 30 символов, дополнение, можно бренд/гео)
- body: текст объявления (СТРОГО до 81 символа, продающий)
- predicted_ctr: число (прогнозируемый CTR в %)
- quality_score: число 0-100
- keywords: массив 3-5 ключевых фраз для этого объявления

Верни ТОЛЬКО валидный JSON-массив. Никаких комментариев и markdown."""

    payload = json.dumps({
        'model': 'openai/gpt-4o',
        'messages': [
            {'role': 'system', 'content': 'Ты эксперт по контекстной рекламе. Отвечай только валидным JSON, никаких комментариев.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.85,
        'max_tokens': 2500,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://polza.ai/api/v1/chat/completions',
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            result = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS,
                'body': json.dumps({'error': f'polza.ai: {str(e)[:300]}'})}

    content = (result.get('choices') or [{}])[0].get('message', {}).get('content', '').strip()

    # Зачищаем markdown-обёртки
    if content.startswith('```'):
        # удаляем первую и последнюю строки
        lines = content.split('\n')
        if lines[0].startswith('```'):
            lines = lines[1:]
        if lines and lines[-1].startswith('```'):
            lines = lines[:-1]
        content = '\n'.join(lines).strip()

    try:
        ads = json.loads(content)
    except Exception:
        return {'statusCode': 500, 'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Не удалось распарсить ответ ИИ', 'raw': content[:500]})}

    # Нормализация: поддержка старого формата (title/description) и нового (title1/title2/body)
    normalized = []
    for a in ads:
        if not isinstance(a, dict):
            continue
        title1 = a.get('title1') or a.get('title') or ''
        title2 = a.get('title2') or ''
        text = a.get('body') or a.get('description') or ''
        normalized.append({
            'title1': title1[:56],
            'title2': title2[:30],
            'body': text[:81],
            'predicted_ctr': a.get('predicted_ctr', 0),
            'quality_score': a.get('quality_score', 0),
            'keywords': a.get('keywords') or [],
        })

    return {
        'statusCode': 200,
        'headers': CORS_HEADERS,
        'body': json.dumps({'ads': normalized, 'model': 'openai/gpt-4o', 'count': len(normalized)})
    }
