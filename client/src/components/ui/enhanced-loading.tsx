import { cn } from "@/lib/utils";
import { Loader2, Sparkles, Brain, Zap } from "lucide-react";

interface EnhancedLoadingProps {
  variant?: "default" | "ai" | "processing" | "research";
  size?: "sm" | "md" | "lg";
  text?: string;
  subtext?: string;
  className?: string;
  showDots?: boolean;
}

export function EnhancedLoading({ 
  variant = "default", 
  size = "md", 
  text, 
  subtext,
  className,
  showDots = true
}: EnhancedLoadingProps) {
  const getIcon = () => {
    switch (variant) {
      case "ai":
        return <Brain className="animate-pulse" />;
      case "processing":
        return <Zap className="animate-pulse" />;
      case "research":
        return <Sparkles className="animate-spin" />;
      default:
        return <Loader2 className="animate-spin" />;
    }
  };

  const getSize = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-8 h-8";
      default:
        return "w-6 h-6";
    }
  };

  const getGradient = () => {
    switch (variant) {
      case "ai":
        return "from-primary to-secondary";
      case "processing":
        return "from-warning to-primary";
      case "research":
        return "from-info to-primary";
      default:
        return "from-primary to-secondary";
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <div className={cn(
        "mb-4 p-3 rounded-full bg-gradient-to-br shadow-lg",
        getGradient()
      )}>
        <div className={cn("text-white", getSize())}>
          {getIcon()}
        </div>
      </div>
      
      {text && (
        <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
          {text}
          {showDots && <span className="animate-pulse">...</span>}
        </h3>
      )}
      
      {subtext && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {subtext}
        </p>
      )}

      {/* Progress dots */}
      <div className="flex space-x-1 mt-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full bg-primary/30 animate-pulse",
              i === 0 && "animation-delay-0",
              i === 1 && "animate-delay-200",
              i === 2 && "animate-delay-300"
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export function ProgressBar({ 
  progress, 
  className, 
  showPercentage = true, 
  animated = true 
}: ProgressBarProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">Progress</span>
        {showPercentage && (
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out",
            animated && "animate-pulse"
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}