import React from 'react';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/icon-registry';
import type { Project } from '@shared/schema';

interface ModernSidebarProps {
  project: Project;
  onPhaseChange?: (phase: number) => void;
  onNavigateHome?: () => void;
  className?: string;
}

interface Phase {
  number: number;
  title: string;
  short: string;
  description: string;
  icon: keyof typeof import('@/components/ui/icon-registry').Icons;
}

const phases: Phase[] = [
  { 
    number: 1, 
    title: "Prompt & Research", 
    short: "Research", 
    description: "Define and research your podcast concept",
    icon: "search"
  },
  { 
    number: 2, 
    title: "Script Generation", 
    short: "Script", 
    description: "Generate and refine your podcast scripts",
    icon: "edit"
  },
  { 
    number: 3, 
    title: "Audio Generation", 
    short: "Audio", 
    description: "Convert scripts to professional audio",
    icon: "volume"
  },
];

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  project,
  onPhaseChange,
  onNavigateHome,
  className
}) => {
  const episodePlan = (project as any).episodePlan;
  const isMulti = episodePlan?.isMultiEpisode;
  const episodes: any[] = episodePlan?.episodes || [];
  const totalEpisodes = episodePlan?.totalEpisodes || episodes.length || 0;
  const scriptsReady = episodes.filter(e => (e as any).scriptGenerated || (e as any).status === 'completed').length;
  const episodeAudioUrls = (project as any).episodeAudioUrls || {};
  const audiosReady = Object.keys(episodeAudioUrls).length;

  const getPhaseStatus = (phaseNumber: number) => {
    if (phaseNumber < project.phase) return 'completed';
    if (phaseNumber === project.phase) return 'active';
    return 'pending';
  };

  const canNavigateToPhase = (phaseNumber: number) => {
    return phaseNumber <= project.phase;
  };

  const handlePhaseNavigation = (phaseNumber: number) => {
    if (!canNavigateToPhase(phaseNumber)) return;
    onPhaseChange?.(phaseNumber);
  };

  const getProgressBadge = (phase: Phase) => {
    if (phase.number === 2 && isMulti && totalEpisodes) {
      return `${scriptsReady}/${totalEpisodes}`;
    }
    if (phase.number === 3 && isMulti && totalEpisodes) {
      return `${audiosReady}/${totalEpisodes}`;
    }
    return null;
  };

  return (
    <aside className={cn(
      // Base styles
      "bg-bg-elevated border-r border-border-primary backdrop-blur-xl flex flex-col shadow-sm",
      // Mobile: Hide by default, can be toggled
      "hidden lg:flex lg:w-80 lg:h-screen",
      // Mobile: When shown, take full width
      "lg:relative lg:translate-x-0",
      className
    )}>
      {/* Brand header with recording indicator - Mobile responsive */}
      <div className="p-4 lg:p-6 border-b border-border-primary">
        <div 
          className="flex items-center space-x-2 lg:space-x-3 group cursor-pointer focus-enhanced"
          onClick={onNavigateHome}
          tabIndex={0}
          role="button"
          aria-label="Navigate to home"
        >
          <div className="relative">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <AppIcon name="mic" className="text-white w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            {/* Recording indicator */}
            <div className="absolute -top-0.5 -right-0.5 lg:-top-1 lg:-right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-bg-elevated animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-base lg:text-heading-md text-text-primary truncate">Podcast Maker</h1>
            <p className="text-xs lg:text-body-sm text-text-muted">AI-Powered Creation</p>
          </div>
        </div>
      </div>
      
      {/* Project info card - Mobile responsive */}
      <div className="p-4 lg:p-6">
        <div className="card-modern bg-bg-surface border border-border-secondary">
          <h3 className="font-semibold text-sm lg:text-heading-sm mb-2 truncate text-text-primary">{project.title}</h3>
          <p className="text-xs lg:text-body-sm text-text-muted line-clamp-2 mb-3">
            {project.description}
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(project.phase / 3) * 100}%` }}
              />
            </div>
            <span className="text-[10px] lg:text-body-xs text-muted font-medium">
              {Math.round((project.phase / 3) * 100)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Enhanced phase navigation - Mobile responsive */}
      <nav className="px-4 lg:px-6 pb-4 lg:pb-6 flex-1 min-h-0 overflow-y-auto">
        <h3 className="text-[10px] lg:text-body-xs font-semibold text-muted uppercase tracking-wider mb-3 lg:mb-4">
          Workflow
        </h3>
        <div className="space-y-1 lg:space-y-2">
          {phases.map((phase) => {
            const status = getPhaseStatus(phase.number);
            const badge = getProgressBadge(phase);
            const canNavigate = canNavigateToPhase(phase.number);
            
            return (
              <PhaseNavigationItem 
                key={phase.number}
                phase={phase}
                status={status}
                badge={badge}
                canNavigate={canNavigate}
                onClick={() => handlePhaseNavigation(phase.number)}
              />
            );
          })}
        </div>
      </nav>

      {/* Footer with project stats */}
      <div className="p-6 border-t border-border-primary">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-text-muted">Episodes</span>
            <span className="text-text-primary font-medium">{totalEpisodes || 1}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-text-muted">Scripts Ready</span>
            <span className="text-text-primary font-medium">{scriptsReady}/{totalEpisodes || 1}</span>
          </div>
          <div className="flex items-center justify-between text-body-sm">
            <span className="text-text-muted">Audio Ready</span>
            <span className="text-text-primary font-medium">{audiosReady}/{totalEpisodes || 1}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface PhaseNavigationItemProps {
  phase: Phase;
  status: 'pending' | 'active' | 'completed';
  badge?: string | null;
  canNavigate: boolean;
  onClick: () => void;
}

const PhaseNavigationItem: React.FC<PhaseNavigationItemProps> = ({
  phase,
  status,
  badge,
  canNavigate,
  onClick
}) => {
  return (
    <div
      className={cn(
        "relative p-3 lg:p-4 rounded-xl border transition-all duration-300 cursor-pointer group",
        "focus-enhanced",
        status === 'active' && "bg-accent-primary/10 border-accent-primary/30 shadow-glow-primary/20",
        status === 'completed' && "bg-success/5 border-success/20",
        status === 'pending' && "bg-surface/30 border-primary/10",
        !canNavigate && "opacity-50 cursor-not-allowed",
        canNavigate && "hover:scale-[1.02] hover-lift"
      )}
      onClick={canNavigate ? onClick : undefined}
      tabIndex={canNavigate ? 0 : -1}
      role="button"
      aria-label={`Navigate to ${phase.title}`}
      aria-disabled={!canNavigate}
    >
      {/* Status indicator - Mobile responsive */}
      <div className="absolute top-2 lg:top-3 right-2 lg:right-3">
        {status === 'completed' ? (
          <div className="w-5 h-5 lg:w-6 lg:h-6 bg-success rounded-full flex items-center justify-center">
            <AppIcon name="success" className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
          </div>
        ) : status === 'active' ? (
          <div className="w-5 h-5 lg:w-6 lg:h-6 bg-accent-primary rounded-full animate-pulse" />
        ) : (
          <div className="w-5 h-5 lg:w-6 lg:h-6 bg-muted/20 rounded-full" />
        )}
      </div>

      {/* Badge for multi-episode progress - Mobile responsive */}
      {badge && (
        <div className="absolute top-1.5 lg:top-2 right-8 lg:right-10 px-1.5 lg:px-2 py-0.5 bg-gray-100 border border-gray-300 rounded-full">
          <span className="text-[10px] lg:text-body-xs font-medium text-gray-700">{badge}</span>
        </div>
      )}

      {/* Gradient overlay for active state */}
      {status === 'active' && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-primary rounded-t-xl" />
      )}

      <div className="flex items-center space-x-2 lg:space-x-3 pr-6 lg:pr-8"> {/* Add right padding to prevent overlap */}
        <div className={cn(
          "w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0",
          status === 'completed' && "bg-success text-white",
          status === 'active' && "bg-accent-primary text-white group-hover:scale-110",
          status === 'pending' && "bg-muted/20 text-muted"
        )}>
          <AppIcon name={phase.icon} className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-sm lg:text-heading-xs truncate",
            status === 'active' && "text-accent-primary",
            status === 'completed' && "text-success",
            status === 'pending' && "text-muted"
          )}>
            {phase.title}
          </h4>
          <p className={cn(
            "text-xs lg:text-body-xs line-clamp-2 leading-tight",
            status === 'active' && "text-secondary",
            status === 'completed' && "text-success/80",
            status === 'pending' && "text-subtle"
          )}>
            {phase.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernSidebar;
