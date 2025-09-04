import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "title" | "block" | "circle";
  lines?: number; // for text variant groups
  lineClassName?: string;
}

/* Enhanced Skeleton component providing structured loading placeholders.
 * Variants:
 *  - text (multi-line)
 *  - title (single heading sized)
 *  - block (generic rectangle)
 *  - circle (avatar/icon placeholder)
 * Accessibility: purely decorative (aria-hidden) so surrounding region should supply live status if needed.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "block",
  lines = 3,
  className,
  lineClassName,
  style,
  ...rest
}) => {
  if (variant === "text") {
    const arr = Array.from({ length: lines });
    return (
      <div className={cn("stack-xs", className)} aria-hidden="true">
        {arr.map((_, i) => (
          <div
            key={i}
            className={cn(
              "relative h-3 rounded-sm bg-[var(--semantic-surface-alt)]/80 dark:bg-[var(--semantic-surface-alt)]/40 overflow-hidden",
              lineClassName,
              i === lines - 1 && "w-2/3"
            )}
          >
            <span className="skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "title") {
    return (
      <div
        className={cn(
          "relative h-6 w-48 rounded-md bg-[var(--semantic-surface-alt)]/80 dark:bg-[var(--semantic-surface-alt)]/40 overflow-hidden",
          className
        )}
        aria-hidden="true"
        {...rest}
      >
        <span className="skeleton-shimmer" />
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div
        className={cn(
          "relative rounded-full bg-[var(--semantic-surface-alt)]/80 dark:bg-[var(--semantic-surface-alt)]/40 overflow-hidden",
          className
        )}
        style={style}
        aria-hidden="true"
        {...rest}
      >
        <span className="skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-4 w-full rounded bg-[var(--semantic-surface-alt)]/80 dark:bg-[var(--semantic-surface-alt)]/40 overflow-hidden",
        className
      )}
      aria-hidden="true"
      {...rest}
    >
      <span className="skeleton-shimmer" />
    </div>
  );
};

export default Skeleton;
