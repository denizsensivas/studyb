import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import Input from '../design-system/Input';
import Button from '../design-system/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    educationLevel: 'HIGH_SCHOOL',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black tracking-tight text-clay-accent sm:text-6xl clay-text-gradient lowercase" style={{ fontFamily: 'Nunito, sans-serif' }}>
            studyb
          </h1>
          <p className="mt-4 text-lg font-bold text-clay-muted tracking-wide">Aramıza katıl ve çalışmaya başla.</p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Kayıt Ol
            </h2>
            
            {error && (
              <div className="rounded-2xl bg-red-100 p-4 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Ad Soyad"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınız Soyadınız"
              />
              <Input
                label="E-posta"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
              />
              <Input
                label="Şifre"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="En az 6 karakter"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold tracking-wide text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Eğitim Seviyesi
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="block h-16 w-full rounded-2xl border-0 bg-[#E8EFF6] px-8 py-5 text-[1.1rem] font-bold text-clay-foreground shadow-clay-pressed transition-all duration-200 focus:bg-white focus:outline-none focus:ring-4 focus:ring-clay-accent/20"
                >
                  <option value="PRIMARY_SCHOOL">İlkokul / Ortaokul</option>
                  <option value="HIGH_SCHOOL">Lise</option>
                  <option value="UNIVERSITY">Üniversite</option>
                </select>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </Button>

            <p className="text-center text-sm font-bold text-clay-muted">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="text-clay-accent transition-colors hover:text-clay-secondary">
                Giriş Yap
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
