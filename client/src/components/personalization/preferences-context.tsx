import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

// Phase 9: Theming & Personalization (font scale, density, focus mode)
export type FontScale = 'sm' | 'md' | 'lg';
export type Density = 'comfortable' | 'compact';

interface PreferencesState {
  fontScale: FontScale;
  density: Density;
  focusMode: boolean;
  setFontScale: (s: FontScale) => void;
  setDensity: (d: Density) => void;
  toggleFocusMode: () => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesState | undefined>(undefined);

const LS_KEY = 'pp-preferences-v1';

interface StoredPrefs { fontScale: FontScale; density: Density; focusMode: boolean; }

const defaultPrefs: StoredPrefs = { fontScale: 'md', density: 'comfortable', focusMode: false };

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<StoredPrefs>(() => {
    if (typeof window === 'undefined') return defaultPrefs;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultPrefs;
      const parsed = JSON.parse(raw);
      return { ...defaultPrefs, ...parsed };
    } catch { return defaultPrefs; }
  });

  // Apply classes / CSS vars side-effect
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('focus-mode', prefs.focusMode);
    root.dataset.fontScale = prefs.fontScale; // data-font-scale
    root.dataset.density = prefs.density; // data-density
  }, [prefs]);

  const persist = (next: StoredPrefs) => {
    setPrefs(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  };

  const setFontScale = useCallback((fontScale: FontScale) => persist({ ...prefs, fontScale }), [prefs]);
  const setDensity = useCallback((density: Density) => persist({ ...prefs, density }), [prefs]);
  const toggleFocusMode = useCallback(() => persist({ ...prefs, focusMode: !prefs.focusMode }), [prefs]);
  const resetPreferences = useCallback(() => persist(defaultPrefs), []);

  // Alt+F focus mode shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        toggleFocusMode();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleFocusMode]);

  return (
    <PreferencesContext.Provider value={{ ...prefs, setFontScale, setDensity, toggleFocusMode, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
