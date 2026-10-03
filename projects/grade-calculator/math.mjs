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
