import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary:
    'bg-gradient-to-br from-[#60A5FA] to-[#2563EB] text-white shadow-clay-button hover:shadow-clay-button-hover',
  secondary:
    'bg-white text-clay-foreground shadow-clay-button hover:shadow-clay-button-hover',
  outline:
    'border-2 border-clay-accent/20 bg-transparent text-clay-accent hover:border-clay-accent hover:bg-clay-accent/5',
  ghost:
    'text-clay-foreground hover:bg-clay-accent/10 hover:text-clay-accent',
};

const sizeStyles = {
  sm: 'h-11 px-5 text-sm',
  default: 'h-14 px-8 text-base',
  lg: 'h-16 px-10 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-[20px] font-bold tracking-wide
        transition-all duration-200
        hover:-translate-y-1
        active:scale-[0.92] active:shadow-clay-pressed
        focus-visible:ring-4 focus-visible:ring-clay-accent/30 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{ fontFamily: 'Nunito, sans-serif' }}
      {...props}
    >
      {children}
    </button>
  );
}
