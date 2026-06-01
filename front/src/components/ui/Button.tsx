import React, { useRef } from 'react';
import { useKeyboardShortcut, type KeyboardShortcut } from '~/hooks/useKeyboardShortcut';
import { ShortcutBadge } from './ShortcutBadge';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  style?: 'primary' | 'secondary' | 'danger' | 'outline';
  width?: string;
  height?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  shortcut?: KeyboardShortcut;
};

const variantStyles = {
  primary: 'bg-dark text-clear border-dark hover:bg-dark-2 hover:border-dark-2',
  secondary: 'bg-clear text-dark-2 border-pale-gray-2 hover:bg-clear-2',
  danger: 'bg-danger text-clear border-danger hover:bg-danger/90',
  outline: 'bg-transparent text-dark-2 border-pale-gray-2 hover:bg-clear-2',
};

export function Button({
  children,
  type = 'button',
  style = 'secondary',
  isLoading = false,
  disabled = false,
  onClick,
  width = 'w-full',
  height = 'h-[30px]',
  className = '',
  shortcut,
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useKeyboardShortcut(shortcut, () => {
    buttonRef.current?.click();
  });

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-2.5 border rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark/30 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[style]} ${width} ${height} ${className}`}
    >
      {isLoading ? (
        <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
      {shortcut && <ShortcutBadge simple textClassName='text-muted-2' label={shortcut.label} />}
    </button>
  );
}
