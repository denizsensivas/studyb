import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import StatOrb from '../design-system/StatOrb';
import Button from '../design-system/Button';
import { useAuth } from '../hooks/useAuth';
import { analyticsAPI } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout className="flex min-h-[80vh] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-clay-accent border-t-transparent" />
      </Layout>
    );
  }

  return (
    <Layout className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-clay-foreground sm:text-5xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Merhaba, {user?.name.split(' ')[0]} 👋
            </h1>
            <p className="mt-2 text-lg font-medium text-clay-muted">Bugün harika şeyler başarmaya hazır mısın?</p>
          </div>
          <div className="hidden sm:block">
            {stats?.streak > 0 && (
              <div className="flex items-center gap-3 rounded-full bg-orange-50 px-6 py-3 shadow-clay-card border-2 border-orange-200">
                <span className="text-3xl">🔥</span>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-orange-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {stats.streak} Gün
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide text-orange-500">Seri Devam Ediyor</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Masonry */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col items-center justify-center text-center">
             <StatOrb
              value={stats?.today?.studyMinutes || 0}
              label="Dakika Odak"
              gradient="from-[#60A5FA] to-[#2563EB]"
              icon="⏱️"
            />
          </Card>
          <Card className="flex flex-col items-center justify-center text-center">
            <StatOrb
              value={stats?.today?.total || 0}
              label="Çözülen Soru"
              gradient="from-[#34D399] to-[#059669]"
              icon="✏️"
            />
          </Card>
          <Card className="flex flex-col items-center justify-center text-center">
            <StatOrb
              value={stats?.today?.correct || 0}
              label="Doğru Cevap"
              gradient="from-[#FBBF24] to-[#D97706]"
              icon="✅"
            />
          </Card>
          <Card className="flex flex-col items-center justify-center text-center">
            <StatOrb
              value={stats?.totalQuestions || 0}
              label="Toplam Soru"
              gradient="from-[#A78BFA] to-[#7C3AED]"
              icon="🏆"
            />
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-extrabold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Hızlı İşlemler
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="group">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-2xl text-white shadow-clay-button transition-transform duration-300 group-hover:scale-110">
                  🍅
                </div>
                <h3 className="mb-1 text-lg font-bold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Pomodoro Başlat
                </h3>
                <p className="mb-4 text-xs sm:text-sm font-medium text-clay-muted">Odaklanarak çalış, molalarını planla.</p>
                <Link to="/pomodoro">
                  <Button fullWidth variant="outline" className="h-10 text-sm">Zamanlayıcıya Git</Button>
                </Link>
              </Card>

              <Card className="group">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34D399] to-[#059669] text-2xl text-white shadow-clay-button transition-transform duration-300 group-hover:scale-110">
                  📝
                </div>
                <h3 className="mb-1 text-lg font-bold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Soru Takibi
                </h3>
                <p className="mb-4 text-xs sm:text-sm font-medium text-clay-muted">Bugün çözdüğün soruları kaydet.</p>
                <Link to="/tracking">
                  <Button fullWidth variant="outline" className="h-10 text-sm">Veri Gir</Button>
                </Link>
              </Card>
            </div>
          </div>

          <div className="space-y-4 self-start">
            <h2 className="text-2xl font-extrabold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Haftalık Özet
            </h2>
            <Card hover={false} className="flex flex-col">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-2xl bg-clay-canvas px-4 py-3 sm:px-5 sm:py-4 shadow-clay-pressed">
                  <span className="font-bold text-clay-muted">Çözülen Soru</span>
                  <span className="text-xl font-black text-clay-accent pr-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {stats?.week?.total || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-clay-canvas px-4 py-3 sm:px-5 sm:py-4 shadow-clay-pressed">
                  <span className="font-bold text-clay-muted">Doğru Oranı</span>
                  <span className="text-xl font-black text-clay-success pr-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {stats?.week?.total > 0 
                      ? Math.round((stats.week.correct / stats.week.total) * 100) 
                      : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-clay-canvas px-4 py-3 sm:px-5 sm:py-4 shadow-clay-pressed">
                  <span className="font-bold text-clay-muted">Pomodoro</span>
                  <span className="text-xl font-black text-clay-secondary pr-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {stats?.week?.pomodoroCount || 0}
                  </span>
                </div>
                <Link to="/analytics" className="mt-2">
                  <Button fullWidth variant="ghost" className="text-clay-accent h-10 text-sm">Tüm Analizleri Gör →</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
