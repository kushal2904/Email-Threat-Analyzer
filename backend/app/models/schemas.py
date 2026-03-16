from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime


class EmailHeaderRequest(BaseModel):
    raw_header: str
    subject: Optional[str] = None
    user_email: Optional[str] = None  # Email of the user performing the analysis


class FileAnalysisRequest(BaseModel):
    file_hash: Optional[str] = None  # SHA-256
    file_name: str


class AnalysisResult(BaseModel):
    id: str
    sender_email: Optional[str]
    sender_domain: Optional[str]
    spf_result: str
    dmarc_result: str
    dkim_result: str
    domain_age_days: Optional[int]
    threat_score: float
    risk_level: str
    explanation: str
    file_malware_status: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ScanHistoryResponse(BaseModel):
    total: int
    scans: list[AnalysisResult]


class ThreatScoringResponse(BaseModel):
    score: float
    risk_level: str
    details: Dict[str, Any]


class GmailConnectRequest(BaseModel):
    auth_code: str


class GmailEmailAnalysisRequest(BaseModel):
    email_id: str


class GmailAnalysisResponse(BaseModel):
    email_id: str
    analysis: AnalysisResult


class DeleteConfirmResponse(BaseModel):
    message: str
    deleted_count: int
