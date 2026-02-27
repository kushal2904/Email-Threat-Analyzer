import dns.resolver
import dns.rdatatype
from typing import Dict, Optional


class DNSChecker:
    @staticmethod
    async def check_spf(domain: str) -> Dict[str, str]:
        """Check SPF record for domain"""
        try:
            spf_records = []
            answers = dns.resolver.resolve(domain, 'TXT')
            for rdata in answers:
                for txt_data in rdata.strings:
                    txt_str = txt_data.decode('utf-8')
                    if txt_str.startswith('v=spf1'):
                        spf_records.append(txt_str)
            
            if spf_records:
                return {
                    "status": "found",
                    "record": spf_records[0],
                    "result": "pass"
                }
            return {"status": "not_found", "record": "", "result": "fail"}
        except Exception as e:
            return {"status": "error", "record": "", "result": "fail", "error": str(e)}
    
    @staticmethod
    async def check_dmarc(domain: str) -> Dict[str, str]:
        """Check DMARC record for domain"""
        try:
            dmarc_domain = f"_dmarc.{domain}"
            answers = dns.resolver.resolve(dmarc_domain, 'TXT')
            for rdata in answers:
                for txt_data in rdata.strings:
                    txt_str = txt_data.decode('utf-8')
                    if txt_str.startswith('v=DMARC1'):
                        return {
                            "status": "found",
                            "record": txt_str,
                            "result": "pass"
                        }
            return {"status": "not_found", "record": "", "result": "fail"}
        except Exception as e:
            return {"status": "error", "record": "", "result": "fail", "error": str(e)}
    
    @staticmethod
    async def check_dkim(domain: str, selector: str = "default") -> Dict[str, str]:
        """Check DKIM record for domain"""
        try:
            dkim_domain = f"{selector}._domainkey.{domain}"
            answers = dns.resolver.resolve(dkim_domain, 'TXT')
            
            if answers:
                return {
                    "status": "found",
                    "selectors": [selector],
                    "result": "pass"
                }
            return {"status": "not_found", "selectors": [], "result": "fail"}
        except Exception as e:
            return {"status": "error", "selectors": [], "result": "fail", "error": str(e)}
