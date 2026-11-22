/**
 * Application entry point: wires hash routing, responsive desktop & mobile navigation,
 * live news fetching/auto-refresh, and modal event bindings.
 */

import { fetchLiveNews } from './core/api.js';
import { getDefaultRouteHash, navigateTo, parseRoute } from './core/router.js';
import { appState, setArticles, subscribe } from './core/state.js';
import {
  closeCategorySheet,
  closeImageZoom,
  closePwaInstallModal,
  initPwaSupport,
  openCategorySheet,
  showToast,
  toggleZoomScale,
  triggerPwaInstall,
} from './components/modals.js';
import { renderCategoryView } from './pages/category-view.js';
import { renderDigestView, renderHomePortalView } from './pages/portal-view.js';
import { renderSettingsView } from './pages/settings-view.js';

let refreshTimerId = null;

function updateNavActiveStates(route) {
  const activeKey = route.page === 'category' ? 'categories' : route.page;

  document.querySelectorAll('.desktop-nav-btn').forEach((btn) => {
    const isMatch = btn.getAttribute('data-nav') === activeKey;
    btn.className = isMatch
      ? 'desktop-nav-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
      : 'desktop-nav-btn px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all text-slate-400 border border-transparent hover:text-white hover:bg-slate-800/50';
  });

  document.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
    const isMatch = btn.getAttribute('data-nav') === activeKey;
    btn.className = isMatch
      ? 'mobile-nav-btn flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-sky-300 bg-sky-500/15 font-bold transition-all'
      : 'mobile-nav-btn flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-slate-400 hover:text-slate-200 font-medium transition-all';
  });
}

function renderActiveRoute() {
  const viewport = document.getElementById('app-viewport');
  if (!viewport) return;

  const route = parseRoute(window.location.hash);
  updateNavActiveStates(route);

  if (route.page === 'home') {
    renderHomePortalView(viewport, { onRefreshNews: loadNewsFeed });
  } else if (route.page === 'category') {
    renderCategoryView(viewport, route.param);
  } else if (route.page === 'digest') {
    renderDigestView(viewport);
  } else if (route.page === 'settings') {
    renderSettingsView(viewport, route.param, { onRefreshNews: loadNewsFeed });
  }
}

async function loadNewsFeed(showSuccessToast = false) {
  try {
    const data = await fetchLiveNews(250);
    if (Array.isArray(data)) {
      setArticles(data);
      if (showSuccessToast) {
        showToast('Лента обновлена', `Загружено статей: ${data.length}`, 'success');
      }
    } else if (data && data.offline) {
      appState.isLoadingNews = false;
      renderActiveRoute();
    }
  } catch (err) {
    console.warn('[News] Failed to fetch /api/news:', err);
    appState.isLoadingNews = false;
    appState.newsError = err.message;
    if (showSuccessToast) {
      showToast('Не удалось обновить новости', err.message, 'danger');
    } else {
      renderActiveRoute();
    }
  }
}

function configureAutoRefresh() {
  if (refreshTimerId) {
    clearInterval(refreshTimerId);
    refreshTimerId = null;
  }
  const mins = Number(appState.settings.autoRefreshMinutes || 0);
  if (mins > 0) {
    refreshTimerId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadNewsFeed(false);
      }
    }, mins * 60 * 1000);
  }
}

function bindGlobalChrome() {
  // Desktop & Mobile Navigation clicks
  const handleNavClick = (navType) => {
    if (navType === 'home') navigateTo('');
    else if (navType === 'digest') navigateTo('digest');
    else if (navType === 'settings') navigateTo('settings/categories');
    else if (navType === 'categories') {
      const route = parseRoute(window.location.hash);
      openCategorySheet(route.page === 'category' ? route.param : null);
    }
  };

  document.querySelectorAll('.desktop-nav-btn, .mobile-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleNavClick(btn.getAttribute('data-nav')));
  });

  document.getElementById('brand-home-link')?.addEventListener('click', () => navigateTo(''));
  document.getElementById('pwa-install-btn')?.addEventListener('click', () => triggerPwaInstall());

  // Category Sheet bindings
  document.getElementById('category-sheet-modal')?.addEventListener('click', (e) => closeCategorySheet(e));
  document.getElementById('category-sheet-close-btn')?.addEventListener('click', () => closeCategorySheet());
  document.getElementById('category-sheet-settings-btn')?.addEventListener('click', () => {
    closeCategorySheet();
    navigateTo('settings/categories');
  });

  // Media Lightbox bindings
  document.getElementById('image-zoom-modal')?.addEventListener('click', (e) => closeImageZoom(e));
  document.getElementById('zoom-close-btn')?.addEventListener('click', () => closeImageZoom());
  document.getElementById('zoom-toggle-scale-btn')?.addEventListener('click', () => toggleZoomScale());
  document.getElementById('zoom-viewport')?.addEventListener('click', () => toggleZoomScale());
  document.getElementById('zoom-modal-video')?.addEventListener('click', (e) => e.stopPropagation());

  // PWA modal bindings
  document.getElementById('pwa-install-modal')?.addEventListener('click', (e) => closePwaInstallModal(e));
  document.getElementById('pwa-modal-close-btn')?.addEventListener('click', () => closePwaInstallModal());
}

function bootstrap() {
  bindGlobalChrome();
  initPwaSupport(() => loadNewsFeed(false));

  // Redirect to user's preferred startup page if landing on bare URL without hash
  if (!window.location.hash || window.location.hash === '#') {
    const defaultHash = getDefaultRouteHash(appState.settings.defaultRoute);
    if (defaultHash !== '#/') {
      window.location.hash = defaultHash;
    }
  }

  window.addEventListener('hashchange', () => {
    renderActiveRoute();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  subscribe((reason) => {
    if (reason === 'articles') {
      renderActiveRoute();
    } else if (reason === 'settings') {
      configureAutoRefresh();
      const route = parseRoute(window.location.hash);
      if (route.page !== 'settings') {
        renderActiveRoute();
      }
    }
  });

  renderActiveRoute();
  configureAutoRefresh();
  loadNewsFeed(false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
