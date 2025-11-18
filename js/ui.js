import Game from './game.js';
import StorageManager from './storage.js';

export default class UIManager {
  constructor() {
    this.game = new Game();
    this.storage = new StorageManager();

    this.gridEl = document.getElementById('grid');
    this.scoreEl = document.getElementById('score');
    this.undoBtn = document.getElementById('undoBtn');
    this.restartBtn = document.getElementById('restartBtn');
    this.leaderBtn = document.getElementById('leaderBtn');
    this.leaderboardModal = document.getElementById('leaderboardModal');
    this.leaderTableBody = document.querySelector('#leaderboardTable tbody');
    this.closeLeaderBtn = document.getElementById('closeLeaderBtn');
    this.overlay = document.getElementById('overlay');
    this.gameoverMsg = document.getElementById('gameoverMsg');
    this.saveForm = document.getElementById('saveForm');
    this.playerNameInput = document.getElementById('playerName');
    this.saveScoreBtn = document.getElementById('saveScoreBtn');
    this.overlayRestartBtn = document.getElementById('overlayRestartBtn');
    this.savedMsg = document.getElementById('savedMsg');
    this.mobileControls = document.getElementById('mobileСontrols');

    this._swipe = { startX:0, startY:0 };

    this.bindUI();
  }

  bindUI(){
    window.addEventListener('keydown', (e)=>{
      if(document.activeElement && (document.activeElement.tagName === 'INPUT')) return;
      const keyMap = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
        KeyA: 'left',
        KeyD: 'right',
        KeyW: 'up',
        KeyS: 'down'
      };
      const dir = keyMap[e.code] || keyMap[e.key];
      if(dir){
        const changed = this.game.move(dir);
        if(changed){
          e.preventDefault();
          this.afterMove();
        }
      }
    });

    this.mobileControls.addEventListener('click', e=>{
      const b = e.target.closest('button');
      if(!b) return;
      const dir = b.dataset.dir;
      if(dir){
        const changed = this.game.move(dir);
        if(changed) this.afterMove();
      }
    });

    //свайпы
    const el = this.gridEl;
    el.addEventListener('touchstart', e=>{
      const t = e.changedTouches[0];
      this._swipe.startX = t.pageX; this._swipe.startY = t.pageY;
    }, {passive:true});
    el.addEventListener('touchend', e=>{
      const t = e.changedTouches[0];
      const distX = t.pageX - this._swipe.startX;
      const distY = t.pageY - this._swipe.startY;
      const absX = Math.abs(distX), absY = Math.abs(distY);
      if(Math.max(absX, absY) < 20) return;
      if(absX > absY){
        if(distX > 0) this._doMove('right'); else this._doMove('left');
      } else {
        if(distY > 0) this._doMove('down'); else this._doMove('up');
      }
    }, {passive:true});

    //работающие кнопки
    this.undoBtn.addEventListener('click', ()=>{ if(this.game.undo()){ this.afterMove(); this.saveState(); } });
    this.restartBtn.addEventListener('click', ()=>{ this.game.restart(); this.buildGridMarkup(); this.hideOverlay(); this.saveState(); });
    this.leaderBtn.addEventListener('click', ()=>{ this.showLeaderboard(); });
    this.closeLeaderBtn.addEventListener('click', ()=>{ this.closeLeaderboard(); });
    this.overlayRestartBtn.addEventListener('click', ()=>{ this.game.restart(); this.buildGridMarkup(); this.hideOverlay(); this.saveState(); });

    this.saveScoreBtn.addEventListener('click', ()=>{
      const name = this.playerNameInput.value.trim() || 'Anonymous';
      //сохранение рекорда только один раз
      if(this.saveScoreBtn.disabled) return;
      this.storage.pushScore(name, this.game.score);
      this.saveScoreBtn.disabled = true;
      this.playerNameInput.disabled = true;
      this.saveForm.classList.add('hidden');
      this.savedMsg.classList.remove('hidden');
      this.saveState();
      setTimeout(()=>{ this.overlay.classList.add('hidden'); this.saveScoreBtn.disabled = false; this.playerNameInput.disabled = false; }, 1500);
    });

    window.addEventListener('resize', ()=> this.initMobileControlsVisibility());
  }

  _doMove(dir){
    const changed = this.game.move(dir);
    if(changed) this.afterMove();
  }

  afterMove(){
    this.buildGridMarkup();
    this.saveState();
    if(this.game.gameOver) this.showGameOver();
  }

  buildGridMarkup(){
    this.gridEl.innerHTML = '';
    for(let r=0;r<this.game.SIZE;r++){
      for(let c=0;c<this.game.SIZE;c++){
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        this.gridEl.appendChild(cell);
        const v = this.game.grid[r][c];
        if(v){
          const tile = this.createTileEl(v);
          cell.appendChild(tile);
        }
      }
    }
    this.scoreEl.textContent = this.game.score;
  }

  createTileEl(value){
    const el = document.createElement('div');
    el.className = `tile v${value} tile v${value} tile-${value} new tile`;
    el.textContent = value;
    el.classList.add('v'+value);
    setTimeout(()=>el.classList.remove('new'), 240);
    return el;
  }

  showGameOver(){
    this.overlay.classList.remove('hidden');
    this.gameoverMsg.textContent = 'Игра завершена';
    this.saveForm.classList.remove('hidden');
    this.playerNameInput.value = '';
    this.savedMsg.classList.add('hidden');
    this.initMobileControlsVisibility(false);
  }

  hideOverlay(){
    this.overlay.classList.add('hidden');
    this.initMobileControlsVisibility(true);
  }

//без innerHTML
showLeaderboard() {
  const arr = this.storage
    .getLeaderboard()
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  this.leaderTableBody.innerHTML = '';
  arr.forEach((rec, idx) => {
    const tr = document.createElement('tr');
    const tdPos = document.createElement('td');
    tdPos.textContent = idx + 1;
    const tdName = document.createElement('td');
    tdName.textContent = rec.name;
    const tdScore = document.createElement('td');
    tdScore.textContent = rec.score;
    const tdDate = document.createElement('td');
    tdDate.textContent = new Date(rec.date).toLocaleString();

    tr.appendChild(tdPos);
    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    tr.appendChild(tdDate);

    this.leaderTableBody.appendChild(tr);
  });

  this.leaderboardModal.classList.remove('hidden');
  this.leaderboardModal.setAttribute('aria-hidden', 'false');
  this.initMobileControlsVisibility(false);
}


  closeLeaderboard(){
    this.leaderboardModal.classList.add('hidden');
    this.leaderboardModal.setAttribute('aria-hidden','true');
    this.initMobileControlsVisibility(!this.game.gameOver);
  }

  saveState(){
    this.storage.saveState(this.game.getState());
  }

  loadState(){
    const s = this.storage.loadState();
    if(s) this.game.setState(s);
    return !!s;
  }

  escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  initMobileControlsVisibility(forceOn){
    if(typeof forceOn === 'boolean'){
      if(forceOn) this.mobileControls.style.display = '';
      else this.mobileControls.style.display = 'none';
      return;
    }
    if(window.innerWidth <= 700) this.mobileControls.style.display = '';
    else this.mobileControls.style.display = 'none';
  }

  init(){
    if(this.gridEl.children.length === 0){
      for(let i=0;i<this.game.SIZE*this.game.SIZE;i++){
        const cell = document.createElement('div');
        cell.className = 'cell';
        this.gridEl.appendChild(cell);
      }
    }

    const loaded = this.loadState();
    if(!loaded){
      this.game.restart();
      this.buildGridMarkup();
      this.saveState();
    } else {
      this.buildGridMarkup();
      if(this.game.gameOver) this.showGameOver(); else this.hideOverlay();
    }

    this.initMobileControlsVisibility();
  }
}
