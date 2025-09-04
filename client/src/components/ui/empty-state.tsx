import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IdeaIllustration,
  EmptyInboxIllustration,
  WaveUploadIllustration,
  ResearchDiscoveryIllustration,
  ScriptEmptyIllustration,
  DocIllustration,
  ResearchIllustration,
  AudioIllustration
} from '@/components/ui/empty-illustrations';

interface EmptyStateProps {
  icon?: ReactNode;
  illustration?: ReactNode;
  illustrationSize?: 'sm' | 'md' | 'lg';
  monochromeIllustration?: boolean;
  subtleGradient?: boolean; // allow disabling gradient overlay if not desired
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  dense?: boolean;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'critical' | 'info';
  align?: 'center' | 'start';
  preset?: 'idea' | 'inbox' | 'upload' | 'research' | 'script' | 'doc' | 'audio';
}

export function EmptyState({
  icon,
  illustration,
  illustrationSize = 'md',
  monochromeIllustration = true,
  subtleGradient = true,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  dense,
  variant = 'neutral',
  align = 'center',
  preset
}: EmptyStateProps) {
    let illustrationFromPreset: ReactNode | undefined;
    if (!illustration && preset) {
      const map: Record<string, ReactNode> = {
        idea: <IdeaIllustration />,
        inbox: <EmptyInboxIllustration />,
        upload: <WaveUploadIllustration />,
        research: <ResearchDiscoveryIllustration />,
        script: <ScriptEmptyIllustration />,
        doc: <DocIllustration />,
        audio: <AudioIllustration />
      };
      illustrationFromPreset = map[preset];
    }
    const variantMap: Record<string, string> = {
      neutral: 'bg-[var(--semantic-surface-alt)]/40 surface-elev-1',
      accent: 'surface-accent-soft',
      success: 'surface-success',
      warning: 'surface-warning',
      critical: 'surface-critical',
      info: 'surface-info'
    };
  return (
    <div className={cn(
        'relative overflow-hidden flex flex-col items-center justify-center text-center rounded-lg border border-[var(--semantic-border)]',
        'p-6 md:p-8 animate-fade-in-up',
      dense && 'py-8 md:py-6',
      variantMap[variant],
      align === 'start' && 'items-start text-left',
      className
    )}>
      {subtleGradient && <div className="pointer-events-none absolute inset-0 opacity-60 bg-accent-fade mix-blend-normal" aria-hidden />}
    {(illustration || illustrationFromPreset) && (
        <div
          className={cn(
            'mb-4 flex items-center justify-center',
            illustrationSize === 'sm' && 'w-20 h-20',
            illustrationSize === 'md' && 'w-28 h-28',
            illustrationSize === 'lg' && 'w-36 h-36',
            monochromeIllustration && '[&_*]:text-[var(--semantic-text-muted)] [&_*]:stroke-[var(--semantic-text-muted)] [&_*]:fill-none'
          )}
        >
      {illustration || illustrationFromPreset}
        </div>
      )}
      {!illustration && icon && <div className="mb-4 text-[var(--semantic-text-muted)]">{icon}</div>}
      <h3 className="text-base font-semibold tracking-tight mb-2 text-[var(--semantic-text-primary)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--semantic-text-muted)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction} data-testid="empty-primary-action">
              {actionIcon}
              {actionIcon && <span className="mr-1" />}
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction} data-testid="empty-secondary-action">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
