#!/bin/bash

echo "🎙️  Setting up PodcastPro..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "📝 Please edit .env file with your actual API keys:"
    echo "   - OPENAI_API_KEY: Your OpenAI API key"
    echo "   - DATABASE_URL: Your PostgreSQL database URL"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Set up your PostgreSQL database"
echo "3. Run 'npm run db:push' to set up database schema"
echo "4. Run 'npm run dev' to start development server"
echo ""
echo "Your app will be available at http://localhost:5000"
