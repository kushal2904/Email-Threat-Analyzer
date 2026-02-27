from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import GmailConnectRequest
from app.services.gmail_service import GmailService

router = APIRouter(prefix="/api/gmail", tags=["gmail"])


@router.get("/auth-url")
async def get_gmail_auth_url():
    """Get Gmail OAuth authorization URL"""
    try:
        auth_url, state = GmailService.get_authorization_url()
        return {
            "auth_url": auth_url,
            "state": state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/connect")
async def connect_gmail(request: GmailConnectRequest):
    """Connect Gmail account"""
    try:
        token_data = GmailService.exchange_code_for_token(request.auth_code)
        
        if token_data.get("status") == "error":
            raise HTTPException(status_code=400, detail=token_data.get("error"))
        
        return {
            "message": "Gmail connected successfully",
            "access_token": token_data.get("access_token")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/emails")
async def get_gmail_emails(access_token: str):
    """Get recent emails from Gmail"""
    try:
        emails = await GmailService.get_recent_emails(access_token)
        return {"emails": emails}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/email/{email_id}/header")
async def get_gmail_email_header(email_id: str, access_token: str):
    """Get email header"""
    try:
        header = await GmailService.get_email_header(access_token, email_id)
        if not header:
            raise HTTPException(status_code=404, detail="Email not found")
        
        return {"raw_header": header}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/email/{email_id}/attachments")
async def get_gmail_attachments(email_id: str, access_token: str):
    """Get email attachments"""
    try:
        attachments = await GmailService.get_email_attachments(access_token, email_id)
        return {"attachments": attachments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
