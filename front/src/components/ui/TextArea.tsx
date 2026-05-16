import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { useAutoResizeTextarea } from '~/hooks/useAutoResizeTextarea';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  labelRight?: React.ReactNode;
  error?: string;
  width?: string;
  simple?: boolean;
  textStyle?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, labelRight, error, width = 'w-full', simple = false, textStyle = 'text-xs', className = '', ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);

    useAutoResizeTextarea(internalRef, (props.value as string) || '', 0);

    useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

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
        <textarea
          ref={internalRef}
          placeholder={props.placeholder}
          className={`
            block bg-clear placeholder-muted-2 text-dark ${textStyle} resize-none scrollbar-none
            ${!simple ? `rounded-lg border border-pale-gray-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 py-1 px-2` : 'border-0 shadow-none outline-none focus:outline-none focus:ring-0 p-0'}
            ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}
            w-full
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-body-sm text-danger">{error}</p>
        )}
      </div>
    );
  }
);
