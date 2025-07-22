import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className = '', label, error, fullWidth = false, startIcon, endIcon, id, ...props },
    ref
  ) => {
    const inputId = id || Math.random().toString(36).substring(2, 11);
    const widthStyle = fullWidth ? 'w-full' : '';
    const hasError = !!error;

    return (
      <div className={`${widthStyle} ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{startIcon}</span>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`block w-full rounded-md border ${
              hasError
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
            } ${startIcon ? 'pl-10' : 'pl-3'} ${
              endIcon ? 'pr-10' : 'pr-3'
            } py-2 text-base focus:outline-none focus:ring-1`}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            {...props}
          />
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{endIcon}</span>
            </div>
          )}
        </div>
        {hasError && (
          <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
