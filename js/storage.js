export default class StorageManager {
  constructor() {
    this.STATE_KEY = 'lab2048_state_v1';
    this.LEAD_KEY = 'lab2048_leaderboard_v1';
  }

  saveState(state){
    localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
  }

  loadState(){
    const raw = localStorage.getItem(this.STATE_KEY);
    if(!raw) return null;
    try { return JSON.parse(raw); } catch(e) { return null; }
  }

  getLeaderboard(){
    const raw = localStorage.getItem(this.LEAD_KEY);
    if(!raw) return [];
    try{ return JSON.parse(raw); }catch(e){return [];}
  }

  saveLeaderboard(arr){
    localStorage.setItem(this.LEAD_KEY, JSON.stringify(arr));
  }

  pushScore(name, score){
    const arr = this.getLeaderboard();
    arr.push({name: name || 'Anonymous', score, date: (new Date()).toISOString()});
    arr.sort((a,b)=>b.score-a.score);
    this.saveLeaderboard(arr.slice(0,100));
  }
}
