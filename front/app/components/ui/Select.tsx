import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, fullWidth = false, className = '', placeholder, options, ...props }, ref) => {
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
        <select
          ref={ref}
          className={`
            block rounded-xl border border-light-gray bg-clear px-3 py-1.5 text-body-sm text-black
            shadow-sm focus:border-primary focus:outline-none 
            placeholder-gray-400
            focus:ring-1 focus:ring-primary appearance-none
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled selected className="text-light-gray">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-body-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
