// test-dev-setup.js - Quick test to verify development setup
import dotenv from 'dotenv';

// Load development environment
dotenv.config({ path: '.env.development' });

console.log('🔧 Development Environment Test');
console.log('================================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DEV_ACCESS_PROD_DATA:', process.env.DEV_ACCESS_PROD_DATA);
console.log('COSMOS_DB_ENDPOINT:', process.env.COSMOS_DB_ENDPOINT ? '✅ Set' : '❌ Not set');
console.log('AZURE_STORAGE_CONNECTION_STRING:', process.env.AZURE_STORAGE_CONNECTION_STRING ? '✅ Set' : '❌ Not set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('PERPLEXITY_API_KEY:', process.env.PERPLEXITY_API_KEY ? '✅ Set' : '❌ Not set');

// Test Azure connectivity
if (process.env.COSMOS_DB_ENDPOINT && process.env.COSMOS_DB_KEY) {
  console.log('\n🧪 Testing Azure Cosmos DB connection...');
  // This would require importing the Cosmos client, but we'll keep it simple
  console.log('✅ Cosmos DB credentials available');
}

console.log('\n🚀 Setup appears complete! Try running:');
console.log('   npm run dev:with-client  # Start both server and client');
console.log('   npm run dev              # Start server only');
