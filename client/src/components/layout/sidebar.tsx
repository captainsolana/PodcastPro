import { useLocation } from "wouter";
import { useProjects } from "@/hooks/use-project";
import { AppIcon } from "@/components/ui/icon-registry";
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
    { number: 1, title: "Prompt & Research", short: "Research", descPending: "Define idea", descActive: "Refine & research", descDone: "Research complete" },
    { number: 2, title: "Script Generation", short: "Script", descPending: "Generate scripts", descActive: "Write & refine", descDone: "Scripts ready" },
    { number: 3, title: "Audio Generation", short: "Audio", descPending: "Convert to audio", descActive: "Generate audio", descDone: "Audio produced" },
  ];

  const statusFor = (phaseNumber: number) => {
    if (phaseNumber < project.phase) return 'done';
    if (phaseNumber === project.phase) return 'active';
    return 'pending';
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

  // Episode / script / audio progress (multi-episode aware)
  const episodePlan = (project as any).episodePlan;
  const isMulti = episodePlan?.isMultiEpisode;
  const episodes: any[] = episodePlan?.episodes || [];
  const totalEpisodes = episodePlan?.totalEpisodes || episodes.length || 0;
  const completedEpisodes = episodes.filter(e => e.status === 'completed').length;
  const scriptsReady = episodes.filter(e => (e as any).scriptGenerated || (e as any).status === 'completed').length;
  const episodeAudioUrls = (project as any).episodeAudioUrls || {};
  const audiosReady = Object.keys(episodeAudioUrls).length;

  return (
  <div className="w-72 glass-surface depth-base border-r border-[color-mix(in_srgb,var(--semantic-border)_55%,transparent)]" aria-label="Workflow navigation sidebar">
      <div className="p-6">
        <div 
          className="group flex items-center space-x-3 mb-8 cursor-pointer hover:scale-105 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--semantic-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--semantic-bg)] rounded-md"
          onClick={() => setLocation("/")}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLocation("/"); }}}
          tabIndex={0}
          role="link"
          aria-label="Go to home (project list)"
          data-testid="link-home"
        >
          <div className="gradient-bg w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
            <AppIcon name="mic" className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Podcast Maker</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Creation</p>
          </div>
        </div>

        {/* Current Project Info */}
  <div className="glass-surface depth-floating p-4 mb-6 animate-fade-in-up">
          <h3 className="font-semibold text-foreground mb-2 truncate">{project.title}</h3>
          <ExpandableText maxLines={2} showButton={false}>
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          </ExpandableText>
        </div>

        {/* Progress Steps */}
        <div className="space-y-2 mb-8">
          <h3 className="text-xs font-semibold tracking-wide text-[var(--semantic-text-muted)] uppercase">Progress</h3>
          <div className="space-y-2">
            {phases.map((p, idx) => {
              const state = statusFor(p.number);
              const isActive = state === 'active';
              const isDone = state === 'done';
              const desc = isDone ? p.descDone : isActive ? p.descActive : p.descPending;
              // Dynamic progress badge content
              let badge: string | null = null;
              if (p.number === 2 && isMulti && totalEpisodes) {
                badge = `${scriptsReady}/${totalEpisodes}`;
              }
              if (p.number === 3 && isMulti && totalEpisodes) {
                badge = `${audiosReady}/${totalEpisodes}`;
              }
              return (
                <button
                  key={p.number}
                  onClick={() => handlePhaseNavigation(p.number)}
                  disabled={!canNavigateToPhase(p.number)}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                  className={`group w-full relative flex items-center gap-3 rounded-md border px-3 py-3 text-left transition-all animate-fade-in-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--semantic-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--semantic-bg)]
                    ${isActive ? 'glass-surface depth-floating' : 'glass-surface'}
                    ${isDone ? 'opacity-90 hover:opacity-100' : ''}
                    ${!canNavigateToPhase(p.number) ? 'cursor-not-allowed opacity-50' : 'hover:border-[var(--semantic-border-strong)] hover:bg-[var(--semantic-surface-alt)]'}
                  `}
                  data-testid={`phase-${p.number}`}
                  aria-current={isActive ? 'step' : undefined}
                  aria-describedby={`phase-desc-${p.number}`}
                >
                  <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-md ${isDone ? 'bg-[var(--semantic-success)]' : isActive ? 'bg-[var(--brand-accent)]' : 'bg-[var(--semantic-border-strong)]/40'}`} />
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold border
                    ${isDone ? 'border-[var(--semantic-success)] text-[var(--semantic-success)] bg-[var(--semantic-success)]/10' : isActive ? 'border-[var(--semantic-accent)] text-[var(--semantic-accent)] bg-[var(--semantic-accent)]/10' : 'border-[var(--semantic-border-strong)] text-[var(--semantic-text-muted)]'}
                  `}>
                    {isDone ? <AppIcon name="check" className="w-3.5 h-3.5" /> : p.number}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-xs font-semibold tracking-wide ${isActive ? 'text-[var(--semantic-text-primary)]' : 'text-[var(--semantic-text-secondary)]'}`}>{p.title}</span>
                    <span id={`phase-desc-${p.number}`} className="block text-[11px] mt-0.5 text-[var(--semantic-text-muted)] truncate">{desc}</span>
                  </span>
                  {badge && (
                    <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--semantic-inset)] text-[var(--semantic-text-secondary)] border border-[var(--semantic-border)]">
                      {badge}
                    </span>
                  )}
                  {isActive && <AppIcon name="arrowRight" className="w-4 h-4 text-[var(--semantic-text-muted)] group-hover:translate-x-1 transition-transform ml-1" />}
                </button>
              )
            })}
          </div>
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
                className={`group card-enhanced p-3 cursor-pointer transition-all duration-300 animate-fade-in-up focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--semantic-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--semantic-bg)] rounded-md ${
                  proj.id === project.id ? "ring-2 ring-primary/20 bg-primary/5" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setLocation(`/project/${proj.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLocation(`/project/${proj.id}`); }}}
                role="button"
                tabIndex={0}
                aria-label={`Open project ${proj.title}`}
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
                        <AppIcon name="calendar" className="w-3 h-3" />
                        <span>{new Date(proj.updatedAt || "").toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {proj.id !== project.id && (
                    <AppIcon name="arrowRight" className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-2" />
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
