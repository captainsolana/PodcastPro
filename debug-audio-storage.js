#!/usr/bin/env node

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

console.log('🔍 Audio Storage Investigation');
console.log('========================================');
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DEV_ACCESS_PROD_DATA:', process.env.DEV_ACCESS_PROD_DATA);
console.log('AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? '✅ Set' : '❌ Not set');

// Simulate the container naming logic
const environment = process.env.NODE_ENV || 'development';
const useProductionData = process.env.DEV_ACCESS_PROD_DATA === 'true';

function getAudioContainerName() {
  if (environment === 'development' && useProductionData) {
    return 'audio-files'; // Access production audio files
  } else if (environment === 'development') {
    return 'audio-files-dev';
  } else if (environment === 'staging') {
    return 'audio-files-staging';
  } else {
    return 'audio-files';
  }
}

const audioContainer = getAudioContainerName();

console.log('\nContainer Configuration:');
console.log('🔧 Environment:', environment);
console.log('📊 Production Data Access:', useProductionData ? 'ENABLED' : 'DISABLED');
console.log('🎵 Audio Container:', audioContainer);

console.log('\nExpected Container Names:');
console.log('Production: audio-files');
console.log('Development: audio-files-dev');
console.log('Staging: audio-files-staging');

// Check Azure connection if available
if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
  console.log('\n🔗 Azure Storage Connection:');
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const accountMatch = connectionString.match(/AccountName=([^;]+)/);
  const endpointMatch = connectionString.match(/BlobEndpoint=([^;]+)/);
  
  if (accountMatch) {
    console.log('Storage Account:', accountMatch[1]);
  }
  if (endpointMatch) {
    console.log('Blob Endpoint:', endpointMatch[1]);
  }
}
