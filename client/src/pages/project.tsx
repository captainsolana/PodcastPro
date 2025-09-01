import { useParams } from "wouter";
import { useState } from "react";
import { useProject } from "@/hooks/use-project";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import PromptResearch from "@/components/phases/prompt-research";
import ScriptGeneration from "@/components/phases/script-generation";
import AudioGeneration from "@/components/phases/audio-generation";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Project() {
  const { id } = useParams();
  const { project, isLoading, error, updateProject } = useProject(id);
  const [currentPhase, setCurrentPhase] = useState<number | null>(null);
  const { toast } = useToast();

  // Use currentPhase override if set, otherwise use project phase
  const displayPhase = currentPhase || project?.phase || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">Project Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              The project you're looking for doesn't exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePhaseChange = (targetPhase: number) => {
    if (targetPhase > project.phase) {
      toast({
        title: "Cannot Navigate Forward",
        description: "Complete the current phase to proceed to the next one.",
        variant: "destructive",
      });
      return;
    }

    if (targetPhase < project.phase) {
      // Allow navigation to previous phases for editing
      toast({
        title: "Navigating to Previous Phase",
        description: "You can edit previous content. Changes won't affect subsequent phases until regenerated.",
      });
    }

    setCurrentPhase(targetPhase);
  };

  const renderPhaseContent = () => {
    switch (displayPhase) {
      case 1:
        return <PromptResearch project={project} />;
      case 2:
        return <ScriptGeneration project={project} />;
      case 3:
        return <AudioGeneration project={project} />;
      default:
        return <PromptResearch project={project} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar project={project} onPhaseChange={handlePhaseChange} />
      <div className="flex-1 flex flex-col">
        <Header project={project} />
        {renderPhaseContent()}
      </div>
    </div>
  );
}
