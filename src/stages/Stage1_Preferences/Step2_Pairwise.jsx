import { useState, useEffect } from 'react';
import { getQuestionsForTags } from '../../data/attributeMap';

export default function Step2_Pairwise({ selectedTags, onNext, onBack }) {
  const questions = getQuestionsForTags(selectedTags);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [slideDir, setSlideDir] = useState('in');

  useEffect(() => {
    setChosen(null);
    setSlideDir('in');
  }, [currentQ]);

  function handleChoice(choice) {
    setChosen(choice);
    const newAnswers = [...answers, { questionId: questions[currentQ].id, choice, maps: questions[currentQ].maps[choice] }];
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setSlideDir('out');
        setTimeout(() => {
          setAnswers(newAnswers);
          setCurrentQ(currentQ + 1);
          setSlideDir('in');
        }, 200);
      } else {
        onNext(newAnswers);
      }
    }, 400);
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
        {questions.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: i <= currentQ ? '#F59E0B' : '#2a2a2a',
            border: `2px solid ${i <= currentQ ? '#F59E0B' : '#4b5563'}`,
            transition: 'all 300ms ease',
          }} />
        ))}
      </div>

      <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
        Question {currentQ + 1} of {questions.length}
      </p>

      <div style={{
        opacity: slideDir === 'in' ? 1 : 0,
        transform: slideDir === 'in' ? 'translateX(0)' : 'translateX(-30px)',
        transition: 'all 200ms ease',
      }}>
        <h2 style={{
          fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
          fontWeight: 700, marginBottom: 32, color: '#e5e5e5',
        }}>
          {q.question}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          {['a', 'b'].map(opt => {
            const data = q[opt];
            const isChosen = chosen === opt;
            const isRejected = chosen && chosen !== opt;
            return (
              <button
                key={opt}
                onClick={() => !chosen && handleChoice(opt)}
                style={{
                  padding: '24px 20px', borderRadius: 16,
                  border: isChosen ? '2px solid #F59E0B' : '2px solid #2a2a2a',
                  backgroundColor: isChosen ? 'rgba(245,158,11,0.1)' : '#1a1a1a',
                  color: isRejected ? '#4b5563' : '#e5e5e5',
                  textAlign: 'left', cursor: chosen ? 'default' : 'pointer',
                  opacity: isRejected ? 0.4 : 1,
                  transform: isChosen ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 250ms ease',
                }}
              >
                <div style={{
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15,
                  marginBottom: 8, color: isChosen ? '#F59E0B' : '#e5e5e5',
                }}>
                  {data.title}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                  {data.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none',
          color: '#6b7280', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif', fontSize: 14,
        }}
      >
        ← Back
      </button>
    </div>
  );
}
