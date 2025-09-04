import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<'input'> {
  density?: 'regular' | 'compact';
  invalid?: boolean;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, density = 'regular', invalid, success, ...props }, ref) => {
    const densityClasses = density === 'compact' ? 'h-8 text-sm px-2' : 'h-10';
    const stateRing = invalid ? 'focus-visible:ring-[var(--semantic-critical)] border-[var(--semantic-critical)]' : success ? 'focus-visible:ring-[var(--semantic-success)] border-[var(--semantic-success)]' : 'focus-visible:ring-[var(--semantic-focus-ring)]';
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-[border,box-shadow,background] duration-[var(--motion-duration-sm)] ease-[var(--motion-ease-standard)]",
          densityClasses,
          stateRing,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
