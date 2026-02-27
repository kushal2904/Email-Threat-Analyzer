from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.models.database import init_db
from app.routes import analyze, history, gmail
from config import Config

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title="Intelligent Email Threat Analyzer",
    description="Analyze emails for spoofing and malicious attachments",
    version="1.0.0"
)

# Add security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"])

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Include routers
app.include_router(analyze.router)
app.include_router(history.router)
app.include_router(gmail.router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Intelligent Email Threat Analyzer API",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
