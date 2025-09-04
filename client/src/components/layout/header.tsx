import { Button } from "@/components/ui/button";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { AppIcon } from "@/components/ui/icon-registry";
import { PersonalizationPanel } from '@/components/personalization/personalization-panel';
import { ThemeToggle } from "@/components/ui/theme-toggle";
// ThemePackSelector dynamic load (fallback if path alias unresolved in certain build steps)
let ThemePackSelector: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ThemePackSelector = require("@/components/ui/theme-pack-selector").default;
} catch {
  ThemePackSelector = () => null;
}
import { useProject } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { LoadingState } from "@/components/ui/loading-state";
import { useEffect, useState } from "react";
import { getOfflineQueueSize } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { useLocation } from "wouter";

interface HeaderProps {
  project: Project;
  onPhaseChange?: (phase: number) => void;
}

export default function Header({ project, onPhaseChange }: HeaderProps) {
  const [, setLocation] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const { updateProject } = useProject(project.id);
  const { toast } = useToast();
  const [queueSize, setQueueSize] = useState(getOfflineQueueSize());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    function handleQueue(e: any) { setQueueSize(e.detail?.size ?? getOfflineQueueSize()); }
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }
    window.addEventListener('pp:offline-queue-changed', handleQueue as any);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('pp:offline-queue-changed', handleQueue as any);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveProgress = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await updateProject({
        id: project.id,
        updates: {
          updatedAt: new Date(),
        }
      });
      
      toast({
        title: "Progress Saved",
        description: "Your project progress has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

  const phases = [
    { number: 1, title: "Prompt & Research" },
    { number: 2, title: "Script" },
    { number: 3, title: "Audio" }
  ];

  const toggleHighContrast = () => {
    const body = document.body;
    if (body.classList.contains('hc')) {
      body.classList.remove('hc');
      localStorage.removeItem('pp-high-contrast');
    } else {
      body.classList.add('hc');
      localStorage.setItem('pp-high-contrast','1');
    }
  };
  useEffect(()=>{ if(localStorage.getItem('pp-high-contrast')) document.body.classList.add('hc'); },[]);

  const openShortcutHelp = () => {
    window.dispatchEvent(new CustomEvent('pp:open-shortcuts'));
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40 min-h-[64px]">
      <div className="px-5 py-3 w-full max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav 
          items={getBreadcrumbItems()}
          onBack={() => setLocation("/")}
          className="mb-2"
        />
        
        {/* Phase Navigation (Refined) */}
  <div className="flex items-center justify-between mb-1 h-10">
          <nav aria-label="Workflow phases" className="flex items-center gap-1 md:gap-2">
            {phases.map(p => {
              const isActive = p.number === project.phase;
              const isCompleted = p.number < project.phase;
              const canNavigate = p.number <= project.phase; // forward gating handled outside for future rules
              return (
                <button
                  key={p.number}
                  disabled={!canNavigate}
                  onClick={() => onPhaseChange && onPhaseChange(p.number)}
                  className={`group relative px-3 md:px-3.5 py-1.5 rounded-md text-sm font-medium h-9 inline-flex items-center transition-colors
                    ${isActive ? 'text-[var(--semantic-accent)]' : isCompleted ? 'text-[var(--semantic-text-secondary)] hover:text-[var(--semantic-accent)]' : 'text-[var(--semantic-text-muted)] hover:text-[var(--semantic-text-secondary)]'}
                    ${!canNavigate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold border
                      ${isActive ? 'border-[var(--semantic-accent)] text-[var(--semantic-accent)]' : isCompleted ? 'border-[var(--semantic-success)] text-[var(--semantic-success)]' : 'border-[var(--semantic-border-strong)] text-[var(--semantic-text-muted)]'}`}> 
                      {isCompleted ? <AppIcon name="success" className="w-3.5 h-3.5" /> : p.number}
                    </span>
                    <span className="hidden sm:inline-block">{p.title}</span>
                  </span>
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-[var(--semantic-accent)] shadow-[0_0_0_1px_rgba(59,130,246,0.4)]" />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="hidden md:flex items-center gap-3 text-[11px] md:text-[12px] text-[var(--semantic-text-muted)]/90 tracking-tight h-9">
            <div className="flex items-center gap-1"><AppIcon name="pending" className="w-4 h-4" /><span>Phase {project.phase}/3</span></div>
            <div className="flex items-center gap-1"><AppIcon name="calendar" className="w-4 h-4" /><span>Updated {new Date(project.updatedAt || '').toLocaleDateString()}</span></div>
          </div>
        </div>
        
        {/* Main Header Content */}
  <div className="flex items-center justify-between h-10">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground mb-0 truncate tracking-tight leading-tight">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 rounded-md bg-[var(--semantic-surface-alt)] text-[var(--semantic-text-secondary)] border border-[var(--semantic-border)]">
                  {getPhaseTitle()}
                </span>
                <span className="hidden md:inline-block text-xs text-[var(--semantic-text-muted)] max-w-md truncate">
                  {getPhaseDescription()}
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] border border-[var(--semantic-border)]/70 text-[var(--semantic-text-muted)]/90 font-medium">Workflow</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 h-10">
            <ThemeToggle />
            <Button aria-label="Toggle high contrast mode" variant="ghost" size="icon" onClick={toggleHighContrast} className="w-8 h-8" title="High Contrast Mode">
              <AppIcon name="contrast" className="w-4 h-4" />
            </Button>
            <Button aria-label="Show keyboard shortcuts" variant="ghost" size="icon" onClick={openShortcutHelp} className="w-8 h-8" title="Keyboard Shortcuts">
              <AppIcon name="keyboard" className="w-4 h-4" />
            </Button>
            <PersonalizationPanel />
            <ThemePackSelector />
            <div className="flex items-center gap-2">
              {!isOnline && (
                <span className="px-2 py-1 text-[10px] rounded bg-[var(--warning-surface)] text-[var(--semantic-warning)] border border-[var(--semantic-warning)]/40">Offline</span>
              )}
              {queueSize > 0 && (
                <span className="px-2 py-1 text-[10px] rounded bg-[var(--info-surface)] text-[var(--semantic-info)] border border-[var(--semantic-info)]/40" title="Queued changes will sync when online">{queueSize} Pending</span>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveProgress}
              disabled={isSaving}
              data-testid="button-save-progress"
            >
              {isSaving ? (
                <LoadingState 
                  isLoading={true}
                  loadingText="Saving..."
                  size="sm"
                />
              ) : (
                <>
                  <AppIcon name="save" className="w-4 h-4 mr-2" />
                  Save Progress
                </>
              )}
            </Button>
            {project.phase >= 2 && (
              <Button 
                variant={project.phase === 3 ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  if (onPhaseChange) {
                    onPhaseChange(3);
                  } else {
                    updateProject({ id: project.id, updates: { phase: 3 } });
                  }
                }}
                data-testid="button-navigate-to-audio"
                className={project.phase === 3 ? "" : "bg-[var(--semantic-accent)] hover:bg-[var(--semantic-accent-hover)]"}
              >
                <AppIcon name="play" className="w-4 h-4 mr-2" />
                {project.phase === 3 ? "Audio Generation" : "Go to Audio Generation"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
