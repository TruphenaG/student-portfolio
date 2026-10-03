'use strict';
const storageKey = 'truphena-study-planner-v1';
const taskForm = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const dateInput = document.querySelector('#task-date');
const priorityInput = document.querySelector('#task-priority');
const filterInput = document.querySelector('#task-filter');
const taskList = document.querySelector('#task-list');
const statusText = document.querySelector('#task-status');
const storageWarning = document.querySelector('#storage-warning');
let tasks = [];
function warnStorage() {
  storageWarning.hidden = false;
  storageWarning.textContent = 'Browser storage is unavailable or unreadable. Tasks still work here, but may not remain after you close or reload the page.';
}
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (!Array.isArray(saved)) throw new Error('Invalid saved data');
  tasks = saved.filter(task => task && typeof task.id === 'string' && typeof task.title === 'string' && task.title.trim() && typeof task.date === 'string' && /^(\d{4}-\d{2}-\d{2})?$/.test(task.date) && ['Normal', 'High', 'Low'].includes(task.priority) && typeof task.done === 'boolean').slice(0,100);
} catch { warnStorage(); }
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(tasks)); }
  catch { warnStorage(); }
}
function formatDate(value) {
  if (!value) return 'No due date';
  const date = new Date(value + 'T12:00:00');
  return Number.isNaN(date.getTime()) ? 'No due date' : `Due ${new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(date)}`;
}
function render() {
  taskList.replaceChildren();
  const shown = tasks.filter(task => filterInput.value === 'all' || (filterInput.value === 'complete' ? task.done : !task.done));
  const openCount = tasks.filter(task => !task.done).length;
  document.querySelector('#task-count').textContent = `${openCount} to do · ${tasks.length - openCount} completed`;
  const empty = document.querySelector('#empty-state');
  empty.hidden = shown.length > 0;
  empty.textContent = tasks.length === 0 ? 'Your planner is clear. Add your first assignment above.' : 'No tasks in this view.';
  for (const task of shown) {
    const item = document.createElement('li');
    item.className = `task-item${task.done ? ' completed' : ''}`;
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark ${task.title} ${task.done ? 'incomplete' : 'complete'}`);
    const details = document.createElement('span'); details.className = 'task-details';
    const title = document.createElement('span'); title.className = 'task-title'; title.textContent = task.title;
    const meta = document.createElement('span'); meta.className = 'task-meta'; meta.textContent = `${formatDate(task.date)} · ${task.priority} priority`;
    details.append(title,meta); label.append(checkbox,details);
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked; save(); render();
      statusText.textContent = `${task.title} marked ${task.done ? 'complete' : 'incomplete'}.`;
      const replacement = [...taskList.querySelectorAll('input')].find(input => input.getAttribute('aria-label') === `Mark ${task.title} ${task.done ? 'incomplete' : 'complete'}`);
      (replacement || filterInput).focus();
    });
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'quiet-button'; remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${task.title}`);
    remove.addEventListener('click', () => {
      tasks = tasks.filter(entry => entry.id !== task.id); save(); render();
      statusText.textContent = `${task.title} removed.`; titleInput.focus();
    });
    item.append(label,remove); taskList.append(item);
  }
}
titleInput.addEventListener('input', () => titleInput.setCustomValidity(''));
taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) { titleInput.setCustomValidity('Enter a task name.'); titleInput.reportValidity(); return; }
  if (tasks.length >= 100) { statusText.textContent = 'This planner holds up to 100 tasks. Remove a task before adding another.'; return; }
  tasks.push({id: crypto.randomUUID(), title, date:dateInput.value, priority:priorityInput.value, done:false});
  save(); filterInput.value = 'all'; render(); taskForm.reset();
  statusText.textContent = `${title} added.`; titleInput.focus();
});
filterInput.addEventListener('change', render);
render();
