import RadarView from './RadarView';
import RankedBarChart from './RankedBarChart';
import CareerTimeline from './CareerTimeline';

export default function SportDive({
  sportKey, sport, athletes, attributeMeta, sportScores,
  selectedAthletes, setSelectedAthletes,
  weights, setWeights, goTo,
}) {
  const topAthlete = athletes
    .map(a => ({ ...a, score: sportScores[a.id]?.score || 0 }))
    .sort((a, b) => b.score - a.score)[0];

  const top2Reasons = topAthlete
    ? Object.entries(sportScores[topAthlete.id]?.breakdown || {})
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([k]) => ({ dominance: 'Dominance', longevity: 'Longevity', accolades: 'Accolades', eraDifficulty: 'Era Difficulty' }[k]))
    : [];

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
      {/* Sport header */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.8rem, 4vw, 3rem)',
          fontWeight: 900, margin: '0 0 8px',
          color: sport.color,
        }}>
          {sport.label}
        </h2>
        <p style={{ color: '#6b7280', fontSize: 15, fontStyle: 'italic' }}>{sport.tagline}</p>
      </div>

      {/* Section: Radar */}
      <section style={{ marginBottom: 52 }}>
        <SectionHeading number="01" title="Athlete Comparison" subtitle="Select up to 3 athletes to compare across all dimensions" />
        <RadarView
          athletes={athletes}
          attributeMeta={attributeMeta}
          selectedAthletes={selectedAthletes}
          setSelectedAthletes={setSelectedAthletes}
          color={sport.color}
        />
      </section>

      {/* Section: Bar Chart */}
      <section style={{ marginBottom: 52 }}>
        <SectionHeading number="02" title="GOAT Rankings" subtitle="All athletes ranked by your current weights" />
        <RankedBarChart
          athletes={athletes}
          attributeMeta={attributeMeta}
          sportScores={sportScores}
          selectedAthletes={selectedAthletes}
          weights={weights}
          setWeights={setWeights}
          color={sport.color}
        />
      </section>

      {/* Section: Timeline */}
      <section style={{ marginBottom: 52 }}>
        <SectionHeading number="03" title="Career Timeline" subtitle="Peak performance and longevity over the years" />
        <CareerTimeline
          athletes={athletes}
          selectedAthletes={selectedAthletes}
          color={sport.color}
          sportKey={sportKey}
        />
      </section>

      {/* GOAT Card */}
      {topAthlete && (
        <div style={{
          backgroundColor: '#1a1a1a', borderRadius: 20, padding: 32,
          border: `1px solid ${sport.color}33`,
          boxShadow: `0 0 40px ${sport.color}15`,
          textAlign: 'center',
        }}>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
            Based on your values, the {sport.label} GOAT is...
          </p>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${sport.color}, ${sport.color}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: '#0f0f0f',
          }}>
            {initials(topAthlete.name)}
          </div>
          <h3 style={{
            fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 900,
            color: sport.color, margin: '0 0 8px',
          }}>
            {topAthlete.name}
          </h3>
          <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
            Score: <strong style={{ color: '#e5e5e5' }}>{(topAthlete.score * 100).toFixed(1)}</strong>
            {' '}· Top traits: <strong style={{ color: '#e5e5e5' }}>{top2Reasons.join(', ')}</strong>
          </p>
          <button
            onClick={() => goTo(3)}
            style={{
              padding: '12px 32px', background: 'none',
              border: `2px solid ${sport.color}`, borderRadius: 50,
              color: sport.color, fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${sport.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            See how the scores compare →
          </button>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <span style={{ color: '#4b5563', fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
          {number}
        </span>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, margin: 0, color: '#e5e5e5' }}>
          {title}
        </h3>
      </div>
      <p style={{ color: '#6b7280', fontSize: 13, margin: 0, paddingLeft: 28 }}>{subtitle}</p>
    </div>
  );
}
