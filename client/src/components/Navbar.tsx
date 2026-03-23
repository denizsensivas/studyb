import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MobileSidebar from './MobileSidebar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Pomodoro', path: '/pomodoro' },
    { name: 'Soru Gir', path: '/tracking' },
    { name: 'Sınav', path: '/exam' },
    { name: 'Analizler', path: '/analytics' },
    { name: 'Sıralama', path: '/leaderboard' },
  ];

  if (!user) return null;

  return (
    <>
    <nav className="sticky top-0 z-50 w-full px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-[32px] bg-white/70 px-6 tracking-wide shadow-clay-card backdrop-blur-xl sm:h-20 sm:rounded-[40px] sm:px-8">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu (Mobile Only) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-clay-button transition-all hover:-translate-y-0.5 active:scale-95 lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-clay-accent"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          
          <Link to="/" className="text-xl font-black text-clay-accent sm:text-2xl lowercase" style={{ fontFamily: 'Nunito, sans-serif' }}>
            study<span className="text-clay-secondary">b</span>
          </Link>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden flex-1 items-center justify-center gap-2 xl:gap-4 lg:flex overflow-hidden">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`whitespace-nowrap rounded-2xl px-3 xl:px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-clay-accent/10 text-clay-accent'
                    : 'text-clay-muted hover:bg-clay-accent/5 hover:text-clay-foreground'
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden flex-col text-right sm:flex">
            <span className="text-sm font-bold text-clay-foreground">{user.name}</span>
            <span className="text-xs font-semibold text-clay-muted">{user.streak} Gün Seri 🔥</span>
          </div>
          <button
            onClick={logout}
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-clay-button transition-all duration-200 hover:-translate-y-1 active:scale-[0.92] active:shadow-clay-pressed"
            title="Çıkış Yap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-clay-warning">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
    <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
