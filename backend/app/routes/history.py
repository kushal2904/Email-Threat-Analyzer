from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models.database import ScanResult, get_db

router = APIRouter(prefix="/api", tags=["history"])


class DeleteByDateRequest(BaseModel):
    days_old: int


@router.delete("/delete/{scan_id}")
async def delete_scan(scan_id: str, user_email: str = Query(None), db: Session = Depends(get_db)):
    """Delete a specific scan - optionally verify user ownership"""
    try:
        scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
        # If user_email is provided, verify ownership
        if user_email and scan.user_id != user_email:
            raise HTTPException(status_code=403, detail="Unauthorized: You can only delete your own scans")
        
        db.delete(scan)
        db.commit()
        
        return {"message": "Scan deleted successfully", "scan_id": scan_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete-all")
async def delete_all_scans(db: Session = Depends(get_db)):
    """Delete all scans"""
    try:
        count = db.query(ScanResult).count()
        db.query(ScanResult).delete()
        db.commit()
        
        return {"message": "All scans deleted successfully", "deleted_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/delete-by-date")
async def delete_scans_by_date(
    request: DeleteByDateRequest,
    db: Session = Depends(get_db)
):
    """Delete scans older than specified days"""
    from datetime import datetime, timedelta
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=request.days_old)
        scans = db.query(ScanResult).filter(ScanResult.created_at < cutoff_date).all()
        count = len(scans)
        
        for scan in scans:
            db.delete(scan)
        
        db.commit()
        
        return {
            "message": f"Deleted scans older than {request.days_old} days",
            "deleted_count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
