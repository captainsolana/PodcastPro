import { useEffect, useRef } from 'react';

// Generic roving tab index keyboard navigation for Radix TabsTrigger groups.
// Applies arrow left/right (and up/down), Home, End. Assumes triggers are buttons with role=tab.
export function useRovingTabs(deps: any[] = []) {
  const containerRef = useRef<HTMLElement | null>(null);
  const triggersRef = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const buttons = Array.from(el.querySelectorAll< HTMLButtonElement >('[role="tab"]'));
    triggersRef.current = buttons;

    function handleKeyDown(e: KeyboardEvent) {
      if (!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(e.key)) return;
      const focusable = triggersRef.current;
      const active = document.activeElement as HTMLElement | null;
      const idx = focusable.findIndex(b => b === active);
      if (idx === -1) return;
      e.preventDefault();
      if (e.key === 'Home') {
        focusable[0]?.focus();
        focusable[0]?.click();
        return;
      }
      if (e.key === 'End') {
        const last = focusable[focusable.length - 1];
        last?.focus();
        last?.click();
        return;
      }
      const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
      let next = (idx + dir + focusable.length) % focusable.length;
      focusable[next]?.focus();
      focusable[next]?.click();
    }

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef };
}
