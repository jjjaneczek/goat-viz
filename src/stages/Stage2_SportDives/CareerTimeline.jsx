import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceArea, ResponsiveContainer, ReferenceDot,
} from 'recharts';

const PALETTE = ['#F59E0B', '#14B8A6', '#8B5CF6', '#EF4444', '#3B82F6', '#10B981'];

const Y_LABELS = {
  football: 'Goals / season',
  chess:    'Elo rating',
  boxing:   'Performance index',
};

function getPrimeRange(timeline) {
  if (!timeline?.length) return null;
  const avg = timeline.reduce((s, d) => s + d.value, 0) / timeline.length;
  const above = timeline.filter(d => d.value >= avg);
  if (!above.length) return null;
  return { x1: above[0].year, x2: above[above.length - 1].year, avg };
}

const CustomTooltip = ({ active, payload, label, athletes }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#9ca3af', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      {payload.map(p => {
        const a = athletes.find(at => at.id === p.dataKey);
        return (
          <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
            {a?.name}: <strong>{p.value}</strong>
          </p>
        );
      })}
    </div>
  );
};

export default function CareerTimeline({ athletes, selectedAthletes, color, sportKey }) {
  const selected = athletes.filter(a => selectedAthletes.includes(a.id));
  if (!selected.length) {
    return (
      <div style={{
        backgroundColor: '#1a1a1a', borderRadius: 16, padding: 32,
        border: '1px solid #2a2a2a', textAlign: 'center', color: '#4b5563',
      }}>
        Select athletes in the Radar section to see their career timelines
      </div>
    );
  }

  // Merge all years across selected athletes
  const allYears = new Set();
  selected.forEach(a => a.timeline?.forEach(d => allYears.add(d.year)));
  const sortedYears = [...allYears].sort((a, b) => a - b);

  const chartData = sortedYears.map(year => {
    const point = { year };
    selected.forEach(a => {
      const match = a.timeline?.find(d => d.year === year);
      if (match) point[a.id] = match.value;
    });
    return point;
  });

  // Award dots for each athlete
  const awardDots = [];
  selected.forEach((a, i) => {
    (a.awards || []).forEach(award => {
      const dp = chartData.find(d => d.year === award.year);
      if (dp && dp[a.id] !== undefined) {
        awardDots.push({ athleteId: a.id, year: award.year, value: dp[a.id], label: award.label, color: PALETTE[i] });
      }
    });
  });

  const prime = selected[0] ? getPrimeRange(selected[0].timeline) : null;

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, border: '1px solid #2a2a2a' }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        {selected.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 3, backgroundColor: PALETTE[i], borderRadius: 2 }} />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{a.name}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 8, backgroundColor: `${color}22`, border: `1px solid ${color}44`, borderRadius: 2 }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>Prime years (top athlete)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis
            label={{ value: Y_LABELS[sportKey] || 'Value', angle: -90, position: 'insideLeft', fill: '#4b5563', fontSize: 10 }}
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip athletes={athletes} />} />

          {prime && (
            <ReferenceArea
              x1={prime.x1} x2={prime.x2}
              fill={color} fillOpacity={0.06}
              stroke={color} strokeOpacity={0.2}
              label={{ value: 'Prime', fill: color, fontSize: 10, position: 'insideTopLeft' }}
            />
          )}

          {selected.map((a, i) => (
            <Line
              key={a.id}
              type="monotone"
              dataKey={a.id}
              stroke={PALETTE[i]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
              connectNulls
            />
          ))}

          {awardDots.map((d, i) => (
            <ReferenceDot
              key={i}
              x={d.year} y={d.value}
              r={5} fill={d.color} stroke="#0f0f0f" strokeWidth={2}
              label={{ value: '★', fill: d.color, fontSize: 12, position: 'top' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p style={{ color: '#4b5563', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
        ★ marks major awards / titles
      </p>
    </div>
  );
}
