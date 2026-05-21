import React, { forwardRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelRight?: React.ReactNode;
  error?: string;
  width?: string;
  simple?: boolean;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  autoComplete?: string;
  textStyle?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    labelRight,
    error,
    width = 'w-full',
    simple = false,
    className = '',
    icon,
    trailingIcon,
    autoComplete = 'off',
    textStyle = 'text-xs',
    type,
    ...props },
    ref) => {

    // Password fields get a built-in show/hide eye toggle. A caller-supplied
    // `trailingIcon` wins so existing custom slots still work.
    const [isPasswordRevealed, setIsPasswordRevealed] = useState(false);
    const isPasswordInput = type === 'password';
    const effectiveType = isPasswordInput && isPasswordRevealed ? 'text' : type;
    const effectiveTrailingIcon = trailingIcon ?? (isPasswordInput ? (
      <button
        type="button"
        onClick={() => setIsPasswordRevealed((v) => !v)}
        className="text-muted-2 hover:text-dark transition-colors cursor-pointer"
        tabIndex={-1}
      >
        {isPasswordRevealed ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    ) : null);

    const hasIcon = Boolean(icon);
    const hasTrailingIcon = Boolean(effectiveTrailingIcon);
    let spacingClasses = '';
    if (simple) {
      spacingClasses = `${hasIcon ? 'pl-5' : 'p-0'} ${hasTrailingIcon ? 'pr-5' : ''}`;
    } else {
      const left = hasIcon ? 'pl-10' : 'pl-3.5';
      const right = hasTrailingIcon ? 'pr-10' : 'pr-3.5';
      spacingClasses = `py-1 ${left} ${right}`;
    }

    const inputElement = <input ref={ref} type={effectiveType} autoComplete={autoComplete} className={`
      block bg-clear placeholder-muted-2 text-dark ${textStyle}
      ${!simple ? `rounded-lg border border-pale-gray-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${spacingClasses}` : `border-0 shadow-none outline-none focus:outline-none focus:ring-0 ${spacingClasses}`}
      ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}
      w-full
      ${className}
    `} {...props} />;

    return (
      <div className={`${width}`}>
        {(label || labelRight) && (
          <div className="flex items-center justify-between mb-1.5">
            {label ? (
              <label htmlFor={props.id} className="block text-heading-sm text-dark">
                {label}
              </label>
            ) : <span />}
            {labelRight}
          </div>
        )}
        {(icon || effectiveTrailingIcon) ? (
          <div className="relative">
            {icon && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                {icon}
              </div>
            )}
            {inputElement}
            {effectiveTrailingIcon && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {effectiveTrailingIcon}
              </div>
            )}
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
