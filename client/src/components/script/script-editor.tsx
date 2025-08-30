import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Download, Lightbulb } from "lucide-react";
import type { Project, ScriptAnalytics } from "@shared/schema";

interface ScriptEditorProps {
  content: string;
  onChange: (content: string) => void;
  analytics?: ScriptAnalytics;
  onSave: () => void;
  project: Project;
  episodeInfo?: {
    currentEpisode: number;
    totalEpisodes: number;
    episodeTitle?: string;
  };
}

export default function ScriptEditor({ content, onChange, analytics, onSave, project, episodeInfo }: ScriptEditorProps) {
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title}-script.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full">
      {/* Script Header */}
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {episodeInfo ? (
                <>
                  {episodeInfo.episodeTitle || `Episode ${episodeInfo.currentEpisode}`}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({episodeInfo.currentEpisode} of {episodeInfo.totalEpisodes})
                  </span>
                </>
              ) : (
                project.title
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Estimated duration: {analytics?.speechTime ? `${Math.floor(analytics.speechTime / 60)} minutes` : "16 minutes"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              data-testid="button-save-script"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              data-testid="button-export-script"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Script Content Editor */}
      <CardContent className="p-0 h-full">
        <div className="h-full">
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="script-editor h-full min-h-[600px] border-0 resize-none rounded-none focus:ring-0 focus:ring-offset-0"
            placeholder="Your podcast script will appear here..."
            data-testid="textarea-script-content"
          />
        </div>
      </CardContent>
    </Card>
  );
}
