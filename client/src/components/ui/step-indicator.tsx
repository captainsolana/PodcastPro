import { AppIcon } from "@/components/ui/icon-registry";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "active" | "completed" | "error";
}

interface StepIndicatorProps {
  steps: Step[];
  className?: string;
  vertical?: boolean;
}

export function StepIndicator({ steps, className, vertical = false }: StepIndicatorProps) {
  const getStepIcon = (status: Step["status"]) => {
    switch (status) {
      case "completed":
  return <AppIcon name="check" className="w-4 h-4" />;
      case "active":
  return <AppIcon name="clock" className="w-4 h-4 animate-spin" />;
      case "error":
  return <AppIcon name="warning" className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStepStyles = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "active":
        return "bg-primary text-primary-foreground animate-pulse";
      case "error":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground border-2 border-dashed border-border";
    }
  };

  const getConnectorStyles = (currentStatus: Step["status"], nextStatus?: Step["status"]) => {
    if (currentStatus === "completed") {
      return "bg-success";
    }
    if (currentStatus === "active") {
      return "bg-gradient-to-r from-success to-primary";
    }
    return "bg-muted";
  };

  if (vertical) {
    return (
      <div className={cn("space-y-4", className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-sm transition-all duration-300",
                getStepStyles(step.status)
              )}>
                {getStepIcon(step.status) || (index + 1)}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-0.5 h-8 mt-2 transition-all duration-500",
                  getConnectorStyles(step.status, steps[index + 1]?.status)
                )} />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-8">
              <h3 className={cn(
                "font-semibold text-sm",
                step.status === "active" ? "text-primary" : "text-foreground"
              )}>
                {step.title}
              </h3>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shadow-sm transition-all duration-300",
              getStepStyles(step.status)
            )}>
              {getStepIcon(step.status) || (index + 1)}
            </div>
            <div className="text-center mt-2">
              <h3 className={cn(
                "font-semibold text-xs",
                step.status === "active" ? "text-primary" : "text-foreground"
              )}>
                {step.title}
              </h3>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              "h-0.5 w-12 mx-4 transition-all duration-500",
              getConnectorStyles(step.status, steps[index + 1]?.status)
            )} />
          )}
        </div>
      ))}
    </div>
  );
}