/**
 * Mobile-first news card component supporting both 'comfortable' media cards
 * and 'compact' list cards for fast scanning on phones.
 */

import {
  cleanText,
  escapeHtml,
  formatShortSummary,
  getArticleImage,
  getCategoryByName,
  getCategoryFallbackImage,
  isArticlePriority,
  normalizeCategory,
  sanitizeUrl,
} from '../config/categories.js';
import { deleteArticleById } from '../core/api.js';
import { appState, removeArticleLocally } from '../core/state.js';
import { openMediaZoom, showDeleteConfirmModal, showToast } from './modals.js';

function formatPublishedTime(isoStr) {
  if (!isoStr) return 'Сегодня';
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return 'Сегодня';
  const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${cap}, ${time}`;
}

export function createNewsCardElement(article, index = 0, options = {}) {
  const compact = Boolean(options.compact);
  const title = escapeHtml(cleanText(article.title || 'Новость'));
  const rawTitle = cleanText(article.title || 'Новость');
  const sourceUrl = sanitizeUrl(article.sourceUrl || article.url || article.original_url, '#');
  const sourceName = escapeHtml(article.sourceName || article.source || 'Инфо-поток');
  const catName = article._displayCategory || normalizeCategory(article.category || 'Технологии', article);
  const catObj = getCategoryByName(catName);
  const catEmoji = catObj ? catObj.emoji : '⚡';

  const scoreNum = article.importance_score ? Number(article.importance_score) : 5.0;
  const scoreStr = scoreNum.toFixed(1);
  const isHighQuality = scoreNum >= 7.0;

  const summaryRaw = article.summary || article.short_summary || '';
  const summaryShort = escapeHtml(formatShortSummary(summaryRaw));
  const timeStr = escapeHtml(formatPublishedTime(article.published_at));

  const fallbackImg = sanitizeUrl(getCategoryFallbackImage(catName, index), '');
  const image = sanitizeUrl(getArticleImage(article, index), fallbackImg);
  const videoMatch = article.raw_content && article.raw_content.match(/<video[^>]+src=["']([^"']+)["']/i);
  const videoSrc = sanitizeUrl(article.video_url || (videoMatch && videoMatch[1]) || '', '');
  const hasVideo = Boolean(videoSrc && videoSrc !== '#');

  const isPriority = isArticlePriority(article, appState.settings.customPriorityKeywords);
  const borderClass = isPriority
    ? 'border-amber-500/40 hover:border-amber-400/60 shadow-amber-500/10'
    : 'border-slate-800/80 hover:border-sky-500/35';

  const card = document.createElement('article');

  if (compact) {
    card.className = `news-card-compact glass-panel rounded-2xl border ${borderClass} p-3 sm:p-3.5 transition-all space-y-2.5`;
    card.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="card-media-preview relative w-20 h-20 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 cursor-pointer border border-slate-800/80">
          <img src="${image}" alt="${title}" loading="lazy"
               onerror="this.onerror=null;this.src='${fallbackImg}'"
               class="w-full h-full object-cover" />
          ${hasVideo ? `<span class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-rose-600/90 text-[9px] font-bold text-white">▶</span>` : ''}
        </div>
        <div class="flex-1 min-w-0 space-y-1">
          <div class="flex items-center justify-between gap-1.5 flex-wrap">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-[11px] font-bold text-sky-300 truncate">${catEmoji} ${escapeHtml(catName)}</span>
              ${isPriority ? '<span class="text-[11px]" title="Приоритет">⭐</span>' : ''}
            </div>
            <span class="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
              isHighQuality ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
            }">${isHighQuality ? '🔥 ' : ''}${scoreStr}</span>
          </div>
          <h4 class="text-sm font-bold text-white leading-snug line-clamp-2 font-heading">${title}</h4>
          <div class="flex items-center justify-between gap-2 text-[11px] text-slate-400 pt-0.5">
            <span class="truncate">${sourceName} • ${timeStr}</span>
            <div class="flex items-center gap-1.5 shrink-0">
              <button type="button" class="btn-toggle-compact px-2 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-sky-300 text-[10px] font-semibold">AI суть</button>
              <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-sky-300" title="Открыть источник">↗</a>
              <button type="button" class="btn-delete-article p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400" title="Удалить">✕</button>
            </div>
          </div>
        </div>
      </div>
      <div class="compact-summary-drawer hidden p-3 rounded-xl bg-slate-950/75 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
        <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">🤖 AI-резюме</span>
        <p>${summaryShort}</p>
      </div>
    `;

    const toggleBtn = card.querySelector('.btn-toggle-compact');
    const drawer = card.querySelector('.compact-summary-drawer');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        const isHidden = drawer.classList.toggle('hidden');
        toggleBtn.textContent = isHidden ? 'AI суть' : 'Скрыть';
      });
    }
  } else {
    card.className = `news-card glass-panel glass-panel-hover rounded-2xl sm:rounded-3xl overflow-hidden border ${borderClass} flex flex-col group transition-all duration-200`;

    const priorityBadge = isPriority
      ? `<span class="px-2 py-1 rounded-xl text-[11px] font-bold bg-amber-500/30 backdrop-blur-md text-amber-300 border border-amber-400/60" title="Приоритет">⭐</span>`
      : '';
    const scoreBadge = isHighQuality
      ? `<span class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/25 backdrop-blur-md text-amber-300 border border-amber-500/40">🔥 ${scoreStr}/10</span>`
      : `<span class="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-900/85 backdrop-blur-md text-slate-300 border border-slate-700/60">${scoreStr}/10</span>`;
    const diagramBadge = article.has_diagram
      ? `<span class="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-500/25 backdrop-blur-md text-purple-300 border border-purple-500/40">📊 График</span>`
      : '';

    const mediaMarkup = hasVideo
      ? `
        <div class="relative w-full aspect-video overflow-hidden bg-black group/video">
          <video src="${videoSrc}" poster="${image}" class="w-full h-full object-cover" controls preload="metadata" playsinline></video>
          <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap pointer-events-none z-10">
            <span class="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-950/85 backdrop-blur-md text-sky-300 border border-sky-500/30">${catEmoji} ${escapeHtml(catName)}</span>
            ${priorityBadge}
            ${scoreBadge}
          </div>
          <button type="button" class="btn-open-video-zoom absolute top-2.5 right-2.5 z-10 p-1.5 rounded-xl bg-slate-950/85 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-400/30" title="Развернуть видео">⛶</button>
        </div>
      `
      : `
        <div class="relative w-full aspect-video overflow-hidden bg-slate-950 cursor-pointer group/img card-media-preview">
          <img src="${image}" alt="${title}" loading="lazy"
               onload="if (this.naturalWidth && (this.naturalWidth < 350 || this.naturalHeight < 250)) { this.onerror = null; this.src = '${fallbackImg}'; }"
               onerror="this.onerror=null;this.src='${fallbackImg}'"
               class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-95">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none"></div>
          <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap pointer-events-none">
            <span class="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-950/85 backdrop-blur-md text-sky-300 border border-sky-500/30">${catEmoji} ${escapeHtml(catName)}</span>
            ${priorityBadge}
            ${scoreBadge}
            ${diagramBadge}
          </div>
          <div class="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] pointer-events-none">
            <span class="font-semibold text-white bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 truncate max-w-[60%]">${sourceName}</span>
            <span class="text-slate-300 bg-slate-900/85 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 shrink-0">${timeStr}</span>
          </div>
        </div>
      `;

    card.innerHTML = `
      ${mediaMarkup}
      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div class="flex-1 flex flex-col">
          <h3 class="text-base font-bold text-white font-heading group-hover:text-sky-300 transition-colors leading-snug">
            ${title}
          </h3>
          <div class="mt-2.5 p-3 rounded-2xl bg-slate-950/55 border border-slate-800/75 text-xs text-slate-300 leading-relaxed flex-1">
            <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">🤖 Резюме нейросети</span>
            <p class="text-slate-300 leading-relaxed">${summaryShort}</p>
          </div>
        </div>
        <div class="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
          <span class="text-[11px] text-slate-500 font-medium truncate">${sourceName}</span>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" class="btn-delete-article p-2 rounded-xl bg-slate-900/85 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-all" title="Удалить новость">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
            </button>
            <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-xl bg-slate-900/85 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-sky-500/40 text-xs font-semibold flex items-center gap-1 transition-all">
              <span>Источник</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Bind media preview zoom
  const mediaEl = card.querySelector('.card-media-preview');
  if (mediaEl) {
    mediaEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const imgEl = mediaEl.querySelector('img');
      let currentSrc = (imgEl && imgEl.src) ? imgEl.src : image;
      if (imgEl && imgEl.naturalWidth && (imgEl.naturalWidth < 350 || imgEl.naturalHeight < 250)) {
        currentSrc = fallbackImg;
      }
      openMediaZoom(hasVideo ? 'video' : 'image', hasVideo ? videoSrc : currentSrc, rawTitle, image, fallbackImg);
    });
  }

  const videoZoomBtn = card.querySelector('.btn-open-video-zoom');
  if (videoZoomBtn) {
    videoZoomBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMediaZoom('video', videoSrc, rawTitle, image);
    });
  }

  // Bind delete handler
  const deleteBtn = card.querySelector('.btn-delete-article');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showDeleteConfirmModal({
        title: 'Удалить эту новость?',
        snippet: rawTitle,
        desc: 'Запись будет безвозвратно удалена из базы данных.',
        confirmText: 'Удалить',
        onConfirm: async () => {
          deleteBtn.disabled = true;
          try {
            await deleteArticleById(article.id);
            removeArticleLocally(article.id);
            showToast('Новость удалена', 'Запись удалена из базы данных', 'info');
            if (typeof options.onDeleted === 'function') options.onDeleted(article.id);
          } catch (err) {
            showToast('Ошибка удаления', err.message, 'danger');
            deleteBtn.disabled = false;
          }
        },
      });
    });
  }

  return card;
}
