# 🎙️ PodcastPro - AI-Powered Podcast Creation Platform

> Transform your ideas into professional podcasts with advanced AI research, intelligent script generation, and high-quality audio synthesis.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Azure](https://img.shields.io/badge/Azure-0078D4?logo=microsoft-azure&logoColor=white)

## 🌟 Features

### 🚀 **Advanced AI Workflow**
- **Domain-Aware Prompt Refinement**: Intelligent topic analysis with 76% research utilization
- **Comprehensive Research Integration**: Powered by Perplexity AI with real-time data
- **Multi-Model Optimization**: GPT-5 for content analysis, GPT-4 for script generation
- **Smart Content Analysis**: Automatic episode breakdown for complex topics

### 🎨 **Professional UI/UX**
- **Auto-Save Functionality**: Save progress every 2 seconds automatically
- **Loading States**: Professional loading indicators throughout the app
- **Phase Progress Tracking**: Visual progress indicators with completion status
- **Project Dashboard**: Comprehensive project management interface

### ☁️ **Azure Cloud Integration**
- **Cosmos DB**: NoSQL database for scalable data storage
- **Blob Storage**: Audio files stored securely in the cloud
- **Container Apps**: Serverless deployment with auto-scaling
- **Secure Secrets Management**: API keys stored as Container App secrets

### 🎵 **High-Quality Audio**
- **Advanced TTS**: OpenAI's latest text-to-speech technology
- **Multiple Voices**: Choose from various AI voice models
- **Cloud Storage**: Audio files automatically uploaded to Azure
- **Streaming Ready**: Direct URLs for podcast distribution

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express Server │◄──►│  Azure Services │
│                 │    │                 │    │                 │
│ • Phase UI      │    │ • AI Services   │    │ • Cosmos DB     │
│ • Auto-save     │    │ • OpenAI API    │    │ • Blob Storage  │
│ • Progress      │    │ • Perplexity    │    │ • Container App │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Azure account (for cloud features)
- OpenAI API key
- Perplexity API key

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/podcastpro.git
cd podcastpro
npm install
```

### 2. Environment Setup
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your API keys
OPENAI_API_KEY=sk-your-openai-api-key-here
PERPLEXITY_API_KEY=pplx-your-perplexity-api-key-here
```

### 3. Development Server
```bash
# Start the development server
npm run dev

## 📋 Environment Variables

Create a `.env` file with the following variables:

```bash
# Required API Keys
OPENAI_API_KEY=sk-your-openai-api-key-here
PERPLEXITY_API_KEY=pplx-your-perplexity-api-key-here

# Optional: Database (defaults to in-memory)
DATABASE_URL=your-database-url

# Server Configuration
PORT=3001
NODE_ENV=development

# Storage Type (memory, azure)
STORAGE_TYPE=memory

# Azure Configuration (for cloud deployment)
COSMOS_DB_ENDPOINT=your-cosmos-endpoint
COSMOS_DB_KEY=your-cosmos-key
AZURE_STORAGE_CONNECTION_STRING=your-storage-connection
```

## 🎯 How It Works

### Phase 1: Prompt & Research
1. **Topic Analysis**: AI analyzes your prompt for domain and complexity
2. **Expert Refinement**: Domain-specific prompt enhancement
3. **Comprehensive Research**: Real-time research via Perplexity AI
4. **Content Strategy**: Intelligent content planning and structuring

### Phase 2: Script Generation  
1. **Multi-Episode Analysis**: Determines if content needs multiple episodes
2. **Script Creation**: AI generates professional podcast scripts
3. **Content Optimization**: Ensures engaging, well-structured content
4. **Manual Editing**: Full script editing capabilities

### Phase 3: Audio Generation
1. **Voice Selection**: Choose from multiple AI voice models
2. **Text-to-Speech**: High-quality audio synthesis via OpenAI
3. **Cloud Upload**: Automatic upload to Azure Blob Storage
4. **Ready to Publish**: Direct URLs for podcast distribution

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Wouter** for routing
- **Radix UI** components

### Backend
- **Express.js** with TypeScript
- **OpenAI API** for AI services
- **Perplexity API** for research
- **Azure SDK** for cloud integration

### Cloud Infrastructure
- **Azure Cosmos DB** - NoSQL database
- **Azure Blob Storage** - Audio file storage
- **Azure Container Apps** - Serverless hosting
- **Azure Container Registry** - Docker image storage

## � API Reference

### Core Endpoints

```bash
# Projects
GET    /api/projects          # List all projects
POST   /api/projects          # Create new project
GET    /api/projects/:id      # Get project details
PATCH  /api/projects/:id      # Update project

# AI Services
POST   /api/ai/refine-prompt    # Enhance prompt with AI
POST   /api/ai/research         # Perform research
POST   /api/ai/analyze-episodes # Analyze content structure
POST   /api/ai/generate-script  # Generate podcast script
POST   /api/ai/generate-audio   # Create audio from script
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Azure Deployment
1. Set up Azure resources (see `AZURE_DEPLOYMENT.md`)
2. Configure Container App secrets
3. Deploy using provided scripts

## 🔒 Security

- **API Keys**: Stored as Azure Container App secrets in production
- **Environment Variables**: Never committed to repository
- **Secure Headers**: HTTPS and security headers configured
- **Input Validation**: All user inputs validated and sanitized

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for advanced AI capabilities
- Perplexity AI for research intelligence
- Microsoft Azure for cloud infrastructure
- The open-source community for excellent tools and libraries

---

<p align="center">
  Made with ❤️ and AI • Transform your ideas into professional podcasts
</p>

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Query** - Server state management
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **OpenAI API** - AI services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

1. **Database connection fails:**
   - Check DATABASE_URL format
   - Ensure database is accessible
   - Run `npm run db:push` to setup schema

2. **OpenAI API errors:**
   - Verify API key is correct
   - Check you have sufficient credits
   - Ensure API key has proper permissions

3. **Port already in use:**
   - Change PORT in .env file
   - Kill existing processes on port 5000

### Getting Help

- Check the console for error messages
- Verify all environment variables are set
- Ensure database schema is up to date
- Check API key permissions and usage limits

## 🎉 What's Next?

- User authentication system
- Podcast episode management
- Social sharing features
- Advanced audio editing
- Analytics dashboard
