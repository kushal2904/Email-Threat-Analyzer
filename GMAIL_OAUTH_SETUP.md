# Gmail OAuth Integration - Setup Guide & Troubleshooting

## **Main Issue Found**
❌ **Missing Google OAuth Library**: `google-auth-oauthlib` is not installed in your Python environment

## **How to Fix**

### **Step 1: Install Dependencies**

Open Power Shell in the backend directory and run:

```powershell
# Navigate to backend directory
cd "d:\Kushal GHRCE\email-threat-analyzer\backend"

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install all dependencies
pip install -r requirements.txt
```

To avoid path issues, you can also run the batch file created in the root:
```powershell
& "d:\Kushal GHRCE\email-threat-analyzer\setup_backend.bat"
```

### **Step 2: Verify Installation**

After installation completes, verify google-auth-oauthlib is installed:

```powershell
pip show google-auth-oauthlib
```

You should see:
```
Name: google-auth-oauthlib
Version: 1.2.0
```

### **Step 3: Restart Backend Server**

Stop the running uvicorn server and restart it:

```powershell
# Activate venv if not already activated
.\venv\Scripts\Activate.ps1

# Run backend
uvicorn app.main:app --reload
```

---

## **Configuration Verification** ✅

### **Backend Environment Variables (.env)**
```
✅ GOOGLE_CLIENT_ID=176425596987-ri9vlrg1f1j603dnunbqrhq4k5bv1p5i.apps.googleusercontent.com
✅ GOOGLE_CLIENT_SECRET=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
✅ GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
✅ Client Secrets File: backend/secrets/client_secret.json (EXISTS)
```

### **Backend Routes** ✅
- ✅ `GET /api/gmail/auth-url` - Returns OAuth URL
- ✅ `POST /api/gmail/connect` - Exchanges auth code for token
- ✅ `GET /api/gmail/emails` - Fetches emails
- ✅ `GET /api/gmail/email/{email_id}/header` - Gets email header
- ✅ `GET /api/gmail/email/{email_id}/attachments` - Gets attachments

### **Frontend Components** ✅
- ✅ `OAuthCallback.js` - Handles Google redirect
- ✅ `GmailAnalyzer.js` - Email selection and analysis
- ✅ `AuthContext.js` - Gmail connection state management

### **Gmail Router Registration** ✅
- ✅ `app.include_router(gmail.router)` - Enabled in main.py

---

## **Required Python Packages** (from requirements.txt)

```
google-auth-oauthlib==1.2.0      ← Google OAuth Library (MISSING)
google-auth-httplib2==0.2.0      ← Google Auth Transport
google-api-python-client==2.105.0 ← Gmail API Client
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
python-dotenv==1.0.0
pydantic==2.5.0
aiohttp==3.9.1
... and other dependencies
```

---

## **OAuth Flow Diagram**

```
1. User clicks "Connect Gmail" button (Frontend)
   ↓
2. Frontend calls: GET /api/gmail/auth-url
   ↓
3. Backend returns: { "auth_url": "https://accounts.google.com/o/oauth2/auth?..." }
   ↓
4. Frontend opens: window.open(auth_url, ...)
   ↓
5. User authorizes app on Google login page
   ↓
6. Google redirects to: http://localhost:3000/oauth/callback?code=xxxxx&state=xxxxx
   ↓
7. OAuthCallback.js extracts code and posts: POST /api/gmail/connect { auth_code: "xxxxx" }
   ↓
8. Backend exchanges code for token and returns: { "access_token": "ya29.a0A..." }
   ↓
9. Frontend stores token and opens Gmail email list
   ↓
10. Frontend fetches emails: GET /api/gmail/emails?access_token=ya29.a0A...
```

---

## **Testing the Connection**

After installing dependencies and restarting the server:

1. Go to http://localhost:3000/gmail
2. Click "Connect Gmail"
3. You should see Google login screen (not an error)
4. After authorization, you should see your email list

---

## **If Still Getting Errors**

### Error: "ModuleNotFoundError: No module named 'google.auth.oauthlib'"
- **Solution**: You didn't install requirements.txt yet. Run the command in Step 1

### Error: "Invalid client_id" or "Redirect URI mismatch"
- **Check**: Verify your client_id and client_secret in `.env` match `secrets/client_secret.json`
- **Also check**: Google OAuth settings have `http://localhost:3000/oauth/callback` as authorized redirect URI

### Error: "Email list empty" or "Failed to fetch emails"
- **Check**: Gmail API is enabled in Google Cloud Console
- **Check**: Your Google account has access to read Gmail (most accounts do by default)

---

## **Reference URLs**

- Google Cloud Console: https://console.cloud.google.com/
- Gmail API Docs: https://developers.google.com/gmail/api/guides
- Your Project: https://console.cloud.google.com/apis/dashboard

