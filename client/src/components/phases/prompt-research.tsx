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
    if (!refinedPrompt || !researchResult || !episodePlan) {
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
          researchData: researchResult,
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
            <AppIcon name="file" className="w-5 h-5 text-primary" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
                <AppIcon name="file" className="w-5 h-5" />
              <span>Original Idea</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

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
              {!researchResult && !isResearching && (
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

              {researchResult && (
                <div className="stack-lg">
                  {/* Success Message with Actions */}
                  <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="heading-xs mb-2">Research Completed Successfully!</h4>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive research has been completed. Review the findings below.
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={handleConductResearch}
                        disabled={isResearching}
                        data-testid="button-redo-research"
                      >
                          <AppIcon name="rotate" className="w-4 h-4 mr-2" />
                        Redo Research
                      </Button>
                    </div>
                  </div>
                  
                  {/* Scrollable Research Viewer */}
                  <ResearchViewer 
                    researchResult={researchResult}
                    className="mb-6"
                  />

                  {/* Next Step Button */}
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
                </div>
              )}

              {showEpisodePlanner && (
                <EpisodePlanner
                  project={{...project, refinedPrompt}}
                  researchResult={researchResult}
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
                  <ResearchViewer 
                    researchResult={researchResult}
                    className="mb-6"
                  />

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
