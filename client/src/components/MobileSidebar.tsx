import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Ana Sayfa', path: '/', icon: '🏠' },
    { name: 'Pomodoro', path: '/pomodoro', icon: '🍅' },
    { name: 'Soru Gir', path: '/tracking', icon: '✏️' },
    { name: 'Sınav', path: '/exam', icon: '📝' },
    { name: 'Analizler', path: '/analytics', icon: '📊' },
    { name: 'Sıralama', path: '/leaderboard', icon: '🏆' },
  ];

  if (!user) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[70] w-72 transform bg-clay-canvas p-6 transition-transform duration-500 ease-out border-r border-white/50 shadow-2xl sm:w-80 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          borderRadius: '0 40px 40px 0',
          boxShadow: '20px 0 50px rgba(0,0,0,0.05), inset -10px 0 20px rgba(255,255,255,0.8)' 
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-between px-2">
            <Link to="/" onClick={onClose} className="text-2xl font-black text-clay-accent lowercase" style={{ fontFamily: 'Nunito, sans-serif' }}>
              study<span className="text-clay-secondary">b</span>
            </Link>
            <button 
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-clay-button text-clay-muted"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* User Profile Info */}
          <div className="mb-8 flex items-center gap-4 rounded-3xl bg-white p-4 shadow-clay-card border border-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-accent/10 text-xl">
              👤
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-clay-foreground">{user.name}</span>
              <span className="text-xs font-semibold text-clay-muted">{user.streak} Gün Seri 🔥</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-clay-accent text-white shadow-clay-button translate-x-1'
                      : 'bg-white/40 text-clay-muted hover:bg-white/60 hover:translate-x-1 border border-white/50'
                  }`}
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="mt-6 flex w-full items-center gap-4 rounded-2xl bg-white p-4 font-bold text-clay-warning shadow-clay-card transition-all hover:bg-red-50 active:scale-[0.98]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
