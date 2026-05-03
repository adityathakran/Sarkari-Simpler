# Sarkari-Simpler 🇮🇳

A voice-first AI agent for discovering Indian Government schemes, built with Cloudflare Workers and AI.

> **For Rural India** - Helping citizens discover and understand government benefits through voice-based interaction in Hindi and English.

## 🌟 Features

- **Voice Input** - Speak your question in Hindi or English using Web Speech API
- **AI Translation** - Automatic Hindi ↔ English translation using Cloudflare AI
- **Smart Search** - RAG-powered semantic search across government schemes
- **Eligibility Check** - LLM-based reasoning to determine scheme eligibility
- **Bilingual Support** - Complete interface in both Hindi and English
- **5 Major Schemes** - PM-Kisan, PMAY-Gramin, Ayushman Bharat, MGNREGA, PM-GKAY

## 🏗️ Architecture

```
┌─────────────┐
│  Frontend   │  Web Speech API + Voice Input
│ (HTML/CSS/JS)│  Bilingual Interface (Hindi/English)
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Cloudflare Worker (TypeScript)   │
│ ┌─────────────────────────────────┐ │
│ │ 1. Translation (Hindi ↔ English)│ │
│ │    @cf/meta/m2m100-1.2b         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 2. RAG Query (Vector Search)    │ │
│ │    Cloudflare Vectorize         │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 3. Reasoning & Eligibility      │ │
│ │    @cf/meta/llama-3-8b-instruct │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────┐
│ Vectorize Index │  Scheme Embeddings
│ (scheme-embeddings)│  5 Government Schemes
└─────────────────┘
```

## 📁 Project Structure

```
sarkari-simpler/
├── worker/                 # Cloudflare Worker (TypeScript)
│   ├── src/
│   │   ├── index.ts       # Main entry point
│   │   ├── translation.ts # Hindi ↔ English translation
│   │   ├── rag.ts         # Vector search & retrieval
│   │   ├── reasoning.ts   # LLM-based eligibility check
│   │   └── types.ts       # TypeScript interfaces
│   ├── wrangler.toml      # Cloudflare configuration
│   ├── package.json
│   └── tsconfig.json
│
├── data-ingestion/        # Python vectorization script
│   ├── ingest.py          # Process & upload scheme data
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/              # Web interface
    ├── index.html         # Main page
    ├── styles.css         # Styling
    └── app.js             # Voice input & API integration
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v20+)
- Python 3.8+
- Cloudflare account ([sign up](https://dash.cloudflare.com/sign-up))

### 1. Install Dependencies

**Worker:**
```bash
cd worker
npm install
```

**Data Ingestion:**
```bash
cd data-ingestion
pip install -r requirements.txt
```

### 2. Configure Cloudflare

1. Get your Account ID and API Token:
   - Visit [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to **My Profile** → **API Tokens**
   - Create token with **Workers** and **Vectorize** permissions

2. Create Vectorize Index:
```bash
cd worker
npx wrangler vectorize create scheme-embeddings --dimensions=768 --metric=cosine
```

3. Set environment variables for data ingestion:
```bash
cd data-ingestion
cp .env.example .env
# Edit .env and add your CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN
```

### 3. Ingest Scheme Data

```bash
cd data-ingestion
python ingest.py
```

This will:
- Parse the 5 scheme markdown files
- Create semantic chunks
- Generate embeddings
- Upload to Vectorize (or save to `vectors_output.json` if credentials not set)

### 4. Run Worker Locally

```bash
cd worker
npm run dev
```

The Worker will start at `http://localhost:8787`

### 5. Test the Frontend

1. Open `frontend/index.html` in a web browser (Chrome/Edge recommended for voice support)
2. Make sure the Worker is running locally
3. Try voice input or text input in Hindi/English

**Example Queries:**
- Hindi: "मैं एक किसान हूं, मुझे क्या योजनाएं मिल सकती हैं?"
- English: "I need a house, what schemes are available?"

## 📤 Deployment

### Deploy Worker to Cloudflare

```bash
cd worker
npm run deploy
```

### Deploy Frontend

**Option 1: Cloudflare Pages**
```bash
cd frontend
npx wrangler pages deploy . --project-name=sarkari-simpler
```

**Option 2: Any Static Host**
- Upload `frontend/` folder to Netlify, Vercel, or GitHub Pages
- Update `WORKER_URL` in `app.js` to your deployed Worker URL

### Update Frontend Configuration

After deploying the Worker, update `frontend/app.js`:

```javascript
const WORKER_URL = 'https://sarkari-simpler.YOUR_SUBDOMAIN.workers.dev';
```

## 🧪 Testing

### API Endpoints

**Health Check:**
```bash
curl http://localhost:8787/health
```

**Query (Hindi):**
```bash
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "मैं एक किसान हूं",
    "language": "hi"
  }'
```

**Query (English):**
```bash
curl -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I am a farmer",
    "language": "en"
  }'
```

**Translation Test:**
```bash
curl -X POST http://localhost:8787/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "मैं एक किसान हूं",
    "targetLanguage": "en"
  }'
```

## 📊 Included Schemes

1. **PM-Kisan** - Direct income support for farmers (₹6,000/year)
2. **PMAY-Gramin** - Housing for rural poor (₹1.2-1.3 lakh)
3. **Ayushman Bharat** - Health insurance (₹5 lakh coverage)
4. **MGNREGA** - Employment guarantee (100 days/year)
5. **PM-GKAY** - Free food grains (5 kg/person/month)

## 🛠️ Technologies Used

- **Cloudflare Workers** - Serverless compute
- **Cloudflare AI** - Translation & LLM
  - `@cf/meta/m2m100-1.2b` - Translation model
  - `@cf/meta/llama-3-8b-instruct` - Reasoning model
  - `@cf/baai/bge-base-en-v1.5` - Embedding model
- **Cloudflare Vectorize** - Vector database
- **TypeScript** - Worker implementation
- **Python** - Data ingestion
- **Web Speech API** - Voice input
- **Vanilla HTML/CSS/JS** - Frontend

## 🔒 Security & Privacy

- All data processing happens on Cloudflare's edge
- No user data is stored
- Voice input processed locally in browser
- HTTPS enforced for all communications

## 📝 Future Enhancements

- [ ] Add more schemes (state-specific)
- [ ] Support more regional languages (Tamil, Telugu, Bengali, etc.)
- [ ] Implement user context persistence
- [ ] Add application form assistance
- [ ] SMS/WhatsApp integration for areas with limited internet

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

## 📄 License

MIT License - Built for social impact

## 🙏 Acknowledgments

- Government of India for open scheme information
- Cloudflare for AI infrastructure
- AI4Bharat for Indic language research

---

**Built with ❤️ for Rural India** 🇮🇳
