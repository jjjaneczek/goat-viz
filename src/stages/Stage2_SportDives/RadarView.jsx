import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const PALETTE = ['#F59E0B', '#14B8A6', '#8B5CF6', '#EF4444', '#3B82F6', '#10B981'];

function RadarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#9ca3af', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function RadarView({ athletes, attributeMeta, selectedAthletes, setSelectedAthletes, selectedTags, weights }) {
  const safeAthletes = athletes || [];
  const safeSelectedAthletes = selectedAthletes || [];
  const safeWeights = weights || {};

  const activeAttrs = selectedTags && selectedTags.length > 0
    ? (attributeMeta || []).filter(attr => selectedTags.includes(attr.name))
    : (attributeMeta || []);

  const numActive = activeAttrs.length;

  const selected = safeAthletes.filter(a => safeSelectedAthletes.includes(a.id));

  const radarData = activeAttrs.map(attr => {
    const point = { axis: attr.label };
    selected.forEach(a => {
      const baseValue = (a.normalized?.[attr.name] ?? 0) * 100;
      const w = safeWeights[attr.name] ?? (numActive > 0 ? 1 / numActive : 0);
      const scaleFactor = w * numActive;
      point[a.id] = Math.min(100, Math.round(baseValue * scaleFactor));
    });
    return point;
  });

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, border: '1px solid #2a2a2a' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 12 }}>
            Selected athletes come from the leaderboard.
          </p>
          {safeSelectedAthletes.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedAthletes([])}
              style={{
                background: 'none',
                border: '1px solid #4b5563',
                borderRadius: 999,
                color: '#9ca3af',
                padding: '5px 10px',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Clear selected
            </button>
          )}
        </div>

        {safeSelectedAthletes.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {safeSelectedAthletes.map((id, index) => {
              const athlete = safeAthletes.find((a) => a.id === id);
              if (!athlete) return null;
              const col = PALETTE[index % PALETTE.length];
              return (
                <span
                  key={id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    borderRadius: 999,
                    border: `1px solid ${col}`,
                    backgroundColor: `${col}22`,
                    color: col,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col }} />
                  {athlete.name}
                </span>
              );
            })}
          </div>
        ) : (
          <div style={{
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px dashed #3f3f46',
            color: '#6b7280',
            fontSize: 12,
          }}>
            Pick athletes from the leaderboard to compare them here.
          </div>
        )}
      </div>

      {activeAttrs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4b5563' }}>
          Select at least one metric in the side panel to compare
        </div>
      ) : selected.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4b5563' }}>
          Select athletes above to compare
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2a2a2a" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 9 }} />
            <Tooltip content={<RadarTooltip />} />
            {selected.map((a, i) => (
              <Radar
                key={a.id}
                name={a.name}
                dataKey={a.id}
                stroke={PALETTE[i % PALETTE.length]}
                fill={PALETTE[i % PALETTE.length]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend
              formatter={(value) => {
                const a = safeAthletes.find(at => at.id === value);
                return <span style={{ color: '#9ca3af', fontSize: 12 }}>{a?.name || value}</span>;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
