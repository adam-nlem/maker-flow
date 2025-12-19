import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  simple?: boolean;
  icon?: React.ReactNode;
  autoComplete?: string;
  textStyle?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    fullWidth = false,
    simple = false,
    className = '',
    icon,
    autoComplete = 'off',
    textStyle = 'text-sm',
    ...props },
    ref) => {

    const hasIcon = Boolean(icon);
    let spacingClasses = '';
    if (simple) {
      spacingClasses = hasIcon ? 'pl-8' : 'p-0';
    } else {
      spacingClasses = `py-1.5 ${hasIcon ? 'pl-10 pr-3' : 'px-3'}`;
    }

    const inputElement = <input ref={ref} autoComplete={autoComplete} className={`
      block bg-transparent placeholder-gray-400 ${textStyle}
      ${!simple ? `rounded-xl border border-light-gray shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${spacingClasses}` : `border-0 shadow-none outline-none focus:outline-none focus:ring-0 ${spacingClasses}`}
      ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `} {...props} />;

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
            <div className="absolute inset-y-0 left-3 flex items-center">
                {icon}
            </div>
            {inputElement}
          </div>
        ) : (
          inputElement
        )}
        {error && (
          <p className="mt-1 text-body-sm text-danger">{error}</p>
        )}
      </div>
    );
  }
);
