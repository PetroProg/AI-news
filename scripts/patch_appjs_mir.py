import re

path = '/home/petroprog/Projects/news-ai/web/js/app.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. getCategorySearchPlaceholder
content = content.replace(
    "return 'Поиск в «Мировая политика» (страны, лидеры, выборы, договоры)...';",
    "return 'Поиск в «Мир» (страны, мировые события, космос, наука, лидеры)...';"
)

# 2. Source-based check
content = content.replace(
    "return 'Мировая политика';",
    "return 'Мир';"
)

# 3. essentialCats
content = content.replace(
    "'Украина', 'Мировая политика', 'Swiss'",
    "'Украина', 'Мир', 'Swiss'"
)

# 4. Toast message
content = content.replace(
    "msg = 'В категории «Мировая политика» новости отбираются по международным событиям, выборам и геополитике.';",
    "msg = 'В категории «Мир» новости отбираются по международным событиям, науке, космосу и геополитике.';"
)

# 5. normalizeCategory mapping and fallback
old_map = """      const map = {
        'мировая политика': 'Мировая политика',
        'политика': 'Мировая политика',
        'мир': 'Мировая политика',
        'world': 'Мировая политика',
        'новости мира': 'Мировая политика',
        'международные': 'Мировая политика',"""

new_map = """      const map = {
        'мировая политика': 'Мир',
        'политика': 'Мир',
        'мир': 'Мир',
        'world': 'Мир',
        'новости мира': 'Мир',
        'международные': 'Мир',"""

if old_map in content:
    content = content.replace(old_map, new_map)

# 6. Guard in lower.includes('украин')
old_ukr_check = """      if (lower.includes('украин') || lower.includes('україна') || lower.includes('ukraine') || lower.includes('novynaukr')) {
        return 'Украина';
      }"""

new_ukr_check = """      if (lower.includes('украин') || lower.includes('україна') || lower.includes('ukraine') || lower.includes('novynaukr')) {
        const s = ((item && (item.source || item.source_name)) || '').toLowerCase();
        const t = ((item && (item.title || item.russian_title)) || '').toLowerCase();
        const hasCore = ['украин', 'україна', 'киев', 'київ', 'днепр', 'дніпро', 'всу', 'зеленск', 'покровск', 'харьков', 'одесс', 'шахед', 'обстрел', 'дрон', 'бпла', 'пво', 'оккупант', 'фронт'].some(k => t.includes(k));
        const isUkrSrc = ['pravda.com.ua', 'liga.net', 'novynaukr', 'украин', 'украина', 'україна'].some(k => s.includes(k));
        if (!hasCore && !isUkrSrc) {
          return 'Мир';
        }
        return 'Украина';
      }"""

if old_ukr_check in content:
    content = content.replace(old_ukr_check, new_ukr_check)

# 7. Also replace any remaining 'Мировая политика'
content = content.replace("'Мировая политика'", "'Мир'")
content = content.replace('"Мировая политика"', '"Мир"')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated web/js/app.js successfully!")
