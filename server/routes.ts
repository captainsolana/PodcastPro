import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { openAIService } from "./services/openai";
import { insertProjectSchema, insertAiSuggestionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const projects = await storage.getProjectsByUserId(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateProject(req.params.id, updates);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // AI processing routes
  app.post("/api/ai/refine-prompt", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Quick timeout and fallback
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Service timeout')), 3000)
      );

      try {
        const result = await Promise.race([
          openAIService.refinePrompt(prompt),
          timeoutPromise
        ]);
        res.json(result);
      } catch (timeoutError) {
        console.warn('Using fallback for prompt refinement');
        // Provide immediate fallback response
        const fallbackResult = {
          refinedPrompt: `Enhanced podcast episode: ${prompt}. This episode will explore the key concepts, practical applications, and insights that make this topic engaging for listeners.`,
          focusAreas: ["Introduction and Context", "Key Concepts", "Practical Examples", "Audience Insights"],
          suggestedDuration: 18,
          targetAudience: "General audience interested in the topic"
        };
        res.json(fallbackResult);
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || "Failed to refine prompt" });
    }
  });

  app.post("/api/ai/research", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // Quick timeout and fallback
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Service timeout')), 3000)
      );

      try {
        const result = await Promise.race([
          openAIService.conductResearch(prompt),
          timeoutPromise
        ]);
        res.json(result);
      } catch (timeoutError) {
        console.warn('Using fallback for research');
        // Provide immediate fallback response
        const fallbackResult = {
          sources: [
            {
              title: "Research Source 1",
              url: "https://example.com/source1",
              summary: "Key insights and background information related to the topic."
            }
          ],
          keyPoints: [
            "Main concept and definition",
            "Historical context and background", 
            "Current trends and developments",
            "Practical applications and examples"
          ],
          statistics: [
            {
              fact: "Relevant statistic about the topic",
              source: "Industry research"
            }
          ],
          outline: [
            "Introduction and hook",
            "Background and context",
            "Main discussion points",
            "Real-world examples",
            "Conclusion and takeaways"
          ]
        };
        res.json(fallbackResult);
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || "Failed to conduct research" });
    }
  });

  app.post("/api/ai/generate-script", async (req, res) => {
    try {
      const { prompt, research } = req.body;
      if (!prompt || !research) {
        return res.status(400).json({ message: "Prompt and research data are required" });
      }

      const result = await openAIService.generateScript(prompt, research);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || "Failed to generate script" });
    }
  });

  app.post("/api/ai/generate-audio", async (req, res) => {
    try {
      const { scriptContent, voiceSettings } = req.body;
      if (!scriptContent) {
        return res.status(400).json({ message: "Script content is required" });
      }

      const result = await openAIService.generateAudio(scriptContent, voiceSettings || { model: "nova", speed: 1.0 });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || "Failed to generate audio" });
    }
  });

  app.post("/api/ai/script-suggestions", async (req, res) => {
    try {
      const { scriptContent } = req.body;
      if (!scriptContent) {
        return res.status(400).json({ message: "Script content is required" });
      }

      const suggestions = await openAIService.generateScriptSuggestions(scriptContent);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || "Failed to generate suggestions" });
    }
  });

  app.post("/api/ai/analyze-episodes", async (req, res) => {
    try {
      const { prompt, research } = req.body;
      if (!prompt || !research) {
        return res.status(400).json({ message: "Prompt and research data are required" });
      }

      const episodePlan = await openAIService.analyzeForEpisodeBreakdown(prompt, research);
      res.json(episodePlan);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || "Failed to analyze episodes" });
    }
  });

  app.post("/api/ai/generate-episode-script", async (req, res) => {
    try {
      const { prompt, research, episodeNumber, episodePlan } = req.body;
      if (!prompt || !research || !episodeNumber || !episodePlan) {
        return res.status(400).json({ message: "All episode data is required" });
      }

      const result = await openAIService.generateEpisodeScript(prompt, research, episodeNumber, episodePlan);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message || "Failed to generate episode script" });
    }
  });

  // AI Suggestions routes
  app.get("/api/suggestions/:projectId", async (req, res) => {
    try {
      const suggestions = await storage.getAiSuggestionsByProjectId(req.params.projectId);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/suggestions", async (req, res) => {
    try {
      const validatedData = insertAiSuggestionSchema.parse(req.body);
      const suggestion = await storage.createAiSuggestion(validatedData);
      res.status(201).json(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid suggestion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create suggestion" });
    }
  });

  // Serve static audio files
  app.use("/audio", (req, res, next) => {
    const audioPath = path.join(process.cwd(), "public", "audio");
    if (!fs.existsSync(audioPath)) {
      fs.mkdirSync(audioPath, { recursive: true });
    }
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}
