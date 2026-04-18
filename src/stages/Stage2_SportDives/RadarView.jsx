import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const PALETTE = ['#F59E0B', '#14B8A6', '#8B5CF6', '#EF4444', '#3B82F6', '#10B981'];

export default function RadarView({ athletes, attributeMeta, selectedAthletes, setSelectedAthletes, color }) {
  function toggleAthlete(id) {
    if (selectedAthletes.includes(id)) {
      setSelectedAthletes(selectedAthletes.filter(a => a !== id));
    } else if (selectedAthletes.length < 3) {
      setSelectedAthletes([...selectedAthletes, id]);
    }
  }

  const selected = athletes.filter(a => selectedAthletes.includes(a.id));

  const radarData = attributeMeta.map(attr => {
    const point = { axis: attr.label };
    selected.forEach(a => {
      point[a.id] = Math.round((a.normalized?.[attr.name] ?? 0) * 100);
    });
    return point;
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: 8, padding: '10px 14px', fontSize: 12,
      }}>
        <p style={{ color: '#9ca3af', margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
            {athletes.find(a => a.id === p.dataKey)?.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 24, border: '1px solid #2a2a2a' }}>
      {/* Athlete selector pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {athletes.map((a, i) => {
          const isSelected = selectedAthletes.includes(a.id);
          const idx = selectedAthletes.indexOf(a.id);
          const col = idx >= 0 ? PALETTE[idx] : '#4b5563';
          const disabled = !isSelected && selectedAthletes.length >= 3;
          return (
            <button key={a.id} onClick={() => toggleAthlete(a.id)} disabled={disabled} style={{
              padding: '6px 14px', borderRadius: 50, fontSize: 12, fontWeight: isSelected ? 600 : 400,
              border: `1.5px solid ${col}`,
              backgroundColor: isSelected ? `${col}22` : 'transparent',
              color: disabled ? '#4b5563' : isSelected ? col : '#9ca3af',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 150ms ease',
            }}>
              {a.name}
            </button>
          );
        })}
      </div>

      {selected.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#4b5563' }}>
          Select athletes above to compare
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#2a2a2a" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: '#9ca3af', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 9 }} />
            <Tooltip content={<CustomTooltip />} />
            {selected.map((a, i) => (
              <Radar
                key={a.id}
                name={a.name}
                dataKey={a.id}
                stroke={PALETTE[i]}
                fill={PALETTE[i]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend
              formatter={(value) => {
                const a = athletes.find(at => at.id === value);
                return <span style={{ color: '#9ca3af', fontSize: 12 }}>{a?.name || value}</span>;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
