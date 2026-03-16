# Gmail OAuth Integration - Quick Fix Checklist

## ⚠️ Current Issue
**Error**: "Gmail service unavailable: No module named 'google.auth.oauthlib'"

**Root Cause**: Google OAuth library not installed in Python environment

---

## ✅ Verify All Components Are in Place

- [x] **Backend Routes** - All 5 Gmail endpoints exist:
  - `GET /api/gmail/auth-url` - Returns OAuth URL
  - `POST /api/gmail/connect` - Exchanges code for token  
  - `GET /api/gmail/emails` - Fetches email list
  - `GET /api/gmail/email/{email_id}/header` - Gets raw email header
  - `GET /api/gmail/email/{email_id}/attachments` - Gets attachments

- [x] **Backend Services** - GmailService class with all methods:
  - `get_authorization_url()` - Creates OAuth flow
  - `exchange_code_for_token()` - Exchanges auth code
  - `get_recent_emails()` - Fetches emails from Gmail API
  - `get_email_header()` - Gets raw email content
  - `get_email_attachments()` - Gets attachment metadata

- [x] **Frontend Components**:
  - `Login.js` - Login form ✓
  - `GmailAnalyzer.js` - Email list and analysis UI ✓
  - `OAuthCallback.js` - Handles OAuth redirect ✓
  - `AuthContext.js` - Manages auth state ✓

- [x] **Configuration Files**:
  - `backend/.env` - Has GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI ✓
  - `backend/secrets/client_secret.json` - Valid OAuth credentials ✓
  - `app.main.py` - Gmail router registered ✓

---

## 🔧 To Fix the Issue - Follow These Steps

### Step 1: Install Dependencies (REQUIRED)

```powershell
# Open PowerShell and navigate to backend
cd "d:\Kushal GHRCE\email-threat-analyzer\backend"

# Activate Python virtual environment
.\venv\Scripts\Activate.ps1

# Install all required packages (including google-auth-oauthlib)
pip install -r requirements.txt
```

**Time**: ~2-3 minutes (first time) or ~30 seconds (if already partially installed)

### Step 2: Verify Installation

```powershell
pip show google-auth-oauthlib
```

Expected output:
```
Name: google-auth-oauthlib
Version: 1.2.0
Location: C:\...\venv\lib\site-packages
```

### Step 3: Restart Backend Server

```powershell
# Kill any running uvicorn process (Ctrl+C in terminal)
# Then restart:
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

### Step 4: Test Gmail Connection

1. Open http://localhost:3000 in browser
2. Log in with test account
3. Go to "Gmail Analyzer" tab
4. Click "**Connect Gmail**" button
5. You should see **Google login page** (not an error!)

---

## 📋 What Each File Does

### Backend
- `config.py` - Loads environment variables (GOOGLE_CLIENT_ID, etc.)
- `routes/gmail.py` - API endpoints for Gmail integration
- `services/gmail_service.py` - Handles OAuth and Gmail API calls
- `secrets/client_secret.json` - OAuth credentials from Google Cloud Console
- `.env` - Environment variables (DO NOT COMMIT!)

### Frontend
- `context/AuthContext.js` - Manages user login and Gmail connection state
- `pages/Login.js` - Login form
- `pages/GmailAnalyzer.js` - Email list, selection, and analysis UI
- `pages/OAuthCallback.js` - Receives OAuth code from Google

---

## 🔐 OAuth Flow Explained

```
User clicks "Connect Gmail"
    ↓
Browser opens Google OAuth login page
    ↓
User authorizes app
    ↓
Google redirects to: http://localhost:3000/oauth/callback?code=...
    ↓
OAuthCallback.js exchanges code for access token
    ↓
Token stored in localStorage
    ↓
Email list displayed in GmailAnalyzer
```

---

## 🆘 If Still Having Issues

### "ModuleNotFoundError: No module named 'google.auth.oauthlib'"
→ You didn't complete Step 1. Run `pip install -r requirements.txt`

### "Invalid client_id" or "Redirect URI mismatch"  
→ Check:
  - `GOOGLE_CLIENT_ID` matches in `.env` and `client_secret.json`
  - Redirect URI in Google Cloud Console includes `http://localhost:3000/oauth/callback`

### "No connection to localhost:8000"
→ Restart backend server with `uvicorn app.main:app --reload`

### "Email list is empty"
→ Normal if no recent emails. Frontend should still show "Load Emails" button.

---

## 📊 Required Packages

All in `backend/requirements.txt`:

```
google-auth-oauthlib==1.2.0         ← Main OAuth library (currently missing)
google-auth-httplib2==0.2.0         ← Auth transport
google-api-python-client==2.105.0   ← Gmail API client
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
python-dotenv==1.0.0
pydantic==2.5.0
... (and others)
```

---

## ✨ Once Fixed

After installation and restart, users will be able to:

1. ✅ Log in to the app
2. ✅ Click "Gmail Analyzer" tab
3. ✅ Click "Connect Gmail" and authorize with Google
4. ✅ See their email list
5. ✅ Select an email to analyze for threats
6. ✅ Get threat analysis results

---

**Need Help?** See `GMAIL_OAUTH_SETUP.md` for detailed troubleshooting guide.
