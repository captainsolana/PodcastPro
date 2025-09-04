import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { AppIcon } from "@/components/ui/icon-registry";
import type { Project, ScriptAnalytics, VoiceSettings } from "@shared/schema";

interface ScriptToolsPanelProps {
  project: Project;
  scriptContent: string;
  analytics?: ScriptAnalytics;
  suggestions?: any[];
  onSave: () => void;
  onGenerateSuggestions: () => void;
  onApplySuggestion?: (suggestion: any) => void;
  isGeneratingSuggestions: boolean;
}

export default function ScriptToolsPanel({
  project,
  scriptContent,
  analytics,
  suggestions,
  onSave,
  onGenerateSuggestions,
  onApplySuggestion,
  isGeneratingSuggestions,
}: ScriptToolsPanelProps) {
  const voiceSettings = project.voiceSettings as VoiceSettings || { model: "nova", speed: 1.0 };

  // Calculate analytics from script content if not provided
  const calculatedAnalytics = analytics || {
    wordCount: scriptContent.split(/\s+/).filter(word => word.length > 0).length,
    readingTime: Math.ceil(scriptContent.split(/\s+/).length / 200), // ~200 WPM reading
    speechTime: Math.ceil(scriptContent.split(/\s+/).length / 150 * 60), // ~150 WPM speech in seconds
    pauseCount: (scriptContent.match(/\[.*?pause.*?\]/gi) || []).length,
  };

  return (
    <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto">
      <div className="space-y-6">
        {/* AI Assistant */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <AppIcon name="bot" className="text-white w-3 h-3" />
              </div>
              <h4 className="font-semibold text-sm">AI Assistant</h4>
              <div className="w-2 h-2 bg-success rounded-full animate-thinking"></div>
            </div>
            
            {suggestions && suggestions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-3">
                  I've analyzed your script and have suggestions to improve flow and engagement.
                </p>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <div
                    key={suggestion.id || index}
                    className="border rounded-lg p-3 space-y-2 bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-xs text-primary">{suggestion.type}</h5>
                      {suggestion.priority && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium border ${
                          suggestion.priority === 'high' ? 'bg-[var(--semantic-critical)]/15 text-[var(--semantic-critical)] border-[var(--semantic-critical)]/40' :
                          suggestion.priority === 'medium' ? 'bg-[var(--semantic-warning)]/15 text-[var(--semantic-warning)] border-[var(--semantic-warning)]/40' :
                          'bg-[var(--semantic-success)]/15 text-[var(--semantic-success)] border-[var(--semantic-success)]/40'
                        }`}>
                          {suggestion.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {suggestion.suggestion}
                    </p>
                    {suggestion.targetSection && (
                      <p className="text-xs text-muted-foreground">
                        Target: {suggestion.targetSection}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-7"
                      onClick={() => {
                        if (onApplySuggestion) {
                          onApplySuggestion(suggestion);
                        } else {
                          console.log('Apply suggestion:', suggestion);
                        }
                      }}
                    >
                      <span className="text-primary mr-1">↗</span>
                      Apply Suggestion
                    </Button>
                  </div>
                ))}
                {suggestions.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{suggestions.length - 3} more suggestions in AI Insights tab
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-3">
                  Get AI suggestions to improve your script flow and engagement.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onGenerateSuggestions}
                  disabled={isGeneratingSuggestions || !scriptContent}
                  className="w-full"
                  data-testid="button-get-ai-suggestions"
                >
                  {isGeneratingSuggestions ? (
                    <>
                      <AppIcon name="refresh" className="w-3 h-3 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <AppIcon name="bot" className="w-3 h-3 mr-2" />
                      Get Suggestions
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Script Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <AppIcon name="stats" className="w-4 h-4" />
              <span>Script Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Word Count</span>
              <span className="font-medium" data-testid="text-word-count">{calculatedAnalytics.wordCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Reading Time</span>
              <span className="font-medium" data-testid="text-reading-time">{calculatedAnalytics.readingTime} min</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Speech Time</span>
              <span className="font-medium" data-testid="text-speech-time">{Math.floor(calculatedAnalytics.speechTime / 60)} min</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Pauses</span>
              <span className="font-medium text-success" data-testid="text-pause-count">{calculatedAnalytics.pauseCount}</span>
            </div>
          </CardContent>
        </Card>

        {/* Voice Settings Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Voice Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Voice Model</label>
              <div className="mt-1">
                <Badge variant="soft" className="text-xs">
                  {voiceSettings.model} (OpenAI TTS)
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Speed</label>
              <div className="mt-1">
                <Badge variant="outline" className="text-xs">
                  {voiceSettings.speed}x
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button
            onClick={onSave}
            className="w-full"
            variant="outline"
            data-testid="button-save-draft"
          >
            <AppIcon name="save" className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
