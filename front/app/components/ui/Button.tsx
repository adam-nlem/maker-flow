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
    height = 'h-9',
    className = '',
}: ButtonProps) {

    const variantStyles = {
        primary: 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/30',
        secondary: 'bg-dark/10 border-dark/30 text-dark hover:bg-dark/30',
        danger: 'bg-danger/10 border-danger/30 text-danger hover:bg-danger/30',
    };


    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 border focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[style]} ${width} ${height} ${className}  px-4 rounded-xl text-heading-sm cursor-pointer`}
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
