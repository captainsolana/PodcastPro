# PodcastPro

A full-stack AI-powered podcast creation platform that guides users through a three-phase process: prompt refinement and research, script generation, and audio production.

## 🚀 Quick Start

1. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd PodcastPro
   ./setup.sh
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

3. **Set up database and start:**
   ```bash
   npm run db:push
   npm run dev
   ```

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (Neon, Supabase, or local)
- OpenAI API key

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database Configuration  
DATABASE_URL=postgresql://username:password@host:port/database

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Getting API Keys

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key starting with `sk-`

#### Database Setup (Neon - Recommended)
1. Visit [Neon](https://neon.tech/)
2. Create a free account
3. Create a new project
4. Copy the connection string from the dashboard
5. Use it as your `DATABASE_URL`

## 🏗️ Project Structure

```
PodcastPro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # App pages
│   │   └── hooks/         # React hooks
├── server/                # Express backend
│   ├── services/          # Business logic
│   └── routes.ts          # API endpoints
├── shared/                # Shared schemas
└── public/               # Static assets
```

## 🎯 Features

### Phase 1: Prompt & Research
- AI-powered prompt refinement
- Automated topic research
- Episode planning and breakdown
- Duration and audience targeting

### Phase 2: Script Generation
- AI script creation using GPT-5
- Interactive script editing
- Real-time suggestions and improvements
- Analytics (word count, reading time)

### Phase 3: Audio Production
- OpenAI text-to-speech integration
- Multiple voice options
- Speed and tone controls
- Professional audio output

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema
- `npm run check` - Type checking

## 🔌 API Endpoints

### Projects
- `GET /api/projects?userId={id}` - Get user projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project

### AI Operations
- `POST /api/refine-prompt` - Refine user prompt
- `POST /api/research` - Conduct topic research
- `POST /api/generate-script` - Generate podcast script
- `POST /api/generate-audio` - Create audio from script

## 🏃‍♂️ Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5000`

## 🚢 Deployment

### Build for production:
```bash
npm run build
npm start
```

### Environment Variables for Production:
- Set `NODE_ENV=production`
- Use production database URL
- Ensure all API keys are set

## 🎨 Tech Stack

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
