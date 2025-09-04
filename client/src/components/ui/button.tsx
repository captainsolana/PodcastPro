import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--semantic-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--semantic-bg)] active:translate-y-px transition-[background,box-shadow,color,transform] duration-[var(--motion-duration-sm)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none motion-reduce:active:translate-y-0 active:[transform:translateY(1px)_scale(.97)] data-pressed:[transform:translateY(1px)_scale(.97)]",
  {
    variants: {
      variant: {
    // Primary now uses subtle glossy gradient leveraging accent fade tokens
  default: "relative text-[var(--brand-accent-fg)] shadow-sm hover:shadow-md bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] before:absolute before:inset-0 before:rounded-inherit before:pointer-events-none before:[background:linear-gradient(180deg,rgba(255,255,255,0.15),rgba(255,255,255,0)_40%)] before:opacity-70 hover:before:opacity-90",
    soft: "bg-[var(--accent-soft-bg)] text-[var(--brand-accent)] border border-[var(--accent-subtle-border)] hover:bg-[var(--accent-surface)] hover:text-[var(--brand-accent-hover)]",
        destructive:
          "bg-[var(--semantic-critical)] text-white hover:bg-[color-mix(in_srgb,var(--semantic-critical)_90%,#000)] shadow-sm hover:shadow-md",
        outline:
          "border border-[var(--semantic-border)] bg-[var(--semantic-surface)] text-[var(--semantic-text-primary)] shadow-sm hover:bg-[var(--accent-soft-bg)] hover:border-[var(--accent-subtle-border)] hover:text-[var(--semantic-text-primary)]",
        secondary:
          "bg-[var(--semantic-surface-alt)] text-[var(--semantic-text-secondary)] hover:text-[var(--semantic-text-primary)] hover:bg-[var(--semantic-surface)] shadow-inner",
  ghost: "text-[var(--semantic-text-secondary)] hover:text-[var(--semantic-text-primary)] hover:bg-[var(--accent-soft-bg)]",
  link: "text-primary underline-offset-4 hover:underline hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        success: "bg-[var(--semantic-success)] text-white shadow-md hover:bg-[color-mix(in_srgb,var(--semantic-success)_85%,#000)] focus-visible:ring-[var(--semantic-success)] hover:shadow-lg",
        warning: "bg-[var(--semantic-warning)] text-white hover:bg-[color-mix(in_srgb,var(--semantic-warning)_90%,#000)]",
        info: "bg-[var(--semantic-info)] text-white hover:bg-[color-mix(in_srgb,var(--semantic-info)_90%,#000)]",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
  compact: "h-8 px-2.5 text-[13px]",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        xs: "h-7 px-2.5 text-[11px]",
      },
      radius: {
        default: "rounded-md", // fallback
        sm: "rounded-sm",
        md: "[border-radius:var(--radius-md)]",
        lg: "[border-radius:var(--radius-lg)]",
        pill: "[border-radius:var(--radius-full)]",
      },
      elevation: {
        none: "shadow-none",
        1: "shadow-sm",
        2: "shadow-sm hover:shadow-md",
        3: "shadow-md hover:shadow-lg",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "md",
      elevation: 2
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, elevation, asChild = false, onMouseDown, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const rippleRef = React.useRef<HTMLSpanElement | null>(null);

    function createRipple(e: React.MouseEvent<HTMLButtonElement>) {
      if (onMouseDown) (onMouseDown as (ev: React.MouseEvent<HTMLButtonElement>) => void)(e);
      if (e.defaultPrevented) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const span = rippleRef.current;
      const target = e.currentTarget as HTMLElement;
      if (!span) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.1;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      span.style.setProperty('--ripple-x', x + 'px');
      span.style.setProperty('--ripple-y', y + 'px');
      span.style.setProperty('--ripple-size', size + 'px');
      span.classList.remove('animate-ripple');
      void span.offsetWidth; // reflow
      span.classList.add('animate-ripple');
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, radius, elevation, className }), 'overflow-hidden relative')}
        ref={ref}
        onMouseDown={createRipple}
        {...props}
      >
        <span className="absolute pointer-events-none inset-0 overflow-hidden">
          <span
            ref={rippleRef}
            aria-hidden
            className="block absolute rounded-full bg-white/40 dark:bg-white/25 opacity-0 will-change-transform"
            style={{
              top: 'var(--ripple-y)',
              left: 'var(--ripple-x)',
              width: 'var(--ripple-size)',
              height: 'var(--ripple-size)'
            }}
          />
        </span>
        {props.children}
      </Comp>
    );
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
