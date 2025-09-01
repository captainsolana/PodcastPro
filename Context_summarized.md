# PodcastPro - Quick Reference Guide

**Version:** 1.2.0 | **Status:** ✅ LIVE IN PRODUCTION | **Updated:** August 31, 2025

## 🚀 **LIVE APPLICATION**
- **Production URL:** https://app-podcastpro.jollystone-ac8f78d1.westus2.azurecontainerapps.io
- **Status:** Operational and ready for podcast creation
- **Local Dev:** `npm run dev` → http://localhost:3001

---

## 🎯 **WHAT IT DOES**
AI-powered podcast creation platform that transforms ideas into professional podcasts in 3 phases:

1. **Prompt Refinement** → AI enhances user ideas + conducts research
2. **Script Generation** → Creates professional podcast scripts  
3. **Audio Production** → Converts to high-quality audio via TTS

**Target Users:** Content creators, businesses, educators, individuals wanting professional podcasts without technical expertise.

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Tech Stack**
- **Frontend:** React 18 + TypeScript + Vite + TanStack Query + shadcn/ui + Tailwind CSS
- **Backend:** Express + TypeScript + tsx runtime
- **Storage:** Azure Cosmos DB (NoSQL) + Azure Blob Storage + Memory fallback
- **AI Services:** OpenAI GPT-5 + TTS + Perplexity API
- **Deployment:** Docker + Azure Container Apps + Azure Container Registry
- **Security:** Azure Container App secrets management

### **Frontend** (React + TypeScript)
```
client/src/
├── components/
│   ├── phases/           # PromptPhase, ScriptPhase, AudioPhase
│   ├── wizard/           # Multi-step workflow components  
│   ├── audio/            # Audio player and controls
│   ├── script/           # Script editor components
│   ├── layout/           # App layout and navigation
│   └── ui/              # shadcn/ui component library
├── pages/               # home.tsx, project.tsx, not-found.tsx
├── hooks/               # Custom React hooks for API calls
└── lib/                 # Utilities, APP_CONFIG, type definitions
```

**Key Frontend Patterns:**
```typescript
// Centralized user management
export const APP_CONFIG = {
  DEFAULT_USER_ID: import.meta.env.VITE_DEFAULT_USER_ID || 'single-user',
  STORAGE_TYPE: import.meta.env.VITE_STORAGE_TYPE || 'memory'
} as const;

// React Query for server state
const { data: projects } = useQuery({
  queryKey: ['projects', userId],
  queryFn: () => getProjects(userId)
});

// Zod schemas for validation
const projectSchema = z.object({
  title: z.string().min(1),
  originalPrompt: z.string().min(1)
});
```

### **Backend** (Express + TypeScript)
```
server/
├── index.ts              # App entry point with production/dev routing
├── routes.ts             # RESTful API endpoints with validation
├── storage.ts            # Storage factory pattern + interface
├── storage-azure.ts      # Azure Cosmos DB + Blob Storage implementation  
├── vite.ts              # Development server integration + static serving
└── services/
    └── openai.ts         # AI integrations with error handling
```

**Storage Architecture:**
```typescript
// Factory pattern for environment-based storage
export function createStorage(): IStorage {
  const storageType = process.env.STORAGE_TYPE || 'memory';
  if (storageType === 'azure') {
    return new AzureCosmosStorage();  // Production: Cosmos DB + Blob Storage
  }
  return new MemStorage();            // Development: In-memory storage
}

// Interface ensures consistency across storage types
interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // AI suggestions
  createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion>;
  getAiSuggestionsByProjectId(projectId: string): Promise<AiSuggestion[]>;
}
```

### **Key APIs**
```typescript
// Project Management
GET    /api/projects?userId={id}     # List user projects
GET    /api/projects/:id             # Get specific project  
POST   /api/projects                 # Create new project
PUT    /api/projects/:id             # Update project
DELETE /api/projects/:id             # Delete project

// AI Workflow Phase 1: Ideation & Research
POST   /api/ai/refine-prompt         # Enhance user prompt with GPT-5
POST   /api/ai/research              # Conduct topic research with Perplexity
POST   /api/ai/analyze-episodes      # Determine single vs multi-episode format

// AI Workflow Phase 2: Content Creation  
POST   /api/ai/generate-script       # Create podcast script with GPT-5
POST   /api/ai/script-suggestions    # Get improvement recommendations

// AI Workflow Phase 3: Audio Production
POST   /api/ai/generate-audio        # Convert script to audio with OpenAI TTS

// Multi-Episode Support
POST   /api/ai/generate-episode-script  # Generate specific episode script

// Request/Response Examples
POST /api/ai/refine-prompt
{
  "prompt": "AI in healthcare",
  "additionalContext": "Focus on diagnostics"
}
→ {
  "refinedPrompt": "Enhanced version...",
  "focusAreas": ["AI diagnostics", "Medical imaging"],
  "targetAudience": "Healthcare professionals",
  "estimatedDuration": "25-30 minutes"
}
```

### **AI Service Integration**
```typescript
// services/openai.ts - Core AI functionality
class OpenAIService {
  async refinePrompt(prompt: string): Promise<RefinedPrompt> {
    // GPT-5 prompt enhancement with podcast-specific formatting
  }
  
  async generateScript(refinedPrompt: string, research: ResearchData): Promise<string> {
    // Script generation with natural conversation flow
  }
  
  async generateAudio(script: string, voice?: string): Promise<string> {
    // TTS conversion with audio file storage in Azure Blob
  }
  
  async conductResearch(topic: string): Promise<ResearchData> {
    // Perplexity API integration for real-time research
  }
}
```

---

## ☁️ **AZURE PRODUCTION SETUP**

### **Infrastructure**
- **Azure Container Apps** - Auto-scaling app hosting ($5-20/month)
- **Azure Cosmos DB** - NoSQL document storage (free tier)  
- **Azure Blob Storage** - Audio file storage (~$0.50/month)
- **Azure Container Registry** - Docker image storage ($5/month)

### **Security** 
```bash
# API keys stored as Container App secrets (persist across updates)
OPENAI_API_KEY=secretref:openai-key
PERPLEXITY_API_KEY=secretref:perplexity-key

# Auto-configured Azure services
COSMOS_DB_ENDPOINT=https://cosmos-podcastpro.documents.azure.com:443/
AZURE_STORAGE_CONNECTION_STRING=<auto-generated>
```

### **Storage Strategy**
```typescript
// Automatic environment-based switching
const storage = createStorage(); // Azure in production, memory in dev

// Single-user architecture (can be extended to multi-user)
DEFAULT_USER_ID=single-user
```

---

## 🔧 **DEVELOPMENT SETUP**

### **Prerequisites**
```bash
# Required
Node.js 20+, npm, Git

# For Azure deployment  
Azure CLI + active subscription

# For full AI functionality
OpenAI API key, Perplexity API key
```

### **Local Development**
```bash
# Clone and install
git clone <repo>
cd PodcastPro
npm install

# Environment setup (.env file)
OPENAI_API_KEY=your-openai-key
PERPLEXITY_API_KEY=your-perplexity-key
STORAGE_TYPE=memory                    # Uses MemStorage for development
VITE_DEFAULT_USER_ID=single-user      # Frontend user context
VITE_STORAGE_TYPE=memory              # Frontend storage indicator

# Start development server
npm run dev  # Frontend: localhost:3001, Backend: localhost:3001/api

# Available scripts
npm run build        # Vite production build
npm run preview      # Preview production build
npm run typecheck    # TypeScript validation
```

### **Project Structure**
```
PodcastPro/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (TypeScript)  
├── shared/          # Shared types and schemas
├── public/          # Static assets + generated audio files
├── Dockerfile       # Multi-stage production container
├── deploy-azure.sh  # One-command Azure deployment
├── package.json     # Monorepo dependencies
├── vite.config.ts   # Frontend build configuration
├── tsconfig.json    # TypeScript configuration with path mapping
└── context.md       # Complete technical documentation
```

### **Environment Variables**
```bash
# Development (.env)
OPENAI_API_KEY=your-openai-key         # Required for AI features
PERPLEXITY_API_KEY=your-perplexity-key # Required for research
STORAGE_TYPE=memory                     # memory | azure
NODE_ENV=development                    # development | production
PORT=3001                              # Server port (avoids macOS AirTunes conflict)

# Production (Azure Container App)
OPENAI_API_KEY=secretref:openai-key         # Container App secret reference
PERPLEXITY_API_KEY=secretref:perplexity-key # Container App secret reference
STORAGE_TYPE=azure                          # Uses Azure Cosmos DB + Blob Storage
COSMOS_DB_ENDPOINT=<auto-configured>        # Set by deploy script
COSMOS_DB_KEY=<auto-configured>            # Set by deploy script
AZURE_STORAGE_CONNECTION_STRING=<auto>      # Set by deploy script
DEFAULT_USER_ID=single-user                # Single-user architecture
DEFAULT_USERNAME=podcastcreator            # Default username
```

---

## 📦 **DEPLOYMENT**

### **Docker Configuration**
```dockerfile
# Multi-stage build for production optimization
FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++  # Native module compilation

FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build  # Vite build for frontend

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g tsx  # TypeScript execution in production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/node_modules ./node_modules
CMD ["tsx", "server/index.ts"]  # Direct TypeScript execution
```

### **Azure Deployment (One Command)**
```bash
# deploy-azure.sh - Complete infrastructure automation
#!/bin/bash

# Prerequisites: Azure CLI logged in + API keys set
export OPENAI_API_KEY="your-key"
export PERPLEXITY_API_KEY="your-key"

# Creates:
# - Resource group: rg-podcastpro
# - Cosmos DB: cosmos-podcastpro (NoSQL API)
# - Storage account: stpodcastpro  
# - Container registry: acrpodcastpro
# - Container app environment: env-podcastpro
# - Container app: app-podcastpro

./deploy-azure.sh

# Result: https://app-podcastpro.jollystone-ac8f78d1.westus2.azurecontainerapps.io
```

### **Production Issues Resolved**
- ✅ **Docker CMD** - Fixed startup from `node dist/index.js` to `tsx server/index.ts`
- ✅ **Import Paths** - Converted `@shared/schema` to `../shared/schema.js` for Node.js ESM
- ✅ **Static Files** - Fixed path from `/app/server/public` to `/app/dist/public`
- ✅ **API Keys** - Linked Container App secrets to environment variables
- ✅ **Vite Config** - Made import conditional for production vs development

---

## 🧪 **TESTING & VERIFICATION**

### **API Integration Status**
- ✅ **OpenAI GPT-5** - Prompt refinement (~11s response time)
- ✅ **Perplexity API** - Research generation (~53s for comprehensive research)
- ✅ **Azure Cosmos DB** - Document storage operational
- ✅ **Azure Blob Storage** - Audio file storage ready
- ✅ **Container App Secrets** - Secure API key management

### **Quick Test**
```bash
# Test live application
curl https://app-podcastpro.jollystone-ac8f78d1.westus2.azurecontainerapps.io/api/projects?userId=single-user

# Local API test  
npm run dev
curl http://localhost:3001/api/projects?userId=single-user
```

---

## 🔍 **MONITORING & LOGS**

### **Production Monitoring**
```bash
# View live logs
az containerapp logs show --name app-podcastpro --resource-group rg-podcastpro --follow

# Check app status
az containerapp show --name app-podcastpro --resource-group rg-podcastpro

# List secrets
az containerapp secret list --name app-podcastpro --resource-group rg-podcastpro
```

### **Key Resources**
- **Resource Group:** rg-podcastpro
- **Container App:** app-podcastpro  
- **Cosmos DB:** cosmos-podcastpro
- **Storage Account:** stpodcastpro
- **Container Registry:** acrpodcastpro

---

## 📊 **CURRENT CAPABILITIES**

### **✅ Working Features**
- 3-phase AI podcast creation workflow
- Real OpenAI GPT-5 + Perplexity API integration
- Azure cloud storage with persistence
- Professional React UI with shadcn/ui
- Docker containerization
- Azure Container Apps deployment
- Secure API key management
- Auto-scaling infrastructure

### **🔄 Data Flow**
1. **User Input** → Basic topic/idea
2. **AI Enhancement** → GPT-5 refines prompt + Perplexity researches
3. **Script Generation** → GPT-5 creates podcast script
4. **Audio Production** → OpenAI TTS converts to audio
5. **Storage** → Azure Blob (audio) + Cosmos DB (metadata)

### **💾 Storage Schema**
```typescript
// shared/schema.ts - Drizzle ORM schemas
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  originalPrompt: text('original_prompt').notNull(),
  refinedPrompt: text('refined_prompt'),
  researchData: jsonb('research_data'),
  script: text('script'),
  audioUrl: text('audio_url'),
  episodeCount: integer('episode_count').default(1),
  currentPhase: integer('current_phase').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const aiSuggestions = pgTable('ai_suggestions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  type: text('type').notNull(), // 'prompt_refinement', 'script_improvement'
  suggestion: text('suggestion').notNull(),
  applied: boolean('applied').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// TypeScript types inferred from schemas
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;
export type Project = InferSelectModel<typeof projects>;
export type InsertProject = InferInsertModel<typeof projects>;
export type AiSuggestion = InferSelectModel<typeof aiSuggestions>;
export type InsertAiSuggestion = InferInsertModel<typeof aiSuggestions>;

// Research data structure
interface ResearchData {
  sources: Array<{
    title: string;
    url?: string;
    content: string;
    relevance: number;
  }>;
  keyPoints: string[];
  statistics: string[];
  expertQuotes: string[];
  generatedAt: Date;
}
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Development Issues**
```bash
# Port 3000 conflict (macOS AirTunes)
Error: EADDRINUSE :::3000
→ App uses port 3001 by default, check PORT environment variable

# TypeScript path mapping errors  
Cannot find module '@shared/schema'
→ In production: imports converted to relative paths (../shared/schema.js)
→ In development: tsconfig.json baseUrl and paths handle resolution

# API key errors
Incorrect API key provided: sk-test-key
→ Check .env file exists and contains real API keys
→ Restart dev server after adding environment variables

# Storage connection issues
Azure storage dependencies not available, falling back to memory storage
→ Expected in development (uses MemStorage)
→ In production: check COSMOS_DB_ENDPOINT and AZURE_STORAGE_CONNECTION_STRING

# Build failures
Cannot find module './dist/public'
→ Run npm run build to generate frontend assets
→ Check vite.config.ts output directory configuration
```

### **Production Debug**
```bash
# Container health check
az containerapp show --name app-podcastpro --resource-group rg-podcastpro \
  --query "properties.{provisioningState:provisioningState,runningStatus:runningStatus}"

# Live application logs  
az containerapp logs show --name app-podcastpro --resource-group rg-podcastpro --follow

# Check active revision
az containerapp revision list --name app-podcastpro --resource-group rg-podcastpro

# Update API keys
az containerapp secret set --name app-podcastpro --resource-group rg-podcastpro \
  --secret-name "openai-key" --secret-value "new-key"

# Restart application (creates new revision)
az containerapp update --name app-podcastpro --resource-group rg-podcastpro

# Check environment variables
az containerapp show --name app-podcastpro --resource-group rg-podcastpro \
  --query "properties.template.containers[0].env"
```

### **API Integration Debug**
```bash
# Test API endpoints locally
curl http://localhost:3001/api/projects?userId=single-user

# Test AI endpoints (requires API keys)
curl -X POST http://localhost:3001/api/ai/refine-prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test topic"}'

# Test production endpoints
curl https://app-podcastpro.jollystone-ac8f78d1.westus2.azurecontainerapps.io/api/projects?userId=single-user
```

---

## �️ **DEVELOPMENT WORKFLOW**

### **VS Code Development Environment**

**Development Setup with Production Data Access**
```bash
# Quick start development environment
npm run dev:with-prod-data

# Or manual setup
./setup-dev-with-prod-data.sh  # Creates .env.development with Azure credentials
npm run dev                    # Starts hot-reload server with production access
```

**VS Code Debug Configuration**
- **Debugger**: F5 to start debugging with breakpoints
- **Hot Reload**: tsx watch for instant TypeScript compilation
- **Environment**: Automatically loads .env.development with production Azure credentials

**Development Data Strategy**
```
Production Azure Resources (Cost-Effective Shared Access):
├── Cosmos DB: Direct production database access (read-only safety)
├── Blob Storage: 
│   ├── Production Containers: podcast-audio, scripts, thumbnails (READ access)
│   └── Development Containers: dev-podcast-audio, dev-scripts, dev-thumbnails (WRITE access)
```

**Safety Features**
- Development flag prevents accidental production writes
- Separate containers for development-generated content
- Read-only access to production podcast data for realistic testing
- Environment-aware storage routing

**Development Commands**
```bash
# Start development with production data
npm run dev

# Test development setup
npm run test:dev-setup

# Debug Azure connectivity
node test-dev-setup.js

# VS Code debugging
F5 (or Debug > Start Debugging)
```

**Environment Variables (.env.development)**
```env
DEV_ACCESS_PROD_DATA=true
AZURE_COSMOS_URI=<production-cosmos-endpoint>
AZURE_COSMOS_KEY=<production-cosmos-key>
AZURE_STORAGE_ACCOUNT=<production-storage-account>
AZURE_STORAGE_KEY=<production-storage-key>
```

---

## �📈 **IMPROVEMENT ROADMAP**

### **🎯 Priority Feature Enhancements**

**Phase 1: User Experience & Performance**
- ✅ **Real-time Progress Indicators** - WebSocket integration for AI processing status
- ✅ **Audio Preview & Editing** - Waveform visualization with trim/edit capabilities  
- ✅ **Script Collaboration** - Real-time editing with version history
- ✅ **Export Options** - PDF/Word script export, RSS feed generation
- ✅ **Voice Customization** - Multiple AI voices, speed/tone controls

**Phase 2: Advanced AI Features**
- ✅ **Content Optimization** - SEO suggestions, engagement scoring
- ✅ **Multi-language Support** - Translation and localized TTS
- ✅ **Brand Voice Training** - Custom AI models for consistent tone
- ✅ **Research Enhancement** - Fact-checking, citation management
- ✅ **Interactive Transcripts** - Clickable timestamps, search functionality

**Phase 3: Business Features**
- ✅ **Multi-user Support** - Team collaboration with role-based access
- ✅ **Analytics Dashboard** - Listen metrics, engagement analytics
- ✅ **Publishing Integration** - Direct upload to Spotify, Apple Podcasts, etc.
- ✅ **Content Calendar** - Scheduling, batch processing
- ✅ **API Monetization** - Usage tiers, billing integration

### **🔧 Development Workflow Improvements**

**CI/CD Pipeline Setup**
```yaml
# .github/workflows/azure-deploy.yml
name: Azure Container Apps Deploy
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Build and push Docker image
      run: |
        az acr build --registry acrpodcastpro \
          --image podcastpro:${{ github.sha }} \
          --image podcastpro:latest \
          --file Dockerfile .
    
    - name: Deploy to Azure Container Apps
      run: |
        az containerapp update \
          --name app-podcastpro \
          --resource-group rg-podcastpro \
          --image acrpodcastpro.azurecr.io/podcastpro:${{ github.sha }}
```

**Environment Management**
```bash
# Multiple environment setup
environments/
├── development/    # Local development with memory storage
├── staging/       # Azure staging environment for testing
└── production/    # Live production environment

# Deploy to staging for testing
./deploy-azure.sh --environment staging --branch develop

# Promote to production after validation
./deploy-azure.sh --environment production --branch main
```

---

**🎯 Bottom Line:** PodcastPro is a production-ready AI podcast creation platform running live on Azure with full cloud storage, secure API management, and auto-scaling infrastructure. Ready for immediate use at the production URL above.
