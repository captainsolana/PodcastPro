import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ 
  data, 
  onSave, 
  delay = 2000, 
  enabled = true 
}: UseAutoSaveOptions) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef(data);
  const isSavingRef = useRef(false);

  const debouncedSave = useCallback(async () => {
    if (!enabled || isSavingRef.current) return;

    const currentData = JSON.stringify(data);
    const lastSaved = JSON.stringify(lastSavedRef.current);

    if (currentData === lastSaved) return;

    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedRef.current = data;
      
      toast({
        title: "Auto-saved",
        description: "Your changes have been saved automatically",
        duration: 2000,
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast({
        title: "Auto-save failed",
        description: "Failed to save changes automatically",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, enabled, toast]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(debouncedSave, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debouncedSave, delay]);

  return {
    isSaving: isSavingRef.current,
    lastSaved: lastSavedRef.current
  };
}
