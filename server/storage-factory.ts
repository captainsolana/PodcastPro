import { PostgreSQLStorage } from "./storage/postgresql";
import { AzureBlobStorageService } from "./storage/azure-blob";
import { MemStorage, IStorage } from "./storage";

export class HybridAzureStorage implements IStorage {
  private dbStorage: PostgreSQLStorage;
  private blobStorage: AzureBlobStorageService;

  constructor(databaseUrl: string, blobConnectionString: string) {
    this.dbStorage = new PostgreSQLStorage(databaseUrl);
    this.blobStorage = new AzureBlobStorageService(blobConnectionString);
  }

  async initialize(): Promise<void> {
    await this.blobStorage.initialize();
  }

  // Delegate all database operations to PostgreSQL storage
  async getUser(id: string) {
    return this.dbStorage.getUser(id);
  }

  async getUserByUsername(username: string) {
    return this.dbStorage.getUserByUsername(username);
  }

  async createUser(user: any) {
    return this.dbStorage.createUser(user);
  }

  async getProject(id: string) {
    return this.dbStorage.getProject(id);
  }

  async getProjectsByUserId(userId: string) {
    return this.dbStorage.getProjectsByUserId(userId);
  }

  async createProject(project: any) {
    return this.dbStorage.createProject(project);
  }

  async updateProject(id: string, updates: any) {
    return this.dbStorage.updateProject(id, updates);
  }

  async deleteProject(id: string) {
    return this.dbStorage.deleteProject(id);
  }

  async getAiSuggestionsByProjectId(projectId: string) {
    return this.dbStorage.getAiSuggestionsByProjectId(projectId);
  }

  async createAiSuggestion(suggestion: any) {
    return this.dbStorage.createAiSuggestion(suggestion);
  }

  async updateAiSuggestion(id: string, updates: any) {
    return this.dbStorage.updateAiSuggestion(id, updates);
  }

  // Audio file operations using Azure Blob Storage
  async uploadAudioFile(buffer: Buffer, fileName?: string): Promise<string> {
    return this.blobStorage.uploadAudioFile(buffer, fileName);
  }

  async deleteAudioFile(fileName: string): Promise<boolean> {
    return this.blobStorage.deleteAudioFile(fileName);
  }

  async getAudioFileUrl(fileName: string): Promise<string> {
    return this.blobStorage.getAudioFileUrl(fileName);
  }
}

// Storage factory function
export function createStorage(): IStorage {
  const env = process.env.NODE_ENV || "development";
  
  if (env === "production" && process.env.DATABASE_URL && process.env.AZURE_STORAGE_CONNECTION_STRING) {
    // Use Azure PostgreSQL + Blob Storage in production
    return new HybridAzureStorage(
      process.env.DATABASE_URL,
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
  } else if (process.env.DATABASE_URL) {
    // Use PostgreSQL only (for testing)
    return new PostgreSQLStorage(process.env.DATABASE_URL);
  } else {
    // Fall back to in-memory storage for development
    console.warn("⚠️  Using in-memory storage - data will not persist!");
    return new MemStorage();
  }
}
