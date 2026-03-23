import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  hover = true,
  glass = true,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-[32px] p-5 sm:p-6
        ${glass ? 'bg-white/70 backdrop-blur-xl' : 'bg-white'}
        text-clay-foreground shadow-clay-card
        transition-all duration-500
        ${hover ? 'hover:-translate-y-2 hover:shadow-[20px_20px_40px_rgba(148,163,184,0.25),-12px_-12px_28px_rgba(255,255,255,0.95),inset_6px_6px_12px_rgba(37,99,235,0.04),inset_-6px_-6px_12px_rgba(255,255,255,1)]' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="flex h-full flex-col">
        {children}
      </div>
    </div>
  );
}
