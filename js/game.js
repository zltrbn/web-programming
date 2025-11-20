export default class Game {
  constructor(size = 4) {
    this.SIZE = size;
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.prev = null;
    this.gameOver = false;
  }

  createEmptyGrid() {
    return Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(0));
  }

  cloneGrid(g) {
    return g.map(row => row.slice());
  }

  randomInt(n){ return Math.floor(Math.random()*n); }

  shuffleArray(a){
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
  }

  spawnRandomTiles(count = 1){
    const empties = [];
    for(let r=0;r<this.SIZE;r++) for(let c=0;c<this.SIZE;c++) if(this.grid[r][c]===0) empties.push([r,c]);
    if(empties.length===0) return;
    this.shuffleArray(empties);
    const n = Math.min(count, empties.length);
    for(let i=0;i<n;i++){
      const [r,c] = empties[i];
      this.grid[r][c] = (Math.random() < 0.9) ? 2 : 4;
    }
  }

  operateRowLeft(row){
    const filtered = row.filter(v=>v!==0);
    let moved = filtered.length !== row.filter(v=>v!==0).length;
    const merged = [];
    let gained = 0;
    for(let i=0;i<filtered.length;i++){
      if(i+1 < filtered.length && filtered[i] === filtered[i+1]){
        const newVal = filtered[i]*2;
        merged.push(newVal);
        gained += newVal;
        i++;
        moved = true;
      } else {
        merged.push(filtered[i]);
      }
    }
    while(merged.length < this.SIZE) merged.push(0);
    if(!moved){
      for(let i=0;i<this.SIZE;i++) if(row[i] !== merged[i]) { moved = true; break; }
    }
    return {row: merged, moved, gained};
  }

  rotateGrid(g, k=1){
    let res = this.cloneGrid(g);
    for(let t=0;t<k;t++){
      const tmp = this.createEmptyGrid();
      for(let r=0;r<this.SIZE;r++){
        for(let c=0;c<this.SIZE;c++){
          tmp[c][this.SIZE-1-r] = res[r][c];
        }
      }
      res = tmp;
    }
    return res;
  }

  move(direction){
    if(this.gameOver) return false;
    this.prev = {grid: this.cloneGrid(this.grid), score: this.score};
    let rotated = this.cloneGrid(this.grid);
    if(direction === 'up') rotated = this.rotateGrid(this.grid, 3);
    else if(direction === 'right') rotated = this.rotateGrid(this.grid, 2);
    else if(direction === 'down') rotated = this.rotateGrid(this.grid, 1);

    let movedAny = false;
    let gainedTotal = 0;
    const newGrid = this.createEmptyGrid();
    for(let r=0;r<this.SIZE;r++){
      const {row: newRow, moved, gained} = this.operateRowLeft(rotated[r]);
      newGrid[r] = newRow;
      if(moved) movedAny = true;
      gainedTotal += gained;
    }

    let final = newGrid;
    if(direction === 'up') final = this.rotateGrid(newGrid, 1);
    else if(direction === 'right') final = this.rotateGrid(newGrid, 2);
    else if(direction === 'down') final = this.rotateGrid(newGrid, 3);

    if(!movedAny) {
      return false;
    }

    this.grid = final;
    this.score += gainedTotal;

    const spawnCount = (Math.random() < 0.5) ? 1 : 2;
    this.spawnRandomTiles(spawnCount);

    if(this.checkGameOver()){
      this.gameOver = true;
    }

    return true;
  }

  checkGameOver(){
    for(let r=0;r<this.SIZE;r++) for(let c=0;c<this.SIZE;c++) if(this.grid[r][c]===0) return false;
    for(let r=0;r<this.SIZE;r++){
      for(let c=0;c<this.SIZE;c++){
        const v = this.grid[r][c];
        if(r+1<this.SIZE && this.grid[r+1][c]===v) return false;
        if(c+1<this.SIZE && this.grid[r][c+1]===v) return false;
      }
    }
    return true;
  }

  undo(){
    if(!this.prev || this.gameOver) return false;
    this.grid = this.cloneGrid(this.prev.grid);
    this.score = this.prev.score;
    this.prev = null;
    this.gameOver = false;
    return true;
  }

  restart(newSeed=true){
    this.grid = this.createEmptyGrid();
    this.score = 0;
    this.prev = null;
    this.gameOver = false;
    const firstCount = 1 + Math.floor(Math.random()*3);
    this.spawnRandomTiles(firstCount);
  }

  getState(){
    return { grid: this.grid, score: this.score, prev: this.prev, gameOver: this.gameOver };
  }

  setState(state){
    if(!state) return;
    this.grid = state.grid || this.createEmptyGrid();
    this.score = state.score || 0;
    this.prev = state.prev || null;
    this.gameOver = !!state.gameOver;
  }
}
