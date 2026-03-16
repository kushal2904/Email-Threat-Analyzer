from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import ScanResult, get_db
from app.models.schemas import EmailHeaderRequest, AnalysisResult, ScanHistoryResponse
from app.services.header_analyzer import HeaderAnalyzer
from app.services.file_analyzer import FileAnalyzer
from app.services.threat_scorer import ThreatScorer
from config import Config
import uuid
from datetime import datetime

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze-header")
async def analyze_header(
    request: EmailHeaderRequest,
    db: Session = Depends(get_db)
):
    """Analyze email header for threats"""
    try:
        # Analyze header
        header_data = await HeaderAnalyzer.analyze_header(request.raw_header, request.subject)
        
        # Calculate threat score
        threat_result = ThreatScorer.calculate_score(header_data)
        
        # Create scan record
        scan_id = ThreatScorer.generate_scan_id()
        
        scan_record = ScanResult(
            id=scan_id,
            sender_email=header_data.get("sender_email"),
            sender_domain=header_data.get("sender_domain"),
            subject=header_data.get("subject"),
            originating_ip=header_data.get("originating_ip"),
            spf_result=header_data.get("spf", {}).get("result", "unknown"),
            dmarc_result=header_data.get("dmarc", {}).get("result", "unknown"),
            dkim_result=header_data.get("dkim", {}).get("result", "unknown"),
            domain_age_days=header_data.get("domain_age_days"),
            ip_location=header_data.get("ip_info", {}).get("city"),
            ip_details=header_data.get("ip_info", {}),
            threat_score=threat_result["score"],
            risk_level=threat_result["risk_level"],
            explanation="; ".join(threat_result["explanations"]),
            user_id=request.user_email,  # Store the user email
            created_at=datetime.utcnow()
        )
        
        db.add(scan_record)
        db.commit()
        
        return {
            "scan_id": scan_id,
            "sender_email": header_data.get("sender_email"),
            "sender_domain": header_data.get("sender_domain"),
            "originating_ip": header_data.get("originating_ip"),
            "spf_result": header_data.get("spf", {}).get("result", "unknown"),
            "spf_details": header_data.get("spf", {}).get("details", ""),
            "dmarc_result": header_data.get("dmarc", {}).get("result", "unknown"),
            "dmarc_details": header_data.get("dmarc", {}).get("details", ""),
            "dkim_result": header_data.get("dkim", {}).get("result", "unknown"),
            "dkim_details": header_data.get("dkim", {}).get("details", ""),
            "domain_info": header_data.get("domain_info"),
            "ip_info": header_data.get("ip_info"),
            "threat_score": threat_result["score"],
            "risk_level": threat_result["risk_level"],
            "explanations": threat_result["explanations"],
            "created_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-file")
async def analyze_file(
    scan_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Analyze attachment for malware"""
    try:
        # Validate file
        file_content = await file.read()
        validation = FileAnalyzer.validate_file(
            file.filename,
            len(file_content),
            Config.ALLOWED_EXTENSIONS,
            Config.MAX_FILE_SIZE
        )
        
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation["issues"])
        
        # Analyze file
        file_data = await FileAnalyzer.analyze_file(file_content, file.filename)
        
        # Update scan record with file analysis
        scan_record = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
        if scan_record:
            scan_record.file_hash = file_data.get("sha256")
            scan_record.file_name = file_data.get("file_name")
            scan_record.file_malware_status = file_data.get("malware_status")
            scan_record.file_details = file_data.get("virustotal", {})
            
            # Recalculate threat score with file data
            header_data = {
                "spf": {"result": scan_record.spf_result},
                "dmarc": {"result": scan_record.dmarc_result},
                "dkim": {"result": scan_record.dkim_result},
                "domain_age_days": scan_record.domain_age_days,
                "ip_info": scan_record.ip_details or {}
            }
            threat_result = ThreatScorer.calculate_score(header_data, file_data)
            scan_record.threat_score = threat_result["score"]
            scan_record.risk_level = threat_result["risk_level"]
            scan_record.explanation = "; ".join(threat_result["explanations"])
            
            db.commit()
        
        return {
            "scan_id": scan_id,
            "file_name": file_data.get("file_name"),
            "file_size": file_data.get("file_size"),
            "sha256": file_data.get("sha256"),
            "malware_status": file_data.get("malware_status"),
            "virustotal": file_data.get("virustotal"),
            "threat_score": threat_result["score"],
            "risk_level": threat_result["risk_level"],
            "explanations": threat_result["explanations"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history(
    skip: int = 0,
    limit: int = 20,
    user_email: str = None,
    db: Session = Depends(get_db)
):
    """Get scan history - filtered by user email if provided"""
    try:
        query = db.query(ScanResult)
        
        # Filter by user email if provided
        if user_email:
            query = query.filter(ScanResult.user_id == user_email)
        
        total = query.count()
        scans = query.order_by(ScanResult.created_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "scans": [
                {
                    "id": scan.id,
                    "sender_email": scan.sender_email,
                    "sender_domain": scan.sender_domain,
                    "threat_score": scan.threat_score,
                    "risk_level": scan.risk_level,
                    "file_name": scan.file_name,
                    "created_at": scan.created_at.isoformat()
                }
                for scan in scans
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scan/{scan_id}")
async def get_scan(scan_id: str, db: Session = Depends(get_db)):
    """Get specific scan result"""
    try:
        scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        return {
            "id": scan.id,
            "sender_email": scan.sender_email,
            "sender_domain": scan.sender_domain,
            "subject": scan.subject,
            "originating_ip": scan.originating_ip,
            "spf_result": scan.spf_result,
            "dmarc_result": scan.dmarc_result,
            "dkim_result": scan.dkim_result,
            "domain_age_days": scan.domain_age_days,
            "threat_score": scan.threat_score,
            "risk_level": scan.risk_level,
            "explanation": scan.explanation,
            "file_name": scan.file_name,
            "file_malware_status": scan.file_malware_status,
            "file_details": scan.file_details,
            "created_at": scan.created_at.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
