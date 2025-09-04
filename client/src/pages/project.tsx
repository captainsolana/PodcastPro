import { useParams } from "wouter";
import { useState } from "react";
import { useProject } from "@/hooks/use-project";
import ModernSidebar from "@/components/modern/modern-sidebar";
import Header from "@/components/layout/header";
import PromptResearch from "@/components/phases/prompt-research";
import ScriptGeneration from "@/components/phases/script-generation";
import AudioGeneration from "@/components/phases/audio-generation";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LiveStatusProvider } from "@/components/accessibility/live-status";
import { PreferencesProvider } from '@/components/personalization/preferences-context';
import { SkipLink } from "@/components/accessibility/skip-link";
import { ShortcutHelp } from "@/components/accessibility/shortcut-help";

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
              <h1 className="h2 font-semibold text-foreground">Project Not Found</h1>
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
    // For navigation to audio generation (phase 3), allow it if we're at least in phase 2
    if (targetPhase === 3 && project.phase >= 2) {
      // Update the project phase to 3 and navigate
      try {
        updateProject({ 
          id: project.id, 
          updates: { phase: 3 } 
        });
        setCurrentPhase(targetPhase);
        toast({
          title: "Moved to Audio Generation",
          description: "You can work on audio for completed episodes and return anytime.",
        });
      } catch (error) {
        toast({
          title: "Navigation Failed",
          description: "Failed to move to audio generation phase.",
          variant: "destructive",
        });
      }
      return;
    }

    // For other forward navigation, require completion
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
    <LiveStatusProvider>
      <PreferencesProvider>
      <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--semantic-bg)] text-[var(--semantic-text-primary)]">
        <SkipLink />
        <ShortcutHelp />
        
        {/* Sidebar - Responsive */}
        <div className="lg:flex-shrink-0">
          <ModernSidebar project={project} onPhaseChange={handlePhaseChange} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0" id="main-content" tabIndex={-1}>
          <nav className="sr-only" aria-label="In-page skip links">
            <a href="#script-editor" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-1 rounded">Skip to Script Editor</a>
            <a href="#script-analytics-heading" className="sr-only focus:not-sr-only focus:absolute focus:top-10 focus:left-2 bg-primary text-primary-foreground px-3 py-1 rounded">Skip to Analytics Summary</a>
          </nav>
          
          {/* Content Container with max-width and proper overflow */}
          <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto self-stretch overflow-hidden">
            <Header project={project} onPhaseChange={handlePhaseChange} />
            
            {/* Phase Content - Prevent overlap */}
            <main className="flex-1 overflow-y-auto">
              <div className="min-h-0"> {/* Critical for proper flex behavior */}
                {renderPhaseContent()}
              </div>
            </main>
            
            {/* Mini Progress Footer - Mobile responsive */}
            {(() => {
              const episodePlan = (project as any).episodePlan;
              if (!episodePlan?.isMultiEpisode) return null;
              const episodes = episodePlan.episodes || [];
              const total = episodePlan.totalEpisodes || episodes.length || 0;
              if (!total) return null;
              const completed = episodes.filter((e: any) => e.status === 'completed').length;
              const scriptsReady = episodes.filter((e: any) => e.status === 'completed' || (e as any).scriptGenerated).length;
              const episodeAudioUrls = (project as any).episodeAudioUrls || {};
              const audioReady = Object.keys(episodeAudioUrls).length;
              const percent = Math.round((completed / total) * 100);
              return (
                <div className="border-t border-border/60 bg-card/70 backdrop-blur-sm px-3 sm:px-4 py-2 text-[10px] sm:text-xs flex flex-wrap items-center gap-2 sm:gap-4 overflow-x-auto" aria-label="Batch progress summary">
                  <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                    <span className="font-medium">Episodes:</span>
                    <span>{completed}/{total}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                    <span className="font-medium">Scripts:</span>
                    <span>{scriptsReady}/{total}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                    <span className="font-medium">Audio:</span>
                    <span>{audioReady}/{total}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 min-w-[100px] sm:min-w-[140px] flex-1">
                    <span className="font-medium">Overall:</span>
                    <div className="h-1.5 sm:h-2 flex-1 bg-[var(--semantic-inset)] rounded overflow-hidden relative min-w-[60px]">
                      <div className="h-full bg-[var(--semantic-accent)] transition-all duration-[var(--motion-duration-md)] ease-[var(--motion-ease-standard)]" style={{ width: percent + '%' }} />
                    </div>
                    <span className="text-[9px] sm:text-[10px]">{percent}%</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      </PreferencesProvider>
    </LiveStatusProvider>
  );
}
