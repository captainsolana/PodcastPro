import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import WaveformVisualizer from "@/components/audio/waveform-visualizer";
import AudioPreviewModal from "@/components/audio/audio-preview-modal";
import { useProject } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { Play, Download, RefreshCw, Volume2, CheckCircle, FileAudio } from "lucide-react";
import type { Project, VoiceSettings } from "@shared/schema";

interface AudioGenerationProps {
  project: Project;
}

export default function AudioGeneration({ project }: AudioGenerationProps) {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(
    project.voiceSettings as VoiceSettings || { model: "nova", speed: 1.0 }
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const { 
    updateProject,
    generateAudio,
    isGeneratingAudio,
    audioResult
  } = useProject(project.id);
  const { toast } = useToast();

  const handleGenerateAudio = async () => {
    if (!project.scriptContent) {
      toast({
        title: "Error",
        description: "No script content available. Please generate a script first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateAudio({
        scriptContent: project.scriptContent,
        voiceSettings,
      });
      
      toast({
        title: "Audio Generated",
        description: "Your podcast audio has been created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate audio. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Audio Generation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileAudio className="w-5 h-5" />
                <span>Audio Generation</span>
              </div>
              {isAudioReady && (
                <Badge className="bg-success text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isAudioReady && !isGeneratingAudio && (
              <div className="text-center py-8">
                <FileAudio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ready to Generate Audio</h3>
                <p className="text-muted-foreground mb-6">
                  Convert your script to high-quality audio using AI voice synthesis.
                </p>
                <Button 
                  onClick={handleGenerateAudio}
                  size="lg"
                  data-testid="button-generate-audio"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Generate Audio
                </Button>
              </div>
            )}

            {isGeneratingAudio && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
                <h3 className="text-lg font-semibold mb-2">Generating Audio</h3>
                <p className="text-muted-foreground">
                  AI is converting your script to audio. This may take a few minutes...
                </p>
              </div>
            )}

            {isAudioReady && (
              <div className="space-y-6">
                {/* Audio Player */}
                <div className="bg-muted/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Duration: {Math.floor((audioResult?.duration || 0) / 60)}:{String((audioResult?.duration || 0) % 60).padStart(2, '0')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreviewModal(true)}
                        data-testid="button-preview-audio"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        onClick={handleDownload}
                        size="sm"
                        data-testid="button-download-audio"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Waveform Visualization */}
                  <WaveformVisualizer audioUrl={audioUrl} />
                </div>

                {/* Generation Actions */}
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio}
                    data-testid="button-regenerate-audio"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Audio
                  </Button>
                  
                  <Button
                    onClick={() => window.location.href = "/"}
                    className="bg-success hover:bg-success/90"
                    data-testid="button-complete-project"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Project
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Voice Model
                </label>
                <Select
                  value={voiceSettings.model}
                  onValueChange={(value) => setVoiceSettings({ ...voiceSettings, model: value as any })}
                  data-testid="select-voice-model"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nova">Nova (Balanced)</SelectItem>
                    <SelectItem value="shimmer">Shimmer (Warm)</SelectItem>
                    <SelectItem value="alloy">Alloy (Professional)</SelectItem>
                    <SelectItem value="coral">Coral (Energetic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Speech Speed: {voiceSettings.speed}x
                </label>
                <Slider
                  value={[voiceSettings.speed]}
                  onValueChange={([value]) => setVoiceSettings({ ...voiceSettings, speed: value })}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                  data-testid="slider-speech-speed"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleSaveSettings}
                className="w-full"
                data-testid="button-save-voice-settings"
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Script Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Script Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-background rounded-lg p-4 max-h-60 overflow-y-auto border script-editor text-sm">
                {project.scriptContent ? (
                  <div className="whitespace-pre-wrap">{project.scriptContent.substring(0, 500)}...</div>
                ) : (
                  <p className="text-muted-foreground">No script content available</p>
                )}
              </div>
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
