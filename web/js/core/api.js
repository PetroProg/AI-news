/**
 * HTTP API client with explicit timeouts and structured error messages.
 */

const DEFAULT_TIMEOUT_MS = 12000;

async function requestJson(url, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data.detail || data.message || `Ошибка сервера (${response.status})`;
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Превышено время ожидания ответа сервера');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function fetchLiveNews(limit = 250) {
  return requestJson(`/api/news?limit=${encodeURIComponent(limit)}&t=${Date.now()}`, { timeoutMs: 18000 });
}

export function deleteArticleById(articleId) {
  return requestJson(`/api/news/${encodeURIComponent(articleId)}`, { method: 'DELETE' });
}

export function deleteCategoryNews(categoryNameOrSlug) {
  return requestJson(`/api/news/category/${encodeURIComponent(categoryNameOrSlug)}`, { method: 'DELETE', timeoutMs: 20000 });
}

export function triggerOldNewsCleanup(days = 7) {
  return requestJson(`/api/news/cleanup?days=${encodeURIComponent(days)}`, { method: 'POST', timeoutMs: 25000 });
}

export function fetchSystemStats() {
  return requestJson(`/api/stats?t=${Date.now()}`);
}

export function fetchSources() {
  return requestJson(`/api/sources?t=${Date.now()}`);
}

export function createSource(payload) {
  return requestJson('/api/sources', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateSource(sourceId, payload) {
  return requestJson(`/api/sources/${encodeURIComponent(sourceId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteSource(sourceId) {
  return requestJson(`/api/sources/${encodeURIComponent(sourceId)}`, {
    method: 'DELETE',
  });
}

export function fetchUkraineSummary(force = false) {
  return requestJson(`/api/ukraine/attacks-summary?t=${Date.now()}${force ? '&force=true' : ''}`);
}

export function fetchF1Results(force = false) {
  return requestJson(`/api/f1/results${force ? '?force=true' : ''}`);
}

export function fetchFootballResults(tournament = 'laliga', force = false) {
  return requestJson(`/api/football/results?tournament=${encodeURIComponent(tournament)}${force ? '&force=true' : ''}`);
}

export function fetchHltvRanking(force = false) {
  return requestJson(`/api/hltv/ranking${force ? '?force=true' : ''}`);
}

export function fetchNextQuiz(category = 'ai', exclude = '') {
  const qs = new URLSearchParams({ category });
  if (exclude) qs.set('exclude', exclude);
  return requestJson(`/api/quiz/next?${qs.toString()}`);
}
