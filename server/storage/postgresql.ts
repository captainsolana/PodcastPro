import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { users, projects, aiSuggestions } from "../../shared/schema.js";
import { 
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject,
  type AiSuggestion,
  type InsertAiSuggestion 
} from "../../shared/schema.js";
import { eq } from "drizzle-orm";
import { IStorage } from "../storage";

export class PostgreSQLStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor(connectionString: string) {
    const pool = new Pool({ connectionString });
    this.db = drizzle(pool);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(user)
      .returning();
    
    return result[0];
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    const result = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    
    return result[0];
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const result = await this.db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(projects.updatedAt);
    
    return result;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await this.db
      .insert(projects)
      .values(project)
      .returning();
    
    return result[0];
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const result = await this.db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await this.db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    
    return result.length > 0;
  }

  // AI Suggestion methods
  async getAiSuggestionsByProjectId(projectId: string): Promise<AiSuggestion[]> {
    const result = await this.db
      .select()
      .from(aiSuggestions)
      .where(eq(aiSuggestions.projectId, projectId))
      .orderBy(aiSuggestions.createdAt);
    
    return result;
  }

  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const result = await this.db
      .insert(aiSuggestions)
      .values(suggestion)
      .returning();
    
    return result[0];
  }

  async updateAiSuggestion(id: string, updates: Partial<AiSuggestion>): Promise<AiSuggestion | undefined> {
    const result = await this.db
      .update(aiSuggestions)
      .set(updates)
      .where(eq(aiSuggestions.id, id))
      .returning();
    
    return result[0];
  }
}
