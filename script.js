const STORAGE_KEY = 'todo_tasks_v1';

let tasks = [];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    tasks = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function buildUI() {
  const container = document.createElement('div');
  container.className = 'container';

  const header = document.createElement('header');
  const title = document.createElement('h1');
  title.textContent = 'ToDo List';
  header.appendChild(title);

  const form = document.createElement('form');
  form.onsubmit = e => { e.preventDefault(); onAdd(); };

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Название задачи';
  input.required = true;
  input.id = 'task-title';

  const date = document.createElement('input');
  date.type = 'date';
  date.id = 'task-date';

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = 'Добавить';

  form.append(input, date, addBtn);
  header.appendChild(form);
  container.appendChild(header);

  const list = document.createElement('div');
  list.id = 'task-list';
  container.appendChild(list);

  document.body.appendChild(container);
}

function onAdd() {
  const titleEl = document.getElementById('task-title');
  const dateEl = document.getElementById('task-date');
  const title = titleEl.value.trim();
  if (!title) return;

  const due = dateEl.value ? new Date(dateEl.value).toISOString() : null;

  tasks.push({ id: uid(), title, due, completed: false, createdAt: new Date().toISOString() });
  save();
  titleEl.value = '';
  dateEl.value = '';
  renderList();
}

function renderList() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  tasks.forEach(t => {
    const el = document.createElement('div');
    el.textContent = t.title;
    list.appendChild(el);
  });
}

function init() {
  load();
  buildUI();
  renderList();
}

init();
