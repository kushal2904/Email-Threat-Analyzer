#!/usr/bin/env python3
"""
Diagnostic script to test Gmail service initialization
"""
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

print("=" * 60)
print("GMAIL SERVICE DIAGNOSTIC TEST")
print("=" * 60)

# Test 1: Check environment
print("\n[1] Checking environment...")
print("Current directory: " + os.getcwd())
print("Python version: " + sys.version.split()[0])

# Test 2: Check .env file
print("\n[2] Checking .env file...")
if os.path.exists('.env'):
    print("[OK] .env file found")
    from dotenv import load_dotenv
    load_dotenv()
    client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    if client_id:
        print("  - GOOGLE_CLIENT_ID: " + client_id[:20] + "...")
    else:
        print("  - GOOGLE_CLIENT_ID: NOT SET")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
    if client_secret:
        print("  - GOOGLE_CLIENT_SECRET: SET")
    else:
        print("  - GOOGLE_CLIENT_SECRET: NOT SET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "")
    if redirect_uri:
        print("  - GOOGLE_REDIRECT_URI: " + redirect_uri)
    else:
        print("  - GOOGLE_REDIRECT_URI: NOT SET")
else:
    print("[FAIL] .env file NOT found")

# Test 3: Check Config
print("\n[3] Checking Config...")
try:
    from config import Config
    print("[OK] Config imported")
    if Config.GOOGLE_CLIENT_ID:
        print("  - GOOGLE_CLIENT_ID: " + Config.GOOGLE_CLIENT_ID[:20] + "...")
    else:
        print("  - GOOGLE_CLIENT_ID: NOT SET")
    if Config.GOOGLE_CLIENT_SECRET:
        print("  - GOOGLE_CLIENT_SECRET: SET")
    else:
        print("  - GOOGLE_CLIENT_SECRET: NOT SET")
    print("  - GOOGLE_REDIRECT_URI: " + Config.GOOGLE_REDIRECT_URI)
    print("  - ALLOWED_ORIGINS count: " + str(len(Config.ALLOWED_ORIGINS)))
except Exception as e:
    print("[FAIL] Config error: " + str(e))

# Test 4: Check client_secret.json
print("\n[4] Checking client_secret.json...")
possible_paths = [
    'secrets/client_secret.json',
    os.path.join(os.path.dirname(__file__), 'secrets/client_secret.json'),
    os.path.join(os.getcwd(), 'secrets/client_secret.json'),
]
found = False
for path in possible_paths:
    if os.path.exists(path):
        print("[OK] Found at: " + os.path.abspath(path))
        found = True
        # Try to read it
        try:
            import json
            with open(path, 'r') as f:
                data = json.load(f)
                if 'web' in data:
                    print("  - Format: WEB (correct for web app)")
                    client_id = data['web'].get('client_id', 'NOT SET')
                    print("  - Client ID: " + client_id[:20] + "...")
                    print("  - Redirect URIs: " + str(data['web'].get('redirect_uris', [])))
                elif 'installed' in data:
                    print("  - Format: INSTALLED (wrong - should be WEB)")
        except Exception as e:
            print("  - Error reading: " + str(e))
        break
        
if not found:
    print("[FAIL] client_secret.json not found in any location:")
    for path in possible_paths:
        print("  - " + os.path.abspath(path))

# Test 5: Check if Google libraries are installed
print("\n[5] Checking Google libraries...")
libraries = [
    'google.auth',
    'google.auth.oauthlib',
    'google.auth.oauthlib.flow',
    'google.oauth2.credentials',
    'googleapiclient.discovery'
]
for lib in libraries:
    try:
        __import__(lib)
        print("[OK] " + lib)
    except ImportError as e:
        print("[FAIL] " + lib + ": " + str(e))

# Test 6: Try to load GmailService
print("\n[6] Attempting to import GmailService...")
try:
    from app.services.gmail_service import GmailService
    print("[OK] GmailService imported")
    
    # Try to get the auth flow
    print("\n[7] Attempting to create OAuth flow...")
    flow = GmailService.get_auth_flow()
    print("[OK] OAuth flow created successfully")
    auth_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    print("[OK] Authorization URL generated")
    print("  - URL length: " + str(len(auth_url)) + " chars")
    print("  - State: " + state[:20] + "...")
    
except Exception as e:
    print("[FAIL] Error: " + type(e).__name__ + ": " + str(e))
    import traceback
    print("\nFull traceback:")
    traceback.print_exc()

print("\n" + "=" * 60)
print("DIAGNOSTIC TEST COMPLETE")
print("=" * 60)
