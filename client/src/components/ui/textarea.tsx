import * as React from "react"

import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<'textarea'> {
  density?: 'regular' | 'compact';
  invalid?: boolean;
  success?: boolean;
}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, density = 'regular', invalid, success, ...props }, ref) => {
  const densityClasses = density === 'compact' ? 'text-sm px-2 py-1.5' : 'px-3 py-2';
  const stateRing = invalid ? 'focus-visible:ring-[var(--semantic-critical)] border-[var(--semantic-critical)]' : success ? 'focus-visible:ring-[var(--semantic-success)] border-[var(--semantic-success)]' : 'focus-visible:ring-[var(--semantic-focus-ring)]';
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border bg-background text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-[border,box-shadow,background] duration-[var(--motion-duration-sm)] ease-[var(--motion-ease-standard)]",
        densityClasses,
        stateRing,
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
