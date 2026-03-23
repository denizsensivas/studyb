import { useState, useEffect } from 'react';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import Button from '../design-system/Button';
import Badge from '../design-system/Badge';
import { useTimer } from '../hooks/useTimer';
import { pomodoroAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import SubjectAutocomplete from '../components/SubjectAutocomplete';

export default function PomodoroPage() {
  const [completedToday, setCompletedToday] = useState(0);
  const [error, setError] = useState('');

  // Subject Selection
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();

  const { user, updatePreferences } = useAuth();
  const prefs = user?.preferences || {};

  // Settings
  const [autoStartBreaks, setAutoStartBreaks] = useState<boolean>(prefs.autoStartBreaks ?? false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState<boolean>(prefs.autoStartPomodoros ?? false);
  const [longBreakInterval, setLongBreakInterval] = useState<number>(prefs.longBreakInterval ?? 4);
  const [autoCheckTasks, setAutoCheckTasks] = useState<boolean>(prefs.autoCheckTasks ?? true);
  const [checkToBottom, setCheckToBottom] = useState<boolean>(prefs.checkToBottom ?? true);

  // Tasks
  const [tasks, setTasks] = useState<{ id: string, text: string, completed: boolean }[]>(() => {
    const s = localStorage.getItem('studyb_tasks');
    return s ? JSON.parse(s) : [];
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => localStorage.setItem('studyb_tasks', JSON.stringify(tasks)), [tasks]);

  const handleComplete = async (completedMode: string, _durationMinutes: number, consumedMinutes: number) => {
    let nextMode: 'pomodoro' | 'shortBreak' | 'longBreak' = 'pomodoro';

    if (completedMode === 'pomodoro') {
      try {
        if (consumedMinutes > 0) {
          await pomodoroAPI.create(consumedMinutes, selectedSubjectId, selectedSubjectName || undefined);
          setCompletedToday((prev) => prev + 1);
        }

        if (autoCheckTasks) {
          setTasks(prev => {
            const firstUnchecked = prev.find(t => !t.completed);
            if (firstUnchecked) return prev.map(t => t.id === firstUnchecked.id ? { ...t, completed: true } : t);
            return prev;
          });
        }
      } catch (err) { setError('Oturum kaydedilemedi.'); }

      // Determine if next is short or long break based on current session count
      nextMode = ((completedToday + 1) % longBreakInterval === 0) ? 'longBreak' : 'shortBreak';
    } else {
      // If completed a break, next is always pomodoro
      nextMode = 'pomodoro';
    }

    setMode(nextMode);

    if (nextMode === 'shortBreak' || nextMode === 'longBreak') {
      if (autoStartBreaks) setTimeout(start, 50);
    } else {
      if (autoStartPomodoros) setTimeout(start, 50);
    }
  };

  const {
    timeLeft, isRunning, mode, start, pause, reset, setMode, customDurations, setAllCustomDurations, skip
  } = useTimer(handleComplete);

  // Initialize custom durations from preferences
  useEffect(() => {
    if (prefs.customDurations) {
      setAllCustomDurations(prefs.customDurations);
    }

    // Fetch today's session count
    const fetchStats = async () => {
      try {
        const { data } = await pomodoroAPI.getStats();
        setCompletedToday(data.today.count);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save changes to database (debounced)
  useEffect(() => {
    const currentPrefs = {
      autoStartBreaks,
      autoStartPomodoros,
      longBreakInterval,
      autoCheckTasks,
      checkToBottom,
      customDurations,
    };

    if (JSON.stringify(currentPrefs) === JSON.stringify(prefs)) return;

    const handler = setTimeout(() => {
      updatePreferences(currentPrefs).catch(console.error);
    }, 1000);
    return () => clearTimeout(handler);
  }, [autoStartBreaks, autoStartPomodoros, longBreakInterval, autoCheckTasks, checkToBottom, customDurations, prefs, updatePreferences]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, { id: crypto.randomUUID(), text: newTask.trim(), completed: false }]);
    setNewTask('');
  };
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const sortedTasks = [...tasks].sort((a, b) => checkToBottom ? (a.completed === b.completed ? 0 : a.completed ? 1 : -1) : 0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'pomodoro' ? ((customDurations.pomodoro - timeLeft) / customDurations.pomodoro) * 100
    : mode === 'shortBreak' ? ((customDurations.shortBreak - timeLeft) / customDurations.shortBreak) * 100
      : ((customDurations.longBreak - timeLeft) / customDurations.longBreak) * 100;

  return (
    <Layout className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Pomodoro Zamanlayıcı
              </h1>
              <Badge variant="success" className="w-fit">Bugün: {completedToday} Oturum</Badge>
            </div>
            <p className="mt-1 text-sm font-medium text-clay-muted">Odaklanma zamanı. Bildirimleri kapat.</p>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl bg-red-100 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-stretch md:items-start justify-center gap-4 xl:gap-6 min-h-[550px]">
          <Card className="flex-[1.5] min-w-0 md:min-w-[380px] flex flex-col items-center justify-center py-6 px-4">
            {/* Mode Selector */}
            <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-4 rounded-full bg-clay-canvas p-1.5 sm:p-2 shadow-clay-pressed">
              <button
                onClick={() => setMode('pomodoro')}
                className={`rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition-all duration-300 ${mode === 'pomodoro'
                    ? 'bg-clay-accent text-white shadow-clay-button'
                    : 'text-clay-muted hover:text-clay-foreground'
                  }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Pomodoro
              </button>
              <button
                onClick={() => setMode('shortBreak')}
                className={`rounded-full px-6 py-2 text-sm font-bold transition-all duration-300 ${mode === 'shortBreak'
                    ? 'bg-clay-secondary text-white shadow-clay-button'
                    : 'text-clay-muted hover:text-clay-foreground'
                  }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Kısa Mola
              </button>
              <button
                onClick={() => setMode('longBreak')}
                className={`rounded-full px-6 py-2 text-sm font-bold transition-all duration-300 ${mode === 'longBreak'
                    ? 'bg-clay-tertiary text-white shadow-clay-button'
                    : 'text-clay-muted hover:text-clay-foreground'
                  }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Uzun Mola
              </button>
            </div>

            {/* Timer Display */}
            <div
              className={`
                relative flex h-60 w-60 sm:h-72 sm:w-72 items-center justify-center rounded-full
                bg-clay-canvas shadow-clay-pressed
                transition-all duration-500
                ${isRunning ? 'scale-[0.98]' : 'scale-100'}
              `}
            >
              {/* Progress Ring (Pure CSS approximation for Clay) */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#2563EB ${progress}%, transparent ${progress}%)`,
                  opacity: 0.1,
                  filter: 'blur(8px)',
                  transform: 'scale(1.1)'
                }}
              />

              <div className="relative flex h-52 w-52 sm:h-60 sm:w-60 flex-col items-center justify-center rounded-full bg-white shadow-clay-button">
                <span
                  className="text-5xl font-black tracking-tight text-clay-foreground sm:text-6xl"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {formatTime(timeLeft)}
                </span>
                <span className="mt-2 text-xs font-bold tracking-wide text-clay-muted uppercase">
                  {isRunning ? 'Çalışıyor...' : 'Hazır'}
                </span>
              </div>
            </div>

            {/* Subject Selection */}
            {mode === 'pomodoro' && (
              <div className="mt-8 w-full max-w-sm">
                <SubjectAutocomplete
                  value={selectedSubjectName}
                  onChange={(name, id) => {
                    setSelectedSubjectName(name);
                    setSelectedSubjectId(id);
                  }}
                />
                <button
                  onClick={() => {
                    setSelectedSubjectName('');
                    setSelectedSubjectId(undefined);
                  }}
                  className="mt-2 text-xs font-bold text-clay-muted hover:text-clay-accent transition-colors"
                >
                  Konusuz Devam Et
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="mt-8 flex gap-4 sm:gap-6 items-center">
              {!isRunning && timeLeft > 0 ? (
                <Button onClick={start} size="lg" className="w-32 sm:w-40 bg-gradient-to-br from-[#34D399] to-[#10B981] shadow-[12px_12px_24px_rgba(16,185,129,0.3),-8px_-8px_16px_rgba(255,255,255,0.4),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)] hover:shadow-[16px_16px_32px_rgba(16,185,129,0.35),-10px_-10px_20px_rgba(255,255,255,0.5),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)]">Başlat</Button>
              ) : (
                <Button onClick={pause} size="lg" className="w-32 sm:w-40 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] shadow-[12px_12px_24px_rgba(245,158,11,0.3),-8px_-8px_16px_rgba(255,255,255,0.4),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)] hover:shadow-[16px_16px_32px_rgba(245,158,11,0.35),-10px_-10px_20px_rgba(255,255,255,0.5),inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(0,0,0,0.1)]">Duraklat</Button>
              )}
              <Button onClick={reset} variant="secondary" size="lg" className="w-32 sm:w-40 text-clay-warning disabled:opacity-50" disabled={isRunning}>Sıfırla</Button>
              <button
                onClick={skip}
                className="h-12 w-12 rounded-full flex items-center justify-center text-clay-muted hover:text-clay-foreground hover:bg-clay-canvas shadow-clay-pressed"
                title="Geç"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4zm14 0h-2v16h2V4z" /></svg>
              </button>
            </div>
          </Card>

          <Card hover={false} className="flex-1 min-w-0 md:min-w-[280px]">
            <h3 className="mb-2 text-lg font-bold text-clay-accent" style={{ fontFamily: 'Nunito, sans-serif' }}>Görevler</h3>
            <form onSubmit={addTask} className="mb-4 flex gap-2">
              <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Yeni görev..." className="flex-1 rounded-xl bg-clay-canvas px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-clay-accent shadow-clay-pressed" />
              <button type="submit" className="rounded-xl bg-clay-accent px-3 py-2 text-white font-bold text-sm">+</button>
            </form>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
              {sortedTasks.length === 0 ? (
                <div className="text-center py-4 text-clay-muted font-bold text-xs">Görev listesi boş</div>
              ) : (
                sortedTasks.map(t => (
                  <div key={t.id} className={`flex items-center justify-between p-2 rounded-xl border border-white bg-clay-canvas shadow-sm ${t.completed ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id)} className="h-4 w-4 rounded accent-clay-success" />
                      <span className={`text-sm font-medium ${t.completed ? 'line-through text-clay-muted' : 'text-clay-foreground'}`}>{t.text}</span>
                    </div>
                    <button onClick={() => removeTask(t.id)} className="text-clay-warning hover:text-red-600 text-lg">×</button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card hover={false} className="flex-1 min-w-0 md:min-w-[280px]">
            <h3 className="mb-3 text-lg font-bold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Ayarlar</h3>
            <div className="space-y-5">
              <div>
                <span className="text-xs font-bold text-clay-muted uppercase tracking-wider mb-2 block">Süre (dakika)</span>
                <div className="grid grid-cols-3 gap-2">
                  {['pomodoro', 'shortBreak', 'longBreak'].map(m => (
                    <div key={m} className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-clay-muted truncate">{m === 'pomodoro' ? 'Odak' : m === 'shortBreak' ? 'Kısa' : 'Uzun'}</span>
                      <input type="number"
                        value={customDurations[m as keyof typeof customDurations] / 60}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value));
                          setAllCustomDurations({ ...customDurations, [m]: val * 60 });
                        }}
                        className="w-full rounded-lg bg-clay-canvas px-2 py-1.5 text-center font-bold text-sm shadow-inner"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-clay-muted">Molaları Otomatik Başlat</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={autoStartBreaks} onChange={e => setAutoStartBreaks(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-clay-canvas peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clay-success shadow-inner"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-clay-muted">Odakları Otomatik Başlat</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={autoStartPomodoros} onChange={e => setAutoStartPomodoros(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-clay-canvas peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clay-success shadow-inner"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-clay-muted">Uzun Mola Aralığı</span>
                  <input
                    type="number"
                    min={1}
                    value={longBreakInterval}
                    onChange={e => setLongBreakInterval(Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded-lg bg-clay-canvas px-2 py-1.5 text-center font-bold text-sm shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200/50">
                <span className="text-xs font-bold text-clay-muted uppercase tracking-wider mb-2 block">Görevler</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-clay-muted">Oto. Tamamla</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={autoCheckTasks} onChange={e => setAutoCheckTasks(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-clay-canvas peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clay-success shadow-inner"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-clay-muted">Tamamlananları Alta Al</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={checkToBottom} onChange={e => setCheckToBottom(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-clay-canvas peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clay-success shadow-inner"></div>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
