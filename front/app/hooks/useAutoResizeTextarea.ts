import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Custom hook to automatically resize a textarea based on its content
 * 
 * @param textareaRef - React ref object pointing to the textarea element
 * @param value - The current value of the textarea (used to trigger resize on change)
 * @param minHeight - Minimum height in pixels (default: 60px)
 */
export function useAutoResizeTextarea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  minHeight: number = 60
): void {
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the content (with a minimum height)
      textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
    }
  }, [value, minHeight, textareaRef]);
}
    