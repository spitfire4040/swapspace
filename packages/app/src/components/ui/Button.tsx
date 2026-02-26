import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl font-semibold transition-[background-color,transform] duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 px-5 py-3 text-sm min-h-[44px] active:scale-[0.98]';
  const variants: Record<string, string> = {
    primary: 'bg-brand-pink text-white hover:bg-pink-600 focus:ring-pink-500',
    secondary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    ghost: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
