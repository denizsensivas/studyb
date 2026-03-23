import { useState, useEffect } from 'react';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import Input from '../design-system/Input';
import Button from '../design-system/Button';
import SubjectAutocomplete from '../components/SubjectAutocomplete';
import { dailyEntryAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function DailyTrackingPage() {
  const { user } = useAuth();
  const [subjectName, setSubjectName] = useState('');
  const [subjectId, setSubjectId] = useState<string | undefined>();
  const [correct, setCorrect] = useState('');
  const [wrong, setWrong] = useState('');
  const [lastSavedTotal, setLastSavedTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setSuccess(false);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName) {
      setError('Lütfen bir konu seçin veya yazın.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await dailyEntryAPI.create({
        subjectName: subjectId ? undefined : subjectName,
        subjectId: subjectId,
        correct: parseInt(correct) || 0,
        wrong: parseInt(wrong) || 0,
      });
      
      setLastSavedTotal((parseInt(correct) || 0) + (parseInt(wrong) || 0));
      setTodayTotal(res.data.todayTotal || 0);
      setSuccess(true);
      setSubjectName('');
      setSubjectId(undefined);
      setCorrect('');
      setWrong('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-clay-foreground sm:text-5xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Soru Takibi
          </h1>
          <p className="mt-2 text-lg font-medium text-clay-muted">Bugün hangi konulardan soru çözdün?</p>
        </header>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {success && (
              <div className="relative rounded-2xl bg-green-100 py-4 pl-4 pr-10 font-bold text-green-700 shadow-clay-pressed">
                <span>✅ Başarıyla kaydedildi! Yeni girdiğin {lastSavedTotal} soru eklendi. Bugün toplam {todayTotal} soru çözdün.</span>
                <button 
                  type="button" 
                  onClick={() => setSuccess(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700/60 hover:text-green-900 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}
            
             {error && (
              <div className="relative rounded-2xl bg-red-100 py-4 pl-4 pr-10 font-bold text-red-600 shadow-clay-pressed">
                <span>❌ {error}</span>
                <button 
                  type="button" 
                  onClick={() => setError('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600/60 hover:text-red-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            <SubjectAutocomplete
              value={subjectName}
              onChange={(name, id) => {
                setSubjectName(name);
                setSubjectId(id);
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Doğru Sayısı"
                type="number"
                min="0"
                required
                value={correct}
                onChange={(e) => setCorrect(e.target.value)}
                placeholder="Örn: 45"
              />
              <Input
                label="Yanlış Sayısı"
                type="number"
                min="0"
                required
                value={wrong}
                onChange={(e) => setWrong(e.target.value)}
                placeholder="Örn: 5"
              />
            </div>

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </form>
        </Card>

        <Card hover={false} className="bg-clay-canvas p-6 opacity-70">
          <h3 className="mb-2 text-lg font-bold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>Nasıl Çalışır?</h3>
          <ul className="list-inside list-disc space-y-2 text-sm text-clay-muted font-medium">
            <li>Daha önce çözdüğünüz konuları listeden hızlıca seçebilirsiniz.</li>
            <li>Listede olmayan yeni bir konu yazarsanız otomatik olarak oluşturulur.</li>
            <li>Her gün en az 1 soru girerek <span className="font-bold text-orange-500">ateş serinizi 🔥</span> koruyabilirsiniz. Mevcut seriniz: {user?.streak || 0} Gün.</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
}
