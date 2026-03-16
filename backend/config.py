import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # API Keys
    VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")
    IPINFO_API_KEY = os.getenv("IPINFO_API_KEY", "")
    
    # Gmail OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:3000/oauth/callback")
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./scan_results.db")
    
    # Settings
    MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'exe', 'zip', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'}
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # CORS - Allow both ports in case of port binding issues
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8001",
    ]
