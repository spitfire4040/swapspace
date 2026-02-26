import React, { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const inputId = externalId ?? generatedId;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border px-4 py-3 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-pink transition-colors
            ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}
            ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
