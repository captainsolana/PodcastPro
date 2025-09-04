import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EpisodeRibbon } from "@/components/ui/episode-ribbon";
import ScriptEditor from "@/components/script/script-editor";
import IntelligentScriptEditor, { type ScriptAnalysis } from "@/components/script/intelligent-script-editor";
import ScriptToolsPanel from "@/components/script/script-tools-panel";
import { DocIllustration, ResearchIllustration } from "@/components/ui/empty-illustrations";
// Lazy loaded heavy tabs for performance
const LazyEnhancedResearchViewer = lazy(() => import("@/components/ui/enhanced-research-viewer").then(m => ({ default: m.EnhancedResearchViewer })));
const LazyEnhancedAIInsights = lazy(() => import("@/components/ui/enhanced-ai-insights").then(m => ({ default: m.EnhancedAIInsights })));
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-project";
import { addRevision, listRevisions, getRevision } from "@/lib/revisions";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useLiveStatus } from "@/components/accessibility/live-status";
import { LoadingState } from "@/components/ui/loading-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AppIcon } from "@/components/ui/icon-registry";
import { ScriptAnalytics } from '@/components/script/script-analytics';
import { EmptyState } from "@/components/ui/empty-state";
import ModernPhaseCard from "@/components/modern/modern-phase-card";
import type { Project } from "@shared/schema";

interface ScriptGenerationProps {
  project: Project;
}

export default function ScriptGeneration({ project }: ScriptGenerationProps) {
  // Episode-aware script management
  const episodePlan = (project as any).episodePlan;
  const currentEpisode = (project as any).currentEpisode || 1;
  const isMultiEpisode = episodePlan?.isMultiEpisode;
  const episodeScripts = (project as any).episodeScripts || {};
  const episodeButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Get current episode script or return empty for multi-episode projects
  const getCurrentEpisodeScript = () => {
    if (isMultiEpisode) {
      // For multi-episode projects, only return the specific episode script
      return episodeScripts[currentEpisode] || "";
    }
    // For single episodes, use the main scriptContent
    return project.scriptContent || "";
  };

  const [scriptContent, setScriptContent] = useState(getCurrentEpisodeScript());
  const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysis | null>(null);
  // Phase 6 state additions
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchSteps, setBatchSteps] = useState<{ep:number; status:'pending'|'running'|'done'|'error';}[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const batchModalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);
  const [revisions, setRevisions] = useState(() => listRevisions(project.id, isMultiEpisode ? currentEpisode : 'single'));
  const { 
    updateProject,
    generateScript,
    generateEpisodeScript,
    generateSuggestions,
    resetScriptGeneration,
    resetEpisodeScriptGeneration,
    isGeneratingScript,
    isGeneratingEpisodeScript,
    isGeneratingSuggestions,
    scriptResult,
    episodeScriptResult,
    suggestionsResult
  } = useProject(project.id);
  const { toast } = useToast();
  // Accessibility announcements via centralized provider
  const { announce } = useLiveStatus();

  // Close handler restoring focus
  const handleCloseBatchModal = () => {
    if (batchProgress < 100) return; // enforce completion
    setShowBatchModal(false);
    announce('Batch generation dialog closed', 'polite');
    if (lastFocusedElementRef.current) {
      lastFocusedElementRef.current.focus();
    }
  };

  // Focus trap when modal opens
  useEffect(() => {
    if (showBatchModal) {
      lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
      requestAnimationFrame(()=> batchModalRef.current?.focus());
      const handler = (e: KeyboardEvent) => {
        if (!batchModalRef.current) return;
        const focusable = batchModalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [showBatchModal, batchProgress, announce]);

  // Keyboard shortcuts (optional power user layer)
  useEffect(()=>{
    const handler = (e: KeyboardEvent) => {
      if(!e.altKey) return;
      if (showBatchModal) return; // avoid conflict while modal open
      switch(e.key){
        case 'ArrowRight': {
          if(isMultiEpisode && episodePlan){
            const next = currentEpisode + 1;
            if (episodePlan.episodes.some((ep:any)=> ep.episodeNumber===next)) {
              handleEpisodeChange(next);
              announce(`Moved to episode ${next}`,'polite');
              e.preventDefault();
            }
          }
          break;
        }
        case 'ArrowLeft': {
          if(isMultiEpisode && episodePlan){
            const prev = currentEpisode - 1;
            if (episodePlan.episodes.some((ep:any)=> ep.episodeNumber===prev)) {
              handleEpisodeChange(prev);
              announce(`Moved to episode ${prev}`,'polite');
              e.preventDefault();
            }
          }
          break;
        }
        case 'r':
        case 'R': {
          if(!isGeneratingScript && !isGeneratingEpisodeScript){
            announce('Regenerating script','polite');
            handleGenerateScript();
            e.preventDefault();
          }
          break; }
        case 's':
        case 'S': {
          const saveBtn = document.querySelector('[data-testid="button-save-progress"]') as HTMLButtonElement | null;
            if(saveBtn && !saveBtn.disabled){
              saveBtn.click();
              announce('Saving progress','polite');
              e.preventDefault();
            }
          break; }
        case '/': {
          window.dispatchEvent(new CustomEvent('pp:open-shortcuts'));
          announce('Opened shortcut help','polite');
          e.preventDefault();
          break; }
      }
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  }, [isMultiEpisode, episodePlan, currentEpisode, isGeneratingScript, isGeneratingEpisodeScript, announce]);
  const prevGeneratingScriptRef = useRef(false);
  const prevGeneratingEpisodeScriptRef = useRef(false);
  const prevGeneratingSuggestionsRef = useRef(false);

  // Announce script generation start & completion
  useEffect(() => {
    const wasGeneratingScript = prevGeneratingScriptRef.current;
    const wasGeneratingEpisode = prevGeneratingEpisodeScriptRef.current;
    const nowGeneratingScript = isGeneratingScript;
    const nowGeneratingEpisode = isGeneratingEpisodeScript;

    if (!wasGeneratingScript && nowGeneratingScript) {
  announce("Generating full script", 'polite');
    }
    if (!wasGeneratingEpisode && nowGeneratingEpisode) {
  announce(`Generating script for episode ${currentEpisode}`,'polite');
    }

    // Completion announcements handled in result effects below
    prevGeneratingScriptRef.current = nowGeneratingScript;
    prevGeneratingEpisodeScriptRef.current = nowGeneratingEpisode;
  }, [isGeneratingScript, isGeneratingEpisodeScript, currentEpisode]);

  // Announce suggestions generation start & completion
  useEffect(() => {
    const wasGenerating = prevGeneratingSuggestionsRef.current;
    if (!wasGenerating && isGeneratingSuggestions) {
  announce("Generating AI suggestions", 'polite');
    }
    prevGeneratingSuggestionsRef.current = isGeneratingSuggestions;
  }, [isGeneratingSuggestions]);

  // Auto-save functionality for script content  
  const autoSave = useAutoSave({
    data: { scriptContent },
    storageKey: `script-draft:${project.id}:${isMultiEpisode ? currentEpisode : 'single'}`,
  serverVersion: project.updatedAt || undefined,
    onConflict: () => {
      // Could surface a non-blocking indicator; actual UI below
    },
    onDraftRecovered: (draft) => {
      if (draft?.scriptContent && draft.scriptContent !== scriptContent) {
        setScriptContent(draft.scriptContent);
      }
    },
    onSave: async (data) => {
      if (isMultiEpisode) {
        const updatedEpisodeScripts = {
          ...episodeScripts,
          [currentEpisode]: data.scriptContent
        };
        await updateProject({
          id: project.id,
          updates: {
            episodeScripts: updatedEpisodeScripts,
            scriptContent: data.scriptContent
          }
        });
      } else {
        await updateProject({
          id: project.id,
          updates: {
            scriptContent: data.scriptContent
          }
        });
      }
    },
    enabled: true,
    showToast: false
  });

  // Episode navigation handlers
  // Inline auto-save status element (moved outside episode handler for scope)
  const renderAutoSaveStatus = () => {
    const { status } = autoSave;
    const baseCls = "text-xs flex items-center gap-1 rounded px-2 py-1 border transition-colors";
    switch (status) {
      case 'saving':
        return <div className={`${baseCls} border-blue-300 text-blue-800 bg-blue-50`}>Saving…</div>;
      case 'saved':
        return <div className={`${baseCls} border-green-300 text-green-800 bg-green-50`}>Saved</div>;
      case 'error':
        return <div className={`${baseCls} border border-red-300 text-red-800 bg-red-50`}>Save failed</div>;
      case 'conflict':
        return <div className={`${baseCls} border border-amber-300 text-amber-800 bg-amber-50`}>Conflict</div>;
      case 'draft':
        return <div className={`${baseCls} border-indigo-300 text-indigo-800 bg-indigo-50`}>Recovered Draft</div>;
      case 'dirty':
        return <div className={`${baseCls} border-gray-300 text-gray-700 bg-gray-50`}>Unsaved</div>;
      default:
        return <div className={`${baseCls} border-transparent text-muted-foreground`}>{autoSave.isSaving ? 'Saving…' : 'Idle'}</div>;
    }
  };

  const handleEpisodeChange = async (episodeNumber: number) => {
    // Save current script content before switching
  if (scriptContent && scriptContent !== getCurrentEpisodeScript()) {
      const updatedEpisodeScripts = {
        ...episodeScripts,
        [currentEpisode]: scriptContent
      };
      
      await updateProject({
        id: project.id,
        updates: {
          episodeScripts: updatedEpisodeScripts,
        }
      });
    }

    // Update current episode
    await updateProject({
      id: project.id,
      updates: {
        currentEpisode: episodeNumber,
      }
    });

    // Load script for new episode
    const newEpisodeScript = episodeScripts[episodeNumber] || "";
    setScriptContent(newEpisodeScript);
    setScriptAnalysis(null);
    // Focus new button after render
    requestAnimationFrame(() => {
      const targetIndex = episodePlan?.episodes.findIndex((ep: any) => ep.episodeNumber === episodeNumber);
      if (targetIndex != null && targetIndex > -1) {
        episodeButtonRefs.current[targetIndex]?.focus();
      }
    });
  };

  const handleEpisodeKeyDown = (e: React.KeyboardEvent) => {
    if (!episodePlan?.episodes?.length) return;
    const currentIndex = episodePlan.episodes.findIndex((ep: any) => ep.episodeNumber === currentEpisode);
    if (currentIndex < 0) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        for (let i = currentIndex + 1; i < episodePlan.episodes.length; i++) {
          const next = episodePlan.episodes[i];
            handleEpisodeChange(next.episodeNumber);
            break;
        }
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        for (let i = currentIndex - 1; i >= 0; i--) {
          const prev = episodePlan.episodes[i];
            handleEpisodeChange(prev.episodeNumber);
            break;
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        handleEpisodeChange(episodePlan.episodes[0].episodeNumber);
        break;
      }
      case 'End': {
        e.preventDefault();
        handleEpisodeChange(episodePlan.episodes[episodePlan.episodes.length - 1].episodeNumber);
        break;
      }
    }
  };

  const handleMarkEpisodeComplete = async () => {
    if (!episodePlan || !isMultiEpisode) return;

    const updatedEpisodes = episodePlan.episodes.map((ep: any) => 
      ep.episodeNumber === currentEpisode 
        ? { ...ep, status: "completed" as const }
        : ep
    );

    await updateProject({
      id: project.id,
      updates: {
        episodePlan: {
          ...episodePlan,
          episodes: updatedEpisodes
        }
      }
    });

    // Move to next episode if available
    const nextEpisode = currentEpisode + 1;
    if (nextEpisode <= episodePlan.totalEpisodes) {
      await handleEpisodeChange(nextEpisode);
    }
  };

  const handleGenerateAllRemaining = async () => {
    if (!episodePlan || !isMultiEpisode || !project.refinedPrompt || !project.researchData) {
      toast({
        title: "Error",
        description: "Missing research data or refined prompt. Please complete the research phase first.",
        variant: "destructive",
      });
      return;
    }

    const remainingEpisodes = episodePlan.episodes.filter((ep: any) => 
      ep.episodeNumber > currentEpisode && ep.status !== "completed"
    );

    if (remainingEpisodes.length === 0) {
      toast({
        title: "All Episodes Complete",
        description: "All episodes have already been generated.",
      });
      return;
    }

    try {
      setShowBatchModal(true);
      const stepsTemplate = remainingEpisodes.map((ep:any)=>({ep:ep.episodeNumber,status:'pending' as const}));
      setBatchSteps(stepsTemplate);
      let completed = 0;
      for (const episode of remainingEpisodes) {
        setBatchSteps(s=>s.map(st=>st.ep===episode.episodeNumber?{...st,status:'running'}:st));
        console.log(`Generating script for episode ${episode.episodeNumber}`);
        
        // Update current episode
        await updateProject({
          id: project.id,
          updates: {
            currentEpisode: episode.episodeNumber,
            scriptContent: ""
          }
        });

        // Generate script for this episode
  await generateEpisodeScript({
          prompt: project.refinedPrompt,
          research: project.researchData,
          episodeNumber: episode.episodeNumber,
          episodePlan: episodePlan,
        });

        // Mark episode as completed
        const updatedEpisodes = episodePlan.episodes.map((ep: any) => 
          ep.episodeNumber === episode.episodeNumber 
            ? { ...ep, status: "completed" as const }
            : ep
        );

  await updateProject({
          id: project.id,
          updates: {
            episodePlan: {
              ...episodePlan,
              episodes: updatedEpisodes
            }
          }
        });
  completed += 1;
  setBatchSteps(s=>s.map(st=>st.ep===episode.episodeNumber?{...st,status:'done'}:st));
  setBatchProgress(Math.round((completed/remainingEpisodes.length)*100));
      }

  setBatchProgress(100);
  toast({
        title: "Batch Generation Complete",
        description: `Generated scripts for ${remainingEpisodes.length} episodes.`,
      });
  setTimeout(()=>setShowBatchModal(false),650);

    } catch (error) {
      console.error("Batch generation error:", error);
  setBatchSteps(s=>s.map(st=>st.status==='running'?{...st,status:'error'}:st));
      toast({
        title: "Batch Generation Failed",
        description: "Some episodes may have failed to generate. Please check and regenerate if needed.",
        variant: "destructive",
      });
  setTimeout(()=>setShowBatchModal(false),1200);
    }
  };

  useEffect(() => {
    if (scriptResult) {
      setScriptContent(scriptResult.content);
  announce("Full script generation complete", 'polite');
  // Capture revision for single episode generation
  try { addRevision(project.id, isMultiEpisode ? currentEpisode : 'single', scriptResult.content); } catch {}
  setRevisions(listRevisions(project.id, isMultiEpisode ? currentEpisode : 'single'));
      
      // Save to appropriate storage
      if (isMultiEpisode) {
        const updatedEpisodeScripts = {
          ...episodeScripts,
          [currentEpisode]: scriptResult.content
        };
        
        updateProject({
          id: project.id,
          updates: {
            episodeScripts: updatedEpisodeScripts,
            scriptContent: scriptResult.content,
          }
        });
      } else {
        updateProject({
          id: project.id,
          updates: {
            scriptContent: scriptResult.content,
          }
        });
      }
      
      // Show success notification after content is set
      setTimeout(() => {
        toast({
          title: "Script Generated",
          description: "Your podcast script has been created successfully!",
        });
      }, 100);
    }
  }, [scriptResult, toast, isMultiEpisode, currentEpisode, episodeScripts, project.id, updateProject]);

  useEffect(() => {
    if (episodeScriptResult) {
      setScriptContent(episodeScriptResult.content);
  announce(`Episode ${currentEpisode} script generation complete`,'polite');
  // Capture revision for multi-episode specific generation
  try { addRevision(project.id, isMultiEpisode ? currentEpisode : 'single', episodeScriptResult.content); } catch {}
  setRevisions(listRevisions(project.id, isMultiEpisode ? currentEpisode : 'single'));
      
      // Save to episode-specific storage
      const updatedEpisodeScripts = {
        ...episodeScripts,
        [currentEpisode]: episodeScriptResult.content
      };
      
      updateProject({
        id: project.id,
        updates: {
          episodeScripts: updatedEpisodeScripts,
          scriptContent: episodeScriptResult.content,
        }
      });
      
      // Show success notification after content is set
      setTimeout(() => {
        toast({
          title: "Script Generated",
          description: `Episode ${currentEpisode} script has been created successfully!`,
        });
      }, 100);
    }
  }, [episodeScriptResult, currentEpisode, toast, episodeScripts, project.id, updateProject]);

  // Update script content when episode changes (external navigation)
  useEffect(() => {
    const newScript = getCurrentEpisodeScript();
    if (newScript !== scriptContent) {
      setScriptContent(newScript);
    }
  }, [currentEpisode, episodeScripts, project.scriptContent]);

  const handleGenerateScript = async () => {
    if (!project.refinedPrompt || !project.researchData) {
      toast({
        title: "Error",
        description: "Missing research data. Please complete the research phase first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Clear any existing script content to show loading state
      setScriptContent("");
      
      // Reset previous mutation states
      if (isMultiEpisode && episodePlan) {
        resetEpisodeScriptGeneration();
        console.log("Generating episode script for episode:", currentEpisode);
        await generateEpisodeScript({
          prompt: project.refinedPrompt,
          research: project.researchData,
          episodeNumber: currentEpisode,
          episodePlan: episodePlan,
        });
      } else {
        resetScriptGeneration();
        console.log("Generating single episode script");
        await generateScript({
          prompt: project.refinedPrompt,
          research: project.researchData,
        });
      }
      
      // Success notification is now handled in useEffect hooks
      // to ensure it shows after the content is actually rendered
    } catch (error) {
      console.error("Script generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate script. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveScript = async () => {
    try {
      if (isMultiEpisode) {
        // Save to episode-specific storage
        const updatedEpisodeScripts = {
          ...episodeScripts,
          [currentEpisode]: scriptContent
        };
        
        await updateProject({
          id: project.id,
          updates: {
            episodeScripts: updatedEpisodeScripts,
            scriptContent: scriptContent,
            scriptAnalytics: scriptResult?.analytics || episodeScriptResult?.analytics,
          },
        });
      } else {
        // Single episode - save to main scriptContent
        await updateProject({
          id: project.id,
          updates: {
            scriptContent,
            scriptAnalytics: scriptResult?.analytics,
          },
        });
      }
  // Manual save also captures a revision (if content not duplicate)
  try { addRevision(project.id, isMultiEpisode ? currentEpisode : 'single', scriptContent); } catch {}
  setRevisions(listRevisions(project.id, isMultiEpisode ? currentEpisode : 'single'));
      
      toast({
        title: "Script Saved",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save script.",
        variant: "destructive",
      });
    }
  };

  const handleApplySuggestion = async (suggestion: any) => {
    try {
      // Call the new API to apply the suggestion with actual content generation
      const response = await fetch('/api/ai/apply-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptContent,
          suggestion
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply suggestion');
      }

      const result = await response.json();
      
      // Update the script content with the AI-generated improved version
      setScriptContent(result.updatedScript);
      
      // Save the updated content
      setTimeout(async () => {
        try {
          await updateProject({
            id: project.id,
            updates: {
              scriptContent: result.updatedScript,
            },
          });
        } catch (saveError) {
          console.error('Auto-save failed:', saveError);
        }
      }, 100);
      
      // Show success notification with location details
      toast({
        title: "✨ AI Enhancement Applied!",
        description: `Generated improved content ${result.changeLocation}. Switch to the Script Editor tab to see the AI-enhanced version.`,
        duration: 6000,
      });

    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      toast({
        title: "❌ Failed to Apply Suggestion",
        description: "Unable to apply the AI suggestion. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handleProceedToAudio = async () => {
    try {
      // Always allow proceeding to audio generation, even without scripts
      // This enables incremental workflow where users can work episode by episode
      await updateProject({
        id: project.id,
        updates: {
          phase: 3,
          // Save current script content if it exists
          ...(scriptContent?.trim() && { scriptContent }),
          // Save current episode script if in multi-episode mode
          ...(isMultiEpisode && scriptContent?.trim() && {
            episodeScripts: {
              ...episodeScripts,
              [currentEpisode]: scriptContent
            }
          }),
          // Include analytics if available
          ...(scriptResult?.analytics && { scriptAnalytics: scriptResult.analytics }),
        },
      });
      
      if (scriptContent?.trim()) {
        toast({
          title: "✅ Moving to Audio Generation",
          description: `Episode ${currentEpisode} script ready for audio generation.`,
        });
      } else {
        toast({
          title: "📻 Accessing Audio Generation",
          description: "You can work on audio for completed episodes and return here anytime.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed to audio generation.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* ARIA live region for status updates */}
  {/* Live region handled globally by LiveStatusProvider */}
      {/* Phase 6: Batch generation modal */}
      {showBatchModal && (
        <div role="dialog" aria-labelledby="batch-modal-title" aria-describedby="batch-modal-desc" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={(e)=>{ if(e.key==='Escape' && batchProgress>=100){ handleCloseBatchModal(); }}}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
          <div className="relative w-full max-w-sm rounded-lg border border-[var(--semantic-border)] bg-[var(--semantic-surface)] shadow-lg p-6 space-y-5 motion-scale-in" ref={batchModalRef} tabIndex={-1}>
            <div className="flex items-center justify-between">
              <h2 id="batch-modal-title" className="text-sm font-semibold flex items-center gap-2"><AppIcon name="refresh" className="w-4 h-4 animate-spin"/>Batch Generating</h2>
              <span className="text-xs text-[var(--semantic-text-muted)]">{batchProgress}%</span>
            </div>
            <p id="batch-modal-desc" className="sr-only">Batch generation progress dialog listing each episode status. Press Escape to close when complete.</p>
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg width="96" height="96" viewBox="0 0 100 100" className="block">
                  <circle cx="50" cy="50" r="42" stroke="var(--semantic-border)" strokeWidth="8" fill="none"/>
                  <circle cx="50" cy="50" r="42" stroke="var(--brand-accent)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={2*Math.PI*42} strokeDashoffset={2*Math.PI*42*(1-batchProgress/100)} style={{transition:'stroke-dashoffset var(--motion-duration-md) var(--motion-ease-standard)'}}/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">{batchProgress}%</div>
              </div>
            </div>
            <div className="max-h-40 overflow-auto pr-1 text-xs space-y-1" aria-label="Batch steps" role="list">
              {batchSteps.map(step=> (
                <div key={step.ep} role="listitem" aria-label={`Episode ${step.ep} status ${step.status}`} className="flex items-center gap-2 p-2 rounded border border-[var(--semantic-border)] bg-[var(--semantic-surface-alt)]/40">
                  <span className="text-xs font-medium">Ep {step.ep}</span>
                  <span className={"ml-auto text-[10px] px-1.5 py-0.5 rounded-full " + (step.status==='pending'?'bg-[var(--accent-soft-bg)] text-[var(--semantic-text-secondary)]':step.status==='running'?'bg-[var(--brand-accent)] text-white animate-pulse':step.status==='done'?'bg-[var(--semantic-success)] text-white':'bg-[var(--semantic-critical)] text-white')}>{step.status}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={handleCloseBatchModal} disabled={batchProgress<100}>Close</Button>
            </div>
          </div>
        </div>
      )}
      {/* Navigation Bar */}
      <div className="border-b border-border bg-card/50 px-6 py-4 shrink-0">
  <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <AppIcon name="file" className="w-5 h-5 text-text-primary" />
            <h2 className="text-lg font-semibold">Script Generation</h2>
            <div className="ml-2 flex items-center gap-2">
              {autoSave.isSaving && (
                <LoadingState 
                  isLoading={true} 
                  loadingText="Saving..." 
                  size="sm"
                  className="text-xs text-muted-foreground"
                />
              )}
              {autoSave.status !== 'saving' && renderAutoSaveStatus()}
              {autoSave.status === 'conflict' && (
                <div className="flex items-center gap-1">
                  <Button size="xs" variant="outline" onClick={() => autoSave.forceSave()} className="h-6 px-2">Overwrite</Button>
                  <Button size="xs" variant="ghost" onClick={() => autoSave.discardDraft()} className="h-6 px-2">Dismiss</Button>
                </div>
              )}
              {autoSave.status === 'draft' && (
                <div className="flex items-center gap-1">
                  <Button size="xs" variant="outline" onClick={() => {
                    const draft = autoSave.restoreDraft();
                    if (draft?.scriptContent) setScriptContent(draft.scriptContent);
                  }} className="h-6 px-2">Apply Draft</Button>
                  <Button size="xs" variant="ghost" onClick={() => autoSave.discardDraft()} className="h-6 px-2">Discard</Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateProject({ id: project.id, updates: { phase: 1 } })}
              data-testid="button-back-to-research"
            >
              <AppIcon name="chevronLeft" className="w-4 h-4 mr-2" />
              Back to Research
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevisions(v => !v)}
              data-testid="button-toggle-revisions"
            >
              <AppIcon name="rotate" className="w-4 h-4 mr-2" />
              {showRevisions ? 'Hide Revisions' : 'Revisions'}
            </Button>
            {scriptContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Regenerate button clicked", { isMultiEpisode, currentEpisode });
                  handleGenerateScript();
                }}
                disabled={isGeneratingScript || isGeneratingEpisodeScript}
                data-testid="button-regenerate-script"
              >
                <AppIcon name="rotate" className="w-4 h-4 mr-2" />
                Regenerate Script
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Episode Navigation - Multi-Episode Projects Only */}
      {isMultiEpisode && episodePlan && (
        <EpisodeRibbon
          currentEpisode={currentEpisode}
          episodes={episodePlan.episodes}
          totalEpisodes={episodePlan.totalEpisodes}
          isBusy={isGeneratingScript || isGeneratingEpisodeScript}
          episodeScripts={episodeScripts}
          onChange={handleEpisodeChange}
          onMarkComplete={handleMarkEpisodeComplete}
          onGenerateAllRemaining={handleGenerateAllRemaining}
          canMarkComplete={!!scriptContent?.trim() && episodePlan.episodes.find((ep: any) => ep.episodeNumber === currentEpisode)?.status !== 'completed'}
          hasNextIncomplete={episodePlan.episodes.some((ep: any) => ep.episodeNumber > currentEpisode && ep.status !== 'completed')}
          currentTitle={episodePlan.episodes.find((ep: any) => ep.episodeNumber === currentEpisode)?.title}
        />
      )}

      {/* Phase 6: Lightweight visual analytics (when analysis exists) */}
      {scriptAnalysis && (
        <section className="px-6 py-4 border-t border-border bg-background/60" aria-labelledby="script-analytics-heading">
          <h3 id="script-analytics-heading" className="sr-only">Script Analytics Summary</h3>
          <div className="max-w-full grid grid-cols-1 md:grid-cols-3 gap-6" role="list" aria-label="Script analytics panels">
            <div className="space-y-2" role="listitem" aria-label="Engagement distribution panel">
              <div className="flex items-center justify-between text-xs font-medium text-[var(--semantic-text-secondary)]">
                <span id="engagement-mix-label">Engagement Mix</span><span aria-label="Engagement score">{scriptAnalysis.engagement.score}%</span>
              </div>
              <div className="flex gap-0.5 h-4 rounded overflow-hidden" aria-labelledby="engagement-mix-label" role="img" aria-description="Proportional distribution of hooks, questions, stories, and statistics in the script">
                {(() => {
                  const parts=[scriptAnalysis.engagement.hooks,scriptAnalysis.engagement.questions,scriptAnalysis.engagement.stories,scriptAnalysis.engagement.statistics];
                  const total=Math.max(1,parts.reduce((a,b)=>a+b,0));
                  const colors=['var(--semantic-accent)','var(--semantic-success)','var(--semantic-warning)','var(--semantic-info)'];
                  const labels=['Hooks','Questions','Stories','Statistics'];
                  return parts.map((v,i)=> <span key={i} style={{width:`${(v/total)*100}%`,background:colors[i]}} className="block" role="presentation" title={`${labels[i]}: ${v}`} aria-label={`${labels[i]} ${v} (${Math.round((v/total)*100)}%)`}/>);
                })()}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--semantic-text-muted)]" aria-hidden="true">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--semantic-accent)]"/>Hooks {scriptAnalysis.engagement.hooks}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--semantic-success)]"/>Questions {scriptAnalysis.engagement.questions}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--semantic-warning)]"/>Stories {scriptAnalysis.engagement.stories}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--semantic-info)]"/>Stats {scriptAnalysis.engagement.statistics}</div>
              </div>
            </div>
            <div className="space-y-2" role="listitem" aria-label="Readability panel">
              <div className="text-xs font-medium text-[var(--semantic-text-secondary)] flex items-center justify-between"><span id="readability-label">Readability</span><span aria-label="Flesch reading ease score">{scriptAnalysis.readability.fleschReadingEase}</span></div>
              <div className="flex items-center gap-2" aria-describedby="readability-label">
                <div className="w-2 h-2 rounded-full" style={{background: scriptAnalysis.readability.complexity==='Simple'?'var(--semantic-success)':scriptAnalysis.readability.complexity==='Average'?'var(--semantic-accent)':scriptAnalysis.readability.complexity==='Complex'?'var(--semantic-warning)':'var(--semantic-critical)'}} aria-label={`Complexity ${scriptAnalysis.readability.complexity}`}/>
                <span className="text-xs text-[var(--semantic-text-secondary)]">{scriptAnalysis.readability.complexity}</span>
              </div>
              <div className="text-[10px] text-[var(--semantic-text-muted)]" aria-label={`Grade level ${scriptAnalysis.readability.fleschKincaidGrade}`}>Grade {scriptAnalysis.readability.fleschKincaidGrade}</div>
            </div>
            <div className="space-y-2" role="listitem" aria-label="SEO panel">
              <div className="text-xs font-medium text-[var(--semantic-text-secondary)] flex items-center justify-between"><span id="seo-label">SEO Score</span><span aria-label="SEO score">{scriptAnalysis.seo.score}%</span></div>
              <div className="flex -space-x-1" aria-describedby="seo-label" role="list" aria-label="Top keywords">
                {scriptAnalysis.seo.keywords.slice(0,5).map(k=> <span key={k} role="listitem" className="px-2 py-0.5 rounded-full bg-[var(--accent-soft-bg)] text-[10px] border border-[var(--accent-subtle-border)] text-[var(--semantic-text-secondary)]">{k}</span>)}
              </div>
            </div>
          </div>
        </section>
      )}

    {/* Main Content Area + Analytics Sidebar */}
  <div className="flex-1 flex flex-row" aria-busy={isGeneratingScript || isGeneratingEpisodeScript || isGeneratingSuggestions || showBatchModal ? 'true' : undefined}>
    <div className="flex-1 flex flex-col min-w-0">
  <div className="flex-1 flex flex-col" aria-busy={isGeneratingScript || isGeneratingEpisodeScript || isGeneratingSuggestions || showBatchModal ? 'true' : undefined}>
        {/* Content Tabs */}
        <div className="flex-1 flex min-h-0">
          <ModernPhaseCard
            title="Script Generation"
            phase={2}
            currentPhase={project.phase}
            icon="file"
            className="flex-1 flex flex-col"
          >
            <Tabs defaultValue="editor" className="flex-1 flex flex-col">
              <div className="border-b border-border bg-card px-6">
                <TabsList className="h-auto p-0 bg-transparent">
                  <TabsTrigger value="editor" className="font-medium">
                    Basic Editor
                  </TabsTrigger>
                    <TabsTrigger value="intelligent" className="font-medium">
                    <AppIcon name="stats" className="w-4 h-4 mr-2" />
                    Intelligent Editor
                  </TabsTrigger>
                  {isMultiEpisode && (
                    <TabsTrigger value="overview" className="font-medium">
                      Episode Overview
                    </TabsTrigger>
                  )}
                    <TabsTrigger value="research" className="font-medium">
                    Research Notes
                  </TabsTrigger>
                    <TabsTrigger value="insights" className="font-medium">
                    AI Insights
                  </TabsTrigger>
                </TabsList>
              </div>
                {/* Editor Tab */}
                <TabsContent value="editor" className="flex-1 p-6 overflow-auto">
                  {!scriptContent && !scriptResult && !episodeScriptResult ? (
                    <Card className="h-full flex items-center justify-center">
                      <CardContent className="w-full max-w-lg">
                        {isGeneratingScript || isGeneratingEpisodeScript ? (
                          <EmptyState
                            dense
                            illustration={<DocIllustration className="w-28 h-28 animate-pulse" />}
                            title="Generating Script"
                            description="Creating a tailored script based on your research data. This usually takes a few moments."
                            variant="accent"
                          />
                        ) : (
                          <EmptyState
                            illustration={<DocIllustration />}
                            title="No Script Yet"
                            description="Generate your podcast script using AI based on your research insights and refined prompt."
                            actionLabel={isMultiEpisode ? `Generate Episode ${currentEpisode} Script` : "Generate Script with AI"}
                            actionIcon={<AppIcon name="file" className="w-4 h-4" />}
                            onAction={() => {
                              console.log("Generate script button clicked (main)");
                              handleGenerateScript();
                            }}
                            variant="neutral"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <ScriptEditor
                      content={scriptContent}
                      onChange={setScriptContent}
                      analytics={(scriptResult || episodeScriptResult)?.analytics}
                      onSave={handleSaveScript}
                      project={project}
                      episodeInfo={isMultiEpisode ? {
                        currentEpisode,
                        totalEpisodes: episodePlan?.totalEpisodes,
                        episodeTitle: episodePlan?.episodes?.find((ep: any) => ep.episodeNumber === currentEpisode)?.title
                      } : undefined}
                    />
                  )}
                  {showRevisions && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">Revision History <span className="text-xs text-muted-foreground">(local)</span></h4>
                      {revisions.length === 0 && <div className="text-xs text-muted-foreground">No revisions yet.</div>}
                      <ul className="space-y-2 max-h-48 overflow-auto pr-2 text-xs">
                        {revisions.map(r => (
                          <li key={r.id} className="p-2 rounded border bg-card/40 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] opacity-70">{new Date(r.createdAt).toLocaleTimeString()}</span>
                              <Button size="xs" variant="ghost" className="h-6 px-2" onClick={() => { const full = getRevision(r.id); if (full?.content) setScriptContent(full.content); }}>
                                Restore
                              </Button>
                            </div>
                            <div className="line-clamp-2 text-muted-foreground">{r.summary}{r.length > r.summary.length && '…'}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                {/* Intelligent Editor Tab */}
                <TabsContent value="intelligent" className="flex-1 p-6 overflow-auto">
                  {!scriptContent && !scriptResult && !episodeScriptResult ? (
                    <Card className="h-full flex items-center justify-center">
                      <CardContent className="w-full max-w-md">
                        <EmptyState
                          illustration={<ResearchIllustration />}
                          title="No Script for Analysis"
                          description="Generate your script first to unlock readability metrics, structure insights, and AI enhancement tools."
                          actionLabel={isGeneratingScript || isGeneratingEpisodeScript ? "Generating..." : "Generate Script"}
                          actionIcon={!(isGeneratingScript || isGeneratingEpisodeScript) ? <AppIcon name="file" className="w-4 h-4" /> : undefined}
                          onAction={() => {
                            if (isGeneratingScript || isGeneratingEpisodeScript) return;
                            console.log("Generate script button clicked (intelligent tab)");
                            handleGenerateScript();
                          }}
                          variant="info"
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <IntelligentScriptEditor
                      content={scriptContent}
                      onContentChange={setScriptContent}
                      onAnalysisChange={setScriptAnalysis}
                      className="h-full"
                    />
                  )}
                </TabsContent>

                {/* Episode Overview Tab */}
                {isMultiEpisode && (
                  <TabsContent value="overview" className="flex-1 p-6 overflow-auto">
                    <div className="stack-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="heading-sm font-semibold">Episode Overview</h3>
                        <div className="text-sm text-muted-foreground">
                          {episodePlan?.episodes?.filter((ep: any) => ep.status === "completed").length || 0} of {episodePlan?.totalEpisodes || 0} episodes completed
                        </div>
                      </div>
                      <div className="grid gap-4">
                        {episodePlan?.episodes?.map((episode: any) => {
                          const hasScript = episodeScripts[episode.episodeNumber] || (episode.episodeNumber === currentEpisode && scriptContent);
                          const isCurrentEpisode = episode.episodeNumber === currentEpisode;
                          return (
                            <Card
                              key={episode.episodeNumber}
                              className={`cursor-pointer transition-all hover:shadow-md ${isCurrentEpisode ? "ring-2 ring-primary" : ""} ${episode.status === "completed" ? "bg-[var(--semantic-success)]/10 border-[var(--semantic-success)]/40" : ""}`}
                              onClick={() => !isCurrentEpisode && handleEpisodeChange(episode.episodeNumber)}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${episode.status === "completed" ? "bg-[var(--semantic-success)] text-white" : isCurrentEpisode ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{episode.episodeNumber}</div>
                                    <div>
                                      <CardTitle className="heading-xs font-medium">{episode.title}</CardTitle>
                                      <p className="text-sm text-muted-foreground">{episode.estimatedDuration} minutes • {episode.status}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {hasScript && <div className="text-xs text-[var(--semantic-success)] bg-[var(--semantic-success)]/15 px-2 py-1 rounded">Script Ready</div>}
                                    {episode.status === "completed" && <div className="text-xs text-[var(--semantic-success)]">✓ Complete</div>}
                                    {isCurrentEpisode && <div className="text-xs text-white bg-blue-600 px-2 py-1 rounded">Current</div>}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground mb-3">{episode.description}</p>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {episode.keyTopics?.map((topic: string, index: number) => (
                                    <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">{topic}</span>
                                  ))}
                                </div>
                                {isCurrentEpisode && (
                                  <div className="mt-1 flex space-x-2">
                                    {!hasScript && (
                                      <Button
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleGenerateScript(); }}
                                        disabled={isGeneratingScript || isGeneratingEpisodeScript}
                                      >
                                        Generate Script
                                      </Button>
                                    )}
                                    {hasScript && episode.status !== "completed" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => { e.stopPropagation(); handleMarkEpisodeComplete(); }}
                                        className="text-[var(--semantic-success)] border-[var(--semantic-success)]"
                                      >
                                        Mark Complete
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* Research Tab */}
                <TabsContent value="research" className="flex-1 p-6 overflow-auto">
                  {project.researchData ? (
                    <Suspense fallback={
                      <Card className="h-full flex items-center justify-center" data-elevation-tier={1}>
                        <CardContent className="w-full max-w-xl space-y-6" aria-busy="true" aria-label="Loading research viewer">
                          <div className="space-y-3">
                            <Skeleton variant="title" className="w-64" />
                            <Skeleton variant="text" lines={4} />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <Skeleton className="h-24 col-span-1" />
                            <Skeleton className="h-24 col-span-1" />
                            <Skeleton className="h-24 col-span-1" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton variant="text" lines={3} />
                          </div>
                          <div className="sr-only" aria-live="polite">Loading research viewer content…</div>
                        </CardContent>
                      </Card>
                    }>
                      <LazyEnhancedResearchViewer
                        researchResult={project.researchData as any}
                        className="h-full"
                      />
                    </Suspense>
                  ) : (
                    <Card className="h-full flex items-center justify-center">
                      <CardContent className="w-full max-w-md">
                        <EmptyState
                          illustration={<ResearchIllustration />}
                          title="No Research Data"
                          description="Complete the research & refinement phase to unlock structured insights and context-aware generation."
                          variant="neutral"
                        />
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="flex-1 p-6 overflow-auto">
                  <Suspense fallback={
                    <Card className="h-full flex items-center justify-center" data-elevation-tier={1}>
                      <CardContent className="w-full max-w-xl space-y-8" aria-busy="true" aria-label="Loading AI insights">
                        <div className="space-y-4">
                          <Skeleton variant="title" className="w-56" />
                          <Skeleton variant="text" lines={5} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Skeleton className="h-32" />
                          <Skeleton className="h-32" />
                          <Skeleton className="h-32" />
                          <Skeleton className="h-32" />
                        </div>
                        <div className="space-y-3">
                          <Skeleton variant="text" lines={2} />
                        </div>
                        <div className="sr-only" aria-live="polite">Loading AI insights suggestions…</div>
                      </CardContent>
                    </Card>
                  }>
                    <LazyEnhancedAIInsights
                      suggestions={suggestionsResult || []}
                      onApplySuggestion={handleApplySuggestion}
                      onGenerateSuggestions={() => generateSuggestions(scriptContent)}
                      isGeneratingSuggestions={isGeneratingSuggestions}
                      scriptContent={scriptContent}
                      className="h-full"
                    />
                  </Suspense>
                </TabsContent>
              </Tabs>

              {/* Progress & Actions */}
              <div className="p-6 border-t border-border bg-card shrink-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Script Generation Progress</p>
                      <p className="text-sm text-muted-foreground">
                        {isMultiEpisode ? `Episode ${currentEpisode} of ${episodePlan?.totalEpisodes || 1}` : "Single episode podcast"}
                      </p>
                    </div>
                    {isMultiEpisode && episodePlan && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-[var(--semantic-success)] font-medium">✓ {episodePlan.episodes.filter((ep: any) => ep.status === "completed").length} Complete</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-[var(--semantic-warning)] font-medium">⏳ {episodePlan.episodes.filter((ep: any) => ep.status !== "completed").length} Remaining</span>
                      </div>
                    )}
                  </div>
                  {isMultiEpisode && episodePlan && (
                    <div aria-label="Overall episode script progress" className="pp-progress" data-state={(() => {
                      const total = episodePlan.totalEpisodes || 1;
                      const done = episodePlan.episodes.filter((ep:any)=> ep.status==='completed').length;
                      return done===0 && (isGeneratingScript || isGeneratingEpisodeScript) ? 'indeterminate' : undefined;
                    })()}>
                      {(() => {
                        const total = episodePlan.totalEpisodes || 1;
                        const done = episodePlan.episodes.filter((ep:any)=> ep.status==='completed').length;
                        const pct = Math.min(100, Math.round((done/total)*100));
                        return <div className="bar" style={{width: pct+"%"}} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} role="progressbar" />;
                      })()}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                      {scriptContent ? (
                        <div className="flex items-center space-x-2 text-sm text-[var(--semantic-success)]">
                          <span className="w-2 h-2 bg-[var(--semantic-success)] rounded-full" />
                          Current episode script ready
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-sm text-[var(--semantic-warning)]">
                          <span className="w-2 h-2 bg-[var(--semantic-warning)] rounded-full" />
                          Generate script for this episode
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {!scriptContent && (
                        <Button
                          onClick={handleGenerateScript}
                          disabled={isGeneratingScript || isGeneratingEpisodeScript}
                        >
                          Generate Episode {currentEpisode} Script
                        </Button>
                      )}
                      <Button
                        onClick={handleProceedToAudio}
                        data-testid="button-proceed-to-audio"
                        variant={scriptContent ? "default" : "outline"}
                      >
                        <AppIcon name="arrowRight" className="w-4 h-4 mr-2" />
                        {scriptContent ? `Generate Audio for Episode ${currentEpisode}` : `Skip to Audio Generation`}
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <div className="font-medium mb-1">📋 Flexible Workflow:</div>
                    <div className="space-y-1">
                      <div>• Generate scripts incrementally - work on one episode at a time</div>
                      <div>• Move to Audio Generation anytime to work on completed episodes</div>
                      <div>• Return to Script Generation to continue with remaining episodes</div>
                      {isMultiEpisode && <div>• Use "Generate All Remaining" for batch processing when ready</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools Panel */}
              <ScriptToolsPanel
                project={project}
                scriptContent={scriptContent}
                analytics={scriptResult?.analytics}
                suggestions={suggestionsResult}
                onSave={handleSaveScript}
                onGenerateSuggestions={() => generateSuggestions(scriptContent)}
                onApplySuggestion={handleApplySuggestion}
                isGeneratingSuggestions={isGeneratingSuggestions}
              />
          </ModernPhaseCard>
        </div>
        {/* Phase 6 Analytics Sidebar */}
        {scriptAnalysis && (
          <ScriptAnalytics metrics={[
            { key:'engagement', label:'Engagement', value: scriptAnalysis.engagement.score, trend:[scriptAnalysis.engagement.hooks,scriptAnalysis.engagement.questions,scriptAnalysis.engagement.stories,scriptAnalysis.engagement.statistics], tone: scriptAnalysis.engagement.score>70?'success':scriptAnalysis.engagement.score>50?'info':'warning', description:'Blend of hooks, questions, stories, stats.' },
            { key:'readability', label:'Readability', value: scriptAnalysis.readability.fleschReadingEase, tone: scriptAnalysis.readability.fleschReadingEase>70?'success':scriptAnalysis.readability.fleschReadingEase>50?'info':'warning', description:`Complexity ${scriptAnalysis.readability.complexity}` },
            { key:'length', label:'Length', value: Math.min(100, Math.round((scriptContent.length/5000)*100)), tone: 'info', description: 'Approx content length vs target.' }
          ]} />
        )}
      </div>
    </div>
  </div>
    </div>
  );
}
