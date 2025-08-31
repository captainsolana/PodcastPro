import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import EpisodePlanner from "./episode-planner";
import { ResearchViewer } from "@/components/ui/research-viewer";
import { ArrowRight, RefreshCw, Search, FileText, Calendar } from "lucide-react";
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

  useEffect(() => {
    if (refinePromptResult) {
      setRefinedPrompt(refinePromptResult.refinedPrompt);
    }
  }, [refinePromptResult]);

  useEffect(() => {
    console.log("Research result updated:", researchResult);
  }, [researchResult]);

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
      toast({
        title: "Prompt Refined",
        description: "Your prompt has been refined by AI.",
      });
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
      console.log("Research completed, result:", researchResult);
      toast({
        title: "Research Complete",
        description: "AI has gathered comprehensive research data.",
      });
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
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Original Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
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
            <Button 
              onClick={handleRefinePrompt}
              disabled={isRefiningPrompt || !prompt.trim()}
              data-testid="button-refine-prompt"
            >
              {isRefiningPrompt ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refining with AI...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refine with AI
                </>
              )}
            </Button>
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
                    <h4 className="font-semibold text-sm mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {refinePromptResult.focusAreas?.map((area: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Target Details</h4>
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
                <Search className="w-5 h-5" />
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
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Start AI Research
                  </Button>
                </div>
              )}

              {isResearching && (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">AI is conducting deep research...</p>
                </div>
              )}

              {researchResult && (
                <div className="space-y-6">
                  {/* Research Results Display */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Research Completed Successfully!</h4>
                    
                    {/* Key Points */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm mb-3">Key Points</h4>
                      <div className="space-y-2">
                        {researchResult.keyPoints?.map((point: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-foreground">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Episode Outline */}
                    {researchResult.outline && researchResult.outline.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-sm mb-3">Suggested Episode Outline</h4>
                        <div className="space-y-2">
                          {researchResult.outline.map((item: string, index: number) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <p className="text-sm text-foreground">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Statistics */}
                    {researchResult.statistics && researchResult.statistics.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-sm mb-3">Key Statistics</h4>
                        <div className="space-y-2">
                          {researchResult.statistics.map((stat: any, index: number) => (
                            <div key={index} className="bg-accent/10 p-3 rounded-lg">
                              <p className="text-sm font-medium text-foreground">{stat.fact}</p>
                              <p className="text-xs text-muted-foreground mt-1">Source: {stat.source}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {researchResult.sources && researchResult.sources.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-sm mb-3">Research Sources</h4>
                        <div className="space-y-2">
                          {researchResult.sources.map((source: any, index: number) => (
                            <div key={index} className="bg-muted/50 p-3 rounded-lg">
                              <h5 className="font-medium text-sm text-foreground">{source.title}</h5>
                              <p className="text-xs text-muted-foreground mt-1">{source.summary}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Next Step Button */}
                  <div className="text-center py-4 border-t border-border">
                    <p className="text-muted-foreground mb-4">Ready to plan your episode structure!</p>
                    <Button 
                      onClick={() => setShowEpisodePlanner(true)}
                      data-testid="button-plan-episodes"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
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
                <div className="space-y-6">
                  {/* Episode Plan Summary */}
                  <div className="bg-success/10 p-4 rounded-lg border-l-4 border-success">
                    <h4 className="font-semibold text-sm mb-2">Episode Plan Approved</h4>
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
                      <ArrowRight className="w-4 h-4 mr-2" />
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
  );
}
