/**
 * Lightweight hash-based router supporting:
 * - #/                   (Home Portal Overview)
 * - #/category/:slug     (Dedicated Category Page)
 * - #/digest             (Top Digest & Tech Quizzes)
 * - #/settings           (Settings Control Center - section 'categories')
 * - #/settings/:section  (Settings sub-section: 'categories' | 'ai-filters' | 'sources' | 'system')
 */

import { getCategoryBySlug } from '../config/categories.js';

export function parseRoute(hashStr = window.location.hash) {
  const cleaned = String(hashStr || '').replace(/^#\/?/, '').trim();
  if (!cleaned) {
    return { page: 'home', param: null };
  }

  const parts = cleaned.split('/').filter(Boolean);
  const head = parts[0].toLowerCase();

  if (head === 'category' && parts[1]) {
    const cat = getCategoryBySlug(parts[1].toLowerCase());
    if (cat) {
      return { page: 'category', param: cat.slug };
    }
    return { page: 'home', param: null };
  }

  if (head === 'digest') {
    return { page: 'digest', param: null };
  }

  if (head === 'settings') {
    const validSections = new Set(['categories', 'ai-filters', 'sources', 'system']);
    const section = parts[1] && validSections.has(parts[1].toLowerCase())
      ? parts[1].toLowerCase()
      : 'categories';
    return { page: 'settings', param: section };
  }

  return { page: 'home', param: null };
}

export function navigateTo(routePath) {
  const target = routePath.startsWith('#') ? routePath : `#/${routePath.replace(/^\/+/, '')}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = target;
  }
}

export function getDefaultRouteHash(defaultRouteSetting) {
  if (!defaultRouteSetting || defaultRouteSetting === 'home') return '#/';
  if (defaultRouteSetting === 'digest') return '#/digest';
  if (defaultRouteSetting.startsWith('category/')) return `#/${defaultRouteSetting}`;
  return '#/';
}
