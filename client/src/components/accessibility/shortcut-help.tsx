import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

export const ShortcutHelp: React.FC = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('pp:open-shortcuts', handler as any);
    return () => window.removeEventListener('pp:open-shortcuts', handler as any);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(()=> panelRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="shortcut-help-title" className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={(e)=>{ if(e.key==='Escape') setOpen(false); }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setOpen(false)} />
      <div ref={panelRef} tabIndex={-1} className="relative max-w-md w-full rounded-lg border border-[var(--semantic-border)] bg-[var(--semantic-surface)] shadow-lg p-6 space-y-4" >
        <div className="flex items-center justify-between">
          <h2 id="shortcut-help-title" className="text-sm font-semibold tracking-wide">Keyboard Shortcuts</h2>
          <button aria-label="Close" className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--semantic-surface-alt)] focus:outline-none focus-visible:focus-ring" onClick={()=>setOpen(false)}><X className="w-4 h-4"/></button>
        </div>
        <p className="text-xs text-[var(--semantic-text-secondary)]">Improve navigation speed. These are optional enhancements and all functions remain accessible via standard controls.</p>
        <ul className="text-xs space-y-2">
          <li><kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)] text-[var(--semantic-text-secondary)]">Alt</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]">→</kbd> Next Episode</li>
          <li><kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]">Alt</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]">←</kbd> Previous Episode</li>
          <li><kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]">Alt</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]">R</kbd> Regenerate Script</li>
          <li><kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]">Alt</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]">S</kbd> Save Progress</li>
          <li><kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]">Alt</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]">/</kbd> Open This Panel</li>
        </ul>
        <div className="text-[10px] text-[var(--semantic-text-muted)] leading-relaxed">All shortcuts follow system conventions and are announced when actions trigger results (e.g., generation start/complete).</div>
      </div>
    </div>
  );
};
