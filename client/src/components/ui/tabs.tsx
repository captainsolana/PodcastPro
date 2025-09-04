import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

/*
 * Unified Tabs styling (Batch 1 polish):
 *  - Uses design tokens (radius, spacing, accent)
 *  - Animated underline indicator (CSS only) via data-state
 *  - High contrast inactive -> active transition
 *  - Focus ring harmonized with global tokens
 */

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "relative inline-flex items-stretch gap-1 border-b border-[var(--semantic-border)] text-[var(--semantic-text-muted)]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
  "relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium transition-[color,background,transform] duration-[var(--motion-duration-sm)] ease-[var(--motion-ease-standard)] select-none outline-none border-b-2 border-transparent data-[state=active]:text-[var(--semantic-text-primary)] text-[var(--semantic-text-muted)] hover:text-[var(--semantic-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--semantic-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--semantic-bg)]",
      // Animated underline & weight ramp
  "data-[state=active]:font-semibold after:absolute after:left-1/2 after:bottom-0 after:h-0.5 after:w-full after:-translate-x-1/2 after:scale-x-0 after:rounded-full after:bg-[var(--brand-accent)] after:transition after:duration-[var(--motion-duration-sm)] after:ease-[var(--motion-ease-emphasized)] data-[state=active]:after:scale-x-100 data-[state=active]:after:shadow-[0_0_0_1px_var(--brand-accent)]",
      // Hover preview underline (reduced-motion safe)
  "hover:after:scale-x-40 hover:after:opacity-40 motion-reduce:hover:after:scale-x-0",
  // Soft background highlight for hover/active for improved target affordance
  "hover:bg-[var(--accent-soft-bg)] data-[state=active]:bg-[var(--accent-soft-bg)] rounded-md",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--semantic-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--semantic-bg)]",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
