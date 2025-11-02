(() => {
  const SIZE = 4;
  const gridEl = document.getElementById('grid');
  const scoreEl = document.getElementById('score');
  let grid = createEmptyGrid();
  let score = 0;
  let gameOver = false;

  function createEmptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function cloneGrid(g) {
    return g.map(r => r.slice());
  }

  function buildGridMarkup() {
    gridEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        const v = grid[r][c];
        if (v) {
          const tile = document.createElement('div');
          tile.className = `tile tile-${v}`;
          tile.textContent = v;
          cell.appendChild(tile);
        }
        gridEl.appendChild(cell);
      }
    }
    scoreEl.textContent = score;
  }

  function operateRowLeft(row) {
    const filtered = row.filter(v => v !== 0);
    const merged = [];
    let gained = 0;
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i] === filtered[i + 1]) {
        const val = filtered[i] * 2;
        merged.push(val);
        gained += val;
        i++;
      } else merged.push(filtered[i]);
    }
    while (merged.length < SIZE) merged.push(0);
    return { row: merged, gained };
  }

  function rotateGrid(g, k = 1) {
    let res = cloneGrid(g);
    for (let t = 0; t < k; t++) {
      const tmp = createEmptyGrid();
      for (let r = 0; r < SIZE; r++)
        for (let c = 0; c < SIZE; c++)
          tmp[c][SIZE - 1 - r] = res[r][c];
      res = tmp;
    }
    return res;
  }

  function move(direction) {
    if (gameOver) return;
    let rotated = grid;
    if (direction === 'up') rotated = rotateGrid(grid, 3);
    else if (direction === 'right') rotated = rotateGrid(grid, 2);
    else if (direction === 'down') rotated = rotateGrid(grid, 1);

    let moved = false;
    let gainedTotal = 0;
    const newGrid = createEmptyGrid();
    for (let r = 0; r < SIZE; r++) {
      const { row, gained } = operateRowLeft(rotated[r]);
      if (row.some((v, i) => v !== rotated[r][i])) moved = true;
      newGrid[r] = row;
      gainedTotal += gained;
    }

    if (!moved) return;
    score += gainedTotal;

    if (direction === 'up') grid = rotateGrid(newGrid, 1);
    else if (direction === 'right') grid = rotateGrid(newGrid, 2);
    else if (direction === 'down') grid = rotateGrid(newGrid, 3);
    else grid = newGrid;

    spawnRandomTiles(1);
    buildGridMarkup();
  }

  function spawnRandomTiles(count = 1) {
    const empties = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (grid[r][c] === 0) empties.push([r, c]);
    if (!empties.length) return;
    for (let i = 0; i < count; i++) {
      const [r, c] = empties[Math.floor(Math.random() * empties.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  window.addEventListener('keydown', e => {
    const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    if (map[e.key]) {
      move(map[e.key]);
    }
  });

  function restart() {
    grid = createEmptyGrid();
    score = 0;
    spawnRandomTiles(2);
    buildGridMarkup();
  }

  restart();
})();
