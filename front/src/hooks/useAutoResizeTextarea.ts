import { useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

/**
 * Custom hook to automatically resize a textarea based on its content.
 * Also observes width changes (e.g. when a side panel opens/closes)
 * so the height adapts when text reflows.
 */
export function useAutoResizeTextarea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  minHeight: number = 60
): void {
  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`;
    }
  }, [textareaRef, minHeight]);

  // Resize on value change
  useEffect(() => {
    resize();
  }, [value, resize]);

  // Resize on width change (e.g. side panel open/close)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(textarea);

    return () => observer.disconnect();
  }, [textareaRef, resize]);
}
    