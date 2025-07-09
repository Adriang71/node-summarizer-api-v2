# Web Analyzer API

TypeScript application for analyzing websites using AI and speech synthesis.

## 🚀 Features

- **HTML page fetching and parsing** (Cheerio + Axios)
- **Content analysis via OpenRouter API** (Free AI models)
- **Speech generation via ElevenLabs API**
- **Result caching in MongoDB**
- **REST API with validation**
- **AI configuration management** (models, prompts, languages)
- **Ready for Vercel deployment**

## 🛠️ Technologies

- **Backend**: Express.js + TypeScript
- **Database**: MongoDB + Mongoose
- **AI**: OpenRouter API
- **Text-to-Speech**: ElevenLabs API
- **Web Scraping**: Cheerio + Axios
- **Validation**: Joi
- **API Documentation**: Swagger/OpenAPI
- **Deployment**: Vercel

## 📋 Requirements

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- API Keys:
  - OpenRouter API Key
  - ElevenLabs API Key

## 🚀 Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd node-presentation
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp env.example .env
```

Edit the `.env` file and add your API keys:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/web-analyzer

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Request Configuration
REQUEST_TIMEOUT=30000
MAX_CONTENT_LENGTH=10485760
```

4. **Run in development mode**
```bash
npm run dev
```

5. **Build and run in production**
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### POST /api/auth/login
Login user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### Analysis

#### POST /api/analyze
Analyzes a website (requires authentication).

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "analysis": {
      "summary": "Brief summary of the page...",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "sentiment": "positive",
      "wordCount": 1500
    },
    "audio": {
      "audioUrl": "https://api.example.com/audio/audio_123.mp3",
      "audioId": "audio_123",
      "duration": 45
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "cached": false
}
```

### GET /api/history
Fetches analysis history for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (optional): Number of results (default 10, max 100)

### GET /api/analysis/:id
Fetches specific analysis by ID (requires authentication).

### DELETE /api/analysis/:id
Deletes analysis from database (requires authentication).

### GET /api/health
Checks server status.

### GET /
Health check endpoint.

### GET /api-docs
Interactive API documentation (Swagger UI).

### GET /api-docs/swagger.json
Raw Swagger specification in JSON format.

## 🎯 **AI Configuration Routes**

### GET /api/ai/config
Get current AI configuration (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "model": {
      "id": "deepseek/deepseek-chat-v3-0324:free",
      "name": "DeepSeek Chat",
      "provider": "DeepSeek",
      "maxTokens": 10000,
      "temperature": 0.3,
      "description": "Fast and reliable model for content analysis (Free)"
    },
    "prompt": {
      "id": "analysis-en",
      "name": "Content Analysis (English)",
      "language": "en",
      "description": "Standard content analysis prompt in English"
    },
    "language": "en",
    "maxContentLength": 10000,
    "enableCaching": true,
    "cacheExpiration": 3600
  }
}
```

#### PUT /api/ai/config
Update AI configuration (requires authentication).

**Request:**
```json
{
  "modelId": "llama-3-8b",
  "promptId": "analysis-pl",
  "language": "pl",
  "maxContentLength": 8000,
  "enableCaching": true,
  "cacheExpiration": 1800
}
```

#### GET /api/ai/models
Get available AI models (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "deepseek/deepseek-chat-v3-0324:free",
      "name": "DeepSeek Chat",
      "provider": "DeepSeek",
      "maxTokens": 10000,
      "temperature": 0.3,
      "description": "Fast and reliable model for content analysis (Free)"
    }
  ]
}
```

#### GET /api/ai/prompts
Get available AI prompts (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "analysis-en",
      "name": "Content Analysis (English)",
      "language": "en",
      "description": "Standard content analysis prompt in English"
    },
    {
      "id": "analysis-pl",
      "name": "Content Analysis (Polish)",
      "language": "pl",
      "description": "Standard content analysis prompt in Polish"
    }
  ]
}
```

## 🏗️ Project Structure

```
src/
├── ai/                      # AI configuration and prompts
│   ├── models.ts            # Available AI models configuration
│   ├── prompts.ts           # Prompt templates for different languages
│   ├── config.ts            # AI configuration manager
│   └── index.ts             # AI module exports
├── config/
│   ├── database.ts          # MongoDB configuration
│   └── swagger.ts           # Swagger documentation configuration
├── middleware/
│   ├── auth.ts              # JWT authentication middleware
│   └── errorHandler.ts      # Error handling middleware
├── models/
│   ├── Analysis.ts          # Analysis data model
│   └── User.ts              # User data model
├── routes/
│   ├── auth.ts              # Authentication routes
│   ├── analysis.ts          # Analysis routes
│   └── ai.ts                # AI configuration routes
├── services/
│   ├── analysisService.ts   # Analysis business logic
│   ├── authService.ts       # Authentication logic
│   ├── elevenLabsService.ts # Text-to-speech service
│   ├── openRouterService.ts # AI analysis service
│   └── webScraper.ts        # Web scraping service
├── types/
│   └── index.ts             # TypeScript type definitions
└── index.ts                 # Main application file
│   └── errorHandler.ts      # Error handling
├── models/
│   ├── Analysis.ts          # Analysis model
│   └── User.ts              # User model
├── routes/
│   ├── analysis.ts          # Analysis endpoints
│   └── auth.ts              # Authentication endpoints
├── services/
│   ├── analysisService.ts   # Main business logic
│   ├── authService.ts       # Authentication service
│   ├── webScraper.ts        # HTML page fetching
│   ├── openRouterService.ts # OpenRouter integration
│   └── elevenLabsService.ts # ElevenLabs integration
├── types/
│   └── index.ts             # TypeScript type definitions
└── index.ts                 # Main application file
```

## 🔧 Configuration

### MongoDB
The application uses MongoDB to store analysis history. You can use:
- Local MongoDB instance
- MongoDB Atlas (cloud)

### OpenRouter API
1. Register at [OpenRouter](https://openrouter.ai)
2. Generate API key
3. Add to environment variables

### ElevenLabs API
1. Register at [ElevenLabs](https://elevenlabs.io)
2. Generate API key
3. Add to environment variables

## 🚀 Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Configure environment variables in Vercel**
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add OPENROUTER_API_KEY
vercel env add ELEVENLABS_API_KEY
```

## 🧪 Testing

```bash
# Run tests
npm test

# Linting
npm run lint

# Code formatting
npm run format
```

## 📝 Usage Example

```bash
# Analyze website
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Fetch history
curl http://localhost:3000/api/history?limit=5

# Check server status
curl http://localhost:3000/api/health
```

## 🔒 Security

- Helmet.js for security headers
- Input validation (Joi)
- CORS configuration
- Rate limiting (can be added)
- Data sanitization

## 📈 Caching

The application automatically caches analysis results in MongoDB:
- Cache valid for 24 hours
- Avoids duplicate analyses
- Faster responses for repeated URLs

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

In case of issues:
1. Check server logs
2. Ensure all environment variables are set
3. Check database connection
4. Verify API keys

## 🔄 Roadmap

- [ ] Add rate limiting
- [ ] Support for multiple ElevenLabs voices
- [ ] Image analysis with OCR
- [ ] Webhook notifications
- [ ] Web dashboard
- [ ] Export to PDF/Word
- [ ] Multi-language support 