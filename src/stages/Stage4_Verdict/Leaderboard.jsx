import { useState } from 'react';

const SPORT_COLORS = { football: '#F59E0B', chess: '#14B8A6', boxing: '#EF4444' };
const SPORT_LABELS = { football: 'Football', chess: 'Chess', boxing: 'Boxing' };
const CAT_COLORS = { dominance: '#F59E0B', longevity: '#14B8A6', accolades: '#8B5CF6', eraDifficulty: '#EF4444' };
const CATEGORIES = ['dominance', 'longevity', 'accolades', 'eraDifficulty'];

export default function Leaderboard({ athletes }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overallScore');
  const [sortDir, setSortDir] = useState('desc');

  function handleSort(col) {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  }

  const filtered = athletes
    .filter(a => filter === 'all' || a.sport === filter)
    .sort((a, b) => {
      const va = sortBy === 'overallScore' ? a.overallScore : (a.breakdown?.[sortBy] || 0);
      const vb = sortBy === 'overallScore' ? b.overallScore : (b.breakdown?.[sortBy] || 0);
      return sortDir === 'desc' ? vb - va : va - vb;
    });

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span style={{ color: '#4b5563', marginLeft: 4 }}>↕</span>;
    return <span style={{ color: '#F59E0B', marginLeft: 4 }}>{sortDir === 'desc' ? '↓' : '↑'}</span>;
  };

  const ColHeader = ({ col, label }) => (
    <th
      onClick={() => handleSort(col)}
      style={{
        padding: '10px 12px', textAlign: 'right', cursor: 'pointer',
        fontSize: 11, fontWeight: 600, color: sortBy === col ? '#F59E0B' : '#6b7280',
        userSelect: 'none', whiteSpace: 'nowrap',
      }}
    >
      {label} <SortIcon col={col} />
    </th>
  );

  return (
    <div>
      {/* Sport filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'football', 'chess', 'boxing'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '7px 18px', borderRadius: 50, fontSize: 12,
              border: `1.5px solid ${filter === s ? (SPORT_COLORS[s] || '#F59E0B') : '#2a2a2a'}`,
              backgroundColor: filter === s ? `${SPORT_COLORS[s] || '#F59E0B'}22` : 'transparent',
              color: filter === s ? (SPORT_COLORS[s] || '#F59E0B') : '#6b7280',
              cursor: 'pointer', fontWeight: filter === s ? 600 : 400,
              transition: 'all 150ms ease', textTransform: 'capitalize',
            }}
          >
            {s === 'all' ? 'All Sports' : SPORT_LABELS[s]}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#1a1a1a', borderRadius: 16, border: '1px solid #2a2a2a', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', width: 40 }}>#</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Athlete</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Sport</th>
              <ColHeader col="overallScore" label="Score" />
              <ColHeader col="dominance" label="Dom." />
              <ColHeader col="longevity" label="Long." />
              <ColHeader col="accolades" label="Acc." />
              <ColHeader col="eraDifficulty" label="Era" />
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Breakdown</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr
                key={a.id}
                style={{
                  borderBottom: '1px solid #1f1f1f',
                  transition: 'background-color 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#222'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <td style={{ padding: '10px 16px', color: '#6b7280', fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: '10px 12px', color: '#e5e5e5', fontSize: 13, fontWeight: 500 }}>{a.name}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: 50, fontSize: 10, fontWeight: 600,
                    backgroundColor: `${SPORT_COLORS[a.sport]}22`,
                    color: SPORT_COLORS[a.sport], textTransform: 'capitalize',
                  }}>
                    {SPORT_LABELS[a.sport]}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>
                  {(a.overallScore * 100).toFixed(1)}
                </td>
                {CATEGORIES.map(cat => (
                  <td key={cat} style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: '#9ca3af' }}>
                    {Math.round((a.breakdown?.[cat] || 0) * 100)}
                  </td>
                ))}
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', width: 80, minWidth: 80 }}>
                    {CATEGORIES.map(cat => {
                      const val = a.breakdown?.[cat] || 0;
                      return (
                        <div key={cat} style={{
                          flex: val, backgroundColor: CAT_COLORS[cat],
                          minWidth: val > 0 ? 2 : 0,
                        }} />
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
