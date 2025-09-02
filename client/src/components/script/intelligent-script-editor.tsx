import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Users,
  Lightbulb,
  Search,
  BarChart,
  Eye,
  Mic,
  Sparkles,
  FileText,
  Zap
} from "lucide-react";

export interface ScriptAnalysis {
  readability: {
    fleschKincaidGrade: number;
    fleschReadingEase: number;
    complexity: 'Simple' | 'Average' | 'Complex' | 'Very Complex';
  };
  engagement: {
    score: number; // 0-100
    hooks: number;
    questions: number;
    stories: number;
    statistics: number;
  };
  timing: {
    wordCount: number;
    estimatedDuration: number; // minutes
    speakingPace: number; // words per minute
    pauseCount: number;
  };
  seo: {
    score: number; // 0-100
    keywords: string[];
    titleSuggestions: string[];
    descriptionSuggestion: string;
  };
  improvements: Suggestion[];
}

export interface Suggestion {
  id: string;
  type: 'grammar' | 'style' | 'engagement' | 'seo' | 'timing' | 'structure';
  severity: 'low' | 'medium' | 'high';
  message: string;
  line?: number;
  replacement?: string;
  explanation?: string;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  structure: string[];
  example: string;
  category: 'interview' | 'narrative' | 'educational' | 'marketing' | 'news';
  duration: number; // minutes
}

interface IntelligentScriptEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onAnalysisChange?: (analysis: ScriptAnalysis) => void;
  className?: string;
}

const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: "interview",
    name: "Interview Format",
    description: "Structured interview with questions and follow-ups",
    structure: [
      "Introduction of guest and topic",
      "Background questions",
      "Deep-dive questions with follow-ups",
      "Rapid-fire personal questions",
      "Closing thoughts and contact info"
    ],
    example: `Welcome to [Podcast Name]. I'm [Host Name], and today I'm joined by [Guest Name], who is [Guest Background]. 

[Guest Name], let's start with your journey. How did you get into [Field]?

[Follow-up questions based on response]

Before we wrap up, I have a few quick questions...`,
    category: "interview",
    duration: 30
  },
  {
    id: "narrative",
    name: "Narrative Storytelling",
    description: "Story-driven format with dramatic structure",
    structure: [
      "Hook - Start with intrigue",
      "Setting - Establish context",
      "Rising action - Build tension",
      "Climax - Key revelation or turning point",
      "Resolution - Wrap up with insights"
    ],
    example: `[Hook - Something intriguing happened]

But let me start from the beginning...

[Set the scene, introduce characters]

What happened next changed everything...`,
    category: "narrative",
    duration: 20
  },
  {
    id: "educational",
    name: "Educational Deep-Dive",
    description: "Teaching format with clear learning objectives",
    structure: [
      "Learning objectives overview",
      "Foundation concepts",
      "Detailed explanation with examples",
      "Common misconceptions",
      "Practical applications",
      "Key takeaways summary"
    ],
    example: `Today we're going to explore [Topic]. By the end of this episode, you'll understand:
- [Key point 1]
- [Key point 2]
- [Key point 3]

Let's start with the basics...`,
    category: "educational",
    duration: 25
  },
  {
    id: "marketing",
    name: "Marketing/Promotional",
    description: "Engaging format for product or service promotion",
    structure: [
      "Problem identification",
      "Personal story or case study",
      "Solution introduction",
      "Benefits and social proof",
      "Clear call to action"
    ],
    example: `Have you ever struggled with [Problem]? I used to face this exact issue until I discovered...

Let me tell you about [Case Study/Story]...

Here's what changed everything...`,
    category: "marketing",
    duration: 15
  }
];

export default function IntelligentScriptEditor({
  content,
  onContentChange,
  onAnalysisChange,
  className = ""
}: IntelligentScriptEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [focusedSuggestion, setFocusedSuggestion] = useState<Suggestion | null>(null);
  const { toast } = useToast();

  // Real-time analysis (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim()) {
        analyzeScript(content);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [content]);

  const analyzeScript = useCallback(async (scriptContent: string) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate API call for script analysis
      const analysisResult = await performScriptAnalysis(scriptContent);
      setAnalysis(analysisResult);
      onAnalysisChange?.(analysisResult);
    } catch (error) {
      console.error('Script analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisChange, toast]);

  // Mock analysis function (replace with actual API call)
  const performScriptAnalysis = async (scriptContent: string): Promise<ScriptAnalysis> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const words = scriptContent.split(/\s+/).filter(w => w.length > 0);
    const sentences = scriptContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = scriptContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const pauseMarkers = (scriptContent.match(/\[pause\]/g) || []).length;

    // Calculate basic metrics
    const wordCount = words.length;
    const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
    const speakingPace = 150; // Average words per minute
    const estimatedDuration = wordCount / speakingPace;

    // Readability scoring
    const fleschKincaidGrade = Math.max(0, 0.39 * avgWordsPerSentence + 11.8 * (syllableCount(scriptContent) / wordCount) - 15.59);
    const fleschReadingEase = Math.max(0, 206.835 - 1.015 * avgWordsPerSentence - 84.6 * (syllableCount(scriptContent) / wordCount));

    let complexity: ScriptAnalysis['readability']['complexity'] = 'Average';
    if (fleschKincaidGrade < 6) complexity = 'Simple';
    else if (fleschKincaidGrade > 12) complexity = 'Complex';
    else if (fleschKincaidGrade > 16) complexity = 'Very Complex';

    // Engagement scoring
    const hooks = (scriptContent.match(/\b(imagine|picture this|what if|here's the thing)\b/gi) || []).length;
    const questions = (scriptContent.match(/\?/g) || []).length;
    const stories = (scriptContent.match(/\b(story|tale|example|case)\b/gi) || []).length;
    const statistics = (scriptContent.match(/\b\d+(\.\d+)?%?\b/g) || []).length;
    
    const engagementScore = Math.min(100, (hooks * 10) + (questions * 5) + (stories * 8) + (statistics * 6));

    // SEO analysis
    const commonWords = extractKeywords(scriptContent);
    const seoScore = Math.min(100, (commonWords.length * 5) + (wordCount > 1000 ? 20 : 0));

    // Generate suggestions
    const suggestions: Suggestion[] = [];
    
    if (fleschKincaidGrade > 12) {
      suggestions.push({
        id: 'readability-complex',
        type: 'style',
        severity: 'medium',
        message: 'Content may be too complex for general audience',
        explanation: 'Consider breaking down complex sentences and using simpler vocabulary.'
      });
    }

    if (engagementScore < 30) {
      suggestions.push({
        id: 'engagement-low',
        type: 'engagement',
        severity: 'high',
        message: 'Low engagement score - add more hooks, questions, or stories',
        explanation: 'Engaging content includes rhetorical questions, relatable examples, and attention-grabbing phrases.'
      });
    }

    if (estimatedDuration < 5) {
      suggestions.push({
        id: 'duration-short',
        type: 'timing',
        severity: 'low',
        message: 'Script may be too short for a podcast episode',
        explanation: 'Most podcast episodes are 15-60 minutes long. Consider expanding on key points.'
      });
    }

    return {
      readability: {
        fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
        fleschReadingEase: Math.round(fleschReadingEase),
        complexity
      },
      engagement: {
        score: engagementScore,
        hooks,
        questions,
        stories,
        statistics
      },
      timing: {
        wordCount,
        estimatedDuration: Math.round(estimatedDuration * 10) / 10,
        speakingPace,
        pauseCount: pauseMarkers
      },
      seo: {
        score: seoScore,
        keywords: commonWords.slice(0, 10),
        titleSuggestions: generateTitleSuggestions(scriptContent),
        descriptionSuggestion: generateDescription(scriptContent)
      },
      improvements: suggestions
    };
  };

  // Helper functions
  const syllableCount = (text: string): number => {
    return text.toLowerCase().replace(/[^a-z]/g, '').replace(/[^aeiouy]+/g, ' ').trim().split(' ').length;
  };

  const extractKeywords = (text: string): string[] => {
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const frequency: Record<string, number> = {};
    
    words.forEach(word => {
      if (!['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'day'].includes(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  };

  const generateTitleSuggestions = (text: string): string[] => {
    const keywords = extractKeywords(text).slice(0, 3);
    return [
      `The Ultimate Guide to ${keywords[0] || 'Your Topic'}`,
      `How ${keywords[1] || 'This'} Changed Everything`,
      `The ${keywords[0] || 'Hidden'} Truth About ${keywords[1] || 'Success'}`
    ];
  };

  const generateDescription = (text: string): string => {
    const firstSentence = text.split(/[.!?]/)[0]?.trim();
    return firstSentence ? `${firstSentence}. Discover more insights and actionable tips in this episode.` : 
           'An engaging podcast episode packed with insights and actionable advice.';
  };

  const applyTemplate = (template: ScriptTemplate) => {
    onContentChange(template.example);
    setSelectedTemplate(template.id);
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied to your script.`,
    });
  };

  const applySuggestion = (suggestion: Suggestion) => {
    if (suggestion.replacement) {
      // Apply the suggestion replacement
      // This is a simplified implementation
      onContentChange(content);
      toast({
        title: "Suggestion Applied",
        description: suggestion.message,
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Simple': return "text-green-600";
      case 'Average': return "text-blue-600";
      case 'Complex': return "text-yellow-600";
      case 'Very Complex': return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Script Editor</span>
              </div>
              {isAnalyzing && (
                <Badge variant="secondary" className="animate-pulse">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Analyzing...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Template Selector */}
              <div className="flex items-center space-x-4">
                <Label>Quick Start:</Label>
                <Select 
                  value={selectedTemplate} 
                  onValueChange={(value) => {
                    const template = SCRIPT_TEMPLATES.find(t => t.id === value);
                    if (template) {
                      applyTemplate(template);
                    }
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose template" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCRIPT_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const template = SCRIPT_TEMPLATES.find(t => t.id === selectedTemplate);
                      if (template) applyTemplate(template);
                    }}
                  >
                    Apply Template
                  </Button>
                )}
              </div>

              {/* Main Textarea */}
              <div className="relative">
                <Textarea
                  value={content}
                  onChange={(e) => onContentChange(e.target.value)}
                  placeholder="Start writing your podcast script here... 

Tip: Use [pause] markers for natural pauses in speech."
                  className="min-h-[400px] font-mono text-sm leading-relaxed"
                />
                
                {/* Word Count Overlay */}
                <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                  {content.split(/\s+/).filter(w => w.length > 0).length} words
                </div>
              </div>

              {/* Quick Stats */}
              {analysis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{analysis.timing.wordCount}</div>
                    <div className="text-xs text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{analysis.timing.estimatedDuration}m</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(analysis.engagement.score)}`}>
                      {analysis.engagement.score}%
                    </div>
                    <div className="text-xs text-muted-foreground">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getComplexityColor(analysis.readability.complexity)}`}>
                      {analysis.readability.complexity}
                    </div>
                    <div className="text-xs text-muted-foreground">Reading Level</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Panel */}
      <div className="space-y-4">
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart className="w-5 h-5" />
                <span>Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="suggestions">
                    Suggestions
                    {analysis.improvements.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {analysis.improvements.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {/* Engagement Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Engagement</span>
                      </span>
                      <span className={getScoreColor(analysis.engagement.score)}>
                        {analysis.engagement.score}%
                      </span>
                    </div>
                    <Progress value={analysis.engagement.score} className="h-2" />
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>Hooks: {analysis.engagement.hooks}</div>
                      <div>Questions: {analysis.engagement.questions}</div>
                      <div>Stories: {analysis.engagement.stories}</div>
                      <div>Stats: {analysis.engagement.statistics}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Readability */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>Readability</span>
                      </span>
                      <Badge variant="outline" className={getComplexityColor(analysis.readability.complexity)}>
                        {analysis.readability.complexity}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Grade Level: {analysis.readability.fleschKincaidGrade}</div>
                      <div>Reading Ease: {analysis.readability.fleschReadingEase}</div>
                    </div>
                  </div>

                  <Separator />

                  {/* SEO Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center space-x-1">
                        <Search className="w-4 h-4" />
                        <span>SEO</span>
                      </span>
                      <span className={getScoreColor(analysis.seo.score)}>
                        {analysis.seo.score}%
                      </span>
                    </div>
                    <Progress value={analysis.seo.score} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Keywords: {analysis.seo.keywords.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-3">
                  {analysis.improvements.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p>Great work! No major improvements needed.</p>
                    </div>
                  ) : (
                    analysis.improvements.map((suggestion) => (
                      <Alert key={suggestion.id} className="cursor-pointer hover:bg-muted/50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={suggestion.severity === 'high' ? 'destructive' : 
                                        suggestion.severity === 'medium' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {suggestion.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.severity}
                              </Badge>
                            </div>
                            <p className="text-sm">{suggestion.message}</p>
                            {suggestion.explanation && (
                              <p className="text-xs text-muted-foreground">
                                {suggestion.explanation}
                              </p>
                            )}
                            {suggestion.replacement && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => applySuggestion(suggestion)}
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Apply Fix
                              </Button>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Template Preview */}
        {selectedTemplate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Template Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const template = SCRIPT_TEMPLATES.find(t => t.id === selectedTemplate);
                if (!template) return null;
                
                return (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Structure:</Label>
                      <ul className="text-xs space-y-1">
                        {template.structure.map((item, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-muted-foreground">{index + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
