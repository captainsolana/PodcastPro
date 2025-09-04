import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/icon-registry";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectStatusProps {
  project: any;
  className?: string;
}

export function ProjectStatus({ project, className }: ProjectStatusProps) {
  const getPhaseStatus = (phaseNumber: number) => {
    if (project.phase > phaseNumber) return "completed";
    if (project.phase === phaseNumber) return "current";
    return "pending";
  };

  const getPhaseData = () => [
    {
      name: "Prompt & Research",
      phase: 1,
      status: getPhaseStatus(1),
      completed: !!project.refinedPrompt && !!project.researchData,
      items: [
        { name: "Original Prompt", done: !!project.originalPrompt },
        { name: "Refined Prompt", done: !!project.refinedPrompt },
        { name: "Research Data", done: !!project.researchData },
      ]
    },
    {
      name: "Script Generation", 
      phase: 2,
      status: getPhaseStatus(2),
      completed: !!project.scriptContent,
      items: [
        { name: "Script Content", done: !!project.scriptContent },
        { name: "Analytics", done: !!project.scriptAnalytics },
      ]
    },
    {
      name: "Audio Production",
      phase: 3, 
      status: getPhaseStatus(3),
      completed: !!project.audioUrl,
      items: [
        { name: "Voice Settings", done: !!project.voiceSettings },
        { name: "Audio File", done: !!project.audioUrl },
      ]
    }
  ];

  const phases = getPhaseData();
  const completedPhases = phases.filter(p => p.completed).length;
  const totalPhases = phases.length;
  const progressPercentage = (completedPhases / totalPhases) * 100;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Overall Progress */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Project Progress</h3>
              <p className="text-xs text-muted-foreground">
                {completedPhases} of {totalPhases} phases completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Phase Details */}
          <div className="space-y-3">
            {phases.map((phase, index) => (
              <div key={phase.phase} className="flex items-start space-x-3">
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  phase.status === "completed" 
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : phase.status === "current"
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                    : "bg-gray-100 text-gray-500 border-2 border-gray-300"
                )}>
                  {phase.status === "completed" ? (
                    <AppIcon name="success" className="w-4 h-4" />
                  ) : phase.status === "current" ? (
                    <AppIcon name="pending" className="w-4 h-4" />
                  ) : (
                    <span>{phase.phase}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      "text-sm font-medium",
                      phase.status === "completed" 
                        ? "text-green-700"
                        : phase.status === "current"
                        ? "text-blue-700"
                        : "text-gray-500"
                    )}>
                      {phase.name}
                    </h4>
                    {phase.status === "current" && (
                      <AppIcon name="energy" className="w-3 h-3 text-blue-500" />
                    )}
                  </div>

                  {/* Sub-items */}
                  <div className="mt-1 space-y-1">
                    {phase.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-2 text-xs">
                        {item.done ? (
                          <AppIcon name="success" className="w-3 h-3 text-green-500" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-gray-300" />
                        )}
                        <span className={cn(
                          item.done ? "text-green-600" : "text-gray-500"
                        )}>
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="pt-3 border-t border-border">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-primary">
                  {project.originalPrompt?.length || 0}
                </div>
                <div className="text-muted-foreground">Prompt chars</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-primary">
                  {project.scriptContent?.length || 0}
                </div>
                <div className="text-muted-foreground">Script chars</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
