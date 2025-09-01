# Azure Deployment Guide for PodcastPro

## 📊 **RECOMMENDED ARCHITECTURE SUMMARY**

For your **single-user application**, I recommend this Azure architecture:

```
┌─────────────────────────────────────────────────────────┐
│                 AZURE PODCASTPRO STACK                  │
├─────────────────────────────────────────────────────────┤
│  🌟 Azure Container Apps                               │
│      • Full-stack application hosting                  │
│      • Auto-scaling (1-3 instances)                    │
│      • HTTPS with custom domain support                │
├─────────────────────────────────────────────────────────┤
│  🗄️ Azure Cosmos DB (NoSQL)                           │
│      • Document storage for projects                   │
│      • JSON-native (perfect for AI responses)          │
│      • Free tier: 1000 RU/s + 25GB                     │
├─────────────────────────────────────────────────────────┤
│  💾 Azure Blob Storage                                 │
│      • MP3 audio file storage                          │
│      • CDN-ready for fast delivery                     │
│      • Pay-per-use pricing                             │
└─────────────────────────────────────────────────────────┘
```

## 🎯 **WHY THIS ARCHITECTURE FOR SINGLE USER?**

### **Cosmos DB vs SQL Database:**
✅ **Document-native**: Your data is 90% JSON (research, episode plans, voice settings)  
✅ **Schema flexibility**: AI responses evolve - no migrations needed  
✅ **Single-user optimized**: No complex relationships or transactions required  
✅ **Cost-effective**: Free tier covers single-user usage  
✅ **Auto-scaling**: Scales with your content creation  

### **Container Apps vs App Service:**
✅ **Full-stack friendly**: Serves both React frontend and Express API  
✅ **Cost optimization**: Pay only for actual usage  
✅ **Easy deployment**: Containerized deployment with GitHub Actions  
✅ **Environment management**: Built-in secrets and environment variables  

## 🚀 **DEPLOYMENT STEPS**

### **Prerequisites:**
1. Azure CLI installed (`az --version`)
2. Docker installed 
3. OpenAI API key
4. Perplexity API key (optional but recommended)

### **Quick Deploy (5 minutes):**

```bash
# 1. Clone and navigate to project
cd PodcastPro

# 2. Set your API keys as environment variables
export OPENAI_API_KEY="your-openai-key"
export PERPLEXITY_API_KEY="your-perplexity-key"

# 3. Login to Azure
az login

# 4. Run deployment script
chmod +x deploy-azure.sh
./deploy-azure.sh
```

### **Manual Deploy (if you prefer step-by-step):**

```bash
# Create resource group
az group create --name rg-podcastpro --location eastus

# Create Cosmos DB
az cosmosdb create \
  --name cosmos-podcastpro \
  --resource-group rg-podcastpro \
  --locations regionName=eastus \
  --enable-free-tier true

# Create storage account
az storage account create \
  --name stpodcastpro \
  --resource-group rg-podcastpro \
  --location eastus \
  --sku Standard_LRS

# Create container registry
az acr create \
  --resource-group rg-podcastpro \
  --name acrpodcastpro \
  --sku Basic \
  --admin-enabled true

# Build and deploy container
az acr build \
  --registry acrpodcastpro \
  --image podcastpro:latest \
  --file Dockerfile .

# Create container app environment
az containerapp env create \
  --name env-podcastpro \
  --resource-group rg-podcastpro \
  --location eastus

# Deploy container app
az containerapp create \
  --name app-podcastpro \
  --resource-group rg-podcastpro \
  --environment env-podcastpro \
  --image acrpodcastpro.azurecr.io/podcastpro:latest \
  --target-port 3000 \
  --ingress external \
  --env-vars STORAGE_TYPE=azure
```

## 💰 **COST ANALYSIS**

### **Free Tier Benefits:**
- **Cosmos DB**: 1000 RU/s + 25GB free forever
- **Container Apps**: 180,000 vCPU-seconds + 360,000 GiB-seconds free/month
- **Blob Storage**: First 5GB free

### **Expected Monthly Costs (after free tier):**
- **Cosmos DB**: $0-5 (single user stays in free tier)
- **Container Apps**: $0-10 (minimal usage)
- **Blob Storage**: $1-5 (audio files)
- **Container Registry**: $5 (Basic tier)
- **Total**: ~$5-20/month

## 🔧 **CONFIGURATION**

### **Environment Variables:**
```bash
# Required for Azure deployment
STORAGE_TYPE=azure
COSMOS_DB_ENDPOINT=https://cosmos-podcastpro.documents.azure.com:443/
COSMOS_DB_KEY=your-cosmos-primary-key
AZURE_STORAGE_CONNECTION_STRING=your-storage-connection

# Required API keys
OPENAI_API_KEY=your-openai-key
PERPLEXITY_API_KEY=your-perplexity-key

# Application settings
NODE_ENV=production
PORT=3000
DEFAULT_USER_ID=single-user
```

### **Single User Configuration:**
The app is pre-configured for single-user mode:
- No authentication required
- All projects stored under one user ID
- Simplified UI without user management

## 📊 **DATA MIGRATION**

If you have existing projects in memory storage:

```javascript
// Export current projects (run in browser console)
const projects = await fetch('/api/projects?userId=single-user').then(r => r.json());
console.log('Export this data:', JSON.stringify(projects, null, 2));

// Import to Azure (after deployment)
// Projects will automatically be stored in Cosmos DB
```

## 🔄 **UPDATES & MAINTENANCE**

### **Deploy Updates:**
```bash
# Build and deploy new version
az acr build --registry acrpodcastpro --image podcastpro:latest .

# Update container app
az containerapp update \
  --name app-podcastpro \
  --resource-group rg-podcastpro \
  --image acrpodcastpro.azurecr.io/podcastpro:latest
```

### **Monitor Costs:**
```bash
# Check current usage
az consumption usage list --top 10

# Set up budget alerts
az consumption budget create \
  --budget-name podcast-budget \
  --amount 50 \
  --category Cost \
  --time-grain Monthly
```

## 🛡️ **SECURITY & BACKUPS**

### **Automatic Backups:**
- **Cosmos DB**: Automatic backups every 4 hours
- **Blob Storage**: Geo-redundant by default
- **Container Registry**: Image versioning

### **Security Features:**
- HTTPS enforced on Container Apps
- API keys stored as Container App secrets
- Storage access keys managed by Azure
- Network isolation available if needed

## 🔍 **MONITORING**

### **Application Insights (Optional):**
```bash
# Add monitoring
az monitor app-insights component create \
  --app podcast-insights \
  --location eastus \
  --resource-group rg-podcastpro

# Get instrumentation key and add to container app
```

### **Log Monitoring:**
```bash
# View container logs
az containerapp logs show \
  --name app-podcastpro \
  --resource-group rg-podcastpro \
  --follow
```

## 🎯 **NEXT STEPS AFTER DEPLOYMENT**

1. **Test the application** with a sample podcast creation
2. **Upload your existing audio files** to Azure Blob Storage
3. **Set up custom domain** if desired
4. **Configure GitHub Actions** for automated deployments
5. **Add Application Insights** for monitoring

## 🆘 **TROUBLESHOOTING**

### **Common Issues:**

**Container won't start:**
```bash
# Check logs
az containerapp logs show --name app-podcastpro --resource-group rg-podcastpro

# Common fixes: Check environment variables, API keys
```

**Cosmos DB connection issues:**
```bash
# Verify connection string
az cosmosdb keys list --name cosmos-podcastpro --resource-group rg-podcastpro
```

**Audio files not loading:**
```bash
# Check blob container permissions
az storage container show --name audio-files --account-name stpodcastpro
```

**API calls failing:**
- Verify OpenAI API key has credits
- Check Perplexity API key is active
- Review container app logs for specific errors

This architecture gives you a **production-ready, scalable, cost-effective** solution that's perfect for your single-user podcast creation needs!
