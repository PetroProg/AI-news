/**
 * 2nd Page: Settings & Control Center (#/settings/:section) — Mobile-First with all 4 sections:
 * 1. categories: Visibility, Order, Default Route, Card Density, Widgets toggle
 * 2. ai-filters: AI Importance Score Sliders & Custom Priority Keywords
 * 3. sources:    RSS / Telegram / Web Sources CRUD via /api/sources
 * 4. system:     System Stats, AI Engine Status, Retention Cleanup, Category Purge & PWA Cache Reset
 */

import { CATEGORIES, escapeHtml, sanitizeUrl } from '../config/categories.js';
import {
  createSource,
  deleteCategoryNews,
  deleteSource,
  fetchSources,
  fetchSystemStats,
  triggerOldNewsCleanup,
  updateSource,
} from '../core/api.js';
import { navigateTo } from '../core/router.js';
import {
  appState,
  getCategoryCountsMap,
  getOrderedCategories,
  removeCategoryArticlesLocally,
  resetSettingsToDefaults,
  saveSettings,
} from '../core/state.js';
import {
  clearPwaCaches,
  showDeleteConfirmModal,
  showToast,
  triggerPwaInstall,
} from '../components/modals.js';

const SETTINGS_SECTIONS = [
  { id: 'categories', icon: '🗂️', label: 'Категории и Вид' },
  { id: 'ai-filters', icon: '🎯', label: 'AI-пороги' },
  { id: 'sources', icon: '📡', label: 'Источники' },
  { id: 'system', icon: '🗄️', label: 'База и Система' },
];

let sourceTypeFilter = 'all';
let sourceSearchQuery = '';
let showAddSourceForm = false;

export function renderSettingsView(container, section = 'categories', { onRefreshNews } = {}) {
  if (!container) return;
  const activeSec = SETTINGS_SECTIONS.some((s) => s.id === section) ? section : 'categories';

  container.innerHTML = `
    <div class="space-y-4">
      <!-- Settings Header -->
      <section class="glass-panel rounded-3xl p-4 sm:p-5 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <button type="button" id="settings-back-btn"
            class="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shrink-0">
            ←
          </button>
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-sky-400">Страница настроек</span>
            <h1 class="text-lg sm:text-xl font-black text-white font-heading">⚙️ Центр управления AI News</h1>
          </div>
        </div>
        <span class="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
          ✓ Автосохранение
        </span>
      </section>

      <!-- Mobile Horizontal Section Switcher + Desktop Sidebar Layout -->
      <div class="flex flex-col lg:grid lg:grid-cols-12 gap-5 items-start">
        <!-- Navigation Menu -->
        <aside class="w-full lg:col-span-3">
          <nav class="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none glass-panel p-2 rounded-2xl lg:rounded-3xl border border-slate-800/90">
            ${SETTINGS_SECTIONS.map((sec) => {
              const isAct = sec.id === activeSec;
              return `
                <button type="button" data-sec-id="${sec.id}"
                  class="settings-nav-btn flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shrink-0 lg:w-full text-left transition-all ${
                    isAct
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                  }">
                  <span>${sec.icon}</span>
                  <span>${escapeHtml(sec.label)}</span>
                </button>
              `;
            }).join('')}
          </nav>
        </aside>

        <!-- Active Section Content -->
        <div id="settings-section-host" class="w-full lg:col-span-9 space-y-4"></div>
      </div>
    </div>
  `;

  container.querySelector('#settings-back-btn')?.addEventListener('click', () => navigateTo(''));
  container.querySelectorAll('.settings-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const secId = btn.getAttribute('data-sec-id');
      navigateTo(`settings/${secId}`);
    });
  });

  const host = container.querySelector('#settings-section-host');
  if (activeSec === 'categories') renderCategoriesSection(host);
  else if (activeSec === 'ai-filters') renderAiFiltersSection(host);
  else if (activeSec === 'sources') renderSourcesSection(host);
  else if (activeSec === 'system') renderSystemSection(host, { onRefreshNews });
}

// ==========================================
// SECTION 1: CATEGORIES & MOBILE VIEW
// ==========================================
function renderCategoriesSection(host) {
  const orderedAll = getOrderedCategories(true);
  const counts = getCategoryCountsMap();
  const s = appState.settings;

  host.innerHTML = `
    <div class="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800/90 space-y-5">
      <div>
        <h2 class="text-base font-black text-white font-heading">🗂️ Видимость и порядок категорий</h2>
        <p class="text-xs text-slate-400 mt-0.5">Скрывайте лишние разделы и меняйте порядок отображения на витрине.</p>
      </div>

      <div class="space-y-2">
        ${orderedAll.map((cat, idx) => {
          const enabled = s.enabledCategories[cat.slug] !== false;
          const cnt = counts[cat.slug] || 0;
          return `
            <div class="flex items-center justify-between gap-2 p-3 rounded-2xl border transition-all ${
              enabled ? 'bg-slate-950/75 border-slate-800' : 'bg-slate-950/35 border-slate-900 opacity-60'
            }">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-lg shrink-0">${cat.emoji}</span>
                <div class="min-w-0">
                  <div class="text-xs sm:text-sm font-bold text-white truncate">${escapeHtml(cat.name)}</div>
                  <div class="text-[10px] text-slate-400">${escapeHtml(cat.groupTitle)} • ${cnt} статей</div>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button type="button" data-move-up="${cat.slug}" ${idx === 0 ? 'disabled' : ''}
                  class="cat-move-up w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-30" title="Выше">↑</button>
                <button type="button" data-move-down="${cat.slug}" ${idx === orderedAll.length - 1 ? 'disabled' : ''}
                  class="cat-move-down w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 disabled:opacity-30" title="Ниже">↓</button>
                <button type="button" data-toggle-cat="${cat.slug}" role="switch" aria-checked="${enabled}"
                  class="cat-toggle-btn w-12 h-7 rounded-full p-1 transition-colors flex items-center ${enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}">
                  <span class="w-5 h-5 rounded-full bg-white shadow"></span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Display & Mobile Preferences -->
    <div class="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800/90 space-y-4">
      <h2 class="text-base font-black text-white font-heading">📱 Внешний вид и Телефон</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="space-y-1.5 block">
          <span class="text-xs font-bold text-slate-300">Стартовая страница</span>
          <select id="pref-default-route" class="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none">
            <option value="home" ${s.defaultRoute === 'home' ? 'selected' : ''}>🏠 Главная витрина (Все категории)</option>
            <option value="digest" ${s.defaultRoute === 'digest' ? 'selected' : ''}>🔥 Топ-Дайджест дня</option>
            ${CATEGORIES.map((c) => `
              <option value="category/${c.slug}" ${s.defaultRoute === `category/${c.slug}` ? 'selected' : ''}>${c.emoji} ${escapeHtml(c.name)}</option>
            `).join('')}
          </select>
        </label>

        <label class="space-y-1.5 block">
          <span class="text-xs font-bold text-slate-300">Вид карточек (особенно на телефоне)</span>
          <select id="pref-card-density" class="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none">
            <option value="comfortable" ${s.cardDensity === 'comfortable' ? 'selected' : ''}>🖼️ Полные карточки с обложкой</option>
            <option value="compact" ${s.cardDensity === 'compact' ? 'selected' : ''}>📱 Компактный список (быстрый скролл)</option>
          </select>
        </label>

        <label class="space-y-1.5 block">
          <span class="text-xs font-bold text-slate-300">Новостей в блоке на Витрине</span>
          <select id="pref-portal-count" class="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none">
            <option value="2" ${Number(s.portalCardsPerCategory) === 2 ? 'selected' : ''}>2 новости на категорию</option>
            <option value="3" ${Number(s.portalCardsPerCategory) === 3 ? 'selected' : ''}>3 новости на категорию</option>
            <option value="4" ${Number(s.portalCardsPerCategory) === 4 ? 'selected' : ''}>4 новости на категорию</option>
          </select>
        </label>

        <label class="space-y-1.5 block">
          <span class="text-xs font-bold text-slate-300">Автообновление ленты</span>
          <select id="pref-auto-refresh" class="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none">
            <option value="0" ${Number(s.autoRefreshMinutes) === 0 ? 'selected' : ''}>Выключено</option>
            <option value="1" ${Number(s.autoRefreshMinutes) === 1 ? 'selected' : ''}>Каждую 1 минуту</option>
            <option value="5" ${Number(s.autoRefreshMinutes) === 5 ? 'selected' : ''}>Каждые 5 минут</option>
            <option value="15" ${Number(s.autoRefreshMinutes) === 15 ? 'selected' : ''}>Каждые 15 минут</option>
          </select>
        </label>
      </div>

      <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-950/75 border border-slate-800">
        <div>
          <div class="text-xs font-bold text-white">Виджеты аналитики и квизы</div>
          <div class="text-[11px] text-slate-400">Таблицы Футбола, F1, рейтинг HLTV, сводка ПВО и AI-квизы</div>
        </div>
        <button type="button" id="pref-toggle-widgets" role="switch" aria-checked="${s.showAnalyticsWidgets}"
          class="w-12 h-7 rounded-full p-1 transition-colors flex items-center ${s.showAnalyticsWidgets ? 'bg-sky-500 justify-end' : 'bg-slate-700 justify-start'}">
          <span class="w-5 h-5 rounded-full bg-white shadow"></span>
        </button>
      </div>
    </div>
  `;

  // Bind reorder & toggles
  host.querySelectorAll('.cat-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-toggle-cat');
      const cur = appState.settings.enabledCategories[slug] !== false;
      saveSettings({ enabledCategories: { [slug]: !cur } });
      renderCategoriesSection(host);
    });
  });

  const moveOrder = (slug, dir) => {
    const arr = [...appState.settings.categoryOrder];
    const idx = arr.indexOf(slug);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    saveSettings({ categoryOrder: arr });
    renderCategoriesSection(host);
  };

  host.querySelectorAll('.cat-move-up').forEach((btn) => {
    btn.addEventListener('click', () => moveOrder(btn.getAttribute('data-move-up'), -1));
  });
  host.querySelectorAll('.cat-move-down').forEach((btn) => {
    btn.addEventListener('click', () => moveOrder(btn.getAttribute('data-move-down'), 1));
  });

  host.querySelector('#pref-default-route')?.addEventListener('change', (e) => {
    saveSettings({ defaultRoute: e.target.value });
    showToast('Сохранено', 'Стартовая страница обновлена', 'success');
  });
  host.querySelector('#pref-card-density')?.addEventListener('change', (e) => {
    saveSettings({ cardDensity: e.target.value });
    showToast('Сохранено', 'Плотность карточек обновлена', 'success');
  });
  host.querySelector('#pref-portal-count')?.addEventListener('change', (e) => {
    saveSettings({ portalCardsPerCategory: Number(e.target.value) });
    showToast('Сохранено', 'Количество превью на витрине обновлено', 'success');
  });
  host.querySelector('#pref-auto-refresh')?.addEventListener('change', (e) => {
    saveSettings({ autoRefreshMinutes: Number(e.target.value) });
    showToast('Сохранено', 'Интервал обновления изменен', 'success');
  });
  host.querySelector('#pref-toggle-widgets')?.addEventListener('click', () => {
    saveSettings({ showAnalyticsWidgets: !appState.settings.showAnalyticsWidgets });
    renderCategoriesSection(host);
  });
}

// ==========================================
// SECTION 2: AI SCORE THRESHOLDS & KEYWORDS
// ==========================================
function renderAiFiltersSection(host) {
  const s = appState.settings;
  const sliders = [
    { key: 'digest', label: '🔥 Топ-Дайджест дня', desc: 'Минимальная оценка для общей ленты Дайджеста', val: s.minScores.digest ?? 7.5 },
    { key: 'football', label: '⚽ Футбол', desc: 'Рекомендуется ≥ 8.0 для отсева проходных заметок', val: s.minScores.football ?? 8.0 },
    { key: 'it', label: '💻 IT & Разработка', desc: 'Строгий отбор технических статей', val: s.minScores.it ?? 7.0 },
    { key: 'cs2', label: '🎮 CS2 & Киберспорт', desc: 'Фильтр матчей, турниров и решафлов', val: s.minScores.cs2 ?? 7.0 },
    { key: 'ukraine', label: '🇺🇦 Украина', desc: 'Проверенные новости (без микро-сводок)', val: s.minScores.ukraine ?? 5.1 },
    { key: 'f1', label: '🏎️ Formula 1', desc: 'Гран-при, болиды и зачет пилотов', val: s.minScores.f1 ?? 5.1 },
    { key: 'ai', label: '🤖 AI & Нейросети', desc: 'Модели, релизы и исследования', val: s.minScores.ai ?? 5.1 },
  ];

  host.innerHTML = `
    <div class="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800/90 space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-base font-black text-white font-heading">🎯 Пороги важности нейросети (AI Score)</h2>
          <p class="text-xs text-slate-400 mt-0.5">Сдвиньте ползунок выше, чтобы видеть только самые важные новости.</p>
        </div>
        <button type="button" id="ai-reset-scores" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white">
          Сбросить пороги
        </button>
      </div>

      <div class="space-y-4">
        ${sliders.map((sl) => `
          <div class="p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div>
                <div class="text-xs sm:text-sm font-bold text-white">${sl.label}</div>
                <div class="text-[11px] text-slate-400">${sl.desc}</div>
              </div>
              <span id="score-val-${sl.key}" class="px-2.5 py-1 rounded-xl bg-sky-500/20 border border-sky-500/35 text-sky-300 font-mono text-xs font-black shrink-0">
                ${Number(sl.val).toFixed(1)}/10
              </span>
            </div>
            <input type="range" min="3.0" max="9.5" step="0.1" value="${Number(sl.val).toFixed(1)}"
              data-score-key="${sl.key}" class="ai-score-slider w-full accent-sky-400 cursor-pointer" />
          </div>
        `).join('')}
      </div>

      <div class="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800">
        <div>
          <div class="text-xs font-bold text-white">Строгий фокус F1 (Red Bull, Verstappen, Leclerc, Hamilton)</div>
          <div class="text-[11px] text-slate-400">Отключайте, чтобы видеть все новости автоспорта без фильтра пилотов</div>
        </div>
        <button type="button" id="toggle-f1-strict" role="switch" aria-checked="${s.strictF1Filter !== false}"
          class="w-12 h-7 rounded-full p-1 transition-colors flex items-center ${s.strictF1Filter !== false ? 'bg-red-500 justify-end' : 'bg-slate-700 justify-start'}">
          <span class="w-5 h-5 rounded-full bg-white shadow"></span>
        </button>
      </div>
    </div>

    <!-- Custom Priority Keywords -->
    <div class="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800/90 space-y-4">
      <div>
        <h2 class="text-base font-black text-white font-heading">⭐ Приоритетные ключевые слова</h2>
        <p class="text-xs text-slate-400 mt-0.5">Статьи с этими словами автоматически подсвечиваются золотой рамкой и звездой.</p>
      </div>

      <form id="kw-add-form" class="flex gap-2">
        <input id="kw-new-input" type="text" placeholder="Например: OpenAI, Киев, Ferrari..."
          class="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none" />
        <button type="submit" class="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shrink-0">Добавить</button>
      </form>

      <div class="flex flex-wrap gap-2">
        ${(s.customPriorityKeywords || []).map((kw) => `
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs font-bold">
            <span>⭐ ${escapeHtml(kw)}</span>
            <button type="button" data-del-kw="${escapeHtml(kw)}" class="del-kw-btn text-amber-400 hover:text-white ml-1">✕</button>
          </span>
        `).join('')}
      </div>
    </div>
  `;

  host.querySelectorAll('.ai-score-slider').forEach((slider) => {
    slider.addEventListener('input', (e) => {
      const key = slider.getAttribute('data-score-key');
      const val = Number(e.target.value);
      const badge = host.querySelector(`#score-val-${key}`);
      if (badge) badge.textContent = `${val.toFixed(1)}/10`;
      saveSettings({ minScores: { [key]: val } });
    });
  });

  host.querySelector('#ai-reset-scores')?.addEventListener('click', () => {
    const defaults = { digest: 7.5 };
    CATEGORIES.forEach((c) => { defaults[c.slug] = c.defaultMinScore; });
    saveSettings({ minScores: defaults, strictF1Filter: true });
    showToast('Пороги сброшены', 'Восстановлены рекомендуемые значения', 'info');
    renderAiFiltersSection(host);
  });

  host.querySelector('#toggle-f1-strict')?.addEventListener('click', () => {
    saveSettings({ strictF1Filter: appState.settings.strictF1Filter === false });
    renderAiFiltersSection(host);
  });

  host.querySelector('#kw-add-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = host.querySelector('#kw-new-input');
    const val = (inp && inp.value || '').trim().toLowerCase();
    if (!val) return;
    const current = appState.settings.customPriorityKeywords || [];
    if (!current.includes(val)) {
      saveSettings({ customPriorityKeywords: [...current, val] });
      showToast('Тег добавлен', `Добавлено слово «${val}»`, 'success');
    }
    renderAiFiltersSection(host);
  });

  host.querySelectorAll('.del-kw-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-del-kw');
      const next = (appState.settings.customPriorityKeywords || []).filter((k) => k !== target);
      saveSettings({ customPriorityKeywords: next });
      renderAiFiltersSection(host);
    });
  });
}

// ==========================================
// SECTION 3: NEWS SOURCES (RSS / TELEGRAM / WEB)
// ==========================================
async function renderSourcesSection(host, forceReload = false) {
  if (!appState.sourcesLoaded || forceReload) {
    host.innerHTML = `<div class="glass-panel rounded-3xl p-6 text-center text-xs text-slate-400">Загрузка списка источников из базы данных...</div>`;
    try {
      const data = await fetchSources();
      appState.sources = data.sources || [];
      appState.sourcesLoaded = true;
    } catch (err) {
      host.innerHTML = `<div class="glass-panel rounded-3xl p-6 text-center text-xs text-rose-300 border border-rose-500/30">Ошибка загрузки источников: ${escapeHtml(err.message)}</div>`;
      return;
    }
  }

  const allSources = appState.sources || [];
  const filtered = allSources.filter((src) => {
    if (sourceTypeFilter !== 'all' && src.source_type !== sourceTypeFilter) return false;
    if (sourceSearchQuery) {
      const q = sourceSearchQuery.toLowerCase();
      return `${src.name || ''} ${src.url || ''} ${src.description || ''}`.toLowerCase().includes(q);
    }
    return true;
  });

  host.innerHTML = `
    <div class="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800/90 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-base font-black text-white font-heading">📡 Источники новостей (${allSources.length})</h2>
          <p class="text-xs text-slate-400">Управление Telegram-каналами, RSS-лентами и сайтами</p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="src-toggle-add" class="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold">
            ${showAddSourceForm ? '✕ Скрыть форму' : '+ Добавить источник'}
          </button>
          <button type="button" id="src-reload-btn" class="p-2 rounded-xl bg-slate-900 border border-slate-700 text-sky-300" title="Обновить">↻</button>
        </div>
      </div>

      ${showAddSourceForm ? `
        <form id="src-create-form" class="p-4 rounded-2xl bg-slate-950/90 border border-sky-500/35 space-y-3">
          <div class="text-xs font-bold text-sky-300">Новый источник</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input id="src-new-name" type="text" required placeholder="Название (например: Хабр Python)"
              class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white" />
            <select id="src-new-type" class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
              <option value="rss">RSS / Atom</option>
              <option value="telegram">Telegram (@канал)</option>
              <option value="web">Web сайт</option>
            </select>
            <input id="src-new-url" type="text" required placeholder="https://... или @channel_name"
              class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white sm:col-span-2" />
            <select id="src-new-interval" class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
              <option value="15">Опрос каждые 15 мин</option>
              <option value="30">Опрос каждые 30 мин</option>
              <option value="60" selected>Опрос каждые 60 мин</option>
              <option value="180">Опрос каждые 3 часа</option>
            </select>
            <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold">Сохранить источник</button>
          </div>
        </form>
      ` : ''}

      <!-- Search & Type Filter -->
      <div class="flex flex-col sm:flex-row gap-2">
        <input id="src-search-input" type="text" value="${escapeHtml(sourceSearchQuery)}" placeholder="Поиск источника по имени или URL..."
          class="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none" />
        <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          ${[
            { id: 'all', label: 'Все' },
            { id: 'telegram', label: 'Telegram' },
            { id: 'rss', label: 'RSS' },
            { id: 'web', label: 'Web' },
          ].map((t) => `
            <button type="button" data-src-filter="${t.id}"
              class="src-filter-btn px-3 py-2 rounded-xl text-xs font-bold shrink-0 border ${
                sourceTypeFilter === t.id ? 'bg-sky-500 text-white border-sky-400' : 'bg-slate-900 text-slate-300 border-slate-800'
              }">${t.label}</button>
          `).join('')}
        </div>
      </div>

      <!-- Sources List (Mobile Cards) -->
      <div class="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        ${filtered.length === 0 ? `
          <div class="p-6 text-center text-xs text-slate-400">Источники не найдены</div>
        ` : filtered.map((src) => {
          const typeBadge = src.source_type === 'telegram'
            ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
            : src.source_type === 'rss'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
          return `
            <div class="p-3 rounded-2xl border bg-slate-950/75 border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="min-w-0 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${typeBadge}">${escapeHtml(src.source_type)}</span>
                  <span class="text-xs sm:text-sm font-bold text-white truncate">${escapeHtml(src.name)}</span>
                  <span class="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">${src.articles_count} статей</span>
                </div>
                <a href="${sanitizeUrl(src.url, '#')}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-slate-400 hover:text-sky-300 truncate block">${escapeHtml(src.url)}</a>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                <select data-src-interval="${src.id}" class="src-interval-select px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-200">
                  ${[15, 30, 60, 120, 360].map((m) => `<option value="${m}" ${src.fetch_interval_minutes === m ? 'selected' : ''}>${m} мин</option>`).join('')}
                </select>

                <button type="button" data-src-toggle="${src.id}" data-src-active="${src.is_active}"
                  class="src-toggle-btn w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${src.is_active ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}"
                  title="Включить / Отключить сбор">
                  <span class="w-5 h-5 rounded-full bg-white shadow"></span>
                </button>

                <button type="button" data-src-del="${src.id}" data-src-name="${escapeHtml(src.name)}"
                  class="src-del-btn p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400" title="Удалить источник">
                  ✕
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  host.querySelector('#src-toggle-add')?.addEventListener('click', () => {
    showAddSourceForm = !showAddSourceForm;
    renderSourcesSection(host);
  });
  host.querySelector('#src-reload-btn')?.addEventListener('click', () => renderSourcesSection(host, true));

  host.querySelector('#src-search-input')?.addEventListener('input', (e) => {
    sourceSearchQuery = e.target.value;
    renderSourcesSection(host);
  });

  host.querySelectorAll('.src-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      sourceTypeFilter = btn.getAttribute('data-src-filter');
      renderSourcesSection(host);
    });
  });

  host.querySelector('#src-create-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = host.querySelector('#src-new-name')?.value.trim();
    const source_type = host.querySelector('#src-new-type')?.value;
    const url = host.querySelector('#src-new-url')?.value.trim();
    const fetch_interval_minutes = Number(host.querySelector('#src-new-interval')?.value || 60);
    try {
      await createSource({ name, source_type, url, fetch_interval_minutes, is_active: true });
      showToast('Источник добавлен', name, 'success');
      showAddSourceForm = false;
      await renderSourcesSection(host, true);
    } catch (err) {
      showToast('Ошибка добавления', err.message, 'danger');
    }
  });

  host.querySelectorAll('.src-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.getAttribute('data-src-toggle'));
      const curActive = btn.getAttribute('data-src-active') === 'true';
      try {
        const res = await updateSource(id, { is_active: !curActive });
        if (res && res.source) {
          appState.sources = appState.sources.map((s) => (s.id === id ? res.source : s));
        }
        showToast(!curActive ? 'Источник включен' : 'Источник на паузе', '', 'info');
        renderSourcesSection(host);
      } catch (err) {
        showToast('Ошибка обновления', err.message, 'danger');
      }
    });
  });

  host.querySelectorAll('.src-interval-select').forEach((sel) => {
    sel.addEventListener('change', async (e) => {
      const id = Number(sel.getAttribute('data-src-interval'));
      const minutes = Number(e.target.value);
      try {
        const res = await updateSource(id, { fetch_interval_minutes: minutes });
        if (res && res.source) {
          appState.sources = appState.sources.map((s) => (s.id === id ? res.source : s));
        }
        showToast('Интервал обновлен', `${minutes} мин`, 'success');
      } catch (err) {
        showToast('Ошибка обновления', err.message, 'danger');
      }
    });
  });

  host.querySelectorAll('.src-del-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-src-del'));
      const name = btn.getAttribute('data-src-name') || 'Источник';
      showDeleteConfirmModal({
        title: 'Удалить источник новостей?',
        snippet: name,
        desc: 'Источник и связанные с ним статьи будут удалены из базы данных.',
        confirmText: 'Удалить',
        onConfirm: async () => {
          try {
            await deleteSource(id);
            appState.sources = appState.sources.filter((s) => s.id !== id);
            showToast('Источник удален', name, 'info');
            renderSourcesSection(host);
          } catch (err) {
            showToast('Ошибка удаления', err.message, 'danger');
          }
        },
      });
    });
  });
}

// ==========================================
// SECTION 4: DATABASE CLEANUP & SYSTEM STATS
// ==========================================
async function renderSystemSection(host, { onRefreshNews } = {}) {
  let stats = appState.stats;
  if (!stats) {
    host.innerHTML = `<div class="glass-panel rounded-3xl p-6 text-center text-xs text-slate-400">Загрузка системной статистики...</div>`;
    try {
      stats = await fetchSystemStats();
      appState.stats = stats;
    } catch (err) {
      stats = { sources_count: 0, active_sources_count: 0, articles_count: 0, summarized_count: 0, ai_provider: 'gemini' };
    }
  }

  host.innerHTML = `
    <div class="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800/90 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-black text-white font-heading">🗄️ Статистика и AI-движок</h2>
        <button type="button" id="sys-refresh-stats" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-sky-300">↻ Обновить</button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div class="p-3 rounded-2xl bg-slate-950/75 border border-slate-800">
          <div class="text-[10px] text-slate-400">Всего статей</div>
          <div class="text-lg font-mono font-black text-white">${stats.articles_count ?? 0}</div>
        </div>
        <div class="p-3 rounded-2xl bg-slate-950/75 border border-slate-800">
          <div class="text-[10px] text-slate-400">С AI-резюме</div>
          <div class="text-lg font-mono font-black text-sky-400">${stats.summarized_count ?? 0}</div>
        </div>
        <div class="p-3 rounded-2xl bg-slate-950/75 border border-slate-800">
          <div class="text-[10px] text-slate-400">Источники</div>
          <div class="text-lg font-mono font-black text-emerald-400">${stats.active_sources_count ?? stats.sources_count ?? 0}/${stats.sources_count ?? 0}</div>
        </div>
        <div class="p-3 rounded-2xl bg-slate-950/75 border border-slate-800">
          <div class="text-[10px] text-slate-400">AI Провайдер</div>
          <div class="text-xs font-mono font-bold text-purple-300 mt-1 truncate">${escapeHtml(stats.ai_provider || 'gemini')}</div>
          <div class="text-[10px] text-slate-500 truncate">${escapeHtml(stats.gemini_model || '')}</div>
        </div>
      </div>
    </div>

    <!-- Database Cleanup Zone -->
    <div class="glass-panel rounded-3xl p-4 sm:p-6 border border-rose-500/25 space-y-4">
      <div>
        <h2 class="text-base font-black text-white font-heading">🧹 Очистка базы данных</h2>
        <p class="text-xs text-slate-400 mt-0.5">Безопасное управление объемом новостей и медиа на диске.</p>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="text-xs font-bold text-white">Удалить устаревшие новости</div>
          <div class="text-[11px] text-slate-400">Удаляет статьи и локальные фото старше выбранного срока</div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <select id="cleanup-days-select" class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
            <option value="3">Старше 3 дней</option>
            <option value="7" selected>Старше 7 дней</option>
            <option value="14">Старше 14 дней</option>
            <option value="30">Старше 30 дней</option>
          </select>
          <button type="button" id="btn-run-cleanup" class="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold">
            Очистить
          </button>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="text-xs font-bold text-white">Очистить конкретную категорию</div>
          <div class="text-[11px] text-slate-400">Удаляет все статьи выбранной категории из базы</div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <select id="purge-cat-select" class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white">
            ${CATEGORIES.map((c) => `<option value="${escapeHtml(c.name)}">${c.emoji} ${escapeHtml(c.name)}</option>`).join('')}
            <option value="all">⚠️ Все категории</option>
          </select>
          <button type="button" id="btn-purge-cat" class="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold">
            Удалить
          </button>
        </div>
      </div>
    </div>

    <!-- PWA & Local Settings -->
    <div class="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-800/90 space-y-3">
      <h2 class="text-base font-black text-white font-heading">📲 Приложение и Кэш</h2>
      <div class="flex flex-wrap gap-2.5">
        <button type="button" id="sys-pwa-install" class="px-4 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold">
          ⬇ Установить на телефон (PWA)
        </button>
        <button type="button" id="sys-clear-cache" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold">
          🗑️ Сбросить кэш PWA
        </button>
        <button type="button" id="sys-reset-ui" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-bold">
          ↺ Сбросить настройки интерфейса
        </button>
      </div>
    </div>
  `;

  host.querySelector('#sys-refresh-stats')?.addEventListener('click', async () => {
    appState.stats = null;
    await renderSystemSection(host, { onRefreshNews });
  });

  host.querySelector('#btn-run-cleanup')?.addEventListener('click', () => {
    const days = Number(host.querySelector('#cleanup-days-select')?.value || 7);
    showDeleteConfirmModal({
      title: `Удалить новости старше ${days} дн.?`,
      snippet: 'Очистка устаревших записей и медиафайлов',
      desc: 'Это освободит место на сервере. Восстановить удаленные статьи нельзя.',
      confirmText: 'Очистить',
      onConfirm: async () => {
        try {
          const res = await triggerOldNewsCleanup(days);
          showToast('Очистка завершена', `Удалено статей: ${res.deleted_count ?? 0}`, 'success');
          appState.stats = null;
          if (typeof onRefreshNews === 'function') await onRefreshNews(true);
          renderSystemSection(host, { onRefreshNews });
        } catch (err) {
          showToast('Ошибка очистки', err.message, 'danger');
        }
      },
    });
  });

  host.querySelector('#btn-purge-cat')?.addEventListener('click', () => {
    const target = host.querySelector('#purge-cat-select')?.value || 'Украина';
    showDeleteConfirmModal({
      title: target === 'all' ? 'Удалить ВСЕ новости из базы?' : `Очистить категорию «${target}»?`,
      snippet: `Целевая категория: ${target}`,
      desc: 'Все новости и связанные медиафайлы этой категории будут стерты из базы данных.',
      confirmText: 'Удалить',
      onConfirm: async () => {
        try {
          const res = await deleteCategoryNews(target);
          removeCategoryArticlesLocally(target);
          showToast('Категория очищена', `Удалено статей: ${res.deleted_count ?? 0}`, 'info');
          appState.stats = null;
          renderSystemSection(host, { onRefreshNews });
        } catch (err) {
          showToast('Ошибка очистки', err.message, 'danger');
        }
      },
    });
  });

  host.querySelector('#sys-pwa-install')?.addEventListener('click', () => triggerPwaInstall());
  host.querySelector('#sys-clear-cache')?.addEventListener('click', () => clearPwaCaches());
  host.querySelector('#sys-reset-ui')?.addEventListener('click', () => {
    resetSettingsToDefaults();
    showToast('Настройки сброшены', 'Восстановлен стандартный вид интерфейса', 'info');
  });
}
