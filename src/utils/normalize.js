import { METRICS } from '../data/attributeMap';

export function normalizeAthletes(athletes) {
  const attrNames = METRICS.map(m => m.key);

  const mins = {};
  const maxs = {};
  attrNames.forEach(attr => {
    const vals = athletes.map(a => a.raw[attr] ?? 0);
    mins[attr] = Math.min(...vals);
    maxs[attr] = Math.max(...vals);
  });

  return athletes.map(athlete => {
    const normalized = {};
    attrNames.forEach(attr => {
      const range = maxs[attr] - mins[attr];
      normalized[attr] = range === 0 ? 0.5 : (athlete.raw[attr] - mins[attr]) / range;
    });
    return { ...athlete, normalized };
  });
}
