import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  width?: string;
  simple?: boolean;
  icon?: React.ReactNode;
  autoComplete?: string;
  textStyle?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    width = 'w-full',
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
      spacingClasses = hasIcon ? 'pl-5' : 'p-0';
    } else {
      spacingClasses = `py-1.5 ${hasIcon ? 'pl-10 pr-3' : 'px-3'}`;
    }

    const inputElement = <input ref={ref} autoComplete={autoComplete} className={`
      block bg-transparent placeholder-gray ${textStyle}
      ${!simple ? `rounded-xl border border-light-gray shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${spacingClasses}` : `border-0 shadow-none outline-none focus:outline-none focus:ring-0 ${spacingClasses}`}
      ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}
      w-full
      ${className}
    `} {...props} />;

    return (
      <div className={`${width}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-heading-sm"
          >
            {label}
          </label>
        )}
        {icon ? (
          <div className={`relative`}>
            <div className="absolute inset-y-0  flex items-center">
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
