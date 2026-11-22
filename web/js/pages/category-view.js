/**
 * Dedicated Category Page (#/category/:slug) — Mobile-First with Segmented Feed/Analytics Switcher.
 */

import { escapeHtml, getCategoryBySlug } from '../config/categories.js';
import { createNewsCardElement } from '../components/news-card.js';
import { openCategorySheet } from '../components/modals.js';
import { navigateTo } from '../core/router.js';
import { appState, getCategoryArticles } from '../core/state.js';
import {
  mountCs2Widget,
  mountF1Widget,
  mountFootballWidget,
  mountItWidget,
  mountUkraineWidget,
  renderQuizWidget,
} from '../widgets/category-widgets.js';

export function renderCategoryView(container, slug) {
  if (!container) return;
  const cat = getCategoryBySlug(slug);
  if (!cat) {
    navigateTo('');
    return;
  }

  const activeTag = appState.categorySubTags[cat.slug] || 'all';
  const searchQuery = appState.categorySearchQuery || '';
  const items = getCategoryArticles(cat.slug, activeTag, searchQuery);
  const showWidget = Boolean(cat.hasWidget && appState.settings.showAnalyticsWidgets);
  const mobileTab = appState.mobileCategoryTabMode[cat.slug] || 'feed';
  const isCompact = appState.settings.cardDensity === 'compact';

  const hasTags = Array.isArray(cat.tags) && cat.tags.length > 0;

  container.innerHTML = `
    <div class="space-y-4">
      <!-- Category Sticky Page Header -->
      <section class="glass-panel rounded-3xl p-4 sm:p-5 border border-slate-800/90 space-y-3.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <button type="button" id="cat-back-btn"
              class="w-9 h-9 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center shrink-0 transition-all"
              title="На главную витрину">
              ←
            </button>
            <span class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl border shrink-0 ${cat.badgeClass}">${cat.emoji}</span>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h1 class="text-lg sm:text-xl font-black text-white font-heading truncate">${escapeHtml(cat.name)}</h1>
                <span id="cat-count-badge" class="px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800 shrink-0">${items.length}</span>
              </div>
              <span class="text-[11px] text-slate-400">${escapeHtml(cat.groupTitle)} • Порог ≥ ${Number(appState.settings.minScores[cat.slug] ?? cat.defaultMinScore).toFixed(1)}</span>
            </div>
          </div>

          <button type="button" id="cat-switch-sheet-btn"
            class="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 text-xs font-bold text-sky-300 shrink-0 flex items-center gap-1.5">
            <span>🗂️</span>
            <span class="hidden sm:inline">Сменить раздел</span>
            <span class="sm:hidden">Разделы</span>
          </button>
        </div>

        <!-- Scoped Search -->
        <div class="relative flex items-center w-full rounded-2xl bg-slate-950/75 border border-slate-800 focus-within:border-sky-500/80 transition-all">
          <span class="pl-3.5 text-sky-400/80">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </span>
          <input id="cat-search-input" type="text" autocomplete="off" spellcheck="false"
            value="${escapeHtml(searchQuery)}"
            placeholder="${escapeHtml(cat.searchPlaceholder)}"
            class="w-full px-3 py-2.5 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none" />
          ${searchQuery ? `<button type="button" id="cat-search-clear" class="px-3 py-1.5 text-slate-400 hover:text-white text-xs">✕</button>` : ''}
        </div>

        <!-- Horizontal Sub-Filter Tag Chips -->
        ${hasTags ? `
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            ${cat.tags.map((tag) => {
              const isSelected = activeTag === tag.id;
              return `
                <button type="button" data-sub-tag="${escapeHtml(tag.id)}"
                  class="cat-subtag-btn px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                    isSelected ? cat.activeChipClass : cat.chipClass
                  }">
                  ${escapeHtml(tag.label)}
                </button>
              `;
            }).join('')}
          </div>
        ` : ''}

        <!-- Mobile Segmented Control: Feed vs Analytics/Widget (only on < 1024px when widget exists) -->
        ${showWidget ? `
          <div class="lg:hidden grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800">
            <button type="button" data-mobile-mode="feed"
              class="cat-mobile-mode-btn py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                mobileTab === 'feed' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }">
              📰 Лента (${items.length})
            </button>
            <button type="button" data-mobile-mode="widget"
              class="cat-mobile-mode-btn py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                mobileTab === 'widget' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }">
              📊 ${escapeHtml(cat.widgetLabel)}
            </button>
          </div>
        ` : ''}
      </section>

      <!-- Main Responsive Split: Feed Column + Optional Sticky Analytics Sidebar -->
      <div class="flex flex-col lg:grid lg:grid-cols-12 gap-5 items-start">
        <div id="cat-feed-col" class="${showWidget ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'} w-full space-y-4 ${showWidget && mobileTab !== 'feed' ? 'hidden lg:block' : ''}">
          <div id="cat-news-grid" class="${
            isCompact
              ? 'grid grid-cols-1 gap-2.5'
              : showWidget
                ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          }"></div>
        </div>

        ${showWidget ? `
          <aside id="cat-widget-col" class="lg:col-span-5 xl:col-span-4 w-full lg:sticky lg:top-20 ${mobileTab !== 'widget' ? 'hidden lg:block' : ''}">
            <div id="cat-widget-host"></div>
          </aside>
        ` : ''}
      </div>
    </div>
  `;

  // Bind navigation & search
  container.querySelector('#cat-back-btn')?.addEventListener('click', () => navigateTo(''));
  container.querySelector('#cat-switch-sheet-btn')?.addEventListener('click', () => openCategorySheet(cat.slug));

  const searchInput = container.querySelector('#cat-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.categorySearchQuery = e.target.value;
      renderCategoryFeedGrid(container, cat);
    });
  }
  container.querySelector('#cat-search-clear')?.addEventListener('click', () => {
    appState.categorySearchQuery = '';
    renderCategoryView(container, cat.slug);
  });

  // Sub-tag filters
  container.querySelectorAll('.cat-subtag-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tagId = btn.getAttribute('data-sub-tag');
      const current = appState.categorySubTags[cat.slug] || 'all';
      appState.categorySubTags[cat.slug] = (current === tagId && tagId !== 'all') ? 'all' : tagId;
      renderCategoryView(container, cat.slug);
    });
  });

  // Mobile Feed / Widget Switcher
  container.querySelectorAll('.cat-mobile-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      appState.mobileCategoryTabMode[cat.slug] = btn.getAttribute('data-mobile-mode');
      renderCategoryView(container, cat.slug);
    });
  });

  renderCategoryFeedGrid(container, cat);

  if (showWidget) {
    const widgetHost = container.querySelector('#cat-widget-host');
    mountCategoryWidget(cat, widgetHost, container);
  }
}

function renderCategoryFeedGrid(pageContainer, cat) {
  const grid = pageContainer.querySelector('#cat-news-grid');
  const countBadge = pageContainer.querySelector('#cat-count-badge');
  if (!grid) return;

  const activeTag = appState.categorySubTags[cat.slug] || 'all';
  const query = appState.categorySearchQuery || '';
  const items = getCategoryArticles(cat.slug, activeTag, query);
  const isCompact = appState.settings.cardDensity === 'compact';

  if (countBadge) countBadge.textContent = String(items.length);
  const mobileFeedTab = pageContainer.querySelector('[data-mobile-mode="feed"]');
  if (mobileFeedTab) mobileFeedTab.textContent = `📰 Лента (${items.length})`;

  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full glass-panel rounded-3xl p-8 text-center space-y-3 border border-slate-800">
        <span class="text-3xl block">${cat.emoji}</span>
        <p class="text-sm font-bold text-slate-200">
          ${query
            ? `По запросу «${escapeHtml(query)}» ничего не найдено в «${escapeHtml(cat.name)}»`
            : `В разделе «${escapeHtml(cat.name)}» нет новостей с текущими фильтрами`}
        </p>
        <div class="flex items-center justify-center gap-2 flex-wrap">
          ${query || activeTag !== 'all'
            ? `<button type="button" id="cat-reset-filters-btn" class="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold">Сбросить фильтры</button>`
            : `<button type="button" id="cat-open-threshold-btn" class="px-4 py-2 rounded-xl bg-slate-800 text-sky-300 border border-slate-700 text-xs font-bold">Настроить порог важности</button>`
          }
        </div>
      </div>
    `;
    grid.querySelector('#cat-reset-filters-btn')?.addEventListener('click', () => {
      appState.categorySearchQuery = '';
      appState.categorySubTags[cat.slug] = 'all';
      renderCategoryView(pageContainer, cat.slug);
    });
    grid.querySelector('#cat-open-threshold-btn')?.addEventListener('click', () => navigateTo('settings/ai-filters'));
    return;
  }

  items.forEach((article, idx) => {
    grid.appendChild(
      createNewsCardElement(article, idx, {
        compact: isCompact,
        onDeleted: () => renderCategoryFeedGrid(pageContainer, cat),
      })
    );
  });
}

function mountCategoryWidget(cat, widgetHost, pageContainer) {
  if (!widgetHost) return;
  if (cat.slug === 'ukraine') {
    mountUkraineWidget(widgetHost);
  } else if (cat.slug === 'f1') {
    mountF1Widget(widgetHost);
  } else if (cat.slug === 'football') {
    mountFootballWidget(widgetHost);
  } else if (cat.slug === 'cs2') {
    const activeTeam = appState.categorySubTags.cs2 || 'all';
    mountCs2Widget(widgetHost, {
      selectedTeam: activeTeam,
      onSelectTeam: (teamName) => {
        const cur = appState.categorySubTags.cs2 || 'all';
        appState.categorySubTags.cs2 = cur.toLowerCase() === teamName.toLowerCase() ? 'all' : teamName;
        appState.mobileCategoryTabMode.cs2 = 'feed';
        renderCategoryView(pageContainer, 'cs2');
      },
    });
  } else if (cat.slug === 'it') {
    const activeLang = appState.categorySubTags.it || 'all';
    mountItWidget(widgetHost, {
      activeLang,
      onSelectLang: (langId) => {
        appState.categorySubTags.it = langId || 'all';
        appState.mobileCategoryTabMode.it = 'feed';
        renderCategoryView(pageContainer, 'it');
      },
    });
  } else if (cat.slug === 'ai') {
    renderQuizWidget(widgetHost, 'ai');
  } else if (cat.slug === 'devops') {
    renderQuizWidget(widgetHost, 'linux');
  }
}
