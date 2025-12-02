import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;

}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', icon, ...props }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-heading-sm"
          >
            {label}
          </label>
        )}
        {icon ? (
          <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
            <div className="absolute inset-y-0 left-0 flex items-center">
              <div className="flex items-center px-3 text-gray-500">
                {icon}
              </div>
            </div>
            <input
              ref={ref}
              className={`
              block rounded-xl border border-light-gray bg-clear px-3 py-1.5 text-body-sm text-black
              placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none 
              focus:ring-1 focus:ring-primary 
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `}
              {...props}
            />
          </div>
        ) : (
          <input
            ref={ref}
            className={`
              block rounded-xl border border-light-gray bg-clear px-3 py-1.5 text-body-sm text-black
              placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none 
              focus:ring-1 focus:ring-primary 
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `}
            {...props}
          />
        )}
        {error && (
          <p className="mt-1 text-body-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
