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
  // Episode-aware script management
  const episodePlan = (project as any).episodePlan;
  const currentEpisode = (project as any).currentEpisode || 1;
  const isMultiEpisode = episodePlan?.isMultiEpisode;
  const episodeScripts = (project as any).episodeScripts || {};

  // Get current episode script or fall back to main scriptContent
  const getCurrentEpisodeScript = () => {
    if (isMultiEpisode && episodeScripts[currentEpisode]) {
      return episodeScripts[currentEpisode];
    }
    return project.scriptContent || "";
  };

  const [scriptContent, setScriptContent] = useState(getCurrentEpisodeScript());
  const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysis | null>(null);
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

  // Auto-save functionality for script content  
  const { isSaving } = useAutoSave({
    data: { scriptContent },
    onSave: async (data) => {
      if (isMultiEpisode) {
        // Save to episode-specific storage
        const updatedEpisodeScripts = {
          ...episodeScripts,
          [currentEpisode]: data.scriptContent
        };
        
        await updateProject({
          id: project.id,
          updates: {
            episodeScripts: updatedEpisodeScripts,
            scriptContent: data.scriptContent, // Also update main field for compatibility
          }
        });
      } else {
        // Single episode - save to main scriptContent
        await updateProject({
          id: project.id,
          updates: {
            scriptContent: data.scriptContent,
          }
        });
      }
    },
    enabled: scriptContent !== getCurrentEpisodeScript()
  });

  // Episode navigation handlers
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
      for (const episode of remainingEpisodes) {
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
      }

      toast({
        title: "Batch Generation Complete",
        description: `Generated scripts for ${remainingEpisodes.length} episodes.`,
      });

    } catch (error) {
      console.error("Batch generation error:", error);
      toast({
        title: "Batch Generation Failed",
        description: "Some episodes may have failed to generate. Please check and regenerate if needed.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (scriptResult) {
      setScriptContent(scriptResult.content);
      
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
      {/* Navigation Bar */}
      <div className="border-b border-border bg-card/50 px-6 py-4 shrink-0">
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
                onClick={() => {
                  console.log("Regenerate button clicked", { isMultiEpisode, currentEpisode });
                  handleGenerateScript();
                }}
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

      {/* Episode Navigation - Multi-Episode Projects Only */}
      {isMultiEpisode && episodePlan && (
        <div className="border-b border-border bg-muted/30 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-muted-foreground">
                Episodes ({currentEpisode} of {episodePlan.totalEpisodes})
              </div>
              <div className="flex items-center space-x-1">
                {episodePlan.episodes.map((episode: any) => {
                  const isCurrentEpisode = episode.episodeNumber === currentEpisode;
                  const isCompleted = episode.status === "completed";
                  const hasScript = episodeScripts[episode.episodeNumber]?.trim();
                  
                  return (
                    <Button
                      key={episode.episodeNumber}
                      variant={isCurrentEpisode ? "default" : "ghost"}
                      size="sm"
                      className={`
                        relative w-10 h-10 p-0 rounded-full transition-all
                        ${isCompleted ? "ring-2 ring-green-500 ring-offset-1" : ""}
                        ${hasScript && !isCompleted ? "ring-2 ring-blue-400 ring-offset-1" : ""}
                        ${isCurrentEpisode ? "ring-2 ring-primary ring-offset-1 scale-110" : ""}
                      `}
                      onClick={() => !isCurrentEpisode && handleEpisodeChange(episode.episodeNumber)}
                      disabled={isGeneratingScript || isGeneratingEpisodeScript}
                      title={`Episode ${episode.episodeNumber}: ${episode.title}
Status: ${isCompleted ? "✅ Complete" : hasScript ? "📝 Script Ready" : "⏳ Pending"}
${episode.description ? `\n${episode.description}` : ""}`}
                    >
                      {episode.episodeNumber}
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      {hasScript && !isCompleted && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">📝</span>
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                {episodePlan.episodes.find((ep: any) => ep.episodeNumber === currentEpisode)?.title}
              </div>
              {scriptContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkEpisodeComplete}
                  disabled={isGeneratingScript || isGeneratingEpisodeScript}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  Mark Complete & Next
                </Button>
              )}
              {episodePlan.episodes.some((ep: any) => ep.episodeNumber > currentEpisode && ep.status !== "completed") && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleGenerateAllRemaining}
                  disabled={isGeneratingScript || isGeneratingEpisodeScript}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Generate All Remaining
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Tabs */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="editor" className="flex-1 flex flex-col">
              <div className="border-b border-border bg-card px-6">
                <TabsList className="h-auto p-0 bg-transparent">
                  <TabsTrigger value="editor" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    Basic Editor
                  </TabsTrigger>
                  <TabsTrigger value="intelligent" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Intelligent Editor
                  </TabsTrigger>
                  {isMultiEpisode && (
                    <TabsTrigger value="overview" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                      Episode Overview
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="research" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    Research Notes
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="py-4 px-1 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                    AI Insights
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="editor" className="flex-1 p-6 overflow-auto">
                {!scriptContent && !scriptResult && !episodeScriptResult ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Script Generated Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate your podcast script using AI based on your research data.
                  </p>
                  <Button 
                    onClick={() => {
                      console.log("Generate script button clicked (main)");
                      handleGenerateScript();
                    }}
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

          <TabsContent value="intelligent" className="flex-1 p-6 overflow-auto">
            {!scriptContent && !scriptResult && !episodeScriptResult ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Script for Analysis</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate your podcast script first to access intelligent analysis and editing features.
                  </p>
                  <Button 
                    onClick={() => {
                      console.log("Generate script button clicked (intelligent tab)");
                      handleGenerateScript();
                    }}
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

          {/* Episode Overview Tab - Multi-Episode Projects Only */}
          {isMultiEpisode && (
            <TabsContent value="overview" className="flex-1 p-6 overflow-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Episode Overview</h3>
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
                        className={`
                          cursor-pointer transition-all hover:shadow-md
                          ${isCurrentEpisode ? "ring-2 ring-primary" : ""}
                          ${episode.status === "completed" ? "bg-green-50 border-green-200" : ""}
                        `}
                        onClick={() => !isCurrentEpisode && handleEpisodeChange(episode.episodeNumber)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                ${episode.status === "completed" ? "bg-green-500 text-white" : 
                                  isCurrentEpisode ? "bg-primary text-white" : "bg-muted text-muted-foreground"}
                              `}>
                                {episode.episodeNumber}
                              </div>
                              <div>
                                <CardTitle className="text-base">{episode.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {episode.estimatedDuration} minutes • {episode.status}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {hasScript && (
                                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                  Script Ready
                                </div>
                              )}
                              {episode.status === "completed" && (
                                <div className="text-xs text-green-600">✓ Complete</div>
                              )}
                              {isCurrentEpisode && (
                                <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                                  Current
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">{episode.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {episode.keyTopics?.map((topic: string, index: number) => (
                              <span 
                                key={index}
                                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                          
                          {isCurrentEpisode && (
                            <div className="mt-3 flex space-x-2">
                              {!hasScript && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateScript();
                                  }}
                                  disabled={isGeneratingScript || isGeneratingEpisodeScript}
                                >
                                  Generate Script
                                </Button>
                              )}
                              {hasScript && episode.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkEpisodeComplete();
                                  }}
                                  className="text-green-600 border-green-600"
                                >
                                  Mark Complete
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="research" className="flex-1 p-6 overflow-auto">
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

          <TabsContent value="insights" className="flex-1 p-6 overflow-auto">
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

        {/* Flexible Navigation & Progress Section */}
        <div className="p-6 border-t border-border bg-card shrink-0">
          <div className="space-y-4">
            {/* Progress Overview */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Script Generation Progress</p>
                <p className="text-sm text-muted-foreground">
                  {isMultiEpisode 
                    ? `Episode ${currentEpisode} of ${episodePlan?.totalEpisodes || 1}` 
                    : "Single episode podcast"
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                {isMultiEpisode && episodePlan && (
                  <>
                    <span className="text-green-600 font-medium">
                      ✓ {episodePlan.episodes.filter((ep: any) => ep.status === "completed").length} Complete
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-yellow-600 font-medium">
                      ⏳ {episodePlan.episodes.filter((ep: any) => ep.status !== "completed").length} Remaining
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                {/* Current Episode Status */}
                {scriptContent ? (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Current episode script ready
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-yellow-600">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Generate script for this episode
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {/* Generate Current Episode Script (if not ready) */}
                {!scriptContent && (
                  <Button 
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript || isGeneratingEpisodeScript}
                    variant="default"
                  >
                    Generate Episode {currentEpisode} Script
                  </Button>
                )}

                {/* Proceed to Audio - Always Available */}
                <Button 
                  onClick={handleProceedToAudio}
                  data-testid="button-proceed-to-audio"
                  variant={scriptContent ? "default" : "outline"}
                  className={scriptContent ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {scriptContent 
                    ? `Generate Audio for Episode ${currentEpisode}`
                    : `Skip to Audio Generation`
                  }
                </Button>
              </div>
            </div>

            {/* Workflow Explanation */}
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <div className="font-medium mb-1">📋 Flexible Workflow:</div>
              <div className="space-y-1">
                <div>• Generate scripts incrementally - work on one episode at a time</div>
                <div>• Move to Audio Generation anytime to work on completed episodes</div>
                <div>• Return to Script Generation to continue with remaining episodes</div>
                {isMultiEpisode && (
                  <div>• Use "Generate All Remaining" for batch processing when ready</div>
                )}
              </div>
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
      </div>
    </div>
  );
}
