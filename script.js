(() => {
  const SIZE = 4;
  const gridEl = document.getElementById('grid');
  const scoreEl = document.getElementById('score');
  const undoBtn = document.getElementById('undoBtn');
  const restartBtn = document.getElementById('restartBtn');
  const overlay = document.getElementById('overlay');
  const gameoverMsg = document.getElementById('gameoverMsg');
  const saveForm = document.getElementById('saveForm');
  const playerNameInput = document.getElementById('playerName');
  const saveScoreBtn = document.getElementById('saveScoreBtn');
  const savedMsg = document.getElementById('savedMsg');
  const leaderBtn = document.getElementById('leaderBtn');
  const leaderboardModal = document.getElementById('leaderboardModal');
  const leaderTableBody = document.querySelector('#leaderboardTable tbody');
  const closeLeaderBtn = document.getElementById('closeLeaderBtn');

  let grid = createEmptyGrid();
  let score = 0;
  let prev = null;
  let gameOver = false;

  const STATE_KEY = 'lab2048_state_v1';

  function createEmptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function cloneGrid(g) {
    return g.map(row => row.slice());
  }

  function randomInt(n) {
    return Math.floor(Math.random() * n);
  }

  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  function saveAppState() {
    const state = { grid, score, prev, gameOver };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function loadAppState() {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return false;
    try {
      const s = JSON.parse(raw);
      grid = s.grid || createEmptyGrid();
      score = s.score || 0;
      prev = s.prev || null;
      gameOver = !!s.gameOver;
      return true;
    } catch (e) {
      return false;
    }
  }

  function buildGridMarkup() {
    gridEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        const v = grid[r][c];
        if (v) {
          const tile = createTileEl(v);
          cell.appendChild(tile);
        }
        gridEl.appendChild(cell);
      }
    }
    scoreEl.textContent = score;
  }

  function createTileEl(value) {
    const el = document.createElement('div');
    el.className = `tile v${value} new`;
    el.textContent = value;
    setTimeout(() => el.classList.remove('new'), 240);
    return el;
  }

  function operateRowLeft(row) {
    const filtered = row.filter(v => v !== 0);
    let moved = false;
    const merged = [];
    let gained = 0;

    for (let i = 0; i < filtered.length; i++) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        const newVal = filtered[i] * 2;
        merged.push(newVal);
        gained += newVal;
        i++;
        moved = true;
      } else {
        merged.push(filtered[i]);
      }
    }

    while (merged.length < SIZE) merged.push(0);
    for (let i = 0; i < SIZE; i++) if (merged[i] !== row[i]) moved = true;

    return { row: merged, moved, gained };
  }

  function rotateGrid(g, k = 1) {
    let res = cloneGrid(g);
    for (let t = 0; t < k; t++) {
      const tmp = createEmptyGrid();
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          tmp[c][SIZE - 1 - r] = res[r][c];
        }
      }
      res = tmp;
    }
    return res;
  }

  function move(direction) {
    if (gameOver) return false;
    prev = { grid: cloneGrid(grid), score };
    let rotated = cloneGrid(grid);

    if (direction === 'up') rotated = rotateGrid(grid, 3);
    else if (direction === 'right') rotated = rotateGrid(grid, 2);
    else if (direction === 'down') rotated = rotateGrid(grid, 1);

    let movedAny = false;
    let gainedTotal = 0;
    const newGrid = createEmptyGrid();

    for (let r = 0; r < SIZE; r++) {
      const { row: newRow, moved, gained } = operateRowLeft(rotated[r]);
      newGrid[r] = newRow;
      if (moved) movedAny = true;
      gainedTotal += gained;
    }

    if (!movedAny) return false;

    let final = newGrid;
    if (direction === 'up') final = rotateGrid(newGrid, 1);
    else if (direction === 'right') final = rotateGrid(newGrid, 2);
    else if (direction === 'down') final = rotateGrid(newGrid, 3);

    grid = final;
    score += gainedTotal;

    spawnRandomTiles(Math.random() < 0.5 ? 1 : 2);
    saveAppState();
    buildGridMarkup();
    return true;
  }

  function spawnRandomTiles(count = 1) {
    const empties = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (grid[r][c] === 0) empties.push([r, c]);
    if (!empties.length) return;
    shuffleArray(empties);
    for (let i = 0; i < Math.min(count, empties.length); i++) {
      const [r, c] = empties[i];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function undo() {
    if (!prev || gameOver) return;
    grid = cloneGrid(prev.grid);
    score = prev.score;
    prev = null;
    saveAppState();
    buildGridMarkup();
  }

  function restart() {
    grid = createEmptyGrid();
    score = 0;
    prev = null;
    gameOver = false;
    const firstCount = 1 + Math.floor(Math.random() * 3);
    spawnRandomTiles(firstCount);
    saveAppState();
    buildGridMarkup();
  }

  window.addEventListener('keydown', e => {
    const keyMap = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    };
    const dir = keyMap[e.code];
    if (dir) move(dir);
  });

  undoBtn.addEventListener('click', undo);
  restartBtn.addEventListener('click', restart);

    function getLeaderboard() {
    const raw = localStorage.getItem(LEAD_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  function saveLeaderboard(arr) {
    localStorage.setItem(LEAD_KEY, JSON.stringify(arr));
  }

  function showGameOver() {
    overlay.classList.remove('hidden');
    gameoverMsg.textContent = 'Игра завершена';
    saveForm.classList.remove('hidden');
    savedMsg.classList.add('hidden');
  }

  function hideOverlay() {
    overlay.classList.add('hidden');
  }

  function saveCurrentScore(name) {
    const arr = getLeaderboard();
    arr.push({ name, score, date: new Date().toISOString() });
    arr.sort((a, b) => b.score - a.score);
    saveLeaderboard(arr.slice(0, 100));
    savedMsg.classList.remove('hidden');
    saveForm.classList.add('hidden');
  }

  saveScoreBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim() || 'Anonymous';
    saveCurrentScore(name);
  });

  function showLeaderboard() {
    const arr = getLeaderboard().slice(0, 10);
    leaderTableBody.innerHTML = '';
    arr.forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i + 1}</td><td>${r.name}</td><td>${r.score}</td><td>${new Date(r.date).toLocaleString()}</td>`;
      leaderTableBody.appendChild(tr);
    });
    leaderboardModal.classList.remove('hidden');
  }

  leaderBtn.addEventListener('click', showLeaderboard);
  closeLeaderBtn.addEventListener('click', () => leaderboardModal.classList.add('hidden'));

  (function init() {
    for (let i = 0; i < SIZE * SIZE; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      gridEl.appendChild(cell);
    }

    const loaded = loadAppState();
    if (!loaded) {
      restart();
    } else {
      buildGridMarkup();
    }
  })();
})();
