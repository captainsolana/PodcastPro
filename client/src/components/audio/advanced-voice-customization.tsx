import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Pause, 
  Volume2, 
  Heart, 
  Zap, 
  Coffee, 
  Shield, 
  Users, 
  BookOpen,
  Mic,
  Settings,
  Sparkles
} from "lucide-react";

export interface VoicePersonality {
  id: string;
  name: string;
  description: string;
  icon: typeof Heart;
  baseModel: string;
  characteristics: {
    warmth: number;      // 0-100
    energy: number;      // 0-100
    authority: number;   // 0-100
    friendliness: number; // 0-100
  };
  sampleText: string;
  color: string;
}

export interface AdvancedVoiceSettings {
  personality: string;
  model: string;
  speed: number;
  pitch: number;         // -20 to +20 semitones
  emphasis: number;      // 0-100
  pause_length: number;  // 0.5-3 seconds
  breathing: boolean;
  emotions: {
    enthusiasm: number;  // 0-100
    calmness: number;   // 0-100
    confidence: number; // 0-100
  };
  pronunciation: Record<string, string>; // word: pronunciation
}

interface AdvancedVoiceCustomizationProps {
  currentSettings: AdvancedVoiceSettings;
  onSettingsChange: (settings: AdvancedVoiceSettings) => void;
  onPreview: (settings: AdvancedVoiceSettings, text: string) => Promise<string>;
  className?: string;
}

const VOICE_PERSONALITIES: VoicePersonality[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Authoritative and clear, perfect for business content and formal presentations",
    icon: Shield,
    baseModel: "onyx",
    characteristics: { warmth: 30, energy: 50, authority: 90, friendliness: 40 },
    sampleText: "Welcome to today's business briefing. Let's explore the key market trends.",
    color: "#3B82F6"
  },
  {
    id: "conversational",
    name: "Conversational",
    description: "Warm and approachable, ideal for casual discussions and storytelling",
    icon: Heart,
    baseModel: "nova",
    characteristics: { warmth: 85, energy: 60, authority: 50, friendliness: 90 },
    sampleText: "Hey there! Let me tell you about this fascinating story I came across.",
    color: "#10B981"
  },
  {
    id: "energetic",
    name: "Energetic",
    description: "Dynamic and enthusiastic, great for motivational and exciting content",
    icon: Zap,
    baseModel: "alloy",
    characteristics: { warmth: 60, energy: 95, authority: 70, friendliness: 80 },
    sampleText: "Get ready for an amazing journey through innovation and breakthrough discoveries!",
    color: "#F59E0B"
  },
  {
    id: "calm",
    name: "Calm & Soothing",
    description: "Gentle and peaceful, perfect for relaxation and educational content",
    icon: Coffee,
    baseModel: "shimmer",
    characteristics: { warmth: 90, energy: 20, authority: 40, friendliness: 70 },
    sampleText: "Take a moment to breathe deeply as we explore this topic together.",
    color: "#8B5CF6"
  },
  {
    id: "storyteller",
    name: "Storyteller",
    description: "Expressive and engaging, designed for narratives and dramatic content",
    icon: BookOpen,
    baseModel: "fable",
    characteristics: { warmth: 75, energy: 80, authority: 60, friendliness: 85 },
    sampleText: "Once upon a time, in a world not so different from ours, something extraordinary happened.",
    color: "#EF4444"
  },
  {
    id: "interviewer",
    name: "Interviewer",
    description: "Curious and engaging, perfect for Q&A sessions and interactive content",
    icon: Users,
    baseModel: "echo",
    characteristics: { warmth: 70, energy: 65, authority: 75, friendliness: 85 },
    sampleText: "That's a fascinating point. Can you tell us more about how you discovered this?",
    color: "#06B6D4"
  }
];

export default function AdvancedVoiceCustomization({
  currentSettings,
  onSettingsChange,
  onPreview,
  className = ""
}: AdvancedVoiceCustomizationProps) {
  const [activePersonality, setActivePersonality] = useState<VoicePersonality>(
    VOICE_PERSONALITIES.find(p => p.id === currentSettings.personality) || VOICE_PERSONALITIES[0]
  );
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [customText, setCustomText] = useState("This is a sample of how your podcast will sound with these voice settings.");
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Update settings when personality changes
  useEffect(() => {
    const newSettings = {
      ...currentSettings,
      personality: activePersonality.id,
      model: activePersonality.baseModel,
    };
    onSettingsChange(newSettings);
  }, [activePersonality]);

  const handlePreview = async (text?: string) => {
    const textToPreview = text || activePersonality.sampleText;
    setIsPreviewPlaying(true);
    
    try {
      const audioUrl = await onPreview(currentSettings, textToPreview);
      setPreviewAudio(audioUrl);
      
      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Preview failed:', error);
      toast({
        title: "Preview Failed",
        description: "Unable to generate voice preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPreviewPlaying(false);
    }
  };

  const handleSliderChange = (key: keyof AdvancedVoiceSettings, value: number[]) => {
    const newSettings = { ...currentSettings, [key]: value[0] };
    onSettingsChange(newSettings);
  };

  const handleEmotionChange = (emotion: string, value: number[]) => {
    const newSettings = {
      ...currentSettings,
      emotions: {
        ...currentSettings.emotions,
        [emotion]: value[0]
      }
    };
    onSettingsChange(newSettings);
  };

  const PersonalityCharacteristics = ({ personality }: { personality: VoicePersonality }) => (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(personality.characteristics).map(([trait, value]) => (
        <div key={trait} className="space-y-1">
          <div className="flex justify-between text-xs">
            <Label className="capitalize">{trait}</Label>
            <span className="text-muted-foreground">{value}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${value}%`,
                backgroundColor: personality.color 
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <audio ref={audioRef} onEnded={() => setIsPreviewPlaying(false)} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Voice Personality</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VOICE_PERSONALITIES.map((personality) => {
              const Icon = personality.icon;
              const isActive = activePersonality.id === personality.id;
              
              return (
                <Card 
                  key={personality.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setActivePersonality(personality)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${personality.color}20` }}
                      >
                        <Icon 
                          className="w-5 h-5" 
                          style={{ color: personality.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{personality.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {personality.description}
                        </p>
                        {isActive && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="mt-4 space-y-3">
                        <PersonalityCharacteristics personality={personality} />
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview();
                          }}
                          disabled={isPreviewPlaying}
                        >
                          {isPreviewPlaying ? (
                            <>
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-2" />
                              Preview
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Advanced Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="speech" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="speech">Speech</TabsTrigger>
              <TabsTrigger value="emotions">Emotions</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="speech" className="space-y-6">
              {/* Speed Control */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Speaking Speed</Label>
                  <Badge variant="secondary">{currentSettings.speed}x</Badge>
                </div>
                <Slider
                  value={[currentSettings.speed]}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  onValueChange={(value) => handleSliderChange('speed', value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Slow (0.5x)</span>
                  <span>Normal (1x)</span>
                  <span>Fast (2x)</span>
                </div>
              </div>

              <Separator />

              {/* Pitch Control */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Pitch Adjustment</Label>
                  <Badge variant="secondary">
                    {currentSettings.pitch > 0 ? '+' : ''}{currentSettings.pitch} semitones
                  </Badge>
                </div>
                <Slider
                  value={[currentSettings.pitch]}
                  min={-20}
                  max={20}
                  step={1}
                  onValueChange={(value) => handleSliderChange('pitch', value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Lower (-20)</span>
                  <span>Natural (0)</span>
                  <span>Higher (+20)</span>
                </div>
              </div>

              <Separator />

              {/* Emphasis Control */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Speech Emphasis</Label>
                  <Badge variant="secondary">{currentSettings.emphasis}%</Badge>
                </div>
                <Slider
                  value={[currentSettings.emphasis]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => handleSliderChange('emphasis', value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Flat</span>
                  <span>Moderate</span>
                  <span>Dramatic</span>
                </div>
              </div>

              <Separator />

              {/* Pause Length */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Pause Duration</Label>
                  <Badge variant="secondary">{currentSettings.pause_length}s</Badge>
                </div>
                <Slider
                  value={[currentSettings.pause_length]}
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  onValueChange={(value) => handleSliderChange('pause_length', value)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Quick (0.5s)</span>
                  <span>Natural (1.5s)</span>
                  <span>Dramatic (3s)</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emotions" className="space-y-6">
              {/* Enthusiasm */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-orange-500" />
                    <span>Enthusiasm</span>
                  </Label>
                  <Badge variant="secondary">{currentSettings.emotions.enthusiasm}%</Badge>
                </div>
                <Slider
                  value={[currentSettings.emotions.enthusiasm]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => handleEmotionChange('enthusiasm', value)}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Calmness */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="flex items-center space-x-2">
                    <Coffee className="w-4 h-4 text-blue-500" />
                    <span>Calmness</span>
                  </Label>
                  <Badge variant="secondary">{currentSettings.emotions.calmness}%</Badge>
                </div>
                <Slider
                  value={[currentSettings.emotions.calmness]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => handleEmotionChange('calmness', value)}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Confidence</span>
                  </Label>
                  <Badge variant="secondary">{currentSettings.emotions.confidence}%</Badge>
                </div>
                <Slider
                  value={[currentSettings.emotions.confidence]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => handleEmotionChange('confidence', value)}
                  className="w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              <div className="space-y-4">
                <Label>Custom Preview Text</Label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  placeholder="Enter text to preview your voice settings..."
                />
                <Button
                  onClick={() => handlePreview(customText)}
                  disabled={isPreviewPlaying || !customText.trim()}
                  className="w-full"
                >
                  {isPreviewPlaying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Preview...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 mr-2" />
                      Preview Custom Text
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
