from typing import Dict, List, Optional
import uuid
from datetime import datetime


class ThreatScorer:
    """Calculate threat score and risk level"""
    
    @staticmethod
    def calculate_score(header_data: Dict, file_data: Optional[Dict] = None) -> Dict:
        """Calculate overall threat score with weighted factors"""
        score = 0.0
        max_score = 100.0
        explanations = []
        weighted_factors = {}
        
        # SPF check (25 points max) - Critical for authentication
        spf_result = header_data.get("spf", {}).get("result", "fail")
        spf_score = 0
        if spf_result == "fail":
            spf_score = 25
            explanations.append("SPF check failed - email not authorized")
        elif spf_result == "softfail":
            spf_score = 12
            explanations.append("SPF softfail - authorization questionable")
        elif spf_result == "neutral":
            spf_score = 8
            explanations.append("SPF neutral - no policy statement")
        elif spf_result == "not_tested":
            spf_score = 0
            # Don't add explanation if not tested
            pass
        weighted_factors["spf"] = spf_score
        score += spf_score
        
        # DMARC check (25 points max) - Very important for domain authentication
        dmarc_result = header_data.get("dmarc", {}).get("result", "fail")
        dmarc_score = 0
        if dmarc_result == "fail":
            dmarc_score = 25
            explanations.append("DMARC check failed - domain not verified")
        elif dmarc_result == "softfail":
            dmarc_score = 15
            explanations.append("DMARC softfail - partial policy alignment")
        elif dmarc_result == "neutral":
            dmarc_score = 8
            explanations.append("DMARC neutral - no policy")
        elif dmarc_result == "not_tested":
            dmarc_score = 0
            # Don't add explanation if not tested
            pass
        weighted_factors["dmarc"] = dmarc_score
        score += dmarc_score
        
        # DKIM check (20 points max) - Signature verification
        dkim_result = header_data.get("dkim", {}).get("result", "fail")
        dkim_score = 0
        if dkim_result == "fail":
            dkim_score = 20
            explanations.append("DKIM signature missing or invalid")
        elif dkim_result == "neutral":
            dkim_score = 5
            explanations.append("DKIM signature not present (unsigned)")
        elif dkim_result == "not_tested":
            dkim_score = 0
            # Don't add explanation if not tested
            pass
        weighted_factors["dkim"] = dkim_score
        score += dkim_score
        
        # Domain age check (10 points max) - New domains are riskier
        domain_age = header_data.get("domain_age_days")
        domain_age_score = 0
        if domain_age:
            if domain_age < 7:
                domain_age_score = 10
                explanations.append(f"Domain very new ({domain_age} days old)")
            elif domain_age < 30:
                domain_age_score = 7
                explanations.append(f"Domain is new ({domain_age} days old)")
            elif domain_age < 90:
                domain_age_score = 2
        weighted_factors["domain_age"] = domain_age_score
        score += domain_age_score
        
        # IP location check (10 points max) - Geographic risk assessment
        ip_info = header_data.get("ip_info", {})
        ip_score = 0
        if ip_info.get("status") == "found":
            country = ip_info.get("country")
            high_risk_countries = ["CN", "RU", "IR", "KP", "SY", "CU"]
            medium_risk_countries = ["VN", "TH", "NG"]
            
            if country in high_risk_countries:
                ip_score = 10
                explanations.append(f"Email from high-risk country: {country}")
            elif country in medium_risk_countries:
                ip_score = 5
                explanations.append(f"Email from medium-risk country: {country}")
        weighted_factors["ip_location"] = ip_score
        score += ip_score
        
        # File malware check (10 points max) - Attachment threats
        file_score = 0
        if file_data:
            malware_status = file_data.get("malware_status", "Unknown")
            vt_data = file_data.get("virustotal", {})
            
            if malware_status == "Malicious":
                file_score = 10
                explanations.append("Attachment flagged as malicious by VirusTotal")
            elif malware_status == "Suspicious":
                suspicious_count = vt_data.get("suspicious_count", 0)
                file_score = min(7, suspicious_count // 2)
                explanations.append(f"Attachment flagged as suspicious ({suspicious_count} engines)")
        weighted_factors["malware"] = file_score
        score = min(score + file_score, max_score)
        
        # Normalize score to 0-100
        normalized_score = min(score, max_score)
        risk_level = ThreatScorer._get_risk_level(normalized_score)
        
        return {
            "score": normalized_score,
            "risk_level": risk_level,
            "max_score": max_score,
            "explanations": explanations,
            "weighted_breakdown": weighted_factors,
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
