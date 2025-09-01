import { cn } from "@/lib/utils";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface LoadingStateProps {
  isLoading: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingState({
  isLoading,
  isSuccess = false,
  isError = false,
  loadingText = "Loading...",
  successText = "Completed",
  errorText = "Error occurred",
  className,
  size = "md"
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2 text-muted-foreground", sizeClasses[size], className)}>
        <Loader2 className={cn("animate-spin", iconSizes[size])} />
        <span>{loadingText}</span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={cn("flex items-center space-x-2 text-green-600", sizeClasses[size], className)}>
        <CheckCircle className={iconSizes[size]} />
        <span>{successText}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("flex items-center space-x-2 text-red-600", sizeClasses[size], className)}>
        <AlertCircle className={iconSizes[size]} />
        <span>{errorText}</span>
      </div>
    );
  }

  return null;
}
