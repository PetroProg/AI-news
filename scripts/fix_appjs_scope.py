import re

appjs_path = '/home/petroprog/Projects/news-ai/web/js/app.js'
with open(appjs_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match the entire normalizeCategory function
old_func_pattern = r'    function normalizeCategory\(rawCat, item\) \{.*?\n    \}'

new_func = '''    function normalizeCategory(rawCat, item) {
      const s = ((item && ((item.source || item.source_name || '') + ' ' + (item.source_url || '') + ' ' + (item.url || ''))) || '').toLowerCase();
      const t = ((item && (item.title || item.russian_title || '')) || '').toLowerCase();

      // Check tech keywords from title, source or rawCat
      const isTech = [
        'смартфон', 'телефон', 'складн', 'айфон', 'iphone', 'ipad', 'macbook',
        'huawei', 'xiaomi', 'samsung', 'honor', 'vivo', 'oppo', 'realme', 'oneplus', 'pixel',
        'гаджет', 'девайс', 'планшет', 'умные часы', 'смарт-час', 'наушник',
        'ноутбук', 'процессор', 'видеокарт', 'чип', 'geforce', 'radeon', 'rtx', 'gtx',
        'intel', 'amd', 'nvidia', 'qualcomm', 'snapdragon', 'дисплей', 'oled', 'amoled',
        'экран', 'ссд', 'ssd', 'железо', 'робот', 'boston dynamics', 'figure 0', 'флагманск', 'камера'
      ].some(k => t.includes(k) || (rawCat && String(rawCat).toLowerCase().includes(k)));

      if (item) {
        if (s.includes('opennet') || s.includes('devops') || s.includes('linux')) {
          return 'DevOps & Linux';
        }
        if (s.includes('formula1') || s.includes('formula 1') || s.includes('f1') || t.includes('formula 1') || t.includes('гран-при') || t.includes('ферстаппен') || t.includes('red bull')) {
          return 'F1';
        }
        if (s.includes('csgo') || s.includes('cs3') || s.includes('clashroyalepin') || s.includes('clashroyale') || s.includes('hltv') ||
            t.includes('cs2') || t.includes('cs:go') || t.includes('starladder') || t.includes('vitality') || t.includes('navi') || t.includes('s1mple') || t.includes('m0nesy') || t.includes('donk') || t.includes('clash royale') || t.includes('bcgame') || t.includes('fut')) {
          return 'CS2';
        }
        if (s.includes('marca') || s.includes('primera') || s.includes('sportsru') || s.includes('championat') || s.includes('matchpremier') || s.includes('sport-express') || s.includes('fabrizio') || s.includes('terrikon') || s.includes('uefa') ||
            t.includes('месси') || t.includes('messi') || t.includes('барселона') || t.includes('barcelona') || t.includes('интер майами') || t.includes('ла лига') || t.includes('лига чемпионов') || t.includes('лига наций') || t.includes('лига европы')) {
          return 'Футбол';
        }
        if (s.includes('rtsinfo') || s.includes('rtsarchives') || s.includes('blick_media') || s.includes('20minutesonline') || s.includes('instagram')) {
          return 'Swiss';
        }

        if (isTech) {
          return 'Технологии';
        }

        const hasUkrCore = ['украин', 'україна', 'киев', 'київ', 'днепр', 'дніпро', 'всу', 'зеленск', 'покровск', 'харьков', 'одесс', 'шахед', 'обстрел', 'дрон', 'бпла', 'пво', 'оккупант', 'фронт'].some(k => t.includes(k));
        if (!hasUkrCore && (
          t.includes('трамп') || t.includes('trump') || t.includes('байден') || t.includes('biden') ||
          t.includes('белый дом') || t.includes('конгресс сша') || t.includes('пентагон') ||
          t.includes('макрон') || t.includes('шольц') || t.includes('мерц') || t.includes('стармер') ||
          t.includes('нетаньяху') || t.includes('израиль') || t.includes('сектор газа') || t.includes('иран') ||
          t.includes('вучич') || t.includes('серби') || t.includes('орбан') || t.includes('венгри') ||
          t.includes('фицо') || t.includes('кндр') || t.includes('си цзиньпин') || t.includes('египет')
        )) {
          return 'Мир';
        }

        if (s.includes('novynaukr') || s.includes('novyna_ukr')) {
          return 'Украина';
        }
      }

      if (isTech) {
        return 'Технологии';
      }

      if (!rawCat) return 'IT';
      let c = cleanText(rawCat);
      c = c.replace(/^Категория\\s*[\(:]?/i, '').replace(/[\)]+$/g, '').trim();

      const lower = c.toLowerCase();
      if (lower.includes('технолог') || lower.includes('technology') || lower.includes('робот') || lower.includes('robot')) {
        return 'Технологии';
      }
      if (lower.includes('мировая политика') || lower.includes('политик') || lower.includes('мир') || lower.includes('world')) {
        return 'Мир';
      }
      if (lower.includes('футбол') || lower.includes('football') || lower.includes('soccer') || lower.includes('laliga') || lower.includes('ла лига')) {
        return 'Футбол';
      }
      if (lower.includes('formula 1') || lower.includes('formula1') || lower.includes(' f1') || lower.startsWith('f1') || lower.includes('формула 1') || lower.includes('формула-1') || lower.includes('red bull')) {
        return 'F1';
      }
      if (lower.includes('swiss') || lower.includes('швейцар')) {
        return 'Swiss';
      }
      if (lower.includes('gaming') || lower.includes('игры') || lower.includes('sport') || lower.includes('киберспорт') || lower.includes('csgo') || lower.includes('navi') || lower.includes('vitality') || lower.includes('starladder') || lower.includes('cs2')) {
        return 'CS2';
      }
      if (lower.includes('украин') || lower.includes('україна') || lower.includes('ukraine') || lower.includes('novynaukr')) {
        const hasCore = ['украин', 'україна', 'киев', 'київ', 'днепр', 'дніпро', 'всу', 'зеленск', 'покровск', 'харьков', 'одесс', 'шахед', 'обстрел', 'дрон', 'бпла', 'пво', 'оккупант', 'фронт'].some(k => t.includes(k));
        const isUkrSrc = ['pravda.com.ua', 'liga.net', 'novynaukr', 'украин', 'украина', 'україна'].some(k => s.includes(k));
        if (!hasCore && !isUkrSrc) {
          return 'Мир';
        }
        return 'Украина';
      }

      const map = {
        'мировая политика': 'Мир',
        'политика': 'Мир',
        'мир': 'Мир',
        'world': 'Мир',
        'новости мира': 'Мир',
        'международные': 'Мир',
        'футбол': 'Футбол',
        'football': 'Футбол',
        'soccer': 'Футбол',
        'f1': 'F1',
        'formula 1': 'F1',
        'формула 1': 'F1',
        'swiss': 'Swiss',
        'швейцария': 'Swiss',
        'технологии': 'Технологии',
        'technology': 'Технологии',
        'технология': 'Технологии',
        'technologies': 'Технологии',
        'роботы': 'Технологии',
        'робототехника': 'Технологии',
        'it': 'IT',
        'it & аналитика': 'IT',
        'it-аналитик': 'IT',
        'it аналитик': 'IT',
        'development': 'IT',
        'dev': 'IT',
        'programming': 'IT',
        'разработка': 'IT',
        'языки программирования': 'IT',
        'linux': 'DevOps & Linux',
        'linux & infrastructure': 'DevOps & Linux',
        'devops & linux': 'DevOps & Linux',
        'devops': 'DevOps & Linux',
        'gaming': 'CS2',
        'cs2': 'CS2',
        'игры & киберспорт': 'CS2',
        'игры и киберспорт': 'CS2',
        'ai': 'AI & Нейросети',
        'ai & нейросети': 'AI & Нейросети',
        'искусственный интеллект': 'AI & Нейросети',
        'нейросети': 'AI & Нейросети',
        'science': 'Наука',
        'lifestyle': 'Тренды & Стиль',
        'украина': 'Украина',
        'україна': 'Украина',
        'ukraine': 'Украина'
      };

      if (map[lower]) return map[lower];
      if (lower.includes('linux') || lower.includes('devops') || lower.includes('opennet') || lower.includes('инфраструктур') || lower.includes('сервер')) return 'DevOps & Linux';
      if (lower.includes('ai') || lower.includes('нейро') || lower.includes('интеллект')) return 'AI & Нейросети';
      if (lower.includes('аналитик') || lower.includes('dev') || lower.includes('программир') || lower.includes('разработ') || lower.includes('it')) return 'IT';
      return 'IT';
    }'''

match = re.search(old_func_pattern, content, flags=re.DOTALL)
if match:
    content = content[:match.start()] + new_func + content[match.end():]
    with open(appjs_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced normalizeCategory in web/js/app.js!")
else:
    print("Could not match old_func_pattern!")

# Update web/index.html script version
html_path = '/home/petroprog/Projects/news-ai/web/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

new_html_content = re.sub(
    r'js/app\.js\?v=[^\'"]+',
    'js/app.js?v=2026_10_13_fix_cat_v22',
    html_content
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html_content)

print("Successfully updated web/index.html cache-busting version!")
