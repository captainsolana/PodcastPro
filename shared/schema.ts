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
  scriptContent: text("script_content"),
  scriptAnalytics: json("script_analytics"),
  audioUrl: text("audio_url"),
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
  model: "coral" | "nova" | "shimmer";
  speed: number;
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
};
