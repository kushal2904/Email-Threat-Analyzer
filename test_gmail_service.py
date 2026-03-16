#!/usr/bin/env python3
"""Test Gmail service initialization and identify 503 error cause"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

print("=" * 70)
print("GMAIL SERVICE INITIALIZATION TEST")
print("=" * 70)

# Test 1: Check secrets file
print("\n[1] CHECKING SECRETS FILE...")
secrets_path = os.path.join(os.path.dirname(__file__), 'backend/secrets/client_secret.json')
if os.path.exists(secrets_path):
    print(f"✅ Secrets file found: {secrets_path}")
    try:
        import json
        with open(secrets_path) as f:
            secrets = json.load(f)
        client_id = secrets.get('web', {}).get('client_id')
        print(f"✅ Client ID loaded: {client_id[:30]}...")
    except Exception as e:
        print(f"❌ Error reading secrets: {e}")
else:
    print(f"❌ Secrets file NOT found: {secrets_path}")

# Test 2: Check environment variables
print("\n[2] CHECKING ENVIRONMENT VARIABLES...")
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend/.env'))

env_vars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI']
for var in env_vars:
    value = os.getenv(var)
    if value:
        if len(value) > 30:
            print(f"✅ {var}: {value[:30]}...")
        else:
            print(f"✅ {var}: {value}")
    else:
        print(f"❌ {var}: NOT SET")

# Test 3: Check imports
print("\n[3] CHECKING IMPORTS...")
try:
    from google.auth.oauthlib.flow import Flow
    print("✅ google.auth.oauthlib.flow imported")
except Exception as e:
    print(f"❌ Failed to import google.auth.oauthlib.flow: {e}")

try:
    from google.oauth2.credentials import Credentials
    print("✅ google.oauth2.credentials imported")
except Exception as e:
    print(f"❌ Failed to import google.oauth2.credentials: {e}")

try:
    from googleapiclient.discovery import build
    print("✅ googleapiclient.discovery imported")
except Exception as e:
    print(f"❌ Failed to import googleapiclient.discovery: {e}")

# Test 4: Try to initialize GmailService
print("\n[4] TESTING GMAIL SERVICE INITIALIZATION...")
try:
    os.chdir(os.path.join(os.path.dirname(__file__), 'backend'))
    from app.services.gmail_service import GmailService
    print("✅ GmailService imported successfully")
    
    # Try to get auth flow
    flow = GmailService.get_auth_flow()
    print("✅ OAuth flow created successfully")
    
    # Try to generate auth URL
    auth_url, state = GmailService.get_authorization_url()
    print(f"✅ Auth URL generated successfully")
    print(f"   URL starts with: {auth_url[:80]}...")
    
except Exception as e:
    print(f"❌ Gmail service error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
