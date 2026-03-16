import aiohttp
import json
import os
import logging
from typing import Dict, Optional, List
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from config import Config

logger = logging.getLogger(__name__)


class GmailService:
    """Handle Gmail integration"""
    
    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
    SECRETS_FILE = os.path.join(os.path.dirname(__file__), '../../secrets/client_secret.json')
    
    @staticmethod
    def _get_secrets_path():
        """Get the correct path to client_secret.json"""
        # Try multiple possible locations
        possible_paths = [
            # From backend directory
            'secrets/client_secret.json',
            # From app/services directory (../.. up to backend, then down to secrets)
            os.path.join(os.path.dirname(__file__), '../../secrets/client_secret.json'),
            # From current working directory
            os.path.join(os.getcwd(), 'secrets/client_secret.json'),
            # From parent of cwd (in case running from root)
            os.path.join(os.path.dirname(os.getcwd()), 'backend', 'secrets', 'client_secret.json'),
        ]
        
        for path in possible_paths:
            abs_path = os.path.abspath(path)
            if os.path.exists(abs_path):
                return abs_path
        
        # If not found, raise clear error
        raise FileNotFoundError(
            f"Client secrets file not found in any of these locations:\n" +
            "\n".join([f"  - {os.path.abspath(p)}" for p in possible_paths])
        )
    
    @staticmethod
    def get_auth_flow():
        """Get OAuth flow for Gmail authentication"""
        try:
            secrets_path = GmailService._get_secrets_path()
            logger.info(f"Using secrets file: {secrets_path}")
            
            if not os.path.exists(secrets_path):
                raise FileNotFoundError(f"Client secrets file not found at {secrets_path}")
            
            logger.info(f"Google Redirect URI: {Config.GOOGLE_REDIRECT_URI}")
            logger.info(f"Google Client ID: {Config.GOOGLE_CLIENT_ID[:20]}...")
            
            # Validate that we have necessary config
            if not Config.GOOGLE_CLIENT_ID or not Config.GOOGLE_CLIENT_SECRET:
                raise ValueError("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in config")
            
            flow = Flow.from_client_secrets_file(
                secrets_path,
                scopes=GmailService.SCOPES,
                redirect_uri=Config.GOOGLE_REDIRECT_URI
            )
            logger.info("Successfully created OAuth flow")
            return flow
        except Exception as e:
            logger.error(f"Failed to create OAuth flow: {e}", exc_info=True)
            raise
    
    @staticmethod
    def get_authorization_url():
        """Get authorization URL"""
        try:
            flow = GmailService.get_auth_flow()
            auth_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true'
            )
            logger.info(f"Generated auth URL, state: {state[:20]}...")
            return auth_url, state
        except Exception as e:
            logger.error(f"Failed to get authorization URL: {e}", exc_info=True)
            raise
    
    @staticmethod
    def exchange_code_for_token(auth_code: str) -> Dict:
        """Exchange authorization code for access token"""
        try:
            logger.info("=== Exchanging auth code for token ===")
            flow = GmailService.get_auth_flow()
            logger.info(f"Flow created, redirect_uri: {flow.redirect_uri}")
            
            logger.info(f"Fetching token with code: {auth_code[:20]}...")
            flow.fetch_token(code=auth_code)
            
            credentials = flow.credentials
            logger.info(f"Token fetched successfully")
            
            return {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_expiry": credentials.expiry.isoformat() if credentials.expiry else None,
                "status": "success"
            }
        except Exception as e:
            logger.error(f"Token exchange failed: {type(e).__name__}: {e}", exc_info=True)
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
