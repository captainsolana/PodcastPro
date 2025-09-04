import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Phase 2 Badge / Chip system
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full h-[22px] px-3 text-[11px] font-medium border gap-1 select-none transition-[background,color,border] duration-[var(--motion-duration-sm)] ease-[var(--motion-ease-standard)]",
  {
    variants: {
      variant: {
  solid: "bg-[var(--brand-accent)] text-[var(--brand-accent-fg)] border-[var(--brand-accent)]",
  soft: "bg-[var(--accent-soft-bg)] text-[var(--brand-accent)] border-[var(--accent-subtle-border)]",
  outline: "bg-transparent text-[var(--brand-accent)] border-[var(--accent-subtle-border)]",
        success: "bg-[var(--success-surface)] text-[var(--semantic-success)] border-[color-mix(in_srgb,var(--semantic-success)_55%,transparent)]",
        warning: "bg-[var(--warning-surface)] text-[var(--semantic-warning)] border-[color-mix(in_srgb,var(--semantic-warning)_55%,transparent)]",
        critical: "bg-[var(--critical-surface)] text-[var(--semantic-critical)] border-[color-mix(in_srgb,var(--semantic-critical)_55%,transparent)]",
        info: "bg-[var(--info-surface)] text-[var(--semantic-info)] border-[color-mix(in_srgb,var(--semantic-info)_55%,transparent)]",
      },
      density: {
        default: "px-3",
        compact: "px-2 h-[20px] text-[10px]",
      },
      interactive: {
        true: "cursor-pointer hover:brightness-110 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--semantic-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--semantic-bg)]",
        false: "",
      }
    },
    defaultVariants: {
      variant: "soft",
      density: "default",
      interactive: false
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, density, interactive, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant, density, interactive }), className)} {...props} />
));
Badge.displayName = 'Badge';

export { badgeVariants };
