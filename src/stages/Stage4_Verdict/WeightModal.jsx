import { useState } from 'react';
import { METRICS } from '../../data/attributeMap';

function handleSliderChange(key, rawValue, local, setLocal) {
  const newValue = parseInt(rawValue, 10) / 100;
  const prev = local[key] ?? 0;
  const delta = newValue - prev;
  const otherKeys = Object.keys(local).filter(k => k !== key);
  const otherTotal = otherKeys.reduce((s, k) => s + (local[k] ?? 0), 0);
  const updated = { ...local, [key]: newValue };
  if (otherTotal > 0) {
    otherKeys.forEach(k => {
      updated[k] = Math.max(0.005, (local[k] ?? 0) - delta * ((local[k] ?? 0) / otherTotal));
    });
  } else {
    const share = (1 - newValue) / otherKeys.length;
    otherKeys.forEach(k => { updated[k] = Math.max(0.005, share); });
  }
  const total = Object.values(updated).reduce((a, b) => a + b, 0);
  setLocal(Object.fromEntries(Object.keys(updated).map(k => [k, updated[k] / total])));
}

export default function WeightModal({ weights, setWeights, onClose }) {
  const [local, setLocal] = useState({ ...weights });

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: '#111', borderRadius: 20, padding: '28px 24px',
        border: '1px solid #222', width: '100%', maxWidth: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#e5e5e5', margin: '0 0 4px' }}>
            Adjust Weights
          </h3>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>
            Drag sliders to redistribute importance across metrics
          </p>
        </div>

        {/* Metric sliders — 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {METRICS.map(m => {
            const pct = Math.round((local[m.key] ?? 0) * 100);

            return (
              <div key={m.key} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: m.color, fontFamily: 'DM Mono, monospace' }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: `${pct}%`, height: 3, borderRadius: 2,
                    background: m.color, pointerEvents: 'none', transition: 'width 80ms linear', zIndex: 1,
                  }} />
                  <div style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: '100%', height: 3, borderRadius: 2, background: '#1e1e1e', zIndex: 0,
                  }} />
                  <input
                    type="range" min={0} max={100} step={1} value={pct}
                    onChange={e => handleSliderChange(m.key, e.target.value, local, setLocal)}
                    style={{
                      position: 'relative', zIndex: 2,
                      width: '100%', margin: 0,
                      appearance: 'none', background: 'transparent',
                      accentColor: m.color, cursor: 'pointer', height: 18,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px', background: 'none',
              border: '1px solid #2a2a2a', borderRadius: 10,
              color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { setWeights(local); onClose(); }}
            style={{
              flex: 2, padding: '11px',
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
