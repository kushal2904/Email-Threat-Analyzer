from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import ScanResult, get_db

router = APIRouter(prefix="/api", tags=["history"])


@router.delete("/delete/{scan_id}")
async def delete_scan(scan_id: str, db: Session = Depends(get_db)):
    """Delete a specific scan"""
    try:
        scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        
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
    days_old: int,
    db: Session = Depends(get_db)
):
    """Delete scans older than specified days"""
    from datetime import datetime, timedelta
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        scans = db.query(ScanResult).filter(ScanResult.created_at < cutoff_date).all()
        count = len(scans)
        
        for scan in scans:
            db.delete(scan)
        
        db.commit()
        
        return {
            "message": f"Deleted scans older than {days_old} days",
            "deleted_count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
