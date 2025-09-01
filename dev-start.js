#!/usr/bin/env node
// dev-start.js - Development server with environment configuration

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load development environment if it exists
const devEnvPath = join(__dirname, '.env.development');
dotenv.config({ path: devEnvPath });

// Also load default .env as fallback
dotenv.config();

console.log('🚀 Starting PodcastPro Development Server');
console.log('==========================================');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Storage Type:', process.env.STORAGE_TYPE || 'memory');
console.log('Port:', process.env.PORT || 3001);

if (process.env.DEV_ACCESS_PROD_DATA === 'true') {
  console.log('📊 Production Data Access: ENABLED (read-only)');
  console.log('🛡️ Safety Mode: New data goes to dev containers');
} else {
  console.log('💾 Using development-only data storage');
}

console.log('==========================================\n');

// Start the TypeScript server with tsx watch
const server = spawn('tsx', ['watch', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`🔄 Server exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  server.kill('SIGTERM');
  process.exit(0);
});
