/**
 * Specialized live analytics widgets for categories:
 * - ukraine: 24h AI Security & Attack Digest
 * - f1: Latest GP Top-10, Drivers Standings & 2026 Races Calendar
 * - football: Terrikon Live 4 Tournaments + Standings & Matches
 * - cs2: HLTV Valve Top-20 Ranking (clickable team filter)
 * - it: TIOBE Top-10 Languages (clickable filter)
 */

import { cleanText, escapeHtml, sanitizeUrl } from '../config/categories.js';
import {
  fetchF1Results,
  fetchFootballResults,
  fetchHltvRanking,
  fetchUkraineSummary,
} from '../core/api.js';
import { appState } from '../core/state.js';

// ==========================================
// 1. UKRAINE 24H AI DIGEST WIDGET
// ==========================================
export async function mountUkraineWidget(container, { force = false } = {}) {
  if (!container) return;

  if (!appState.ukraineDigest || force) {
    container.innerHTML = `<div class="glass-panel p-4 rounded-3xl border border-sky-500/25 text-xs text-slate-400 text-center">Загрузка 24h AI-сводки...</div>`;
    try {
      appState.ukraineDigest = await fetchUkraineSummary(force);
    } catch (err) {
      container.innerHTML = `<div class="glass-panel p-4 rounded-3xl border border-rose-500/30 text-xs text-rose-300 text-center">Не удалось загрузить сводку: ${escapeHtml(err.message)}</div>`;
      return;
    }
  }

  const data = appState.ukraineDigest || {};
  const stats = data.stats || {};
  const bCount = (stats.ballistics_signals || 0) + (stats.missiles_signals || 0);
  const dCount = stats.drones_signals || 0;
  const pvoCount = stats.air_defense_signals || 0;
  const hotspots = Array.isArray(data.hotspots) ? data.hotspots : [];
  const latestSig = Array.isArray(data.recent_signals) && data.recent_signals[0];
  const channelUrl = sanitizeUrl(latestSig && latestSig.url, 'https://t.me/NovynaUKR');

  container.innerHTML = `
    <div class="glass-panel rounded-3xl p-4 sm:p-5 border border-sky-500/30 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-sky-950/20 shadow-xl space-y-3.5">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <span class="p-2 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-lg">🛡️</span>
          <div>
            <h3 class="text-sm sm:text-base font-black text-white font-heading">AI-Сводка безопасности (24ч)</h3>
            <span class="text-[11px] font-mono text-amber-300">${escapeHtml(data.attack_window || 'За последние 24 часа')}</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <a href="${channelUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold">@NovynaUKR ↗</a>
          <button type="button" id="ukr-widget-refresh" class="p-2 rounded-xl bg-slate-900 border border-slate-700 text-sky-300 hover:bg-slate-800" title="Обновить">↻</button>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <div class="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div class="text-[10px] text-amber-400 font-bold">🚀 Ракеты</div>
          <div class="text-base font-mono font-black text-white">${bCount}</div>
        </div>
        <div class="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div class="text-[10px] text-sky-400 font-bold">🛸 БПЛА</div>
          <div class="text-base font-mono font-black text-white">${dCount}</div>
        </div>
        <div class="p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <div class="text-[10px] text-emerald-400 font-bold">🛡️ ПВО</div>
          <div class="text-base font-mono font-black text-white">${pvoCount}</div>
        </div>
      </div>

      <div class="p-3 rounded-2xl bg-slate-950/75 border border-slate-800/80 text-xs text-slate-200 leading-relaxed space-y-2">
        <p>${escapeHtml(data.summary_text || 'Оперативная обстановка в регионах стабильная.')}</p>
        ${hotspots.length > 0 ? `
          <div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/70">
            ${hotspots.map((h) => `<span class="px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-semibold">📍 ${escapeHtml(h)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  const refreshBtn = container.querySelector('#ukr-widget-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => mountUkraineWidget(container, { force: true }));
  }
}

// ==========================================
// 2. F1 2026 STANDINGS & RACES WIDGET
// ==========================================
export async function mountF1Widget(container, { force = false } = {}) {
  if (!container) return;

  if (!appState.f1Results || force) {
    container.innerHTML = `<div class="glass-panel p-4 rounded-3xl border border-red-500/25 text-xs text-slate-400 text-center">Загрузка данных Formula 1...</div>`;
    try {
      appState.f1Results = await fetchF1Results(force);
    } catch (err) {
      container.innerHTML = `<div class="glass-panel p-4 rounded-3xl border border-rose-500/30 text-xs text-rose-300 text-center">Ошибка загрузки F1: ${escapeHtml(err.message)}</div>`;
      return;
    }
  }

  const data = appState.f1Results || {};
  const drivers = data.drivers || [];
  const races = data.races || [];
  const latestRace = data.latest_race;
  const activeTab = appState.f1ActiveTab || 'drivers';

  const latestBannerHtml = latestRace && Array.isArray(latestRace.top10) && latestRace.top10.length > 0
    ? `
      <div class="p-3.5 rounded-2xl bg-red-950/25 border border-red-500/30 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-red-300">🏁 Последний финиш: ${escapeHtml(cleanText(latestRace.grand_prix || 'Гран-при'))}</span>
          <span class="text-[10px] font-mono text-amber-300">Топ-10</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          ${latestRace.top10.slice(0, 10).map((d, idx) => `
            <div class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/75 border border-slate-800/80 text-[11px]">
              <span class="truncate text-white font-semibold"><span class="text-amber-400 font-mono mr-1">${d.pos || idx + 1}.</span>${escapeHtml(cleanText(d.driver || ''))}</span>
              <span class="font-mono text-emerald-400 shrink-0">${d.points ? `+${d.points}` : escapeHtml(d.time || '')}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `
    : '';

  const listHtml = activeTab === 'drivers'
    ? (drivers.length > 0
        ? drivers.map((d, idx) => {
            const pos = d.pos || idx + 1;
            const isRedBull = (d.team || '').toLowerCase().includes('red bull');
            const pts = d.points ?? d.pts ?? 0;
            return `
              <div class="p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${isRedBull ? 'bg-red-950/25 border-red-500/40' : 'bg-slate-950/65 border-slate-800/80'}">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${pos <= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}">${pos}</span>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-white truncate">${escapeHtml(cleanText(d.driver || 'Пилот'))}</div>
                    <div class="text-[10px] text-slate-400 truncate">${escapeHtml(cleanText(d.team || ''))}</div>
                  </div>
                </div>
                <span class="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">${pts} PTS</span>
              </div>
            `;
          }).join('')
        : '<div class="text-xs text-slate-400 text-center p-4">Нет данных о зачете пилотов</div>')
    : (races.length > 0
        ? races.map((r) => `
            <div class="p-2.5 rounded-2xl border bg-slate-950/65 border-slate-800/80 space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-white truncate">🏁 ${escapeHtml(cleanText(r.grand_prix || 'Гран-при'))}</span>
                <span class="text-[10px] font-mono text-slate-400 shrink-0">${escapeHtml(r.date || '')}</span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-300">
                <span>🏆 ${escapeHtml(cleanText(r.winner || '—'))} (${escapeHtml(cleanText(r.team || '—'))})</span>
                <span class="font-mono text-emerald-400">${escapeHtml(r.time || '')}</span>
              </div>
            </div>
          `).join('')
        : '<div class="text-xs text-slate-400 text-center p-4">Нет данных о гонках</div>');

  container.innerHTML = `
    <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-red-500/25 bg-slate-900/90 space-y-3.5">
      <div class="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-red-400">Formula 1 • ${escapeHtml(data.season || '2026')}</span>
          <h3 class="text-sm font-black text-white font-heading">🏁 Зачет и Гран-при</h3>
        </div>
        <button type="button" id="f1-widget-refresh" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700" title="Обновить">↻</button>
      </div>

      ${latestBannerHtml}

      <div class="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800">
        <button type="button" data-f1-tab="drivers" class="f1-tab-btn py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'drivers' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}">🏎️ Пилоты</button>
        <button type="button" data-f1-tab="races" class="f1-tab-btn py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'races' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}">🏁 Гран-при</button>
      </div>

      <div class="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">${listHtml}</div>
    </div>
  `;

  container.querySelector('#f1-widget-refresh')?.addEventListener('click', () => mountF1Widget(container, { force: true }));
  container.querySelectorAll('.f1-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      appState.f1ActiveTab = btn.getAttribute('data-f1-tab');
      mountF1Widget(container);
    });
  });
}

// ==========================================
// 3. FOOTBALL TERRIKON LIVE WIDGET
// ==========================================
function filterNationsGroups(groups, tier) {
  if (!groups || tier === 'all') return groups || [];
  const t = tier.toUpperCase();
  return groups.filter((g) => {
    const raw = (g.group || '').toUpperCase();
    if (t === 'A') return /[АA][1-4]/.test(raw) || raw.includes(' А') || raw.includes(' A');
    if (t === 'B') return /[ВB][1-4]/.test(raw) || raw.includes(' В') || raw.includes(' B');
    if (t === 'C') return /[СC][1-4]/.test(raw) || raw.includes(' С') || raw.includes(' C');
    if (t === 'D') return /[DД][1-4]/.test(raw) || raw.includes(' D') || raw.includes(' Д');
    return true;
  });
}

function renderStandingsRows(standings) {
  return (standings || []).map((item, idx) => {
    const pos = Number(item.pos || idx + 1);
    const isBarca = (item.team || '').toLowerCase().includes('барселона') || (item.team || '').toLowerCase().includes('barcelona');
    return `
      <div class="p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${isBarca ? 'bg-rose-950/30 border-rose-500/45' : 'bg-slate-950/65 border-slate-800/80'}">
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold ${pos === 1 ? 'bg-amber-500 text-slate-950' : pos <= 4 ? 'bg-sky-500/25 text-sky-300' : 'bg-slate-800 text-slate-300'}">${pos}</span>
          <div class="min-w-0">
            <div class="text-xs font-bold text-white truncate">${escapeHtml(cleanText(item.team || 'Команда'))}</div>
            <div class="text-[10px] text-slate-400 font-mono">И:${escapeHtml(item.games || '0')} В:${escapeHtml(item.win || '0')} Н:${escapeHtml(item.draw || '0')} П:${escapeHtml(item.loss || '0')}</div>
          </div>
        </div>
        <span class="font-mono text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 shrink-0">${escapeHtml(item.pts || '0')} О</span>
      </div>
    `;
  }).join('');
}

export async function mountFootballWidget(container, { force = false } = {}) {
  if (!container) return;
  const tourn = appState.footballTournament || 'laliga';

  if (!appState.footballResults[tourn] || force) {
    container.innerHTML = `<div class="glass-panel p-4 rounded-3xl border border-emerald-500/25 text-xs text-slate-400 text-center">Загрузка таблиц и матчей...</div>`;
    try {
      appState.footballResults[tourn] = await fetchFootballResults(tourn, force);
    } catch (err) {
      container.innerHTML = `<div class="glass-panel p-4 rounded-3xl border border-rose-500/30 text-xs text-rose-300 text-center">Ошибка загрузки футбола: ${escapeHtml(err.message)}</div>`;
      return;
    }
  }

  const data = appState.footballResults[tourn] || {};
  const view = appState.footballView || 'standings';
  const tier = appState.footballNationsTier || 'all';

  let bodyHtml = '';
  if (view === 'standings') {
    if (Array.isArray(data.groups) && data.groups.length > 0) {
      const groups = tourn === 'nations' ? filterNationsGroups(data.groups, tier) : data.groups;
      bodyHtml = groups.length > 0
        ? groups.map((g) => `
            <div class="space-y-1.5 mb-3">
              <div class="text-[11px] font-bold text-emerald-300 bg-slate-900 px-2.5 py-1 rounded-xl border border-emerald-500/30">🏆 ${escapeHtml(cleanText(g.group))}</div>
              ${renderStandingsRows(g.standings)}
            </div>
          `).join('')
        : '<div class="text-xs text-slate-400 p-4 text-center">Нет данных для этой лиги</div>';
    } else if (Array.isArray(data.standings) && data.standings.length > 0) {
      bodyHtml = renderStandingsRows(data.standings);
    } else {
      bodyHtml = '<div class="text-xs text-slate-400 p-4 text-center">Нет данных таблицы</div>';
    }
  } else {
    const matches = (data.matches || []).filter((m) => m && m.score && m.score.trim() !== '-:-' && /\d+/.test(m.score));
    bodyHtml = matches.length > 0
      ? matches.slice(0, 30).map((m) => `
          <div class="p-2.5 rounded-2xl border ${m.is_live ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-slate-950/65 border-slate-800/80'} space-y-1">
            <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>${m.is_live ? '🟢 LIVE' : '⚽ Матч'}</span>
              <span>${escapeHtml(m.date || '')}</span>
            </div>
            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="w-2/5 text-right font-semibold text-white truncate">${escapeHtml(cleanText(m.home || '—'))}</span>
              <span class="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono font-black text-emerald-400 shrink-0">${escapeHtml(m.score || 'vs')}</span>
              <span class="w-2/5 text-left font-semibold text-white truncate">${escapeHtml(cleanText(m.away || '—'))}</span>
            </div>
          </div>
        `).join('')
      : '<div class="text-xs text-slate-400 p-4 text-center">Нет завершённых матчей</div>';
  }

  const tournaments = [
    { id: 'laliga', label: '🇪🇸 Ла Лига' },
    { id: 'cl', label: '⭐ ЛЧ' },
    { id: 'el', label: '🏆 ЛЕ' },
    { id: 'nations', label: '🌍 Нации' },
  ];

  container.innerHTML = `
    <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-emerald-500/25 bg-slate-900/90 space-y-3">
      <div class="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Футбол • Terrikon Live</span>
          <h3 class="text-sm font-black text-white font-heading">${escapeHtml(data.title || 'Турниры')}</h3>
        </div>
        <button type="button" id="fb-widget-refresh" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700" title="Обновить">↻</button>
      </div>

      <div class="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-950/90 border border-slate-800">
        ${tournaments.map((t) => `
          <button type="button" data-fb-tourn="${t.id}"
            class="fb-tourn-btn py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all truncate ${tourn === t.id ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
            ${t.label}
          </button>
        `).join('')}
      </div>

      ${tourn === 'nations' ? `
        <div class="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-[10px]">
          ${['all', 'A', 'B', 'C', 'D'].map((t) => `
            <button type="button" data-nations-tier="${t}"
              class="fb-tier-btn py-1 rounded-lg font-bold ${tier === t ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}">
              ${t === 'all' ? 'Все' : `Лига ${t}`}
            </button>
          `).join('')}
        </div>
      ` : ''}

      <div class="grid grid-cols-2 gap-1.5">
        <button type="button" data-fb-view="standings" class="fb-view-btn py-1.5 rounded-xl text-xs font-bold border ${view === 'standings' ? 'bg-slate-800 text-emerald-400 border-emerald-500/40' : 'bg-slate-950/60 text-slate-400 border-slate-800'}">Таблица</button>
        <button type="button" data-fb-view="matches" class="fb-view-btn py-1.5 rounded-xl text-xs font-bold border ${view === 'matches' ? 'bg-slate-800 text-emerald-400 border-emerald-500/40' : 'bg-slate-950/60 text-slate-400 border-slate-800'}">Матчи</button>
      </div>

      <div class="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">${bodyHtml}</div>
    </div>
  `;

  container.querySelector('#fb-widget-refresh')?.addEventListener('click', () => mountFootballWidget(container, { force: true }));
  container.querySelectorAll('.fb-tourn-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      appState.footballTournament = btn.getAttribute('data-fb-tourn');
      mountFootballWidget(container);
    });
  });
  container.querySelectorAll('.fb-view-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      appState.footballView = btn.getAttribute('data-fb-view');
      mountFootballWidget(container);
    });
  });
  container.querySelectorAll('.fb-tier-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      appState.footballNationsTier = btn.getAttribute('data-nations-tier');
      mountFootballWidget(container);
    });
  });
}

// ==========================================
// 4. CS2 HLTV VALVE RANKING WIDGET
// ==========================================
export async function mountCs2Widget(container, { force = false, selectedTeam = 'all', onSelectTeam = null } = {}) {
  if (!container) return;

  if (!appState.hltvRankings.length || force) {
    container.innerHTML = `<div class="glass-panel p-4 rounded-3xl border border-amber-500/25 text-xs text-slate-400 text-center">Загрузка рейтинга HLTV...</div>`;
    try {
      const data = await fetchHltvRanking(force);
      appState.hltvRankings = data.teams || [];
      appState.hltvMeta = data;
    } catch (err) {
      container.innerHTML = `<div class="glass-panel p-4 rounded-3xl border border-rose-500/30 text-xs text-rose-300 text-center">Ошибка HLTV: ${escapeHtml(err.message)}</div>`;
      return;
    }
  }

  const teams = appState.hltvRankings || [];
  const maxPoints = Math.max(...teams.map((t) => Number(t.points) || 1), 2100);
  const meta = appState.hltvMeta || {};

  container.innerHTML = `
    <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-amber-500/25 bg-slate-900/90 space-y-3">
      <div class="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400">🏆 HLTV Valve Ranking</span>
          <h3 class="text-sm font-black text-white font-heading">Топ-20 команд CS2</h3>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">${escapeHtml(meta.date || 'Live')}</span>
          <button type="button" id="hltv-widget-refresh" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700" title="Обновить">↻</button>
        </div>
      </div>

      <p class="text-[11px] text-slate-400">Нажмите на команду, чтобы отфильтровать новости по ней:</p>

      <div class="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
        ${teams.map((team, idx) => {
          const rank = team.rank || idx + 1;
          const pts = team.points || 0;
          const pct = Math.min(100, Math.round((pts / maxPoints) * 100));
          const isSelected = selectedTeam && selectedTeam.toLowerCase() === String(team.name || '').toLowerCase();
          return `
            <button type="button" data-team-name="${escapeHtml(team.name)}"
              class="hltv-team-btn w-full text-left p-2.5 rounded-2xl border transition-all ${isSelected ? 'bg-sky-500/25 border-sky-400' : 'bg-slate-950/65 border-slate-800/80 hover:border-amber-500/40'}">
              <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${rank <= 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}">${rank}</span>
                  ${team.logo ? `<img src="${sanitizeUrl(team.logo, '')}" alt="" class="w-4 h-4 object-contain shrink-0" onerror="this.style.display='none'">` : ''}
                  <span class="text-xs font-bold text-white truncate">${escapeHtml(team.name)}</span>
                </div>
                <span class="text-[11px] font-mono font-bold text-amber-400 shrink-0">${pts} pts</span>
              </div>
              <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="h-full rounded-full ${rank <= 3 ? 'bg-amber-400' : 'bg-sky-400'}" style="width: ${pct}%"></div>
              </div>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.querySelector('#hltv-widget-refresh')?.addEventListener('click', () => mountCs2Widget(container, { force: true, selectedTeam, onSelectTeam }));
  container.querySelectorAll('.hltv-team-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-team-name');
      if (typeof onSelectTeam === 'function') onSelectTeam(name);
    });
  });
}

// ==========================================
// 5. IT TOP-10 LANGUAGES WIDGET
// ==========================================
const IT_LANGUAGES_LEADERBOARD = [
  { id: 'python', icon: '🐍', name: 'Python', share: '25.4%', pct: 100, use: 'ИИ / ML (PyTorch), FastAPI бэкенд, автоматизация.' },
  { id: 'typescript', icon: '🔷', name: 'JS / TypeScript', share: '19.8%', pct: 78, use: 'Веб-фронтенд (React, Vue, Next.js), Node.js.' },
  { id: 'java', icon: '☕', name: 'Java', share: '10.2%', pct: 40, use: 'Enterprise (Spring Boot), банки и финтех.' },
  { id: 'c#', icon: '🎯', name: 'C# / .NET', share: '7.6%', pct: 30, use: 'Игры (Unity), корпоративные платформы, Cloud.' },
  { id: 'c++', icon: '⚡', name: 'C++', share: '7.1%', pct: 28, use: 'Unreal Engine, HFT, высоконагруженные системы.' },
  { id: 'go', icon: '🐹', name: 'Go (Golang)', share: '6.5%', pct: 25, use: 'K8s, Docker, микросервисы, сетевые демоны.' },
  { id: 'rust', icon: '🦀', name: 'Rust', share: '4.8%', pct: 19, use: 'Системный софт, безопасность памяти без GC, WASM.' },
  { id: 'php', icon: '🐘', name: 'PHP', share: '4.1%', pct: 16, use: 'Laravel, Symfony, веб-сервисы и CMS.' },
  { id: 'kotlin', icon: '🍏', name: 'Kotlin / Swift', share: '3.8%', pct: 15, use: 'Нативная мобильная разработка Android и iOS.' },
];

export function mountItWidget(container, { activeLang = 'all', onSelectLang = null } = {}) {
  if (!container) return;

  container.innerHTML = `
    <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-cyan-500/25 bg-slate-900/90 space-y-3">
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-400">TIOBE / Octoverse</span>
          <h3 class="text-sm font-black text-white font-heading">💻 Рейтинг языков</h3>
        </div>
        <button type="button" data-it-lang="all" class="it-lang-card text-[11px] font-bold text-cyan-300 hover:underline">Сбросить</button>
      </div>
      <div class="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        ${IT_LANGUAGES_LEADERBOARD.map((lang, idx) => {
          const isSelected = activeLang === lang.id;
          return `
            <button type="button" data-it-lang="${lang.id}"
              class="it-lang-card w-full text-left p-2.5 rounded-2xl border transition-all ${isSelected ? 'bg-cyan-500/20 border-cyan-400' : 'bg-slate-950/65 border-slate-800/80 hover:border-cyan-500/40'}">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-white">${lang.icon} ${lang.name}</span>
                <span class="text-[11px] font-mono font-bold text-cyan-300">#${idx + 1} • ${lang.share}</span>
              </div>
              <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                <div class="bg-cyan-400 h-full rounded-full" style="width: ${lang.pct}%"></div>
              </div>
              <p class="text-[11px] text-slate-400 leading-snug">${lang.use}</p>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.it-lang-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const langId = btn.getAttribute('data-it-lang');
      if (typeof onSelectLang === 'function') onSelectLang(langId);
    });
  });
}
