import Leaderboard from './Leaderboard';
import Podium from './Podium';

export default function Stage4_Verdict({ athletes, overallScores, selectedTags }) {

  const allAthletes = [
    ...athletes.football.map(a => ({ ...a, sport: 'football' })),
    ...athletes.chess.map(a => ({ ...a, sport: 'chess' })),
    ...athletes.boxing.map(a => ({ ...a, sport: 'boxing' })),
  ].map(a => ({
    ...a,
    overallScore: overallScores[a.id]?.score || 0,
    breakdown: overallScores[a.id]?.breakdown || {},
  })).sort((a, b) => b.overallScore - a.overallScore);

  const top3 = allAthletes.slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px 80px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 900, margin: '0 0 12px',
          background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          The Verdict
        </h2>
        <p style={{ color: '#6b7280', fontSize: 15 }}>
          Based on your values, here are the greatest athletes of all time
        </p>
      </div>

      <Podium top3={top3} selectedTags={selectedTags} />

      <div style={{ margin: '60px 0 32px' }}>
        <h3 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700,
          marginBottom: 8, color: '#e5e5e5',
        }}>
          Full Rankings
        </h3>
        <p style={{ color: '#6b7280', fontSize: 13 }}>
          All athletes across all three sports, ranked by your weights
        </p>
      </div>

      <Leaderboard athletes={allAthletes} selectedTags={selectedTags} />

      <div style={{
        marginTop: 60, padding: 32, backgroundColor: '#1a1a1a',
        borderRadius: 20, border: '1px solid #2a2a2a', textAlign: 'center',
      }}>
        <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 8 }}>
          Your values shaped this result. Use the keyword panel on the left to change them and see who rises.
        </p>
      </div>
    </div>
  );
}
