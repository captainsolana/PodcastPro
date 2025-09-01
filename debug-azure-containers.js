#!/usr/bin/env node

// Load environment variables
import dotenv from 'dotenv';
import { BlobServiceClient } from '@azure/storage-blob';

dotenv.config({ path: '.env.development' });

async function investigateAudioStorage() {
  console.log('🔍 Azure Blob Storage Investigation');
  console.log('==========================================');
  
  try {
    // Initialize Blob Service Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    console.log('✅ Connected to Azure Blob Storage');
    console.log('Storage Account:', process.env.AZURE_STORAGE_CONNECTION_STRING.match(/AccountName=([^;]+)/)[1]);

    // List all containers
    console.log('\n📁 Available Containers:');
    console.log('---------------------------');
    
    const containers = [];
    for await (const container of blobServiceClient.listContainers()) {
      containers.push(container.name);
      console.log(`📂 ${container.name}`);
    }

    // Check for audio-related containers
    const audioContainers = containers.filter(name => 
      name.includes('audio') || name.includes('mp3') || name.includes('sound')
    );

    console.log('\n🎵 Audio-Related Containers:');
    console.log('-------------------------------');
    if (audioContainers.length === 0) {
      console.log('❌ No audio-related containers found');
    } else {
      audioContainers.forEach(name => console.log(`🎵 ${name}`));
    }

    // Check the main containers we expect
    const expectedContainers = ['audio-files', 'audio-files-dev', 'audio-files-staging'];
    
    for (const containerName of expectedContainers) {
      console.log(`\n🔍 Checking container: ${containerName}`);
      console.log('------------------------------------');
      
      try {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const exists = await containerClient.exists();
        
        if (exists) {
          console.log(`✅ Container "${containerName}" exists`);
          
          // List blobs in this container
          let blobCount = 0;
          const blobs = [];
          
          for await (const blob of containerClient.listBlobsFlat()) {
            blobCount++;
            blobs.push({
              name: blob.name,
              size: blob.properties.contentLength,
              lastModified: blob.properties.lastModified,
              contentType: blob.properties.contentType
            });
          }
          
          console.log(`📊 Total blobs: ${blobCount}`);
          
          if (blobCount > 0) {
            console.log('📄 Files:');
            blobs.slice(0, 10).forEach(blob => {
              const sizeKB = Math.round(blob.size / 1024);
              console.log(`   🎵 ${blob.name} (${sizeKB}KB, ${blob.contentType || 'unknown'}, ${blob.lastModified?.toLocaleDateString()})`);
            });
            
            if (blobCount > 10) {
              console.log(`   ... and ${blobCount - 10} more files`);
            }
          } else {
            console.log('📄 No files found in this container');
          }
          
        } else {
          console.log(`❌ Container "${containerName}" does not exist`);
        }
      } catch (error) {
        console.log(`❌ Error checking container "${containerName}":`, error.message);
      }
    }

    // Summary
    console.log('\n📋 Summary:');
    console.log('=============');
    console.log('Current configuration:');
    console.log('- Environment: development');
    console.log('- Production Data Access: ENABLED');
    console.log('- Expected Audio Container: audio-files');
    console.log('- Storage Account: stpodcastpro');

  } catch (error) {
    console.error('❌ Error investigating storage:', error.message);
  }
}

investigateAudioStorage();
