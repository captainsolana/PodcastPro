import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProject } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { AppIcon } from "@/components/ui/icon-registry";
import type { Project } from "@shared/schema";

interface EpisodePlannerProps {
  project: Project;
  researchResult: any;
  onPlanApproved: (episodePlan: any) => void;
}

export default function EpisodePlanner({ project, researchResult, onPlanApproved }: EpisodePlannerProps) {
  const [selectedPlan, setSelectedPlan] = useState<"single" | "multi" | null>(null);
  const { 
    analyzeEpisodes,
    isAnalyzingEpisodes,
    episodeAnalysisResult
  } = useProject(project.id);
  const { toast } = useToast();

  const handleAnalyzeContent = async () => {
    if (!project.refinedPrompt || !researchResult) {
      toast({
        title: "Error",
        description: "Missing research data for analysis.",
        variant: "destructive",
      });
      return;
    }

    try {
      await analyzeEpisodes({
        prompt: project.refinedPrompt,
        research: researchResult,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze content for episodes.",
        variant: "destructive",
      });
    }
  };

  const handleApprovePlan = (planType: "single" | "multi") => {
    const episodePlan = planType === "single" 
      ? {
          isMultiEpisode: false,
          totalEpisodes: 1,
          episodes: [{
            episodeNumber: 1,
            title: project.title,
            description: project.description,
            keyTopics: [],
            estimatedDuration: 18,
            status: "planned"
          }],
          reasoning: "Single episode format selected by user"
        }
      : {
          ...episodeAnalysisResult,
          episodes: episodeAnalysisResult?.episodes.map((ep: any) => ({
            ...ep,
            status: "planned"
          }))
        };

    onPlanApproved(episodePlan);
    
    toast({
      title: "Plan Approved",
      description: `${planType === "single" ? "Single episode" : "Multi-episode series"} plan has been approved.`,
    });
  };

  return (
  <div className="stack-lg">
      {/* Content Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AppIcon name="users" className="w-5 h-5" />
            <span>Content Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!episodeAnalysisResult && !isAnalyzingEpisodes && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Let AI analyze your research to determine if this content would benefit from being split into multiple episodes.
              </p>
              <Button 
                onClick={handleAnalyzeContent}
                data-testid="button-analyze-content"
              >
                <AppIcon name="users" className="w-4 h-4 mr-2" />
                Analyze Content Depth
              </Button>
            </div>
          )}

          {isAnalyzingEpisodes && (
            <div className="py-8 stack-md" aria-live="polite" aria-busy="true">
              <div className="flex items-center gap-3 justify-center">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-surface)]" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-[var(--semantic-accent)]/30" />
                </div>
                <div className="w-48">
                  <div className="stack-xs">
                    <Skeleton variant="title" className="w-40" />
                    <Skeleton variant="text" lines={2} />
                  </div>
                </div>
              </div>
              <div className="max-w-md mx-auto">
                <Skeleton variant="text" lines={3} />
              </div>
              <p className="body-sm text-muted-foreground text-center">AI is analyzing your content...</p>
            </div>
          )}

          {episodeAnalysisResult && (
            <div className="stack-lg">
              {/* AI Recommendation */}
              <Alert>
                <AppIcon name="success" className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>AI Recommendation:</strong> {episodeAnalysisResult.reasoning}
                </AlertDescription>
              </Alert>

              {/* Episode Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Single Episode Option */}
                <Card className={`cursor-pointer transition-all ${selectedPlan === "single" ? "ring-2 ring-primary" : "hover:elevation-1"}`} data-elevation-tier={selectedPlan === "single" ? 2 : 1}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="heading-xs font-semibold">Single Episode</h4>
                      <Badge variant="outline" className="text-xs">
                        ~18 min
                      </Badge>
                    </div>
                    <p className="body-sm text-muted-foreground mb-4">
                      Create one comprehensive episode covering all the research topics.
                    </p>
                    <Button
                      variant={selectedPlan === "single" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleApprovePlan("single")}
                      className="w-full"
                      data-testid="button-approve-single"
                    >
                      Choose Single Episode
                    </Button>
                  </CardContent>
                </Card>

                {/* Multi-Episode Option */}
                {episodeAnalysisResult.isMultiEpisode && (
                  <Card className={`cursor-pointer transition-all ${selectedPlan === "multi" ? "ring-2 ring-primary" : "hover:elevation-1"}`} data-elevation-tier={selectedPlan === "multi" ? 2 : 1}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="heading-xs font-semibold">
                          {episodeAnalysisResult.totalEpisodes}-Episode Series
                        </h4>
                        <Badge variant="soft" className="text-xs">
                          Recommended
                        </Badge>
                      </div>
                      <p className="body-sm text-muted-foreground mb-4">
                        Break content into {episodeAnalysisResult.totalEpisodes} focused episodes for better engagement.
                      </p>
                      <Button
                        variant={selectedPlan === "multi" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleApprovePlan("multi")}
                        className="w-full"
                        data-testid="button-approve-multi"
                      >
                        Choose Series Format
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Episode Breakdown Preview */}
              {episodeAnalysisResult.isMultiEpisode && (
                <div>
                  <h4 className="font-semibold text-sm mb-3">Proposed Episode Breakdown</h4>
                  <div className="space-y-3">
                    {episodeAnalysisResult.episodes.map((episode: any, index: number) => (
                      <div
                        key={index}
                        className="bg-muted/30 p-3 rounded-lg"
                        data-testid={`episode-preview-${episode.episodeNumber}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm">
                            Episode {episode.episodeNumber}: {episode.title}
                          </h5>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <AppIcon name="pending" className="w-3 h-3" />
                            <span>{episode.estimatedDuration} min</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {episode.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {episode.keyTopics.map((topic: string, topicIndex: number) => (
                            <Badge key={topicIndex} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}