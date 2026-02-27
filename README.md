# Intelligent Email Threat Analyzer

A full-stack web application for detecting spoofed emails and malicious attachments using email header forensics and threat intelligence APIs.

## Features

✅ **Manual Email Analysis**
- Paste raw email headers for analysis
- Extract sender domain and originating IP
- Check SPF, DMARC, and DKIM records
- Perform WHOIS lookup for domain age
- Get IP geolocation information

✅ **File Analysis**
- Generate SHA-256 hash for uploaded files
- Check file reputation via VirusTotal API
- Detect malicious and suspicious files
- Support multiple file types

✅ **Threat Scoring Engine**
- Intelligent scoring based on multiple factors
- Explainable security analysis
- Risk levels: Safe, Suspicious, High Risk
- Real-time threat assessment

✅ **Gmail Integration** (Optional)
- OAuth 2.0 authentication
- Fetch recent emails (read-only)
- Automatic email analysis
- No credential storage

✅ **Dashboard & History**
- Scan history with detailed results
- Risk meter visualization
- Export scan results
- Easy data management

✅ **Privacy Controls**
- Delete individual scans
- Bulk delete all scans
- Auto-delete by date
- No sensitive data storage

## Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (or MongoDB)
- **Authentication:** OAuth 2.0 (Gmail)
- **APIs:**
  - VirusTotal - File reputation
  - IPInfo - IP geolocation
  - Gmail API - Email access
  - DNS API - SPF/DMARC/DKIM checks

### Frontend
- **Framework:** React 18
- **Styling:** CSS3 with CSS Variables
- **HTTP Client:** Axios
- **Icons:** React Icons
- **Routing:** React Router v6

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd email-threat-analyzer/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On macOS/Linux
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
copy .env.example .env
# Edit .env with your API keys
```

**Required API Keys:**
- Get `VIRUSTOTAL_API_KEY` from https://www.virustotal.com/gui/home/upload
- Get `IPINFO_API_KEY` from https://ipinfo.io/
- Get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from Google Cloud Console

5. **Initialize database**
```bash
python -c "from app.models.database import init_db; init_db()"
```

6. **Run backend server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
copy .env.example .env
# Edit .env with your settings
```

4. **Start development server**
```bash
npm start
```

Frontend will be available at: `http://localhost:3000`

## Project Structure

```
email-threat-analyzer/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── database.py       # Database models
│   │   │   └── schemas.py        # Pydantic schemas
│   │   ├── routes/
│   │   │   ├── analyze.py        # Header & file analysis
│   │   │   ├── history.py        # Scan history & deletion
│   │   │   └── gmail.py          # Gmail integration
│   │   ├── services/
│   │   │   ├── header_analyzer.py  # Email header parsing
│   │   │   ├── file_analyzer.py    # File analysis
│   │   │   ├── threat_scorer.py    # Threat scoring
│   │   │   └── gmail_service.py    # Gmail OAuth
│   │   ├── utils/
│   │   │   ├── dns_checker.py      # SPF/DMARC/DKIM
│   │   │   ├── whois_checker.py    # Domain info
│   │   │   ├── ip_checker.py       # IP geolocation
│   │   │   └── virustotal_checker.py # File reputation
│   │   └── main.py              # FastAPI entry point
│   ├── requirements.txt
│   ├── config.py
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RiskMeter.js            # Risk visualization
│   │   │   ├── HeaderAnalysisResult.js # Header results
│   │   │   └── FileAnalysisResult.js   # File results
│   │   ├── pages/
│   │   │   ├── Home.js      # Main analysis page
│   │   │   ├── GmailAnalysis.js  # Gmail integration
│   │   │   ├── Dashboard.js      # Scan history
│   │   │   └── Privacy.js        # Privacy settings
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## API Endpoints

### Analysis Endpoints

**POST /api/analyze-header**
```json
{
  "raw_header": "From: user@example.com\nReceived: ...",
  "subject": "Email Subject"
}
```

**POST /api/analyze-file**
- FormData with `file` and `scan_id`

**GET /api/history**
- Query params: `skip=0, limit=20`

**GET /api/scan/{scan_id}**

### History & Deletion

**DELETE /api/delete/{scan_id}**

**DELETE /api/delete-all**

**POST /api/delete-by-date**
```json
{
  "days_old": 30
}
```

### Gmail Integration

**GET /api/gmail/auth-url**

**POST /api/gmail/connect**
```json
{
  "auth_code": "authorization_code"
}
```

**GET /api/gmail/emails**
- Query params: `access_token=token`

**GET /api/gmail/email/{email_id}/header**
- Query params: `access_token=token`

## Threat Scoring System

The threat score (0-100) is calculated based on:

| Factor | Points | Condition |
|--------|--------|-----------|
| SPF Failure | 25 | SPF check fails |
| DMARC Failure | 25 | DMARC record missing/failed |
| DKIM Missing | 20 | No DKIM signature |
| Domain Age | 15 | Domain < 30 days old |
| Suspicious IP | 15 | High-risk country location |
| Malicious File | 25 | File flagged as malicious |
| Suspicious File | 15 | File marked as suspicious |

**Risk Levels:**
- **Safe (0-30):** Green - Email appears legitimate
- **Suspicious (31-60):** Yellow - Email has warning signs
- **High Risk (61-100):** Red - Email likely malicious/spoofed

## Deployment

### Docker Setup

Create `Dockerfile` for backend:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Deploy to Render (Backend)

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

### Deploy to Vercel (Frontend)

```bash
npm install -g vercel
vercel
```

Follow the prompts to deploy frontend.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/oauth/callback` (development)
   - Your production URL
6. Copy Client ID and Client Secret to `.env`

## VirusTotal API Setup

1. Go to [VirusTotal](https://www.virustotal.com/gui/home/upload)
2. Sign up for a free account
3. Get your API key from settings
4. Add to `.env`

## Security Best Practices

✅ **Implemented:**
- No storage of Gmail credentials
- OAuth tokens used securely
- File size limits (25MB)
- Input validation
- CORS protection
- Trusted host middleware
- Rate limiting ready

⚠️ **Additional Recommendations:**
- Use HTTPS in production
- Implement rate limiting
- Add user authentication
- Use environment-specific configs
- Regular security audits
- Log suspicious activities
- Set up monitoring/alerting

## Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.10+

# Verify dependencies
pip install -r requirements.txt

# Check port 8000 is free
netstat -ano | findstr :8000  # Windows
```

### Frontend connection issues
```bash
# Check REACT_APP_API_URL in .env
# Ensure backend is running on 8000
# Check CORS settings in backend
```

### API key errors
- Verify all API keys in `.env`
- Check API key quotas on provider websites
- Test API keys directly with curl

## License

MIT License - See LICENSE file

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Support

For issues and questions:
- GitHub Issues
- Documentation
- Email support

## Disclaimer

This tool is for educational and legitimate security purposes only. Users are responsible for complying with all applicable laws and regulations. The developers assume no liability for misuse or damage caused by this tool.
