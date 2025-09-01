import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });
dotenv.config({ path: '.env' });

async function debugProjects() {
  console.log('🔍 Debugging project data...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Cosmos Endpoint:', process.env.COSMOS_DB_ENDPOINT);
  
  const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_DB_ENDPOINT,
    key: process.env.COSMOS_DB_KEY,
  });

  const database = cosmosClient.database('PodcastPro');
  
  try {
    // Check production projects container
    console.log('\n📊 Production projects container:');
    const prodContainer = database.container('projects');
    const { resources: prodProjects } = await prodContainer.items.query('SELECT * FROM c').fetchAll();
    console.log(`Found ${prodProjects.length} projects in production container`);
    
    if (prodProjects.length > 0) {
      console.log('Production projects:');
      prodProjects.forEach(project => {
        console.log(`- ID: ${project.id}, Title: ${project.title}, UserId: ${project.userId}, Created: ${project.createdAt}`);
      });
    }
    
    // Check development projects container
    console.log('\n🛠️ Development projects container:');
    try {
      const devContainer = database.container('dev-projects');
      const { resources: devProjects } = await devContainer.items.query('SELECT * FROM c').fetchAll();
      console.log(`Found ${devProjects.length} projects in development container`);
      
      if (devProjects.length > 0) {
        console.log('Development projects:');
        devProjects.forEach(project => {
          console.log(`- ID: ${project.id}, Title: ${project.title}, UserId: ${project.userId}, Created: ${project.createdAt}`);
        });
      }
    } catch (error) {
      console.log('Development container might not exist yet or is empty');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugProjects().catch(console.error);
