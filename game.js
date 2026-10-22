import { buildEntries } from './puzzles.js';

export class CrosswordGame {
  constructor(puzzle, saved = {}) {
    this.puzzle = puzzle;
    this.solution = puzzle.grid.join('').split('');
    this.entries = buildEntries(puzzle);
    this.allEntries = [...this.entries.across, ...this.entries.down];
    this.openCells = this.solution.map((v, i) => v !== '#' ? i : -1).filter(i => i >= 0);
    const data = saved?.puzzleId === puzzle.id ? saved : {};
    this.values = this.solution.map((v, i) => v !== '#' && /^[A-Z]$/.test(data.values?.[i] || '') ? data.values[i] : '');
    this.marks = this.solution.map((_, i) => ['correct', 'incorrect', 'revealed'].includes(data.marks?.[i]) ? data.marks[i] : '');
    this.pencils = this.solution.map((_, i) => Boolean(data.pencils?.[i]));
    this.selected = this.openCells.includes(data.selected) ? data.selected : this.openCells[0];
    this.direction = data.direction === 'down' ? 'down' : 'across';
    this.assisted = Boolean(data.assisted);
    this.elapsedMs = Math.max(0, Number(data.elapsedMs) || 0);
    this.status = this.isComplete() ? 'solved' : data.status && data.status !== 'ready' ? 'paused' : 'ready';
  }

  get activeEntry() { return this.entries[this.direction].find(entry => entry.cells.includes(this.selected)); }
  get filledCount() { return this.openCells.filter(i => this.values[i]).length; }
  isComplete() { return this.openCells.every(i => this.values[i] === this.solution[i]); }
  start() { if (this.status !== 'solved') this.status = 'playing'; }

  selectCell(index) {
    if (!this.openCells.includes(index)) return;
    if (this.selected === index) this.toggleDirection();
    this.selected = index;
  }
  toggleDirection() { this.direction = this.direction === 'across' ? 'down' : 'across'; }
  selectEntry(entry) { this.direction = entry.direction; this.selected = entry.cells[0]; }
  nextEntry(step = 1, skipFilled = false) {
    const current = this.allEntries.indexOf(this.activeEntry);
    for (let n = 1; n <= this.allEntries.length; n++) {
      const entry = this.allEntries[(current + step * n + this.allEntries.length * 2) % this.allEntries.length];
      if (!skipFilled || entry.cells.some(i => !this.values[i])) {
        this.selectEntry(entry);
        if (skipFilled) this.selected = entry.cells.find(i => !this.values[i]) ?? entry.cells[0];
        return;
      }
    }
  }
  advance(skipFilled = true) {
    const cells = this.activeEntry.cells;
    const remaining = cells.slice(cells.indexOf(this.selected) + 1);
    const next = remaining.find(i => !skipFilled || !this.values[i]);
    if (next !== undefined) this.selected = next;
    else {
      const earlier = skipFilled ? cells.find(i => !this.values[i]) : undefined;
      if (earlier !== undefined) this.selected = earlier;
      else this.nextEntry(1, skipFilled);
    }
  }
  setLetter(letter, { pencil = false, autoCheck = false, skipFilled = true } = {}) {
    if (this.status === 'solved' || !/^[a-z]$/i.test(letter)) return;
    this.start();
    const index = this.selected;
    this.values[index] = letter.toUpperCase();
    this.pencils[index] = pencil;
    this.marks[index] = autoCheck ? (this.values[index] === this.solution[index] ? 'correct' : 'incorrect') : '';
    if (autoCheck) this.assisted = true;
    if (this.isComplete()) this.status = 'solved';
    else this.advance(skipFilled);
  }
  erase() {
    if (this.status === 'solved') return;
    this.start();
    if (!this.values[this.selected]) {
      const cells = this.activeEntry.cells;
      this.selected = cells[Math.max(0, cells.indexOf(this.selected) - 1)];
    }
    this.values[this.selected] = ''; this.marks[this.selected] = ''; this.pencils[this.selected] = false;
  }
  moveArrow(key) {
    const horizontal = key === 'ArrowLeft' || key === 'ArrowRight';
    const direction = horizontal ? 'across' : 'down';
    if (this.direction !== direction) { this.direction = direction; return; }
    const step = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : key === 'ArrowUp' ? -5 : 5;
    let next = this.selected + step;
    while (next >= 0 && next < 25) {
      if (horizontal && Math.floor(next / 5) !== Math.floor(this.selected / 5)) return;
      if (this.solution[next] !== '#') { this.selected = next; return; }
      next += step;
    }
  }
  scopeCells(scope) { return scope === 'square' ? [this.selected] : scope === 'word' ? this.activeEntry.cells : this.openCells; }
  check(scope) {
    const cells = this.scopeCells(scope).filter(i => this.values[i]);
    if (cells.length) this.assisted = true;
    for (const i of cells) if (this.marks[i] !== 'revealed') this.marks[i] = this.values[i] === this.solution[i] ? 'correct' : 'incorrect';
    return cells.filter(i => this.values[i] !== this.solution[i]).length;
  }
  reveal(scope) {
    if (this.status === 'solved') return;
    this.start(); this.assisted = true;
    for (const i of this.scopeCells(scope)) {
      this.values[i] = this.solution[i]; this.marks[i] = 'revealed'; this.pencils[i] = false;
    }
    if (this.isComplete()) this.status = 'solved';
  }
  snapshot() {
    return Object.fromEntries(['values', 'marks', 'pencils', 'selected', 'direction', 'assisted', 'elapsedMs', 'status'].map(k => [k, this[k]]).concat([['puzzleId', this.puzzle.id]]));
  }
}
