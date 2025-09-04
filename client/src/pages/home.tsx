import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle, EnhancedCardDescription } from "@/components/ui/enhanced-card";
import { ExpandableText } from "@/components/ui/expandable-text";
import { useProject, useProjects } from "@/hooks/use-project";
import { Mic, Plus, Clock, Calendar, Sparkles, Zap, HeadphonesIcon, ArrowRight, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import APP_CONFIG from "@/lib/config";

export default function Home() {
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const { toast } = useToast();
  const { createProject, isCreating } = useProject();
  const { projects, isLoading: isLoadingProjects } = useProjects(); // Simplified - no userId needed

  const handleCreateProject = async () => {
    if (!prompt.trim() || !title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and description for your podcast.",
        variant: "destructive",
      });
      return;
    }

    createProject({
      userId: APP_CONFIG.DEFAULT_USER_ID,
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="gradient-bg w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                <Mic className="text-white w-7 h-7" />
              </div>
              <div>
                <h1 className="heading-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Podcast Maker</h1>
                <p className="body-sm text-muted-foreground font-medium">AI-Powered Podcast Creation Platform</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>AI-Enhanced</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Zap className="w-4 h-4" />
                <span>Fast Creation</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <HeadphonesIcon className="w-4 h-4" />
                <span>Professional Audio</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Create New Project */}
          <div className="lg:col-span-2 space-y-8">
            <div className="text-center lg:text-left mb-8">
              <h2 className="heading-xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Create Your AI Podcast
              </h2>
              <p className="body-lg text-muted-foreground max-w-2xl">
                Transform your ideas into professional podcasts with our AI-powered platform. From concept to audio in minutes.
              </p>
            </div>
            
            <EnhancedCard hover gradient className="animate-fade-in-up">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center space-x-3">
                  <div className="gradient-bg w-10 h-10 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <span>Create New Podcast</span>
                </EnhancedCardTitle>
                <EnhancedCardDescription>
                  Start with your idea and let AI transform it into a professional podcast
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                    <span>Podcast Title</span>
                    <span className="text-xs text-muted-foreground">(Required)</span>
                  </label>
                  <Input
                    placeholder="e.g., The Future of Technology, Marketing Mastery..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-12 text-base"
                    data-testid="input-podcast-title"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center space-x-2">
                    <span>Podcast Description</span>
                    <span className="text-xs text-muted-foreground">(Required)</span>
                  </label>
                  <Textarea
                    placeholder="Describe your podcast concept, target audience, and key topics you want to cover. Be as detailed as possible - our AI will use this to create a comprehensive podcast structure..."
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-base resize-none"
                    data-testid="textarea-podcast-description"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: Include your target audience, main topics, and desired tone for best results
                  </p>
                </div>

                <Button 
                  onClick={handleCreateProject}
                  disabled={isCreating || !prompt.trim() || !title.trim()}
                  size="lg"
                  className="w-full h-14 text-base font-semibold"
                  data-testid="button-create-project"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Creating Your Podcast...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-3" />
                      Start Creating with AI
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </>
                  )}
                </Button>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* How it Works */}
            <EnhancedCard className="animate-fade-in-up animate-delay-200">
              <EnhancedCardHeader>
                <EnhancedCardTitle>How It Works</EnhancedCardTitle>
                <EnhancedCardDescription>
                  Our AI-powered process transforms your idea into a professional podcast in three simple steps
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center group hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-white font-bold text-lg">1</span>
                    </div>
                    <h3 className="heading-sm mb-3 text-foreground font-semibold">Prompt & Research</h3>
                    <p className="body-sm text-muted-foreground leading-relaxed">
                      AI refines your idea and conducts comprehensive research to build a solid foundation
                    </p>
                  </div>
                  
                  <div className="text-center group hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <h3 className="heading-sm mb-3 text-foreground font-semibold">Script Generation</h3>
                    <p className="body-sm text-muted-foreground leading-relaxed">
                      Create engaging, well-structured scripts with natural flow and professional quality
                    </p>
                  </div>
                  
                  <div className="text-center group hover:-translate-y-2 transition-all duration-300">
                    <div className="w-16 h-16 gradient-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <h3 className="heading-sm mb-3 text-foreground font-semibold">Audio Generation</h3>
                    <p className="body-sm text-muted-foreground leading-relaxed">
                      Transform scripts into high-quality audio with customizable AI voices
                    </p>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Recent Projects */}
          <div className="space-y-6">
            <EnhancedCard className="animate-fade-in-up animate-delay-100">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Recent Projects</span>
                </EnhancedCardTitle>
                <EnhancedCardDescription>
                  Continue working on your podcasts
                </EnhancedCardDescription>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                {isLoadingProjects ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="loading-shimmer rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Mic className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">No projects yet</h3>
                    <p className="body-sm text-muted-foreground mb-4">Create your first podcast to get started</p>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Get Started
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project, index) => (
                      <div
                        key={project.id}
                        className="card-enhanced p-4 cursor-pointer group animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => setLocation(`/project/${project.id}`)}
                        data-testid={`card-project-${project.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {project.title}
                            </h3>
                            <ExpandableText maxLines={2} showButton={false} className="mt-1">
                              <p className="text-sm text-muted-foreground">
                                {project.description}
                              </p>
                            </ExpandableText>
                            <div className="flex items-center space-x-4 mt-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  project.phase === 1 ? 'bg-primary' :
                                  project.phase === 2 ? 'bg-warning' :
                                  'bg-success'
                                }`} />
                                <span className="text-xs font-medium text-muted-foreground">
                                  Phase {project.phase}/3
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(project.updatedAt || "").toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </div>
      </div>
    </div>
  );
}
