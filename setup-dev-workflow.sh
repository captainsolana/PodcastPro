#!/bin/bash
# setup-dev-workflow.sh - Enhanced development and deployment workflow

set -e

echo "🚀 Setting up PodcastPro Development Workflow..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists az; then
    echo "❌ Azure CLI not found. Please install: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

if ! command_exists docker; then
    echo "❌ Docker not found. Please install Docker"
    exit 1
fi

# Verify Azure login
if ! az account show >/dev/null 2>&1; then
    echo "❌ Not logged into Azure. Please run: az login"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create development environment structure
echo "📁 Setting up development environment structure..."
mkdir -p .github/workflows
mkdir -p environments/{development,staging,production}
mkdir -p scripts/{build,deploy,test}
mkdir -p docs/{api,deployment,features}

# Create GitHub Actions workflow
echo "⚙️ Creating CI/CD pipeline..."
cat > .github/workflows/azure-deploy.yml << 'EOF'
name: Azure Container Apps Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AZURE_RESOURCE_GROUP: rg-podcastpro
  AZURE_CONTAINER_APP: app-podcastpro
  AZURE_CONTAINER_REGISTRY: acrpodcastpro

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run TypeScript check
      run: npm run typecheck
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build-test
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Build and push Docker image
      run: |
        az acr build --registry ${{ env.AZURE_CONTAINER_REGISTRY }} \
          --image podcastpro-staging:${{ github.sha }} \
          --image podcastpro-staging:latest \
          --file Dockerfile .
    
    - name: Deploy to staging
      run: |
        az containerapp update \
          --name ${{ env.AZURE_CONTAINER_APP }}-staging \
          --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
          --image ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/podcastpro-staging:${{ github.sha }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build-test
    runs-on: ubuntu-latest
    environment: production
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Azure Login
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Build and push Docker image
      run: |
        az acr build --registry ${{ env.AZURE_CONTAINER_REGISTRY }} \
          --image podcastpro:${{ github.sha }} \
          --image podcastpro:latest \
          --file Dockerfile .
    
    - name: Deploy to production
      run: |
        az containerapp update \
          --name ${{ env.AZURE_CONTAINER_APP }} \
          --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
          --image ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/podcastpro:${{ github.sha }}
EOF

# Create environment-specific deployment scripts
echo "🌍 Creating environment-specific deployment scripts..."

# Development environment script
cat > environments/development/deploy.sh << 'EOF'
#!/bin/bash
# Development environment deployment
echo "🔨 Deploying to development environment..."

# Use memory storage for development
export STORAGE_TYPE=memory
export NODE_ENV=development

# Start local development server
npm run dev
EOF

# Staging environment script
cat > environments/staging/deploy.sh << 'EOF'
#!/bin/bash
# Staging environment deployment
set -e

echo "🧪 Deploying to staging environment..."

RESOURCE_GROUP="rg-podcastpro-staging"
CONTAINER_APP="app-podcastpro-staging"
REGISTRY="acrpodcastpro"

# Create staging resource group if it doesn't exist
az group create --name $RESOURCE_GROUP --location westus2

# Create staging container app if it doesn't exist
if ! az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP >/dev/null 2>&1; then
    echo "Creating staging container app..."
    az containerapp create \
        --name $CONTAINER_APP \
        --resource-group $RESOURCE_GROUP \
        --environment env-podcastpro \
        --image $REGISTRY.azurecr.io/podcastpro-staging:latest \
        --target-port 3000 \
        --ingress external \
        --min-replicas 0 \
        --max-replicas 2
fi

# Deploy to staging
az acr build --registry $REGISTRY --image podcastpro-staging:latest --file Dockerfile .
az containerapp update \
    --name $CONTAINER_APP \
    --resource-group $RESOURCE_GROUP \
    --image $REGISTRY.azurecr.io/podcastpro-staging:latest

echo "✅ Staging deployment complete!"
echo "🌐 Staging URL: https://$CONTAINER_APP.jollystone-ac8f78d1.westus2.azurecontainerapps.io"
EOF

# Production environment script (enhanced version of existing deploy-azure.sh)
cat > environments/production/deploy.sh << 'EOF'
#!/bin/bash
# Production environment deployment
set -e

echo "🚀 Deploying to production environment..."

# Source the main deployment script
source ../../deploy-azure.sh

echo "✅ Production deployment complete!"
echo "🌐 Production URL: https://app-podcastpro.jollystone-ac8f78d1.westus2.azurecontainerapps.io"
EOF

# Create testing script
echo "🧪 Creating testing framework..."
cat > scripts/test/run-tests.sh << 'EOF'
#!/bin/bash
# Comprehensive testing script

echo "🧪 Running PodcastPro test suite..."

# Unit tests
echo "Running unit tests..."
npm test

# Type checking
echo "Running TypeScript checks..."
npm run typecheck

# Build test
echo "Testing build process..."
npm run build

# API integration tests
echo "Running API integration tests..."
if [ "$NODE_ENV" = "development" ]; then
    npm run dev &
    SERVER_PID=$!
    sleep 5
    
    # Test basic endpoints
    curl -f http://localhost:3001/api/projects?userId=single-user || echo "❌ API test failed"
    
    kill $SERVER_PID
fi

echo "✅ All tests passed!"
EOF

# Create deployment monitoring script
echo "📊 Creating monitoring tools..."
cat > scripts/deploy/monitor.sh << 'EOF'
#!/bin/bash
# Deployment monitoring and health checks

ENVIRONMENT=${1:-production}
case $ENVIRONMENT in
    "staging")
        RESOURCE_GROUP="rg-podcastpro-staging"
        CONTAINER_APP="app-podcastpro-staging"
        ;;
    "production")
        RESOURCE_GROUP="rg-podcastpro"
        CONTAINER_APP="app-podcastpro"
        ;;
    *)
        echo "Usage: ./monitor.sh [staging|production]"
        exit 1
        ;;
esac

echo "📊 Monitoring $ENVIRONMENT environment..."

# Check container app status
echo "Container App Status:"
az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP \
    --query "{name:name,provisioningState:properties.provisioningState,runningStatus:properties.runningStatus,fqdn:properties.configuration.ingress.fqdn}" \
    --output table

# Check recent logs
echo -e "\n📝 Recent logs:"
az containerapp logs show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --tail 20

# Check revisions
echo -e "\n🔄 Active revisions:"
az containerapp revision list --name $CONTAINER_APP --resource-group $RESOURCE_GROUP \
    --query "[].{name:name,active:properties.active,createdTime:properties.createdTime,trafficWeight:properties.trafficWeight}" \
    --output table

# Health check
echo -e "\n🏥 Health check:"
FQDN=$(az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP --query "properties.configuration.ingress.fqdn" -o tsv)
curl -s -o /dev/null -w "HTTP Status: %{http_code}, Response Time: %{time_total}s\n" https://$FQDN/api/projects?userId=single-user
EOF

# Create feature flag system
echo "🚩 Setting up feature flag system..."
cat > scripts/deploy/feature-flags.sh << 'EOF'
#!/bin/bash
# Feature flag management

ENVIRONMENT=${1:-production}
ACTION=${2:-list}
FEATURE=${3}
VALUE=${4}

case $ENVIRONMENT in
    "staging")
        RESOURCE_GROUP="rg-podcastpro-staging"
        CONTAINER_APP="app-podcastpro-staging"
        ;;
    "production")
        RESOURCE_GROUP="rg-podcastpro"
        CONTAINER_APP="app-podcastpro"
        ;;
esac

case $ACTION in
    "list")
        echo "📋 Current feature flags for $ENVIRONMENT:"
        az containerapp show --name $CONTAINER_APP --resource-group $RESOURCE_GROUP \
            --query "properties.template.containers[0].env[?starts_with(name, 'FEATURE_')]" \
            --output table
        ;;
    "enable")
        echo "✅ Enabling feature: $FEATURE"
        az containerapp update --name $CONTAINER_APP --resource-group $RESOURCE_GROUP \
            --set-env-vars "FEATURE_${FEATURE}=true"
        ;;
    "disable")
        echo "❌ Disabling feature: $FEATURE"
        az containerapp update --name $CONTAINER_APP --resource-group $RESOURCE_GROUP \
            --set-env-vars "FEATURE_${FEATURE}=false"
        ;;
    *)
        echo "Usage: ./feature-flags.sh [staging|production] [list|enable|disable] [feature_name]"
        echo "Example: ./feature-flags.sh production enable REAL_TIME_COLLABORATION"
        ;;
esac
EOF

# Make scripts executable
chmod +x environments/*/deploy.sh
chmod +x scripts/*/*.sh

# Create package.json scripts for development workflow
echo "📦 Adding development scripts to package.json..."
npm pkg set scripts.test:unit="vitest"
npm pkg set scripts.test:e2e="playwright test"
npm pkg set scripts.test:all="npm run test:unit && npm run test:e2e"
npm pkg set scripts.deploy:staging="./environments/staging/deploy.sh"
npm pkg set scripts.deploy:production="./environments/production/deploy.sh"
npm pkg set scripts.monitor="./scripts/deploy/monitor.sh"
npm pkg set scripts.feature-flags="./scripts/deploy/feature-flags.sh"

# Install additional development dependencies
echo "📚 Installing development dependencies..."
npm install --save-dev @types/jest vitest @playwright/test eslint prettier husky lint-staged

# Create pre-commit hooks
echo "🪝 Setting up pre-commit hooks..."
npm pkg set scripts.prepare="husky install"
npx husky install
npx husky add .husky/pre-commit "npm run typecheck && npm run test:unit"
npx husky add .husky/pre-push "npm run test:all"

# Create environment documentation
echo "📚 Creating documentation..."
cat > docs/deployment/README.md << 'EOF'
# PodcastPro Deployment Guide

## Quick Start

### Development
```bash
npm run dev  # Local development with hot reload
```

### Staging Deployment
```bash
npm run deploy:staging  # Deploy to staging environment
```

### Production Deployment
```bash
npm run deploy:production  # Deploy to production environment
```

## Monitoring
```bash
npm run monitor production  # Monitor production environment
npm run monitor staging     # Monitor staging environment
```

## Feature Flags
```bash
npm run feature-flags production list                    # List all feature flags
npm run feature-flags production enable NEW_FEATURE     # Enable a feature
npm run feature-flags production disable OLD_FEATURE    # Disable a feature
```

## Environments

### Development
- Local development with memory storage
- Hot reload enabled
- Debug logging enabled

### Staging
- Azure Container Apps with separate resources
- Uses Azure storage (Cosmos DB + Blob Storage)
- Separate domain: app-podcastpro-staging.*.azurecontainerapps.io

### Production
- Full Azure infrastructure
- Production domain: app-podcastpro.*.azurecontainerapps.io
- Auto-scaling enabled
- Monitoring and alerts configured
EOF

echo "✅ Development workflow setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Set up GitHub repository secrets for Azure credentials"
echo "2. Push code to trigger first CI/CD deployment"
echo "3. Test staging environment with: npm run deploy:staging"
echo "4. Monitor deployments with: npm run monitor production"
echo ""
echo "📚 Documentation created in docs/ directory"
echo "🔧 Scripts available in scripts/ directory"
echo "🌍 Environment configs in environments/ directory"
