import re
import email
from email.policy import default
from io import BytesIO
from typing import Dict, Optional, Tuple
from app.utils.dns_checker import DNSChecker
from app.utils.whois_checker import WHOISChecker
from app.utils.ip_checker import IPInfoChecker


class HeaderAnalyzer:
    """Analyze email headers for security threats"""
    
    @staticmethod
    async def analyze_header(raw_header: str, subject: Optional[str] = None) -> Dict:
        """Extract and analyze email header information"""
        try:
            # Parse email header
            msg = email.message_from_string(raw_header, policy=default)
            
            # Extract sender information
            sender_email = msg.get('From', '')
            sender_domain = HeaderAnalyzer._extract_domain(sender_email)
            
            # Extract originating IP
            originating_ip = HeaderAnalyzer._extract_originating_ip(msg)
            
            # First check if Authentication-Results header exists (takes precedence)
            auth_results = msg.get('Authentication-Results', '')
            
            if auth_results:
                # Parse authentication results from the header
                spf_result = HeaderAnalyzer._parse_auth_result(auth_results, 'spf')
                dmarc_result = HeaderAnalyzer._parse_auth_result(auth_results, 'dmarc')
                dkim_result = HeaderAnalyzer._parse_auth_result(auth_results, 'dkim')
            else:
                # Fall back to DNS checks if no Authentication-Results header
                spf_result = await DNSChecker.check_spf(sender_domain) if sender_domain else {"result": "fail"}
                dmarc_result = await DNSChecker.check_dmarc(sender_domain) if sender_domain else {"result": "fail"}
                dkim_result = await DNSChecker.check_dkim(sender_domain) if sender_domain else {"result": "fail"}
            
            # Get WHOIS information
            whois_info = await WHOISChecker.get_domain_info(sender_domain) if sender_domain else {}
            domain_age_days = whois_info.get("domain_age_days")
            
            # Get IP location
            ip_info = {}
            if originating_ip:
                ip_info = await IPInfoChecker.get_ip_info(originating_ip)
            
            return {
                "sender_email": sender_email,
                "sender_domain": sender_domain,
                "originating_ip": originating_ip,
                "subject": subject or msg.get('Subject', 'No Subject'),
                "spf": spf_result,
                "dmarc": dmarc_result,
                "dkim": dkim_result,
                "domain_info": whois_info,
                "domain_age_days": domain_age_days,
                "ip_info": ip_info
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    @staticmethod
    def _extract_domain(email_str: str) -> Optional[str]:
        """Extract domain from email address"""
        try:
            match = re.search(r'<([^>]+)>', email_str)
            if match:
                email_addr = match.group(1)
            else:
                email_addr = email_str.strip()
            
            domain = email_addr.split('@')[-1] if '@' in email_addr else None
            return domain
        except:
            return None
    
    @staticmethod
    def _extract_originating_ip(msg) -> Optional[str]:
        """Extract originating IP from Received headers"""
        try:
            received = msg.get_all('Received')
            if received:
                first_received = received[0]
                # Look for IP pattern
                match = re.search(r'\[(\d+\.\d+\.\d+\.\d+)\]', first_received)
                if match:
                    return match.group(1)
            
            # Alternative: look for X-Originating-IP header
            x_orig = msg.get('X-Originating-IP')
            if x_orig:
                match = re.search(r'\[(\d+\.\d+\.\d+\.\d+)\]', x_orig)
                if match:
                    return match.group(1)
            
            return None
        except:
            return None
    
    @staticmethod
    def _parse_auth_result(auth_results: str, result_type: str) -> Dict:
        """Parse authentication results from Authentication-Results header"""
        try:
            # Convert to lowercase for case-insensitive matching
            auth_results_lower = auth_results.lower()
            
            # Look for the specific result type (e.g., 'spf=pass')
            pattern = rf'{result_type}=(\w+)'
            match = re.search(pattern, auth_results_lower)
            
            if match:
                result_value = match.group(1)
                # Normalize result values
                if result_value in ['pass', '+']:
                    return {"result": "pass"}
                elif result_value in ['fail', '-']:
                    return {"result": "fail"}
                elif result_value in ['softfail', '~']:
                    return {"result": "softfail"}
                elif result_value in ['neutral', '?']:
                    return {"result": "neutral"}
                else:
                    return {"result": result_value}
            
            # If not found in Authentication-Results, return None to indicate not tested
            return {"result": "not_tested"}
        except:
            return {"result": "not_tested"}
    
    @staticmethod
    def verify_headers_authenticity(header_data: Dict) -> Dict:
        """Verify if headers are authentic"""
        issues = []
        
        # Check SPF
        if header_data.get("spf", {}).get("result") == "fail":
            issues.append("SPF check failed - Email may be spoofed")
        
        # Check DMARC
        if header_data.get("dmarc", {}).get("result") == "fail":
            issues.append("DMARC check failed - Domain policy violation")
        
        # Check DKIM
        if header_data.get("dkim", {}).get("result") == "fail":
            issues.append("DKIM signature missing or invalid")
        
        # Check domain age
        domain_age = header_data.get("domain_age_days")
        if domain_age and domain_age < 30:
            issues.append(f"Domain is very new ({domain_age} days old) - Higher risk")
        
        # Check IP location
        ip_info = header_data.get("ip_info", {})
        if ip_info and ip_info.get("status") == "found":
            country = ip_info.get("country")
            # Flag high-risk countries
            if country in ["CN", "RU", "IR", "KP"]:
                issues.append(f"Email from high-risk country: {country}")
        
        return {
            "is_authentic": len(issues) == 0,
            "issues": issues,
            "issue_count": len(issues)
        }
