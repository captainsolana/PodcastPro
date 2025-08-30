import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject, useProjects } from "@/hooks/use-project";
import { Mic, Plus, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const { createProject, isCreating } = useProject();
  const { projects, isLoading: isLoadingProjects } = useProjects("demo-user"); // Using demo user for now
  const { toast } = useToast();

  const handleCreateProject = async () => {
    if (!prompt.trim() || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and description for your podcast.",
        variant: "destructive",
      });
      return;
    }

    try {
      createProject({
        userId: "demo-user",
        title: title.trim(),
        description: prompt.trim(),
        phase: 1,
        status: "draft",
        originalPrompt: prompt.trim(),
        voiceSettings: { model: "nova", speed: 1.0 },
      }, {
        onSuccess: (newProject) => {
          toast({
            title: "Project Created",
            description: "Your podcast project has been created successfully!",
          });
          setLocation(`/project/${newProject.id}`);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create project. Please try again.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="gradient-bg w-12 h-12 rounded-lg flex items-center justify-center">
              <Mic className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Podcast Maker</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Podcast Creation Platform</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Project */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New Podcast</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Podcast Title
                  </label>
                  <Input
                    placeholder="Enter your podcast title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    data-testid="input-podcast-title"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Podcast Description
                  </label>
                  <Textarea
                    placeholder="Describe what you want your podcast to be about. The AI will help refine and structure your idea..."
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    data-testid="textarea-podcast-description"
                  />
                </div>

                <Button 
                  onClick={handleCreateProject}
                  disabled={isCreating || !prompt.trim() || !title.trim()}
                  className="w-full"
                  data-testid="button-create-project"
                >
                  {isCreating ? "Creating Project..." : "Start Creating Podcast"}
                </Button>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>How it Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2">Prompt & Research</h3>
                    <p className="text-xs text-muted-foreground">AI refines your idea and conducts deep research</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-secondary font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2">Script Generation</h3>
                    <p className="text-xs text-muted-foreground">AI creates engaging scripts with natural flow</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-accent font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2">Audio Generation</h3>
                    <p className="text-xs text-muted-foreground">Convert to high-quality audio with AI voice</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted/50 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8">
                    <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No projects yet</p>
                    <p className="text-xs text-muted-foreground">Create your first podcast above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => setLocation(`/project/${project.id}`)}
                        data-testid={`card-project-${project.id}`}
                      >
                        <h3 className="font-medium text-sm text-foreground">{project.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Phase {project.phase}/3</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(project.updatedAt || "").toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
