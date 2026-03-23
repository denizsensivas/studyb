import { type ReactNode } from 'react';

interface StatOrbProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  gradient?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatOrb({
  value,
  label,
  icon,
  gradient = 'from-blue-300 to-blue-500',
  size = 'md',
}: StatOrbProps) {
  const sizeStyles = {
    sm: {
      container: 'h-16 w-16',
      text: 'text-sm',
      iconPos: '-top-1 -right-1 text-lg'
    },
    md: {
      container: 'h-20 w-20 sm:h-24 sm:w-24',
      text: 'text-xl sm:text-2xl',
      iconPos: '-top-2 -right-2 text-2xl'
    },
    lg: {
      container: 'h-28 w-28 sm:h-32 sm:w-32',
      text: 'text-2xl sm:text-4xl',
      iconPos: '-top-3 -right-3 text-3xl'
    }
  };

  const style = sizeStyles[size] || sizeStyles.md;

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div
        className={`
          relative ${style.container} rounded-full
          bg-gradient-to-br ${gradient}
          shadow-clay-button
          flex items-center justify-center
          animate-clay-breathe
          transition-all duration-300
          group-hover:scale-110
        `}
      >
        {icon && (
          <span className={`absolute ${style.iconPos} drop-shadow-md bg-white/70 backdrop-blur-md rounded-full px-2 py-1 z-10 animate-clay-float`}>{icon}</span>
        )}
        <span
          className={`px-2 ${style.text} font-black text-white drop-shadow-lg leading-none select-none text-center`}
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {value}
        </span>
      </div>
      <span
        className="text-sm font-bold text-clay-muted tracking-wide text-center"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        {label}
      </span>
    </div>
  );
}
