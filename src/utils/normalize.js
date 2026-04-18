/**
 * Min-max normalize an array of athletes' raw attribute values to 0–1.
 * Returns a new array with a `normalized` object added to each athlete.
 */
export function normalizeAthletes(athletes, attributeMeta) {
  const attrNames = attributeMeta.map(a => a.name);

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
