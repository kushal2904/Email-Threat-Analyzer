from typing import Dict, List, Optional
import uuid
from datetime import datetime


class ThreatScorer:
    """Calculate threat score and risk level"""
    
    @staticmethod
    def calculate_score(header_data: Dict, file_data: Optional[Dict] = None) -> Dict:
        """Calculate overall threat score"""
        score = 0.0
        max_score = 100.0
        explanations = []
        
        # SPF check (25 points max)
        spf_result = header_data.get("spf", {}).get("result", "fail")
        if spf_result == "fail":
            score += 25
            explanations.append("SPF check failed")
        elif spf_result == "pass":
            # SPF passed, no points
            pass
        
        # DMARC check (25 points max)
        dmarc_result = header_data.get("dmarc", {}).get("result", "fail")
        if dmarc_result == "fail":
            score += 25
            explanations.append("DMARC record missing or failed")
        
        # DKIM check (20 points max)
        dkim_result = header_data.get("dkim", {}).get("result", "fail")
        if dkim_result == "fail":
            score += 20
            explanations.append("DKIM signature missing")
        
        # Domain age check (15 points max)
        domain_age = header_data.get("domain_age_days")
        if domain_age and domain_age < 30:
            score += min(15, domain_age)  # More recent = higher score
            explanations.append(f"Domain is new ({domain_age} days)")
        
        # IP location check (15 points max)
        ip_info = header_data.get("ip_info", {})
        if ip_info.get("status") == "found":
            country = ip_info.get("country")
            if country in ["CN", "RU", "IR", "KP", "SY", "CU"]:
                score += 15
                explanations.append(f"Email from high-risk country: {country}")
        
        # File malware check (25 points max)
        if file_data:
            malware_status = file_data.get("malware_status", "Unknown")
            vt_data = file_data.get("virustotal", {})
            
            if malware_status == "Malicious":
                score = min(score + 25, max_score)
                explanations.append("File flagged as malicious by VirusTotal")
            elif malware_status == "Suspicious":
                suspicious_count = vt_data.get("suspicious_count", 0)
                score = min(score + 15, max_score)
                explanations.append(f"File flagged as suspicious ({suspicious_count} engines)")
        
        # Normalize score to 0-100
        normalized_score = min(score, max_score)
        risk_level = ThreatScorer._get_risk_level(normalized_score)
        
        return {
            "score": normalized_score,
            "risk_level": risk_level,
            "max_score": max_score,
            "explanations": explanations,
            "breakdown": {
                "spf": spf_result,
                "dmarc": dmarc_result,
                "dkim": dkim_result,
                "domain_age": domain_age,
                "malware_status": file_data.get("malware_status", "N/A") if file_data else "N/A"
            }
        }
    
    @staticmethod
    def _get_risk_level(score: float) -> str:
        """Get risk level based on score"""
        if score < 30:
            return "Safe"
        elif score < 60:
            return "Suspicious"
        else:
            return "High Risk"
    
    @staticmethod
    def generate_scan_id() -> str:
        """Generate unique scan ID"""
        return str(uuid.uuid4())
