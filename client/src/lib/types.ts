import type { Project, VoiceSettings, ScriptAnalytics, ResearchData } from "@shared/schema";

export interface ProjectState {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
}

export interface AIProcessingState {
  isRefiningPrompt: boolean;
  isResearching: boolean;
  isGeneratingScript: boolean;
  isGeneratingAudio: boolean;
  error: string | null;
}

export interface ScriptSection {
  id: string;
  type: "introduction" | "main" | "conclusion" | "transition";
  content: string;
  duration: number;
  order: number;
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioUrl: string | null;
  waveformData: number[];
}

export interface AISuggestion {
  id: string;
  type: "transition" | "engagement" | "flow" | "conclusion";
  suggestion: string;
  targetSection: string;
  applied: boolean;
}
