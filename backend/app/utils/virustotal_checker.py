import aiohttp
import requests
import time
from typing import Dict, Optional, List
from config import Config


class VirusTotalChecker:
    """Check file reputation using VirusTotal API"""
    
    BASE_URL = "https://www.virustotal.com/api/v3"
    
    @staticmethod
    async def check_file_hash(file_hash: str) -> Dict:
        """Check file hash reputation"""
        try:
            headers = {"x-apikey": Config.VIRUSTOTAL_API_KEY}
            url = f"{VirusTotalChecker.BASE_URL}/files/{file_hash}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        return VirusTotalChecker._parse_detection_response(data, file_hash)
                    elif response.status == 404:
                        return {
                            "hash": file_hash,
                            "found": False,
                            "malicious_count": 0,
                            "undetected_count": 0,
                            "suspicious_count": 0,
                            "status": "not_detected"
                        }
                    else:
                        return {"hash": file_hash, "status": "error", "error": f"HTTP {response.status}"}
        except Exception as e:
            return {"hash": file_hash, "status": "error", "error": str(e)}
    
    @staticmethod
    async def submit_file(file_path: str, file_name: str) -> Dict:
        """Submit file for scanning"""
        try:
            headers = {"x-apikey": Config.VIRUSTOTAL_API_KEY}
            url = f"{VirusTotalChecker.BASE_URL}/files"
            
            with open(file_path, 'rb') as f:
                files = {'file': (file_name, f)}
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(url, headers=headers, data=files, timeout=aiohttp.ClientTimeout(total=30)) as response:
                        if response.status in [200, 201]:
                            data = await response.json()
                            analysis_id = data.get("data", {}).get("id")
                            return {
                                "status": "submitted",
                                "analysis_id": analysis_id,
                                "file_name": file_name
                            }
                        else:
                            return {"status": "error", "error": f"HTTP {response.status}"}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    @staticmethod
    async def get_analysis_result(analysis_id: str) -> Dict:
        """Get file analysis result"""
        try:
            headers = {"x-apikey": Config.VIRUSTOTAL_API_KEY}
            url = f"{VirusTotalChecker.BASE_URL}/analyses/{analysis_id}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        analysis_data = data.get("data", {}).get("attributes", {})
                        stats = analysis_data.get("stats", {})
                        
                        return {
                            "analysis_id": analysis_id,
                            "malicious_count": stats.get("malicious", 0),
                            "undetected_count": stats.get("undetected", 0),
                            "suspicious_count": stats.get("suspicious", 0),
                            "status": "completed",
                            "results": analysis_data.get("results", {})
                        }
                    else:
                        return {"analysis_id": analysis_id, "status": "error", "error": f"HTTP {response.status}"}
        except Exception as e:
            return {"analysis_id": analysis_id, "status": "error", "error": str(e)}
    
    @staticmethod
    def _parse_detection_response(data: Dict, file_hash: str) -> Dict:
        """Parse VirusTotal detection response"""
        attributes = data.get("attributes", {})
        stats = attributes.get("last_analysis_stats", {})
        
        return {
            "hash": file_hash,
            "found": True,
            "malicious_count": stats.get("malicious", 0),
            "suspicious_count": stats.get("suspicious", 0),
            "undetected_count": stats.get("undetected", 0),
            "harmless_count": stats.get("harmless", 0),
            "status": "detected",
            "first_submission_date": attributes.get("first_submission_date"),
            "last_analysis_date": attributes.get("last_analysis_date"),
            "meaningful_name": attributes.get("meaningful_name")
        }
