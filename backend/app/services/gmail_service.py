import aiohttp
import json
from typing import Dict, Optional, List
from google.auth.oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from config import Config


class GmailService:
    """Handle Gmail integration"""
    
    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
    
    @staticmethod
    def get_auth_flow():
        """Get OAuth flow for Gmail authentication"""
        flow = Flow.from_client_secrets_file(
            'secrets/client_secret.json',
            scopes=GmailService.SCOPES,
            redirect_uri=Config.GOOGLE_REDIRECT_URI
        )
        return flow
    
    @staticmethod
    def get_authorization_url():
        """Get authorization URL"""
        flow = GmailService.get_auth_flow()
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        return auth_url, state
    
    @staticmethod
    def exchange_code_for_token(auth_code: str) -> Dict:
        """Exchange authorization code for access token"""
        try:
            flow = GmailService.get_auth_flow()
            flow.fetch_token(code=auth_code)
            
            credentials = flow.credentials
            
            return {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_expiry": credentials.expiry.isoformat() if credentials.expiry else None,
                "status": "success"
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    @staticmethod
    async def get_recent_emails(access_token: str, max_results: int = 10) -> List[Dict]:
        """Fetch recent emails from Gmail"""
        try:
            credentials = Credentials(token=access_token)
            gmail_service = build('gmail', 'v1', credentials=credentials)
            
            # Get email list
            results = gmail_service.users().messages().list(
                userId='me',
                maxResults=max_results,
                q='is:unread'  # Get unread emails first
            ).execute()
            
            messages = results.get('messages', [])
            email_list = []
            
            for message in messages:
                msg_data = gmail_service.users().messages().get(
                    userId='me',
                    id=message['id'],
                    format='full'
                ).execute()
                
                headers = msg_data['payload']['headers']
                
                email_obj = {
                    "id": message['id'],
                    "from": next((h['value'] for h in headers if h['name'] == 'From'), ''),
                    "subject": next((h['value'] for h in headers if h['name'] == 'Subject'), ''),
                    "date": next((h['value'] for h in headers if h['name'] == 'Date'), ''),
                }
                email_list.append(email_obj)
            
            return email_list
        except Exception as e:
            return []
    
    @staticmethod
    async def get_email_header(access_token: str, email_id: str) -> Optional[str]:
        """Get raw email header"""
        try:
            credentials = Credentials(token=access_token)
            gmail_service = build('gmail', 'v1', credentials=credentials)
            
            msg_data = gmail_service.users().messages().get(
                userId='me',
                id=email_id,
                format='raw'
            ).execute()
            
            import base64
            email_content = base64.urlsafe_b64decode(msg_data['raw']).decode('utf-8')
            
            return email_content
        except Exception as e:
            return None
    
    @staticmethod
    async def get_email_attachments(access_token: str, email_id: str) -> List[Dict]:
        """Get email attachments"""
        try:
            credentials = Credentials(token=access_token)
            gmail_service = build('gmail', 'v1', credentials=credentials)
            
            msg_data = gmail_service.users().messages().get(
                userId='me',
                id=email_id,
                format='full'
            ).execute()
            
            parts = msg_data.get('payload', {}).get('parts', [])
            attachments = []
            
            for part in parts:
                if part['filename'] and 'data' in part['body']:
                    attachment = {
                        "filename": part['filename'],
                        "mime_type": part['mimeType'],
                        "size": part['body'].get('size', 0)
                    }
                    attachments.append(attachment)
            
            return attachments
        except Exception as e:
            return []
