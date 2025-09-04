import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppIcon } from "@/components/ui/icon-registry";
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
  { id: 'raw', label: 'Full Research', icon: 'file' },
  { id: 'overview', label: 'Overview', icon: 'list' },
  { id: 'detailed', label: 'Structured View', icon: 'stats' }
  ];

  // Get the full research content from sources
  const fullContent = researchResult.sources[0]?.fullContent || researchResult.sources[0]?.summary || "";
  const displaySummary = researchResult.sources[0]?.summary || "";
  const isContentTruncated = displaySummary.includes("...") && displaySummary.length < fullContent.length;

  return (
  <Card className={cn("w-full research-viewer-container interactive", className)} data-elevation-tier={1}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AppIcon name="file" className="w-5 h-5 text-text-primary" />
            <CardTitle className="heading-sm">Research Results</CardTitle>
            <Badge variant="soft" className="text-xs">
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
              <AppIcon name="chevronUp" className="w-4 h-4" />
            ) : (
              <AppIcon name="chevronDown" className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
          {tabs.map((tab) => {
            const IconName = tab.icon as any;
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
                <AppIcon name={IconName} className="w-4 h-4" />
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
                  <h4 className="heading-xs mb-2 flex items-center">
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
                    <h4 className="heading-xs mb-2 flex items-center">
                      <AppIcon name="stats" className="w-4 h-4 mr-2 text-text-primary" />
                      Key Statistics
                    </h4>
                    <div className="space-y-2">
                      {researchResult.statistics.slice(0, isExpanded ? undefined : 2).map((stat: any, index: number) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
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
                  <h4 className="heading-xs mb-3 flex items-center">
                    <AppIcon name="list" className="w-4 h-4 mr-2 text-text-primary" />
                    All Key Points ({researchResult.keyPoints?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {researchResult.keyPoints?.map((point: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-gray-100 border border-gray-300 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
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
                      <h4 className="heading-xs mb-3 flex items-center">
                        <AppIcon name="stats" className="w-4 h-4 mr-2 text-text-primary" />
                        All Statistics ({researchResult.statistics.length})
                      </h4>
                      <div className="space-y-3">
                        {researchResult.statistics.map((stat: any, index: number) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-lg border-l-4 border-l-blue-500">
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
                      <h4 className="heading-xs mb-3 flex items-center">
                        <AppIcon name="file" className="w-4 h-4 mr-2 text-text-primary" />
                        Suggested Episode Outline
                      </h4>
                      <div className="space-y-2">
                        {researchResult.outline.map((item: string, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
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
                      <h4 className="heading-xs mb-3 flex items-center">
                    <AppIcon name="external" className="w-4 h-4 mr-2 text-text-primary" />
                    Full Research Content
                  </h4>
                  <div className="space-y-3">
                    {researchResult.sources?.map((source: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <h5 className="heading-xs text-foreground mb-3 font-medium">{source.title}</h5>
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
                <AppIcon name="chevronUp" className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <AppIcon name="chevronDown" className="w-3 h-3 mr-1" />
                Show More
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}