import { useState, useEffect, useRef } from 'react';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import Button from '../design-system/Button';
import Input from '../design-system/Input';
import { examAPI } from '../services/api';

interface QuestionStat {
  questionNo: number;
  timeSpent: number;
}

export default function ExamTimerPage() {
  const [isSetup, setIsSetup] = useState(true);
  const [totalMinutes, setTotalMinutes] = useState('120');
  
  // Timer State
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Question State
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);
  const [questions, setQuestions] = useState<QuestionStat[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const timerRef = useRef<number | null>(null);

  // Main tick
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setCurrentQuestionTime((prev) => prev + 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleFinish();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleStart = () => {
    const mins = parseInt(totalMinutes);
    if (!mins || mins <= 0) {
      setError('Geçerli bir süre girin.');
      return;
    }
    setError('');
    setTimeLeft(mins * 60);
    setIsSetup(false);
    setIsActive(true);
  };

  const handleNextQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { questionNo: currentQuestion, timeSpent: currentQuestionTime }
    ]);
    setCurrentQuestion((prev) => prev + 1);
    setCurrentQuestionTime(0); // Reset for next target
  };

  const handleFinish = async () => {
    setIsActive(false);
    setIsFinished(true);
    setLoading(true);

    // Save current question before finishing
    const finalQuestions = [
      ...questions,
      { questionNo: currentQuestion, timeSpent: currentQuestionTime }
    ];
    setQuestions(finalQuestions);

    try {
      await examAPI.create({
        totalDuration: parseInt(totalMinutes),
        questions: finalQuestions,
      });
    } catch (err: any) {
      setError('Sınav verisi kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Layout className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-clay-foreground sm:text-5xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Sınav (Deneme)
          </h1>
          <p className="mt-2 text-lg font-medium text-clay-muted">Soru başına harcadığın süreyi analiz et.</p>
        </header>

        {error && (
          <div className="rounded-2xl bg-red-100 p-4 font-bold text-red-600 shadow-clay-pressed">
            {error}
          </div>
        )}

        {isSetup ? (
          <Card className="mx-auto max-w-md">
            <h2 className="mb-6 text-2xl font-bold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Hazırlık</h2>
            <div className="space-y-6">
              <Input
                label="Hedef Süre (Dakika)"
                type="number"
                min="1"
                required
                value={totalMinutes}
                onChange={(e) => setTotalMinutes(e.target.value)}
              />
              <Button fullWidth size="lg" onClick={handleStart}>Sınava Başla</Button>
            </div>
          </Card>
        ) : !isFinished ? (
          // Active Exam Active
          <Card className="flex flex-col items-center justify-center py-12">
            <div className="mb-12 flex h-48 w-48 flex-col items-center justify-center rounded-full bg-clay-canvas shadow-clay-pressed sm:h-64 sm:w-64">
              <span className="text-sm font-bold tracking-widest text-clay-muted uppercase">Kalan Süre</span>
              <span
                className={`mt-2 text-5xl font-black sm:text-7xl ${timeLeft < 300 ? 'text-clay-warning' : 'text-clay-accent'}`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="w-full space-y-8 rounded-3xl bg-white p-8 shadow-[inset_10px_10px_20px_#d9d4e3,inset_-10px_-10px_20px_#ffffff]">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-clay-muted">Soru: {currentQuestion}</span>
                <span className="text-xl font-black text-clay-foreground">{formatTime(currentQuestionTime)}</span>
              </div>
              <div className="flex gap-4">
                <Button fullWidth onClick={handleNextQuestion}>Sonraki Soru</Button>
                <Button variant="secondary" onClick={handleFinish} className="text-clay-warning">Bitir</Button>
              </div>
            </div>
          </Card>
        ) : (
          // Finished State
          <Card>
            <h2 className="mb-2 text-3xl font-black text-clay-success" style={{ fontFamily: 'Nunito, sans-serif' }}>Tebrikler!</h2>
            <p className="mb-8 font-medium text-clay-muted text-lg">
              {questions.length} soru için ortalama {questions.length > 0 ? Math.round(questions.reduce((acc, q) => acc + q.timeSpent, 0) / questions.length) : 0} saniye harcadın.
            </p>
            
            <div className="mb-8 max-h-64 overflow-y-auto rounded-3xl bg-clay-canvas p-2 shadow-clay-pressed">
              {questions.map((q) => (
                <div key={q.questionNo} className="mb-2 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm last:mb-0">
                  <span className="font-bold text-clay-muted">Soru {q.questionNo}</span>
                  <span className={`font-black ${q.timeSpent > 120 ? 'text-clay-warning' : 'text-clay-success'}`}>
                    {formatTime(q.timeSpent)}
                  </span>
                </div>
              ))}
            </div>

            <Button
              fullWidth
              disabled={loading}
              onClick={() => {
                setIsSetup(true);
                setIsFinished(false);
                setQuestions([]);
                setCurrentQuestion(1);
                setCurrentQuestionTime(0);
              }}
            >
              Yeni Deneme
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
}
