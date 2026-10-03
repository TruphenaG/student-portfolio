export function localDay(date = new Date()) {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isValidDay(value) {
  if (value === '') return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && localDay(date) === value && value >= '0001-01-01';
}

// Accept the previous planner's records, adding an optional course label.
export function normalizeTasks(saved) {
  if (!Array.isArray(saved)) throw new Error('Saved tasks must be a list.');
  const ids = new Set();
  return saved.map(task => {
    if (!task || typeof task.id !== 'string' || !task.id || ids.has(task.id)
      || typeof task.title !== 'string' || !task.title.trim() || task.title.length > 160
      || typeof task.date !== 'string' || !isValidDay(task.date)
      || !['Normal', 'High', 'Low'].includes(task.priority) || typeof task.done !== 'boolean') {
      throw new Error('A saved task could not be read.');
    }
    ids.add(task.id);
    return { ...task, course: typeof task.course === 'string' ? task.course.slice(0, 60) : '' };
  });
}

export function taskStats(tasks, now = new Date()) {
  const today = localDay(now);
  const end = new Date(now);
  end.setDate(end.getDate() + 6);
  const lastDay = localDay(end);
  return {
    open: tasks.filter(task => !task.done).length,
    completed: tasks.filter(task => task.done).length,
    overdue: tasks.filter(task => !task.done && task.date && task.date < today).length,
    soon: tasks.filter(task => !task.done && task.date && task.date >= today && task.date <= lastDay).length,
    total: tasks.length
  };
}

export function visibleTasks(tasks, { search = '', status = 'all', sort = 'due' } = {}, now = new Date()) {
  const query = search.trim().toLocaleLowerCase();
  const today = localDay(now);
  const priority = { High: 0, Normal: 1, Low: 2 };
  return tasks.map((task, index) => ({ task, index })).filter(({ task }) => {
    const match = `${task.title} ${task.course || ''}`.toLocaleLowerCase().includes(query);
    const state = status === 'all' || (status === 'open' && !task.done)
      || (status === 'complete' && task.done)
      || (status === 'overdue' && !task.done && task.date && task.date < today);
    return match && state;
  }).sort((a, b) => {
    const done = Number(a.task.done) - Number(b.task.done);
    if (done) return done;
    if (sort === 'newest') return b.index - a.index;
    const due = (a.task.date || '9999-99-99').localeCompare(b.task.date || '9999-99-99');
    const rank = priority[a.task.priority] - priority[b.task.priority];
    return (sort === 'priority' ? rank || due : due || rank) || a.index - b.index;
  }).map(({ task }) => task);
}
