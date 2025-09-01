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
import type { IStorage } from "./storage";

export class AzureCosmosStorage implements IStorage {
  private cosmosClient: CosmosClient;
  private database: Database;
  private projectsContainer: Container;
  private usersContainer: Container;
  private suggestionsContainer: Container;
  private devProjectsContainer?: Container; // For development writes
  private devUsersContainer?: Container; // For development writes
  private devSuggestionsContainer?: Container; // For development writes
  private blobServiceClient: BlobServiceClient;
  private audioContainer: string;
  private environment: string;
  private useProductionData: boolean;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.useProductionData = process.env.DEV_ACCESS_PROD_DATA === 'true';
    
    // Determine container names based on environment
    this.audioContainer = this.getAudioContainerName();
    
    console.log(`🔧 Azure Storage Environment: ${this.environment}`);
    console.log(`📊 Production Data Access: ${this.useProductionData ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🎵 Audio Container: ${this.audioContainer}`);

    // Initialize Cosmos DB client
    this.cosmosClient = new CosmosClient({
      endpoint: process.env.COSMOS_DB_ENDPOINT!,
      key: process.env.COSMOS_DB_KEY!,
    });

    // Initialize Blob Storage client
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );

    this.initializeDatabase();
  }

  private getAudioContainerName(): string {
    if (this.environment === 'development' && this.useProductionData) {
      return 'audio-files'; // Access production audio files
    } else if (this.environment === 'development') {
      return 'audio-files-dev';
    } else if (this.environment === 'staging') {
      return 'audio-files-staging';
    } else {
      return 'audio-files';
    }
  }

  private async initializeDatabase() {
    try {
      // Create database if it doesn't exist
      const { database } = await this.cosmosClient.databases.createIfNotExists({
        id: 'PodcastPro'
      });
      this.database = database;

      // Determine container names based on environment
      const containerPrefix = this.getContainerPrefix();
      console.log(`📁 Container prefix: ${containerPrefix}`);

      // Initialize containers
      await this.initializeContainers(containerPrefix);

      // Initialize blob storage
      await this.initializeBlobStorage();

      console.log(`✅ Azure storage initialized successfully for ${this.environment}`);
    } catch (error) {
      console.error('❌ Failed to initialize Azure storage:', error);
      throw error;
    }
  }

  private getContainerPrefix(): string {
    if (this.environment === 'development' && !this.useProductionData) {
      return 'dev-';
    } else if (this.environment === 'staging') {
      return 'staging-';
    } else {
      return ''; // Production or dev with prod data access
    }
  }

  private async initializeContainers(containerPrefix: string) {
    // For development with production data access, use hybrid approach:
    // - READ from production containers (for existing data)
    // - WRITE to development containers (for new data safety)
    if (this.environment === 'development' && this.useProductionData) {
      console.log('📊 Using production containers for read access');
      // For reads, we'll use production containers
      this.projectsContainer = this.database.container('projects');
      this.usersContainer = this.database.container('users'); 
      this.suggestionsContainer = this.database.container('aiSuggestions');
      
      // Also initialize development containers for writes
      console.log('🛡️ Initializing development containers for safe writes');
      const { container: devProjectsContainer } = await this.database.containers.createIfNotExists({
        id: 'dev-projects',
        partitionKey: '/userId'
      });
      this.devProjectsContainer = devProjectsContainer;

      const { container: devUsersContainer } = await this.database.containers.createIfNotExists({
        id: 'dev-users',
        partitionKey: '/id'
      });
      this.devUsersContainer = devUsersContainer;

      const { container: devSuggestionsContainer } = await this.database.containers.createIfNotExists({
        id: 'dev-aiSuggestions',
        partitionKey: '/projectId'
      });
      this.devSuggestionsContainer = devSuggestionsContainer;
      return;
    }

    // Create/get containers with appropriate prefixes for other environments
    const { container: projectsContainer } = await this.database.containers.createIfNotExists({
      id: `${containerPrefix}projects`,
      partitionKey: '/userId'
    });
    this.projectsContainer = projectsContainer;

    const { container: usersContainer } = await this.database.containers.createIfNotExists({
      id: `${containerPrefix}users`, 
      partitionKey: '/id'
    });
    this.usersContainer = usersContainer;

    const { container: suggestionsContainer } = await this.database.containers.createIfNotExists({
      id: `${containerPrefix}aiSuggestions`,
      partitionKey: '/projectId'
    });
    this.suggestionsContainer = suggestionsContainer;
  }

  private async initializeBlobStorage() {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.audioContainer);
      
      if (this.environment === 'development' && this.useProductionData) {
        // Just verify production container exists, don't try to create it
        console.log(`📁 Using existing production blob container: ${this.audioContainer}`);
      } else {
        // Create container if it doesn't exist for dev/staging
        await containerClient.createIfNotExists({
          access: 'blob' // Public read access for audio files
        });
        console.log(`📁 Created/verified blob container: ${this.audioContainer}`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize blob storage:', error);
      throw error;
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const { resource } = await this.usersContainer.item(id, id).read();
      return resource as User;
    } catch (error: any) {
      if (error.code === 404) return undefined;
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const querySpec = {
      query: 'SELECT * FROM users u WHERE u.username = @username',
      parameters: [{ name: '@username', value: username }]
    };
    
    const { resources } = await this.usersContainer.items.query(querySpec).fetchAll();
    return resources[0] as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      ...user,
    };

    // Use development container for writes when in dev mode with production data access
    const containerToUse = (this.environment === 'development' && this.useProductionData) 
      ? this.devUsersContainer 
      : this.usersContainer;

    await containerToUse!.items.create(newUser);
    return newUser;
  }

  // Project methods
  async getProject(id: string): Promise<Project | undefined> {
    try {
      // For hybrid mode, check development container first, then production
      if (this.environment === 'development' && this.useProductionData) {
        // First check development container
        try {
          const querySpec = {
            query: 'SELECT * FROM projects p WHERE p.id = @id',
            parameters: [{ name: '@id', value: id }]
          };
          const { resources } = await this.devProjectsContainer!.items.query(querySpec).fetchAll();
          if (resources.length > 0) {
            return resources[0] as Project;
          }
        } catch (error) {
          // If dev container doesn't exist or has issues, continue to production
        }
        
        // Fall back to production container
        const querySpec = {
          query: 'SELECT * FROM projects p WHERE p.id = @id',
          parameters: [{ name: '@id', value: id }]
        };
        const { resources } = await this.projectsContainer.items.query(querySpec).fetchAll();
        return resources[0] as Project;
      } else {
        // For non-hybrid mode, use regular container
        const querySpec = {
          query: 'SELECT * FROM projects p WHERE p.id = @id',
          parameters: [{ name: '@id', value: id }]
        };
        
        const { resources } = await this.projectsContainer.items.query(querySpec).fetchAll();
        return resources[0] as Project;
      }
    } catch (error: any) {
      if (error.code === 404) return undefined;
      throw error;
    }
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const querySpec = {
      query: 'SELECT * FROM projects p WHERE p.userId = @userId ORDER BY p.createdAt DESC',
      parameters: [{ name: '@userId', value: userId }]
    };
    
    // For hybrid mode, merge results from both containers
    if (this.environment === 'development' && this.useProductionData) {
      const devProjects: Project[] = [];
      const prodProjects: Project[] = [];
      
      // Get projects from development container
      try {
        const { resources: devResources } = await this.devProjectsContainer!.items.query(querySpec).fetchAll();
        devProjects.push(...(devResources as Project[]));
      } catch (error) {
        // Dev container might not exist yet, that's ok
      }
      
      // Get projects from production container
      try {
        const { resources: prodResources } = await this.projectsContainer.items.query(querySpec).fetchAll();
        prodProjects.push(...(prodResources as Project[]));
      } catch (error) {
        console.error('Error fetching production projects:', error);
      }
      
      // Merge and deduplicate projects (dev takes precedence)
      const allProjects = [...devProjects];
      const devProjectIds = new Set(devProjects.map(p => p.id));
      
      for (const prodProject of prodProjects) {
        if (!devProjectIds.has(prodProject.id)) {
          allProjects.push(prodProject);
        }
      }
      
      // Sort by creation date
      return allProjects.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
    } else {
      // For non-hybrid mode, use regular container
      const { resources } = await this.projectsContainer.items.query(querySpec).fetchAll();
      return resources as Project[];
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject: Project = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      phase: 1,
      audioUrl: null,
      userId: project.userId || null,
      description: project.description || null,
      originalPrompt: project.originalPrompt || null,
      refinedPrompt: project.refinedPrompt || null,
      researchData: project.researchData || null,
      episodePlan: project.episodePlan || null,
      currentEpisode: project.currentEpisode || 1,
      scriptContent: project.scriptContent || null,
      scriptAnalytics: project.scriptAnalytics || null,
      voiceSettings: project.voiceSettings || null,
      title: project.title,
    };

    // Use development container for writes when in dev mode with production data access
    const containerToUse = (this.environment === 'development' && this.useProductionData) 
      ? this.devProjectsContainer 
      : this.projectsContainer;

    await containerToUse!.items.create(newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const existing = await this.getProject(id);
    if (!existing) return undefined;

    const updatedProject = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    // If we're in development mode with production data access, 
    // we need to determine where this project exists and update accordingly
    if (this.environment === 'development' && this.useProductionData) {
      // First try to update in dev container, if not found, create in dev container
      try {
        await this.devProjectsContainer!.item(id, existing.userId).replace(updatedProject);
      } catch (error: any) {
        if (error.code === 404) {
          // Project doesn't exist in dev container, create it there
          await this.devProjectsContainer!.items.create(updatedProject);
        } else {
          throw error;
        }
      }
    } else {
      await this.projectsContainer.item(id, existing.userId).replace(updatedProject);
    }
    
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const existing = await this.getProject(id);
    if (!existing) return false;

    await this.projectsContainer.item(id, existing.userId).delete();
    return true;
  }

  // AI Suggestion methods
  async getAiSuggestionsByProjectId(projectId: string): Promise<AiSuggestion[]> {
    const querySpec = {
      query: 'SELECT * FROM suggestions s WHERE s.projectId = @projectId ORDER BY s.createdAt DESC',
      parameters: [{ name: '@projectId', value: projectId }]
    };
    
    // For hybrid mode, merge results from both containers
    if (this.environment === 'development' && this.useProductionData) {
      const devSuggestions: AiSuggestion[] = [];
      const prodSuggestions: AiSuggestion[] = [];
      
      // Get suggestions from development container
      try {
        const { resources: devResources } = await this.devSuggestionsContainer!.items.query(querySpec).fetchAll();
        devSuggestions.push(...(devResources as AiSuggestion[]));
      } catch (error) {
        // Dev container might not exist yet, that's ok
      }
      
      // Get suggestions from production container
      try {
        const { resources: prodResources } = await this.suggestionsContainer.items.query(querySpec).fetchAll();
        prodSuggestions.push(...(prodResources as AiSuggestion[]));
      } catch (error) {
        console.error('Error fetching production suggestions:', error);
      }
      
      // Merge and deduplicate suggestions (dev takes precedence)
      const allSuggestions = [...devSuggestions];
      const devSuggestionIds = new Set(devSuggestions.map(s => s.id));
      
      for (const prodSuggestion of prodSuggestions) {
        if (!devSuggestionIds.has(prodSuggestion.id)) {
          allSuggestions.push(prodSuggestion);
        }
      }
      
      // Sort by creation date
      return allSuggestions.sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      });
    } else {
      // For non-hybrid mode, use regular container
      const { resources } = await this.suggestionsContainer.items.query(querySpec).fetchAll();
      return resources as AiSuggestion[];
    }
  }

  async createAiSuggestion(suggestion: InsertAiSuggestion): Promise<AiSuggestion> {
    const newSuggestion: AiSuggestion = {
      id: randomUUID(),
      createdAt: new Date(),
      applied: false,
      projectId: suggestion.projectId || null,
      type: suggestion.type,
      content: suggestion.content,
    };

    // Use development container for writes when in dev mode with production data access
    const containerToUse = (this.environment === 'development' && this.useProductionData) 
      ? this.devSuggestionsContainer 
      : this.suggestionsContainer;

    await containerToUse!.items.create(newSuggestion);
    return newSuggestion;
  }

  async updateAiSuggestion(id: string, updates: Partial<AiSuggestion>): Promise<AiSuggestion | undefined> {
    // Find the suggestion first (since we need projectId for partition key)
    const querySpec = {
      query: 'SELECT * FROM suggestions s WHERE s.id = @id',
      parameters: [{ name: '@id', value: id }]
    };
    
    const { resources } = await this.suggestionsContainer.items.query(querySpec).fetchAll();
    const existing = resources[0] as AiSuggestion;
    if (!existing) return undefined;

    const updatedSuggestion = { ...existing, ...updates };
    
    // If we're in development mode with production data access, 
    // we need to determine where this suggestion exists and update accordingly
    if (this.environment === 'development' && this.useProductionData) {
      // First try to update in dev container, if not found, create in dev container
      try {
        await this.devSuggestionsContainer!.item(id, existing.projectId).replace(updatedSuggestion);
      } catch (error: any) {
        if (error.code === 404) {
          // Suggestion doesn't exist in dev container, create it there
          await this.devSuggestionsContainer!.items.create(updatedSuggestion);
        } else {
          throw error;
        }
      }
    } else {
      await this.suggestionsContainer.item(id, existing.projectId).replace(updatedSuggestion);
    }
    
    return updatedSuggestion;
  }

  // Audio file methods (Blob Storage)
  async uploadAudioFile(audioBuffer: Buffer, filename: string): Promise<string> {
    const blockBlobClient = this.blobServiceClient
      .getContainerClient(this.audioContainer)
      .getBlockBlobClient(filename);

    await blockBlobClient.upload(audioBuffer, audioBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: 'audio/mpeg'
      }
    });

    return blockBlobClient.url; // Return public URL
  }

  async getAudioFileUrl(filename: string): Promise<string> {
    const blobClient = this.blobServiceClient
      .getContainerClient(this.audioContainer)
      .getBlobClient(filename);

    return blobClient.url;
  }

  async deleteAudioFile(filename: string): Promise<boolean> {
    try {
      const blobClient = this.blobServiceClient
        .getContainerClient(this.audioContainer)
        .getBlobClient(filename);

      await blobClient.delete();
      return true;
    } catch (error) {
      return false;
    }
  }
}
