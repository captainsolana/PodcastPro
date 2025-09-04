import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon-registry";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  children: React.ReactNode;
  maxLines?: number;
  className?: string;
  showButton?: boolean;
}

export function ExpandableText({ 
  children, 
  maxLines = 3, 
  className, 
  showButton = true 
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "text-expandable transition-all duration-300",
          isExpanded ? "expanded" : "collapsed"
        )}
        style={{
          maxHeight: isExpanded ? 'none' : `${maxLines * 1.5}rem`,
        }}
      >
        {children}
        {!isExpanded && (
          <div className="fade-overlay" />
        )}
      </div>
      
      {showButton && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 h-auto p-1 text-xs text-muted-foreground hover:text-primary"
          data-testid={`button-${isExpanded ? 'collapse' : 'expand'}-text`}
        >
          {isExpanded ? (
            <>
              <AppIcon name="chevronUp" className="w-3 h-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <AppIcon name="chevronDown" className="w-3 h-3 mr-1" />
              Show more
            </>
          )}
        </Button>
      )}
    </div>
  );
}