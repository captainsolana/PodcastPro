import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScriptEditor from "@/components/script/script-editor";
import ScriptToolsPanel from "@/components/script/script-tools-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, RefreshCw, FileText, Search, Lightbulb } from "lucide-react";
import type { Project } from "@shared/schema";

interface ScriptGenerationProps {
  project: Project;
}

export default function ScriptGeneration({ project }: ScriptGenerationProps) {
  const [scriptContent, setScriptContent] = useState(project.scriptContent || "");
  const { 
    updateProject,
    generateScript,
    generateEpisodeScript,
    generateSuggestions,
    isGeneratingScript,
    isGeneratingEpisodeScript,
    isGeneratingSuggestions,
    scriptResult,
    episodeScriptResult,
    suggestionsResult
  } = useProject(project.id);
  const { toast } = useToast();

  const episodePlan = (project as any).episodePlan;
  const currentEpisode = (project as any).currentEpisode || 1;
  const isMultiEpisode = episodePlan?.isMultiEpisode;

  useEffect(() => {
    if (scriptResult) {
      setScriptContent(scriptResult.content);
    }
  }, [scriptResult]);

  useEffect(() => {
    if (episodeScriptResult) {
      setScriptContent(episodeScriptResult.content);
    }
  }, [episodeScriptResult]);

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
      if (isMultiEpisode && episodePlan) {
        await generateEpisodeScript({
          prompt: project.refinedPrompt,
          research: project.researchData,
          episodeNumber: currentEpisode,
          episodePlan: episodePlan,
        });
      } else {
        await generateScript({
          prompt: project.refinedPrompt,
          research: project.researchData,
        });
      }
      
      toast({
        title: "Script Generated",
        description: isMultiEpisode 
          ? `Episode ${currentEpisode} script has been created successfully!` 
          : "Your podcast script has been created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate script. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveScript = async () => {
    try {
      await updateProject({
        id: project.id,
        updates: {
          scriptContent,
          scriptAnalytics: scriptResult?.analytics,
        },
      });
      
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

  const handleProceedToAudio = async () => {
    if (!scriptContent.trim()) {
      toast({
        title: "Error",
        description: "Please generate or write a script first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProject({
        id: project.id,
        updates: {
          phase: 3,
          scriptContent,
          scriptAnalytics: scriptResult?.analytics,
        },
      });
      
      toast({
        title: "Moving to Audio Generation",
        description: "Script phase completed successfully.",
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
    <div className="flex-1 flex">
      {/* Main Content */}
      <div className="flex-1">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <div className="border-b border-border bg-card px-6">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger value="editor" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Script Editor
              </TabsTrigger>
              <TabsTrigger value="research" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Research Notes
              </TabsTrigger>
              <TabsTrigger value="insights" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                AI Insights
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className="flex-1 p-6">
            {!scriptContent && !scriptResult && !episodeScriptResult ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Script Generated Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate your podcast script using AI based on your research data.
                  </p>
                  <Button 
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript || isGeneratingEpisodeScript}
                    size="lg"
                    data-testid="button-generate-script"
                  >
                    {(isGeneratingScript || isGeneratingEpisodeScript) ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Script...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        {isMultiEpisode ? `Generate Episode ${currentEpisode} Script` : "Generate Script with AI"}
                      </>
                    )}
                  </Button>
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
          </TabsContent>

          <TabsContent value="research" className="flex-1 p-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Research Data</CardTitle>
              </CardHeader>
              <CardContent>
                {project.researchData ? (
                  <div className="space-y-6">
                    {(project.researchData as any)?.keyPoints && (
                      <div>
                        <h4 className="font-semibold mb-3">Key Points</h4>
                        <div className="space-y-2">
                          {(project.researchData as any).keyPoints.map((point: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm">{point}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(project.researchData as any)?.statistics && (
                      <div>
                        <h4 className="font-semibold mb-3">Statistics</h4>
                        <div className="space-y-2">
                          {(project.researchData as any).statistics.map((stat: any, index: number) => (
                            <div key={index} className="bg-accent/10 p-3 rounded-lg">
                              <p className="text-sm font-medium">{stat.fact}</p>
                              <p className="text-xs text-muted-foreground mt-1">Source: {stat.source}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No research data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="flex-1 p-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                {suggestionsResult ? (
                  <div className="space-y-4">
                    {suggestionsResult.map((suggestion: any, index: number) => (
                      <div key={index} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Lightbulb className="w-5 h-5 text-accent mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-medium text-sm mb-1">{suggestion.type}</h5>
                            <p className="text-sm text-muted-foreground">{suggestion.suggestion}</p>
                            <p className="text-xs text-muted-foreground mt-2">Target: {suggestion.targetSection}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No AI insights generated yet</p>
                    <Button
                      onClick={() => generateSuggestions(scriptContent)}
                      disabled={!scriptContent || isGeneratingSuggestions}
                      data-testid="button-generate-insights"
                    >
                      {isGeneratingSuggestions ? "Generating..." : "Get AI Insights"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Proceed Button */}
        {scriptContent && (
          <div className="p-6 border-t border-border bg-card">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Ready for Audio Generation?</p>
                <p className="text-sm text-muted-foreground">Your script is complete and ready to be converted to audio.</p>
              </div>
              <Button 
                onClick={handleProceedToAudio}
                data-testid="button-proceed-to-audio"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Generate Audio
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tools Panel */}
      <ScriptToolsPanel 
        project={project}
        scriptContent={scriptContent}
        analytics={scriptResult?.analytics}
        suggestions={suggestionsResult}
        onSave={handleSaveScript}
        onGenerateSuggestions={() => generateSuggestions(scriptContent)}
        isGeneratingSuggestions={isGeneratingSuggestions}
      />
    </div>
  );
}
