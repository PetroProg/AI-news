/**
 * Registry of all 10 AI News categories, thematic accents, image pools,
 * text sanitization helpers, and article eligibility / categorization logic.
 */

export const CATEGORIES = [
  {
    slug: 'ukraine',
    name: 'Украина',
    shortName: 'Украина',
    group: 'geo',
    groupTitle: 'Гео & События',
    emoji: '🇺🇦',
    accent: 'sky',
    accentHex: '#38bdf8',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/35',
    activeChipClass: 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/25',
    chipClass: 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border-sky-500/30',
    defaultMinScore: 5.1,
    hasWidget: true,
    widgetLabel: '24h Сводка ПВО',
    searchPlaceholder: 'Поиск в «Украина» (события, регионы, ПВО, энергетика)...',
    tags: [
      { id: 'all', label: 'Все проверенные' },
      { id: 'дніпро', label: '🎯 Дніпро' },
      { id: 'oon_nato', label: '🏛️ ООН / НАТО' },
      { id: 'tck', label: '🎖️ ТЦК' },
      { id: 'energy', label: '⚡ Энергетика' },
      { id: 'pvo', label: '🛡️ Сводка ПВО' },
    ],
  },
  {
    slug: 'world',
    name: 'Мир',
    shortName: 'Мир',
    group: 'geo',
    groupTitle: 'Гео & События',
    emoji: '🌐',
    accent: 'indigo',
    accentHex: '#818cf8',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35',
    activeChipClass: 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/25',
    chipClass: 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    defaultMinScore: 5.1,
    hasWidget: false,
    widgetLabel: '',
    searchPlaceholder: 'Поиск в «Мир» (страны, геополитика, космос, лидеры)...',
    tags: [
      { id: 'all', label: 'Все' },
      { id: 'сша', label: '🇺🇸 США' },
      { id: 'европа', label: '🇪🇺 Европа' },
      { id: 'космос', label: '🚀 Космос' },
      { id: 'ближний восток', label: '🌍 Ближний Восток' },
    ],
  },
  {
    slug: 'swiss',
    name: 'Swiss',
    shortName: 'Swiss',
    group: 'geo',
    groupTitle: 'Гео & События',
    emoji: '🇨🇭',
    accent: 'rose',
    accentHex: '#fb7185',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
    activeChipClass: 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/25',
    chipClass: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30',
    defaultMinScore: 5.1,
    hasWidget: false,
    widgetLabel: '',
    searchPlaceholder: 'Поиск в «Swiss» (Швейцария, кантоны, RTS, Blick)...',
    tags: [],
  },
  {
    slug: 'ai',
    name: 'AI & Нейросети',
    shortName: 'AI',
    group: 'tech',
    groupTitle: 'Tech & AI',
    emoji: '🤖',
    accent: 'purple',
    accentHex: '#c084fc',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/35',
    activeChipClass: 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/25',
    chipClass: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30',
    defaultMinScore: 5.1,
    hasWidget: true,
    widgetLabel: 'AI Квиз',
    searchPlaceholder: 'Поиск в «AI & Нейросети» (LLM, OpenAI, Gemini, Claude, Ollama)...',
    tags: [
      { id: 'all', label: 'Все' },
      { id: 'openai', label: 'OpenAI / GPT' },
      { id: 'gemini', label: 'Google Gemini' },
      { id: 'claude', label: 'Claude' },
      { id: 'ollama', label: 'Local LLM / Ollama' },
    ],
  },
  {
    slug: 'it',
    name: 'IT',
    shortName: 'IT',
    group: 'tech',
    groupTitle: 'Tech & AI',
    emoji: '💻',
    accent: 'cyan',
    accentHex: '#22d3ee',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/35',
    activeChipClass: 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/25',
    chipClass: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    defaultMinScore: 7.0,
    hasWidget: true,
    widgetLabel: 'Языки & Квиз',
    searchPlaceholder: 'Поиск в «IT» (языки, фреймворки, архитектура)...',
    tags: [
      { id: 'all', label: 'Все языки' },
      { id: 'python', label: '🐍 Python' },
      { id: 'rust', label: '🦀 Rust' },
      { id: 'go', label: '🐹 Go' },
      { id: 'typescript', label: '🔷 TS/JS' },
      { id: 'c++', label: '⚡ C++' },
      { id: 'mojo', label: '🔥 Mojo' },
      { id: 'zig', label: '⚡ Zig' },
      { id: 'java', label: '☕ Java' },
      { id: 'c#', label: '🎯 C#' },
      { id: 'php', label: '🐘 PHP' },
      { id: 'kotlin', label: '🍏 Kotlin/Swift' },
    ],
  },
  {
    slug: 'tech',
    name: 'Технологии',
    shortName: 'Техно',
    group: 'tech',
    groupTitle: 'Tech & AI',
    emoji: '💡',
    accent: 'teal',
    accentHex: '#2dd4bf',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/35',
    activeChipClass: 'bg-teal-500 text-slate-950 border-teal-400 shadow-md shadow-teal-500/25',
    chipClass: 'bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border-teal-500/30',
    defaultMinScore: 5.1,
    hasWidget: false,
    widgetLabel: '',
    searchPlaceholder: 'Поиск в «Технологии» (смартфоны, чипы, NVIDIA, роботы)...',
    tags: [
      { id: 'all', label: 'Все' },
      { id: 'смартфон', label: '📱 Смартфоны' },
      { id: 'nvidia', label: '🟢 NVIDIA / GPU' },
      { id: 'apple', label: '🍎 Apple' },
      { id: 'робот', label: '🤖 Роботы' },
    ],
  },
  {
    slug: 'devops',
    name: 'DevOps & Linux',
    shortName: 'DevOps',
    group: 'tech',
    groupTitle: 'Tech & AI',
    emoji: '🐧',
    accent: 'amber',
    accentHex: '#fbbf24',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
    activeChipClass: 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25',
    chipClass: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30',
    defaultMinScore: 5.1,
    hasWidget: true,
    widgetLabel: 'Linux Квиз',
    searchPlaceholder: 'Поиск в «DevOps & Linux» (ядро, Docker, K8s, серверы)...',
    tags: [
      { id: 'all', label: 'Все' },
      { id: 'linux', label: '🐧 Ядро Linux' },
      { id: 'docker', label: '🐳 Docker / K8s' },
      { id: 'ubuntu', label: 'Ubuntu / Debian' },
    ],
  },
  {
    slug: 'football',
    name: 'Футбол',
    shortName: 'Футбол',
    group: 'sports',
    groupTitle: 'Спорт & Киберспорт',
    emoji: '⚽',
    accent: 'emerald',
    accentHex: '#34d399',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    activeChipClass: 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/25',
    chipClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    defaultMinScore: 8.0,
    hasWidget: true,
    widgetLabel: 'Таблицы и Матчи',
    searchPlaceholder: 'Поиск в «Футбол» (Барселона, Месси, Ла Лига, ЛЧ)...',
    tags: [
      { id: 'all', label: 'Все новости' },
      { id: 'месси', label: '🐐 Месси' },
      { id: 'барселона', label: '🔵🔴 Барселона' },
      { id: 'испания', label: '🇪🇸 Испания' },
      { id: 'интер майами', label: '🦩 Интер Майами' },
    ],
  },
  {
    slug: 'f1',
    name: 'F1',
    shortName: 'F1',
    group: 'sports',
    groupTitle: 'Спорт & Киберспорт',
    emoji: '🏎️',
    accent: 'red',
    accentHex: '#f87171',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/35',
    activeChipClass: 'bg-red-600 text-white border-red-400 shadow-md shadow-red-600/25',
    chipClass: 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30',
    defaultMinScore: 5.1,
    hasWidget: true,
    widgetLabel: 'Пилоты & Гран-при',
    searchPlaceholder: 'Поиск в «F1» (Verstappen, Red Bull, Leclerc, Hamilton)...',
    tags: [
      { id: 'all', label: 'Все F1' },
      { id: 'red bull', label: '🐂 Red Bull' },
      { id: 'verstappen', label: '🦁 Verstappen' },
      { id: 'leclerc', label: '🐎 Leclerc' },
      { id: 'hamilton', label: '⚡ Hamilton' },
      { id: 'champion', label: '🏆 Champion' },
    ],
  },
  {
    slug: 'cs2',
    name: 'CS2',
    shortName: 'CS2',
    group: 'sports',
    groupTitle: 'Спорт & Киберспорт',
    emoji: '🎮',
    accent: 'orange',
    accentHex: '#fb923c',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/35',
    activeChipClass: 'bg-orange-500 text-slate-950 border-orange-400 shadow-md shadow-orange-500/25',
    chipClass: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border-orange-500/30',
    defaultMinScore: 7.0,
    hasWidget: true,
    widgetLabel: 'HLTV Топ-20',
    searchPlaceholder: 'Поиск в «CS2» (s1mple, NaVi, Vitality, турниры)...',
    tags: [
      { id: 'all', label: 'Все CS2' },
      { id: 's1mple', label: '⭐ s1mple' },
      { id: 'navi', label: '💛 NaVi' },
      { id: 'bcgame', label: '🎲 BC.Game' },
      { id: 'fut', label: '🔥 FUT' },
    ],
  },
];

export const CATEGORY_GROUPS = [
  { id: 'geo', title: 'Гео & События', emoji: '🌍' },
  { id: 'tech', title: 'Tech & AI', emoji: '🧠' },
  { id: 'sports', title: 'Спорт & Киберспорт', emoji: '🏆' },
];

export const THEMATIC_IMAGES = {
  csgo: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  ],
  ukraine: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=800&q=80',
  ],
  linux: [
    'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
  ],
  dev: [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  ],
  ai: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
  ],
  swiss: [
    'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
  ],
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
  ],
  politics: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=800&q=80',
  ],
  football: [
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=85',
  ],
  f1: [
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1574776215779-114cb9f6eb39?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=85',
  ],
};

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getCategoryByName(name) {
  const lower = String(name || '').toLowerCase();
  return CATEGORIES.find((c) => c.name.toLowerCase() === lower) || null;
}

export function cleanText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\*\*|__/g, '')
    .replace(/\*|_/g, '')
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF\u2B00-\u2BFF\u2190-\u21FF\u2300-\u23FF\uFE00-\uFE0F\u200D\u200B-\u200F]/g, '')
    .replace(/^(?:FR|TR|UA|EU|RU|DK|BR|US|DE|PL|KZ|NA|SA)\s+/i, '')
    .replace(/\b(?:eu|ua|fr|tr|ru|dk|br|us)\s+(vitality|navi|spirit|astralis|furia|faze|mouz|falcons|g2|virtus\.pro|heroic|liquid|complexity|mongolz|aurora|xantares|zywoo|s1mple|donk|m0nesy)\b/gi, '$1')
    .replace(/\s+это$/i, '')
    .replace(/^[ \t\-\:\,\.\!\?\|—–«»\"]+/, '')
    .replace(/[ \t\-\:\,\|—–«»\"]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeUrl(url, fallback = '#') {
  if (!url) return fallback;
  const trimmed = String(url).trim();
  if (!trimmed) return fallback;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('http://') || lower.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return fallback;
}

export function formatShortSummary(text) {
  if (!text) return 'Краткое резюме формируется.';
  const clean = cleanText(text).trim();
  const sentences = clean.match(/(?:[^.!?]|\d\.\d)+[.!?]+(?:\s|$)/g);
  if (sentences && sentences.length > 0) {
    return sentences.slice(0, 3).join('').trim();
  }
  if (clean.length > 220) {
    return `${clean.slice(0, 220).replace(/\s+[^\s]*$/, '')}...`;
  }
  return clean;
}

export function normalizeCategory(rawCat, item) {
  const s = ((item && ((item.source || item.source_name || '') + ' ' + (item.source_url || '') + ' ' + (item.url || ''))) || '').toLowerCase();
  const t = ((item && (item.title || item.russian_title || '')) || '').toLowerCase();

  const isTech = [
    'смартфон', 'телефон', 'складн', 'айфон', 'iphone', 'ipad', 'macbook',
    'huawei', 'xiaomi', 'samsung', 'honor', 'vivo', 'oppo', 'realme', 'oneplus', 'pixel',
    'гаджет', 'девайс', 'планшет', 'умные часы', 'смарт-час', 'наушник',
    'ноутбук', 'процессор', 'видеокарт', 'чип', 'geforce', 'radeon', 'rtx', 'gtx',
    'intel', 'amd', 'nvidia', 'qualcomm', 'snapdragon', 'дисплей', 'oled', 'amoled',
    'экран', 'ссд', 'ssd', 'железо', 'робот', 'boston dynamics', 'figure 0', 'флагманск', 'камера',
  ].some((k) => t.includes(k) || (rawCat && String(rawCat).toLowerCase().includes(k)));

  if (item) {
    if (s.includes('opennet') || s.includes('devops') || s.includes('linux')) {
      return 'DevOps & Linux';
    }
    if (s.includes('formula1') || s.includes('formula 1') || s.includes('f1') || t.includes('formula 1') || t.includes('гран-при') || t.includes('ферстаппен') || t.includes('red bull')) {
      return 'F1';
    }
    if (
      s.includes('csgo') || s.includes('cs3') || s.includes('clashroyalepin') || s.includes('clashroyale') || s.includes('hltv') ||
      t.includes('cs2') || t.includes('cs:go') || t.includes('starladder') || t.includes('vitality') || t.includes('navi') || t.includes('s1mple') || t.includes('m0nesy') || t.includes('donk') || t.includes('clash royale') || t.includes('bcgame') || t.includes('fut')
    ) {
      return 'CS2';
    }
    if (
      s.includes('marca') || s.includes('primera') || s.includes('sportsru') || s.includes('championat') || s.includes('matchpremier') || s.includes('sport-express') || s.includes('fabrizio') || s.includes('terrikon') || s.includes('uefa') ||
      t.includes('месси') || t.includes('messi') || t.includes('барселона') || t.includes('barcelona') || t.includes('интер майами') || t.includes('ла лига') || t.includes('лига чемпионов') || t.includes('лига наций') || t.includes('лига европы')
    ) {
      return 'Футбол';
    }
    if (s.includes('rtsinfo') || s.includes('rtsarchives') || s.includes('blick_media') || s.includes('20minutesonline') || s.includes('instagram')) {
      return 'Swiss';
    }
    if (isTech) {
      return 'Технологии';
    }

    const hasUkrCore = ['украин', 'україна', 'киев', 'київ', 'днепр', 'дніпро', 'всу', 'зеленск', 'покровск', 'харьков', 'одесс', 'шахед', 'обстрел', 'дрон', 'бпла', 'пво', 'оккупант', 'фронт'].some((k) => t.includes(k));
    if (
      !hasUkrCore &&
      (
        t.includes('трамп') || t.includes('trump') || t.includes('байден') || t.includes('biden') ||
        t.includes('белый дом') || t.includes('конгресс сша') || t.includes('пентагон') ||
        t.includes('макрон') || t.includes('шольц') || t.includes('мерц') || t.includes('стармер') ||
        t.includes('нетаньяху') || t.includes('израиль') || t.includes('сектор газа') || t.includes('иран') ||
        t.includes('вучич') || t.includes('серби') || t.includes('орбан') || t.includes('венгри') ||
        t.includes('фицо') || t.includes('кндр') || t.includes('си цзиньпин') || t.includes('египет')
      )
    ) {
      return 'Мир';
    }
    if (s.includes('novynaukr') || s.includes('novyna_ukr')) {
      return 'Украина';
    }
  }

  if (isTech) return 'Технологии';
  if (!rawCat) return 'IT';

  const c = cleanText(rawCat).replace(/^Категория\s*[\(:]?/i, '').replace(/[\)]+$/g, '').trim();
  const lower = c.toLowerCase();

  if (lower.includes('технолог') || lower.includes('technology') || lower.includes('робот') || lower.includes('robot')) return 'Технологии';
  if (lower.includes('мировая политика') || lower.includes('политик') || lower.includes('мир') || lower.includes('world')) return 'Мир';
  if (lower.includes('футбол') || lower.includes('football') || lower.includes('soccer') || lower.includes('laliga') || lower.includes('ла лига')) return 'Футбол';
  if (lower.includes('formula 1') || lower.includes('formula1') || lower.includes(' f1') || lower.startsWith('f1') || lower.includes('формула 1') || lower.includes('формула-1') || lower.includes('red bull')) return 'F1';
  if (lower.includes('swiss') || lower.includes('швейцар')) return 'Swiss';
  if (lower.includes('gaming') || lower.includes('игры') || lower.includes('sport') || lower.includes('киберспорт') || lower.includes('csgo') || lower.includes('navi') || lower.includes('vitality') || lower.includes('starladder') || lower.includes('cs2')) return 'CS2';
  if (lower.includes('украин') || lower.includes('україна') || lower.includes('ukraine') || lower.includes('novynaukr')) {
    const hasCore = ['украин', 'україна', 'киев', 'київ', 'днепр', 'дніпро', 'всу', 'зеленск', 'покровск', 'харьков', 'одесс', 'шахед', 'обстрел', 'дрон', 'бпла', 'пво', 'оккупант', 'фронт'].some((k) => t.includes(k));
    const isUkrSrc = ['pravda.com.ua', 'liga.net', 'novynaukr', 'украин', 'украина', 'україна'].some((k) => s.includes(k));
    if (!hasCore && !isUkrSrc) return 'Мир';
    return 'Украина';
  }
  if (lower.includes('linux') || lower.includes('devops') || lower.includes('opennet') || lower.includes('инфраструктур') || lower.includes('сервер')) return 'DevOps & Linux';
  if (lower.includes('ai') || lower.includes('нейро') || lower.includes('интеллект')) return 'AI & Нейросети';
  if (lower.includes('аналитик') || lower.includes('dev') || lower.includes('программир') || lower.includes('разработ') || lower.includes('it')) return 'IT';
  return 'IT';
}

export function getCategoryFallbackImage(categoryName, index = 0) {
  const c = (categoryName || '').toLowerCase();
  let pool = THEMATIC_IMAGES.tech;
  if (c === 'футбол' || c.includes('football')) pool = THEMATIC_IMAGES.football;
  else if (c === 'f1' || c.includes('формул') || c.includes('formula')) pool = THEMATIC_IMAGES.f1;
  else if (c === 'swiss' || c.includes('швейцар')) pool = THEMATIC_IMAGES.swiss;
  else if (c === 'cs2' || c.includes('игры') || c.includes('киберспорт')) pool = THEMATIC_IMAGES.csgo;
  else if (c.includes('украин') || c.includes('ukraine')) pool = THEMATIC_IMAGES.ukraine;
  else if (c.includes('linux') || c.includes('devops')) pool = THEMATIC_IMAGES.linux;
  else if (c.includes('ai') || c.includes('нейро')) pool = THEMATIC_IMAGES.ai;
  else if (c.includes('it') || c.includes('разработ')) pool = THEMATIC_IMAGES.dev;
  else if (c.includes('мир') || c.includes('политик')) pool = THEMATIC_IMAGES.politics;
  return pool[Math.abs(index) % pool.length];
}

export function upgradeImageUrl(url) {
  if (!url) return '';
  let cleanUrl = String(url).replace(/&amp;/g, '&');
  if (cleanUrl.includes('guim.co.uk')) {
    const m = cleanUrl.match(/guim\.co\.uk\/(?:img\/)?media\/([^\?#]+)/);
    if (m) return `https://media.guim.co.uk/${m[1]}`;
  }
  if (cleanUrl.includes('ichef.bbci.co.uk')) {
    return cleanUrl.replace(/\/ace\/standard\/\d+\//, '/ace/standard/1024/');
  }
  cleanUrl = cleanUrl.replace(/_\d+x\d+\.(jpe?g|png|webp)/i, '.$1');
  cleanUrl = cleanUrl.replace(/([?&](?:w|width|size|resize)=)\d+/i, '$11200');
  cleanUrl = cleanUrl.replace(/\/resize\/\d+\//i, '/resize/1200/');
  return cleanUrl;
}

export function getArticleImage(article, index = 0) {
  if (article.image_url) return upgradeImageUrl(article.image_url);
  if (article.raw_content) {
    const match = article.raw_content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return upgradeImageUrl(match[1]);
    const posterMatch = article.raw_content.match(/<video[^>]+poster=["']([^"']+)["']/i);
    if (posterMatch && posterMatch[1]) return upgradeImageUrl(posterMatch[1]);
  }
  const catName = article._displayCategory || normalizeCategory(article.category, article);
  return getCategoryFallbackImage(catName, Math.abs((article.id || 0) + index));
}

export function isArticlePriority(article, customKeywords = []) {
  const fullText = `${article.title || ''} ${article.summary || ''} ${article.why_it_matters || ''}`.toLowerCase();
  if (article.is_priority) return true;
  const defaults = ['simple', 's1mple', 'navi', 'bcgame', 'bc.game', 'fut', 'дніпро', 'днепр', 'оон', 'нато', 'nato', 'тцк'];
  const combined = [...defaults, ...(Array.isArray(customKeywords) ? customKeywords : [])];
  return combined.some((kw) => kw && fullText.includes(String(kw).toLowerCase()));
}

/**
 * Unified eligibility check driven by user settings (minScores & strictF1Filter).
 */
export function isArticleEligibleForDisplay(item, categorySlugOrAll, userSettings, subTag = 'all') {
  const rawCat = (item.category || '').toLowerCase();
  const displayCat = item._displayCategory || normalizeCategory(item.category, item);
  const itemCatObj = getCategoryByName(displayCat);
  const itemCatLower = displayCat.toLowerCase();
  const rawTitle = (item.title || '').toLowerCase();

  if (
    itemCatLower.includes('безопас') || itemCatLower.includes('cybersec') || itemCatLower.includes('security') ||
    rawCat.includes('безопас') || rawCat.includes('cybersec') || rawCat.includes('security') ||
    rawTitle.includes('уязвим') || rawTitle.includes('cve-') ||
    itemCatLower.includes('общие') || itemCatLower.includes('general tech')
  ) {
    return false;
  }

  const score = item.importance_score ? Number(item.importance_score) : 0;
  const minScores = (userSettings && userSettings.minScores) || {};

  // Exclude subjective opinion pieces, listicles, betting advice
  const summaryText = String(item.summary || item.short_summary || '').toLowerCase();
  const isOpinionListicle = [
    'победители и проигравшие', 'победителей и проигравших', 'winners and losers', 'winners & losers',
    'power rankings', 'рейтинг силы', 'кто впечатлил', 'кто разочаровал', 'уроки для беттеров',
    'уроков для беттеров', 'для беттеров', 'советы по ставкам', 'лучшие и худшие', 'худшие и лучшие',
    'season ticket', 'southwell', 'hereford',
  ].some((k) => rawTitle.includes(k) || summaryText.includes(k));
  if (isOpinionListicle) return false;

  // Never display untranslated Ukrainian characters in Russian interface
  if (/[ієїґІЄЇҐ]/.test(item.title || '') || /[ієїґІЄЇҐ]/.test(summaryText)) {
    return false;
  }
  if (!summaryText) return false;

  // Exclude women's football globally
  const fullText = `${item.title || ''} ${item.summary || ''} ${item.why_it_matters || ''} ${item.source || ''} ${item.url || ''}`.toLowerCase();
  if (itemCatLower.includes('футбол') || itemCatLower.includes('football')) {
    if (['женск', 'женщин', 'womens', "women's", 'female', 'wsl', 'lionesses', 'жфк'].some((w) => fullText.includes(w))) {
      return false;
    }
  }

  // Digest mode ('digest' / 'all')
  if (!categorySlugOrAll || categorySlugOrAll === 'digest' || categorySlugOrAll === 'all') {
    if (item.is_operational_alert) return false;
    if (itemCatObj && userSettings && userSettings.enabledCategories && userSettings.enabledCategories[itemCatObj.slug] === false) {
      return false;
    }
    const digestThreshold = Number(minScores.digest ?? 7.5);
    return score >= digestThreshold;
  }

  const targetObj = getCategoryBySlug(categorySlugOrAll) || getCategoryByName(categorySlugOrAll);
  if (!targetObj || displayCat.toLowerCase() !== targetObj.name.toLowerCase()) {
    return false;
  }

  const minCatScore = Number(minScores[targetObj.slug] ?? targetObj.defaultMinScore);
  if (score < minCatScore) return false;

  // Category-specific guards & tag filters
  if (targetObj.slug === 'cs2') {
    const sourceCombined = `${item.source || ''} ${item.source_url || ''} ${item.url || ''}`.toLowerCase();
    const isAllowedChannel = ['newcsgo', 'cs3news', 'clashroyalepin', 'clashroyale', 'hltv'].some((s) => sourceCombined.includes(s));
    if (!isAllowedChannel) return false;
    if (subTag && subTag !== 'all') {
      const tag = subTag.toLowerCase();
      if (tag === 's1mple' || tag === 'simple') {
        if (!fullText.includes('s1mple') && !fullText.includes('simple')) return false;
      } else if (tag === 'bcgame') {
        if (!fullText.includes('bcgame') && !fullText.includes('bc.game')) return false;
      } else if (tag === 'navi') {
        if (!fullText.includes('navi') && !fullText.includes('natus vincere') && !fullText.includes('нави')) return false;
      } else if (!fullText.includes(tag)) {
        return false;
      }
    }
  }

  if (targetObj.slug === 'it') {
    const isGamingItem = ['csgo', 'cs3', 'clashroyalepin', 'clashroyale', 'hltv'].some((s) => fullText.includes(s)) ||
      ['cs2', 'cs:go', 'vitality', 'starladder', 'navi', 's1mple'].some((k) => rawTitle.includes(k));
    if (isGamingItem) return false;

    if (subTag && subTag !== 'all') {
      const target = subTag.toLowerCase();
      if (target === 'python' && !fullText.includes('python') && !fullText.includes('питон') && !fullText.includes('fastapi') && !fullText.includes('django')) return false;
      if (target === 'rust' && !fullText.includes('rust') && !fullText.includes('раст') && !fullText.includes('cargo') && !fullText.includes('crates')) return false;
      if (target === 'go' && !fullText.includes('golang') && !fullText.includes(' go ') && !fullText.includes(' go,') && !fullText.includes('kubernetes') && !fullText.includes('docker')) return false;
      if (target === 'c++' && !fullText.includes('c++') && !fullText.includes('cpp') && !fullText.includes('си++')) return false;
      if (target === 'typescript' && !fullText.includes('typescript') && !fullText.includes('javascript') && !fullText.includes('ts') && !fullText.includes('js') && !fullText.includes('react') && !fullText.includes('node')) return false;
      if (target === 'mojo' && !fullText.includes('mojo')) return false;
      if (target === 'zig' && !fullText.includes('zig')) return false;
      if (target === 'java' && !fullText.includes('java') && !fullText.includes('spring')) return false;
      if (target === 'c#' && !fullText.includes('c#') && !fullText.includes('csharp') && !fullText.includes('.net') && !fullText.includes('dotnet') && !fullText.includes('unity')) return false;
      if (target === 'php' && !fullText.includes('php') && !fullText.includes('laravel') && !fullText.includes('symfony') && !fullText.includes('wordpress')) return false;
      if (target === 'kotlin' && !fullText.includes('kotlin') && !fullText.includes('swift') && !fullText.includes('android') && !fullText.includes('ios')) return false;
    }
  }

  if (targetObj.slug === 'ukraine') {
    if (item.is_operational_alert) return false;
    if (subTag && subTag !== 'all') {
      const tag = subTag.toLowerCase();
      if (tag === 'дніпро' || tag === 'днепр') {
        if (!fullText.includes('дніпр') && !fullText.includes('днепр')) return false;
      } else if (tag === 'oon_nato') {
        if (!fullText.includes('оон') && !fullText.includes('нато') && !fullText.includes('nato')) return false;
      } else if (tag === 'tck') {
        if (!fullText.includes('тцк') && !fullText.includes('военкомат') && !fullText.includes('мобілізац') && !fullText.includes('мобилизац')) return false;
      } else if (tag === 'energy') {
        if (!['энерг', 'енерг', 'свет', 'світл', 'блэкаут', 'блекаут', 'дтек', 'дтэк', 'укрэнерго', 'укренерго'].some((k) => fullText.includes(k))) return false;
      } else if (tag === 'pvo') {
        if (!['пво', 'збито', 'сбито', 'сбиты', 'повітряних сил', 'воздушных сил'].some((k) => fullText.includes(k))) return false;
      } else if (!fullText.includes(tag)) {
        return false;
      }
    }
  }

  if (targetObj.slug === 'f1') {
    if (subTag && subTag !== 'all') {
      const tag = subTag.toLowerCase();
      if (tag === 'red bull' && !fullText.includes('red bull') && !fullText.includes('ред булл')) return false;
      else if (tag === 'verstappen' && !fullText.includes('verstappen') && !fullText.includes('ферстаппен')) return false;
      else if (tag === 'leclerc' && !fullText.includes('leclerc') && !fullText.includes('леклер')) return false;
      else if (tag === 'hamilton' && !fullText.includes('hamilton') && !fullText.includes('хэмилтон') && !fullText.includes('хемилтон')) return false;
      else if (tag === 'champion' && !['champion', 'чемпион', 'титул', 'зачет', 'кубок'].some((k) => fullText.includes(k))) return false;
    } else if (!userSettings || userSettings.strictF1Filter !== false) {
      const hasPriorityKeywords = ['red bull', 'ред булл', 'verstappen', 'ферстаппен', 'leclerc', 'леклер', 'hamilton', 'хэмилтон', 'хемилтон', 'champion', 'чемпион', 'титул', 'f1', 'formula 1', 'формула'].some((k) => fullText.includes(k));
      if (!hasPriorityKeywords) return false;
    }
  }

  if (targetObj.slug === 'football') {
    const isNonFootballItem = [
      'cs2', 'cs:go', 'csgo', 'скин', 'скины', 'киберспорт', 'starladder', 'hltv', 'vitality', 's1mple', 'm0nesy', 'donk',
      'хокке', 'нхл', 'кхл', 'овечкин', 'шайб', 'теннис', 'медведев', 'баскетбол', 'нба', 'йокич', 'ufc', 'мма', 'бокс', 'нфл', 'корги',
    ].some((k) => rawTitle.includes(k) || summaryText.includes(k));
    if (isNonFootballItem) return false;

    if (subTag && subTag !== 'all') {
      const tag = subTag.toLowerCase();
      if (tag === 'месси' && !fullText.includes('месси') && !fullText.includes('messi')) return false;
      else if (tag === 'барселона' && !fullText.includes('барселона') && !fullText.includes('barcelona') && !fullText.includes('барса') && !fullText.includes('barca')) return false;
      else if (tag === 'испания' && !fullText.includes('испани') && !fullText.includes('spain') && !fullText.includes('ла лига') && !fullText.includes('laliga')) return false;
      else if (tag === 'интер майами' && !fullText.includes('интер майами') && !fullText.includes('inter miami') && !fullText.includes('майами')) return false;
    }
  }

  if (!['cs2', 'it', 'ukraine', 'f1', 'football'].includes(targetObj.slug) && subTag && subTag !== 'all') {
    if (!fullText.includes(subTag.toLowerCase())) return false;
  }

  return true;
}
