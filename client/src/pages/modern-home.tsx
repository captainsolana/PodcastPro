import React, { useState } from "react";
import { useLocation } from "wouter";
import { ModernHero } from "@/components/modern/modern-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProject, useProjects } from "@/hooks/use-project";
import { useToast } from "@/hooks/use-toast";
import { AppIcon } from "@/components/ui/icon-registry";
import { cn } from "@/lib/utils";
import APP_CONFIG from "@/lib/config";

export default function ModernHomePage() {
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const { createProject, isCreating } = useProject();
  const { projects, isLoading: isLoadingProjects } = useProjects();

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

  const handleStartCreating = () => {
    setShowCreateForm(true);
  };

  const handleWatchDemo = () => {
    // For now, just show a toast - could implement a proper demo modal
    toast({
      title: "Demo Coming Soon",
      description: "We're working on an interactive demo. For now, try creating a project!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-accent-primary/5">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 glass-surface border-b border-primary/20">
        <div className="container-modern py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                <AppIcon name="mic" className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display font-bold text-heading-lg text-gradient-primary">Podcast Maker</h1>
                <p className="text-body-sm text-muted font-medium">AI-Powered Creation Platform</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6 text-body-sm">
              <div className="flex items-center space-x-2 text-muted">
                <AppIcon name="spark" className="w-4 h-4" />
                <span>AI-Enhanced</span>
              </div>
              <div className="flex items-center space-x-2 text-muted">
                <AppIcon name="energy" className="w-4 h-4" />
                <span>Fast Creation</span>
              </div>
              <div className="flex items-center space-x-2 text-muted">
                <AppIcon name="headphones" className="w-4 h-4" />
                <span>Professional Audio</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section or Create Form */}
      {!showCreateForm ? (
        <ModernHero 
          onCreateProject={handleStartCreating}
          onWatchDemo={handleWatchDemo}
        />
      ) : (
        <section className="py-20">
          <div className="container-modern">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8 animate-fade-in-up">
                <h2 className="font-display text-display-md font-bold mb-4 text-text-primary">
                  Create Your Podcast
                </h2>
                <p className="text-body-lg text-text-secondary">
                  Tell us about your podcast idea and let AI transform it into professional content.
                </p>
              </div>

              <Card className="card-modern glass-surface animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle className="text-heading-md text-text-primary">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-body-sm font-medium text-text-secondary">
                      Podcast Title
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Tech Trends Weekly, Business Insights Daily"
                      className="focus-enhanced"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-body-sm font-medium text-text-secondary">
                      Podcast Description & Topic
                    </label>
                    <Textarea
                      id="description"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your podcast concept, target audience, key topics, and any specific angles you'd like to explore..."
                      rows={4}
                      className="focus-enhanced"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCreateProject}
                      disabled={isCreating || !title.trim() || !prompt.trim()}
                      className={cn(
                        "btn-primary flex-1 flex items-center justify-center space-x-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {isCreating ? (
                        <>
                          <AppIcon name="loading" className="w-4 h-4 animate-spin" />
                          <span>Creating Project...</span>
                        </>
                      ) : (
                        <>
                          <AppIcon name="spark" className="w-4 h-4" />
                          <span>Create Podcast</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="btn-ghost flex items-center justify-center space-x-2"
                    >
                      <AppIcon name="arrowLeft" className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Recent Projects Section */}
      {projects && projects.length > 0 && (
        <section className="py-20 border-t border-primary/10">
          <div className="container-modern">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-display text-display-md font-bold mb-4 text-text-primary">
                  Your Recent Projects
                </h2>
                <p className="text-body-lg text-secondary">
                  Continue working on your podcast projects or start a new one.
                </p>
              </div>

              <div className="grid-auto-fit">
                {projects.map((project, index) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gradient-accent-soft">
        <div className="container-modern">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-display-md font-bold mb-4 text-text-primary">
                Powerful AI Features
              </h2>
              <p className="text-body-lg text-secondary">
                Everything you need to create professional podcasts with AI assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<AppIcon name="search" className="w-6 h-6" />}
                title="Smart Research"
                description="AI analyzes your topic and gathers relevant data, statistics, and insights from multiple sources."
                gradient="from-accent-primary to-accent-secondary"
              />
              <FeatureCard
                icon={<AppIcon name="edit" className="w-6 h-6" />}
                title="Script Generation"
                description="Create engaging, conversational scripts with natural flow and professional structure."
                gradient="from-accent-secondary to-accent-tertiary"
              />
              <FeatureCard
                icon={<AppIcon name="volume" className="w-6 h-6" />}
                title="Voice Synthesis"
                description="Convert scripts to high-quality audio with multiple voice options and customizable settings."
                gradient="from-accent-tertiary to-accent-primary"
              />
              <FeatureCard
                icon={<AppIcon name="list" className="w-6 h-6" />}
                title="Multi-Episode"
                description="Plan and create complete podcast series with consistent themes and progression."
                gradient="from-accent-primary to-accent-tertiary"
              />
              <FeatureCard
                icon={<AppIcon name="stats" className="w-6 h-6" />}
                title="Analytics"
                description="Track content performance and get insights to improve your podcast quality."
                gradient="from-accent-secondary to-accent-primary"
              />
              <FeatureCard
                icon={<AppIcon name="download" className="w-6 h-6" />}
                title="Export Ready"
                description="Download professional-quality audio files ready for publishing on any platform."
                gradient="from-accent-tertiary to-accent-secondary"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ProjectCardProps {
  project: any;
  style?: React.CSSProperties;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, style }) => {
  const [, setLocation] = useLocation();
  
  const getStatusBadge = () => {
    if (project.phase === 3) return { text: "Complete", className: "status-complete" };
    if (project.phase === 2) return { text: "In Progress", className: "status-processing" };
    return { text: "Starting", className: "status-recording" };
  };

  const status = getStatusBadge();

  return (
    <Card 
      className="card-modern card-interactive glass-surface animate-fade-in-up cursor-pointer"
      style={style}
      onClick={() => setLocation(`/project/${project.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-heading-sm text-text-primary line-clamp-1">
              {project.title}
            </CardTitle>
            <p className="text-body-sm text-text-secondary line-clamp-2 mt-1">
              {project.description}
            </p>
          </div>
          <div className={status.className}>
            {status.text}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(project.phase / 3) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-body-xs text-text-muted">
            <span>Phase {project.phase} of 3</span>
            <span>{Math.round((project.phase / 3) * 100)}% Complete</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient }) => {
  return (
    <div className="glass-surface card-modern hover-lift group p-6">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300",
        `bg-gradient-to-r ${gradient}`
      )}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-heading-sm font-semibold mb-2 text-text-primary">{title}</h3>
      <p className="text-body-sm text-text-secondary">{description}</p>
    </div>
  );
};
