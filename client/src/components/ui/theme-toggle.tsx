import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/icon-registry";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('pp-theme') || 'dark'; // values: light | dark | hc
  });

  useEffect(() => {
    const root = document.documentElement;
  root.classList.remove('dark');
  root.classList.remove('hc');
  if (theme === 'dark') root.classList.add('dark');
  if (theme === 'hc') root.classList.add('hc');
    localStorage.setItem('pp-theme', theme);
  }, [theme]);

  return (
    <Button
      variant="outline"
      size="sm"
  aria-label="Toggle theme"
  onClick={() => setTheme(t => t === 'light' ? 'dark' : t === 'dark' ? 'hc' : 'light')}
      className="relative w-10 h-9 px-0 flex items-center justify-center"
    >
  <AppIcon name="sun" className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 hc:opacity-0" />
  <AppIcon name="moon" className="w-4 h-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 hc:opacity-0" />
  <AppIcon name="contrast" className="w-4 h-4 absolute opacity-0 transition-all hc:opacity-100 hc:scale-100 hc:rotate-0" />
  <span className="sr-only">Switch theme (current: {theme})</span>
    </Button>
  );
}
