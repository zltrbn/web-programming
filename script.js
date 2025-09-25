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
  form.onsubmit = e => { e.preventDefault();};

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Название задачи';
  input.required = true;
  input.id = 'task-title';

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';
  addBtn.textContent = 'Добавить';

  form.append(input, addBtn);
  header.appendChild(form);

  const list = document.createElement('div');
  list.id = 'task-list';

  container.append(header, list);
  document.body.appendChild(container);

  renderList();
}

function renderList() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (tasks.length === 0) {
    const empty = document.createElement('div');
    empty.textContent = 'Задач пока нет';
    list.appendChild(empty);
    return;
  }

  tasks.forEach(t => {
    const el = document.createElement('div');
    el.textContent = t.title;
    list.appendChild(el);
  });
}

function init() {
  load();
  buildUI();
}

init();
