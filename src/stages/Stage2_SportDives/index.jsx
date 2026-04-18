import SportDive from './SportDive';

const SPORTS = [
  { key: 'football', label: 'Football',  tagline: 'The beautiful game — goals, glory, and legacy', color: '#F59E0B' },
  { key: 'chess',    label: 'Chess',     tagline: 'The ultimate mind sport — dominance over the board', color: '#14B8A6' },
  { key: 'boxing',   label: 'Boxing',    tagline: 'The sweet science — power, heart, and survival', color: '#EF4444' },
];

export default function Stage2_SportDives({
  currentSport, setCurrentSport, goTo,
  selectedAthletes, setSelectedAthletes,
  weights, setWeights, athletes, attributeMeta, sportScores,
}) {
  const sport = SPORTS.find(s => s.key === currentSport);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      {/* Sport tab bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8,
        padding: '20px 20px 0', borderBottom: '1px solid #2a2a2a', marginBottom: 0,
      }}>
        {SPORTS.map(s => (
          <button
            key={s.key}
            onClick={() => setCurrentSport(s.key)}
            style={{
              padding: '10px 24px', borderRadius: '8px 8px 0 0',
              border: 'none',
              backgroundColor: currentSport === s.key ? '#1a1a1a' : 'transparent',
              borderTop: currentSport === s.key ? `2px solid ${s.color}` : '2px solid transparent',
              color: currentSport === s.key ? s.color : '#6b7280',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all 200ms ease',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <SportDive
        sportKey={currentSport}
        sport={sport}
        athletes={athletes[currentSport]}
        attributeMeta={attributeMeta[currentSport]}
        sportScores={sportScores[currentSport] || {}}
        selectedAthletes={selectedAthletes[currentSport]}
        setSelectedAthletes={(ids) => setSelectedAthletes({ ...selectedAthletes, [currentSport]: ids })}
        weights={weights}
        setWeights={setWeights}
        goTo={goTo}
      />
    </div>
  );
}
