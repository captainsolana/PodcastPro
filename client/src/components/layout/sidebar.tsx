import { useLocation } from "wouter";
import { useProjects } from "@/hooks/use-project";
import { Mic, Check, Calendar, Clock } from "lucide-react";
import type { Project } from "@shared/schema";

interface SidebarProps {
  project: Project;
}

export default function Sidebar({ project }: SidebarProps) {
  const [, setLocation] = useLocation();
  const { projects } = useProjects(project.userId || "demo-user");

  const phases = [
    {
      number: 1,
      title: "Prompt & Research",
      description: project.phase > 1 ? "AI analysis completed" : "Define your podcast idea",
    },
    {
      number: 2,
      title: "Script Generation",
      description: project.phase > 2 ? "Script generated" : project.phase === 2 ? "Currently editing" : "Pending",
    },
    {
      number: 3,
      title: "Audio Generation",
      description: project.phase === 3 ? "Generate final audio" : "Pending",
    },
  ];

  const getPhaseStyle = (phaseNumber: number) => {
    if (phaseNumber < project.phase) return "phase-completed";
    if (phaseNumber === project.phase) return "phase-active";
    return "phase-pending";
  };

  return (
    <div className="w-64 bg-card border-r border-border shadow-sm">
      <div className="p-6">
        <div 
          className="flex items-center space-x-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setLocation("/")}
          data-testid="link-home"
        >
          <div className="gradient-bg w-10 h-10 rounded-lg flex items-center justify-center">
            <Mic className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Podcast Maker</h1>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          {phases.map((phase) => (
            <div
              key={phase.number}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${getPhaseStyle(phase.number)}`}
              data-testid={`phase-${phase.number}`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                {phase.number < project.phase ? (
                  <Check className="w-4 h-4" />
                ) : (
                  phase.number
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{phase.title}</p>
                <p className="text-xs opacity-75">{phase.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Projects */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Projects</h3>
          <div className="space-y-2">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                className={`p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors ${
                  proj.id === project.id ? "bg-muted" : "bg-muted/50"
                }`}
                onClick={() => setLocation(`/project/${proj.id}`)}
                data-testid={`card-recent-project-${proj.id}`}
              >
                <p className="text-sm font-medium text-foreground truncate">{proj.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Phase {proj.phase}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(proj.updatedAt || "").toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
