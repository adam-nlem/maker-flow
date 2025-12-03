import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { useAutoResizeTextarea } from '~/hooks/useAutoResizeTextarea';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  placeholder?: string;
  error?: string;
  fullWidth?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, fullWidth = false, className = '', ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    
    // Use the auto-resize hook
    useAutoResizeTextarea(internalRef, (props.value as string) || '', 60);
    
    // Sync the internal ref with the forwarded ref
    useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);
    
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
        <textarea
          ref={internalRef}
          placeholder={props.placeholder}
          className={`block rounded-xl border border-light-gray bg-clear px-3 py-1.5 text-body-sm text-black
              placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none 
              focus:ring-1 focus:ring-primary 
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${fullWidth ? 'w-full' : ''}
              ${className}
              `}
              {...props}
        />
        {error && (
          <p className="mt-1 text-body-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
