import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  /** Debounce delay before attempting a save */
  delay?: number;
  /** Master enable flag */
  enabled?: boolean;
  /** Optional localStorage key for draft persistence (include project/episode identifiers) */
  storageKey?: string;
  /** Persist unsaved edits locally (default true) */
  persistDraft?: boolean;
  /** Show toast notifications (default true). Set false if using inline indicator to reduce noise */
  showToast?: boolean;
  /** Current server version / updatedAt timestamp for conflict detection */
  serverVersion?: string | number | Date;
  /** Called when a conflict is detected BEFORE saving (remote changed) */
  onConflict?: (ctx: { serverVersion: any; lastSavedVersion: any; localData: any }) => void;
  /** Called when a draft is recovered from local storage */
  onDraftRecovered?: (draft: any) => void;
}

type AutoSaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error' | 'conflict' | 'draft';

export function useAutoSave({
  data,
  onSave,
  delay = 2000,
  enabled = true,
  storageKey,
  persistDraft = true,
  showToast = true,
  serverVersion,
  onConflict,
  onDraftRecovered
}: UseAutoSaveOptions) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef(data);
  const lastSavedVersionRef = useRef<any>(serverVersion);
  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const recoveredDraftRef = useRef<any>(null);
  const [conflict, setConflict] = useState<null | { serverVersion: any; lastSavedVersion: any }>(null);

  // Flag dirty state when data changes vs last saved snapshot
  useEffect(() => {
    const current = JSON.stringify(data);
    const last = JSON.stringify(lastSavedRef.current);
    if (current !== last && status !== 'saving') {
      setStatus(prev => (prev === 'draft' ? prev : 'dirty'));
    }
  }, [data, status]);

  // Attempt to load existing draft from localStorage (once)
  useEffect(() => {
    if (!persistDraft || !storageKey || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const draft = JSON.parse(raw);
        const draftStr = JSON.stringify(draft);
        const currentStr = JSON.stringify(data);
        if (draftStr !== currentStr) {
          recoveredDraftRef.current = draft;
          setStatus('draft');
          setHasDraft(true);
          onDraftRecovered?.(draft);
        } else {
          // Remove identical draft
          localStorage.removeItem(storageKey);
        }
      }
    } catch (e) {
      console.warn('Draft recovery failed', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist draft on each change (fast debounce) separate from save cycle
  useEffect(() => {
    if (!persistDraft || !storageKey || typeof window === 'undefined') return;
    const draftTimeout = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        setHasDraft(true);
      } catch (e) {
        // Ignore quota errors silently
      }
    }, 400);
    return () => clearTimeout(draftTimeout);
  }, [data, persistDraft, storageKey]);

  const saveNow = useCallback(async (opts?: { force?: boolean }) => {
    if (!enabled || isSavingRef.current) return;

    const currentDataStr = JSON.stringify(data);
    const lastSavedStr = JSON.stringify(lastSavedRef.current);
    if (currentDataStr === lastSavedStr && !opts?.force) {
      return; // nothing changed
    }

    // Conflict detection: if serverVersion changed since last successful save
    if (!opts?.force && serverVersion && lastSavedVersionRef.current && serverVersion !== lastSavedVersionRef.current) {
      setStatus('conflict');
      setConflict({ serverVersion, lastSavedVersion: lastSavedVersionRef.current });
      onConflict?.({ serverVersion, lastSavedVersion: lastSavedVersionRef.current, localData: data });
      if (showToast) {
        toast({
          title: 'Unsaved changes conflict',
          description: 'Remote version changed. Review before overwriting.',
          variant: 'destructive'
        });
      }
      return;
    }

    try {
      isSavingRef.current = true;
      setIsSaving(true);
      setStatus('saving');
      setError(null);
      await onSave(data);
      lastSavedRef.current = data;
      lastSavedVersionRef.current = serverVersion ?? Date.now();
      setStatus('saved');
      if (persistDraft && storageKey && typeof window !== 'undefined') {
        try { localStorage.removeItem(storageKey); } catch {}
        setHasDraft(false);
      }
      if (showToast) {
        toast({
          title: 'Auto-saved',
          description: 'Changes saved',
          duration: 1600
        });
      }
    } catch (e: any) {
      console.error('Auto-save failed:', e);
      setError(e);
      setStatus(prev => (prev === 'conflict' ? prev : 'error'));
      if (showToast) {
        toast({
          title: 'Auto-save failed',
            description: 'Will retry when you make more edits',
          variant: 'destructive',
          duration: 3000
        });
      }
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [data, enabled, onSave, persistDraft, serverVersion, showToast, storageKey, toast, onConflict]);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => saveNow(), delay);
  }, [delay, saveNow]);

  useEffect(() => {
    if (!enabled) return; 
    debouncedSave();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [data, enabled, debouncedSave]);

  const restoreDraft = useCallback(() => {
    if (!hasDraft || !storageKey || typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const draft = JSON.parse(raw);
      setStatus('dirty');
      return draft;
    } catch {
      return null;
    }
  }, [hasDraft, storageKey]);

  const discardDraft = useCallback(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try { localStorage.removeItem(storageKey); } catch {}
    setHasDraft(false);
    if (status === 'draft') setStatus('idle');
  }, [storageKey, status]);

  const forceSave = useCallback(() => saveNow({ force: true }), [saveNow]);

  return {
    isSaving,
    lastSaved: lastSavedRef.current,
    status,
    error,
    hasDraft,
    restoreDraft,
    discardDraft,
    forceSave,
    conflict,
    recoveredDraft: recoveredDraftRef.current
  };
}
