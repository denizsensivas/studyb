import { useState, useEffect } from 'react';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import { leaderboardAPI } from '../services/api';

const LEVEL_LABELS: Record<string, string> = {
  PRIMARY_SCHOOL: 'İlkokul / Ortaokul',
  HIGH_SCHOOL: 'Lise',
  UNIVERSITY: 'Üniversite',
};

export default function LeaderboardPage() {
  const [filter, setFilter] = useState<'GLOBAL' | 'PRIMARY_SCHOOL' | 'HIGH_SCHOOL' | 'UNIVERSITY'>('GLOBAL');
  const [sortBy, setSortBy] = useState<'questions' | 'streak' | 'studyTime'>('questions');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchAPI = filter === 'GLOBAL' 
      ? leaderboardAPI.getGlobal(sortBy) 
      : leaderboardAPI.getByLevel(filter, sortBy);

    fetchAPI
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, sortBy]);

  const formatStudyTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}s ${m}d`;
    return `${m}d`;
  };

  return (
    <Layout className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8 text-center mt-12">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-clay-foreground sm:text-5xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
            🏆 Sıralama
          </h1>
          <p className="mt-2 text-lg font-medium text-clay-muted">Diğer öğrencilerle yarış, zirveye çık.</p>
        </header>

        <div className="flex flex-col gap-6 items-center">
          {/* Level Filters */}
          <div className="flex flex-wrap justify-center gap-3 rounded-full bg-clay-canvas p-2 shadow-clay-pressed w-fit">
              {[
                { id: 'GLOBAL', label: 'Genel' },
                { id: 'PRIMARY_SCHOOL', label: 'İlkokul / Ortaokul' },
                { id: 'HIGH_SCHOOL', label: 'Lise' },
                { id: 'UNIVERSITY', label: 'Üniversite' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 ${
                    filter === tab.id
                      ? 'bg-white text-clay-accent shadow-clay-card'
                      : 'text-clay-muted hover:text-clay-foreground'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  {tab.label}
                </button>
              ))}
          </div>

          {/* Sort Selection */}
          <div className="flex flex-wrap justify-center gap-2 px-4 py-2 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            <span className="text-xs font-black text-clay-muted uppercase tracking-widest mr-2 self-center">Sırala:</span>
            {[
              { id: 'questions', label: 'Soru Sayısı' },
              { id: 'streak', label: 'Günlük Seri' },
              { id: 'studyTime', label: 'Çalışma Süresi' },
            ].map((sort) => (
              <button
                key={sort.id}
                onClick={() => setSortBy(sort.id as any)}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                  sortBy === sort.id 
                    ? 'bg-clay-accent text-white shadow-clay-button transform scale-105' 
                    : 'text-clay-muted hover:bg-white hover:text-clay-foreground shadow-sm bg-white/50'
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>

        <Card hover={false} className="overflow-x-auto p-0 relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="h-12 w-12 animate-spin rounded-full border-4 border-clay-accent border-t-transparent" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-[#E8EFF6]">
                  <th className="px-3 py-4 sm:px-6 sm:py-5 font-black text-clay-muted text-xs sm:text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>Sıra</th>
                  <th className="px-3 py-4 sm:px-6 sm:py-5 font-black text-clay-muted text-xs sm:text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>Öğrenci</th>
                  <th className="hidden px-6 py-5 font-black text-clay-muted sm:table-cell" style={{ fontFamily: 'Nunito, sans-serif' }}>Seviye</th>
                  <th className="px-3 py-4 sm:px-6 sm:py-5 font-black text-clay-muted text-right text-xs sm:text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>Soru</th>
                  <th className="px-3 py-4 sm:px-6 sm:py-5 font-black text-clay-muted text-right text-xs sm:text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>Süre</th>
                  <th className="px-3 py-4 sm:px-6 sm:py-5 font-black text-clay-muted text-right text-xs sm:text-base" style={{ fontFamily: 'Nunito, sans-serif' }}>Seri</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full font-black ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600 shadow-sm' :
                        index === 1 ? 'bg-slate-200 text-slate-500 shadow-sm' :
                        index === 2 ? 'bg-orange-100 text-orange-700 shadow-sm' :
                        'text-clay-muted'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-3 py-4 sm:px-6 sm:py-5">
                      <span className="font-bold text-clay-foreground text-sm sm:text-base truncate max-w-[100px] inline-block">{user.name}</span>
                    </td>
                    <td className="hidden px-6 py-5 sm:table-cell">
                      <span className="rounded-full bg-clay-canvas px-3 py-1 text-xs font-bold text-clay-muted">
                        {LEVEL_LABELS[user.educationLevel]}
                      </span>
                    </td>
                    <td className="px-3 py-4 sm:px-6 sm:py-5 text-right">
                      <span className={`font-extrabold text-sm sm:text-base ${sortBy === 'questions' ? 'text-clay-accent' : 'text-clay-muted/70'}`} style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {user.totalQuestions.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-4 sm:px-6 sm:py-5 text-right">
                      <span className={`font-extrabold text-sm sm:text-base ${sortBy === 'studyTime' ? 'text-clay-accent' : 'text-clay-muted/70'}`} style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {formatStudyTime(user.totalStudyMinutes || 0)}
                      </span>
                    </td>
                    <td className="px-3 py-4 sm:px-6 sm:py-5 text-right">
                      <div className={`inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 ${sortBy === 'streak' ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-200 shadow-sm' : 'bg-orange-50/50 text-orange-400 opacity-70'}`}>
                        <span className="text-xs sm:text-sm">🔥</span>
                        <span className="font-black text-xs sm:text-sm pt-[1px]">{user.streak}</span>
                      </div>
                    </td>
                  </tr>
                ))}

                
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center font-bold text-clay-muted">
                      Henüz kimse dereceye girmedi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </Layout>
  );
}
