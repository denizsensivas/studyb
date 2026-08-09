import { useState, useEffect } from 'react';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import StatOrb from '../design-system/StatOrb';
import { analyticsAPI } from '../services/api';

const SUBJECT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F43F5E', // Rose
  '#6366F1', // Indigo
];

function SubjectPieChart({ stats, label }: { stats: any[]; label: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!stats || stats.length === 0) return null;

  const total = stats.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
  if (total === 0) return null;

  let cumulativeValue = 0;
  const segments = stats.map((s, i) => {
    const value = s.totalMinutes || 0;
    const percent = (value / total) * 100;
    const startValue = cumulativeValue;
    cumulativeValue += value;
    
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = - (startValue / total) * 100 + 25;
    
    return {
      index: i,
      name: s.subjectName,
      percent,
      color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between w-full">
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-1 w-full lg:w-48 order-2 lg:order-1">
        {segments.map((s) => (
          <div 
            key={s.name} 
            className={`flex items-center gap-3 group cursor-pointer transition-all duration-200 ${hoveredIndex !== null && hoveredIndex !== s.index ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
            onMouseEnter={() => setHoveredIndex(s.index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div 
              className="h-3.5 w-3.5 rounded-full shadow-sm transition-transform group-hover:scale-125" 
              style={{ backgroundColor: s.color }} 
            />
            <div className="flex flex-col min-w-0">
              <span className={`text-[12px] font-black tracking-tight truncate leading-none mb-1 transition-colors ${hoveredIndex === s.index ? 'text-clay-accent' : 'text-clay-foreground'}`}>{s.name}</span>
              <span className="text-[10px] font-extrabold text-clay-muted">%{Math.round(s.percent)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SVG Pie Chart */}
      <div className="relative h-56 w-56 sm:h-64 sm:w-64 shrink-0 order-1 lg:order-2 flex items-center justify-center">
        <div className="absolute inset-2 rounded-full bg-clay-canvas shadow-clay-pressed" />

        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90 relative top-0 left-0 transform transition-transform duration-500 hover:rotate-0">
          {segments.map((s) => (
            <circle
              key={s.name}
              cx="21"
              cy="21"
              r="15.9155"
              fill="transparent"
              stroke={s.color}
              strokeWidth={hoveredIndex === s.index ? "5" : "4.5"}
              strokeDasharray={s.strokeDasharray}
              strokeDashoffset={s.strokeDashoffset}
              className="transition-all duration-500 ease-out cursor-pointer"
              style={{ 
                filter: hoveredIndex === s.index ? `drop-shadow(0 0 6px ${s.color}66)` : 'none',
                opacity: hoveredIndex !== null && hoveredIndex !== s.index ? 0.3 : 1,
                transform: hoveredIndex === s.index ? 'scale(1.04)' : 'scale(1)',
                transformOrigin: 'center'
              }}
              onMouseEnter={() => setHoveredIndex(s.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        <div className="absolute inset-16 sm:inset-20 rounded-full bg-white shadow-clay-card flex flex-col items-center justify-center text-center p-4 z-10 select-none backdrop-blur-sm bg-white/90">
          <span className="text-[10px] font-black text-clay-muted uppercase tracking-widest leading-none mb-1">
            {hoveredIndex !== null ? segments[hoveredIndex].name : label}
          </span>
          <span className="text-xl font-black text-clay-foreground leading-none">
            {hoveredIndex !== null 
              ? `${Math.floor((stats[hoveredIndex].totalMinutes || 0) / 60)}s ${stats[hoveredIndex].totalMinutes % 60}d`
              : `${Math.floor(total / 60)}s ${total % 60}d`
            }
          </span>
        </div>
      </div>
    </div>
  );
}

type AnalyticsTab = 'overview' | 'questions' | 'study';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'allTime'>('week');
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('overview');

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout className="flex min-h-[80vh] items-center justify-center text-clay-accent">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-current border-t-transparent" />
      </Layout>
    );
  }

  const currentStats = stats?.[timeRange] || {};
  const maxTotal = stats?.dailyStats?.length 
    ? Math.max(...stats.dailyStats.map((d: any) => d.total || 0), 10) 
    : 10;
  const maxStudyMinutes = stats?.dailyStats?.length
    ? Math.max(...stats.dailyStats.map((d: any) => d.topicStudyMinutes || 0), 10)
    : 10;

  const analyticsTabs = [
    { id: 'overview' as AnalyticsTab, label: '📊 Genel Bakış' },
    { id: 'questions' as AnalyticsTab, label: '✏️ Soru Analizi' },
    { id: 'study' as AnalyticsTab, label: '📖 Konu Çalışması' },
  ];

  return (
    <Layout className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-clay-foreground sm:text-5xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Analitik
            </h1>
            <p className="mt-2 text-lg font-medium text-clay-muted">Performansını derinlemesine incele.</p>
          </div>
          
          <div className="flex p-1 bg-clay-canvas rounded-2xl shadow-clay-pressed w-fit border border-clay-canvas">
            <button 
              onClick={() => setTimeRange('week')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all duration-200 ${timeRange === 'week' ? 'bg-white text-clay-accent shadow-clay-card' : 'text-clay-muted hover:text-clay-foreground'}`}
            >
              Haftalık
            </button>
            <button 
              onClick={() => setTimeRange('allTime')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all duration-200 ${timeRange === 'allTime' ? 'bg-white text-clay-accent shadow-clay-card' : 'text-clay-muted hover:text-clay-foreground'}`}
            >
              Tüm Zamanlar
            </button>
          </div>
        </header>

        {/* Analytics Tab Switcher */}
        <div className="flex p-1.5 bg-clay-canvas rounded-[24px] shadow-clay-pressed border border-white/50">
          {analyticsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAnalyticsTab(tab.id)}
              className={`flex-1 px-4 py-3 rounded-[18px] text-sm font-black transition-all duration-300 ${
                analyticsTab === tab.id
                  ? 'bg-white text-clay-accent shadow-clay-card scale-[1.02]'
                  : 'text-clay-muted hover:text-clay-foreground'
              }`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════ OVERVIEW TAB ═══════ */}
        {analyticsTab === 'overview' && (
          <>
            {/* Top Orbs */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb value={currentStats.total || 0} label={timeRange === 'week' ? "Haftalık Soru" : "Toplam Soru"} gradient="from-[#34D399] to-[#059669]" size="md" />
              </Card>
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb value={`${currentStats.total > 0 ? Math.round((currentStats.correct / currentStats.total) * 100) : 0}%`} label="Başarı Oranı" gradient="from-[#60A5FA] to-[#2563EB]" size="md" />
              </Card>
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb
                  value={`${Math.floor((currentStats.topicStudyMinutes || 0) / 60)}s ${(currentStats.topicStudyMinutes || 0) % 60}d`}
                  label="Konu Çalışması"
                  gradient="from-[#F59E0B] to-[#D97706]"
                  size="md"
                />
              </Card>
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb
                  value={`${Math.floor((currentStats.studyMinutes || 0) / 60)}s ${(currentStats.studyMinutes || 0) % 60}d`}
                  label="Pomodoro Odak"
                  gradient="from-[#A78BFA] to-[#7C3AED]"
                  size="md"
                />
              </Card>
            </div>

            {/* Combined Weekly Chart */}
            <Card className="flex flex-col gap-6">
              <h2 className="text-2xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Haftalık Gelişim</h2>
              
              <div className="relative h-72 w-full rounded-3xl bg-clay-canvas p-6 pt-12 flex items-end gap-2 shadow-clay-pressed overflow-x-auto">
                {stats?.dailyStats?.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-clay-muted font-medium italic">Geçen hafta hiç veri girilmedi.</div>
                ) : (
                  stats?.dailyStats?.map((day: any) => {
                    const heightPercentage = Math.max((day.total / maxTotal) * 100, 0);
                    const studyHeightPercentage = Math.max((day.topicStudyMinutes / maxStudyMinutes) * 100, 0);
                    const correctRatio = day.total > 0 ? (day.correct / day.total) * 100 : 0;
                    const hasData = day.total > 0 || day.topicStudyMinutes > 0;
                    
                    return (
                      <div key={day.date} className="group relative flex flex-shrink-0 flex-col items-center justify-end h-full min-w-[50px] sm:min-w-[70px] flex-1">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 hidden flex-col items-center rounded-xl bg-slate-900 px-3 py-1.5 text-[10px] font-black text-white opacity-0 transition-opacity group-hover:flex group-hover:opacity-100 whitespace-nowrap shadow-2xl">
                          <span>{day.correct}D / {day.wrong}Y • {day.topicStudyMinutes}dk çalışma</span>
                          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900"></div>
                        </div>
                        
                        <div className="flex items-end gap-1 h-full w-full justify-center">
                          {/* Question bar */}
                          {day.total > 0 && (
                            <div 
                              className="w-[35%] max-w-[18px] rounded-t-lg bg-clay-warning overflow-hidden flex flex-col justify-end transition-all duration-300 shadow-sm"
                              style={{ height: `${Math.max(heightPercentage, 5)}%`, minHeight: '6px' }}
                            >
                              <div className="w-full bg-clay-success transition-all duration-500" style={{ height: `${correctRatio}%` }} />
                            </div>
                          )}
                          {/* Study bar */}
                          {day.topicStudyMinutes > 0 && (
                            <div 
                              className="w-[35%] max-w-[18px] rounded-t-lg bg-gradient-to-t from-amber-400 to-amber-300 transition-all duration-300 shadow-sm"
                              style={{ height: `${Math.max(studyHeightPercentage, 5)}%`, minHeight: '6px' }}
                            />
                          )}
                          {!hasData && (
                            <div className="w-[35%] max-w-[18px] rounded-t-lg bg-slate-200" style={{ height: '4px' }} />
                          )}
                        </div>
                        
                        <span className="mt-4 text-[11px] font-black text-clay-muted sm:text-xs uppercase tracking-wider">
                          {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="flex items-center justify-center gap-8 text-xs font-black text-clay-muted uppercase tracking-widest bg-clay-canvas/50 py-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-clay-success shadow-[0_2px_4px_rgba(34,197,94,0.4)]"></div>
                  <span>Doğru</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-clay-warning shadow-[0_2px_4px_rgba(251,191,36,0.4)]"></div>
                  <span>Yanlış</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-amber-400 shadow-[0_2px_4px_rgba(251,191,36,0.4)]"></div>
                  <span>Konu Çalışma</span>
                </div>
              </div>
            </Card>

            {/* Streak & Exam */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="flex flex-col items-center justify-center text-center p-6">
                <span className="text-4xl mb-2">🔥</span>
                <span className="text-3xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>{stats?.streak || 0}</span>
                <span className="text-xs font-black text-clay-muted uppercase tracking-widest mt-1">Gün Serisi</span>
              </Card>
              <Card className="flex flex-col items-center justify-center text-center p-6">
                <span className="text-4xl mb-2">⏱️</span>
                <span className="text-3xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>{stats?.examStats?.avgTimePerQuestion || 0}s</span>
                <span className="text-xs font-black text-clay-muted uppercase tracking-widest mt-1">Ort. Soru Süresi</span>
              </Card>
              <Card className="flex flex-col items-center justify-center text-center p-6">
                <span className="text-4xl mb-2">🍅</span>
                <span className="text-3xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>{currentStats.pomodoroCount || 0}</span>
                <span className="text-xs font-black text-clay-muted uppercase tracking-widest mt-1">Pomodoro</span>
              </Card>
              <Card className="flex flex-col items-center justify-center text-center p-6">
                <span className="text-4xl mb-2">📖</span>
                <span className="text-3xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>{currentStats.topicStudyCount || 0}</span>
                <span className="text-xs font-black text-clay-muted uppercase tracking-widest mt-1">Çalışma Oturumu</span>
              </Card>
            </div>
          </>
        )}

        {/* ═══════ QUESTIONS TAB ═══════ */}
        {analyticsTab === 'questions' && (
          <>
            {/* Question Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb value={currentStats.total || 0} label="Toplam Soru" gradient="from-[#34D399] to-[#059669]" size="md" />
              </Card>
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb value={currentStats.correct || 0} label="Doğru" gradient="from-[#60A5FA] to-[#2563EB]" size="md" />
              </Card>
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb value={`${currentStats.total > 0 ? Math.round((currentStats.correct / currentStats.total) * 100) : 0}%`} label="Başarı Oranı" gradient="from-[#A78BFA] to-[#7C3AED]" size="md" />
              </Card>
            </div>

            {/* Weekly Questions Chart */}
            <Card className="flex flex-col gap-6">
              <h2 className="text-2xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Haftalık Soru Grafiği</h2>
              <div className="relative h-72 w-full rounded-3xl bg-clay-canvas p-6 pt-12 flex items-end gap-2 shadow-clay-pressed overflow-x-auto">
                {stats?.dailyStats?.every((d: any) => d.total === 0) ? (
                  <div className="absolute inset-0 flex items-center justify-center text-clay-muted font-medium italic">Geçen hafta hiç soru çözülmedi.</div>
                ) : (
                  stats?.dailyStats?.map((day: any) => {
                    const heightPercentage = Math.max((day.total / maxTotal) * 100, 5);
                    const correctRatio = day.total > 0 ? (day.correct / day.total) * 100 : 0;
                    return (
                      <div key={day.date} className="group relative flex flex-shrink-0 flex-col items-center justify-end h-full min-w-[50px] sm:min-w-[70px] flex-1">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 hidden flex-col items-center rounded-xl bg-slate-900 px-3 py-1.5 text-[10px] font-black text-white opacity-0 transition-opacity group-hover:flex group-hover:opacity-100 whitespace-nowrap shadow-2xl">
                          <span>{day.correct} Doğru / {day.wrong} Yanlış</span>
                          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900"></div>
                        </div>
                        <div 
                          className="w-full max-w-[40px] rounded-t-xl bg-clay-warning overflow-hidden flex flex-col justify-end transition-all duration-300 hover:scale-x-110 shadow-sm"
                          style={{ height: day.total > 0 ? `${heightPercentage}%` : '4px', minHeight: '4px' }}
                        >
                          <div className="w-full bg-clay-success transition-all duration-500" style={{ height: `${correctRatio}%` }} />
                        </div>
                        <span className="mt-4 text-[11px] font-black text-clay-muted sm:text-xs uppercase tracking-wider">
                          {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center justify-center gap-8 text-xs font-black text-clay-muted uppercase tracking-widest bg-clay-canvas/50 py-3 rounded-2xl">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-clay-success"></div><span>Doğru</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-clay-warning"></div><span>Yanlış</span></div>
              </div>
            </Card>

            {/* Subject Breakdown */}
            <Card className="flex flex-col gap-8">
              <h2 className="text-2xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Ders Bazlı Başarı</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stats?.subjectStats?.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-clay-muted font-medium italic bg-clay-canvas/30 rounded-3xl border-2 border-dashed border-slate-200">Henüz ders bazlı veri girilmedi.</div>
                ) : (
                  stats?.subjectStats?.map((subject: any) => (
                    <div key={subject.subjectId} className="group relative overflow-hidden rounded-[24px] bg-clay-canvas p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-clay-card hover:bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-black text-clay-foreground truncate max-w-[150px]">{subject.subjectName}</span>
                        <span className={`text-lg font-black ${subject.accuracy > 75 ? 'text-clay-success' : subject.accuracy > 50 ? 'text-clay-accent' : 'text-clay-warning'}`}>%{subject.accuracy}</span>
                      </div>
                      <div className="space-y-4">
                        <div className="h-2.5 w-full bg-white rounded-full overflow-hidden shadow-clay-pressed">
                          <div className={`h-full transition-all duration-1000 ${subject.accuracy > 75 ? 'bg-clay-success' : subject.accuracy > 50 ? 'bg-clay-accent' : 'bg-clay-warning'}`} style={{ width: `${subject.accuracy}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-clay-muted">
                          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-clay-success"></span><span>{subject.correct} Doğru</span></div>
                          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-clay-warning"></span><span>{subject.wrong} Yanlış</span></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </>
        )}

        {/* ═══════ STUDY TAB ═══════ */}
        {analyticsTab === 'study' && (
          <>
            {/* Study Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb
                  value={`${Math.floor((currentStats.topicStudyMinutes || 0) / 60)}s ${(currentStats.topicStudyMinutes || 0) % 60}d`}
                  label="Konu Çalışma Süresi"
                  gradient="from-[#F59E0B] to-[#D97706]"
                  size="md"
                />
              </Card>
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb value={currentStats.topicStudyCount || 0} label="Çalışma Oturumu" gradient="from-[#34D399] to-[#059669]" size="md" />
              </Card>
              <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white to-slate-50">
                <StatOrb
                  value={`${Math.floor((currentStats.studyMinutes || 0) / 60)}s ${(currentStats.studyMinutes || 0) % 60}d`}
                  label="Pomodoro Odak"
                  gradient="from-[#A78BFA] to-[#7C3AED]"
                  size="md"
                />
              </Card>
            </div>

            {/* Weekly Study Chart */}
            <Card className="flex flex-col gap-6">
              <h2 className="text-2xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Haftalık Konu Çalışma Süresi</h2>
              <div className="relative h-72 w-full rounded-3xl bg-clay-canvas p-6 pt-12 flex items-end gap-2 shadow-clay-pressed overflow-x-auto">
                {stats?.dailyStats?.every((d: any) => (d.topicStudyMinutes || 0) === 0) ? (
                  <div className="absolute inset-0 flex items-center justify-center text-clay-muted font-medium italic">Geçen hafta hiç konu çalışması kaydedilmedi.</div>
                ) : (
                  stats?.dailyStats?.map((day: any) => {
                    const heightPercentage = Math.max(((day.topicStudyMinutes || 0) / maxStudyMinutes) * 100, 0);
                    return (
                      <div key={day.date} className="group relative flex flex-shrink-0 flex-col items-center justify-end h-full min-w-[50px] sm:min-w-[70px] flex-1">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 hidden flex-col items-center rounded-xl bg-slate-900 px-3 py-1.5 text-[10px] font-black text-white opacity-0 transition-opacity group-hover:flex group-hover:opacity-100 whitespace-nowrap shadow-2xl">
                          <span>{day.topicStudyMinutes || 0} dakika çalışma</span>
                          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900"></div>
                        </div>
                        <div 
                          className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-amber-500 to-amber-300 overflow-hidden transition-all duration-300 hover:scale-x-110 shadow-sm"
                          style={{ height: (day.topicStudyMinutes || 0) > 0 ? `${Math.max(heightPercentage, 5)}%` : '4px', minHeight: '4px' }}
                        />
                        <span className="mt-4 text-[11px] font-black text-clay-muted sm:text-xs uppercase tracking-wider">
                          {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex items-center justify-center gap-8 text-xs font-black text-clay-muted uppercase tracking-widest bg-clay-canvas/50 py-3 rounded-2xl">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-amber-400"></div><span>Konu Çalışma Süresi</span></div>
              </div>
            </Card>

            {/* Study Session Subject Breakdown */}
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="flex flex-col gap-8 bg-gradient-to-br from-[#FFFBEB] to-white border-none">
                <h2 className="text-2xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Konu Dağılımı (Çalışma)</h2>
                <div className="flex flex-1 items-center justify-center p-4">
                  <SubjectPieChart stats={stats?.studyStats} label="Toplam" />
                </div>
              </Card>

              <Card className="flex flex-col gap-6">
                <h2 className="text-2xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Konu Detayları</h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {stats?.studyStats?.length === 0 ? (
                    <div className="py-12 text-center text-clay-muted font-medium italic bg-clay-canvas/30 rounded-3xl border-2 border-dashed border-slate-200">
                      Henüz konu çalışma verisi kaydedilmedi.
                    </div>
                  ) : (
                    stats?.studyStats?.map((stat: any, i: number) => {
                      const totalMinutes = stat.totalMinutes || 0;
                      const allTotalMinutes = stats?.studyStats?.reduce((a: number, s: any) => a + (s.totalMinutes || 0), 0) || 1;
                      const percentage = Math.round((totalMinutes / allTotalMinutes) * 100);

                      return (
                        <div key={stat.subjectId} className="flex items-center gap-4 bg-clay-canvas/50 p-4 rounded-2xl transition-all hover:bg-white hover:shadow-clay-card">
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-clay-foreground truncate">{stat.subjectName}</span>
                              <span className="text-xs font-black text-clay-accent">{Math.floor(totalMinutes / 60)}s {totalMinutes % 60}d</span>
                            </div>
                            <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                              <div className="h-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />
                            </div>
                          </div>
                          <div className="text-[10px] font-black text-clay-muted w-8 text-right">%{percentage}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Pomodoro Breakdown */}
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="flex flex-col gap-8 bg-gradient-to-br from-[#F0F9FF] to-white border-none">
                <h2 className="text-2xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Konu Dağılımı (Pomodoro)</h2>
                <div className="flex flex-1 items-center justify-center p-4">
                  <SubjectPieChart stats={stats?.pomodoroStats} label="Toplam" />
                </div>
              </Card>

              <Card className="flex flex-col gap-6">
                <h2 className="text-2xl font-black text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Pomodoro Detayları</h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {stats?.pomodoroStats?.length === 0 ? (
                    <div className="py-12 text-center text-clay-muted font-medium italic bg-clay-canvas/30 rounded-3xl border-2 border-dashed border-slate-200">
                      Henüz odaklanma verisi kaydedilmedi.
                    </div>
                  ) : (
                    stats?.pomodoroStats?.map((stat: any, i: number) => {
                      const totalMinutes = stat.totalMinutes || 0;
                      const percentage = stats.allTime.studyMinutes > 0 
                        ? Math.round((totalMinutes / stats.allTime.studyMinutes) * 100) 
                        : 0;

                      return (
                        <div key={stat.subjectId || 'none'} className="flex items-center gap-4 bg-clay-canvas/50 p-4 rounded-2xl transition-all hover:bg-white hover:shadow-clay-card">
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-clay-foreground truncate">{stat.subjectName}</span>
                              <span className="text-xs font-black text-clay-accent">{Math.floor(totalMinutes / 60)}s {totalMinutes % 60}d</span>
                            </div>
                            <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                              <div className="h-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }} />
                            </div>
                          </div>
                          <div className="text-[10px] font-black text-clay-muted w-8 text-right">%{percentage}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
