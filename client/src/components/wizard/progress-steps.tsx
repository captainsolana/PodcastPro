import { AppIcon } from "@/components/ui/icon-registry";
import { cn } from "@/lib/utils";

interface ProgressStep {
  number: number;
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
}

interface ProgressStepsProps {
  steps: ProgressStep[];
  className?: string;
}

export default function ProgressSteps({ steps, className }: ProgressStepsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={cn(
            "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
            {
              "phase-completed": step.status === "completed",
              "phase-active": step.status === "active", 
              "phase-pending": step.status === "pending",
            }
          )}
          data-testid={`progress-step-${step.number}`}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200">
            {step.status === "completed" ? (
              <AppIcon name="check" className="w-4 h-4" />
            ) : (
              step.number
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{step.title}</p>
            <p className="text-xs opacity-75 truncate">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
