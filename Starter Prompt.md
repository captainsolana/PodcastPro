# Podcast Maker

## Overview

Podcast Maker is a full-stack web application that uses AI to help users create professional podcasts through a guided three-phase process. Users can input a topic or idea, and the system guides them through prompt refinement and research (Phase 1), script generation and editing (Phase 2), and audio generation with voice customization (Phase 3). The application features a modern, responsive UI built with React and shadcn/ui components, backed by an Express.js server with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built with React and TypeScript using Vite as the build tool. It follows a component-based architecture with:
- **Routing**: Uses Wouter for lightweight client-side routing with pages for Home, Project details, and 404 handling
- **State Management**: TanStack Query (React Query) for server state management and caching, with custom hooks for project operations
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Phase-based Workflow**: Three distinct phases (Prompt/Research, Script Generation, Audio Generation) with dedicated components for each

### Backend Architecture  
The server uses Express.js with TypeScript in ESM format:
- **API Design**: RESTful endpoints for projects, users, and AI operations with comprehensive error handling
- **Storage Layer**: Abstracted storage interface supporting both in-memory (development) and database implementations
- **AI Integration**: OpenAI service integration for prompt refinement, research, script generation, and audio synthesis
- **Development Setup**: Vite middleware integration for hot reload and seamless full-stack development

### Data Storage
Database schema managed by Drizzle ORM with PostgreSQL:
- **Users Table**: Basic user authentication with username/password
- **Projects Table**: Core project data with phase tracking, content storage (prompts, scripts, research), and metadata
- **AI Suggestions Table**: AI-generated recommendations linked to projects with application tracking
- **Schema Validation**: Zod schemas for runtime type checking and API validation

### Authentication and Authorization
Currently implements a simplified authentication system:
- Basic user management with username/password storage
- Session-based authentication preparation (connect-pg-simple for session storage)
- User-scoped project access control

## External Dependencies

### AI Services
- **OpenAI API**: GPT-5 model integration for prompt refinement, content research, script generation, and text-to-speech conversion
- **Voice Synthesis**: OpenAI's TTS models with configurable voice settings (model, speed, voice type)

### Database
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database queries with schema management and migrations

### UI and Styling  
- **shadcn/ui**: Comprehensive component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Headless component primitives for accessibility and behavior
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Vite**: Fast build tool with HMR and development server
- **TypeScript**: Static type checking across the entire stack
- **React Query**: Server state management with caching and background updates
- **Local Development**: Optimized development environment and error handling