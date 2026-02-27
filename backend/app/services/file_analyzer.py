import hashlib
import aiofiles
from typing import Dict, Optional, ByteString
from app.utils.virustotal_checker import VirusTotalChecker


class FileAnalyzer:
    """Analyze file attachments for threats"""
    
    @staticmethod
    async def calculate_file_hash(file_content: bytes, algorithm: str = "sha256") -> str:
        """Calculate file hash"""
        if algorithm == "sha256":
            return hashlib.sha256(file_content).hexdigest()
        elif algorithm == "md5":
            return hashlib.md5(file_content).hexdigest()
        else:
            return hashlib.sha1(file_content).hexdigest()
    
    @staticmethod
    async def analyze_file(file_content: bytes, file_name: str) -> Dict:
        """Analyze file for malware"""
        try:
            # Calculate hashes
            sha256_hash = await FileAnalyzer.calculate_file_hash(file_content, "sha256")
            md5_hash = await FileAnalyzer.calculate_file_hash(file_content, "md5")
            
            # Check VirusTotal
            vt_result = await VirusTotalChecker.check_file_hash(sha256_hash)
            
            # Determine malware status
            malware_status = FileAnalyzer._determine_malware_status(vt_result)
            
            return {
                "file_name": file_name,
                "file_size": len(file_content),
                "sha256": sha256_hash,
                "md5": md5_hash,
                "virustotal": vt_result,
                "malware_status": malware_status,
                "status": "analyzed"
            }
        except Exception as e:
            return {
                "file_name": file_name,
                "status": "error",
                "error": str(e)
            }
    
    @staticmethod
    def _determine_malware_status(vt_result: Dict) -> str:
        """Determine malware status based on VirusTotal result"""
        if vt_result.get("status") == "error":
            return "Unknown"
        
        if vt_result.get("status") == "not_detected":
            return "Clean"
        
        malicious_count = vt_result.get("malicious_count", 0)
        suspicious_count = vt_result.get("suspicious_count", 0)
        
        if malicious_count > 0:
            return "Malicious"
        elif suspicious_count > 0 or malicious_count + suspicious_count > 0:
            return "Suspicious"
        else:
            return "Clean"
    
    @staticmethod
    def validate_file(file_name: str, file_size: int, allowed_extensions: set, max_size: int) -> Dict:
        """Validate file before analysis"""
        issues = []
        
        # Check file extension
        file_ext = file_name.split('.')[-1].lower() if '.' in file_name else ""
        if file_ext not in allowed_extensions:
            issues.append(f"File extension '{file_ext}' not allowed")
        
        # Check file size
        if file_size > max_size:
            issues.append(f"File size exceeds maximum ({file_size} > {max_size} bytes)")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues
        }
