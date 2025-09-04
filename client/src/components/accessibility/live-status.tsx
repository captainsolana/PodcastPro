import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

interface LiveStatusContextValue {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
}

const LiveStatusContext = createContext<LiveStatusContextValue | null>(null);

/**
 * LiveStatusProvider centralizes aria-live announcements so multiple components
 * can send messages without creating numerous live regions (which can be noisy).
 */
export const LiveStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const politeRef = useRef<HTMLDivElement | null>(null);
  const assertiveRef = useRef<HTMLDivElement | null>(null);
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (politeness === 'assertive') {
      setAssertiveMessage("");
      // Force reflow to ensure screen readers pick successive identical messages
      requestAnimationFrame(() => setAssertiveMessage(message));
    } else {
      setPoliteMessage("");
      requestAnimationFrame(() => setPoliteMessage(message));
    }
  }, []);

  return (
    <LiveStatusContext.Provider value={{ announce }}>
      {children}
      {/* Live regions (visually hidden) */}
      <div className="sr-only" aria-live="polite" ref={politeRef}>{politeMessage}</div>
      <div className="sr-only" aria-live="assertive" ref={assertiveRef}>{assertiveMessage}</div>
    </LiveStatusContext.Provider>
  );
};

export const useLiveStatus = () => {
  const ctx = useContext(LiveStatusContext);
  if (!ctx) throw new Error('useLiveStatus must be used within LiveStatusProvider');
  return ctx;
};
