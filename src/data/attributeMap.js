export const METRICS = [
  { key: 'dominance_score',          label: 'Dominance Score',      color: '#F59E0B' },
  { key: 'championship_rate',        label: 'Championship Rate',    color: '#FBBF24' },
  { key: 'longevity_index',          label: 'Longevity Index',      color: '#14B8A6' },
  { key: 'accolade_density',         label: 'Accolade Density',     color: '#8B5CF6' },
  { key: 'opposition_quality',       label: 'Opposition Quality',   color: '#EF4444' },
  { key: 'peak_performance_index',   label: 'Peak Performance',     color: '#F97316' },
  { key: 'consistency_rating',       label: 'Consistency Rating',   color: '#06B6D4' },
  { key: 'pressure_performance',     label: 'Pressure Performance', color: '#EC4899' },
];

export const initialWeights = Object.fromEntries(
  METRICS.map(m => [m.key, 1 / METRICS.length])
);

export function inferWeights(selectedKeys) {
  if (!selectedKeys || !selectedKeys.length) return { ...initialWeights };
  const N = selectedKeys.length;
  const base = Math.floor(100 / N);
  const remainder = 100 - base * N;
  return Object.fromEntries(
    METRICS.map(m => {
      if (!selectedKeys.includes(m.key)) return [m.key, 0];
      const idx = selectedKeys.indexOf(m.key);
      return [m.key, (base + (idx < remainder ? 1 : 0)) / 100];
    })
  );
}
