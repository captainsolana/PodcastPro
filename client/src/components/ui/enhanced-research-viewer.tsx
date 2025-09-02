import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  BarChart3, 
  List, 
  ExternalLink,
  Quote,
  TrendingUp,
  Clock,
  Target,
  Users,
  Lightbulb,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedResearchViewerProps {
  researchResult: {
    sources: Array<{ title: string; url: string; summary: string; fullContent?: string }>;
    keyPoints: string[];
    statistics: Array<{ fact: string; source: string }>;
    outline: string[];
    // Enhanced research data from improved integration
    structured?: {
      keyNarratives?: Array<{ narrative: string; context: string }>;
      humanImpactStories?: Array<{ story: string; impact: string }>;
      timelineEvents?: Array<{ event: string; date: string; significance: string }>;
      criticalStatistics?: Array<{ stat: string; context: string; significance: string }>;
      expertInsights?: Array<{ insight: string; expert: string; context: string }>;
      technicalConcepts?: Array<{ concept: string; explanation: string; relevance: string }>;
      compellingQuotes?: Array<{ quote: string; source: string; context: string }>;
      surprisingFacts?: Array<{ fact: string; why_surprising: string; relevance: string }>;
      futureImplications?: Array<{ implication: string; timeframe: string; probability: string }>;
    };
  };
  className?: string;
}

export function EnhancedResearchViewer({ researchResult, className }: EnhancedResearchViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'structured' | 'raw'>('structured');

  const tabs = [
    { id: 'structured', label: 'Enhanced Research', icon: Lightbulb },
    { id: 'overview', label: 'Key Points', icon: List },
    { id: 'raw', label: 'Full Content', icon: FileText }
  ];

  // Get structured research data
  const structured = researchResult.structured;
  const hasStructuredData = structured && Object.keys(structured).length > 0;

  // Calculate research richness metrics
  const totalDataPoints = (researchResult.keyPoints?.length || 0) + 
                          (researchResult.statistics?.length || 0) +
                          (structured?.keyNarratives?.length || 0) +
                          (structured?.expertInsights?.length || 0) +
                          (structured?.surprisingFacts?.length || 0);

  return (
    <Card className={cn("w-full enhanced-research-viewer", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Enhanced Research Analysis</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {totalDataPoints} data points
            </Badge>
            {hasStructuredData && (
              <Badge variant="default" className="text-xs bg-success text-success-foreground">
                Enhanced
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-4">
            <ScrollArea className={cn(
              "w-full transition-all duration-300",
              isExpanded ? "h-[600px]" : "h-[400px]"
            )}>

              {/* Enhanced Structured Research Tab */}
              <TabsContent value="structured" className="mt-0">
                {hasStructuredData ? (
                  <div className="space-y-6">
                    
                    {/* Key Narratives */}
                    {structured?.keyNarratives && structured.keyNarratives.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-600" />
                          Key Narratives ({structured.keyNarratives.length})
                        </h4>
                        <div className="space-y-3">
                          {structured.keyNarratives.map((item, index) => (
                            <div key={index} className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-500">
                              <p className="text-sm font-medium text-foreground mb-2">{item.narrative}</p>
                              <p className="text-xs text-muted-foreground">{item.context}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Human Impact Stories */}
                    {structured?.humanImpactStories && structured.humanImpactStories.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2 text-green-600" />
                          Human Impact Stories ({structured.humanImpactStories.length})
                        </h4>
                        <div className="space-y-3">
                          {structured.humanImpactStories.map((item, index) => (
                            <div key={index} className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-l-4 border-green-500">
                              <p className="text-sm font-medium text-foreground mb-2">{item.story}</p>
                              <p className="text-xs text-muted-foreground">Impact: {item.impact}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline Events */}
                    {structured?.timelineEvents && structured.timelineEvents.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-purple-600" />
                          Timeline Events ({structured.timelineEvents.length})
                        </h4>
                        <div className="space-y-3">
                          {structured.timelineEvents.map((item, index) => (
                            <div key={index} className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border-l-4 border-purple-500">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-foreground">{item.event}</p>
                                <Badge variant="outline" className="text-xs">{item.date}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{item.significance}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Critical Statistics */}
                    {structured?.criticalStatistics && structured.criticalStatistics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2 text-orange-600" />
                          Critical Statistics ({structured.criticalStatistics.length})
                        </h4>
                        <div className="space-y-3">
                          {structured.criticalStatistics.map((item, index) => (
                            <div key={index} className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border-l-4 border-orange-500">
                              <p className="text-sm font-medium text-foreground mb-2">{item.stat}</p>
                              <p className="text-xs text-muted-foreground mb-1">Context: {item.context}</p>
                              <p className="text-xs text-muted-foreground">Significance: {item.significance}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expert Insights */}
                    {structured?.expertInsights && structured.expertInsights.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-indigo-600" />
                          Expert Insights ({structured.expertInsights.length})
                        </h4>
                        <div className="space-y-3">
                          {structured.expertInsights.map((item, index) => (
                            <div key={index} className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg border-l-4 border-indigo-500">
                              <p className="text-sm font-medium text-foreground mb-2">{item.insight}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Expert: {item.expert}</p>
                                <p className="text-xs text-muted-foreground">{item.context}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compelling Quotes */}
                    {structured?.compellingQuotes && structured.compellingQuotes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <Quote className="w-4 h-4 mr-2 text-teal-600" />
                          Compelling Quotes ({structured.compellingQuotes.length})
                        </h4>
                        <div className="space-y-3">
                          {structured.compellingQuotes.map((item, index) => (
                            <div key={index} className="bg-teal-50 dark:bg-teal-950 p-4 rounded-lg border-l-4 border-teal-500">
                              <p className="text-sm font-medium text-foreground mb-2 italic">"{item.quote}"</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">— {item.source}</p>
                                <p className="text-xs text-muted-foreground">{item.context}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Surprising Facts */}
                    {structured?.surprisingFacts && structured.surprisingFacts.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                          Surprising Facts ({structured.surprisingFacts.length})
                        </h4>
                        <div className="space-y-3">
                          {structured.surprisingFacts.map((item, index) => (
                            <div key={index} className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border-l-4 border-yellow-500">
                              <p className="text-sm font-medium text-foreground mb-2">{item.fact}</p>
                              <p className="text-xs text-muted-foreground mb-1">Why surprising: {item.why_surprising}</p>
                              <p className="text-xs text-muted-foreground">Relevance: {item.relevance}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Future Implications */}
                    {structured?.futureImplications && structured.futureImplications.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-red-600" />
                          Future Implications ({structured.futureImplications.length})
                        </h4>
                        <div className="space-y-3">
                          {structured.futureImplications.map((item, index) => (
                            <div key={index} className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border-l-4 border-red-500">
                              <p className="text-sm font-medium text-foreground mb-2">{item.implication}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Timeframe: {item.timeframe}</p>
                                <p className="text-xs text-muted-foreground">Probability: {item.probability}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-medium text-sm mb-2">Enhanced Research Not Available</h4>
                    <p className="text-xs text-muted-foreground">
                      This research was conducted before the enhanced analysis system was implemented.
                      Regenerate research to see the new structured data.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Key Points Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                <div className="space-y-4">
                  {/* Key Points */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center">
                      <List className="w-4 h-4 mr-2 text-primary" />
                      Key Research Points ({researchResult.keyPoints?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {researchResult.keyPoints?.map((point: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-sm text-foreground leading-relaxed">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statistics */}
                  {researchResult.statistics && researchResult.statistics.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                          Statistics ({researchResult.statistics.length})
                        </h4>
                        <div className="space-y-3">
                          {researchResult.statistics.map((stat: any, index: number) => (
                            <div key={index} className="bg-accent/10 p-4 rounded-lg border-l-4 border-primary">
                              <p className="text-sm font-medium text-foreground">{stat.fact}</p>
                              <p className="text-xs text-muted-foreground mt-2">Source: {stat.source}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Raw Content Tab */}
              <TabsContent value="raw" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center">
                      <ExternalLink className="w-4 h-4 mr-2 text-primary" />
                      Full Research Content
                    </h4>
                    <div className="space-y-3">
                      {researchResult.sources?.map((source: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <h5 className="font-medium text-sm text-foreground">{source.title}</h5>
                          <div className="bg-muted/50 p-4 rounded-md">
                            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                              {source.fullContent || source.summary}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Character count: {(source.fullContent || source.summary).length}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

            </ScrollArea>
          </div>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
