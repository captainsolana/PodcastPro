import * as React from "react"

import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3 | 4
  radius?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  size?: 'md' | 'lg'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, elevation = 1, radius = 'lg', interactive = false, size='lg', ...props }, ref) => {
  const elevationMap: Record<number, string> = {
    0: 'shadow-none',
    1: 'shadow-sm',
    2: 'shadow-sm md:shadow-[var(--elevation-1)]',
    3: 'shadow-md md:shadow-[var(--elevation-2)]',
    4: 'shadow-lg md:shadow-[var(--elevation-3)]'
  }
  const radiusMap: Record<string, string> = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  }
  return (
    <div
      ref={ref}
      className={cn(
  'border bg-card text-card-foreground transition-colors transition-[box-shadow,transform,background,border-color] duration-[var(--motion-duration-sm)] ease-[var(--motion-ease-standard)]',
        elevationMap[elevation],
        radiusMap[radius],
  interactive && 'hover:shadow-lg hover:-translate-y-[2px] hover:border-[var(--semantic-border-strong)] active:translate-y-0 active:shadow-sm motion-reduce:hover:translate-y-0',
        '[&.surface-alt]:bg-[var(--semantic-surface-alt)] [&.surface-alt]:border-[var(--semantic-border-strong)]',
        size==='lg' ? 'p-6' : 'p-5',
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
  className={cn("flex flex-col space-y-1.5 mb-4 card-header-divider", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-2", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
