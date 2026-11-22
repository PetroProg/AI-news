/**
 * Centralized reactive application state and persistent user settings.
 */

import { CATEGORIES, normalizeCategory, isArticleEligibleForDisplay } from '../config/categories.js';

const SETTINGS_STORAGE_KEY = 'ai_news_user_settings_v3';

export function buildDefaultSettings() {
  const enabledCategories = {};
  const minScores = { digest: 7.5 };
  const categoryOrder = [];

  for (const cat of CATEGORIES) {
    enabledCategories[cat.slug] = true;
    minScores[cat.slug] = cat.defaultMinScore;
    categoryOrder.push(cat.slug);
  }

  return {
    enabledCategories,
    categoryOrder,
    defaultRoute: 'home', // 'home' | 'digest' | 'category/<slug>'
    cardDensity: 'comfortable', // 'comfortable' | 'compact'
    portalCardsPerCategory: 3, // 2 | 3 | 4
    showAnalyticsWidgets: true,
    strictF1Filter: true,
    autoRefreshMinutes: 5, // 0 | 1 | 5 | 15
    minScores,
    customPriorityKeywords: ['s1mple', 'navi', 'дніпро', 'red bull', 'verstappen', 'месси', 'барселона'],
  };
}

function loadSettings() {
  const defaults = buildDefaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);

    const mergedOrder = Array.isArray(parsed.categoryOrder)
      ? [
          ...parsed.categoryOrder.filter((slug) => defaults.categoryOrder.includes(slug)),
          ...defaults.categoryOrder.filter((slug) => !parsed.categoryOrder.includes(slug)),
        ]
      : defaults.categoryOrder;

    return {
      ...defaults,
      ...parsed,
      enabledCategories: { ...defaults.enabledCategories, ...(parsed.enabledCategories || {}) },
      minScores: { ...defaults.minScores, ...(parsed.minScores || {}) },
      categoryOrder: mergedOrder,
      customPriorityKeywords: Array.isArray(parsed.customPriorityKeywords)
        ? parsed.customPriorityKeywords
        : defaults.customPriorityKeywords,
    };
  } catch (err) {
    console.warn('[State] Failed to parse saved settings, using defaults:', err);
    return defaults;
  }
}

export const appState = {
  articles: [],
  isLoadingNews: true,
  newsError: null,
  lastNewsFetchAt: 0,

  portalSearchQuery: '',
  categorySearchQuery: '',
  categorySubTags: {}, // slug -> activeTagId
  mobileCategoryTabMode: {}, // slug -> 'feed' | 'widget'

  // Live widget caches
  ukraineDigest: null,
  f1Results: null,
  f1ActiveTab: 'drivers', // 'drivers' | 'races'
  footballResults: {}, // tournament -> data
  footballTournament: 'laliga',
  footballView: 'standings', // 'standings' | 'matches'
  footballNationsTier: 'all',
  hltvRankings: [],
  hltvMeta: null,

  // Settings & Stats & Sources
  settings: loadSettings(),
  stats: null,
  sources: [],
  sourcesLoaded: false,
};

const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify(reason = 'state') {
  listeners.forEach((fn) => {
    try {
      fn(reason, appState);
    } catch (err) {
      console.error('[State] Listener error:', err);
    }
  });
}

export function saveSettings(partial) {
  appState.settings = {
    ...appState.settings,
    ...partial,
    enabledCategories: {
      ...appState.settings.enabledCategories,
      ...(partial.enabledCategories || {}),
    },
    minScores: {
      ...appState.settings.minScores,
      ...(partial.minScores || {}),
    },
  };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(appState.settings));
  } catch (err) {
    console.warn('[State] Failed to persist settings:', err);
  }
  notify('settings');
}

export function resetSettingsToDefaults() {
  appState.settings = buildDefaultSettings();
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(appState.settings));
  } catch (err) {
    // Ignore storage error
  }
  notify('settings');
}

export function setArticles(items) {
  const list = Array.isArray(items) ? items : [];
  list.forEach((a) => {
    a._displayCategory = normalizeCategory(a.category, a);
  });
  appState.articles = list;
  appState.isLoadingNews = false;
  appState.newsError = null;
  appState.lastNewsFetchAt = Date.now();
  notify('articles');
}

export function removeArticleLocally(articleId) {
  appState.articles = appState.articles.filter((a) => a.id !== articleId);
  notify('articles');
}

export function removeCategoryArticlesLocally(categoryName) {
  const lower = String(categoryName || '').toLowerCase();
  if (lower === 'all' || lower === 'все') {
    appState.articles = [];
  } else {
    appState.articles = appState.articles.filter(
      (a) => (a._displayCategory || normalizeCategory(a.category, a)).toLowerCase() !== lower
    );
  }
  notify('articles');
}

export function getOrderedCategories(includeDisabled = false) {
  const map = new Map(CATEGORIES.map((c) => [c.slug, c]));
  const ordered = [];
  for (const slug of appState.settings.categoryOrder) {
    const cat = map.get(slug);
    if (cat && (includeDisabled || appState.settings.enabledCategories[slug] !== false)) {
      ordered.push(cat);
    }
  }
  return ordered;
}

export function getCategoryArticles(slug, subTag = 'all', searchQuery = '') {
  const filtered = appState.articles.filter((item) =>
    isArticleEligibleForDisplay(item, slug, appState.settings, subTag)
  );

  const q = String(searchQuery || '').trim().toLowerCase();
  const result = q
    ? filtered.filter((article) => {
        const keyPoints = Array.isArray(article.key_points) ? article.key_points.join(' ') : (article.key_points || '');
        const corpus = `${article.title || ''} ${article.summary || ''} ${keyPoints} ${article.why_it_matters || ''} ${article.source || ''}`.toLowerCase();
        return q.split(/\s+/).filter(Boolean).every((term) => corpus.includes(term));
      })
    : filtered;

  return result.sort((a, b) => {
    const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
    const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
    return bTime - aTime;
  });
}

export function getDigestArticles(searchQuery = '') {
  return getCategoryArticles('digest', 'all', searchQuery);
}

export function getCategoryCountsMap() {
  const counts = {};
  for (const cat of CATEGORIES) {
    counts[cat.slug] = getCategoryArticles(cat.slug, 'all', '').length;
  }
  return counts;
}
