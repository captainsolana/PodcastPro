import { Button } from "@/components/ui/button";
import { Save, Play } from "lucide-react";
import type { Project } from "@shared/schema";

interface HeaderProps {
  project: Project;
}

export default function Header({ project }: HeaderProps) {
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
        return "Refine your idea and gather research data";
      case 2:
        return "Edit and refine your podcast script before generating audio";
      case 3:
        return "Generate final audio and download your podcast";
      default:
        return "Create your AI-powered podcast";
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{getPhaseTitle()}</h2>
          <p className="text-sm text-muted-foreground">{getPhaseDescription()}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            data-testid="button-save-progress"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Progress
          </Button>
          {project.phase >= 2 && (
            <Button 
              size="sm"
              className="bg-success hover:bg-success/90"
              data-testid="button-generate-audio"
            >
              <Play className="w-4 h-4 mr-2" />
              {project.phase === 3 ? "Regenerate Audio" : "Generate Audio"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
