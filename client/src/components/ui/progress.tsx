"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ExtendedProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  status?: 'default' | 'success' | 'warning' | 'critical' | 'info'
}

const statusColorMap: Record<string, string> = {
  default: 'bg-[var(--brand-accent)]',
  success: 'bg-[var(--semantic-success)]',
  warning: 'bg-[var(--semantic-warning)]',
  critical: 'bg-[var(--semantic-critical)]',
  info: 'bg-[var(--semantic-info)]'
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ExtendedProgressProps
>(({ className, value = 0, status = 'default', ...props }, ref) => {
  const numeric = typeof value === 'number' ? value : 0;
  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-status={status}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-[var(--accent-soft-bg)] border border-[var(--accent-subtle-border)]",
        'transition-colors duration-[var(--motion-duration-sm)] ease-[var(--motion-ease-standard)]',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full flex-1 origin-left will-change-transform',
          'transition-[transform,background-color] duration-[var(--motion-duration-md)] ease-[var(--motion-ease-emphasized)] motion-reduce:transition-none',
          statusColorMap[status] || statusColorMap.default,
          'relative after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0)_100%)] after:opacity-0 data-[animating=true]:after:opacity-60 after:transition-opacity after:duration-[var(--motion-duration-sm)]'
        )}
  style={{ transform: `scaleX(${Math.min(100, Math.max(0, numeric)) / 100})` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
