import { CrosswordGame } from './game.js';
import { getPuzzleForDate, dateKey } from './puzzles.js';

const paths = {
  stats: '<path d="M4 20V12h4v8M10 20V4h4v16M16 20V8h4v12"/>',
  settings: '<path d="m9.5 3-.7 2.2-2 .9-2.2-.5-2 3.4 1.5 1.7v2.6L2.6 15l2 3.4 2.2-.5 2 .9.7 2.2h4l.7-2.2 2-.9 2.2.5 2-3.4-1.5-1.7v-2.6l1.5-1.7-2-3.4-2.2.5-2-.9-.7-2.2z"/><circle cx="11.5" cy="12" r="3"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 1.5-2.5 2-2.5 3.5M12 16.5h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 11h16M8 15h2M14 15h2"/>',
  pause: '<path d="M9 5v14M15 5v14" stroke-width="3"/>',
  play: '<path d="m8 4 12 8-12 8z"/>',
  pencil: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14z"/>',
  reset: '<path d="M3 10a9 9 0 1 1 1 8M3 4v6h6"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  'chevron-left': '<path d="m15 5-7 7 7 7"/>',
  'chevron-down': '<path d="m5 9 7 7 7-7"/>',
  'arrow-right': '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  'arrow-down': '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  keyboard: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/>',
  backspace: '<path d="M9 5h12v14H9l-7-7zM12 9l6 6M18 9l-6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  share: '<path d="M12 16V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const storagePrefix = 'mini-crossword:v1:';
let storageAvailable = true;
function readStore(key, fallback) { try { return JSON.parse(localStorage.getItem(storagePrefix + key)) ?? fallback; } catch { return fallback; } }
function writeStore(key, value) { try { localStorage.setItem(storagePrefix + key, JSON.stringify(value)); } catch { storageAvailable = false; } }
const settings = { skipFilled: true, showTimer: true, autoCheck: false, keyboard: matchMedia('(max-width: 700px)').matches, ...readStore('settings', {}) };
let records = readStore('records', {});
let activeDate = dateKey();
let game;
let pencil = false;
let lastTick = performance.now();
let toastTimer;
let resumeAfterDialog = false;
let dialogKind = '';
let lastFocusedElement;
const dialog = $('#dialog');

function injectIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
injectIcons();
function formatTime(milliseconds) { const seconds = Math.floor(milliseconds / 1000); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
function dateFromKey(key) { return new Date(`${key}T12:00:00`); }
function prettyDate(key, options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) { return dateFromKey(key).toLocaleDateString('en-US', options); }
function previousDate(key, n = 1) { const date = dateFromKey(key); date.setDate(date.getDate() - n); return dateKey(date); }
function tick() {
  const now = performance.now();
  if (game?.status === 'playing') game.elapsedMs += Math.max(0, now - lastTick);
  lastTick = now;
  $('#timer').textContent = formatTime(game?.elapsedMs || 0);
}
function save() {
  writeStore(`game:${activeDate}`, game.snapshot());
  $('#save-status').textContent = storageAvailable ? 'Saved on this device' : 'Progress is not saved in this browser';
}
function start() {
  if (game.status === 'ready' || game.status === 'paused') { lastTick = performance.now(); game.start(); }
}
function focusGrid() { $(`#grid [data-cell="${game.selected}"]`)?.focus({ preventScroll: true }); }
function loadPuzzle(key) {
  if (game) { tick(); save(); }
  activeDate = key;
  game = new CrosswordGame(getPuzzleForDate(key), readStore(`game:${key}`, {}));
  lastTick = performance.now();
  pencil = false;
  const today = key === dateKey();
  $('#puzzle-date').textContent = prettyDate(key);
  $('#puzzle-subtitle').textContent = `${today ? 'Today’s puzzle' : 'From the archive'} · ${game.puzzle.difficulty} · ${game.openCells.length} squares`;
  $('.nav-link[data-action="today"]').classList.toggle('active', today);
  $('.nav-link[data-action="archive"]').classList.toggle('active', !today);
  const numbers = new Map(game.allEntries.map(entry => [entry.cells[0], entry.number]));
  $('#grid').innerHTML = game.solution.map((letter, i) => letter === '#'
    ? '<div class="cell block" aria-hidden="true"></div>'
    : `<button class="cell" data-cell="${i}" tabindex="-1"><span class="cell-number">${numbers.get(i) || ''}</span><span class="cell-letter"></span></button>`).join('');
  for (const direction of ['across', 'down']) {
    $(`#${direction}-clues`).innerHTML = game.entries[direction].map(entry => `<li><button class="clue-button" data-clue="${entry.number}" data-direction="${direction}"><span class="clue-number">${entry.number}</span><span class="clue-text">${escape(entry.clue)}</span></button></li>`).join('');
  }
  render();
}
function render() {
  const active = game.activeEntry;
  const crossing = game.entries[game.direction === 'across' ? 'down' : 'across'].find(entry => entry.cells.includes(game.selected));
  $('#active-clue').innerHTML = `<strong>${active.number} ${game.direction === 'across' ? 'ACROSS' : 'DOWN'}</strong><span>${escape(active.clue)}</span>`;
  $$('#grid .cell[data-cell]').forEach(cell => {
    const i = Number(cell.dataset.cell);
    cell.className = ['cell', active.cells.includes(i) ? 'highlighted' : '', i === game.selected ? 'selected' : '', game.marks[i], game.pencils[i] ? 'penciled' : ''].filter(Boolean).join(' ');
    cell.querySelector('.cell-letter').textContent = game.values[i];
    cell.tabIndex = i === game.selected ? 0 : -1;
    cell.setAttribute('aria-label', `Row ${Math.floor(i / 5) + 1}, column ${i % 5 + 1}${cell.querySelector('.cell-number').textContent ? ', square ' + cell.querySelector('.cell-number').textContent : ''}: ${game.values[i] || 'empty'}${game.marks[i] ? ', ' + game.marks[i] : ''}`);
    cell.setAttribute('aria-pressed', String(i === game.selected));
  });
  $$('.clue-button').forEach(button => {
    const entry = game.entries[button.dataset.direction].find(e => e.number === Number(button.dataset.clue));
    button.classList.toggle('active', entry === active);
    button.classList.toggle('crossing', entry === crossing);
    button.classList.toggle('filled', entry.cells.every(i => game.values[i]));
    button.setAttribute('aria-current', entry === active ? 'true' : 'false');
  });
  const paused = game.status === 'paused';
  const solved = game.status === 'solved';
  $('#pause-overlay').hidden = !paused;
  $('.game-content').classList.toggle('paused', paused);
  $('#grid').classList.toggle('solved', solved);
  $('#pause-button').disabled = solved;
  $('#pause-button').innerHTML = icon(paused ? 'play' : 'pause');
  $('#pause-button').setAttribute('aria-label', paused ? 'Resume puzzle' : 'Pause puzzle');
  $('#solved-badge').hidden = !solved;
  $('#pencil-button').setAttribute('aria-pressed', String(pencil));
  $('#pencil-button').disabled = solved;
  $$('[data-menu]').forEach(button => { button.disabled = solved; });
  $('#timer').hidden = !settings.showTimer;
  $('#timer').textContent = formatTime(game.elapsedMs);
  $('#progress-text').textContent = `${game.filledCount} of ${game.openCells.length} squares${solved ? ' · Solved' : ''}`;
  $('#keyboard').hidden = !settings.keyboard || paused || solved;
  $('#keyboard-toggle').setAttribute('aria-expanded', String(settings.keyboard));
  $('#autocheck-indicator').textContent = settings.autoCheck ? 'On' : 'Off';
  $('#grid').inert = paused;
  $('#clues-panel').inert = paused;
  save();
}

function toast(text) { clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').hidden = false; toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4000); }
function closeMenus() { $$('.tool-menu').forEach(menu => { menu.hidden = true; }); $$('[data-menu]').forEach(button => button.setAttribute('aria-expanded', 'false')); }
function afterEdit() {
  if (game.status === 'solved') {
    if (!records[activeDate] || (records[activeDate].assisted && !game.assisted) || (records[activeDate].assisted === game.assisted && records[activeDate].elapsedMs > game.elapsedMs)) {
      records[activeDate] = { elapsedMs: game.elapsedMs, assisted: game.assisted };
      writeStore('records', records);
    }
    render();
    openDialog('success');
  } else {
    render(); focusGrid();
    if (game.filledCount === game.openCells.length) toast('One or more letters are incorrect.');
  }
}
function typeLetter(letter) {
  if (game.status === 'paused' || game.status === 'solved') return;
  start(); tick();
  game.setLetter(letter, { pencil, autoCheck: settings.autoCheck, skipFilled: settings.skipFilled });
  afterEdit();
}
function streak() {
  let day = dateKey();
  if (!records[day]) day = previousDate(day);
  let count = 0;
  while (records[day]) { count++; day = previousDate(day); }
  return count;
}
function statsMarkup() {
  const solves = Object.values(records);
  const cleanSolves = solves.filter(r => !r.assisted);
  const best = cleanSolves.length ? formatTime(Math.min(...cleanSolves.map(r => r.elapsedMs))) : '—';
  return `<div class="stats-grid"><div class="stat"><strong>${solves.length}</strong><span>Puzzles solved</span></div><div class="stat"><strong>${streak()}</strong><span>Day streak</span></div><div class="stat"><strong>${best}</strong><span>Best unaided</span></div></div>`;
}
function openDialog(kind) {
  closeMenus();
  if (!dialog.open) {
    lastFocusedElement = document.activeElement;
    resumeAfterDialog = game.status === 'playing';
    if (resumeAfterDialog) { tick(); game.status = 'paused'; render(); }
  }
  dialogKind = kind;
  const content = $('#dialog-content');
  const setting = (key, title, detail) => `<label class="setting-row"><span><strong>${title}</strong><small>${detail}</small></span><input type="checkbox" data-setting="${key}" ${settings[key] ? 'checked' : ''}></label>`;
  const templates = {
    help: () => `<h2 id="dialog-title">How to play</h2><p>Fill the white squares. Each letter belongs to an Across answer and a Down answer.</p><div class="help-steps"><div class="help-step"><span class="step-number">1</span><div><strong>Select a square or clue</strong><p>Type your answer. Select the same square again to switch direction.</p></div></div><div class="help-step"><span class="step-number">2</span><div><strong>Follow the highlights</strong><p>Blue squares show the selected word. Yellow marks the square you’re typing in.</p></div></div><div class="help-step"><span class="step-number">3</span><div><strong>Check or reveal an answer</strong><p>Check marks incorrect letters. Reveal fills in answers. Both count as assistance.</p></div></div></div><div class="shortcuts"><div class="shortcut"><kbd>Space</kbd> Change direction</div><div class="shortcut"><kbd>Tab</kbd> Next clue</div><div class="shortcut"><kbd>↑ ↓ ← →</kbd> Move</div><div class="shortcut"><kbd>Shift Tab</kbd> Previous clue</div></div><div class="dialog-actions"><button class="primary-button" data-action="close">Back to puzzle</button></div>`,
    settings: () => `<h2 id="dialog-title">Settings</h2>${setting('skipFilled','Skip filled squares','Move to the next empty square as you type.')}${setting('showTimer','Show timer','Display elapsed time while playing.')}${setting('autoCheck','Autocheck','Mark incorrect letters as you type. Counts as assistance.')}${setting('keyboard','On-screen keyboard','Display a keyboard below the puzzle.')}<div class="dialog-actions"><button class="primary-button" data-action="close">Done</button></div>`,
    archive: () => `<h2 id="dialog-title">Archive</h2><p>Puzzles from the past seven days.</p><div class="archive-list">${Array.from({length:7},(_, n) => { const day = previousDate(dateKey(), n); const saved = readStore('game:' + day, {}); const record = records[day]; return `<button class="archive-item ${day === activeDate ? 'current' : ''}" data-date="${day}"><span><strong>${n === 0 ? 'Today' : prettyDate(day,{weekday:'long',month:'short',day:'numeric'})}</strong><small>${getPuzzleForDate(day).difficulty} · 5 × 5</small></span><span class="archive-status">${record ? 'Solved · ' + formatTime(record.elapsedMs) : saved.values?.some(Boolean) ? 'In progress' : 'Play'}</span></button>`; }).join('')}</div>`,
    stats: () => `<h2 id="dialog-title">Statistics</h2>${statsMarkup()}<p class="stats-note">Streaks count consecutive puzzle dates completed, including the archive. Best time excludes solves with Check, Reveal, or Autocheck. Statistics are saved in this browser.</p><div class="dialog-actions"><button class="primary-button" data-action="close">Back to puzzle</button></div>`,
    reset: () => `<h2 id="dialog-title">Restart puzzle?</h2><p>This clears the letters and resets the timer. Your completed-puzzle record stays saved.</p><div class="dialog-actions"><button class="secondary-button" data-action="close">Cancel</button><button class="primary-button" data-action="confirm-reset">Restart puzzle</button></div>`,
    reveal: () => `<h2 id="dialog-title">Reveal puzzle?</h2><p>This fills every square with its answer and records the puzzle as an assisted solve.</p><div class="dialog-actions"><button class="secondary-button" data-action="close">Cancel</button><button class="primary-button" data-action="confirm-reveal">Reveal puzzle</button></div>`,
    success: () => `<div class="success-content"><h2 id="dialog-title">Puzzle solved</h2><div class="success-time">${formatTime(game.elapsedMs)}</div><div class="success-label">${game.assisted ? 'Solved with assistance' : 'Solved without assistance'}</div>${statsMarkup()}<div class="dialog-actions"><button class="primary-button" data-action="share">${icon('share')} Share result</button><button class="secondary-button" data-action="archive">Play another</button></div><button class="text-link" data-action="close">Back to puzzle</button></div>`,
    privacy: () => `<h2 id="dialog-title">Privacy</h2><p>Your answers, times, preferences, and statistics are saved in this browser’s local storage. There’s no account, advertising, or game analytics.</p><p>Clearing your browser data clears that progress. The site is hosted on Vercel, which processes web requests. Fonts load from Google Fonts.</p><p>This is an independent crossword game with original puzzles, not affiliated with The New York Times.</p><div class="dialog-actions"><button class="primary-button" data-action="close">Done</button></div>`,
  };
  content.innerHTML = templates[kind]();
  if (!dialog.open) dialog.showModal();
  $('#dialog-close').focus();
}
function closeDialog({ resume = true } = {}) {
  if (resume && resumeAfterDialog && game.status === 'paused') { lastTick = performance.now(); game.start(); }
  resumeAfterDialog = false;
  dialog.close();
  render();
  if (lastFocusedElement?.isConnected) lastFocusedElement.focus({ preventScroll: true });
}
async function share() {
  const text = `Mini · ${prettyDate(activeDate,{month:'short',day:'numeric',year:'numeric'})}\n${formatTime(game.elapsedMs)}${game.assisted ? ' · Assisted' : ''}\n${location.origin}`;
  try { await navigator.clipboard.writeText(text); toast('Result copied.'); }
  catch {
    $('#dialog-content').innerHTML = `<h2 id="dialog-title">Share result</h2><p>Copy your result below.</p><textarea class="share-fallback" rows="5" readonly>${escape(text)}</textarea><div class="dialog-actions"><button class="primary-button" data-action="close">Done</button></div>`;
    $('.share-fallback').focus(); $('.share-fallback').select();
  }
}

const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
$('#keyboard').innerHTML = rows.map((row, i) => `<div class="keyboard-row">${i === 1 ? '<span class="key spacer"></span>' : ''}${i === 2 ? `<button class="key wide" data-key=" " aria-label="Switch direction">${icon('reset')}</button>` : ''}${[...row].map(letter => `<button class="key" data-key="${letter}" aria-label="Type ${letter}">${letter}</button>`).join('')}${i === 1 ? '<span class="key spacer"></span>' : ''}${i === 2 ? `<button class="key wide" data-key="Backspace" aria-label="Backspace">${icon('backspace')}</button>` : ''}</div>`).join('');

document.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!event.target.closest('.menu-wrap')) closeMenus();
  if (!target) return;
  if (target.dataset.cell !== undefined) {
    if (game.status === 'paused') return;
    start(); game.selectCell(Number(target.dataset.cell)); render(); focusGrid(); return;
  }
  if (target.dataset.clue) {
    if (game.status === 'paused') return;
    start(); game.selectEntry(game.entries[target.dataset.direction].find(entry => entry.number === Number(target.dataset.clue))); render(); focusGrid(); return;
  }
  if (target.dataset.key) { handleGameKey(target.dataset.key); return; }
  if (target.dataset.menu) {
    const menu = $(`#${target.dataset.menu}-menu`); const opening = menu.hidden; closeMenus(); menu.hidden = !opening; target.setAttribute('aria-expanded', String(opening)); return;
  }
  if (target.dataset.check) {
    if (game.status === 'paused') { toast('Resume the puzzle first.'); return; }
    const cells = game.scopeCells(target.dataset.check).filter(i => game.values[i]);
    const wrong = game.check(target.dataset.check); closeMenus(); render();
    toast(cells.length ? wrong ? `${wrong} incorrect ${wrong === 1 ? 'letter' : 'letters'}.` : 'All entered letters are correct.' : 'Enter a letter to check.'); focusGrid(); return;
  }
  if (target.dataset.reveal) {
    if (game.status === 'paused') { toast('Resume the puzzle first.'); return; }
    closeMenus();
    if (target.dataset.reveal === 'puzzle') openDialog('reveal');
    else { start(); tick(); game.reveal(target.dataset.reveal); afterEdit(); }
    return;
  }
  if (target.dataset.date) { closeDialog({resume:false}); loadPuzzle(target.dataset.date); return; }
  const action = target.dataset.action;
  if (['help','settings','stats','archive','reset','privacy'].includes(action)) { openDialog(action); return; }
  if (action === 'today') { if (dialog.open) closeDialog({resume:false}); loadPuzzle(dateKey()); }
  if (action === 'close') closeDialog();
  if (action === 'pencil') { pencil = !pencil; render(); focusGrid(); }
  if (action === 'keyboard') { settings.keyboard = !settings.keyboard; writeStore('settings', settings); render(); }
  if (action === 'autocheck') { settings.autoCheck = !settings.autoCheck; writeStore('settings',settings); render(); closeMenus(); toast(`Autocheck ${settings.autoCheck ? 'on. Typing now counts as assistance.' : 'off.'}`); }
  if (action === 'pause') { if (game.status === 'paused') start(); else if (game.status !== 'solved') { tick(); game.status = 'paused'; } render(); }
  if (action === 'resume') { start(); render(); focusGrid(); }
  if (action === 'next' || action === 'previous') { if (game.status === 'paused') return; start(); game.nextEntry(action === 'next' ? 1 : -1); render(); focusGrid(); }
  if (action === 'confirm-reset') { closeDialog({resume:false}); game = new CrosswordGame(game.puzzle); lastTick = performance.now(); render(); focusGrid(); }
  if (action === 'confirm-reveal') { closeDialog(); start(); tick(); game.reveal('puzzle'); afterEdit(); }
  if (action === 'share') share();
  if (action === 'results' && game.status === 'solved') openDialog('success');
});

function handleGameKey(key, shift = false) {
  if (game.status === 'paused' || game.status === 'solved') return false;
  if (/^[a-z]$/i.test(key)) { typeLetter(key); return true; }
  if (key === 'Backspace' || key === 'Delete') { start(); tick(); game.erase(); render(); focusGrid(); return true; }
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Tab','Enter'].includes(key)) {
    start();
    if (key.startsWith('Arrow')) game.moveArrow(key);
    else if (key === ' ' || key === 'Enter') game.toggleDirection();
    else game.nextEntry(shift ? -1 : 1);
    render(); focusGrid(); return true;
  }
  return false;
}
document.addEventListener('keydown', event => {
  if (event.metaKey || event.ctrlKey || event.altKey || dialog.open || event.target.matches('input,textarea')) return;
  if (event.key === 'Escape') { closeMenus(); $('#pause-button').focus(); return; }
  const inGrid = event.target.closest('#grid');
  const globalTyping = event.target === document.body;
  if (inGrid || globalTyping) {
    if (handleGameKey(event.key, event.shiftKey)) event.preventDefault();
  }
});
document.addEventListener('change', event => {
  if (!event.target.dataset.setting) return;
  settings[event.target.dataset.setting] = event.target.checked;
  writeStore('settings', settings); render();
});
dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); } });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.status === 'playing') { tick(); game.status = 'paused'; render(); }
  if (!document.hidden && activeDate !== dateKey() && !dialog.open) toast('Select Today to play today’s puzzle.');
});
window.addEventListener('pagehide', () => { tick(); save(); });
setInterval(() => { tick(); if (game.status === 'playing') save(); }, 1000);
loadPuzzle(activeDate);
