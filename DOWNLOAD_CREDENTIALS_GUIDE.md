# How to Download Updated Google OAuth Credentials

## Step-by-Step Guide

### Step 1: Open Google Cloud Console

1. Go to: **https://console.cloud.google.com/**
2. Sign in with your Google account (the one that created the OAuth app)

---

### Step 2: Navigate to Credentials

1. In the left sidebar, click **"APIs & Services"**
2. Click **"Credentials"**

You should see a list of your OAuth apps.

---

### Step 3: Find Your OAuth 2.0 Client ID

Look for your app in the **"OAuth 2.0 Client IDs"** section.

**Your Client ID is:**
```
 YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

Click on it to open the details page.

---

### Step 4: Verify Redirect URI is Added

On the client details page, you should see **"Authorized redirect URIs"** section.

**Add this redirect URI if it's not already there:**
```
http://localhost:3000/oauth/callback
```

**To add it:**
1. Click **"Add URI"** button
2. Paste: `http://localhost:3000/oauth/callback`
3. Click **"Save"** at the bottom

---

### Step 5: Download the Updated Credentials JSON

Now you need to download the credentials file:

**Option A: From the Credentials Page (Recommended)**

1. Go back to the **Credentials** page (if not already there)
2. Find your OAuth 2.0 Client ID in the list
3. On the right side, you'll see a **download icon** (⬇️) or **"Download"** button
4. Click it
5. Choose **"Download JSON"**

A file will download with a name like:
```
client_id_XXXXXXX.json
```

**Option B: Right-Click and Download**

1. On the client ID details page
2. Look for the download/export option
3. Select "JSON" format
4. Save the file

---

### Step 6: Check What You Downloaded

The downloaded file should look like this:

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

The important parts are:
- ✅ Same `client_id`
- ✅ Same `client_secret`
- ✅ **`redirect_uris` NOW includes your callback URL**
- ✅ `javascript_origins` includes your frontend domain

---

### Step 7: Replace Your App's Secrets File

1. **Locate your downloaded file** (usually in Downloads folder)
   - Name: `client_id_*.json`

2. **Copy the file content** or **rename it to** `client_secret.json`

3. **Navigate to your app directory:**
   ```
   d:\Kushal GHRCE\email-threat-analyzer\backend\secrets\
   ```

4. **Replace the existing `client_secret.json`:**
   - Delete the old `client_secret.json`
   - Paste the new one (or rename your downloaded file to `client_secret.json`)

**Location should be:**
```
d:\Kushal GHRCE\email-threat-analyzer\backend\secrets\client_secret.json
```

---

### Step 8: Verify the File Was Updated

```powershell
# Open PowerShell and check the file
cat "d:\Kushal GHRCE\email-threat-analyzer\backend\secrets\client_secret.json"
```

You should see the JSON with `redirect_uris` now including your callback URL.

---

### Step 9: Restart Your Backend

```powershell
# Stop current backend (Ctrl+C)

# Then start it fresh
Push-Location "d:\Kushal GHRCE\email-threat-analyzer\backend"
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --reload
```

---

### Step 10: Test Gmail Connection

1. **Refresh your browser** (Ctrl+F5)
2. Go to **http://localhost:3000**
3. Click **"Gmail Analyzer"**
4. Click **"Connect Gmail"**
5. You should now see **Google's sign-in page** ✅

---

## 🎯 Quick Reference

| Item | Location |
|------|----------|
| **Google Cloud Console** | https://console.cloud.google.com/ |
| **Section** | APIs & Services → Credentials |
| **Your Client ID** | 176425596987-ri9vlrg1f1j603dnunbqrhq4k5bv1p5i.apps.googleusercontent.com |
| **Required Redirect URI** | http://localhost:3000/oauth/callback |
| **Download Format** | JSON |
| **Save Location** | backend/secrets/client_secret.json |

---

## ✅ Checklist

Before testing, make sure:

- [ ] Redirect URI is added in Google Cloud Console
- [ ] Downloaded updated credentials JSON
- [ ] Replaced `backend/secrets/client_secret.json`
- [ ] Backend is restarted
- [ ] Browser cache is cleared (Ctrl+Shift+Delete)

---

## 🚨 Troubleshooting

### Can't Find Download Button?

**In Google Cloud Console → Credentials:**
1. Look for your OAuth 2.0 Client ID row
2. On the **right side** of the row, there should be **3 dots** (⋮) menu
3. Click it and select **"Download"** or **"Download JSON"**

### File Downloaded But Can't Find It

The file usually downloads to your **Downloads** folder:
```
C:\Users\YourUsername\Downloads\client_id_*.json
```

Open File Explorer and look there.

### Not Sure If You Have the Right File

Open the downloaded file with Notepad and check:
```
- Does it have "client_id": "176425596987-ri9vlrg..."? ✅
- Does it have "redirect_uris": ["http://localhost:3000/oauth/callback"]? ✅
```

If yes, it's the right one!

---

## 📝 After Downloading

Your credentials are now **updated** to allow:
- ✅ OAuth requests from http://localhost:3000
- ✅ Redirects back to http://localhost:3000/oauth/callback
- ✅ Gmail API read-only access

Gmail OAuth will now work! 🎉

---

## 🔐 Security Reminder

✅ **Safe to store locally:**
- `backend/secrets/client_secret.json` - Local only
- `backend/.env` - Local only

❌ **Never share/commit:**
- `GOOGLE_CLIENT_SECRET` value
- `client_secret.json` file
- These should NEVER go to GitHub or be public

Add to `.gitignore`:
```
backend/secrets/client_secret.json
backend/.env
```
