import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold text-clay-foreground tracking-wide"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            block w-full border-0 rounded-2xl
            bg-[#E8EFF6] px-6 py-4 h-14
            text-clay-foreground text-lg font-bold
            shadow-clay-pressed
            placeholder:text-clay-muted
            focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:outline-none
            transition-all duration-200
            ${error ? 'ring-2 ring-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
