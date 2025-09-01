import { cn } from "@/lib/utils";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface PhaseProgressProps {
  phases: Array<{
    id: number;
    name: string;
    description: string;
    completed: boolean;
    current?: boolean;
  }>;
  className?: string;
}

export function PhaseProgress({ phases, className }: PhaseProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {phases.map((phase, index) => {
        const isLast = index === phases.length - 1;
        
        return (
          <div key={phase.id} className="relative">
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                phase.completed 
                  ? "bg-green-100 border-green-500 text-green-600"
                  : phase.current
                  ? "bg-blue-100 border-blue-500 text-blue-600"
                  : "bg-gray-100 border-gray-300 text-gray-400"
              )}>
                {phase.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : phase.current ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium",
                  phase.completed 
                    ? "text-green-700"
                    : phase.current
                    ? "text-blue-700" 
                    : "text-gray-500"
                )}>
                  {phase.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {phase.description}
                </div>
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className={cn(
                "absolute left-4 top-8 w-0.5 h-4 -translate-x-0.5",
                phase.completed ? "bg-green-300" : "bg-gray-300"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
