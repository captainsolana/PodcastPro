import React from 'react';
import { cn } from '@/lib/utils';
import { AppIcon } from '@/components/ui/icon-registry';

interface ModernHeroProps {
  className?: string;
  onCreateProject?: () => void;
  onWatchDemo?: () => void;
}

export const ModernHero: React.FC<ModernHeroProps> = ({
  className,
  onCreateProject,
  onWatchDemo
}) => {
  return (
    <section className={cn(
      "relative overflow-hidden min-h-screen flex items-center",
      "bg-gradient-to-br from-bg-primary via-bg-secondary to-gray-100",
      className
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/8 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-secondary/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-tertiary/6 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="container-modern relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading with high contrast text */}
          <h1 className="font-display text-display-xl font-bold mb-6 text-text-primary animate-fade-in-up">
            Podcast Maker
          </h1>
          
          {/* Subtitle */}
          <p className="text-body-lg text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Transform your ideas into professional, multi-episode podcasts in minutes. 
            Research, script, and produce with the power of AI.
          </p>
          
          {/* Call-to-action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={onCreateProject}
              className="btn-primary hover-lift hover-glow flex items-center justify-center space-x-2 text-body-md"
            >
              <AppIcon name="mic" className="w-5 h-5" />
              <span>Start Creating Now</span>
            </button>
            
            <button 
              onClick={onWatchDemo}
              className="btn-secondary hover-lift flex items-center justify-center space-x-2 text-body-md"
            >
              <AppIcon name="play" className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <FeatureCard 
              icon={<AppIcon name="idea" className="w-6 h-6" />}
              title="AI Research"
              description="Intelligent topic analysis and content generation"
            />
            <FeatureCard 
              icon={<AppIcon name="volume" className="w-6 h-6" />}
              title="Studio Quality"
              description="Professional audio with multiple voice options"
            />
            <FeatureCard 
              icon={<AppIcon name="list" className="w-6 h-6" />}
              title="Multi-Episode"
              description="Create complete podcast series effortlessly"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="glass-surface card-modern hover-lift p-6 text-center group">
      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
        <div className="text-white">
          {icon}
        </div>
      </div>
      <h3 className="text-heading-sm font-semibold mb-2 text-text-primary">{title}</h3>
      <p className="text-body-sm text-text-secondary">{description}</p>
    </div>
  );
};

export default ModernHero;
