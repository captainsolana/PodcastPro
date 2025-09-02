import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Lightbulb, 
  RefreshCw, 
  Check, 
  X,
  Zap,
  Target,
  TrendingUp,
  Sparkles,
  ChevronRight,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AISuggestion {
  id?: string;
  type: string;
  suggestion: string;
  targetSection: string;
  reasoning?: string;
  priority?: 'high' | 'medium' | 'low';
  category?: 'structure' | 'engagement' | 'content' | 'flow';
  appliedChange?: string; // The actual text replacement to make
}

interface EnhancedAIInsightsProps {
  suggestions: AISuggestion[];
  onApplySuggestion: (suggestion: AISuggestion) => Promise<void>;
  onGenerateSuggestions: () => void;
  isGeneratingSuggestions: boolean;
  scriptContent?: string;
  className?: string;
}

export function EnhancedAIInsights({ 
  suggestions, 
  onApplySuggestion, 
  onGenerateSuggestions,
  isGeneratingSuggestions,
  scriptContent,
  className 
}: EnhancedAIInsightsProps) {
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApplySuggestion = async (suggestion: AISuggestion) => {
    if (!suggestion.id) return;

    setApplyingId(suggestion.id);
    try {
      await onApplySuggestion(suggestion);
      setAppliedSuggestions(prev => {
        const newSet = new Set(prev);
        newSet.add(suggestion.id!);
        return newSet;
      });
      toast({
        title: "Suggestion Applied",
        description: `${suggestion.type} improvement has been applied to your script.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplyingId(null);
    }
  };

  const getPriorityColor = (priority: string = 'medium') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string = 'content') => {
    switch (category) {
      case 'structure': return Target;
      case 'engagement': return Zap;
      case 'content': return Lightbulb;
      case 'flow': return TrendingUp;
      default: return Sparkles;
    }
  };

  const hasSuggestions = suggestions && suggestions.length > 0;
  const appliedCount = appliedSuggestions.size;
  const totalCount = suggestions?.length || 0;

  return (
    <Card className={cn("enhanced-ai-insights", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="text-white w-4 h-4" />
            </div>
            <CardTitle className="text-lg">AI Insights</CardTitle>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          </div>
          {totalCount > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {appliedCount}/{totalCount} applied
              </Badge>
              {appliedCount === totalCount && (
                <CheckCircle className="w-4 h-4 text-success" />
              )}
            </div>
          )}
        </div>
        
        {hasSuggestions && (
          <p className="text-sm text-muted-foreground">
            I've analyzed your script and found ways to improve flow, engagement, and clarity.
          </p>
        )}
      </CardHeader>

      <CardContent>
        {!hasSuggestions ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-medium text-sm mb-2">No AI insights generated yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI suggestions to improve your script flow and engagement.
            </p>
            <Button
              onClick={onGenerateSuggestions}
              disabled={!scriptContent || isGeneratingSuggestions}
              size="sm"
            >
              {isGeneratingSuggestions ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Get AI Insights
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress indicator */}
            {totalCount > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Improvement Progress</span>
                  <span>{appliedCount} of {totalCount} applied</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(appliedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <ScrollArea className="max-h-[400px]">
              <div className="space-y-3 pr-4">
                {suggestions.map((suggestion, index) => {
                  const suggestionId = suggestion.id || `suggestion-${index}`;
                  const isApplied = appliedSuggestions.has(suggestionId);
                  const isApplying = applyingId === suggestionId;
                  const CategoryIcon = getCategoryIcon(suggestion.category);

                  return (
                    <div 
                      key={suggestionId}
                      className={cn(
                        "border rounded-lg p-4 transition-all duration-200",
                        isApplied ? "bg-success/5 border-success/20" : "bg-card border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            isApplied ? "bg-success/20" : "bg-primary/10"
                          )}>
                            {isApplied ? (
                              <Check className="w-4 h-4 text-success" />
                            ) : (
                              <CategoryIcon className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="font-medium text-sm">{suggestion.type}</h5>
                              {suggestion.priority && (
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getPriorityColor(suggestion.priority))}
                                >
                                  {suggestion.priority}
                                </Badge>
                              )}
                              {suggestion.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {suggestion.category}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-foreground mb-2 leading-relaxed">
                              {suggestion.suggestion}
                            </p>
                            
                            {suggestion.reasoning && (
                              <p className="text-xs text-muted-foreground mb-2">
                                <strong>Why:</strong> {suggestion.reasoning}
                              </p>
                            )}
                            
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Target className="w-3 h-3 mr-1" />
                              Target: {suggestion.targetSection}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center space-x-2">
                          {isApplied && (
                            <div className="flex items-center space-x-1 text-xs text-success">
                              <CheckCircle className="w-3 h-3" />
                              <span>Applied successfully</span>
                            </div>
                          )}
                        </div>
                        
                        {!isApplied && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApplySuggestion({ ...suggestion, id: suggestionId })}
                            disabled={isApplying}
                            className="h-8 text-xs"
                          >
                            {isApplying ? (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <ChevronRight className="w-3 h-3 mr-1" />
                                Apply Change
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Generate More Suggestions */}
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Want more insights? Regenerate for fresh suggestions.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateSuggestions}
                disabled={isGeneratingSuggestions}
                className="h-8 text-xs"
              >
                {isGeneratingSuggestions ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh Insights
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
