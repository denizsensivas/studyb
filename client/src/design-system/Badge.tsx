import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'accent';
  className?: string;
}

const variantStyles = {
  default: 'bg-clay-accent/10 text-clay-accent',
  success: 'bg-clay-success/10 text-clay-success',
  warning: 'bg-clay-warning/10 text-[#B45309]',
  accent: 'bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full
        px-4 py-1.5 text-xs font-bold tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      {children}
    </span>
  );
}
