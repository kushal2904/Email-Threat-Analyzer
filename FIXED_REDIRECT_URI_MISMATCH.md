# Gmail OAuth - Fix "redirect_uri_mismatch" Error

## 🔴 Error You're Seeing

```
Access blocked: This app's request is invalid
Error 400: redirect_uri_mismatch
```

**Root Cause**: The redirect URI in Google Cloud Console doesn't match your local app redirect URI.

---

## ✅ How to Fix (5 Steps)

### Step 1: Open Google Cloud Console

Go to: https://console.cloud.google.com/

### Step 2: Find Your OAuth App

1. Click **"APIs & Services"** in the left menu
2. Click **"Credentials"**
3. Under **"OAuth 2.0 Client IDs"**, find and click on:
   ```
   YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
   ```

### Step 3: Update Authorized redirect URIs

Look for the **"Authorized redirect URIs"** section.

**Current redirect URI from your config**:
```
http://localhost:3000/oauth/callback
```

**Make sure this exact URI is in the list. If not:**
1. Click **"Add URI"**
2. Paste: `http://localhost:3000/oauth/callback`
3. Click **"Save"**

**Optional: Add these for development flexibility**:
```
http://localhost:3000/oauth/callback
http://127.0.0.1:3000/oauth/callback
```

### Step 4: Download Updated Credentials

The credentials file needs to match what's in Google Cloud Console:

1. Make sure you're still on the **Credentials** page
2. Find your OAuth 2.0 Client ID entry
3. Click the **download icon** (⬇️)
4. Choose **"Download JSON"**

A file named `client_id_*.json` will download.

### Step 5: Update Your App

1. **Replace the secrets file**:
   - Copy the downloaded `client_id_*.json`
   - Paste it into: `backend/secrets/client_secret.json`
   - Overwrite the existing file

2. **Verify the content** of `backend/secrets/client_secret.json`:
   ```json
   {
     "web": {
       "client_id": "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com",
       "client_secret": "YOUR_CLIENT_SECRET_HERE",
       "auth_uri": "https://accounts.google.com/o/oauth2/auth",
       "token_uri": "https://oauth2.googleapis.com/token",
       "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
       "redirect_uris": ["http://localhost:3000/oauth/callback"],
       "javascript_origins": ["http://localhost:3000"]
     }
   }
   ```

3. **Restart your backend**:
   ```powershell
   Ctrl+C  # Stop current backend
   
   # Start fresh
   Push-Location "d:\Kushal GHRCE\email-threat-analyzer\backend"
   & ".\venv\Scripts\python.exe" -m uvicorn app.main:app --reload
   ```

---

## 🧪 Test the Fix

1. Refresh your browser (Ctrl+F5)
2. Go to http://localhost:3000
3. Click **"Gmail Analyzer"**
4. Click **"Connect Gmail"**
5. You should now see Google's sign-in page (not an error!)

---

## ⚠️ Common Issues & Solutions

### Issue: Still Getting "redirect_uri_mismatch"

**Solution**: 
- Check the redirect URI in Google Cloud Console EXACTLY matches your config
- Looking for typos? Compare character by character:
  ```
  Config: http://localhost:3000/oauth/callback
  Google: http://localhost:3000/oauth/callback
  ```
- The protocol (`http://` vs `https://`), domain, port, and path must ALL match

### Issue: "Invalid client_id" Error

**Solution**:
- Verify `GOOGLE_CLIENT_ID` in `backend/.env` matches the one in Google Cloud Console
- Current ID: `YOUR_CLIENT_ID_HERE.apps.googleusercontent.com`

### Issue: Changed Redirect URI but Still Getting Error

**Solution**:
- **Clear browser cache** (Ctrl+Shift+Delete)
- Make sure backend is **restarted** after updating files
- Google's caching can take a few seconds - wait 30 seconds and try again

---

## 📋 Current Configuration

Your app is set up for:

```
Environment: Development/Local
Frontend: http://localhost:3000
Backend: http://localhost:8000
OAuth Redirect: http://localhost:3000/oauth/callback
Gmail API: Read-only access
```

For **production**, you would replace `localhost:3000` with your actual domain.

---

## 🔐 Security Note

**Do NOT**:
- Share your `GOOGLE_CLIENT_SECRET` (password!)
- Commit `backend/secrets/client_secret.json` to Git
- Use `GOOGLE_CLIENT_SECRET` in frontend code

Your secret stays safe in:
- `backend/.env` (local only)
- `backend/secrets/client_secret.json` (local only)

---

## ✨ After Fixing

Once you've updated Google Cloud Console:
✅ "Access blocked" error will disappear
✅ You'll see Google's sign-in page
✅ After signing in, you'll see your Gmail inbox inside the app
✅ You can select and analyze individual emails

---

## 📞 Still Having Issues?

Double-check these are EXACTLY the same:

1. **In Google Cloud Console** → Credentials → OAuth 2.0 Client IDs
   ```
   Authorized redirect URIs: http://localhost:3000/oauth/callback
   ```

2. **In client_secret.json**
   ```json
   "redirect_uris": ["http://localhost:3000/oauth/callback"]
   ```

3. **In .env**
   ```
   GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
   ```

If these three all match exactly, Gmail OAuth will work! ✅
