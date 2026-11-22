/**
 * UI Modals, Toast notifications, Media Lightbox, Mobile Category Bottom-Sheet, and PWA helpers.
 */

import { CATEGORY_GROUPS, escapeHtml, sanitizeUrl } from '../config/categories.js';
import { getCategoryCountsMap, getOrderedCategories } from '../core/state.js';
import { navigateTo } from '../core/router.js';

let deferredPwaPrompt = null;
const HTTPS_PWA_URL = 'https://petroprog.tail703e6c.ts.net:8444';

export function showToast(title, message = '', type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast glass-panel p-3.5 rounded-2xl flex items-start gap-3 shadow-2xl border';

  let borderColor = 'border-sky-500/40';
  let iconColor = 'text-sky-400';
  if (type === 'success') {
    borderColor = 'border-emerald-500/40';
    iconColor = 'text-emerald-400';
  } else if (type === 'warning') {
    borderColor = 'border-amber-500/40';
    iconColor = 'text-amber-400';
  } else if (type === 'danger') {
    borderColor = 'border-rose-500/40';
    iconColor = 'text-rose-400';
  }

  toast.classList.add(borderColor);
  toast.innerHTML = `
    <div class="mt-0.5 ${iconColor} shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01"/>
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <h5 class="text-sm font-bold text-white leading-snug">${escapeHtml(title)}</h5>
      ${message ? `<p class="text-xs text-slate-300 mt-0.5 leading-relaxed">${escapeHtml(message)}</p>` : ''}
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

export function showDeleteConfirmModal({
  title = 'Удалить новость?',
  snippet = '',
  desc = 'Запись будет навсегда стерта из базы данных.',
  confirmText = 'Удалить',
  onConfirm,
}) {
  const modal = document.getElementById('delete-confirm-modal');
  if (!modal) {
    if (window.confirm(`${title}\n\n${snippet}\n\n${desc}`)) {
      if (typeof onConfirm === 'function') onConfirm();
    }
    return;
  }

  const titleEl = document.getElementById('delete-modal-title');
  const snippetEl = document.getElementById('delete-modal-snippet');
  const descEl = document.getElementById('delete-modal-desc');
  const cancelBtn = document.getElementById('delete-modal-cancel');
  const confirmBtn = document.getElementById('delete-modal-confirm');

  if (titleEl) titleEl.textContent = title;
  if (snippetEl) {
    if (snippet && snippet.trim()) {
      snippetEl.textContent = snippet;
      snippetEl.classList.remove('hidden');
    } else {
      snippetEl.classList.add('hidden');
    }
  }
  if (descEl) descEl.textContent = desc;
  if (confirmBtn) {
    const labelSpan = confirmBtn.querySelector('span');
    if (labelSpan) labelSpan.textContent = confirmText;
  }

  function closeModal() {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    cleanup();
  }

  function handleCancel(e) {
    if (e) e.preventDefault();
    closeModal();
  }

  async function handleConfirm(e) {
    if (e) e.preventDefault();
    closeModal();
    if (typeof onConfirm === 'function') {
      await onConfirm();
    }
  }

  function handleBackdrop(e) {
    if (e.target === modal) closeModal();
  }

  function handleKey(e) {
    if (e.key === 'Escape') closeModal();
  }

  function cleanup() {
    if (cancelBtn) cancelBtn.removeEventListener('click', handleCancel);
    if (confirmBtn) confirmBtn.removeEventListener('click', handleConfirm);
    modal.removeEventListener('click', handleBackdrop);
    window.removeEventListener('keydown', handleKey);
  }

  if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
  if (confirmBtn) confirmBtn.addEventListener('click', handleConfirm);
  modal.addEventListener('click', handleBackdrop);
  window.addEventListener('keydown', handleKey);

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// ==========================================
// MEDIA LIGHTBOX (IMAGE & VIDEO ZOOM)
// ==========================================
let isImageScaledUp = false;

export function openMediaZoom(type, src, title, poster = '', fallbackUrl = '') {
  const modal = document.getElementById('image-zoom-modal');
  const img = document.getElementById('zoom-modal-img');
  const vid = document.getElementById('zoom-modal-video');
  const caption = document.getElementById('zoom-modal-caption');
  const origBtn = document.getElementById('zoom-open-original-btn');
  const scaleBtn = document.getElementById('zoom-toggle-scale-btn');
  const scaleIndicator = document.getElementById('zoom-scale-indicator');
  const typeText = document.getElementById('zoom-type-text');
  const iconImg = document.getElementById('zoom-type-icon-img');
  const iconVid = document.getElementById('zoom-type-icon-video');
  const viewport = document.getElementById('zoom-viewport');
  if (!modal) return;

  const safeSrc = sanitizeUrl(src, '');
  const safeFallback = sanitizeUrl(fallbackUrl, '');

  if (type === 'video') {
    if (img) {
      img.src = '';
      img.classList.add('hidden');
    }
    if (vid) {
      vid.src = safeSrc;
      if (poster) vid.poster = sanitizeUrl(poster, '');
      vid.classList.remove('hidden');
      vid.currentTime = 0;
      vid.play().catch(() => {});
    }
    if (typeText) typeText.textContent = 'Просмотр видео';
    if (iconImg) iconImg.classList.add('hidden');
    if (iconVid) iconVid.classList.remove('hidden');
    if (scaleBtn) scaleBtn.classList.add('hidden');
    if (scaleIndicator) scaleIndicator.classList.add('hidden');
  } else {
    if (vid) {
      vid.pause();
      vid.src = '';
      vid.classList.add('hidden');
    }
    if (img) {
      img.onload = function () {
        if (this.naturalWidth && (this.naturalWidth < 350 || this.naturalHeight < 250) && safeFallback) {
          this.src = safeFallback;
          if (origBtn) origBtn.href = safeFallback;
        }
      };
      img.src = safeSrc;
      img.alt = title || '';
      img.classList.remove('hidden');
      img.className = 'max-h-[72vh] max-w-full object-contain rounded-lg transition-transform duration-200 cursor-pointer';
    }
    if (typeText) typeText.textContent = 'Просмотр фото';
    if (iconImg) iconImg.classList.remove('hidden');
    if (iconVid) iconVid.classList.add('hidden');
    if (scaleBtn) scaleBtn.classList.remove('hidden');
    if (scaleIndicator) {
      scaleIndicator.classList.remove('hidden');
      scaleIndicator.textContent = '100%';
    }
  }

  if (caption) caption.textContent = title || '';
  if (origBtn) origBtn.href = safeSrc || '#';

  isImageScaledUp = false;
  if (viewport) {
    viewport.className = 'relative w-full max-h-[76vh] overflow-auto rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl flex items-center justify-center p-2 cursor-pointer';
    viewport.scrollTop = 0;
    viewport.scrollLeft = 0;
  }
  const toggleLabel = document.getElementById('zoom-toggle-label');
  if (toggleLabel) toggleLabel.textContent = 'Увеличить';

  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  void modal.offsetWidth;
  modal.classList.remove('opacity-0');
  modal.classList.add('opacity-100');
  document.body.style.overflow = 'hidden';
}

export function closeImageZoom(e) {
  if (e && e.target && e.target.closest && (e.target.closest('#zoom-viewport') || e.target.closest('button') || e.target.closest('a'))) {
    return;
  }
  const modal = document.getElementById('image-zoom-modal');
  if (!modal) return;
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    const img = document.getElementById('zoom-modal-img');
    if (img) img.src = '';
    const vid = document.getElementById('zoom-modal-video');
    if (vid) {
      vid.pause();
      vid.src = '';
    }
  }, 240);
  document.body.style.overflow = '';
}

export function toggleZoomScale() {
  const img = document.getElementById('zoom-modal-img');
  const vid = document.getElementById('zoom-modal-video');
  if (vid && !vid.classList.contains('hidden')) {
    if (vid.requestFullscreen) vid.requestFullscreen().catch(() => {});
    return;
  }
  const viewport = document.getElementById('zoom-viewport');
  const scaleIndicator = document.getElementById('zoom-scale-indicator');
  const toggleLabel = document.getElementById('zoom-toggle-label');
  if (!img || !viewport) return;

  isImageScaledUp = !isImageScaledUp;
  if (isImageScaledUp) {
    img.className = 'max-h-none max-w-none w-[170%] md:w-[200%] object-contain rounded-lg transition-all duration-300 cursor-pointer shadow-2xl';
    viewport.className = 'relative w-full max-h-[76vh] overflow-auto rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl p-4 cursor-pointer block';
    if (scaleIndicator) scaleIndicator.textContent = '200%';
    if (toggleLabel) toggleLabel.textContent = 'Уменьшить';
  } else {
    img.className = 'max-h-[72vh] max-w-full object-contain rounded-lg transition-all duration-200 cursor-pointer';
    viewport.className = 'relative w-full max-h-[76vh] overflow-auto rounded-2xl border border-white/10 bg-slate-950/80 shadow-2xl flex items-center justify-center p-2 cursor-pointer';
    if (scaleIndicator) scaleIndicator.textContent = '100%';
    if (toggleLabel) toggleLabel.textContent = 'Увеличить';
  }
}

// ==========================================
// MOBILE CATEGORY BOTTOM-SHEET DRAWER
// ==========================================
export function openCategorySheet(activeSlug = null) {
  const modal = document.getElementById('category-sheet-modal');
  const content = document.getElementById('category-sheet-content');
  if (!modal || !content) return;

  const enabledCats = getOrderedCategories(false);
  const counts = getCategoryCountsMap();

  const groupedHtml = CATEGORY_GROUPS.map((grp) => {
    const grpCats = enabledCats.filter((c) => c.group === grp.id);
    if (grpCats.length === 0) return '';
    return `
      <div class="space-y-2">
        <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-1">
          <span>${grp.emoji}</span>
          <span>${escapeHtml(grp.title)}</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          ${grpCats.map((cat) => {
            const isCurrent = activeSlug === cat.slug;
            const count = counts[cat.slug] || 0;
            return `
              <button type="button" data-sheet-slug="${escapeHtml(cat.slug)}"
                class="sheet-cat-btn flex items-center justify-between gap-2 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                  isCurrent
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/15'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200'
                }">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-lg shrink-0">${cat.emoji}</span>
                  <span class="text-xs font-bold truncate">${escapeHtml(cat.shortName)}</span>
                </div>
                <span class="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-lg bg-slate-950/80 text-slate-300 border border-slate-800 shrink-0">${count}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  content.innerHTML = groupedHtml || `
    <div class="p-4 text-center text-xs text-slate-400">
      Все категории отключены в настройках.
    </div>
  `;

  content.querySelectorAll('.sheet-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.getAttribute('data-sheet-slug');
      closeCategorySheet();
      if (slug) navigateTo(`category/${slug}`);
    });
  });

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  requestAnimationFrame(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
  });
  document.body.style.overflow = 'hidden';
}

export function closeCategorySheet(e) {
  if (e && e.target && e.target.id !== 'category-sheet-modal') return;
  const modal = document.getElementById('category-sheet-modal');
  if (!modal) return;
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 200);
  document.body.style.overflow = '';
}

// ==========================================
// PWA INSTALL & ONLINE BADGE
// ==========================================
export function isStandalonePwa() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    window.navigator.standalone === true
  );
}

export function updateOnlineStatusBadge() {
  const badge = document.getElementById('app-connection-badge');
  if (!badge) return;
  if (navigator.onLine) {
    badge.textContent = 'Live';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
  } else {
    badge.textContent = 'Оффлайн';
    badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40';
  }
}

export function openPwaInstallModal() {
  const modal = document.getElementById('pwa-install-modal');
  const body = document.getElementById('pwa-modal-body');
  const openHttpsBtn = document.getElementById('pwa-open-https-btn');
  if (!modal || !body) return;

  const isHttpInsecure = window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (openHttpsBtn) {
    openHttpsBtn.href = HTTPS_PWA_URL;
  }

  if (isHttpInsecure) {
    if (openHttpsBtn) openHttpsBtn.classList.remove('hidden');
    body.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1.5">
        <div class="font-bold text-amber-300">⚠️ Требуется защищенное HTTPS-соединение</div>
        <p class="text-[11px] text-amber-100/90">
          Установка PWA на смартфон доступна только по протоколу <b>HTTPS</b>. Откройте защищенный адрес и нажмите «Установить».
        </p>
      </div>
    `;
  } else if (isIOS) {
    if (openHttpsBtn) openHttpsBtn.classList.add('hidden');
    body.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-2">
        <div class="font-bold text-sky-300">Установка на iPhone / iPad (Safari):</div>
        <ol class="list-decimal list-inside space-y-1.5 text-[11px] text-slate-200">
          <li>Нажмите <b>«Поделиться»</b> (квадрат со стрелкой вверх).</li>
          <li>Выберите <b>«На экран "Домой"»</b>.</li>
          <li>Нажмите <b>«Добавить»</b>.</li>
        </ol>
      </div>
    `;
  } else {
    if (openHttpsBtn) openHttpsBtn.classList.add('hidden');
    body.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-2">
        <div class="font-bold text-sky-300">Установка на Android / Desktop:</div>
        <ul class="list-disc list-inside space-y-1.5 text-[11px] text-slate-200">
          <li><b>Android (Chrome):</b> меню <b>⋮</b> → <b>«Установить приложение»</b> или <b>«Добавить на гл. экран»</b>.</li>
          <li><b>ПК (Chrome / Edge):</b> нажмите на иконку установки справа в адресной строке.</li>
        </ul>
      </div>
    `;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  requestAnimationFrame(() => {
    modal.classList.remove('opacity-0');
    modal.classList.add('opacity-100');
  });
}

export function closePwaInstallModal(event) {
  if (event && event.target && event.target.id !== 'pwa-install-modal') return;
  const modal = document.getElementById('pwa-install-modal');
  if (!modal) return;
  modal.classList.remove('opacity-100');
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
  }, 200);
}

export async function triggerPwaInstall() {
  if (deferredPwaPrompt) {
    try {
      deferredPwaPrompt.prompt();
      const { outcome } = await deferredPwaPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPwaPrompt = null;
        showToast('Установка начата', 'AI News добавляется на устройство', 'success');
      }
      return;
    } catch (err) {
      console.warn('[PWA] Install prompt error:', err);
    }
  }
  openPwaInstallModal();
}

export async function clearPwaCaches() {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.update()));
    }
    showToast('Кэш PWA очищен', 'Данные будут загружены заново с сервера', 'success');
  } catch (err) {
    showToast('Ошибка очистки кэша', err.message, 'danger');
  }
}

export function initPwaSupport(onOnlineCallback) {
  updateOnlineStatusBadge();

  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn && isStandalonePwa()) {
    installBtn.classList.add('hidden');
  }

  window.addEventListener('online', () => {
    updateOnlineStatusBadge();
    showToast('Сеть восстановлена', 'Обновляем свежие новости...', 'success');
    if (typeof onOnlineCallback === 'function') onOnlineCallback();
  });

  window.addEventListener('offline', () => {
    updateOnlineStatusBadge();
    showToast('Оффлайн-режим', 'Показываются новости из локального кэша', 'info');
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
    if (installBtn && !isStandalonePwa()) {
      installBtn.classList.remove('hidden');
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPwaPrompt = null;
    if (installBtn) installBtn.classList.add('hidden');
    closePwaInstallModal();
    showToast('AI News установлен!', 'Приложение готово к работе на главном экране', 'success');
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => console.warn('[PWA] SW registration warning:', err));
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const zoomModal = document.getElementById('image-zoom-modal');
      if (zoomModal && !zoomModal.classList.contains('hidden')) {
        closeImageZoom();
      }
      const sheetModal = document.getElementById('category-sheet-modal');
      if (sheetModal && !sheetModal.classList.contains('hidden')) {
        closeCategorySheet();
      }
    }
  });
}
