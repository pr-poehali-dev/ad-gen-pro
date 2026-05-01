"""
Генерация рекламных объявлений через OpenAI GPT-4o на основе фида и параметров.
"""
import json
import os
import urllib.request
import urllib.error


def handler(event: dict, context) -> dict:
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': cors_headers, 'body': json.dumps({'error': 'Method not allowed'})}

    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        return {'statusCode': 500, 'headers': cors_headers, 'body': json.dumps({'error': 'OPENAI_API_KEY не настроен'})}

    body = json.loads(event.get('body') or '{}')
    feed_name = body.get('feed_name', 'каталог товаров')
    ad_type = body.get('ad_type', 'search')
    tone = body.get('tone', 'Продажи')
    count = min(int(body.get('count', 3)), 10)
    products = body.get('products', [])

    ad_type_map = {
        'search': 'поисковые текстовые объявления (заголовок до 56 символов, описание до 81 символа)',
        'banner': 'медийные баннерные объявления (заголовок до 35 символов, описание до 60 символов)',
        'product': 'товарные объявления с ценой и преимуществами (заголовок до 50 символов, описание до 90 символов)',
        'smart': 'смарт-баннеры с динамическим контентом (заголовок до 40 символов, описание до 70 символов)',
    }

    tone_map = {
        'Продажи': 'агрессивный продающий, призыв к действию',
        'Экспертный': 'экспертный, авторитетный, профессиональный',
        'Дружелюбный': 'дружелюбный, тёплый, близкий к пользователю',
        'Срочность': 'создающий срочность, ограниченное предложение, дедлайн',
        'Выгода': 'акцент на выгоде и экономии, скидках и ценности',
    }

    products_hint = ''
    if products:
        products_hint = f'\nТовары из фида: {", ".join(products[:10])}'

    prompt = f"""Ты эксперт по контекстной рекламе. Создай {count} вариантов рекламных объявлений.

Фид: {feed_name}{products_hint}
Тип объявления: {ad_type_map.get(ad_type, 'поисковые текстовые объявления')}
Тон текста: {tone_map.get(tone, tone)}

Для каждого объявления верни JSON объект с полями:
- title: заголовок (соблюдай лимит символов)
- description: текст объявления (соблюдай лимит символов)
- predicted_ctr: прогнозируемый CTR в процентах (число, например 3.2)
- quality_score: оценка качества от 0 до 100 (число)
- keywords: массив из 3-5 ключевых слов для этого объявления

Верни ТОЛЬКО валидный JSON массив объектов, без пояснений и markdown-блоков.
"""

    payload = json.dumps({
        'model': 'gpt-4o',
        'messages': [
            {'role': 'system', 'content': 'Ты эксперт по контекстной рекламе. Отвечай только валидным JSON без markdown.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.8,
        'max_tokens': 2000,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
        method='POST'
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read().decode('utf-8'))

    content = result['choices'][0]['message']['content'].strip()
    # Убираем markdown если вдруг есть
    if content.startswith('```'):
        lines = content.split('\n')
        content = '\n'.join(lines[1:-1])

    ads = json.loads(content)

    return {
        'statusCode': 200,
        'headers': cors_headers,
        'body': json.dumps({'ads': ads, 'model': 'gpt-4o', 'count': len(ads)})
    }
