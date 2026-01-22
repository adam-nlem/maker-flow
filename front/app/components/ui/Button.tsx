import React from 'react';

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
};

export function Button({
    children,
    type = 'button',
    style = 'secondary',
    isLoading = false,
    disabled = false,
    onClick,
    width = 'w-full',
    height = 'h-10',
    className = '',
}: ButtonProps) {

    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantStyles = {
        primary: 'inline-flex items-center gap-x-1.5 bg-primary px-3 py-2 text-clear shadow-xs hover:bg-primary-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
        secondary: 'bg-dark text-clear hover:bg-gray',
        danger: 'bg-danger text-clear hover:bg-danger-600',
        outline: 'border border-primary bg-transparent hover:bg-primary hover:text-clear text-primary',
    };


    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variantStyles[style]} ${width} ${height} ${className}  px-4 rounded-xl text-heading-sm cursor-pointer`}
        >
            {isLoading ? (
                <span className="mr-2">
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </span>
            ) : null}
            {children}
        </button>
    );
}
