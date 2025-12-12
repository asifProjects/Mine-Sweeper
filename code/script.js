/* Minesweeper — Vanilla JS
   - Copy these three files into a folder and open index.html
   - Left click to reveal, right click to flag, long-press on touch devices to flag
   - First click is always safe (mines get placed after the first reveal)
*/

/* ----- Config & State ----- */
const presetEl = document.getElementById('preset');
const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const minesLeftEl = document.getElementById('mines-left');
const resetBtn = document.getElementById('resetBtn');
const customArea = document.getElementById('custom-area');
const startCustomBtn = document.getElementById('startCustom');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const minesInput = document.getElementById('mines');

let rows = 16, cols = 16, minesCount = 40;
let grid = [];         // 2D array of cell objects
let firstClick = true;
let running = false;
let timer = null;
let seconds = 0;
let flags = 0;
let revealedCount = 0;
let totalCells = 0;

/* ----- Utilities ----- */
const inBounds = (r,c) => r >= 0 && r < rows && c >= 0 && c < cols;
const neighborsCoord = (r,c) => {
  const res = [];
  for (let dr=-1; dr<=1; dr++){
    for (let dc=-1; dc<=1; dc++){
      if (dr===0 && dc===0) continue;
      const nr = r+dr, nc = c+dc;
      if (inBounds(nr,nc)) res.push([nr,nc]);
    }
  }
  return res;
};

function formatTime(s){
  const mm = String(Math.floor(s/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  return `${mm}:${ss}`;
}

/* ----- Game Setup ----- */
function setPreset(p){
  if (p === 'easy'){ rows=9; cols=9; minesCount=10 }
  else if (p === 'medium'){ rows=16; cols=16; minesCount=40 }
  else if (p === 'hard'){ rows=16; cols=30; minesCount=99 }
  else { /* custom selection shows controls */ }
}

function initGame(resetTimer = true){
  // reset state
  grid = [];
  firstClick = true;
  running = false;
  clearInterval(timer);
  timer = null;
  seconds = 0;
  flags = 0;
  revealedCount = 0;
  totalCells = rows * cols;

  // DOM
  timerEl.textContent = formatTime(0);
  minesLeftEl.textContent = `Mines: ${minesCount}`;
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${cols}, auto)`;

  // create empty grid data and tiles
  for (let r=0; r<rows; r++){
    const row = [];
    for (let c=0; c<cols; c++){
      const cell = {
        r, c,
        mine: false,
        revealed: false,
        flagged: false,
        neighbors: 0,
        el: null
      };
      row.push(cell);

      // create element
      const tile = document.createElement('button');
      tile.className = 'tile unrevealed';
      tile.setAttribute('aria-label', `Tile ${r+1}, ${c+1}`);
      tile.setAttribute('data-row', r);
      tile.setAttribute('data-col', c);
      tile.setAttribute('role', 'gridcell');

      // events
      tile.addEventListener('click', onTileClick);
      tile.addEventListener('contextmenu', onTileRightClick);
      // touch long-press for flagging
      addTouchFlagSupport(tile);

      boardEl.appendChild(tile);
      cell.el = tile;
    }
    grid.push(row);
  }
}

/* ----- Place Mines (after first click) ----- */
function placeMines(firstR, firstC){
  const placements = [];
  const exclude = new Set();
  exclude.add(`${firstR},${firstC}`);
  // also exclude neighbors so first click opens area
  neighborsCoord(firstR, firstC).forEach(([nr,nc]) => exclude.add(`${nr},${nc}`));

  while (placements.length < minesCount){
    const r = Math.floor(Math.random()*rows);
    const c = Math.floor(Math.random()*cols);
    const key = `${r},${c}`;
    if (exclude.has(key)) continue;
    if (grid[r][c].mine) continue;
    grid[r][c].mine = true;
    placements.push([r,c]);
  }

  // compute neighbor counts
  for (let r=0;r<rows;r++){
    for (let c=0;c<cols;c++){
      if (grid[r][c].mine) continue;
      const n = neighborsCoord(r,c).reduce((acc,[nr,nc]) => acc + (grid[nr][nc].mine ? 1 : 0), 0);
      grid[r][c].neighbors = n;
    }
  }
}

/* ----- Reveal logic ----- */
function revealCell(r,c){
  const cell = grid[r][c];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  revealedCount++;
  const el = cell.el;
  el.classList.remove('unrevealed');
  el.classList.add('revealed');
  el.setAttribute('aria-pressed', 'true');

  if (cell.mine){
    el.classList.add('mine');
    el.textContent = '💣';
    gameOver(false, r, c);
    return;
  }

  if (cell.neighbors > 0){
    el.dataset.neighbors = cell.neighbors;
    el.textContent = cell.neighbors;
  } else {
    // empty -> flood fill neighbors
    el.textContent = '';
    neighborsCoord(r,c).forEach(([nr,nc]) => {
      if (!grid[nr][nc].revealed) revealCell(nr,nc);
    });
  }

  checkWin();
}

/* ----- Flagging ----- */
function toggleFlag(r,c){
  const cell = grid[r][c];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  const el = cell.el;
  if (cell.flagged){
    el.classList.add('flagged');
    el.textContent = '🚩';
    flags++;
  } else {
    el.classList.remove('flagged');
    el.textContent = '';
    flags--;
  }
  minesLeftEl.textContent = `Mines: ${minesCount - flags}`;
}

/* ----- Events ----- */
function onTileClick(e){
  const r = Number(this.dataset.row), c = Number(this.dataset.col);
  if (!running && firstClick){
    // place mines after first click so first tile is safe
    placeMines(r,c);
    startTimer();
    running = true;
  }
  if (!running && !firstClick) startTimer();

  firstClick = false;

  // if the tile is flagged, ignore left-click
  if (grid[r][c].flagged) return;

  revealCell(r,c);
}

function onTileRightClick(e){
  e.preventDefault();
  const r = Number(this.dataset.row), c = Number(this.dataset.col);
  if (!running && firstClick){
    // no mines placed yet; but allow flagging before start (optional)
    firstClick = false;
    startTimer();
    running = true;
  }
  toggleFlag(r,c);
}

/* ----- Start / Timer / Reset / Win / Lose ----- */
function startTimer(){
  if (timer) return;
  timer = setInterval(() => {
    seconds++;
    timerEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer(){
  clearInterval(timer);
  timer = null;
}

function resetGame(){
  setPreset(presetEl.value);
  initGame();
}

function revealAllMines(hitR = null, hitC = null){
  for (let r=0;r<rows;r++){
    for (let c=0;c<cols;c++){
      const cell = grid[r][c];
      if (cell.mine){
        const el = cell.el;
        if (!(r===hitR && c===hitC)){
          el.classList.remove('unrevealed');
          el.classList.add('revealed');
          el.textContent = '💣';
        }
      }
    }
  }
}

function gameOver(won, hitR=null, hitC=null){
  stopTimer();
  running = false;

  if (won){
    // reveal remaining mines as flags (visual)
    for (let r=0;r<rows;r++){
      for (let c=0;c<cols;c++){
        const cell = grid[r][c];
        if (cell.mine && !cell.flagged){
          cell.el.textContent = '🚩';
          cell.el.classList.add('revealed');
        }
      }
    }
    setTimeout(()=> alert(`You win! Time: ${formatTime(seconds)}`), 50);
  } else {
    // reveal all mines and mark the exploded one
    revealAllMines(hitR, hitC);
    if (hitR !== null && hitC !== null){
      grid[hitR][hitC].el.classList.add('mine'); // already set when revealed
    }
    setTimeout(()=> alert(`Game Over — you hit a mine.`), 50);
  }
}

function checkWin(){
  // win when revealedCount === totalCells - minesCount
  if (revealedCount === totalCells - minesCount){
    gameOver(true);
  }
}

/* ----- Touch long-press support (flagging) ----- */
function addTouchFlagSupport(tile){
  let touchTimer = null;
  const TOUCH_DELAY = 500; // ms to consider long-press

  tile.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchTimer = setTimeout(() => {
      const r = Number(tile.dataset.row), c = Number(tile.dataset.col);
      toggleFlag(r,c);
      touchTimer = null;
    }, TOUCH_DELAY);
  }, {passive:false});

  tile.addEventListener('touchend', (e) => {
    if (touchTimer){
      // was a short tap — emulate click
      clearTimeout(touchTimer);
      touchTimer = null;
      tile.click();
    }
  });
}

/* ----- UI Wiring ----- */
presetEl.addEventListener('change', (e) => {
  if (e.target.value === 'custom'){
    customArea.classList.remove('hidden');
  } else {
    customArea.classList.add('hidden');
    setPreset(e.target.value);
    initGame();
  }
});

startCustomBtn.addEventListener('click', () => {
  const r = parseInt(rowsInput.value) || 10;
  const c = parseInt(colsInput.value) || 10;
  let m = parseInt(minesInput.value) || 10;
  // clamp values
  if (r < 5) rowsInput.value = 5;
  if (c < 5) colsInput.value = 5;
  const maxM = Math.max(1, Math.floor((r*c)-1));
  if (m > maxM) { m = maxM; minesInput.value = maxM; }
  rows = r; cols = c; minesCount = m;
  customArea.classList.add('hidden');
  presetEl.value = 'custom';
  initGame();
});

resetBtn.addEventListener('click', () => {
  initGame();
});

/* keyboard accessibility: space/enter on focused tile acts as click, F toggles flag */
boardEl.addEventListener('keydown', (e) => {
  const target = e.target;
  if (!target.classList.contains('tile')) return;
  const r = Number(target.dataset.row), c = Number(target.dataset.col);
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    target.click();
  } else if (e.key.toLowerCase() === 'f') {
    e.preventDefault();
    toggleFlag(r,c);
  }
});

/* ----- Initialize first render ----- */
setPreset(presetEl.value);
initGame();
