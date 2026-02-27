import aiohttp
import requests
from typing import Dict, Optional
from config import Config


class IPInfoChecker:
    """Check IP information using IPInfo API"""
    
    @staticmethod
    async def get_ip_info(ip_address: str) -> Dict:
        """Get IP information from IPInfo API"""
        try:
            url = f"https://ipinfo.io/{ip_address}?token={Config.IPINFO_API_KEY}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "ip": ip_address,
                            "country": data.get("country"),
                            "region": data.get("region"),
                            "city": data.get("city"),
                            "latitude": data.get("loc", "").split(",")[0],
                            "longitude": data.get("loc", "").split(",")[1] if "," in data.get("loc", "") else None,
                            "organization": data.get("org"),
                            "timezone": data.get("timezone"),
                            "status": "found"
                        }
                    else:
                        return {"ip": ip_address, "status": "not_found"}
        except Exception as e:
            return {"ip": ip_address, "status": "error", "error": str(e)}
    
    @staticmethod
    async def is_suspicious_location(country_code: str) -> bool:
        """Check if location is suspicious (high-risk countries)"""
        suspicious_countries = [
            "CN", "RU", "IR", "KP",  # Common sources of malicious activity
            "SY", "CU"
        ]
        return country_code.upper() in suspicious_countries
