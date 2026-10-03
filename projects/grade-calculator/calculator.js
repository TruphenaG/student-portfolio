import { forecastGrade } from './math.mjs';

const storageKey = 'truphena-grade-forecaster-v1';
const rows = document.querySelector('#grade-rows');
const form = document.querySelector('#grade-form');
const addButton = document.querySelector('#add-row');
const targetInput = document.querySelector('#target-grade');
const status = document.querySelector('#grade-status');
const result = document.querySelector('#grade-result');
const breakdown = document.querySelector('#grade-breakdown');
const warning = document.querySelector('#grade-storage-warning');
let counter = 0;
let storageReadable = true;
const percent = value => `${value.toFixed(1)}%`;
const precisePercent = value => `${Number(value.toFixed(4))}%`;

function readDraft() {
  return {
    target: targetInput.value,
    entries: [...rows.children].map(row => ({
      name: row.querySelector('[data-name]').value,
      state: row.querySelector('[data-state]').value,
      weight: row.querySelector('[data-weight]').value,
      score: row.querySelector('[data-score]').value
    }))
  };
}
function save() {
  if (!storageReadable) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(readDraft()));
    warning.hidden = true;
  } catch {
    warning.hidden = false;
    warning.textContent = 'Browser storage is unavailable. This plan works on this page, but may not remain after you leave or reload.';
  }
}
function update() {
  result.hidden = true;
  status.textContent = '';
  status.classList.remove('error');
  const total = [...rows.querySelectorAll('[data-weight]')].reduce((sum, input) =>
    sum + (Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : 0), 0);
  document.querySelector('#weight-total').textContent = `Total weight: ${Number(total.toFixed(2))}% of 100%`;
  addButton.disabled = rows.children.length >= 12;
  for (const remove of rows.querySelectorAll('button')) remove.disabled = rows.children.length === 1;
}
function addRow({ name = '', state = 'completed', weight = '', score = '' } = {}, focus = false) {
  if (rows.children.length >= 12) return;
  const number = ++counter;
  const row = document.createElement('div');
  row.className = 'forecast-row';
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', `Assessment row ${number}`);
  const controls = {};
  for (const field of [
    { key: 'name', text: 'Assessment', type: 'text', value: name || `Assessment ${number}` },
    { key: 'state', text: 'Status', type: 'select', value: state },
    { key: 'weight', text: 'Weight (%)', type: 'number', value: weight },
    { key: 'score', text: 'Score (%)', type: 'number', value: score }
  ]) {
    const label = document.createElement('label');
    const caption = document.createElement('span'); caption.textContent = field.text;
    const input = document.createElement(field.type === 'select' ? 'select' : 'input');
    if (field.type === 'select') {
      for (const [value, text] of [['completed', 'Completed'], ['remaining', 'Remaining']]) {
        const option = document.createElement('option'); option.value = value; option.textContent = text; input.append(option);
      }
    } else {
      input.type = field.type;
      if (field.type === 'number') {
        input.min = field.key === 'weight' ? '0.01' : '0';
        input.max = '100'; input.step = '0.01'; input.inputMode = 'decimal';
        input.required = true;
      } else input.maxLength = 80;
    }
    input.value = field.value;
    input.dataset[field.key] = '';
    input.setAttribute('aria-label', `${field.text} for row ${number}`);
    controls[field.key] = { input, caption };
    label.append(caption, input); row.append(label);
  }
  function setScoreLabel() {
    const remaining = controls.state.input.value === 'remaining';
    const text = remaining ? 'Expected score (%)' : 'Score (%)';
    controls.score.caption.textContent = text;
    controls.score.input.setAttribute('aria-label', `${text} for row ${number}`);
    controls.score.input.required = !remaining;
    controls.score.input.placeholder = remaining ? 'Optional' : 'Required';
  }
  controls.state.input.addEventListener('change', () => { setScoreLabel(); update(); save(); });
  setScoreLabel();
  const remove = document.createElement('button');
  remove.type = 'button'; remove.className = 'quiet-button'; remove.textContent = 'Remove';
  remove.setAttribute('aria-label', `Remove assessment row ${number}`);
  remove.addEventListener('click', () => {
    if (rows.children.length > 1) { row.remove(); update(); save(); addButton.focus(); }
  });
  row.append(remove); rows.append(row); update();
  if (focus) controls.name.input.focus();
}
function reset() {
  rows.replaceChildren(); counter = 0; targetInput.value = '85';
  addRow({ name: 'Coursework', weight: '40' });
  addRow({ name: 'Midterm', weight: '30' });
  addRow({ name: 'Final exam', state: 'remaining', weight: '30' });
}
function showForecast(data, entries) {
  document.querySelector('#current-grade').textContent = data.current === null ? '—' : percent(data.current);
  document.querySelector('#completed-weight').textContent = data.completedWeight
    ? `${Number(data.completedWeight.toFixed(2))}% of course weight completed` : 'No completed work yet';
  document.querySelector('#projected-grade').textContent = data.projected === null ? '—' : percent(data.projected);
  document.querySelector('#projection-note').textContent = data.projected === null
    ? 'Add expected scores for all remaining work' : data.remainingWeight ? 'Includes your expected scores' : 'All assessments completed';
  document.querySelector('#possible-range').textContent = `${Number(data.minimum.toFixed(4))}–${precisePercent(data.maximum)}`;
  const needed = document.querySelector('#needed-grade');
  const explanation = document.querySelector('#target-explanation');
  switch (data.targetStatus) {
    case 'complete-met':
      needed.textContent = 'Target met'; explanation.textContent = `Your final grade is ${precisePercent(data.earned)}, meeting your ${data.target}% target. There is no remaining work in this plan.`; break;
    case 'complete-missed':
      needed.textContent = 'Below target'; explanation.textContent = `Your final grade is ${precisePercent(data.earned)}, below your ${data.target}% target. There is no remaining work in this plan.`; break;
    case 'secured':
      needed.textContent = 'Target secured'; explanation.textContent = `You have earned ${Number(data.earned.toFixed(4))} course percentage points, so the ${data.target}% target is already secured under this model.`; break;
    case 'unreachable':
      needed.textContent = 'Beyond 100%'; explanation.textContent = `A ${data.target}% final grade would require a ${data.neededDisplay.toFixed(1)}% average on remaining work. The highest possible final grade is ${precisePercent(data.maximum)}.`; break;
    default:
      needed.textContent = `${data.neededDisplay.toFixed(1)}%`;
      explanation.textContent = `Aim for at least this weighted average across the remaining ${Number(data.remainingWeight.toFixed(2))}% of course work to reach a ${data.target}% final grade. The displayed minimum is rounded up.`;
  }
  const meter = document.querySelector('#grade-meter');
  meter.value = data.projected === null ? data.earned : data.projected;
  meter.textContent = percent(meter.value);
  const meterLabel = document.querySelector('label[for="grade-meter"]');
  meterLabel.textContent = data.projected === null ? 'Course points earned so far' : 'Projected final grade';
  document.querySelector('#meter-caption').textContent = `${meter.value.toFixed(1)} of 100 · Target ${data.target}%`;
  breakdown.replaceChildren();
  for (const entry of entries) {
    const row = document.createElement('tr');
    const name = document.createElement('th'); name.scope = 'row'; name.textContent = entry.name; row.append(name);
    const values = [entry.state === 'completed' ? 'Actual' : 'Expected', `${entry.weight}%`, entry.score === null ? 'Not entered' : `${entry.score}%`, entry.score === null ? '—' : (entry.weight * entry.score / 100).toFixed(2)];
    for (const value of values) { const cell = document.createElement('td'); cell.textContent = value; row.append(cell); }
    breakdown.append(row);
  }
  result.hidden = false;
  document.querySelector('#forecast-summary').textContent = `Forecast calculated. ${data.projected === null ? 'Enter expected scores to see a projection.' : `Projected final grade ${percent(data.projected)}.`} ${needed.textContent}. ${explanation.textContent}`;
}
addButton.addEventListener('click', () => { addRow({ state: 'remaining' }, true); save(); });
document.querySelector('#reset-grades').addEventListener('click', () => { reset(); save(); rows.querySelector('input').focus(); status.textContent = 'Plan reset.'; });
document.querySelector('#load-example').addEventListener('click', () => {
  rows.replaceChildren(); counter = 0; targetInput.value = '90';
  addRow({ name: 'Quizzes (example)', state: 'completed', weight: '20', score: '75' });
  addRow({ name: 'Coursework (example)', state: 'completed', weight: '30', score: '90' });
  addRow({ name: 'Midterm (example)', state: 'remaining', weight: '30', score: '80' });
  addRow({ name: 'Final exam (example)', state: 'remaining', weight: '20', score: '95' });
  save(); form.requestSubmit();
});
form.addEventListener('input', () => { update(); save(); });
form.addEventListener('submit', event => {
  event.preventDefault(); result.hidden = true;
  const entries = [...rows.children].map((row, index) => ({
    name: row.querySelector('[data-name]').value.trim() || `Assessment ${index + 1}`,
    state: row.querySelector('[data-state]').value,
    weight: row.querySelector('[data-weight]').valueAsNumber,
    score: row.querySelector('[data-score]').value === '' ? null : row.querySelector('[data-score]').valueAsNumber
  }));
  try {
    const data = forecastGrade(entries, targetInput.valueAsNumber);
    status.textContent = ''; status.classList.remove('error'); showForecast(data, entries); save();
  } catch (error) { status.textContent = error.message; status.classList.add('error'); }
});

// Restore the draft, including intentionally blank predictions, without replacing corrupt data.
try {
  const raw = localStorage.getItem(storageKey);
  if (!raw) reset();
  else {
    const saved = JSON.parse(raw);
    if (!saved || typeof saved.target !== 'string' || !Array.isArray(saved.entries) || !saved.entries.length || saved.entries.length > 12
      || !saved.entries.every(entry => entry && typeof entry.name === 'string' && entry.name.length <= 80 && ['completed', 'remaining'].includes(entry.state) && typeof entry.weight === 'string' && typeof entry.score === 'string')) throw new Error('Invalid draft');
    targetInput.value = saved.target;
    for (const entry of saved.entries) addRow(entry);
  }
} catch {
  storageReadable = false; reset(); warning.hidden = false;
  warning.textContent = 'The saved plan could not be read. Existing saved data has been left untouched; changes on this page will not be saved.';
}
