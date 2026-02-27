import whois
from datetime import datetime
from typing import Dict, Optional


class WHOISChecker:
    @staticmethod
    async def get_domain_info(domain: str) -> Dict:
        """Get domain registration information"""
        try:
            domain_info = whois.whois(domain)
            
            creation_date = domain_info.creation_date
            if isinstance(creation_date, list):
                creation_date = creation_date[0]
            
            expiration_date = domain_info.expiration_date
            if isinstance(expiration_date, list):
                expiration_date = expiration_date[0]
            
            # Calculate domain age in days
            if creation_date:
                domain_age = (datetime.utcnow() - creation_date).days
            else:
                domain_age = None
            
            return {
                "domain": domain,
                "creation_date": creation_date.isoformat() if creation_date else None,
                "expiration_date": expiration_date.isoformat() if expiration_date else None,
                "domain_age_days": domain_age,
                "registrar": domain_info.registrar,
                "name_servers": domain_info.name_servers if domain_info.name_servers else [],
                "status": "found"
            }
        except Exception as e:
            return {
                "domain": domain,
                "status": "error",
                "error": str(e)
            }
