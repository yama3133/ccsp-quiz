import React, { useState } from 'react';
import { questions as originalQuestions, DOMAINS } from './questions';
import './App.css';

const LETTERS = ['A', 'B', 'C', 'D'];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleQuestion(q) {
  const indexed = q.options.map((opt, i) => ({ opt, isCorrect: i === q.answer }));
  const shuffled = shuffleArray(indexed);
  const newAnswer = shuffled.findIndex(x => x.isCorrect);
  return {
    ...q,
    options: shuffled.map(x => x.opt),
    answer: newAnswer,
  };
}

function Ambient() {
  return <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} className="bg-ambient" />;
}

function Grid() {
  return <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} className="bg-grid" />;
}

const App = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [stage, setStage] = useState('title');
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(14400);
  const [timerActive, setTimerActive] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  const startQuiz = (mode, domainId = null) => {
    let qList;
    if (mode === 'sequential') {
      qList = domainId ? originalQuestions.filter(q => q.domain === domainId) : [...originalQuestions];
    } else if (mode === 'random') {
      qList = domainId ? shuffleArray(originalQuestions.filter(q => q.domain === domainId)) : shuffleArray(originalQuestions);
    } else if (mode === 'exam') {
      qList = shuffleArray(originalQuestions);
      setTimeLeft(14400);
      setTimerActive(true);
    } else {
      qList = [...originalQuestions];
    }
    
    qList = qList.map(shuffleQuestion);
    setQuestions(qList);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswers(new Array(qList.length).fill(-1));
    setShowExplanation(false);
    setStage('quiz');
  };

  const selectOption = (idx) => {
    if (selectedAnswers[currentQuestion] !== -1) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = idx;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);

    if (idx === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(selectedAnswers[currentQuestion - 1] !== -1);
    }
  };

  const finishQuiz = () => {
    setTimerActive(false);
    setStage('result');
  };

  const goToTitle = () => {
    setStage('title');
    setShowExplanation(false);
    setScore(0);
    setSelectedAnswers([]);
    setQuestions([]);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (stage === 'title') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <Ambient />
        <Grid />
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 60, animation: 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ff8c42 0%, #ffb366 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12, lineHeight: 1.2 }}>
              CCSP 認定試験
            </div>
            <div style={{ fontSize: isMobile ? 11 : 14, color: '#7a8599', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Certified Cloud Security Professional
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 12, marginBottom: 24, animation: 'fade-in 0.6s ease 0.1s both' }}>
            <div onClick={() => startQuiz('sequential', null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: isMobile ? '14px 16px' : '18px 22px', background: 'linear-gradient(180deg, #ff8c42 0%, #e67e30 100%)', border: '1px solid rgba(230, 126, 48, 0.55)', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease', boxShadow: '0 1px 0 rgba(255, 255, 255, 0.2) inset, 0 8px 20px rgba(255, 140, 66, 0.32)' }}>
              <div>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, letterSpacing: '-0.005em', color: '#ffffff' }}>全問順番通り</div>
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5 }}>200問 順序通りに出題</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: '0.06em', padding: '5px 10px', background: 'rgba(255, 255, 255, 0.18)', border: '1px solid rgba(255, 255, 255, 0.28)', borderRadius: 999, color: '#ffffff' }}>順序</div>
            </div>

            <div onClick={() => startQuiz('random', null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: isMobile ? '14px 16px' : '18px 22px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease', boxShadow: 'var(--shadow-sm)', color: 'var(--text)' }}>
              <div>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text)' }}>ランダム200問</div>
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'var(--text-dim)', lineHeight: 1.5 }}>200問 シャッフル</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: '0.06em', padding: '5px 10px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 999, color: 'var(--text-dim)' }}>ランダム</div>
            </div>

            <div onClick={() => startQuiz('exam', null)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: isMobile ? '14px 16px' : '18px 22px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease', boxShadow: 'var(--shadow-sm)', color: 'var(--text)' }}>
              <div>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text)' }}>模擬試験</div>
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'var(--text-dim)', lineHeight: 1.5 }}>4時間 制限時間付き</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: '0.06em', padding: '5px 10px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 999, color: 'var(--text-dim)' }}>本番</div>
            </div>
          </div>

          <div style={{ animation: 'fade-in 0.6s ease 0.2s both' }}>
            <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>ドメイン別</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(100px, 1fr))' : 'repeat(auto-fit, minmax(150px, 1fr))', gap: isMobile ? 6 : 10 }}>
              {[1, 2, 3, 4, 5, 6].map(id => {
                const domainQuestions = originalQuestions.filter(q => q.domain === id);
                return (
                  <div key={id} onClick={() => startQuiz('sequential', id)} style={{ padding: isMobile ? '10px 12px' : '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', textAlign: 'center', color: 'var(--text)', fontSize: isMobile ? 11 : 13, fontWeight: 600, transition: 'all 0.15s ease', boxShadow: 'var(--shadow-sm)' }}>
                    ドメイン{id}
                    <br />
                    ({domainQuestions.length}問)
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'quiz' && questions.length > 0) {
    const q = questions[currentQuestion];
    const selectedIdx = selectedAnswers[currentQuestion];

    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', zIndex: 1 }}>
        <Ambient />
        <Grid />
        <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '20px 16px' : '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-sm)', animation: 'slide-up 0.5s ease' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>進捗</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#ff8c42' }}>{currentQuestion + 1}/{questions.length}</div>
            </div>
            <div style={{ width: 280, height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #ff8c42 0%, #ffb366 100%)', transition: 'width 0.3s ease', width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
            </div>
            {timerActive && <div style={{ fontSize: 16, fontWeight: 700, color: timeLeft < 600 ? '#ef4444' : '#ff8c42', fontFamily: "'JetBrains Mono', monospace" }}>{formatTime(timeLeft)}</div>}
            <button onClick={() => { setStage('title'); setTimerActive(false); }} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>中断</button>
          </div>

          <div style={{ flex: 1, marginBottom: 24, animation: 'slide-up 0.4s ease' }}>
            <div style={{ padding: isMobile ? 20 : 32, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255, 140, 66, 0.12)', border: '1px solid rgba(255, 140, 66, 0.4)', borderRadius: 8, fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ff8c42', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
                {DOMAINS.find(d => d.id === q.domain)?.name}
              </div>
              <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 600, lineHeight: 1.7, color: 'var(--text)', marginBottom: 28, letterSpacing: '-0.002em' }}>
                {q.question}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 12, marginBottom: 24 }}>
                {q.options.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectOption(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: isMobile ? 10 : 14,
                      padding: isMobile ? '12px 14px' : '16px 18px',
                      background: selectedIdx === idx ? (idx === q.answer ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)') : 'var(--surface)',
                      border: `1px solid ${selectedIdx === idx ? (idx === q.answer ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)') : 'var(--border)'}`,
                      borderRadius: 12,
                      cursor: selectedIdx === -1 ? 'pointer' : 'default',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                      width: '100%',
                      boxShadow: selectedIdx === idx ? (idx === q.answer ? '0 6px 16px rgba(34, 197, 94, 0.2)' : '0 6px 16px rgba(239, 68, 68, 0.2)') : 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{
                      flexShrink: 0,
                      width: isMobile ? 28 : 32,
                      height: isMobile ? 28 : 32,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: isMobile ? 11 : 13,
                      fontWeight: 700,
                      borderRadius: 8,
                      background: selectedIdx === idx ? (idx === q.answer ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'var(--surface-3)',
                      border: '1px solid' + (selectedIdx === idx ? (idx === q.answer ? ' rgba(34, 197, 94, 0.6)' : ' rgba(239, 68, 68, 0.6)') : ' var(--border)'),
                      color: selectedIdx === idx ? (idx === q.answer ? '#22c55e' : '#ef4444') : 'var(--text-dim)',
                    }}>
                      {LETTERS[idx]}
                    </div>
                    <div style={{ fontSize: isMobile ? '13px' : '14.5px', lineHeight: 1.75, color: 'var(--text)', flex: 1 }}>
                      {opt}
                    </div>
                  </div>
                ))}
              </div>
              {showExplanation && (
                <div style={{ padding: 16, background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 10, marginTop: 16, animation: 'fade-in 0.4s ease' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22c55e', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>解説</div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: isMobile ? 8 : 12, justifyContent: 'space-between' }}>
            <button onClick={prevQuestion} disabled={currentQuestion === 0} style={{ flex: 1, padding: isMobile ? '12px 16px' : '14px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#ff8c42', fontSize: isMobile ? 13 : 14, transition: 'all 0.15s ease', opacity: currentQuestion === 0 ? 0.5 : 1 }}>← 前へ</button>
            <button onClick={nextQuestion} style={{ flex: 1, padding: isMobile ? '12px 16px' : '14px 20px', background: 'linear-gradient(180deg, #ff8c42 0%, #e67e30 100%)', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, color: '#ffffff', fontSize: isMobile ? 13 : 14, transition: 'all 0.15s ease', boxShadow: '0 8px 20px rgba(255, 140, 66, 0.3)' }}>次へ →</button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'result') {
    const percentage = Math.round((score / questions.length) * 100);
    const domainResults = DOMAINS.map(domain => {
      const domainQuestions = questions.filter(q => q.domain === domain.id);
      const domainScore = domainQuestions.filter(q => questions.indexOf(q) !== -1 && selectedAnswers[questions.indexOf(q)] === q.answer).length;
      return { domain: domain.name, score: domainScore, total: domainQuestions.length };
    });

    return (
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
        <Ambient />
        <Grid />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: isMobile ? '20px 16px' : '40px 20px' }}>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700, textAlign: 'center', marginBottom: isMobile ? 24 : 40, animation: 'slide-up 0.5s ease' }}>試験終了</div>

          <div style={{ position: 'relative', width: isMobile ? 180 : 220, height: isMobile ? 180 : 220, margin: '0 auto ' + (isMobile ? '24px' : '40px'), animation: 'fade-in 0.6s ease 0.2s both' }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `conic-gradient(#ff8c42 0deg, #ff8c42 ${percentage * 3.6}deg, var(--surface-3) ${percentage * 3.6}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lg)',
              border: isMobile ? '6px solid var(--surface)' : '8px solid var(--surface)',
            }}>
              <div style={{ width: isMobile ? 140 : 180, height: isMobile ? 140 : 180, borderRadius: '50%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <div style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, color: '#ff8c42' }}>{percentage}%</div>
                <div style={{ fontSize: isMobile ? 10 : 12, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>正解率</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 12 : 20, width: '100%', marginBottom: isMobile ? 20 : 32, animation: 'fade-in 0.6s ease 0.3s both' }}>
            <div style={{ padding: isMobile ? 16 : 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: '#ff8c42', marginBottom: 4 }}>{score}</div>
              <div style={{ fontSize: isMobile ? 10 : 12, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}>正解数</div>
            </div>
            <div style={{ padding: isMobile ? 16 : 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: '#ff8c42', marginBottom: 4 }}>{questions.length}</div>
              <div style={{ fontSize: isMobile ? 10 : 12, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}>総問数</div>
            </div>
          </div>

          <div style={{ width: '100%', marginBottom: isMobile ? 20 : 32, animation: 'fade-in 0.6s ease 0.4s both' }}>
            {domainResults.map(result => (
              <div key={result.domain} style={{ padding: isMobile ? 12 : 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: 'var(--text)' }}>{result.domain}</div>
                <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 700, color: '#ff8c42', fontFamily: "'JetBrains Mono', monospace" }}>{result.score}/{result.total}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: isMobile ? 8 : 12, width: '100%', animation: 'fade-in 0.6s ease 0.5s both' }}>
            <button onClick={() => location.reload()} style={{ flex: 1, padding: isMobile ? '12px 16px' : '14px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', fontWeight: 600, color: 'var(--text)', fontSize: isMobile ? 13 : 14, transition: 'all 0.15s ease' }}>もう一度</button>
            <button onClick={goToTitle} style={{ flex: 1, padding: isMobile ? '12px 16px' : '14px 20px', background: 'linear-gradient(180deg, #ff8c42 0%, #e67e30 100%)', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, color: '#ffffff', fontSize: isMobile ? 13 : 14, transition: 'all 0.15s ease', boxShadow: '0 8px 20px rgba(255, 140, 66, 0.3)' }}>メニューへ</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
