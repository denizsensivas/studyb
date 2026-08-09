import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../design-system/Layout';
import Card from '../design-system/Card';
import Input from '../design-system/Input';
import Button from '../design-system/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, testLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      await testLogin();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Test moduna giriş yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black tracking-tight text-clay-accent sm:text-6xl clay-text-gradient lowercase" style={{ fontFamily: 'Nunito, sans-serif' }}>
            studyb
          </h1>
          <p className="mt-4 text-lg font-bold text-clay-muted tracking-wide">Akıllı çalışma arkadaşın.</p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-clay-foreground" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Giriş Yap
            </h2>
            
            {error && (
              <div className="rounded-2xl bg-red-100 p-4 text-sm font-bold text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="E-posta"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
              />
              <Input
                label="Şifre"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>

            <Button
              type="button"
              variant="outline"
              fullWidth
              disabled={isLoading}
              onClick={handleTestLogin}
            >
              🚀 Test Modu ile Giriş Yap
            </Button>

            <p className="text-center text-sm font-bold text-clay-muted">
              Hesabın yok mu?{' '}
              <Link to="/register" className="text-clay-accent transition-colors hover:text-clay-secondary">
                Kayıt Ol
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
