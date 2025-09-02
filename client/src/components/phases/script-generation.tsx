import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScriptEditor from "@/components/script/script-editor";
import IntelligentScriptEditor, { type ScriptAnalysis } from "@/components/script/intelligent-script-editor";
import ScriptToolsPanel from "@/components/script/script-tools-panel";
import { EnhancedResearchViewer } from "@/components/ui/enhanced-research-viewer";
import { EnhancedAIInsights } from "@/components/ui/enhanced-ai-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/use-auto-save";
import { LoadingState } from "@/components/ui/loading-state";
import { ArrowRight, RefreshCw, FileText, Search, Lightbulb, ChevronLeft, RotateCcw, BarChart3 } from "lucide-react";
import type { Project } from "@shared/schema";

interface ScriptGenerationProps {
  project: Project;
}

export default function ScriptGeneration({ project }: ScriptGenerationProps) {
  const [scriptContent, setScriptContent] = useState(project.scriptContent || "");
  const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysis | null>(null);
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

  // Auto-save functionality for script content
  const { isSaving } = useAutoSave({
    data: { scriptContent },
    onSave: async (data) => {
      await updateProject({
        id: project.id,
        updates: {
          scriptContent: data.scriptContent,
        }
      });
    },
    enabled: scriptContent !== project.scriptContent
  });

  const episodePlan = (project as any).episodePlan;
  const currentEpisode = (project as any).currentEpisode || 1;
  const isMultiEpisode = episodePlan?.isMultiEpisode;

  useEffect(() => {
    if (scriptResult) {
      setScriptContent(scriptResult.content);
      // Show success notification after content is set
      setTimeout(() => {
        toast({
          title: "Script Generated",
          description: "Your podcast script has been created successfully!",
        });
      }, 100);
    }
  }, [scriptResult, toast]);

  useEffect(() => {
    if (episodeScriptResult) {
      setScriptContent(episodeScriptResult.content);
      // Show success notification after content is set
      setTimeout(() => {
        toast({
          title: "Script Generated",
          description: `Episode ${currentEpisode} script has been created successfully!`,
        });
      }, 100);
    }
  }, [episodeScriptResult, currentEpisode, toast]);

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
      
      // Success notification is now handled in useEffect hooks
      // to ensure it shows after the content is actually rendered
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
    <div className="flex-1 flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Script Generation</h2>
            {isSaving && (
              <LoadingState 
                isLoading={true} 
                loadingText="Saving..." 
                size="sm"
                className="text-xs text-muted-foreground"
              />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateProject({ id: project.id, updates: { phase: 1 } })}
              data-testid="button-back-to-research"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Research
            </Button>
            {scriptContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateScript}
                disabled={isGeneratingScript || isGeneratingEpisodeScript}
                data-testid="button-regenerate-script"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Regenerate Script
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
      {/* Main Content */}
      <div className="flex-1">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <div className="border-b border-border bg-card px-6">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger value="editor" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Basic Editor
              </TabsTrigger>
              <TabsTrigger value="intelligent" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                <BarChart3 className="w-4 h-4 mr-2" />
                Intelligent Editor
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

          <TabsContent value="intelligent" className="flex-1 p-6">
            {!scriptContent && !scriptResult && !episodeScriptResult ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Script for Analysis</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate your podcast script first to access intelligent analysis and editing features.
                  </p>
                  <Button 
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript || isGeneratingEpisodeScript}
                    data-testid="button-generate-script-intelligent"
                  >
                    {isGeneratingScript || isGeneratingEpisodeScript ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Script
                      </>
                    )}
                  </Button>
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

          <TabsContent value="research" className="flex-1 p-6">
            {project.researchData ? (
              <EnhancedResearchViewer 
                researchResult={project.researchData as any}
                className="h-full"
              />
            ) : (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>No Research Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Complete the research phase to see detailed research analysis here.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="flex-1 p-6">
            <EnhancedAIInsights
              suggestions={suggestionsResult || []}
              onApplySuggestion={handleApplySuggestion}
              onGenerateSuggestions={() => generateSuggestions(scriptContent)}
              isGeneratingSuggestions={isGeneratingSuggestions}
              scriptContent={scriptContent}
              className="h-full"
            />
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
        onApplySuggestion={handleApplySuggestion}
        isGeneratingSuggestions={isGeneratingSuggestions}
      />
      </div>
    </div>
  );
}
