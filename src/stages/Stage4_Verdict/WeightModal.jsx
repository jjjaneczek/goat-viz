import { useState } from 'react';

const CATEGORIES = [
  { key: 'dominance',     label: 'Dominance',     color: '#F59E0B' },
  { key: 'longevity',     label: 'Longevity',     color: '#14B8A6' },
  { key: 'accolades',     label: 'Accolades',     color: '#8B5CF6' },
  { key: 'eraDifficulty', label: 'Era Difficulty', color: '#EF4444' },
];

export default function WeightModal({ weights, setWeights, onClose }) {
  const [local, setLocal] = useState({ ...weights });

  function handleSlider(key, val) {
    const newVal = parseInt(val) / 100;
    const prev = local[key];
    const delta = newVal - prev;
    const others = Object.keys(local).filter(k => k !== key);
    const otherTotal = others.reduce((s, k) => s + local[k], 0);
    const updated = { [key]: newVal };
    if (otherTotal > 0) {
      others.forEach(k => { updated[k] = Math.max(0.02, local[k] - delta * (local[k] / otherTotal)); });
    } else {
      const share = (1 - newVal) / others.length;
      others.forEach(k => { updated[k] = Math.max(0.02, share); });
    }
    const total = Object.values(updated).reduce((a, b) => a + b, 0);
    setLocal(Object.fromEntries(Object.keys(updated).map(k => [k, updated[k] / total])));
  }

  function confirm() {
    setWeights(local);
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        backgroundColor: '#1a1a1a', borderRadius: 20, padding: 36,
        border: '1px solid #2a2a2a', width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        <h3 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700,
          marginBottom: 8, color: '#e5e5e5',
        }}>
          Adjust Weights
        </h3>
        <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 28 }}>
          Drag the sliders and the rankings will update live.
        </p>

        {CATEGORIES.map(cat => (
          <div key={cat.key} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: cat.color }}>{cat.label}</span>
              <span style={{ fontSize: 14, color: '#9ca3af' }}>{Math.round(local[cat.key] * 100)}%</span>
            </div>
            <input
              type="range" min="2" max="80" step="1"
              value={Math.round(local[cat.key] * 100)}
              onChange={e => handleSlider(cat.key, e.target.value)}
              style={{ width: '100%', accentColor: cat.color, cursor: 'pointer' }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', background: 'none',
              border: '1px solid #2a2a2a', borderRadius: 10, color: '#9ca3af',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            style={{
              flex: 2, padding: '12px',
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              border: 'none', borderRadius: 10, color: '#0f0f0f',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}
          >
            Apply & Re-rank
          </button>
        </div>
      </div>
    </div>
  );
}
