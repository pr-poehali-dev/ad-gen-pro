"""
AI-агент digital-агентства AdFlow. Принимает диалог и контекст кампаний/фидов,
отвечает советами по стратегии, оптимизации, креативами через polza.ai (GPT-4o).
"""
import json
import os
import urllib.request


SYSTEM_PROMPT = """Ты — AdFlow Brain, AI-агент digital-агентства полного цикла.
Ты помогаешь клиенту (малый/средний бизнес) с:
- стратегией контекстной и таргетированной рекламы (Яндекс Директ, Google Ads, VK Реклама)
- созданием креативов и текстов объявлений
- анализом кампаний, бюджетов, CTR, конверсий
- автоматизацией процессов: запуск/пауза кампаний, A/B-тесты, ретаргетинг
- SEO, контент-маркетингом, email-маркетингом, работой с фидами товаров

Стиль: уверенный, конкретный, бизнес-ориентированный. Используй маркированные списки,
конкретные цифры, % и предложения. Отвечай на русском. Ответы — короткие и применимые.
Никогда не пиши «как языковая модель», ты — агент агентства."""


def handler(event: dict, context) -> dict:
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    }
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}
    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}

    api_key = os.environ.get('POLZA_API_KEY', '')
    if not api_key:
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': 'POLZA_API_KEY не настроен'})}

    body = json.loads(event.get('body') or '{}')
    messages_in = body.get('messages', [])
    ctx = body.get('context', {})

    ctx_str = ''
    if ctx:
        camps = ctx.get('campaigns', [])
        feeds = ctx.get('feeds', [])
        if camps:
            top = sorted(camps, key=lambda c: c.get('spent', 0), reverse=True)[:5]
            ctx_str += '\n\nТекущие кампании клиента:\n'
            for c in top:
                ctx_str += f"- {c.get('name')}: {c.get('platform')}, статус {c.get('status')}, бюджет ₽{c.get('budget',0)}, потрачено ₽{c.get('spent',0)}, CTR {c.get('ctr',0)}%\n"
        if feeds:
            ctx_str += f"\nЗагруженные фиды: {len(feeds)} шт., всего {sum(f.get('products',0) for f in feeds)} товаров\n"

    messages = [{'role': 'system', 'content': SYSTEM_PROMPT + ctx_str}]
    for m in messages_in[-10:]:
        role = m.get('role', 'user')
        if role in ('user', 'assistant'):
            messages.append({'role': role, 'content': str(m.get('content', ''))[:4000]})

    payload = json.dumps({
        'model': 'openai/gpt-4o',
        'messages': messages,
        'temperature': 0.7,
        'max_tokens': 800,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://polza.ai/api/v1/chat/completions',
        data=payload,
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'},
        method='POST',
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read().decode('utf-8'))

    content = result['choices'][0]['message']['content']

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'reply': content, 'model': 'openai/gpt-4o'})
    }
