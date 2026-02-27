# Environment Variables Configuration

## Backend Configuration

```bash
# API Keys (Required)
VIRUSTOTAL_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
IPINFO_API_KEY=xxxxxxxxxxxxxxxxxxxxx

# Gmail OAuth Configuration (For Gmail Integration)
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback

# Database Configuration
DATABASE_URL=sqlite:///./scan_results.db
# Alternative: DATABASE_URL=postgresql://user:password@localhost/db_name

# Security Configuration (Change in Production!)
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=False

# CORS Configuration (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

## Frontend Configuration

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:8000/api

# Google OAuth (for Gmail integration)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# Application Settings
REACT_APP_ENVIRONMENT=development  # development, staging, production
```

## Getting API Keys

### VirusTotal API Key

1. Visit https://www.virustotal.com/gui/home/upload
2. Sign up for a free account
3. Go to Settings → API Key
4. Copy your API key
5. Add to backend `.env`: `VIRUSTOTAL_API_KEY=your_key`

**Free Tier Limits:**
- 4 requests/minute
- File size: 650 MB
- Sufficient for small-scale usage

### IPInfo API Key

1. Visit https://ipinfo.io/
2. Sign up for a free account
3. Go to Account → Token
4. Copy your access token
5. Add to backend `.env`: `IPINFO_API_KEY=your_key`

**Free Tier Limits:**
- 50,000 requests/month
- Sufficient for production usage

### Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Gmail API (APIs & Services → Enable APIs and Services)
4. Create OAuth 2.0 Credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/oauth/callback`
     - `http://localhost:8000/oauth/callback`
     - Production URL
5. Copy Client ID and Client Secret
6. Add to backend `.env`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```
7. Add to frontend `.env`:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id
   ```

## Production Configuration

For production deployment, update these settings:

### Backend (.env)
```bash
# Security
SECRET_KEY=generate-strong-random-string
DEBUG=False

# Database (use PostgreSQL)
DATABASE_URL=postgresql://prod_user:strong_password@prod_host/db_name

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Server
HOST=0.0.0.0
PORT=8000

# Gmail OAuth Redirect
GOOGLE_REDIRECT_URI=https://yourdomain.com/oauth/callback
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_GOOGLE_CLIENT_ID=your_production_client_id
REACT_APP_ENVIRONMENT=production
```

## Environment Variable Types

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| VIRUSTOTAL_API_KEY | String | Yes | `abc123xyz789...` |
| IPINFO_API_KEY | String | Yes | `abc123xyz789...` |
| GOOGLE_CLIENT_ID | String | No | `123456789-abc.apps.googleusercontent.com` |
| GOOGLE_CLIENT_SECRET | String | No | `GOCSPX-...` |
| DATABASE_URL | String | No | `sqlite:///./scan_results.db` |
| SECRET_KEY | String | Yes | Random 32+ chars |
| HOST | String | No | `0.0.0.0` |
| PORT | Integer | No | `8000` |
| DEBUG | Boolean | No | `False` |
| ALLOWED_ORIGINS | String | No | `http://localhost:3000,https://domain.com` |

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to version control
- Use `.env.example` to show required variables
- Rotate API keys regularly
- Use strong `SECRET_KEY` in production
- Don't use same keys for development and production
- Set `DEBUG=False` in production
- Use HTTPS in production
- Consider using secrets management (AWS Secrets Manager, Azure Key Vault)

## Verifying Configuration

Test your configuration:

```bash
# Backend
python -c "from config import Config; print(Config.VIRUSTOTAL_API_KEY)"

# Frontend
echo $REACT_APP_API_URL  # On Windows: echo %REACT_APP_API_URL%
```
