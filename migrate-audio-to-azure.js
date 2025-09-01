#!/usr/bin/env node

// Load environment variables
import dotenv from 'dotenv';
import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.development' });

async function migrateAudioFiles() {
  console.log('🚀 Audio Files Migration to Azure Blob Storage');
  console.log('===============================================');
  
  try {
    // Check environment
    console.log('Environment Check:');
    console.log('- STORAGE_TYPE:', process.env.STORAGE_TYPE);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? '✅ Set' : '❌ Not set');
    
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error('Azure Storage connection string not found');
    }

    // Initialize Azure Blob Service Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    // Container name (production since we're using production data)
    const containerName = 'audio-files';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    console.log(`\n📂 Using container: ${containerName}`);

    // Ensure container exists
    const containerExists = await containerClient.exists();
    if (!containerExists) {
      console.log('Creating container...');
      await containerClient.create({
        access: 'blob'
      });
      console.log('✅ Container created');
    } else {
      console.log('✅ Container exists');
    }

    // Find local audio files
    const audioDir = './public/audio';
    const audioFiles = fs.readdirSync(audioDir).filter(file => file.endsWith('.mp3'));
    
    console.log(`\n🎵 Found ${audioFiles.length} local audio files`);
    
    if (audioFiles.length === 0) {
      console.log('No audio files to migrate');
      return;
    }

    // Upload each file
    let uploadedCount = 0;
    let errors = 0;

    for (const fileName of audioFiles) {
      try {
        const filePath = path.join(audioDir, fileName);
        const fileBuffer = fs.readFileSync(filePath);
        const fileStats = fs.statSync(filePath);
        
        console.log(`\n📤 Uploading: ${fileName} (${Math.round(fileStats.size / 1024)}KB)`);
        
        // Upload to Azure Blob Storage
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        
        // Check if file already exists
        const exists = await blockBlobClient.exists();
        if (exists) {
          console.log(`   ⚠️  File already exists in Azure, skipping...`);
          continue;
        }
        
        await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
          blobHTTPHeaders: {
            blobContentType: 'audio/mpeg'
          }
        });
        
        console.log(`   ✅ Uploaded successfully`);
        console.log(`   🔗 URL: ${blockBlobClient.url}`);
        uploadedCount++;
        
      } catch (error) {
        console.error(`   ❌ Failed to upload ${fileName}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log('======================');
    console.log(`✅ Successfully uploaded: ${uploadedCount} files`);
    console.log(`❌ Errors: ${errors} files`);
    console.log(`📁 Local files: ${audioFiles.length} files`);
    
    if (uploadedCount > 0) {
      console.log('\n🎉 Audio files are now available in Azure Blob Storage!');
      console.log(`📍 Container: ${containerName}`);
      console.log(`🔗 Storage Account: ${process.env.AZURE_STORAGE_CONNECTION_STRING.match(/AccountName=([^;]+)/)[1]}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

migrateAudioFiles();
