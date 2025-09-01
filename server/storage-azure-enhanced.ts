import { CosmosClient, Database, Container } from '@azure/cosmos';
import { BlobServiceClient } from '@azure/storage-blob';
import { 
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject,
  type AiSuggestion,
  type InsertAiSuggestion 
} from "../shared/schema.js";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage.js";

interface AzureStorageConfig {
  cosmosEndpoint: string;
  cosmosKey: string;
  storageConnectionString: string;
  environment: 'development' | 'staging' | 'production';
  databaseName?: string;
  containerPrefix?: string;
  audioContainerName?: string;
}

export class AzureCosmosStorage implements IStorage {
  private cosmosClient: CosmosClient;
  private database: Database;
  private projectsContainer: Container;
  private usersContainer: Container;
  private suggestionsContainer: Container;
  private blobServiceClient: BlobServiceClient;
  private audioContainer: string;
  private environment: string;
  private config: AzureStorageConfig;

  constructor(config?: Partial<AzureStorageConfig>) {
    // Determine environment and configuration
    this.environment = process.env.NODE_ENV || 'development';
    
    this.config = {
      cosmosEndpoint: process.env.COSMOS_DB_ENDPOINT!,
      cosmosKey: process.env.COSMOS_DB_KEY!,
      storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING!,
      environment: this.environment as 'development' | 'staging' | 'production',
      databaseName: this.getDatabaseName(),
      containerPrefix: this.getContainerPrefix(),
      audioContainerName: this.getAudioContainerName(),
      ...config
    };

    console.log(`🔧 Initializing Azure storage for ${this.config.environment} environment`);
    console.log(`📊 Database: ${this.config.databaseName}`);
    console.log(`📁 Container prefix: ${this.config.containerPrefix}`);
    console.log(`🎵 Audio container: ${this.config.audioContainerName}`);

    // Initialize clients
    this.cosmosClient = new CosmosClient({
      endpoint: this.config.cosmosEndpoint,
      key: this.config.cosmosKey,
    });

    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.config.storageConnectionString
    );

    this.audioContainer = this.config.audioContainerName!;
    this.initializeDatabase();
  }

  private getDatabaseName(): string {
    switch (this.environment) {
      case 'development':
        return process.env.DEV_ACCESS_PROD_DATA === 'true' 
          ? 'PodcastPro'  // Access production database in read-only mode
          : 'PodcastPro-dev';
      case 'staging':
        return 'PodcastPro-staging';
      case 'production':
        return 'PodcastPro';
      default:
        return 'PodcastPro-dev';
    }
  }

  private getContainerPrefix(): string {
    switch (this.environment) {
      case 'development':
        return process.env.DEV_ACCESS_PROD_DATA === 'true' 
          ? ''  // No prefix for production data access
          : 'dev-';
      case 'staging':
        return 'staging-';
      case 'production':
        return '';
      default:
        return 'dev-';
    }
  }

  private getAudioContainerName(): string {
    switch (this.environment) {
      case 'development':
        return process.env.DEV_ACCESS_PROD_DATA === 'true'
          ? 'audio-files'  // Access production audio files
          : 'audio-files-dev';
      case 'staging':
        return 'audio-files-staging';
      case 'production':
        return 'audio-files';
      default:
        return 'audio-files-dev';
    }
  }

  private async initializeDatabase() {
    try {
      // Create database if it doesn't exist (dev/staging only)
      if (this.environment !== 'production' || process.env.DEV_ACCESS_PROD_DATA !== 'true') {
        const { database } = await this.cosmosClient.databases.createIfNotExists({
          id: this.config.databaseName!
        });
        this.database = database;
      } else {
        // Just connect to existing production database
        this.database = this.cosmosClient.database(this.config.databaseName!);
      }

      // Initialize containers
      await this.initializeContainers();

      // Initialize blob storage
      await this.initializeBlobStorage();

      console.log(`✅ Azure storage initialized successfully for ${this.environment}`);
    } catch (error) {
      console.error('❌ Failed to initialize Azure storage:', error);
      throw error;
    }
  }

  private async initializeContainers() {
    const containerPrefix = this.config.containerPrefix!;
    
    // Projects container
    if (this.environment === 'production' || process.env.DEV_ACCESS_PROD_DATA === 'true') {
      this.projectsContainer = this.database.container('projects');
    } else {
      const { container: projectsContainer } = await this.database.containers.createIfNotExists({
        id: `${containerPrefix}projects`,
        partitionKey: '/userId'
      });
      this.projectsContainer = projectsContainer;
    }

    // Users container
    if (this.environment === 'production' || process.env.DEV_ACCESS_PROD_DATA === 'true') {
      this.usersContainer = this.database.container('users');
    } else {
      const { container: usersContainer } = await this.database.containers.createIfNotExists({
        id: `${containerPrefix}users`,
        partitionKey: '/id'
      });
      this.usersContainer = usersContainer;
    }

    // AI Suggestions container
    if (this.environment === 'production' || process.env.DEV_ACCESS_PROD_DATA === 'true') {
      this.suggestionsContainer = this.database.container('ai-suggestions');
    } else {
      const { container: suggestionsContainer } = await this.database.containers.createIfNotExists({
        id: `${containerPrefix}ai-suggestions`,
        partitionKey: '/projectId'
      });
      this.suggestionsContainer = suggestionsContainer;
    }
  }

  private async initializeBlobStorage() {
    try {
      // Create audio container if it doesn't exist (dev/staging only)
      if (this.environment !== 'production' || process.env.DEV_ACCESS_PROD_DATA !== 'true') {
        const containerClient = this.blobServiceClient.getContainerClient(this.audioContainer);
        await containerClient.createIfNotExists({
          access: 'blob' // Public read access for audio files
        });
        console.log(`📁 Created/verified blob container: ${this.audioContainer}`);
      } else {
        console.log(`📁 Using production blob container: ${this.audioContainer}`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize blob storage:', error);
      throw error;
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const { resource } = await this.usersContainer.item(id, id).read<User>();
      return resource;
    } catch (error: any) {
      if (error.code === 404) return undefined;
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { resources } = await this.usersContainer.items
        .query<User>({
          query: 'SELECT * FROM c WHERE c.username = @username',
          parameters: [{ name: '@username', value: username }]
        })
        .fetchAll();
      
      return resources[0];
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Don't create users in production data when in dev mode
    if (this.environment === 'development' && process.env.DEV_ACCESS_PROD_DATA === 'true') {
      throw new Error('Cannot create users when accessing production data in development mode');
    }

    const user: User = {
      id: randomUUID(),
      ...userData,
      createdAt: new Date()
    };

    try {
      const { resource } = await this.usersContainer.items.create<User>(user);
      return resource!;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    try {
      // Try to find the project across all user partitions if needed
      const { resources } = await this.projectsContainer.items
        .query<Project>({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id }]
        })
        .fetchAll();
      
      return resources[0];
    } catch (error: any) {
      if (error.code === 404) return undefined;
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    try {
      const { resources } = await this.projectsContainer.items
        .query<Project>({
          query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
          parameters: [{ name: '@userId', value: userId }]
        })
        .fetchAll();
      
      return resources;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    // Allow project creation in dev mode even with prod data access
    // but create in dev containers if we're not in production
    const project: Project = {
      id: randomUUID(),
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const { resource } = await this.projectsContainer.items.create<Project>(project);
      return resource!;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    try {
      const existingProject = await this.getProject(id);
      if (!existingProject) return undefined;

      const updatedProject: Project = {
        ...existingProject,
        ...updates,
        updatedAt: new Date()
      };

      const { resource } = await this.projectsContainer
        .item(id, existingProject.userId)
        .replace<Project>(updatedProject);
      
      return resource;
    } catch (error) {
      console.error('Error updating project:', error);
      return undefined;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    // Don't allow deletion in production data when in dev mode
    if (this.environment === 'development' && process.env.DEV_ACCESS_PROD_DATA === 'true') {
      console.warn('Cannot delete projects when accessing production data in development mode');
      return false;
    }

    try {
      const project = await this.getProject(id);
      if (!project) return false;

      await this.projectsContainer.item(id, project.userId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // AI Suggestion methods
  async getAiSuggestionsByProjectId(projectId: string): Promise<AiSuggestion[]> {
    try {
      const { resources } = await this.suggestionsContainer.items
        .query<AiSuggestion>({
          query: 'SELECT * FROM c WHERE c.projectId = @projectId ORDER BY c.createdAt DESC',
          parameters: [{ name: '@projectId', value: projectId }]
        })
        .fetchAll();
      
      return resources;
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      return [];
    }
  }

  async createAiSuggestion(suggestionData: InsertAiSuggestion): Promise<AiSuggestion> {
    const suggestion: AiSuggestion = {
      id: randomUUID(),
      ...suggestionData,
      createdAt: new Date()
    };

    try {
      const { resource } = await this.suggestionsContainer.items.create<AiSuggestion>(suggestion);
      return resource!;
    } catch (error) {
      console.error('Error creating AI suggestion:', error);
      throw error;
    }
  }

  async updateAiSuggestion(id: string, updates: Partial<AiSuggestion>): Promise<AiSuggestion | undefined> {
    try {
      // First find the suggestion
      const { resources } = await this.suggestionsContainer.items
        .query<AiSuggestion>({
          query: 'SELECT * FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: id }]
        })
        .fetchAll();
      
      const existingSuggestion = resources[0];
      if (!existingSuggestion) return undefined;

      const updatedSuggestion: AiSuggestion = {
        ...existingSuggestion,
        ...updates
      };

      const { resource } = await this.suggestionsContainer
        .item(id, existingSuggestion.projectId)
        .replace<AiSuggestion>(updatedSuggestion);
      
      return resource;
    } catch (error) {
      console.error('Error updating AI suggestion:', error);
      return undefined;
    }
  }

  // Audio file methods
  async uploadAudioFile(filename: string, audioBuffer: Buffer): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.audioContainer);
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      
      await blockBlobClient.upload(audioBuffer, audioBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'audio/mpeg'
        }
      });

      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading audio file:', error);
      throw error;
    }
  }

  async getAudioFileUrl(filename: string): Promise<string> {
    const containerClient = this.blobServiceClient.getContainerClient(this.audioContainer);
    const blockBlobClient = containerClient.getBlockBlobClient(filename);
    return blockBlobClient.url;
  }

  async deleteAudioFile(filename: string): Promise<boolean> {
    // Don't allow deletion in production data when in dev mode
    if (this.environment === 'development' && process.env.DEV_ACCESS_PROD_DATA === 'true') {
      console.warn('Cannot delete audio files when accessing production data in development mode');
      return false;
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.audioContainer);
      const blockBlobClient = containerClient.getBlockBlobClient(filename);
      
      await blockBlobClient.delete();
      return true;
    } catch (error) {
      console.error('Error deleting audio file:', error);
      return false;
    }
  }
}
