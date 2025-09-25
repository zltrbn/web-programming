const STORAGE_KEY = 'todo_tasks_v1';

let tasks = [];

function buildUI() {
  const container = document.createElement('div');
  container.className = 'container';

  const header = document.createElement('header');
  const title = document.createElement('h1');
  title.textContent = 'ToDo List';
  header.appendChild(title);

  const list = document.createElement('div');
  list.id = 'task-list';
  list.textContent = 'Задач пока нет';

  container.append(header, list);
  document.body.appendChild(container);
}

function init() {
  buildUI();
}

init();