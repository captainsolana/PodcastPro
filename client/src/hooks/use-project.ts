import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
      const response = await apiRequest("POST", "/api/projects", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const response = await apiRequest("PATCH", `/api/projects/${id}`, updates);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", data.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const refinePromptMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/ai/refine-prompt", { prompt });
      return response.json();
    },
  });

  const conductResearchMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/ai/research", { prompt });
      return response.json();
    },
  });

  const generateScriptMutation = useMutation({
    mutationFn: async ({ prompt, research }: { prompt: string; research: any }) => {
      const response = await apiRequest("POST", "/api/ai/generate-script", { prompt, research });
      return response.json();
    },
  });

  const generateAudioMutation = useMutation({
    mutationFn: async ({ scriptContent, voiceSettings }: { scriptContent: string; voiceSettings: any }) => {
      const response = await apiRequest("POST", "/api/ai/generate-audio", { scriptContent, voiceSettings });
      return response.json();
    },
  });

  const generateSuggestionsMutation = useMutation({
    mutationFn: async (scriptContent: string) => {
      const response = await apiRequest("POST", "/api/ai/script-suggestions", { scriptContent });
      return response.json();
    },
  });

  const analyzeEpisodesMutation = useMutation({
    mutationFn: async ({ prompt, research }: { prompt: string; research: any }) => {
      const response = await apiRequest("POST", "/api/ai/analyze-episodes", { prompt, research });
      return response.json();
    },
  });

  const generateEpisodeScriptMutation = useMutation({
    mutationFn: async ({ prompt, research, episodeNumber, episodePlan }: { prompt: string; research: any; episodeNumber: number; episodePlan: any }) => {
      const response = await apiRequest("POST", "/api/ai/generate-episode-script", { prompt, research, episodeNumber, episodePlan });
      return response.json();
    },
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
    generateSuggestions: generateSuggestionsMutation.mutate,
    analyzeEpisodes: analyzeEpisodesMutation.mutate,
    generateEpisodeScript: generateEpisodeScriptMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isRefiningPrompt: refinePromptMutation.isPending,
    isResearching: conductResearchMutation.isPending,
    isGeneratingScript: generateScriptMutation.isPending,
    isGeneratingAudio: generateAudioMutation.isPending,
    isGeneratingSuggestions: generateSuggestionsMutation.isPending,
    isAnalyzingEpisodes: analyzeEpisodesMutation.isPending,
    isGeneratingEpisodeScript: generateEpisodeScriptMutation.isPending,
    refinePromptResult: refinePromptMutation.data,
    researchResult: conductResearchMutation.data,
    scriptResult: generateScriptMutation.data,
    audioResult: generateAudioMutation.data,
    suggestionsResult: generateSuggestionsMutation.data,
    episodeAnalysisResult: analyzeEpisodesMutation.data,
    episodeScriptResult: generateEpisodeScriptMutation.data,
  };
}

export function useProjects(userId?: string) {
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["/api/projects", userId],
    queryFn: () => apiRequest(`/api/projects?userId=${userId}`),
    enabled: !!userId,
  });

  return {
    projects: Array.isArray(projects) ? projects as Project[] : [],
    isLoading,
    error,
  };
}
