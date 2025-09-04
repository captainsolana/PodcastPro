import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/icon-registry";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const PACKS = [
  { id: 'default', label: 'Default' },
  { id: 'spring', label: 'Spring' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'forest', label: 'Forest' }
];

export function ThemePackSelector() {
  const [pack, setPack] = useState<string>(() => {
    if (typeof window === 'undefined') return 'default';
    return localStorage.getItem('pp-theme-pack') || 'default';
  });

  useEffect(() => {
    const body = document.body;
    // Clear previous
    body.removeAttribute('data-theme-pack');
    if (pack !== 'default') body.setAttribute('data-theme-pack', pack);
    localStorage.setItem('pp-theme-pack', pack);
  }, [pack]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Select theme pack" className="w-10 h-9 px-0 flex items-center justify-center">
          <AppIcon name="palette" className="w-4 h-4" />
          <span className="sr-only">Theme pack (current: {pack})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuLabel className="text-xs tracking-wide">Theme Pack</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PACKS.map(p => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => setPack(p.id)}
            className={pack === p.id ? 'font-medium text-[var(--brand-accent)]' : ''}
          >
            {p.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemePackSelector;
