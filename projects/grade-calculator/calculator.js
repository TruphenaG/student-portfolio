import { weightedAverage } from './math.mjs';
const rows = document.querySelector('#grade-rows');
const form = document.querySelector('#grade-form');
const addButton = document.querySelector('#add-row');
const status = document.querySelector('#grade-status');
const result = document.querySelector('#grade-result');
let counter = 0;
function update() {
  result.hidden = true; status.textContent = ''; status.classList.remove('error');
  const total = [...rows.querySelectorAll('[data-weight]')].reduce((sum, input) => sum + (Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : 0), 0);
  document.querySelector('#weight-total').textContent = `Total weight: ${Number(total.toFixed(2))}% of 100%`;
  addButton.disabled = rows.children.length >= 12;
  for (const remove of rows.querySelectorAll('button')) remove.disabled = rows.children.length === 1;
}
function addRow(weight = '', focus = false) {
  if (rows.children.length >= 12) return;
  counter += 1;
  const row = document.createElement('div'); row.className = 'grade-row';
  const fields = [
    {text:'Assignment', type:'text', value:`Assignment ${counter}`, key:'name'},
    {text:'Score (%)', type:'number', value:'', key:'score'},
    {text:'Weight (%)', type:'number', value:weight, key:'weight'}
  ];
  for (const field of fields) {
    const label = document.createElement('label'); label.textContent = field.text;
    const input = document.createElement('input'); input.type = field.type; input.value = field.value;
    input.setAttribute(`data-${field.key}`,''); input.setAttribute('aria-label', `${field.text} for row ${counter}`);
    if (field.type === 'number') { input.min='0'; input.max='100'; input.step='0.01'; input.required=true; }
    else input.maxLength=80;
    label.append(input); row.append(label);
  }
  const remove = document.createElement('button'); remove.type='button'; remove.className='quiet-button'; remove.textContent='Remove'; remove.setAttribute('aria-label',`Remove assignment row ${counter}`);
  remove.addEventListener('click',()=>{ if(rows.children.length>1){row.remove();update();addButton.focus();} });
  row.append(remove); rows.append(row); update();
  if(focus) row.querySelector('input').focus();
}
function reset() { rows.replaceChildren(); counter=0; addRow('40'); addRow('30'); addRow('30'); }
addButton.addEventListener('click',()=>addRow('',true));
document.querySelector('#reset-grades').addEventListener('click',()=>{reset();rows.querySelector('input').focus();status.textContent='Calculator reset.';});
form.addEventListener('input', update);
form.addEventListener('submit',event=>{
  event.preventDefault(); result.hidden=true;
  const entries=[...rows.children].map(row=>({score:row.querySelector('[data-score]').valueAsNumber,weight:row.querySelector('[data-weight]').valueAsNumber}));
  try {
    const average=weightedAverage(entries);
    document.querySelector('#average-value').textContent=`${average.toFixed(2)}%`;
    document.querySelector('#result-description').textContent=`Based on ${entries.length} ${entries.length===1?'assignment':'assignments'} with a total weight of 100%.`;
    status.textContent=''; status.classList.remove('error'); result.hidden=false;
  } catch(error) {status.textContent=error.message;status.classList.add('error');}
});
reset();
