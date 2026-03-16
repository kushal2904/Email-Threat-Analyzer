#!/usr/bin/env python3
"""
Gmail OAuth Integration Diagnostic Script
Checks for missing dependencies and OAuth configuration issues
"""

import sys
import subprocess
import os
import json
from pathlib import Path

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def check_module(module_name, package_name=None):
    """Check if a Python module is installed"""
    try:
        __import__(module_name)
        print(f"✅ {module_name} is installed")
        return True
    except ImportError:
        print(f"❌ {module_name} is NOT installed")
        if package_name:
            print(f"   Install with: pip install {package_name}")
        return False

def main():
    print("\n" + "="*60)
    print("  GMAIL OAUTH INTEGRATION DIAGNOSTIC")
    print("="*60)
    
    # Step 1: Check Python version
    print_section("1. Python Environment")
    print(f"Python Version: {sys.version}")
    print(f"Python Executable: {sys.executable}")
    
    # Step 2: Check required packages
    print_section("2. Required Dependencies")
    
    required_packages = [
        ("google.auth", "google-auth"),
        ("google.auth.oauthlib", "google-auth-oauthlib"),
        ("google.oauth2", "google-auth"),
        ("google.api_client", "google-api-python-client"),
        ("fastapi", "fastapi"),
        ("sqlalchemy", "sqlalchemy"),
        ("pydantic", "pydantic"),
    ]
    
    missing_packages = []
    for module, package in required_packages:
        if not check_module(module, package):
            missing_packages.append(package)
    
    # Step 3: Check configuration files
    print_section("3. Configuration Files")
    
    config_files = {
        "Backend .env": "backend/.env",
        "Client Secrets": "backend/secrets/client_secret.json",
    }
    
    for name, path in config_files.items():
        if os.path.exists(path):
            print(f"✅ {name} exists: {path}")
        else:
            print(f"❌ {name} missing: {path}")
    
    # Step 4: Check OAuth configuration in .env
    print_section("4. OAuth Configuration")
    
    env_path = "backend/.env"
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            env_content = f.read()
            
        required_vars = [
            "GOOGLE_CLIENT_ID",
            "GOOGLE_CLIENT_SECRET",
            "GOOGLE_REDIRECT_URI",
        ]
        
        for var in required_vars:
            if var in env_content:
                print(f"✅ {var} is configured")
            else:
                print(f"❌ {var} is missing")
    
    # Step 5: Check backend routes
    print_section("5. Backend Routes Registration")
    
    routes_file = "backend/app/main.py"
    if os.path.exists(routes_file):
        with open(routes_file, 'r') as f:
            content = f.read()
            
        routes = [
            ("Gmail Router Import", "from app.routes import"),
            ("Gmail Router Include", "app.include_router(gmail.router)"),
        ]
        
        for route_name, route_check in routes:
            if route_check in content and "gmail" in content:
                print(f"✅ {route_name} configured")
            else:
                print(f"❌ {route_name} missing")
    
    # Step 6: Summary and recommendations
    print_section("6. Summary & Next Steps")
    
    if missing_packages:
        print(f"❌ {len(missing_packages)} required packages missing:\n")
        for pkg in missing_packages:
            print(f"   - {pkg}")
        
        print("\n" + "="*60)
        print("  INSTALLATION INSTRUCTIONS")
        print("="*60 + "\n")
        
        print("1. Activate virtual environment (if using venv):")
        print("   PowerShell: .\\venv\\Scripts\\Activate.ps1")
        print("   CMD: venv\\Scripts\\activate.bat")
        print("   Bash: source venv/bin/activate\n")
        
        print("2. Install dependencies:")
        print("   pip install -r backend/requirements.txt\n")
        
        print("3. Verify installation:")
        print("   pip show google-auth-oauthlib\n")
        
        print("4. Restart backend server:")
        print("   uvicorn app.main:app --reload\n")
        
        # Offer to install
        response = input("Would you like to install missing packages now? (y/n): ")
        if response.lower() == 'y':
            print("\nInstalling packages...")
            try:
                for pkg in missing_packages:
                    print(f"Installing {pkg}...")
                    subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])
                print("\n✅ All packages installed successfully!")
            except subprocess.CalledProcessError as e:
                print(f"\n❌ Installation failed: {e}")
                sys.exit(1)
    else:
        print("✅ All required packages are installed!")
        print("\nYour Gmail OAuth setup should work. If you still see errors:")
        print("  1. Restart your backend server")
        print("  2. Check that your Google OAuth credentials are valid")
        print("  3. See GMAIL_OAUTH_SETUP.md for detailed troubleshooting")

if __name__ == "__main__":
    main()
