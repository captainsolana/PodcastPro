import React from 'react';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/icon-registry';

interface ModernPhaseCardProps {
  title: string;
  description?: string;
  phase: number;
  currentPhase: number;
  children: React.ReactNode;
  className?: string;
  icon?: keyof typeof import('@/components/ui/icon-registry').Icons;
  badge?: string;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onBack?: () => void;
}

export const ModernPhaseCard: React.FC<ModernPhaseCardProps> = ({
  title,
  description,
  phase,
  currentPhase,
  children,
  className,
  icon = 'circle',
  badge,
  onEdit,
  onRegenerate,
  onBack
}) => {
  const isActive = phase === currentPhase;
  const isCompleted = phase < currentPhase;
  const isPending = phase > currentPhase;

  return (
    <div className={cn(
      "relative overflow-hidden transition-all duration-500 card-modern",
      "bg-bg-elevated border border-border-primary shadow-md rounded-xl",
      "mx-3 sm:mx-4 my-3 sm:my-4", // Add consistent margins
      isActive && "ring-2 ring-accent-primary/40 shadow-lg scale-[1.01] bg-bg-surface",
      isCompleted && "bg-green-50 border-green-300/60 shadow-sm",
      isPending && "opacity-70 bg-bg-subtle",
      className
    )}>
      {/* Status indicator - Mobile responsive */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
        {isCompleted ? (
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center shadow-md">
            <AppIcon name="success" className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        ) : isActive ? (
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent-primary rounded-full animate-pulse shadow-lg shadow-accent-primary/40" />
        ) : (
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-bg-subtle border-2 border-border-secondary rounded-full" />
        )}
      </div>

      {/* Badge - Mobile responsive */}
      {badge && (
        <div className="absolute top-3 sm:top-4 right-12 sm:right-16 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 border border-gray-300 rounded-full">
          <span className="text-[10px] sm:text-body-xs font-medium text-gray-700">{badge}</span>
        </div>
      )}

      {/* Gradient overlay for active state */}
      {isActive && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary" />
      )}

      {/* Card header - Improved mobile layout */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
            isCompleted ? "bg-green-600 text-white shadow-md" :
            isActive ? "bg-gradient-primary text-white shadow-lg shadow-accent-primary/40" :
            "bg-bg-subtle text-text-muted border-2 border-border-secondary"
          )}>
            <AppIcon name={icon} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          
          <div className="flex-1 min-w-0 pr-8 sm:pr-12"> {/* Add right padding to prevent overlap with status indicator */}
            <h2 className={cn(
              "font-display font-bold text-lg sm:text-heading-lg mb-1 text-text-primary leading-tight",
              isActive && "text-accent-primary",
              isCompleted && "text-green-600"
            )}>
              {title}
            </h2>
            {description && (
              <p className={cn(
                "text-sm sm:text-body-md leading-relaxed",
                isActive && "text-text-secondary",
                isCompleted && "text-green-500",
                isPending && "text-text-subtle"
              )}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons - Improved mobile layout */}
        {(isActive || isCompleted) && (onEdit || onRegenerate || onBack) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="btn-ghost text-xs sm:text-body-sm flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <AppIcon name="arrowLeft" className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Back</span>
              </button>
            )}
            
            {onEdit && (
              <button 
                onClick={onEdit}
                className="btn-secondary text-xs sm:text-body-sm flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <AppIcon name="edit" className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Edit</span>
              </button>
            )}
            
            {onRegenerate && (
              <button 
                onClick={onRegenerate}
                className="btn-primary text-xs sm:text-body-sm flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2"
              >
                <AppIcon name="refresh" className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card content - Prevent overflow */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-hidden">
        <div className="w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModernPhaseCard;
