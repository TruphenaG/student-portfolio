import { localDay, normalizeTasks, taskStats, visibleTasks } from './model.mjs';

const storageKey = 'truphena-study-planner-v1';
const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#task-title');
const courseInput = document.querySelector('#task-course');
const dateInput = document.querySelector('#task-date');
const priorityInput = document.querySelector('#task-priority');
const searchInput = document.querySelector('#task-search');
const filterInput = document.querySelector('#task-filter');
const sortInput = document.querySelector('#task-sort');
const list = document.querySelector('#task-list');
const statusText = document.querySelector('#task-status');
const warning = document.querySelector('#storage-warning');
const undoButton = document.querySelector('#undo-remove');
const cancelButton = document.querySelector('#cancel-edit');
const sampleButton = document.querySelector('#load-samples');
let tasks = [];
let editingId = null;
let lastRemoved = null;
let storageReadable = true;

function warn(message) {
  warning.hidden = false;
  warning.textContent = message;
}
try {
  tasks = normalizeTasks(JSON.parse(localStorage.getItem(storageKey) || '[]'));
} catch {
  storageReadable = false;
  warn('Saved tasks could not be read. Your existing saved data has been left untouched. You can use this page temporarily, but new changes will not be saved.');
}
function save() {
  if (!storageReadable) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    warning.hidden = true;
  } catch {
    warn('Your changes are available on this page, but browser storage is unavailable. They may be lost when you leave or reload.');
  }
}
function clearFilters() {
  searchInput.value = '';
  filterInput.value = 'all';
}
function focusTask(id, action = 'checkbox') {
  const item = [...list.children].find(node => node.dataset.taskId === id);
  const selector = action === 'edit' ? '[data-edit]' : action === 'remove' ? '[data-remove]' : 'input';
  const control = item?.querySelector(selector);
  (control || filterInput).focus();
}
function finishEditing() {
  editingId = null;
  form.reset();
  titleInput.setCustomValidity('');
  document.querySelector('#new-task-heading').textContent = 'Add an assignment';
  document.querySelector('#save-task').textContent = 'Add task';
  cancelButton.hidden = true;
}
function chip(text, type = '') {
  const element = document.createElement('span');
  element.className = `task-chip ${type}`;
  element.textContent = text;
  return element;
}
function dateLabel(value, done) {
  if (!value) return ['No due date', ''];
  const today = localDay();
  const formatted = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
  if (!done && value < today) return [`Overdue · ${formatted}`, 'overdue'];
  if (!done && value === today) return ['Due today', 'today'];
  return [`Due ${formatted}`, ''];
}
function render() {
  const stats = taskStats(tasks);
  document.querySelector('#open-count').textContent = stats.open;
  document.querySelector('#overdue-count').textContent = stats.overdue;
  document.querySelector('#soon-count').textContent = stats.soon;
  document.querySelector('#completion-count').textContent = `${stats.completed} / ${stats.total}`;
  const progress = document.querySelector('#completion-progress');
  progress.value = stats.total ? stats.completed / stats.total * 100 : 0;
  progress.textContent = `${Math.round(progress.value)}%`;
  const shown = visibleTasks(tasks, { search: searchInput.value, status: filterInput.value, sort: sortInput.value });
  document.querySelector('#task-count').textContent = `${shown.length} of ${tasks.length} shown`;
  const empty = document.querySelector('#empty-state');
  empty.hidden = shown.length > 0;
  empty.textContent = tasks.length ? 'No matching assignments. Try a different search or status.' : 'Add an assignment or load the sample tasks to explore the planner.';
  undoButton.hidden = !lastRemoved;
  sampleButton.disabled = tasks.some(task => task.sample) || tasks.length > 96;
  const options = document.querySelector('#course-options');
  options.replaceChildren();
  for (const course of [...new Set(tasks.map(task => task.course).filter(Boolean))].sort()) {
    const option = document.createElement('option');
    option.value = course;
    options.append(option);
  }
  list.replaceChildren();
  for (const task of shown) {
    const item = document.createElement('li');
    item.dataset.taskId = task.id;
    item.className = `task-item${task.done ? ' completed' : ''}`;
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.dataset.taskId = task.id;
    checkbox.setAttribute('aria-label', `Mark ${task.title} ${task.done ? 'incomplete' : 'complete'}`);
    const detail = document.createElement('span');
    detail.className = 'task-details';
    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;
    const chips = document.createElement('span');
    chips.className = 'task-chips';
    if (task.course) chips.append(chip(task.course, 'course'));
    const [dateText, dateStyle] = dateLabel(task.date, task.done);
    chips.append(chip(dateText, dateStyle), chip(`${task.priority} priority`, task.priority === 'High' ? 'high' : ''));
    detail.append(title, chips);
    label.append(checkbox, detail);
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      save(); render();
      statusText.textContent = `${task.title} marked ${task.done ? 'complete' : 'incomplete'}.`;
      focusTask(task.id);
    });
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const edit = document.createElement('button');
    edit.type = 'button'; edit.className = 'quiet-button'; edit.textContent = 'Edit';
    edit.dataset.edit = '';
    edit.setAttribute('aria-label', `Edit ${task.title}`);
    edit.addEventListener('click', () => {
      editingId = task.id;
      titleInput.value = task.title; courseInput.value = task.course;
      dateInput.value = task.date; priorityInput.value = task.priority;
      titleInput.setCustomValidity('');
      document.querySelector('#new-task-heading').textContent = 'Edit assignment';
      document.querySelector('#save-task').textContent = 'Save changes';
      cancelButton.hidden = false;
      titleInput.focus();
    });
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'quiet-button'; remove.textContent = 'Remove';
    remove.dataset.remove = '';
    remove.setAttribute('aria-label', `Remove ${task.title}`);
    remove.addEventListener('click', () => {
      lastRemoved = { task, index: tasks.findIndex(entry => entry.id === task.id) };
      tasks = tasks.filter(entry => entry.id !== task.id);
      if (editingId === task.id) finishEditing();
      save(); render();
      statusText.textContent = `${task.title} removed. You can undo the most recent removal.`;
      undoButton.focus();
    });
    actions.append(edit, remove); item.append(label, actions); list.append(item);
  }
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.setCustomValidity('Enter a task name.');
    titleInput.reportValidity(); return;
  }
  if (!editingId && tasks.length >= 100) {
    statusText.textContent = 'This planner holds up to 100 tasks. Remove a task before adding another.'; return;
  }
  const updates = { title, course: courseInput.value.trim(), date: dateInput.value, priority: priorityInput.value };
  const existing = tasks.find(task => task.id === editingId);
  let id;
  if (existing) {
    Object.assign(existing, updates); id = existing.id;
  } else {
    id = crypto.randomUUID(); tasks.push({ id, ...updates, done: false });
  }
  save(); clearFilters(); finishEditing(); render();
  statusText.textContent = `${title} ${existing ? 'updated' : 'added'}.`;
  if (existing) focusTask(id, 'edit'); else titleInput.focus();
});
titleInput.addEventListener('input', () => titleInput.setCustomValidity(''));
cancelButton.addEventListener('click', () => {
  const id = editingId; finishEditing(); statusText.textContent = 'Changes canceled.'; focusTask(id, 'edit');
});
undoButton.addEventListener('click', () => {
  if (!lastRemoved) return;
  if (tasks.length >= 100) { statusText.textContent = 'Undo is unavailable while there are 100 tasks.'; return; }
  const restored = lastRemoved.task;
  tasks.splice(Math.min(lastRemoved.index, tasks.length), 0, restored);
  lastRemoved = null; clearFilters(); save(); render();
  statusText.textContent = `${restored.title} restored.`; focusTask(restored.id);
});
sampleButton.addEventListener('click', () => {
  if (tasks.length > 96 || tasks.some(task => task.sample)) return;
  const examples = [
    ['Outline an essay', 'Writing (sample)', 2, 'High', false],
    ['Review practice problems', 'Math (sample)', 0, 'Normal', false],
    ['Finish a lab summary', 'Science (sample)', -1, 'High', false],
    ['Read the course outline', 'Writing (sample)', -2, 'Low', true]
  ];
  for (const [title, course, days, priority, done] of examples) {
    const date = new Date(); date.setDate(date.getDate() + days);
    tasks.push({ id: crypto.randomUUID(), title: `${title} (sample)`, course, date: localDay(date), priority, done, sample: true });
  }
  clearFilters(); save(); render(); statusText.textContent = 'Four sample tasks added. Your other tasks are unchanged.';
});
searchInput.addEventListener('input', render);
filterInput.addEventListener('change', render);
sortInput.addEventListener('change', render);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  const active = document.activeElement;
  const focusedId = active?.closest('#task-list li')?.dataset.taskId;
  const action = active?.hasAttribute('data-edit') ? 'edit' : active?.hasAttribute('data-remove') ? 'remove' : 'checkbox';
  render();
  if (focusedId) focusTask(focusedId, action);
});
render();
