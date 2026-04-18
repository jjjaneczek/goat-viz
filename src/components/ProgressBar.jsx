const stages = [
  { id: 1, label: 'Your Values' },
  { id: 2, label: 'Sport Dives' },
  { id: 3, label: 'Compare' },
  { id: 4, label: 'Verdict' },
];

export default function ProgressBar({ currentStage, goTo }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      backgroundColor: '#0f0f0f',
      borderBottom: '1px solid #2a2a2a',
      padding: '12px 32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, maxWidth: 700, margin: '0 auto' }}>
        {stages.map((stage, i) => {
          const done = currentStage > stage.id;
          const active = currentStage === stage.id;
          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: i < stages.length - 1 ? 1 : 'none' }}>
              <div
                onClick={() => done && goTo(stage.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  cursor: done ? 'pointer' : 'default',
                  minWidth: 80,
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  backgroundColor: done ? '#F59E0B' : active ? '#F59E0B' : 'transparent',
                  border: `2px solid ${done || active ? '#F59E0B' : '#4b5563'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 300ms ease',
                }}>
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: 11, fontFamily: 'DM Sans, sans-serif', fontWeight: active ? 600 : 400,
                  color: done ? '#F59E0B' : active ? '#e5e5e5' : '#6b7280',
                  whiteSpace: 'nowrap',
                  transition: 'color 300ms ease',
                }}>
                  {stage.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div style={{
                  flex: 1, height: 2, marginBottom: 18,
                  backgroundColor: done ? '#F59E0B' : '#2a2a2a',
                  transition: 'background-color 300ms ease',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
