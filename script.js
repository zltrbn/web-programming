const STORAGE_KEY = 'todo_tasks_v1';

let tasks = [];
let filter = 'all';
let sortDir = 'asc';
let searchQuery = '';
let dateFilter = '';

// загружаем задачи из localStorage
function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  }catch(e){ tasks = [] }
}

// сохраняем задачи в localStorage
function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// создаем случайный уникальный id для задач
function uid(){ return Math.random().toString(36).slice(2,9) }

// строим интерфейс приложения
function buildUI(){
  const container = document.createElement('main');
  container.className = 'container';

  const header = document.createElement('header');
  header.className='header';

  const title = document.createElement('h1');
  title.className='title';
  title.textContent = 'ToDo List';
  header.appendChild(title);

  const card = document.createElement('section');
  card.className='card';
  const form = document.createElement('form');
  form.className='form';
  form.addEventListener('submit',
    e => { e.preventDefault(); onAdd(); });

  const input = document.createElement('input');
  input.type='text';
  input.placeholder='Название задачи';
  input.required=true;
  input.id='task-title';

  const date = document.createElement('input');
  date.type='date';
  date.id='task-date';
  const addBtn = document.createElement('button');
  addBtn.type='submit';
  addBtn.className='btn btn-primary';
  addBtn.textContent='Добавить';

  // вставляем элементы в форму через append
  form.append(input,date,addBtn);
  card.appendChild(form);

  const controls = document.createElement('aside'); controls.className='controls';
  const toolbar = document.createElement('div'); toolbar.className='toolbar';

  const searchBlock = document.createElement('div');
  searchBlock.className = 'search-block';

  const search = document.createElement('input');
  search.type='search';
  search.placeholder='Поиск по названию';
  search.className='search';
  search.addEventListener('input', e=>{ searchQuery = e.target.value.trim().toLowerCase(); renderList(); }); // перерисовываем список

  const dateSearch = document.createElement('input');
  dateSearch.type = 'date';
  dateSearch.className = 'search';
  dateSearch.onchange = e => {
    dateFilter = e.target.value;
    renderList(); // перерисовываем список
  };

  // вставляем поля поиска в блок
  searchBlock.append(search, dateSearch);

  // фильтры (все, выполненные, невыполненные)
  const filters = document.createElement('div'); filters.className='filters';
  [['all','Все'],['active','Невыполненные'],['completed','Выполненные']].forEach(([val,label])=>{
    const b = document.createElement('button'); b.type='button'; b.className='btn small'; b.textContent = label;
    b.onclick = ()=>{ filter=val; [...filters.children].forEach(ch=>ch.disabled=false); b.disabled=true; renderList(); };
    if(val==='all') b.disabled = true;
    filters.appendChild(b);
  });

  // выпадающий список для сортировки
  const sortSelect = document.createElement('select'); sortSelect.className='sort-select';
  const opt1 = document.createElement('option'); opt1.value='asc'; opt1.textContent='Сортировать по дате ↑';
  const opt2 = document.createElement('option'); opt2.value='desc'; opt2.textContent='Сортировать по дате ↓';
  sortSelect.append(opt1,opt2);
  sortSelect.onchange = e=>{ sortDir = e.target.value; renderList(); };

  // вставляем все элементы управления
  toolbar.append(searchBlock, filters, sortSelect);
  controls.appendChild(toolbar);
  card.appendChild(controls);
  header.appendChild(card);
  container.appendChild(header);

  // список задач
  const listCard = document.createElement('section'); listCard.className='card';
  const list = document.createElement('div'); list.className='list'; list.id='task-list'; listCard.appendChild(list);
  container.appendChild(listCard);

  // вставляем всё в body
  document.body.appendChild(container);

  // настраиваем драг анд дроп
  setupDragAndDrop(list);
}

// добавление задачи
function onAdd(){
  const titleEl = document.getElementById('task-title');
  const dateEl = document.getElementById('task-date');
  const title = titleEl.value.trim();
  if(!title) return;
  const due = dateEl.value ? new Date(dateEl.value).toISOString() : null;
  tasks.push({ id: uid(), title, due, completed:false, createdAt:new Date().toISOString() });
  save();
  titleEl.value=''; dateEl.value='';
  renderList();
}

// удаление задачи
function removeTask(id){
  tasks = tasks.filter(t=>t.id!==id);
  save(); renderList();
}

// редактирование задачи
function editTask(id){
  const t = tasks.find(x=>x.id===id); if(!t) return; // через модалку
  const modal = document.createElement('div'); modal.className='card';
  modal.style.position='fixed'; modal.style.left='50%'; modal.style.top='50%'; modal.style.transform='translate(-50%,-50%)'; modal.style.zIndex='999';

  const f = document.createElement('form'); f.className='form';
  const inp = document.createElement('input'); inp.type='text'; inp.value=t.title; inp.required=true;
  const d = document.createElement('input'); d.type='date'; d.value = t.due ? new Date(t.due).toISOString().slice(0,10) : '';
  const saveBtn = document.createElement('button'); saveBtn.type='submit'; saveBtn.className='btn btn-primary'; saveBtn.textContent='Сохранить';
  const cancelBtn = document.createElement('button'); cancelBtn.type='button'; cancelBtn.className='btn'; cancelBtn.textContent='Отмена';
  cancelBtn.onclick = ()=>{ document.body.removeChild(modal); };

  f.onsubmit = e=>{ e.preventDefault(); t.title = inp.value.trim(); t.due = d.value ? new Date(d.value).toISOString() : null; save(); renderList(); document.body.removeChild(modal); };
  f.append(inp,d,saveBtn,cancelBtn);
  modal.appendChild(f);
  document.body.appendChild(modal);
}

// закчеркивание задачи
function toggleComplete(id){
  const t = tasks.find(x=>x.id===id); if(!t) return; t.completed = !t.completed; save(); renderList();
}

// фильтрация и сортировка задач
function getFilteredSorted(){
  let out = tasks.slice();
  if(filter==='active') out = out.filter(t=>!t.completed);
  if(filter==='completed') out = out.filter(t=>t.completed);
  if (dateFilter) {
  out = out.filter(t => t.due && t.due.slice(0,10) === dateFilter);
}
  if(searchQuery) out = out.filter(t=>t.title.toLowerCase().includes(searchQuery));
  out.sort((a,b)=>{
    const da = a.due ? new Date(a.due).getTime() : Infinity;
    const db = b.due ? new Date(b.due).getTime() : Infinity;
    return sortDir === 'asc' ? da-db : db-da;
  });
  return out;
}

// отображение списка задач
function renderList(){
  const list = document.getElementById('task-list');
  list.innerHTML='';
  const items = getFilteredSorted();
  if(items.length===0){
    const e = document.createElement('div'); e.className='empty'; e.textContent='Задач нет'; list.appendChild(e); return;
  }
  items.forEach(t=>{
    const el = document.createElement('article'); el.className='task'; el.draggable = true; el.dataset.id = t.id;
    if(t.completed) el.classList.add('completed');

    const ch = document.createElement('input'); ch.type='checkbox'; ch.checked = t.completed; ch.onchange = ()=>toggleComplete(t.id);
    const meta = document.createElement('section'); meta.className='meta';
    const title = document.createElement('div'); title.className='title'; title.textContent = t.title;
    const date = document.createElement('time'); date.className='date'; date.textContent = t.due ? new Date(t.due).toLocaleDateString() : '—';
    meta.append(title,date);

    const actions = document.createElement('div'); actions.className='actions';
    const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Изм'; edit.onclick = ()=>editTask(t.id);
    const del = document.createElement('button'); del.className='btn'; del.textContent='Удал'; del.onclick = ()=>{ if(confirm('Удалить задачу?')) removeTask(t.id); };
    actions.append(edit,del);

    el.append(ch,meta,actions);
    list.appendChild(el);
  });
}

// функции драг анд дроп
function setupDragAndDrop(list){
  let dragEl = null;
  list.addEventListener('dragstart', e=>{
    const t = e.target.closest('.task');
    if(!t) return; dragEl = t; t.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  list.addEventListener('dragend', ()=>{ if(dragEl) dragEl.classList.remove('dragging'); dragEl=null; });

  list.addEventListener('dragover', e=>{
    e.preventDefault();
    const after = getDragAfterElement(list, e.clientY);
    if(after == null) list.appendChild(dragEl);
    else list.insertBefore(dragEl, after);
  });

  list.addEventListener('drop', ()=>{
    const ids = Array.from(list.querySelectorAll('.task')).map(el=>el.dataset.id);
    const map = Object.fromEntries(tasks.map(t=>[t.id,t]));
    tasks = ids.map(id=>map[id]).filter(Boolean);
    save(); renderList();
  });
}

function getDragAfterElement(container, y){
  const els = [...container.querySelectorAll('.task:not(.dragging)')];
  return els.reduce((closest, child)=>{
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if(offset < 0 && offset > closest.offset){
      return { offset, element: child };
    } else return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// запуск программы
function init() {
  load();
  buildUI();
  renderList();
}

// вызываем старт
init();
