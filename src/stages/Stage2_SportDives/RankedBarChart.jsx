import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, LabelList } from 'recharts';
import { computeSportScoreList } from '../../utils/scoring';

const CATEGORIES = [
  { key: 'dominance',     label: 'Dominance',     color: '#F59E0B' },
  { key: 'longevity',     label: 'Longevity',     color: '#14B8A6' },
  { key: 'accolades',     label: 'Accolades',     color: '#8B5CF6' },
  { key: 'eraDifficulty', label: 'Era Difficulty', color: '#EF4444' },
];

export default function RankedBarChart({
  athletes, attributeMeta, sportScores, selectedAthletes,
  weights, color,
}) {
  const safeAthletes = athletes || [];
  const safeAttributeMeta = attributeMeta || [];
  const safeSelectedAthletes = selectedAthletes || [];

  const liveScores = useMemo(() =>
    computeSportScoreList(safeAthletes, safeAttributeMeta, weights),
  [safeAthletes, safeAttributeMeta, weights]);

  const data = safeAthletes
    .map(a => ({
      id: a.id,
      name: a.name,
      score: Math.round((liveScores[a.id]?.score || 0) * 100),
    }))
    .sort((a, b) => b.score - a.score);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const athlete = payload[0]?.payload;
    const breakdown = liveScores[athlete?.id]?.breakdown || {};
    return (
      <div style={{
        backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: 8, padding: '12px 16px', fontSize: 14,
      }}>
        <p style={{ color: '#e5e5e5', fontWeight: 600, margin: '0 0 6px' }}>{athlete?.name}</p>
        <p style={{ color: color, margin: '0 0 6px' }}>Score: {athlete?.score}</p>
        {CATEGORIES.map(c => (
          <p key={c.key} style={{ color: c.color, margin: '1px 0' }}>
            {c.label}: {Math.round((breakdown[c.key] || 0) * 100)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, border: '1px solid #2a2a2a' }}>
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 4, bottom: 4 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis
            type="category" dataKey="name" width={130}
            tick={{ fill: '#d1d5db', fontSize: 13, fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={22}>
            {data.map(entry => (
              <Cell
                key={entry.id}
                fill={safeSelectedAthletes.includes(entry.id) ? '#F59E0B' : color}
                fillOpacity={safeSelectedAthletes.includes(entry.id) ? 1 : 0.85}
                stroke={safeSelectedAthletes.includes(entry.id) ? '#FBBF24' : '#1f2937'}
                strokeWidth={safeSelectedAthletes.includes(entry.id) ? 3 : 1}
              />
            ))}
            <LabelList dataKey="score" position="right" fill="#d1d5db" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
