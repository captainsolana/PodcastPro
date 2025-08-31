import { Button } from "@/components/ui/button";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Save, Play, ArrowLeft, CheckCircle, Clock, Calendar } from "lucide-react";
import type { Project } from "@shared/schema";
import { useLocation } from "wouter";

interface HeaderProps {
  project: Project;
}

export default function Header({ project }: HeaderProps) {
  const [, setLocation] = useLocation();

  const getPhaseTitle = () => {
    switch (project.phase) {
      case 1:
        return "Prompt & Research";
      case 2:
        return "Script Generation";
      case 3:
        return "Audio Generation";
      default:
        return "Podcast Creation";
    }
  };

  const getPhaseDescription = () => {
    switch (project.phase) {
      case 1:
        return "Refine your idea and gather comprehensive research data";
      case 2:
        return "Edit and refine your podcast script before generating audio";
      case 3:
        return "Generate final audio and customize voice settings";
      default:
        return "Create your AI-powered podcast";
    }
  };

  const getBreadcrumbItems = () => {
    return [
      {
        label: "Home",
        href: "/"
      },
      {
        label: project.title,
        isActive: true
      }
    ];
  };

  const getPhaseProgress = () => {
    const phases = [
      { number: 1, title: "Prompt & Research", completed: project.phase > 1 },
      { number: 2, title: "Script Generation", completed: project.phase > 2 },
      { number: 3, title: "Audio Generation", completed: false },
    ];
    return phases;
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
      <div className="px-6 py-4">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav 
          items={getBreadcrumbItems()}
          onBack={() => setLocation("/")}
          className="mb-4"
        />
        
        {/* Phase Progress Indicators */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {getPhaseProgress().map((phase) => (
              <div 
                key={phase.number}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  phase.number === project.phase 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : phase.completed
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {phase.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    phase.number
                  )}
                </div>
                <span className="text-sm font-medium hidden md:block">{phase.title}</span>
              </div>
            ))}
          </div>
          
          {/* Project Meta */}
          <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Phase {project.phase}/3</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Updated {new Date(project.updatedAt || "").toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Main Header Content */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-1 truncate">
              {project.title}
            </h1>
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {getPhaseTitle()}
              </h2>
              <span className="text-sm text-muted-foreground hidden md:block">
                {getPhaseDescription()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              data-testid="button-save-progress"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
            {project.phase >= 2 && (
              <Button 
                variant="success"
                size="sm"
                data-testid="button-generate-audio"
              >
                <Play className="w-4 h-4 mr-2" />
                {project.phase === 3 ? "Regenerate Audio" : "Generate Audio"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
