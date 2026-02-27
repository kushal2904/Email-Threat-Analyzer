# Quick Start Guide

Get the Email Threat Analyzer running in 10 minutes!

## Prerequisites Check

```bash
# Check Python version (need 3.10+)
py --version

# Check Node version (need 14+)
node --version

# Check npm
npm --version
```

## Step 1: Get API Keys (5 minutes)

### VirusTotal API Key
1. Go to https://www.virustotal.com/gui/home/upload
2. Sign up (free account)
3. Copy API key from Settings

### IPInfo API Key
1. Go to https://ipinfo.io
2. Sign up (free account)
3. Copy access token

### Google OAuth (Optional)
1. Go to https://console.cloud.google.com
2. Create project → Enable Gmail API
3. Create OAuth credentials (Web application)
4. Add redirect URI: `http://localhost:3000/oauth/callback`
5. Copy Client ID and Secret

## Step 2: Backend Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
py -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env with your API keys (use Notepad or VS Code)
# REQUIRED:
# - VIRUSTOTAL_API_KEY
# - IPINFO_API_KEY
# OPTIONAL:
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET

# Start server
uvicorn app.main:app --reload
```

Backend running at: `http://localhost:8000`

## Step 3: Frontend Setup (2 minutes)

In a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Start development server
npm start
```

Frontend will open at: `http://localhost:3000`

## Step 4: Test the Application

1. Open http://localhost:3000
2. Go to "Home" page
3. Paste sample email header (see below)
4. Click "Analyze Header"
5. (Optional) Upload a test file

### Sample Email Header for Testing

```
From: sender@example.com
To: recipient@gmail.com
Subject: Test Email
Date: Wed, 13 Dec 2023 10:30:00 +0000
Received: from mail.example.com (mail.example.com [192.0.2.1])
    by mx.google.com with SMTP id a1234567890b.0 - gzip
    for <recipient@gmail.com>; Wed, 13 Dec 2023 10:30:00 +0000
Authentication-Results: mx.google.com;
    spf=pass (domain of example.com designates 192.0.2.1 as permitted sender)
    dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=example.com
X-Originating-IP: [192.0.2.1]
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=example.com;
    s=default; h=from:to:subject:date; bh=abcd1234; b=xyz789
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is free
# Windows:
netstat -ano | findstr :8000

# Kill process using port 8000 (if needed)
# Windows:
taskkill /PID <PID> /F
```

### Frontend won't connect
```bash
# Check backend is running on 8000
# Check REACT_APP_API_URL in frontend/.env

# Restart both servers
```

### API key errors
```bash
# Test VirusTotal API
curl -H "x-apikey: YOUR_KEY" https://www.virustotal.com/api/v3/files/abc123...

# Test IPInfo API
curl https://ipinfo.io/8.8.8.8?token=YOUR_KEY
```

## Files to Know

Important files during development:

```
backend/
├── app/main.py           # FastAPI entry point
├── app/routes/           # API endpoints
├── app/services/         # Business logic
├── config.py             # Configuration
└── requirements.txt      # Dependencies

frontend/
├── src/pages/            # React pages
├── src/components/       # React components
├── src/styles/           # Styling
└── package.json          # Dependencies
```

## Next Steps

After getting it working:

1. **Read the docs:** See `README.md` for full documentation
2. **Configure API keys:** See `CONFIGURATION.md` for detailed setup
3. **Try Gmail integration:** Connect your Gmail account
4. **Review code:** Understand the architecture
5. **Deploy:** Use the deployment guide in `README.md`

## Common Commands

```bash
# Backend
venv\Scripts\activate          # Activate environment
pip install -r requirements.txt # Install dependencies
uvicorn app.main:app --reload  # Run with auto-reload
uvicorn app.main:app --port 8001 # Run on different port

# Frontend
npm install                    # Install dependencies
npm start                      # Start dev server
npm run build                  # Build for production
npm run eject                  # Eject (careful!)

# Database
py -c "from app.models.database import init_db; init_db()" # Initialize DB
```

## Where to Get Help

- **Backend Issues:** Check FastAPI docs at https://fastapi.tiangolo.com/
- **Frontend Issues:** Check React docs at https://react.dev/
- **API Issues:** See API provider documentation
- **Documentation:** Read `README.md` and `CONFIGURATION.md`

## Pro Tips

💡 **Recommended Setup:**
- Use VS Code for development
- Install REST Client extension for testing API
- Use browser DevTools for frontend debugging
- Run backend and frontend in separate terminal windows

🚀 **Performance:**
- Backend responds instantly for most requests
- File analysis takes 2-5 seconds (VirusTotal dependency)
- IP geolocation is usually quick
- Database queries are fast (SQLite for dev, PostgreSQL for prod)

🔒 **Security:**
- Never share API keys
- Use `.env` file (excluded from git)
- Don't commit sensitive data
- Review data in Privacy page regularly

## Success!

Once running, you should see:
- ✅ Backend:  `INFO:     Uvicorn running on http://0.0.0.0:8000`
- ✅ Frontend: Browser opens to `http://localhost:3000`
- ✅ UI: Dark cybersecurity theme with blue accents

You're ready to analyze emails! 🎉
