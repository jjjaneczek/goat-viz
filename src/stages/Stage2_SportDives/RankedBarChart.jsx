import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, LabelList } from 'recharts';
import { computeSportScoreList } from '../../utils/scoring';
import { METRICS } from '../../data/attributeMap';

function RankedTooltip({ active, payload, liveScores, activeMetrics, weights, accentColor }) {
  if (!active || !payload?.length) return null;

  const athlete = payload[0]?.payload;
  const breakdown = liveScores[athlete?.id]?.breakdown || {};

  return (
    <div style={{
      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
      borderRadius: 8, padding: '12px 16px', fontSize: 13,
    }}>
      <p style={{ color: '#e5e5e5', fontWeight: 600, margin: '0 0 8px' }}>{athlete?.name}</p>
      <p style={{ color: accentColor, margin: '0 0 8px' }}>Score: {athlete?.score}</p>
      {activeMetrics.map((m) => {
        const rawValue = breakdown[m.key] || 0;
        const w = Math.round((weights[m.key] || 0) * 100);
        return (
          <p key={m.key} style={{ color: m.color, margin: '2px 0', fontSize: 12 }}>
            {m.label}: {Math.round(rawValue * 100)}
            <span style={{ color: '#4b5563', marginLeft: 4 }}>({w}%)</span>
          </p>
        );
      })}
    </div>
  );
}

export default function RankedBarChart({ athletes, selectedAthletes, weights, color, selectedTags }) {
  const safeAthletes = athletes || [];
  const safeSelectedAthletes = selectedAthletes || [];
  const safeWeights = weights || {};
  const activeMetrics = METRICS.filter(m => (selectedTags || []).includes(m.key));

  const liveScores = computeSportScoreList(safeAthletes, safeWeights);

  const data = safeAthletes
    .map(a => ({
      id: a.id,
      name: a.name,
      score: Math.round((liveScores[a.id]?.score || 0) * 100),
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, border: '1px solid #2a2a2a' }}>
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 36)}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 48, top: 4, bottom: 4 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <YAxis
            type="category" dataKey="name" width={140}
            tick={{ fill: '#d1d5db', fontSize: 13, fontWeight: 600 }}
          />
          <Tooltip
            content={<RankedTooltip liveScores={liveScores} activeMetrics={activeMetrics} weights={safeWeights} accentColor={color} />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={22}>
            {data.map(entry => (
              <Cell
                key={entry.id}
                fill={safeSelectedAthletes.includes(entry.id) ? '#F59E0B' : color}
                fillOpacity={safeSelectedAthletes.includes(entry.id) ? 1 : 0.8}
                stroke={safeSelectedAthletes.includes(entry.id) ? '#FBBF24' : 'transparent'}
                strokeWidth={safeSelectedAthletes.includes(entry.id) ? 2 : 0}
              />
            ))}
            <LabelList dataKey="score" position="right" fill="#d1d5db" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
