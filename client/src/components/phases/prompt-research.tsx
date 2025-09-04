import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/use-auto-save";
import AutoSaveIndicator from "@/components/ui/auto-save-indicator";
import { LoadingState } from "@/components/ui/loading-state"; // small inline spinner (will phase out for large states)
import { Skeleton } from "@/components/ui/skeleton";
import EpisodePlanner from "./episode-planner";
import { ResearchViewer } from "@/components/ui/research-viewer";
import { AppIcon } from "@/components/ui/icon-registry";
import ModernPhaseCard from "@/components/modern/modern-phase-card";
import type { Project } from "@shared/schema";

interface PromptResearchProps {
  project: Project;
}

export default function PromptResearch({ project }: PromptResearchProps) {
  const [prompt, setPrompt] = useState(project.originalPrompt || "");
  const [refinedPrompt, setRefinedPrompt] = useState(project.refinedPrompt || "");
  const [showEpisodePlanner, setShowEpisodePlanner] = useState(false);
  const [episodePlan, setEpisodePlan] = useState<any>(null);
  const { 
    updateProject, 
    refinePrompt, 
    conductResearch,
    isRefiningPrompt,
    isResearching,
    refinePromptResult,
    researchResult
  } = useProject(project.id);
  const { toast } = useToast();

  // Maintain a local version history so previously generated research is still viewable
  // Initialize with any persisted project.researchData
  const [researchVersions, setResearchVersions] = useState<any[]>(
    project.researchData ? [project.researchData] : []
  );
  const [activeResearchIndex, setActiveResearchIndex] = useState(0);

  // When a fresh researchResult arrives, append as a new version if unique
  useEffect(() => {
    if (researchResult) {
      setResearchVersions((prev) => {
        const serialized = JSON.stringify(researchResult);
        const exists = prev.some((v) => JSON.stringify(v) === serialized);
        if (exists) return prev;
        return [...prev, researchResult];
      });
    }
  }, [researchResult]);

  // Auto-focus newest version when added
  useEffect(() => {
    if (researchVersions.length > 0) {
      setActiveResearchIndex(researchVersions.length - 1);
    }
  }, [researchVersions.length]);

  // Enhanced auto-save with draft + conflict support
  const autoSave = useAutoSave({
    data: { originalPrompt: prompt, refinedPrompt },
    storageKey: `prompt-draft:${project.id}`,
    serverVersion: project.updatedAt || undefined,
    onSave: async (data) => {
      await updateProject({
        id: project.id,
        updates: {
          originalPrompt: data.originalPrompt,
          refinedPrompt: data.refinedPrompt
        }
      });
    },
    showToast: false,
    enabled: true
  });

  useEffect(() => {
    if (refinePromptResult) {
      setRefinedPrompt(refinePromptResult.refinedPrompt);
    }
  }, [refinePromptResult]);

  useEffect(() => {
    console.log("Research result updated:", researchResult);
  }, [researchResult]);

  // Show prompt refined notification when result is available
  useEffect(() => {
    if (refinePromptResult && !isRefiningPrompt) {
      setTimeout(() => {
        toast({
          title: "Prompt Refined",
          description: "Your prompt has been refined by AI.",
        });
      }, 100);
    }
  }, [refinePromptResult, isRefiningPrompt, toast]);

  // Show research complete notification when result is available
  useEffect(() => {
    if (researchResult && !isResearching) {
      setTimeout(() => {
        toast({
          title: "Research Complete",
          description: "AI has gathered comprehensive research data.",
        });
      }, 100);
    }
  }, [researchResult, isResearching, toast]);

  const handleRefinePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to refine.",
        variant: "destructive",
      });
      return;
    }

    try {
      await refinePrompt(prompt);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refine prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConductResearch = async () => {
    if (!refinedPrompt) {
      toast({
        title: "Error",
        description: "Please refine your prompt first.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Starting research with prompt:", refinedPrompt);
      await conductResearch(refinedPrompt);
      console.log("Research API call completed");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to conduct research. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEpisodePlanApproved = (plan: any) => {
    setEpisodePlan(plan);
    setShowEpisodePlanner(false);
  };

  const handleProceedToScript = async () => {
  const currentResearch = researchResult || researchVersions[researchVersions.length - 1];
  if (!refinedPrompt || !currentResearch || !episodePlan) {
      toast({
        title: "Error",
        description: "Please complete all steps including episode planning.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProject({
        id: project.id,
        updates: {
          phase: 2,
          refinedPrompt,
      researchData: currentResearch,
          episodePlan: episodePlan,
          currentEpisode: 1,
        },
      });
      
      toast({
        title: "Moving to Script Generation",
        description: "Research phase completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed to next phase.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b bg-muted/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AppIcon name="file" className="w-5 h-5 text-text-primary" />
            <h2 className="heading-md">Prompt & Research</h2>
            <AutoSaveIndicator 
              status={autoSave.status} 
              isSaving={autoSave.isSaving} 
              onForceSave={autoSave.forceSave}
              onDiscard={autoSave.discardDraft}
              onApplyDraft={() => {
                const draft = autoSave.restoreDraft();
                if (draft?.originalPrompt) setPrompt(draft.originalPrompt);
                if (draft?.refinedPrompt) setRefinedPrompt(draft.refinedPrompt);
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <AutoSaveIndicator status={autoSave.status} isSaving={autoSave.isSaving} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPrompt(project.originalPrompt || "");
                setRefinedPrompt("");
                toast({
                  title: "Reset",
                  description: "Prompt has been reset to original",
                });
              }}
              className="flex items-center space-x-1"
            >
              <AppIcon name="rotate" className="w-4 h-4" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-6">
  <div className="max-w-4xl mx-auto stack-lg">
          {/* Original Prompt */}
        <ModernPhaseCard
          title="Prompt & Research"
          phase={1}
          currentPhase={project.phase}
          icon="file"
          className="w-full"
        >
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your podcast idea..."
              rows={4}
              className="mb-4"
              data-testid="textarea-original-prompt"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleRefinePrompt}
                disabled={isRefiningPrompt || !prompt.trim()}
                data-testid="button-refine-prompt"
              >
                {isRefiningPrompt ? (
                  <>
                      <AppIcon name="refresh" className="w-4 h-4 mr-2 animate-spin" />
                    Refining with AI...
                  </>
                ) : (
                  <>
                      <AppIcon name="refresh" className="w-4 h-4 mr-2" />
                    Refine with AI
                  </>
                )}
              </Button>
              {refinedPrompt && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setPrompt(project.originalPrompt || "");
                    setRefinedPrompt("");
                  }}
                  data-testid="button-reset-prompt"
                >
                    <AppIcon name="rotate" className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
        </ModernPhaseCard>

        {/* Refined Prompt */}
        {(refinedPrompt || refinePromptResult) && (
          <Card>
            <CardHeader>
              <CardTitle>AI-Refined Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={refinedPrompt}
                  onChange={(e) => setRefinedPrompt(e.target.value)}
                  placeholder="Your refined podcast prompt..."
                  rows={4}
                  className="mb-4"
                  data-testid="textarea-refined-prompt"
                />
              </div>
              
              {refinePromptResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="heading-xs mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {refinePromptResult.focusAreas?.map((area: string, index: number) => (
                        <Badge key={index} variant="soft" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="heading-xs mb-2">Target Details</h4>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Duration: {refinePromptResult.suggestedDuration} minutes</p>
                      <p>Audience: {refinePromptResult.targetAudience}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Research Section */}
        {refinedPrompt && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AppIcon name="search" className="w-5 h-5" />
                <span>AI Research</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show initial call-to-action ONLY if no stored versions exist */}
              {researchVersions.length === 0 && !isResearching && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Ready to conduct deep research on your topic</p>
                  <Button 
                    onClick={handleConductResearch}
                    data-testid="button-conduct-research"
                    disabled={isResearching}
                  >
                      <AppIcon name="search" className="w-4 h-4 mr-2" />
                    Start AI Research
                  </Button>
                </div>
              )}

              {isResearching && (
                <div className="py-8 space-y-8" aria-busy="true" aria-label="Conducting AI research">
                  <div className="flex items-start space-x-4">
                    <Skeleton variant="circle" className="w-12 h-12" />
                    <div className="flex-1 space-y-3">
                      <Skeleton variant="title" className="w-72" />
                      <Skeleton variant="text" lines={3} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton variant="text" lines={2} />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Analyzing topic…</p>
                    <p>Gathering sources…</p>
                    <p>Processing data…</p>
                  </div>
                  <div className="sr-only" aria-live="polite">AI research in progress…</div>
                </div>
              )}

              {researchVersions.length > 0 && (
                <div className="stack-lg">
                  <div className="flex items-center justify-between bg-success/10 p-4 rounded-lg border-l-4 border-success">
                    <div>
                      <h4 className="heading-xs mb-1">Research Available</h4>
                      <p className="text-xs text-muted-foreground">{researchVersions.length} version{researchVersions.length>1?"s":""} stored · Select to view or regenerate for updates.</p>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleConductResearch}
                      disabled={isResearching}
                      data-testid="button-redo-research"
                    >
                        <AppIcon name="rotate" className="w-4 h-4 mr-2" />
                      {isResearching?"Regenerating...":"Regenerate"}
                    </Button>
                  </div>

                  {/* Version Switcher */}
                  {researchVersions.length > 1 ? (
                    <Tabs value={activeResearchIndex.toString()} onValueChange={(v)=>setActiveResearchIndex(Number(v))} className="w-full">
                      <TabsList>
                        {researchVersions.map((_,i)=>(
                          <TabsTrigger key={i} value={i.toString()} className="text-xs">
                            {(i+1)+"/"+researchVersions.length}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {researchVersions.map((rv,i)=>(
                        <TabsContent key={i} value={i.toString()} className="mt-4">
                          <ResearchViewer researchResult={rv} className="mb-2" />
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <ResearchViewer researchResult={researchVersions[0]} className="mb-2" />
                  )}

                  {/* Next Step */}
                  {!showEpisodePlanner && !episodePlan && (
                    <div className="text-center py-4 border-t border-border">
                      <p className="text-muted-foreground mb-4">Ready to plan your episode structure!</p>
                      <Button 
                        onClick={() => setShowEpisodePlanner(true)}
                        data-testid="button-plan-episodes"
                      >
                          <AppIcon name="calendar" className="w-4 h-4 mr-2" />
                        Plan Episodes
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {showEpisodePlanner && (
                <EpisodePlanner
                  project={{...project, refinedPrompt}}
                  researchResult={researchResult || researchVersions[activeResearchIndex]}
                  onPlanApproved={handleEpisodePlanApproved}
                />
              )}

              {episodePlan && (
                <div className="stack-lg">
                  {/* Episode Plan Summary */}
                  <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
                    <h4 className="heading-xs mb-2">Episode Plan Approved</h4>
                    <p className="text-sm text-muted-foreground">
                      {episodePlan.isMultiEpisode 
                        ? `${episodePlan.totalEpisodes}-episode series planned. Starting with Episode 1.`
                        : "Single episode format selected."
                      }
                    </p>
                  </div>

                  {/* Research Viewer with scrollable content */}
                  {researchVersions.length > 1 ? (
                    <Tabs value={activeResearchIndex.toString()} onValueChange={(v)=>setActiveResearchIndex(Number(v))} className="w-full mb-2">
                      <TabsList>
                        {researchVersions.map((_,i)=>(
                          <TabsTrigger key={i} value={i.toString()} className="text-xs">{(i+1)+"/"+researchVersions.length}</TabsTrigger>
                        ))}
                      </TabsList>
                      {researchVersions.map((rv,i)=>(
                        <TabsContent key={i} value={i.toString()} className="mt-4">
                          <ResearchViewer researchResult={rv} className="mb-2" />
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <ResearchViewer researchResult={researchVersions[0]} className="mb-2" />
                  )}

                  {/* Proceed Button */}
                  <div className="pt-4 border-t border-border">
                    <Button 
                      onClick={handleProceedToScript}
                      className="w-full"
                      data-testid="button-proceed-to-script"
                    >
                        <AppIcon name="arrowRight" className="w-4 h-4 mr-2" />
                      {episodePlan?.isMultiEpisode ? "Start Episode 1 Script" : "Proceed to Script Generation"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
