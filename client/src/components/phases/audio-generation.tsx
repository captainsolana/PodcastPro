import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WaveformVisualizer from "@/components/audio/waveform-visualizer";
import EnhancedAudioPlayer from "@/components/audio/enhanced-audio-player";
import AdvancedVoiceCustomization, { type AdvancedVoiceSettings } from "@/components/audio/advanced-voice-customization";
import AudioPreviewModal from "@/components/audio/audio-preview-modal";
import { useProject } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/use-auto-save";
import { LoadingState } from "@/components/ui/loading-state";
import { Play, Download, RefreshCw, Volume2, CheckCircle, FileAudio, ChevronLeft, RotateCcw, Edit3, Save, Mic, FileText, Headphones } from "lucide-react";
import type { Project, VoiceSettings } from "@shared/schema";

interface AudioGenerationProps {
  project: Project;
}

export default function AudioGeneration({ project }: AudioGenerationProps) {
  console.log('🔧 AudioGeneration component rendered with script length:', project.scriptContent?.length || 0);
  
  // Enhanced voice settings with backward compatibility
  const [voiceSettings, setVoiceSettings] = useState<AdvancedVoiceSettings>(() => {
    const defaultSettings = {
      personality: "conversational",
      model: "nova" as const,
      speed: 1.0,
      pitch: 0,
      emphasis: 50,
      pause_length: 1.5,
      breathing: false,
      emotions: {
        enthusiasm: 50,
        calmness: 50,
        confidence: 70
      },
      pronunciation: {}
    };
    
    return {
      ...defaultSettings,
      ...(project.voiceSettings as AdvancedVoiceSettings || {})
    };
  });
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [editedScript, setEditedScript] = useState(project.scriptContent || "");
  const [activeTab, setActiveTab] = useState("script");

  const { 
    updateProject,
    generateAudio,
    isGeneratingAudio,
    audioResult
  } = useProject(project.id);
  const { toast } = useToast();

  // Voice preview functionality
  const handleVoicePreview = async (settings: AdvancedVoiceSettings, text: string): Promise<string> => {
    try {
      // Convert advanced settings to basic settings for API compatibility
      const basicSettings = {
        model: settings.model,
        speed: settings.speed
      };
      
      await generateAudio({ 
        scriptContent: text,
        voiceSettings: basicSettings 
      });
      
      // Return a placeholder URL for now - in real implementation, 
      // this would return the actual preview audio URL
      return "/audio/preview_sample.mp3";
    } catch (error) {
      console.error('Voice preview failed:', error);
      throw new Error('Failed to generate voice preview');
    }
  };

  // Enhanced audio generation with new settings
  const handleGenerateAudio = async () => {
    const currentScript = isEditingScript ? editedScript : project.scriptContent;
    
    if (!currentScript || currentScript.trim().length === 0) {
      toast({
        title: "Error",
        description: "No script content available to generate audio.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save any script edits first
      if (isEditingScript && editedScript !== project.scriptContent) {
        await updateProject({
          id: project.id,
          updates: {
            scriptContent: editedScript,
          },
        });
      }

      console.log('🎵 Starting enhanced audio generation...', { 
        scriptLength: currentScript.length, 
        voiceSettings
      });
      
      // Convert advanced settings to basic settings for API compatibility
      const basicSettings = {
        model: voiceSettings.model,
        speed: voiceSettings.speed
      };

      await generateAudio({
        scriptContent: currentScript,
        voiceSettings: basicSettings,
      });
      
      console.log('✅ Enhanced audio generation request sent');
      
      toast({
        title: "✨ Audio Generation Started",
        description: "Your enhanced podcast audio is being generated. This may take a few moments...",
      });
    } catch (error) {
      console.error('❌ Enhanced audio generation failed:', error);
      toast({
        title: "❌ Audio Generation Failed",
        description: `Failed to generate audio: ${(error as Error).message || 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  // Auto-save functionality for voice settings
  const { isSaving } = useAutoSave({
    data: { voiceSettings },
    onSave: async (data) => {
      await updateProject({
        id: project.id,
        updates: {
          voiceSettings: data.voiceSettings,
        }
      });
    },
    enabled: JSON.stringify(voiceSettings) !== JSON.stringify(project.voiceSettings)
  });

  // Handle audio generation result
  useEffect(() => {
    if (audioResult) {
      console.log('📻 Audio generation completed:', audioResult);
      
      // Update project with audio URL and duration
      const saveAudioResult = async () => {
        try {
          await updateProject({
            id: project.id,
            updates: {
              audioUrl: audioResult.audioUrl,
            },
          });
          
          toast({
            title: "✅ Audio Generated Successfully",
            description: `Your podcast audio is ready! Click Preview to listen.`,
          });
        } catch (error) {
          console.error('Failed to save audio URL:', error);
          toast({
            title: "⚠️ Audio Generated",
            description: "Audio was generated but failed to save. Please try refreshing.",
            variant: "destructive",
          });
        }
      };
      
      saveAudioResult();
    }
  }, [audioResult, project.id, updateProject, toast]);

  // Automatically update project when audio is generated
  useEffect(() => {
    if (audioResult?.audioUrl) {
      updateProject({
        id: project.id,
        updates: {
          voiceSettings,
          audioUrl: audioResult.audioUrl,
        },
      });
    }
  }, [audioResult, project.id, voiceSettings, updateProject]);

  const handleSaveSettings = async () => {
    try {
      await updateProject({
        id: project.id,
        updates: {
          voiceSettings,
          audioUrl: audioResult?.audioUrl,
        },
      });
      
      toast({
        title: "Settings Saved",
        description: "Voice settings have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  const handleSaveScript = async () => {
    try {
      await updateProject({
        id: project.id,
        updates: {
          scriptContent: editedScript,
        },
      });
      
      setIsEditingScript(false);
      toast({
        title: "Script Updated",
        description: "Your script changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save script changes.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedScript(project.scriptContent || "");
    setIsEditingScript(false);
  };

  const handleGenerateWithNewSettings = async () => {
    const currentScript = isEditingScript ? editedScript : project.scriptContent;
    
    if (!currentScript) {
      toast({
        title: "Error", 
        description: "No script content available to generate audio.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save any script edits first
      if (isEditingScript && editedScript !== project.scriptContent) {
        await updateProject({
          id: project.id,
          updates: {
            scriptContent: editedScript,
          },
        });
      }

      await generateAudio({
        scriptContent: currentScript,
        voiceSettings,
      });
      
      toast({
        title: "Audio Generated",
        description: `Audio generated with ${voiceSettings.model} voice at ${voiceSettings.speed}x speed!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate audio.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (project.audioUrl || audioResult?.audioUrl) {
      const url = project.audioUrl || audioResult?.audioUrl;
      const link = document.createElement('a');
      link.href = url!;
      link.download = `${project.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const audioUrl = project.audioUrl || audioResult?.audioUrl;
  const isAudioReady = !!audioUrl;

  return (
    <div className="flex-1 flex flex-col">
      {/* Navigation Bar */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileAudio className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Audio Generation</h2>
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
              onClick={() => updateProject({ id: project.id, updates: { phase: 2 } })}
              data-testid="button-back-to-script"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Script
            </Button>
            {isAudioReady && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateWithNewSettings}
                disabled={isGeneratingAudio}
                data-testid="button-regenerate-audio"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Regenerate Audio
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Enhanced Audio Generation with Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Headphones className="w-5 h-5" />
                  <span>Enhanced Audio Production</span>
                </div>
                {project.audioUrl && (
                  <Badge className="bg-success text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Audio Ready
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="script" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Script Editor</span>
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center space-x-2">
                    <Mic className="w-4 h-4" />
                    <span>Voice Settings</span>
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center space-x-2">
                    <Headphones className="w-4 h-4" />
                    <span>Audio Player</span>
                  </TabsTrigger>
                </TabsList>

                {/* Script Preview Tab */}
                <TabsContent value="script" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Script Preview
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProject({ id: project.id, updates: { phase: 2 } })}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Script
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {project.scriptContent || "No script content available. Go back to Script Generation to create your script."}
                          </pre>
                        </div>
                        
                        {project.scriptContent && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Word Count:</span>
                                <span className="font-medium">{project.scriptContent.split(/\s+/).length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Estimated Duration:</span>
                                <span className="font-medium">{Math.round((project.scriptContent.split(/\s+/).length / 150) * 60)}s</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Paragraphs:</span>
                                <span className="font-medium">{project.scriptContent.split('\n\n').length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Characters:</span>
                                <span className="font-medium">{project.scriptContent.length}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Voice Customization Tab */}
                <TabsContent value="voice" className="space-y-4">
                  <AdvancedVoiceCustomization
                    currentSettings={voiceSettings}
                    onSettingsChange={setVoiceSettings}
                    onPreview={handleVoicePreview}
                  />
                </TabsContent>

                {/* Audio Player Tab */}
                <TabsContent value="audio" className="space-y-4">
                  {!project.audioUrl && !isGeneratingAudio && (
                    <div className="text-center py-12 space-y-4">
                      <FileAudio className="w-16 h-16 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Ready to Generate Audio</h3>
                        <p className="text-muted-foreground mb-6">
                          Your script and voice settings are configured. Generate your podcast audio now!
                        </p>
                        {project.scriptContent && (
                          <div className="inline-flex items-center space-x-4 text-sm text-muted-foreground mb-6">
                            <span>📝 {project.scriptContent.split(/\s+/).length} words</span>
                            <span>⏱️ ~{Math.round((project.scriptContent.split(/\s+/).length / 150) * 60)}s</span>
                          </div>
                        )}
                        <Button
                          onClick={handleGenerateAudio}
                          disabled={isGeneratingAudio || !project.scriptContent?.trim()}
                          size="lg"
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Play className="w-5 h-5 mr-2" />
                          Generate Audio
                        </Button>
                      </div>
                    </div>
                  )}

                  {isGeneratingAudio && (
                    <div className="text-center py-12 space-y-4">
                      <LoadingState 
                        isLoading={true}
                        loadingText="Creating your enhanced podcast audio..."
                        size="lg"
                        className="justify-center"
                      />
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>• Applying voice personality: {voiceSettings.personality}</p>
                        <p>• Processing {project.scriptContent?.split(' ').length || 0} words</p>
                        <p>• Optimizing audio quality</p>
                      </div>
                    </div>
                  )}

                  {project.audioUrl && (
                    <div className="space-y-6">
                      <EnhancedAudioPlayer
                        audioUrl={project.audioUrl}
                        title={project.title || "Podcast Episode"}
                        transcript={project.scriptContent || undefined}
                      />
                      
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          variant="outline"
                          onClick={handleGenerateAudio}
                          disabled={isGeneratingAudio}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerate Audio
                        </Button>
                        
                        <Button
                          onClick={() => window.location.href = "/"}
                          className="bg-success hover:bg-success/90"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Project
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audio Preview Modal */}
      {showPreviewModal && audioUrl && (
        <AudioPreviewModal
          audioUrl={audioUrl}
          title={project.title}
          onClose={() => setShowPreviewModal(false)}
          onRegenerateSegment={handleGenerateAudio}
          isRegenerating={isGeneratingAudio}
        />
      )}
    </div>
  );
}
