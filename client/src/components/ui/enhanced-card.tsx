import * as React from "react";
import { cn } from "@/lib/utils";

const EnhancedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hover?: boolean;
    gradient?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
  }
>(({ className, hover = true, gradient = false, padding = "md", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "card-enhanced animate-fade-in-up",
      hover && "hover:shadow-lg hover:-translate-y-1",
      gradient && "bg-gradient-to-br from-card to-muted/20",
      {
        "p-0": padding === "none",
        // sm = 16px, md = 20px, lg = 24px (Phase 2 unified spacing)
        "p-4": padding === "sm",
        "p-5": padding === "md",
        "p-6": padding === "lg",
      },
      className
    )}
    {...props}
  />
));
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { divider?: boolean }
>(({ className, divider = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 pb-4",
      divider && "relative after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px after:bg-[var(--semantic-border)] after:[box-shadow:inset_0_-1px_0_0_var(--semantic-inset)]",
      className
    )}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-xl font-bold leading-tight tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-4", className)} {...props} />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between pt-4 border-t border-border/50", className)}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardFooter, 
  EnhancedCardTitle, 
  EnhancedCardDescription, 
  EnhancedCardContent 
};