import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import path from "path";
import { randomUUID } from "crypto";

export class AzureBlobStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;
  private containerName = "audio-files";

  constructor(connectionString: string) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
  }

  async initialize(): Promise<void> {
    // Create container if it doesn't exist
    await this.containerClient.createIfNotExists({
      access: "blob" // Allow public read access to audio files
    });
  }

  async uploadAudioFile(buffer: Buffer, originalFileName?: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = originalFileName ? path.extname(originalFileName) : '.mp3';
      const fileName = `podcast_${Date.now()}_${randomUUID()}${fileExtension}`;
      
      // Get blob client
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      
      // Upload with proper content type
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: "audio/mpeg",
          blobCacheControl: "public, max-age=31536000" // Cache for 1 year
        }
      });

      console.log(`Audio file uploaded to Azure Blob Storage: ${fileName}`);
      
      // Return the public URL
      return blockBlobClient.url;
    } catch (error) {
      console.error("Error uploading audio file to Azure Blob Storage:", error);
      throw new Error("Failed to upload audio file to cloud storage");
    }
  }

  async deleteAudioFile(fileName: string): Promise<boolean> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.delete();
      console.log(`Audio file deleted from Azure Blob Storage: ${fileName}`);
      return true;
    } catch (error) {
      console.error("Error deleting audio file from Azure Blob Storage:", error);
      return false;
    }
  }

  async getAudioFileUrl(fileName: string): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
    return blockBlobClient.url;
  }

  async listAudioFiles(): Promise<string[]> {
    const fileNames: string[] = [];
    
    for await (const blob of this.containerClient.listBlobsFlat()) {
      fileNames.push(blob.name);
    }
    
    return fileNames;
  }
}
