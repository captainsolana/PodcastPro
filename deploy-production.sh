#!/bin/bash
# deploy-production.sh - Deploy latest changes to Azure production

set -e

echo "🚀 Deploying latest PodcastPro changes to Azure production..."

# Load environment variables
if [ -f .env.development ]; then
    source .env.development
fi

# Configuration
RESOURCE_GROUP="rg-podcastpro"
CONTAINER_REGISTRY="acrpodcastpro"
CONTAINER_APP_ENV="env-podcastpro"
CONTAINER_APP="app-podcastpro"

# Check if API keys are available
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not found. Please set it in .env.development"
    exit 1
fi

if [ -z "$PERPLEXITY_API_KEY" ]; then
    echo "❌ PERPLEXITY_API_KEY not found. Please set it in .env.development"
    exit 1
fi

echo "✅ API keys loaded from environment"

# Get Azure connection details
echo "🔑 Retrieving Azure connection details..."
COSMOS_ENDPOINT=$(az cosmosdb show --name cosmos-podcastpro --resource-group $RESOURCE_GROUP --query "documentEndpoint" -o tsv)
COSMOS_KEY=$(az cosmosdb keys list --name cosmos-podcastpro --resource-group $RESOURCE_GROUP --query "primaryMasterKey" -o tsv)
STORAGE_CONNECTION=$(az storage account show-connection-string --name stpodcastpro --resource-group $RESOURCE_GROUP --query "connectionString" -o tsv)

echo "✅ Retrieved Azure connection strings"

# Build and push the latest image
echo "🔨 Building and pushing latest Docker image..."
az acr build --registry $CONTAINER_REGISTRY \
  --image podcastpro:latest \
  --file Dockerfile .

echo "✅ Docker image built and pushed"

# Deploy or update the container app
echo "🚀 Deploying to Azure Container Apps..."

# Check if container app exists
if az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP >/dev/null 2>&1; then
    echo "📦 Updating existing container app..."
    az containerapp update \
      --name $CONTAINER_APP \
      --resource-group $RESOURCE_GROUP \
      --image ${CONTAINER_REGISTRY}.azurecr.io/podcastpro:latest \
      --set-env-vars \
        PORT=3000 \
        NODE_ENV=production \
        STORAGE_TYPE=azure \
        COSMOS_DB_ENDPOINT="$COSMOS_ENDPOINT" \
        COSMOS_DB_KEY="$COSMOS_KEY" \
        AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" \
        DEFAULT_USER_ID=single-user \
        DEFAULT_USERNAME=podcastcreator \
        OPENAI_API_KEY="$OPENAI_API_KEY" \
        PERPLEXITY_API_KEY="$PERPLEXITY_API_KEY"
else
    echo "🆕 Creating new container app..."
    az containerapp create \
      --name $CONTAINER_APP \
      --resource-group $RESOURCE_GROUP \
      --environment $CONTAINER_APP_ENV \
      --image ${CONTAINER_REGISTRY}.azurecr.io/podcastpro:latest \
      --registry-server ${CONTAINER_REGISTRY}.azurecr.io \
      --target-port 3000 \
      --ingress external \
      --min-replicas 1 \
      --max-replicas 3 \
      --cpu 1.0 \
      --memory 2Gi \
      --env-vars \
        PORT=3000 \
        NODE_ENV=production \
        STORAGE_TYPE=azure \
        COSMOS_DB_ENDPOINT="$COSMOS_ENDPOINT" \
        COSMOS_DB_KEY="$COSMOS_KEY" \
        AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION" \
        DEFAULT_USER_ID=single-user \
        DEFAULT_USERNAME=podcastcreator \
        OPENAI_API_KEY="$OPENAI_API_KEY" \
        PERPLEXITY_API_KEY="$PERPLEXITY_API_KEY"
fi

# Get the application URL
APP_URL=$(az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Your PodcastPro application is now live at:"
echo "   https://$APP_URL"
echo ""
echo "🔍 Monitor your deployment:"
echo "   az containerapp logs show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --follow"
echo ""
echo "📊 Latest changes deployed:"
echo "   - Fixed frontend project display issue"
echo "   - Simplified user management (no more userId complexity)"
echo "   - Enhanced TTS chunking and audio generation"
echo "   - Your projects should now appear immediately in production!"
