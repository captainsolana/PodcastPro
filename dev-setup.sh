#!/bin/bash
# dev-setup.sh - Set up perfect local development workflow

set -e

echo "🔧 Setting up VS Code development workflow..."

# Install development dependencies
echo "📦 Installing development tools..."
npm install --save-dev concurrently nodemon @types/ws

# Install client dependencies if not already done
if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Update package.json scripts for better development workflow
echo "⚙️ Updating development scripts..."

# Add improved development scripts
npm pkg set scripts.dev="concurrently \"npm run dev:server\" \"npm run dev:client\" --names \"SERVER,CLIENT\" --prefix-colors \"blue,green\""
npm pkg set scripts.dev:server="NODE_ENV=development tsx watch server/index.ts"
npm pkg set scripts.dev:client="cd client && npm run dev"
npm pkg set scripts.dev:server-only="NODE_ENV=development tsx watch server/index.ts"
npm pkg set scripts.dev:client-only="cd client && npm run dev"

# Add build and deployment scripts
npm pkg set scripts.build:all="npm run build && npm run build:client"
npm pkg set scripts.build:client="cd client && npm run build"
npm pkg set scripts.typecheck="tsc --noEmit && cd client && npx tsc --noEmit"
npm pkg set scripts.test="echo \"Add your tests here\""

# Add deployment scripts
npm pkg set scripts.deploy:local="npm run build:all && npm start"
npm pkg set scripts.deploy:azure="./deploy-azure.sh"
npm pkg set scripts.logs:azure="az containerapp logs show --name app-podcastpro --resource-group rg-podcastpro --follow"

echo "✅ Development setup complete!"
echo ""
echo "🚀 Available commands:"
echo ""
echo "  📱 DEVELOPMENT (with hot reload):"
echo "    npm run dev              # Start both server and client with hot reload"
echo "    npm run dev:server-only  # Start only server (if client is running elsewhere)"
echo "    npm run dev:client-only  # Start only client (if server is running elsewhere)"
echo ""
echo "  🔍 TESTING & VALIDATION:"
echo "    npm run typecheck        # Check TypeScript errors in both server and client"
echo "    npm run build:all        # Build both server and client for production"
echo ""
echo "  🚀 DEPLOYMENT:"
echo "    npm run deploy:local     # Test production build locally"
echo "    npm run deploy:azure     # Deploy to Azure production"
echo "    npm run logs:azure       # Watch Azure production logs"
echo ""
echo "💡 VS Code Development Workflow:"
echo "1. Open VS Code in this directory"
echo "2. Run 'npm run dev' in VS Code terminal"
echo "3. Edit files and see changes instantly!"
echo "4. When ready, run 'npm run deploy:azure'"
