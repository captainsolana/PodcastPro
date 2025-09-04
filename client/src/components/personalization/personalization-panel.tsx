import React, { useState } from 'react';
import { usePreferences } from './preferences-context';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icons } from '@/components/ui/icon-registry';

// Phase 9: Lightweight inline personalization panel
export function PersonalizationPanel() {
  const { fontScale, density, focusMode, setFontScale, setDensity, toggleFocusMode, resetPreferences } = usePreferences();
  const [open, setOpen] = useState(false);

  const scaleOptions: { value: typeof fontScale; label: string }[] = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Default' },
    { value: 'lg', label: 'Large' }
  ];
  const densityOptions: { value: typeof density; label: string }[] = [
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'compact', label: 'Compact' }
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Interface preferences" title="Interface Preferences" className="w-8 h-8">
          <Icons.palette className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 space-y-4" side="bottom" align="end">
        <div>
          <h3 className="text-sm font-semibold mb-1">Text Size</h3>
          <div className="flex gap-2">
            {scaleOptions.map(opt => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={fontScale === opt.value ? 'default' : 'outline'}
                onClick={() => setFontScale(opt.value)}
                aria-pressed={fontScale === opt.value}
              >{opt.label}</Button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1">Density</h3>
          <div className="flex gap-2">
            {densityOptions.map(opt => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={density === opt.value ? 'default' : 'outline'}
                onClick={() => setDensity(opt.value)}
                aria-pressed={density === opt.value}
              >{opt.label}</Button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              id="focus-mode-toggle"
              type="checkbox"
              className="w-4 h-4"
              checked={focusMode}
              onChange={toggleFocusMode}
            />
            <label htmlFor="focus-mode-toggle" className="text-sm font-medium">Focus Mode</label>
          </div>
          <Button variant="ghost" size="sm" onClick={resetPreferences} className="text-xs">Reset</Button>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Preferences are saved locally and applied automatically across sessions.
        </p>
      </PopoverContent>
    </Popover>
  );
}
