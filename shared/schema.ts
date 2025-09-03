import { sql } from "drizzle-orm";
import { pgTable, text, varchar, json, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  phase: integer("phase").notNull().default(1), // 1=prompt/research, 2=script, 3=audio
  status: text("status").notNull().default("draft"), // draft, completed, error
  originalPrompt: text("original_prompt"),
  refinedPrompt: text("refined_prompt"),
  researchData: json("research_data"),
  episodePlan: json("episode_plan"), // Multi-episode breakdown plan
  currentEpisode: integer("current_episode").default(1),
  scriptContent: text("script_content"), // Legacy single script or current episode script
  episodeScripts: json("episode_scripts"), // Per-episode script storage: { "1": "script1", "2": "script2" }
  scriptAnalytics: json("script_analytics"),
  audioUrl: text("audio_url"), // Legacy single audio or current episode audio
  episodeAudioUrls: json("episode_audio_urls"), // Per-episode audio storage: { "1": "url1", "2": "url2" }
  voiceSettings: json("voice_settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id),
  type: text("type").notNull(), // prompt_refinement, script_improvement, voice_optimization
  content: text("content").notNull(),
  applied: boolean("applied").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;

// Additional types for the application
export type VoiceSettings = {
  model: "alloy" | "echo" | "fable" | "nova" | "onyx" | "shimmer";
  speed: number;
  // Enhanced voice settings for Phase 1
  personality?: string;
  pitch?: number;
  emphasis?: number;
  pause_length?: number;
  breathing?: boolean;
  emotions?: {
    enthusiasm: number;
    calmness: number;
    confidence: number;
  };
  pronunciation?: Record<string, string>;
};

export type ScriptAnalytics = {
  wordCount: number;
  readingTime: number;
  speechTime: number;
  pauseCount: number;
};

export type ResearchData = {
  sources: Array<{ title: string; url: string; summary: string }>;
  keyPoints: string[];
  statistics: Array<{ fact: string; source: string }>;
  outline: string[];
};

// Validation schema for research data
export const researchDataSchema = z.object({
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    summary: z.string()
  })),
  keyPoints: z.array(z.string()),
  statistics: z.array(z.object({
    fact: z.string(),
    source: z.string()
  })),
  outline: z.array(z.string())
});

export type EpisodePlan = {
  isMultiEpisode: boolean;
  totalEpisodes: number;
  episodes: Array<{
    episodeNumber: number;
    title: string;
    description: string;
    keyTopics: string[];
    estimatedDuration: number;
    status: "planned" | "in_progress" | "completed";
  }>;
  reasoning: string;
};
