from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import GmailConnectRequest
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Lazy import to avoid module loading issues
def get_gmail_service():
    """Lazy import Gmail service"""
    try:
        from app.services.gmail_service import GmailService
        return GmailService
    except ImportError as e:
        logger.error(f"Failed to import GmailService: {e}")
        raise HTTPException(status_code=503, detail=f"Gmail service unavailable: {str(e)}")

router = APIRouter(prefix="/api/gmail", tags=["gmail"])


@router.get("/auth-url")
async def get_gmail_auth_url():
    """Get Gmail OAuth authorization URL"""
    try:
        logger.info("=== Gmail Auth URL Request ===")
        GmailService = get_gmail_service()
        logger.info("GmailService loaded successfully")
        
        logger.info("Calling GmailService.get_authorization_url()")
        auth_url, state = GmailService.get_authorization_url()
        
        logger.info(f"Successfully generated auth URL with state: {state[:20]}...")
        return {
            "auth_url": auth_url,
            "state": state
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Gmail auth error: {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"{type(e).__name__}: {str(e)}"
        )


@router.post("/connect")
async def connect_gmail(request: GmailConnectRequest):
    """Connect Gmail account"""
    try:
        logger.info("=== Gmail Connect Request ===")
        logger.info(f"Auth code received: {request.auth_code[:20]}...")
        
        GmailService = get_gmail_service()
        logger.info("GmailService loaded")
        
        logger.info("Exchanging code for token...")
        token_data = GmailService.exchange_code_for_token(request.auth_code)
        logger.info(f"Token data: {token_data}")
        
        if token_data.get("status") == "error":
            error_msg = token_data.get("error", "Unknown error")
            logger.error(f"Token exchange failed: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        access_token = token_data.get("access_token")
        logger.info(f"Successfully obtained access token: {access_token[:20] if access_token else 'None'}...")
        
        return {
            "message": "Gmail connected successfully",
            "access_token": access_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Gmail connect error: {type(e).__name__}: {e}", exc_info=True)
        print(f"Gmail connect error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")


@router.get("/emails")
async def get_gmail_emails(access_token: str):
    """Get recent emails from Gmail"""
    try:
        GmailService = get_gmail_service()
        emails = await GmailService.get_recent_emails(access_token)
        return {"emails": emails}
    except Exception as e:
        print(f"Gmail emails error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/email/{email_id}/header")
async def get_gmail_email_header(email_id: str, access_token: str):
    """Get email header"""
    try:
        GmailService = get_gmail_service()
        header = await GmailService.get_email_header(access_token, email_id)
        if not header:
            raise HTTPException(status_code=404, detail="Email not found")
        
        return {"raw_header": header}
    except Exception as e:
        print(f"Gmail header error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/email/{email_id}/attachments")
async def get_gmail_attachments(email_id: str, access_token: str):
    """Get email attachments"""
    try:
        GmailService = get_gmail_service()
        attachments = await GmailService.get_email_attachments(access_token, email_id)
        return {"attachments": attachments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
