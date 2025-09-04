import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, resilientApiRequest } from "@/lib/queryClient";
import type { Project, InsertProject } from "@shared/schema";
import type { ProjectState, AIProcessingState } from "@/lib/types";

export function useProject(projectId?: string) {
  const queryClient = useQueryClient();
  
  const { data: project, isLoading, error } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
  const response = await resilientApiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
  const response = await resilientApiRequest("PATCH", `/api/projects/${id}`, updates);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", data.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const refinePromptMutation = useMutation({
    mutationFn: async (prompt: string) => {
  const response = await resilientApiRequest("POST", "/api/ai/refine-prompt", { prompt });
      return response.json();
    },
  });

  const conductResearchMutation = useMutation({
    mutationFn: async (prompt: string) => {
  const response = await resilientApiRequest("POST", "/api/ai/research", { prompt });
      return response.json();
    },
  });

  const generateScriptMutation = useMutation({
    mutationFn: async ({ prompt, research }: { prompt: string; research: any }) => {
      console.log("Calling generateScript API with:", { prompt: prompt.substring(0, 100) + "...", research: research ? "present" : "missing" });
  const response = await resilientApiRequest("POST", "/api/ai/generate-script", { prompt, research });
      const result = await response.json();
      console.log("Script generation result:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Script generated successfully:", data);
    },
    onError: (error) => {
      console.error("Script generation failed:", error);
    }
  });

  const generateAudioMutation = useMutation({
    mutationFn: async ({ scriptContent, voiceSettings }: { scriptContent: string; voiceSettings: any }) => {
      console.log('🎵 Calling audio generation API with:', { scriptContentLength: scriptContent.length, voiceSettings });
  const response = await resilientApiRequest("POST", "/api/ai/generate-audio", { scriptContent, voiceSettings });
      const result = await response.json();
      console.log('🎵 Audio generation API response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🎵 Audio generation mutation succeeded:', data);
    },
    onError: (error) => {
      console.error('🎵 Audio generation mutation failed:', error);
    }
  });

  const generateAudioSegmentMutation = useMutation({
    mutationFn: async ({ segmentText, voiceSettings, segmentIndex }: { segmentText: string; voiceSettings: any; segmentIndex: number }) => {
      console.log('🎵 Calling segment audio generation API with:', { segmentIndex, length: segmentText.length });
      const response = await resilientApiRequest("POST", "/api/ai/generate-audio-segment", { segmentText, voiceSettings, segmentIndex });
      const result = await response.json();
      console.log('🎵 Segment audio generation API response:', result);
      return result;
    },
    onError: (error) => {
      console.error('🎵 Segment audio generation mutation failed:', error);
    }
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (scriptContent: string) => {
  const response = await resilientApiRequest("POST", "/api/ai/script-suggestions", { scriptContent });
      return response.json();
    },
  });

  const analyzeEpisodesMutation = useMutation({
    mutationFn: async ({ prompt, research }: { prompt: string; research: any }) => {
  const response = await resilientApiRequest("POST", "/api/ai/analyze-episodes", { prompt, research });
      return response.json();
    },
  });

  const generateEpisodeScriptMutation = useMutation({
    mutationFn: async ({ prompt, research, episodeNumber, episodePlan }: { prompt: string; research: any; episodeNumber: number; episodePlan: any }) => {
      console.log("Calling generateEpisodeScript API with:", { 
        prompt: prompt.substring(0, 100) + "...", 
        research: research ? "present" : "missing",
        episodeNumber,
        episodePlan: episodePlan ? "present" : "missing"
      });
  const response = await resilientApiRequest("POST", "/api/ai/generate-episode-script", { prompt, research, episodeNumber, episodePlan });
      const result = await response.json();
      console.log("Episode script generation result:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Episode script generated successfully:", data);
    },
    onError: (error) => {
      console.error("Episode script generation failed:", error);
    }
  });

  return {
    project: project as Project,
    isLoading,
    error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    refinePrompt: refinePromptMutation.mutate,
    conductResearch: conductResearchMutation.mutate,
    generateScript: generateScriptMutation.mutate,
    generateAudio: generateAudioMutation.mutate,
  generateAudioSegment: generateAudioSegmentMutation.mutate,
    generateSuggestions: generateSuggestionsMutation.mutate,
    analyzeEpisodes: analyzeEpisodesMutation.mutate,
    generateEpisodeScript: generateEpisodeScriptMutation.mutate,
    // Reset functions for clearing mutation state
    resetScriptGeneration: generateScriptMutation.reset,
    resetEpisodeScriptGeneration: generateEpisodeScriptMutation.reset,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isRefiningPrompt: refinePromptMutation.isPending,
    isResearching: conductResearchMutation.isPending,
    isGeneratingScript: generateScriptMutation.isPending,
    isGeneratingAudio: generateAudioMutation.isPending,
  isGeneratingAudioSegment: generateAudioSegmentMutation.isPending,
    isGeneratingSuggestions: generateSuggestionsMutation.isPending,
    isAnalyzingEpisodes: analyzeEpisodesMutation.isPending,
    isGeneratingEpisodeScript: generateEpisodeScriptMutation.isPending,
    refinePromptResult: refinePromptMutation.data,
    researchResult: conductResearchMutation.data,
    scriptResult: generateScriptMutation.data,
    audioResult: generateAudioMutation.data,
  audioSegmentResult: generateAudioSegmentMutation.data,
    suggestionsResult: generateSuggestionsMutation.data,
    episodeAnalysisResult: analyzeEpisodesMutation.data,
    episodeScriptResult: generateEpisodeScriptMutation.data,
  };
}

export function useProjects(userId?: string) {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await apiRequest("/api/projects");
      return response.json();
    },
  });

  return {
    projects: Array.isArray(projects) ? projects as Project[] : [],
    isLoading,
    error,
  };
}
