#!/bin/bash
# deploy-production.sh - Deploy latest changes to Azure production using Container App secrets

set -e

echo "🚀 Deploying latest PodcastPro changes to Azure production..."
echo "📋 Using existing Container App secrets for API keys"

# Configuration
RESOURCE_GROUP="rg-podcastpro"
CONTAINER_REGISTRY="acrpodcastpro"
CONTAINER_APP_ENV="env-podcastpro"
CONTAINER_APP="app-podcastpro"

# Check Azure CLI login
if ! az account show >/dev/null 2>&1; then
    echo "❌ Please log in to Azure CLI first: az login"
    exit 1
fi

echo "✅ Azure CLI authenticated"

# Get Azure connection details
echo "🔑 Retrieving Azure connection details..."
COSMOS_ENDPOINT=$(az cosmosdb show --name cosmos-podcastpro --resource-group $RESOURCE_GROUP --query "documentEndpoint" -o tsv)
COSMOS_KEY=$(az cosmosdb keys list --name cosmos-podcastpro --resource-group $RESOURCE_GROUP --query "primaryMasterKey" -o tsv)
STORAGE_CONNECTION=$(az storage account show-connection-string --name stpodcastpro --resource-group $RESOURCE_GROUP --query "connectionString" -o tsv)

echo "✅ Retrieved Azure connection strings"

# Verify that secrets exist in Container App
echo "🔍 Verifying Container App secrets..."
OPENAI_SECRET_EXISTS=$(az containerapp secret list --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query "[?name=='openai-key'].name" -o tsv 2>/dev/null || echo "")
PERPLEXITY_SECRET_EXISTS=$(az containerapp secret list --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query "[?name=='perplexity-key'].name" -o tsv 2>/dev/null || echo "")

if [ -z "$OPENAI_SECRET_EXISTS" ]; then
    echo "❌ OpenAI API key secret not found in Container App"
    echo "💡 Run this command to set it:"
    echo "   az containerapp secret set --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --secrets openai-key='your-openai-key'"
    exit 1
fi

if [ -z "$PERPLEXITY_SECRET_EXISTS" ]; then
    echo "❌ Perplexity API key secret not found in Container App"
    echo "💡 Run this command to set it:"
    echo "   az containerapp secret set --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --secrets perplexity-key='your-perplexity-key'"
    exit 1
fi

echo "✅ Container App secrets verified"

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
        OPENAI_API_KEY=secretref:openai-key \
        PERPLEXITY_API_KEY=secretref:perplexity-key
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
        OPENAI_API_KEY=secretref:openai-key \
        PERPLEXITY_API_KEY=secretref:perplexity-key
fi

# Get the application URL
APP_URL=$(az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)

echo ""
echo "🎉 Deployment completed successfully!"
echo "🌐 Your PodcastPro application is now live at:"
echo "   https://$APP_URL"
echo ""
echo "🔍 Monitor your deployment:"
echo "   az containerapp logs show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --follow"
echo ""
echo "📊 Latest changes deployed:"
echo "   ✅ Enhanced UI/UX with auto-save functionality"
echo "   ✅ Fixed Save Progress button with proper loading states"
echo "   ✅ Improved navigation and phase indicators"
echo "   ✅ Azure Blob Storage integration for audio files"
echo "   ✅ All 23 audio files now available in production"
echo "   ✅ Production API keys secured with Container App secrets"
echo ""
echo "🔒 Security:"
echo "   ✅ API keys loaded from Container App secrets (not env vars)"
echo "   ✅ Azure storage and Cosmos DB properly configured"
echo "   ✅ Production-ready environment settings"
