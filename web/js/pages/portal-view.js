/**
 * Home Overview Portal (#/) and Top Digest (#/digest) views — Mobile-First Variant 3.
 */

import { escapeHtml } from '../config/categories.js';
import { createNewsCardElement } from '../components/news-card.js';
import { openCategorySheet } from '../components/modals.js';
import { navigateTo } from '../core/router.js';
import {
  appState,
  getCategoryArticles,
  getCategoryCountsMap,
  getDigestArticles,
  getOrderedCategories,
  saveSettings,
} from '../core/state.js';
import { renderQuizWidget } from '../widgets/category-widgets.js';

export function renderHomePortalView(container, { onRefreshNews } = {}) {
  if (!container) return;

  const enabledCats = getOrderedCategories(false);
  const counts = getCategoryCountsMap();
  const isCompact = appState.settings.cardDensity === 'compact';
  const query = appState.portalSearchQuery || '';
  const perCatLimit = Number(appState.settings.portalCardsPerCategory || 3);

  const totalVisible = enabledCats.reduce((acc, c) => acc + (counts[c.slug] || 0), 0);

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Mobile-first Quick Category Touch Grid & Search Bar -->
      <section class="glass-panel rounded-3xl p-4 sm:p-5 border border-slate-800/90 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-sky-400">Витрина категорий</span>
            <h1 class="text-lg sm:text-xl font-black text-white font-heading">Все новости по темам</h1>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" id="portal-density-toggle"
              class="px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isCompact
                  ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                  : 'bg-slate-900/80 border-slate-700/70 text-slate-300 hover:text-white'
              }" title="Переключить плотность карточек">
              <span>${isCompact ? '📱 Компактно' : '🖼️ Карточки'}</span>
            </button>
            <button type="button" id="portal-refresh-btn"
              class="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900/80 hover:bg-slate-800 text-sky-300 border border-slate-700/70 transition-all" title="Обновить ленту">
              ↻ <span class="hidden sm:inline">Обновить</span>
            </button>
          </div>
        </div>

        <!-- Global Portal Search -->
        <div class="relative flex items-center w-full rounded-2xl bg-slate-950/75 border border-slate-800 focus-within:border-sky-500/80 transition-all">
          <span class="pl-3.5 text-sky-400/80">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </span>
          <input id="portal-search-input" type="text" autocomplete="off" spellcheck="false"
            value="${escapeHtml(query)}"
            placeholder="Поиск по всем категориям..."
            class="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none" />
          ${query ? `<button type="button" id="portal-search-clear" class="px-3 py-1.5 text-slate-400 hover:text-white text-xs">✕</button>` : ''}
          <span class="pr-3 text-[11px] font-mono text-slate-400 shrink-0">${totalVisible}</span>
        </div>

        <!-- 1-Tap Category Pills Grid (2 cols on phone, 5 cols on desktop) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          ${enabledCats.map((cat) => {
            const cnt = counts[cat.slug] || 0;
            return `
              <button type="button" data-portal-cat="${escapeHtml(cat.slug)}"
                class="portal-cat-jump flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-800/90 bg-slate-950/65 hover:bg-slate-900 hover:border-sky-500/40 text-left transition-all active:scale-95">
                <span class="flex items-center gap-1.5 min-w-0">
                  <span class="text-base shrink-0">${cat.emoji}</span>
                  <span class="text-xs font-bold text-slate-200 truncate">${escapeHtml(cat.shortName)}</span>
                </span>
                <span class="px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800 shrink-0">${cnt}</span>
              </button>
            `;
          }).join('')}
        </div>
      </section>

      <!-- Category Portal Sections -->
      <div id="portal-sections-host" class="space-y-6"></div>
    </div>
  `;

  // Bind controls
  container.querySelectorAll('.portal-cat-jump').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-portal-cat');
      if (slug) navigateTo(`category/${slug}`);
    });
  });

  container.querySelector('#portal-density-toggle')?.addEventListener('click', () => {
    saveSettings({ cardDensity: isCompact ? 'comfortable' : 'compact' });
    renderHomePortalView(container, { onRefreshNews });
  });

  container.querySelector('#portal-refresh-btn')?.addEventListener('click', () => {
    if (typeof onRefreshNews === 'function') onRefreshNews(true);
  });

  const searchInput = container.querySelector('#portal-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.portalSearchQuery = e.target.value;
      renderPortalSections(container.querySelector('#portal-sections-host'));
    });
  }
  container.querySelector('#portal-search-clear')?.addEventListener('click', () => {
    appState.portalSearchQuery = '';
    renderHomePortalView(container, { onRefreshNews });
  });

  renderPortalSections(container.querySelector('#portal-sections-host'));
}

function renderPortalSections(host) {
  if (!host) return;
  host.innerHTML = '';

  if (appState.isLoadingNews && appState.articles.length === 0) {
    host.innerHTML = `
      <div class="glass-panel rounded-3xl p-8 text-center text-sm text-slate-400">
        Загружаем новости и AI-резюме...
      </div>
    `;
    return;
  }

  const enabledCats = getOrderedCategories(false);
  if (enabledCats.length === 0) {
    host.innerHTML = `
      <div class="glass-panel rounded-3xl p-8 text-center space-y-3">
        <p class="text-sm font-semibold text-slate-300">Все категории скрыты в настройках.</p>
        <button type="button" id="portal-open-settings" class="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold">
          Открыть Настройки
        </button>
      </div>
    `;
    host.querySelector('#portal-open-settings')?.addEventListener('click', () => navigateTo('settings/categories'));
    return;
  }

  const query = (appState.portalSearchQuery || '').trim();
  const isCompact = appState.settings.cardDensity === 'compact';
  const perCatLimit = Number(appState.settings.portalCardsPerCategory || 3);

  let renderedCount = 0;

  for (const cat of enabledCats) {
    const items = getCategoryArticles(cat.slug, 'all', query);
    if (query && items.length === 0) continue;

    renderedCount += 1;
    const section = document.createElement('section');
    section.className = 'space-y-3';

    const previewItems = items.slice(0, perCatLimit);

    section.innerHTML = `
      <div class="flex items-center justify-between gap-2 px-1">
        <button type="button" data-open-cat="${escapeHtml(cat.slug)}" class="flex items-center gap-2.5 text-left group">
          <span class="w-9 h-9 rounded-2xl flex items-center justify-center text-lg border ${cat.badgeClass}">${cat.emoji}</span>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-black text-white font-heading group-hover:text-sky-300 transition-colors">${escapeHtml(cat.name)}</h2>
              <span class="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">${items.length}</span>
            </div>
            ${cat.hasWidget && appState.settings.showAnalyticsWidgets
              ? `<span class="text-[11px] text-slate-400">Включая виджет: ${escapeHtml(cat.widgetLabel)}</span>`
              : ''}
          </div>
        </button>
        <button type="button" data-open-cat="${escapeHtml(cat.slug)}"
          class="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-sky-500/20 text-sky-300 border border-slate-800 hover:border-sky-500/40 text-xs font-bold shrink-0 transition-all">
          Все (${items.length}) →
        </button>
      </div>
    `;

    if (previewItems.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'glass-panel rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-400';
      emptyBox.innerHTML = `
        <span>Нет свежих новостей по текущему порогу важности (${Number(appState.settings.minScores[cat.slug] ?? cat.defaultMinScore).toFixed(1)}/10).</span>
        <button type="button" data-open-cat="${escapeHtml(cat.slug)}" class="text-sky-400 font-bold shrink-0 hover:underline">Открыть →</button>
      `;
      section.appendChild(emptyBox);
    } else {
      const grid = document.createElement('div');
      grid.className = isCompact
        ? 'grid grid-cols-1 md:grid-cols-2 gap-2.5'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

      previewItems.forEach((article, idx) => {
        grid.appendChild(
          createNewsCardElement(article, idx, {
            compact: isCompact,
            onDeleted: () => renderPortalSections(host),
          })
        );
      });
      section.appendChild(grid);
    }

    section.querySelectorAll('[data-open-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const slug = btn.getAttribute('data-open-cat');
        if (slug) navigateTo(`category/${slug}`);
      });
    });

    host.appendChild(section);
  }

  if (query && renderedCount === 0) {
    host.innerHTML = `
      <div class="glass-panel rounded-3xl p-8 text-center space-y-3 border border-slate-800">
        <span class="text-3xl block">🔍</span>
        <p class="text-sm font-bold text-slate-200">По запросу «${escapeHtml(query)}» новостей не найдено</p>
        <button type="button" id="portal-empty-reset" class="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold">Сбросить поиск</button>
      </div>
    `;
    host.querySelector('#portal-empty-reset')?.addEventListener('click', () => {
      appState.portalSearchQuery = '';
      const inp = document.getElementById('portal-search-input');
      if (inp) inp.value = '';
      renderPortalSections(host);
    });
  }
}

export function renderDigestView(container) {
  if (!container) return;

  const isCompact = appState.settings.cardDensity === 'compact';
  const digestThreshold = Number(appState.settings.minScores.digest ?? 7.5);
  const items = getDigestArticles('');
  const showQuiz = appState.settings.showAnalyticsWidgets;

  container.innerHTML = `
    <div class="space-y-5">
      <section class="glass-panel rounded-3xl p-4 sm:p-5 border border-amber-500/25 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-amber-950/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400">Главное со всех разделов • Score ≥ ${digestThreshold.toFixed(1)}</span>
          <h1 class="text-lg sm:text-xl font-black text-white font-heading">🔥 Топ-Дайджест дня</h1>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="digest-open-cats" class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200">🗂️ Категории</button>
          <button type="button" id="digest-open-settings" class="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/35 text-xs font-bold text-amber-300">🎯 Порог</button>
        </div>
      </section>

      <div class="flex flex-col lg:grid lg:grid-cols-12 gap-5 items-start">
        <div class="${showQuiz ? 'lg:col-span-8' : 'lg:col-span-12'} w-full space-y-4">
          <div id="digest-cards-grid" class="${isCompact ? 'grid grid-cols-1 gap-2.5' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}"></div>
        </div>
        ${showQuiz ? `
          <aside class="lg:col-span-4 w-full space-y-3 lg:sticky lg:top-20">
            <div class="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              <button type="button" data-quiz-tab="ai" class="digest-quiz-tab py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white">🤖 AI</button>
              <button type="button" data-quiz-tab="it" class="digest-quiz-tab py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white">💻 IT</button>
              <button type="button" data-quiz-tab="linux" class="digest-quiz-tab py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white">🐧 Linux</button>
            </div>
            <div id="digest-quiz-host"></div>
          </aside>
        ` : ''}
      </div>
    </div>
  `;

  container.querySelector('#digest-open-cats')?.addEventListener('click', () => openCategorySheet());
  container.querySelector('#digest-open-settings')?.addEventListener('click', () => navigateTo('settings/ai-filters'));

  const grid = container.querySelector('#digest-cards-grid');
  if (grid) {
    if (items.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full glass-panel rounded-3xl p-8 text-center text-xs text-slate-400 border border-slate-800">
          Пока нет статей с важностью ≥ ${digestThreshold.toFixed(1)}. Порог можно снизить в Настройках.
        </div>
      `;
    } else {
      items.slice(0, 40).forEach((article, idx) => {
        grid.appendChild(
          createNewsCardElement(article, idx, {
            compact: isCompact,
            onDeleted: () => renderDigestView(container),
          })
        );
      });
    }
  }

  if (showQuiz) {
    const quizHost = container.querySelector('#digest-quiz-host');
    renderQuizWidget(quizHost, 'ai');
    container.querySelectorAll('.digest-quiz-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const qCat = btn.getAttribute('data-quiz-tab');
        container.querySelectorAll('.digest-quiz-tab').forEach((b) => {
          b.className = b === btn
            ? 'digest-quiz-tab py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white'
            : 'digest-quiz-tab py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white';
        });
        renderQuizWidget(quizHost, qCat);
      });
    });
  }
}
