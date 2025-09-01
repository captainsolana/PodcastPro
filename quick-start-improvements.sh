#!/bin/bash
# quick-start-improvements.sh - Implement the first set of improvements

set -e

echo "🚀 Starting PodcastPro Quick Improvements..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the PodcastPro root directory"
    exit 1
fi

echo "📦 Installing development dependencies..."
npm install --save-dev vitest @playwright/test eslint prettier husky lint-staged @types/node

echo "🔧 Setting up development scripts..."
npm pkg set scripts.dev="concurrently \"npm run dev:server\" \"npm run dev:client\""
npm pkg set scripts.dev:server="tsx watch server/index.ts"
npm pkg set scripts.dev:client="cd client && npm run dev"
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.test="vitest"
npm pkg set scripts.build:full="npm run build && npm run build:client"
npm pkg set scripts.build:client="cd client && npm run build"

echo "🎯 Installing real-time progress tracking..."
npm install socket.io socket.io-client uuid

echo "📁 Creating feature directories..."
mkdir -p client/src/components/progress
mkdir -p client/src/hooks/realtime
mkdir -p server/services/realtime
mkdir -p shared/types

# Create real-time progress component
echo "⚡ Creating progress tracking component..."
cat > client/src/components/progress/GenerationProgress.tsx << 'EOF'
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useGenerationProgress } from '@/hooks/realtime/useGenerationProgress';

interface GenerationProgressProps {
  projectId: string;
}

export function GenerationProgress({ projectId }: GenerationProgressProps) {
  const { progress, stage, isGenerating, error } = useGenerationProgress(projectId);

  if (!isGenerating && !error) return null;

  const stageLabels = {
    analyzing: 'Analyzing content...',
    generating: 'Generating script...',
    synthesizing: 'Creating audio...',
    finalizing: 'Finalizing podcast...'
  };

  return (
    <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {error ? '❌ Generation failed' : stageLabels[stage] || 'Processing...'}
        </span>
        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
      </div>
      
      <Progress value={progress} className="w-full" />
      
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
EOF

# Create real-time hook
echo "🔗 Creating real-time hooks..."
cat > client/src/hooks/realtime/useGenerationProgress.ts << 'EOF'
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface GenerationProgress {
  projectId: string;
  stage: 'analyzing' | 'generating' | 'synthesizing' | 'finalizing';
  progress: number;
  estimatedTimeRemaining?: number;
}

export function useGenerationProgress(projectId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<GenerationProgress['stage']>('analyzing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Join project room for updates
    newSocket.emit('join:project', projectId);

    // Listen for progress updates
    newSocket.on('progress:update', (data: GenerationProgress) => {
      if (data.projectId === projectId) {
        setProgress(data.progress);
        setStage(data.stage);
        setIsGenerating(true);
        setError(null);
      }
    });

    // Listen for completion
    newSocket.on('generation:complete', (data: { projectId: string; audioUrl: string }) => {
      if (data.projectId === projectId) {
        setProgress(100);
        setIsGenerating(false);
        setError(null);
      }
    });

    // Listen for errors
    newSocket.on('error', (data: { projectId: string; error: string }) => {
      if (data.projectId === projectId) {
        setIsGenerating(false);
        setError(data.error);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [projectId]);

  return { progress, stage, isGenerating, error, socket };
}
EOF

# Create server-side Socket.IO setup
echo "🔌 Setting up server-side Socket.IO..."
cat > server/services/realtime/socketManager.ts << 'EOF'
import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

export class SocketManager {
  private io: SocketIOServer;
  
  constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join:project', (projectId: string) => {
        socket.join(`project:${projectId}`);
        console.log(`Socket ${socket.id} joined project ${projectId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  emitProgress(projectId: string, progress: {
    stage: 'analyzing' | 'generating' | 'synthesizing' | 'finalizing';
    progress: number;
    estimatedTimeRemaining?: number;
  }) {
    this.io.to(`project:${projectId}`).emit('progress:update', {
      projectId,
      ...progress
    });
  }

  emitComplete(projectId: string, audioUrl: string) {
    this.io.to(`project:${projectId}`).emit('generation:complete', {
      projectId,
      audioUrl
    });
  }

  emitError(projectId: string, error: string) {
    this.io.to(`project:${projectId}`).emit('error', {
      projectId,
      error
    });
  }
}

export let socketManager: SocketManager | null = null;

export function initializeSocketManager(server: Server) {
  socketManager = new SocketManager(server);
  return socketManager;
}
EOF

# Add Socket.IO integration to server
echo "🔧 Integrating Socket.IO with server..."
cat > server/socket-integration.patch << 'EOF'
--- server/index.ts.original
+++ server/index.ts
@@ -1,6 +1,8 @@
 import express from 'express';
+import { createServer } from 'http';
 import cors from 'cors';
 import { setupVite } from './vite.js';
 import { apiRouter } from './routes.js';
+import { initializeSocketManager } from './services/realtime/socketManager.js';
 
 const app = express();
 const PORT = process.env.PORT || 3001;
@@ -19,6 +21,11 @@
 
 await setupVite(app);
 
-app.listen(PORT, () => {
+// Create HTTP server for Socket.IO
+const server = createServer(app);
+
+// Initialize Socket.IO
+initializeSocketManager(server);
+
+server.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
 });
EOF

echo "📊 Creating enhanced error handling..."
cat > client/src/components/ErrorBoundary.tsx << 'EOF'
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Report to error tracking service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-orange-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Technical Details
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
EOF

echo "🎨 Creating loading states component..."
cat > client/src/components/LoadingStates.tsx << 'EOF'
import React from 'react';
import { Loader2, Mic, Volume2, FileText } from 'lucide-react';

export function LoadingSpinner({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
  );
}

export function GenerationLoadingStates({ stage }: { 
  stage: 'analyzing' | 'generating' | 'synthesizing' | 'finalizing' 
}) {
  const stageConfig = {
    analyzing: { icon: FileText, label: 'Analyzing content...', color: 'text-blue-500' },
    generating: { icon: FileText, label: 'Generating script...', color: 'text-green-500' },
    synthesizing: { icon: Mic, label: 'Creating audio...', color: 'text-purple-500' },
    finalizing: { icon: Volume2, label: 'Finalizing podcast...', color: 'text-orange-500' }
  };

  const { icon: Icon, label, color } = stageConfig[stage];

  return (
    <div className="flex items-center space-x-2">
      <Icon className={`h-5 w-5 ${color} animate-pulse`} />
      <span className="text-sm font-medium">{label}</span>
      <LoadingSpinner size="sm" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 dark:text-gray-400">Loading PodcastPro...</p>
      </div>
    </div>
  );
}
EOF

echo "📈 Creating performance monitoring utilities..."
cat > client/src/utils/performance.ts << 'EOF'
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(key: string): void {
    this.metrics.set(key, performance.now());
  }

  endTimer(key: string): number {
    const startTime = this.metrics.get(key);
    if (!startTime) {
      console.warn(`Timer '${key}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.delete(key);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${key} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  measureAsync<T>(key: string, operation: () => Promise<T>): Promise<T> {
    this.startTimer(key);
    return operation().finally(() => {
      this.endTimer(key);
    });
  }

  logPageLoad(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      console.log('Page Load Metrics:', {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      });
    }
  }
}

// Global performance monitoring
export const perf = PerformanceMonitor.getInstance();

// Auto-log page performance on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => perf.logPageLoad(), 0);
  });
}
EOF

echo "✅ Quick improvements setup complete!"
echo ""
echo "🎯 What's been added:"
echo "1. ⚡ Real-time progress tracking with Socket.IO"
echo "2. 🛡️  Enhanced error boundaries and handling"
echo "3. 🎨 Professional loading states"
echo "4. 📊 Performance monitoring utilities"
echo "5. 🔧 Development scripts and tooling"
echo ""
echo "📋 Next steps:"
echo "1. Install client dependencies: cd client && npm install socket.io-client"
echo "2. Apply Socket.IO integration: patch -p0 < server/socket-integration.patch"
echo "3. Update your components to use the new progress tracking"
echo "4. Test real-time features with: npm run dev"
echo ""
echo "🚀 For the full development workflow setup, run:"
echo "   ./setup-dev-workflow.sh"
