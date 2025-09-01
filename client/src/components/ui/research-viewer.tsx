import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, FileText, BarChart3, List, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResearchViewerProps {
  researchResult: {
    sources: Array<{ title: string; url: string; summary: string; fullContent?: string }>;
    keyPoints: string[];
    statistics: Array<{ fact: string; source: string }>;
    outline: string[];
  };
  className?: string;
}

export function ResearchViewer({ researchResult, className }: ResearchViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'raw'>('raw');

  const tabs = [
    { id: 'raw', label: 'Full Research', icon: FileText },
    { id: 'overview', label: 'Overview', icon: List },
    { id: 'detailed', label: 'Structured View', icon: BarChart3 }
  ];

  // Get the full research content from sources
  const fullContent = researchResult.sources[0]?.fullContent || researchResult.sources[0]?.summary || "";
  const displaySummary = researchResult.sources[0]?.summary || "";
  const isContentTruncated = displaySummary.includes("...") && displaySummary.length < fullContent.length;

  return (
    <Card className={cn("w-full research-viewer-container", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Research Results</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {researchResult.keyPoints?.length || 0} key points
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
            data-testid="button-toggle-research-view"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[800px]" : "max-h-[300px]"
        )}>
          <ScrollArea className={cn(
            "w-full scroll-area-content",
            isExpanded ? "h-[800px]" : "h-[300px]"
          )}>
            <div className="research-content research-text">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Key Points Preview */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                    Key Insights
                  </h4>
                  <div className="space-y-2">
                    {researchResult.keyPoints?.slice(0, isExpanded ? undefined : 3).map((point: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-foreground leading-relaxed break-words overflow-wrap-anywhere">{point}</p>
                      </div>
                    ))}
                    {!isExpanded && (researchResult.keyPoints?.length || 0) > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{(researchResult.keyPoints?.length || 0) - 3} more insights...
                      </p>
                    )}
                  </div>
                </div>

                {/* Statistics Preview */}
                {researchResult.statistics && researchResult.statistics.length > 0 && (
                  <div>
                    <Separator className="my-3" />
                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                      Key Statistics
                    </h4>
                    <div className="space-y-2">
                      {researchResult.statistics.slice(0, isExpanded ? undefined : 2).map((stat: any, index: number) => (
                        <div key={index} className="bg-accent/10 p-3 rounded-lg">
                          <p className="text-sm font-medium text-foreground break-words overflow-wrap-anywhere">{stat.fact}</p>
                          <p className="text-xs text-muted-foreground mt-1">Source: {stat.source}</p>
                        </div>
                      ))}
                      {!isExpanded && researchResult.statistics.length > 2 && (
                        <p className="text-xs text-muted-foreground">
                          +{researchResult.statistics.length - 2} more statistics...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'detailed' && (
              <div className="space-y-6">
                {/* Full Key Points */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center">
                    <List className="w-4 h-4 mr-2 text-primary" />
                    All Key Points ({researchResult.keyPoints?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {researchResult.keyPoints?.map((point: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed break-words overflow-wrap-anywhere">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Statistics */}
                {researchResult.statistics && researchResult.statistics.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                        All Statistics ({researchResult.statistics.length})
                      </h4>
                      <div className="space-y-3">
                        {researchResult.statistics.map((stat: any, index: number) => (
                          <div key={index} className="bg-accent/10 p-4 rounded-lg border-l-4 border-primary">
                            <p className="text-sm font-medium text-foreground break-words overflow-wrap-anywhere">{stat.fact}</p>
                            <p className="text-xs text-muted-foreground mt-2">Source: {stat.source}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Episode Outline */}
                {researchResult.outline && researchResult.outline.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-primary" />
                        Suggested Episode Outline
                      </h4>
                      <div className="space-y-2">
                        {researchResult.outline.map((item: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/5 transition-colors">
                            <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <p className="text-sm text-foreground break-words overflow-wrap-anywhere">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'raw' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2 text-primary" />
                    Full Research Content
                  </h4>
                  <div className="space-y-3">
                    {researchResult.sources?.map((source: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <h5 className="font-medium text-sm text-foreground mb-3">{source.title}</h5>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">
                            {fullContent || source.summary}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                          <span>Character count: {(fullContent || source.summary).length}</span>
                          {fullContent && (
                            <span className="text-green-600">✓ Full research content available</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </div>
          </ScrollArea>
        </div>

        {/* Expand/Collapse Footer */}
        <div className="mt-4 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-8 text-xs"
            data-testid="button-toggle-research-expand"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show More
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}