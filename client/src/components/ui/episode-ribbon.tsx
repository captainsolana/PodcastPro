import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EpisodeMeta {
  episodeNumber: number
  title: string
  description?: string
  status?: string
}

interface EpisodeRibbonProps {
  currentEpisode: number
  episodes: EpisodeMeta[]
  totalEpisodes: number
  isBusy?: boolean
  episodeScripts: Record<number, string>
  onChange: (ep: number) => void
  onMarkComplete?: () => void
  onGenerateAllRemaining?: () => void
  canMarkComplete?: boolean
  hasNextIncomplete?: boolean
  currentTitle?: string
}

export const EpisodeRibbon: React.FC<EpisodeRibbonProps> = ({
  currentEpisode,
  episodes,
  totalEpisodes,
  isBusy,
  episodeScripts,
  onChange,
  onMarkComplete,
  onGenerateAllRemaining,
  canMarkComplete,
  hasNextIncomplete,
  currentTitle
}) => {
  const buttonRefs = React.useRef<(HTMLButtonElement|null)[]>([])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return
    e.preventDefault()
    const idx = episodes.findIndex(ep => ep.episodeNumber === currentEpisode)
    if(e.key === 'ArrowLeft' && idx > 0) onChange(episodes[idx-1].episodeNumber)
    if(e.key === 'ArrowRight' && idx < episodes.length-1) onChange(episodes[idx+1].episodeNumber)
    if(e.key === 'Home') onChange(episodes[0].episodeNumber)
    if(e.key === 'End') onChange(episodes[episodes.length-1].episodeNumber)
  }

  return (
    <div className="relative border-b border-[var(--semantic-border)] bg-[var(--semantic-surface-alt)]/60 backdrop-blur supports-[backdrop-filter]:bg-[var(--semantic-surface-alt)]/50 px-6 py-3 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4 min-w-0">
        <div className="text-xs font-medium tracking-wide uppercase text-[var(--semantic-text-muted)]">Episodes</div>
        <div className="text-sm font-medium text-[var(--semantic-text-secondary)]">{currentEpisode} / {totalEpisodes}</div>
        <div className="episode-ribbon" role="tablist" aria-label="Episode selection" aria-describedby="episode-ribbon-hint" onKeyDown={handleKeyDown}>
          {episodes.map(ep => {
            const isCurrent = ep.episodeNumber === currentEpisode;
            const isCompleted = ep.status === 'completed';
            const hasScript = !!episodeScripts[ep.episodeNumber]?.trim();
            return (
              <button
                key={ep.episodeNumber}
                data-state={isCurrent ? 'current' : isCompleted ? 'completed' : 'pending'}
                data-has-script={hasScript && !isCompleted ? 'true' : 'false'}
                className="focus-dual touch-target"
                onClick={() => !isCurrent && onChange(ep.episodeNumber)}
                disabled={isBusy}
                role="tab"
                aria-selected={isCurrent}
                tabIndex={isCurrent ? 0 : -1}
                aria-label={`Episode ${ep.episodeNumber}${isCompleted ? ' completed' : hasScript ? ' script ready' : ' not started'}${isCurrent ? ' (current)' : ''}`}
                ref={el => buttonRefs.current[ep.episodeNumber - 1] = el}
                title={`Episode ${ep.episodeNumber}: ${ep.title}\nStatus: ${isCompleted ? '✅ Complete' : hasScript ? '📝 Script Ready' : '⏳ Pending'}${ep.description ? `\n${ep.description}` : ''}`}
              >
                {ep.episodeNumber}
                {(isCompleted || hasScript) && !isCurrent && <span className="status-dot" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3 min-w-0">
  <div className="text-sm text-[var(--semantic-text-secondary)] truncate max-w-[200px] sm:max-w-[320px] md:max-w-[420px] lg:max-w-[520px]" title={currentTitle} aria-live="polite" aria-atomic="true">{currentTitle}</div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canMarkComplete && (
            <Button variant="success" size="sm" disabled={!!isBusy} onClick={onMarkComplete} className={cn("relative disabled:opacity-95 disabled:saturate-75", isBusy ? 'cursor-wait' : '')}>
              {isBusy ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Preparing...</span> : 'Mark Complete & Next'}
            </Button>
          )}
          {hasNextIncomplete && (
            <Button variant="default" size="sm" disabled={!!isBusy} onClick={onGenerateAllRemaining}>
              Generate All Remaining
            </Button>
          )}
        </div>
      </div>
    <div id="episode-ribbon-hint" className="sr-only">Use left and right arrow keys to switch episodes. Home jumps to first, End to last.</div>
    </div>
  )
}
