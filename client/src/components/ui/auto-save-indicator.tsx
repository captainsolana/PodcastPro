import React from 'react';
import { Button } from '@/components/ui/button';

export interface AutoSaveIndicatorProps {
  status: string;
  isSaving: boolean;
  onForceSave?: () => void;
  onDiscard?: () => void;
  onApplyDraft?: () => void;
  className?: string;
}

const baseCls = "text-xs flex items-center gap-1 rounded px-2 py-1 border transition-colors";

export function AutoSaveIndicator({ status, isSaving, onForceSave, onDiscard, onApplyDraft, className }: AutoSaveIndicatorProps) {
  const pill = () => {
    switch (status) {
      case 'saving':
        return <div className={`${baseCls} border-accent-subtle text-blue-600 dark:text-blue-400 bg-accent-surface`}>Saving…</div>;
      case 'saved':
        return <div className={`${baseCls} border-accent-subtle text-emerald-600 dark:text-emerald-400 bg-surface-success`}>Saved</div>;
      case 'error':
        return <div className={`${baseCls} border border-red-400 text-red-600 bg-surface-critical`}>Save failed</div>;
      case 'conflict':
        return <div className={`${baseCls} border border-amber-400 text-amber-700 bg-surface-warning`}>Conflict</div>;
      case 'draft':
        return <div className={`${baseCls} border-accent-subtle text-indigo-600 dark:text-indigo-400 bg-surface-info`}>Recovered Draft</div>;
      case 'dirty':
        return <div className={`${baseCls} border-accent-subtle text-muted-foreground bg-accent-surface`}>Unsaved</div>;
      default:
        return <div className={`${baseCls} border-transparent text-muted-foreground`}>{isSaving ? 'Saving…' : 'Idle'}</div>;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {pill()}
      {status === 'conflict' && (
        <div className="flex items-center gap-1">
          {onForceSave && <Button size="xs" variant="outline" onClick={onForceSave} className="h-6 px-2">Overwrite</Button>}
          {onDiscard && <Button size="xs" variant="ghost" onClick={onDiscard} className="h-6 px-2">Dismiss</Button>}
        </div>
      )}
      {status === 'draft' && (
        <div className="flex items-center gap-1">
          {onApplyDraft && <Button size="xs" variant="outline" onClick={onApplyDraft} className="h-6 px-2">Apply Draft</Button>}
          {onDiscard && <Button size="xs" variant="ghost" onClick={onDiscard} className="h-6 px-2">Discard</Button>}
        </div>
      )}
    </div>
  );
}

export default AutoSaveIndicator;
