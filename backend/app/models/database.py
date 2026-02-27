from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config import Config

DATABASE_URL = Config.DATABASE_URL
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ScanResult(Base):
    __tablename__ = "scan_results"
    
    id = Column(String, primary_key=True, index=True)
    sender_email = Column(String, index=True)
    sender_domain = Column(String, index=True)
    subject = Column(String)
    originating_ip = Column(String)
    spf_result = Column(String)  # pass, fail, none
    dmarc_result = Column(String)  # pass, fail, none
    dkim_result = Column(String)  # pass, fail, none
    domain_age_days = Column(Integer)
    ip_location = Column(String)
    ip_details = Column(JSON)  # Full IP info
    threat_score = Column(Float)
    risk_level = Column(String)  # Safe, Suspicious, High Risk
    explanation = Column(Text)
    file_hash = Column(String)
    file_name = Column(String)
    file_malware_status = Column(String)  # Clean, Suspicious, Malicious
    file_details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_id = Column(String)  # Future: for multi-user support


class GmailToken(Base):
    __tablename__ = "gmail_tokens"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True)
    access_token = Column(Text)
    refresh_token = Column(Text)
    token_expiry = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
