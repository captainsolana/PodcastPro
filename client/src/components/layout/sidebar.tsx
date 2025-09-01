import { useLocation } from "wouter";
import { useProjects } from "@/hooks/use-project";
import { Mic, Check, Calendar, Clock, ArrowRight } from "lucide-react";
import { ExpandableText } from "@/components/ui/expandable-text";
import { ProjectStatus } from "@/components/ui/project-status";
import type { Project } from "@shared/schema";
import APP_CONFIG from "@/lib/config";

interface SidebarProps {
  project: Project;
  onPhaseChange?: (phase: number) => void;
}

export default function Sidebar({ project, onPhaseChange }: SidebarProps) {
  const [, setLocation] = useLocation();
  const { projects } = useProjects(); // Simplified - no userId needed

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

  const canNavigateToPhase = (phaseNumber: number) => {
    // Can always navigate to current phase or completed phases
    return phaseNumber <= project.phase;
  };

  const handlePhaseNavigation = (phaseNumber: number) => {
    if (!canNavigateToPhase(phaseNumber)) return;
    
    if (onPhaseChange) {
      onPhaseChange(phaseNumber);
    }
  };

  return (
    <div className="w-72 bg-card/50 backdrop-blur-sm border-r border-border/50 shadow-lg">
      <div className="p-6">
        <div 
          className="group flex items-center space-x-3 mb-8 cursor-pointer hover:scale-105 transition-all duration-300"
          onClick={() => setLocation("/")}
          data-testid="link-home"
        >
          <div className="gradient-bg w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
            <Mic className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Podcast Maker</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Creation</p>
          </div>
        </div>

        {/* Current Project Info */}
        <div className="card-enhanced p-4 mb-6 animate-fade-in-up">
          <h3 className="font-semibold text-foreground mb-2 truncate">{project.title}</h3>
          <ExpandableText maxLines={2} showButton={false}>
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          </ExpandableText>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-4">Progress Steps</h3>
          {phases.map((phase, index) => (
            <div
              key={phase.number}
              className={`group flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${getPhaseStyle(phase.number)} animate-fade-in-up ${
                canNavigateToPhase(phase.number) 
                  ? 'cursor-pointer hover:scale-105 hover:shadow-md' 
                  : 'cursor-not-allowed opacity-60'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handlePhaseNavigation(phase.number)}
              data-testid={`phase-${phase.number}`}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                {phase.number < project.phase ? (
                  <Check className="w-5 h-5" />
                ) : (
                  phase.number
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{phase.title}</p>
                <p className="text-xs opacity-90 leading-relaxed">{phase.description}</p>
              </div>
              {phase.number === project.phase && (
                <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform duration-300" />
              )}
            </div>
          ))}
        </div>

        {/* Project Status */}
        <div className="mt-6">
          <ProjectStatus project={project} />
        </div>

        {/* Recent Projects */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Projects</h3>
          <div className="space-y-3">
            {projects.slice(0, 3).map((proj, index) => (
              <div
                key={proj.id}
                className={`group card-enhanced p-3 cursor-pointer transition-all duration-300 animate-fade-in-up ${
                  proj.id === project.id ? "ring-2 ring-primary/20 bg-primary/5" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setLocation(`/project/${proj.id}`)}
                data-testid={`card-recent-project-${proj.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {proj.title}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          proj.phase === 1 ? 'bg-primary' :
                          proj.phase === 2 ? 'bg-warning' :
                          'bg-success'
                        }`} />
                        <span className="text-xs font-medium text-muted-foreground">
                          Phase {proj.phase}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(proj.updatedAt || "").toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {proj.id !== project.id && (
                    <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
