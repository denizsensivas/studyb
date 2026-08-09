import { useState, useEffect } from 'react';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import Input from '../design-system/Input';
import Button from '../design-system/Button';
import SubjectAutocomplete from '../components/SubjectAutocomplete';
import { dailyEntryAPI, studySessionAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type TabType = 'questions' | 'study';

export default function DailyTrackingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('questions');

  // Question form state
  const [subjectName, setSubjectName] = useState('');
  const [subjectId, setSubjectId] = useState<string | undefined>();
  const [correct, setCorrect] = useState('');
  const [wrong, setWrong] = useState('');
  const [lastSavedTotal, setLastSavedTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);

  // Study session form state
  const [studySubjectName, setStudySubjectName] = useState('');
  const [studySubjectId, setStudySubjectId] = useState<string | undefined>();
  const [studyHours, setStudyHours] = useState('');
  const [studyMinutes, setStudyMinutes] = useState('');
  const [studyNotes, setStudyNotes] = useState('');
  const [todayStudyMinutes, setTodayStudyMinutes] = useState(0);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setSuccess(false);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleQuestionSubmit = async (e: React.FormEvent) => {
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
      setSuccessMessage(`✅ Başarıyla kaydedildi! Yeni girdiğin ${(parseInt(correct) || 0) + (parseInt(wrong) || 0)} soru eklendi. Bugün toplam ${res.data.todayTotal || 0} soru çözdün.`);
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

  const handleStudySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studySubjectName) {
      setError('Lütfen bir konu seçin veya yazın.');
      return;
    }

    const totalMinutes = (parseInt(studyHours) || 0) * 60 + (parseInt(studyMinutes) || 0);
    if (totalMinutes <= 0) {
      setError('Lütfen geçerli bir çalışma süresi girin.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await studySessionAPI.create({
        subjectName: studySubjectId ? undefined : studySubjectName,
        subjectId: studySubjectId,
        duration: totalMinutes,
        notes: studyNotes || undefined,
      });
      
      setTodayStudyMinutes(res.data.todayTotalMinutes || 0);
      const hrs = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      const timeStr = hrs > 0 ? `${hrs} saat ${mins} dakika` : `${mins} dakika`;
      setSuccessMessage(`✅ Başarıyla kaydedildi! ${timeStr} konu çalışması eklendi.`);
      setSuccess(true);
      setStudySubjectName('');
      setStudySubjectId(undefined);
      setStudyHours('');
      setStudyMinutes('');
      setStudyNotes('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'questions' as TabType, label: '✏️ Soru Gir', description: 'Bugün hangi konulardan soru çözdün?' },
    { id: 'study' as TabType, label: '📖 Konu Çalışması', description: 'Hangi konuyu ne kadar süre çalıştın?' },
  ];

  return (
    <Layout className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold tracking-tight text-clay-foreground sm:text-5xl" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Çalışma Takibi
          </h1>
          <p className="mt-2 text-lg font-medium text-clay-muted">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-clay-canvas rounded-[24px] shadow-clay-pressed border border-white/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSuccess(false);
                setError('');
              }}
              className={`flex-1 px-6 py-3.5 rounded-[18px] text-sm font-black transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-clay-accent shadow-clay-card scale-[1.02]'
                  : 'text-clay-muted hover:text-clay-foreground'
              }`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Card>
          {/* Success / Error Alerts */}
          {success && (
            <div className="relative rounded-2xl bg-green-100 py-4 pl-4 pr-10 font-bold text-green-700 shadow-clay-pressed mb-6">
              <span>{successMessage}</span>
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
            <div className="relative rounded-2xl bg-red-100 py-4 pl-4 pr-10 font-bold text-red-600 shadow-clay-pressed mb-6">
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

          {/* Question Entry Form */}
          {activeTab === 'questions' && (
            <form onSubmit={handleQuestionSubmit} className="space-y-8">
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
                {loading ? 'Kaydediliyor...' : '✏️ Soruları Kaydet'}
              </Button>
            </form>
          )}

          {/* Study Session Form */}
          {activeTab === 'study' && (
            <form onSubmit={handleStudySubmit} className="space-y-8">
              <SubjectAutocomplete
                value={studySubjectName}
                onChange={(name, id) => {
                  setStudySubjectName(name);
                  setStudySubjectId(id);
                }}
              />

              <div>
                <label className="text-sm font-bold tracking-wide text-clay-foreground mb-2 block" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Çalışma Süresi
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      label=""
                      type="number"
                      min="0"
                      max="24"
                      value={studyHours}
                      onChange={(e) => setStudyHours(e.target.value)}
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-clay-muted pointer-events-none">saat</span>
                  </div>
                  <div className="relative">
                    <Input
                      label=""
                      type="number"
                      min="0"
                      max="59"
                      value={studyMinutes}
                      onChange={(e) => setStudyMinutes(e.target.value)}
                      placeholder="0"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-clay-muted pointer-events-none">dakika</span>
                  </div>
                </div>
              </div>

              <Input
                label="Not (Opsiyonel)"
                type="text"
                value={studyNotes}
                onChange={(e) => setStudyNotes(e.target.value)}
                placeholder="Örn: Bölüm 3-4 arası çalışıldı"
              />

              <Button type="submit" fullWidth size="lg" disabled={loading}>
                {loading ? 'Kaydediliyor...' : '📖 Çalışmayı Kaydet'}
              </Button>
            </form>
          )}
        </Card>

        <Card hover={false} className="bg-clay-canvas p-6 opacity-70">
          <h3 className="mb-2 text-lg font-bold text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {activeTab === 'questions' ? 'Soru Takibi Nasıl Çalışır?' : 'Konu Çalışması Nasıl Çalışır?'}
          </h3>
          <ul className="list-inside list-disc space-y-2 text-sm text-clay-muted font-medium">
            {activeTab === 'questions' ? (
              <>
                <li>Daha önce çözdüğünüz konuları listeden hızlıca seçebilirsiniz.</li>
                <li>Listede olmayan yeni bir konu yazarsanız otomatik olarak oluşturulur.</li>
                <li>Her gün en az 1 soru girerek <span className="font-bold text-orange-500">ateş serinizi 🔥</span> koruyabilirsiniz. Mevcut seriniz: {user?.streak || 0} Gün.</li>
              </>
            ) : (
              <>
                <li>Soru çözmeden sadece konu çalıştığınız süreyi buraya girebilirsiniz.</li>
                <li>Saat ve dakika olarak çalışma sürenizi kolayca belirleyin.</li>
                <li>Opsiyonel olarak not ekleyerek hangi bölümleri çalıştığınızı kaydedin.</li>
                <li>Analizler sayfasında soru çözme ve konu çalışma verileriniz ayrı ayrı görüntülenir.</li>
              </>
            )}
          </ul>
        </Card>
      </div>
    </Layout>
  );
}
