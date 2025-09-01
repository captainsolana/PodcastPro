#!/bin/bash

# Azure deployment script for PodcastPro - Single User NoSQL Version
set -e

echo "🚀 Starting Azure deployment for PodcastPro (Cosmos DB + Blob Storage)..."

# Configuration
RESOURCE_GROUP="rg-podcastpro"
LOCATION="westus2"
CONTAINER_REGISTRY="acrpodcastpro"
CONTAINER_APP_ENV="env-podcastpro"
CONTAINER_APP="app-podcastpro"
COSMOS_ACCOUNT="cosmos-podcastpro"
STORAGE_ACCOUNT="stpodcastpro"

# Step 1: Create Resource Group
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Step 2: Create Container Registry
echo "🏗️ Creating Azure Container Registry..."
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_REGISTRY \
  --sku Basic \
  --admin-enabled true

# Step 3: Create Cosmos DB Account (NoSQL API)
echo "🌍 Creating Cosmos DB account..."
az cosmosdb create \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --locations regionName=$LOCATION \
  --default-consistency-level Session \
  --enable-free-tier true \
  --kind GlobalDocumentDB

# Step 4: Create Storage Account for audio files
echo "💾 Creating Storage Account..."
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --allow-blob-public-access true

# Step 5: Create blob container for audio files
echo "📦 Creating blob container..."
az storage container create \
  --name audio-files \
  --account-name $STORAGE_ACCOUNT \
  --public-access blob

# Step 6: Build and push Docker image
echo "🔨 Building and pushing Docker image..."
az acr build \
  --registry $CONTAINER_REGISTRY \
  --image podcastpro:latest \
  --file Dockerfile .

# Step 7: Create Container Apps Environment
echo "🌍 Creating Container Apps environment..."
az containerapp env create \
  --name $CONTAINER_APP_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Step 8: Get connection strings
echo "� Retrieving connection strings..."
COSMOS_KEY=$(az cosmosdb keys list --name $COSMOS_ACCOUNT --resource-group $RESOURCE_GROUP --query primaryMasterKey --output tsv)
COSMOS_ENDPOINT="https://${COSMOS_ACCOUNT}.documents.azure.com:443/"
STORAGE_CONNECTION=$(az storage account show-connection-string --name $STORAGE_ACCOUNT --resource-group $RESOURCE_GROUP --query connectionString --output tsv)

# Step 9: Deploy Container App
echo "🚀 Deploying Container App..."
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
  --secrets \
    openai-key="$OPENAI_API_KEY" \
    perplexity-key="$PERPLEXITY_API_KEY"

# Step 10: Get app URL
APP_URL=$(az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://$APP_URL"
echo "💾 Cosmos DB: $COSMOS_ENDPOINT"
echo "📦 Storage Account: $STORAGE_ACCOUNT"

echo ""
echo "📋 To set API keys, run:"
echo "az containerapp secret set --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --secrets openai-key=YOUR_OPENAI_KEY perplexity-key=YOUR_PERPLEXITY_KEY"
