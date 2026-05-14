import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { useAutoResizeTextarea } from '~/hooks/useAutoResizeTextarea';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  placeholder?: string;
  error?: string;
  width?: string;
  simple?: boolean;
  textStyle?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, width = 'w-full', simple = false, textStyle = 'text-sm', className = '', ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    
    // Use the auto-resize hook
    useAutoResizeTextarea(internalRef, (props.value as string) || '', 0);
    
    // Sync the internal ref with the forwarded ref
    useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);
    
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
        <textarea
          ref={internalRef}
          placeholder={props.placeholder}
          className={`
              block bg-transparent placeholder-gray ${textStyle} resize-none scrollbar-none
              ${!simple ? 'rounded-xl border border-light-gray px-3 py-1.5 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary' : 'border-0 shadow-none outline-none focus:outline-none focus:ring-0 p-0'}
              ${error ? 'border-danger focus:border-danger focus:ring-danger' : ''}
              ${width}
              ${className}
              `}
              {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger">{error}</p>
        )}
      </div>
    );
  }
);
