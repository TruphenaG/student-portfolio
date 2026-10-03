export function weightedAverage(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('Add at least one assignment.');
  for (const entry of entries) {
    if (!Number.isFinite(entry.score) || entry.score < 0 || entry.score > 100) throw new Error('Every score must be between 0 and 100.');
    if (!Number.isFinite(entry.weight) || entry.weight < 0 || entry.weight > 100) throw new Error('Every weight must be between 0 and 100.');
  }
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (Math.abs(total - 100) > 0.00001) throw new Error(`Weights must add up to 100%. They currently total ${Number(total.toFixed(2))}%.`);
  return entries.reduce((sum, entry) => sum + entry.score * entry.weight / 100, 0);
}

// Course weights are fixed shares of the final grade, not raw assignment points.
export function forecastGrade(entries, target) {
  if (!Array.isArray(entries) || !entries.length) throw new Error('Add at least one assessment.');
  if (!Number.isFinite(target) || target < 0 || target > 100) throw new Error('Enter a target between 0 and 100%.');
  for (const entry of entries) {
    if (!entry || !Number.isFinite(entry.weight) || entry.weight <= 0 || entry.weight > 100) {
      throw new Error('Every assessment needs a weight greater than 0 and no more than 100%.');
    }
    if (!['completed', 'remaining'].includes(entry.state)) throw new Error('Choose a status for each assessment.');
    if (entry.score === null && entry.state === 'remaining') continue;
    if (!Number.isFinite(entry.score) || entry.score < 0 || entry.score > 100) {
      throw new Error('Enter a score from 0 to 100% for each completed assessment. Predictions must also be from 0 to 100%.');
    }
  }
  const sum = entries.reduce((total, entry) => total + entry.weight, 0);
  if (Math.abs(sum - 100) > 1e-6) throw new Error(`Weights must total 100%. The current total is ${Number(sum.toFixed(2))}%.`);
  const completed = entries.filter(entry => entry.state === 'completed');
  const remaining = entries.filter(entry => entry.state === 'remaining');
  const completedWeight = completed.reduce((sum, entry) => sum + entry.weight, 0);
  const remainingWeight = remaining.reduce((sum, entry) => sum + entry.weight, 0);
  const earned = completed.reduce((sum, entry) => sum + entry.weight * entry.score / 100, 0);
  const current = completedWeight ? earned / completedWeight * 100 : null;
  const projected = remaining.every(entry => entry.score !== null)
    ? earned + remaining.reduce((sum, entry) => sum + entry.weight * entry.score / 100, 0) : null;
  const needed = remainingWeight ? (target - earned) / remainingWeight * 100 : null;
  let targetStatus;
  if (!remainingWeight) targetStatus = earned + 1e-9 >= target ? 'complete-met' : 'complete-missed';
  else if (needed <= 0) targetStatus = 'secured';
  else if (needed > 100 + 1e-9) targetStatus = 'unreachable';
  else targetStatus = 'reachable';
  return {
    earned, current, projected, completedWeight, remainingWeight,
    minimum: earned, maximum: Math.min(100, earned + remainingWeight),
    needed, neededDisplay: needed === null ? null : Math.ceil((Math.max(0, needed) - 1e-10) * 10) / 10,
    target, targetStatus
  };
}
