import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/icon-registry";

interface PhaseProgressProps {
  phases: Array<{
    id: number;
    name: string;
    description: string;
    completed: boolean;
    current?: boolean;
  }>;
  className?: string;
}

export function PhaseProgress({ phases, className }: PhaseProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {phases.map((phase, index) => {
        const isLast = index === phases.length - 1;
        
        return (
          <div key={phase.id} className="relative">
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                phase.completed 
                  ? "bg-[var(--semantic-success)]/15 border-[var(--semantic-success)] text-[var(--semantic-success)]"
                  : phase.current
                  ? "bg-[var(--semantic-accent)]/15 border-[var(--semantic-accent)] text-[var(--semantic-accent)]"
                  : "bg-[var(--semantic-surface-alt)] border-[var(--semantic-border)] text-[var(--semantic-text-muted)]"
              )}>
                {phase.completed ? (
                  <AppIcon name="success" className="w-5 h-5" />
                ) : phase.current ? (
                  <AppIcon name="pending" className="w-5 h-5" />
                ) : (
                  <AppIcon name="circle" className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium",
                  phase.completed 
                    ? "text-[var(--semantic-success)]"
                    : phase.current
                    ? "text-[var(--semantic-accent)]" 
                    : "text-[var(--semantic-text-muted)]"
                )}>
                  {phase.name}
                </div>
                <div className="text-xs text-[var(--semantic-text-muted)] mt-1">
                  {phase.description}
                </div>
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className={cn(
                "absolute left-4 top-8 w-0.5 h-4 -translate-x-0.5",
                phase.completed ? "bg-[var(--semantic-success)]/60" : "bg-[var(--semantic-border)]"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
