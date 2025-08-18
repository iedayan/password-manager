"""Password import service for various password managers."""

import csv
import json
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class ImportedPassword:
    """Standardized password entry from import."""
    site_name: str
    site_url: Optional[str]
    username: str
    password: str
    notes: Optional[str] = None
    folder: Optional[str] = None
    created_at: Optional[datetime] = None

class PasswordImportService:
    """Service for importing passwords from various sources."""
    
    def __init__(self):
        self.supported_formats = {
            'csv': self._parse_csv,
            'json': self._parse_json,
            '1password': self._parse_1password,
            'lastpass': self._parse_lastpass,
            'chrome': self._parse_chrome,
            'firefox': self._parse_firefox,
            'bitwarden': self._parse_bitwarden,
            'dashlane': self._parse_dashlane
        }
    
    def detect_format(self, file_content: str, filename: str) -> str:
        """Auto-detect import format based on content and filename."""
        filename_lower = filename.lower()
        
        # Check by filename patterns
        if '1password' in filename_lower or filename_lower.endswith('.1pux'):
            return '1password'
        elif 'lastpass' in filename_lower:
            return 'lastpass'
        elif 'chrome' in filename_lower or 'passwords.csv' in filename_lower:
            return 'chrome'
        elif 'firefox' in filename_lower:
            return 'firefox'
        elif 'bitwarden' in filename_lower:
            return 'bitwarden'
        elif 'dashlane' in filename_lower:
            return 'dashlane'
        
        # Check by content structure
        try:
            if file_content.strip().startswith('{') or file_content.strip().startswith('['):
                json_data = json.loads(file_content)
                if isinstance(json_data, dict) and 'accounts' in json_data:
                    return '1password'
                elif isinstance(json_data, list) and len(json_data) > 0:
                    if 'encrypted' in json_data[0]:
                        return 'bitwarden'
                return 'json'
            else:
                # Check CSV headers
                lines = file_content.strip().split('\n')
                if len(lines) > 0:
                    header = lines[0].lower()
                    if 'name,url,username,password' in header.replace(' ', ''):
                        return 'chrome'
                    elif 'url,username,password,extra,name,grouping' in header.replace(' ', ''):
                        return 'lastpass'
                return 'csv'
        except:
            return 'csv'  # Default fallback
    
    def import_passwords(self, file_content: str, format_type: str = None, filename: str = '') -> Tuple[List[ImportedPassword], Dict]:
        """Import passwords from file content."""
        if not format_type:
            format_type = self.detect_format(file_content, filename)
        
        if format_type not in self.supported_formats:
            raise ValueError(f"Unsupported format: {format_type}")
        
        try:
            passwords = self.supported_formats[format_type](file_content)
            
            # Generate import statistics
            stats = self._generate_import_stats(passwords)
            
            return passwords, stats
        except Exception as e:
            logger.error(f"Import failed for format {format_type}: {str(e)}")
            raise ValueError(f"Failed to parse {format_type} format: {str(e)}")
    
    def _parse_csv(self, content: str) -> List[ImportedPassword]:
        """Parse generic CSV format."""
        passwords = []
        lines = content.strip().split('\n')
        
        if len(lines) < 2:
            return passwords
        
        # Try to detect CSV structure
        header = lines[0].lower().split(',')
        
        # Map common column names
        column_map = {}
        for i, col in enumerate(header):
            col = col.strip().strip('"')
            if col in ['name', 'title', 'site_name', 'website']:
                column_map['name'] = i
            elif col in ['url', 'website', 'site_url']:
                column_map['url'] = i
            elif col in ['username', 'user', 'login', 'email']:
                column_map['username'] = i
            elif col in ['password', 'pass']:
                column_map['password'] = i
            elif col in ['notes', 'note', 'comments']:
                column_map['notes'] = i
        
        # Parse data rows
        for line in lines[1:]:
            if not line.strip():
                continue
                
            try:
                reader = csv.reader([line])
                row = next(reader)
                
                if len(row) < 3:  # Minimum: name, username, password
                    continue
                
                password_entry = ImportedPassword(
                    site_name=row[column_map.get('name', 0)].strip(),
                    site_url=row[column_map.get('url', 1)].strip() if column_map.get('url') and len(row) > column_map['url'] else None,
                    username=row[column_map.get('username', len(row)-2)].strip(),
                    password=row[column_map.get('password', len(row)-1)].strip(),
                    notes=row[column_map.get('notes')].strip() if column_map.get('notes') and len(row) > column_map['notes'] else None
                )
                
                if password_entry.site_name and password_entry.username and password_entry.password:
                    passwords.append(password_entry)
                    
            except Exception as e:
                logger.warning(f"Skipped malformed CSV row: {line[:50]}...")
                continue
        
        return passwords
    
    def _parse_json(self, content: str) -> List[ImportedPassword]:
        """Parse generic JSON format."""
        passwords = []
        
        try:
            data = json.loads(content)
            
            # Handle different JSON structures
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                # Try common root keys
                items = data.get('passwords', data.get('items', data.get('entries', [data])))
            else:
                return passwords
            
            for item in items:
                if not isinstance(item, dict):
                    continue
                
                # Extract fields with various possible names
                site_name = item.get('name') or item.get('title') or item.get('site_name') or item.get('website', '')
                site_url = item.get('url') or item.get('website') or item.get('site_url')
                username = item.get('username') or item.get('user') or item.get('login') or item.get('email', '')
                password = item.get('password') or item.get('pass', '')
                notes = item.get('notes') or item.get('note') or item.get('comments')
                
                if site_name and username and password:
                    passwords.append(ImportedPassword(
                        site_name=site_name,
                        site_url=site_url,
                        username=username,
                        password=password,
                        notes=notes
                    ))
                    
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON format: {str(e)}")
        
        return passwords
    
    def _parse_chrome(self, content: str) -> List[ImportedPassword]:
        """Parse Chrome password export format."""
        passwords = []
        lines = content.strip().split('\n')
        
        if len(lines) < 2:
            return passwords
        
        # Chrome format: name,url,username,password
        for line in lines[1:]:
            if not line.strip():
                continue
                
            try:
                reader = csv.reader([line])
                row = next(reader)
                
                if len(row) >= 4:
                    passwords.append(ImportedPassword(
                        site_name=row[0].strip(),
                        site_url=row[1].strip(),
                        username=row[2].strip(),
                        password=row[3].strip()
                    ))
            except:
                continue
        
        return passwords
    
    def _parse_lastpass(self, content: str) -> List[ImportedPassword]:
        """Parse LastPass export format."""
        passwords = []
        lines = content.strip().split('\n')
        
        if len(lines) < 2:
            return passwords
        
        # LastPass format: url,username,password,extra,name,grouping,fav
        for line in lines[1:]:
            if not line.strip():
                continue
                
            try:
                reader = csv.reader([line])
                row = next(reader)
                
                if len(row) >= 5:
                    passwords.append(ImportedPassword(
                        site_name=row[4].strip(),  # name
                        site_url=row[0].strip(),   # url
                        username=row[1].strip(),   # username
                        password=row[2].strip(),   # password
                        notes=row[3].strip() if len(row) > 3 else None,  # extra
                        folder=row[5].strip() if len(row) > 5 else None  # grouping
                    ))
            except:
                continue
        
        return passwords
    
    def _parse_1password(self, content: str) -> List[ImportedPassword]:
        """Parse 1Password export format."""
        passwords = []
        
        try:
            data = json.loads(content)
            
            # 1Password structure varies, try different approaches
            items = []
            if 'accounts' in data:
                for account in data['accounts']:
                    items.extend(account.get('vaults', [{}])[0].get('items', []))
            elif 'items' in data:
                items = data['items']
            elif isinstance(data, list):
                items = data
            
            for item in items:
                if item.get('category') == 'LOGIN' or 'login' in item.get('details', {}):
                    details = item.get('details', {})
                    login_fields = details.get('loginFields', [])
                    
                    username = ''
                    password = ''
                    
                    for field in login_fields:
                        if field.get('designation') == 'username':
                            username = field.get('value', '')
                        elif field.get('designation') == 'password':
                            password = field.get('value', '')
                    
                    if item.get('title') and username and password:
                        passwords.append(ImportedPassword(
                            site_name=item.get('title', ''),
                            site_url=item.get('location'),
                            username=username,
                            password=password,
                            notes=details.get('notes')
                        ))
                        
        except Exception as e:
            logger.error(f"1Password parsing error: {str(e)}")
        
        return passwords
    
    def _parse_bitwarden(self, content: str) -> List[ImportedPassword]:
        """Parse Bitwarden export format."""
        passwords = []
        
        try:
            data = json.loads(content)
            items = data.get('items', [])
            
            for item in items:
                if item.get('type') == 1:  # Login type
                    login = item.get('login', {})
                    
                    passwords.append(ImportedPassword(
                        site_name=item.get('name', ''),
                        site_url=login.get('uri'),
                        username=login.get('username', ''),
                        password=login.get('password', ''),
                        notes=item.get('notes'),
                        folder=item.get('folderId')
                    ))
                    
        except Exception as e:
            logger.error(f"Bitwarden parsing error: {str(e)}")
        
        return passwords
    
    def _parse_firefox(self, content: str) -> List[ImportedPassword]:
        """Parse Firefox password export format."""
        # Firefox typically exports as CSV similar to Chrome
        return self._parse_chrome(content)
    
    def _parse_dashlane(self, content: str) -> List[ImportedPassword]:
        """Parse Dashlane export format."""
        passwords = []
        lines = content.strip().split('\n')
        
        if len(lines) < 2:
            return passwords
        
        # Dashlane CSV format varies, try to detect columns
        header = lines[0].lower().split(',')
        
        for line in lines[1:]:
            if not line.strip():
                continue
                
            try:
                reader = csv.reader([line])
                row = next(reader)
                
                if len(row) >= 4:
                    # Common Dashlane format: title,url,username,password,note
                    passwords.append(ImportedPassword(
                        site_name=row[0].strip(),
                        site_url=row[1].strip() if len(row) > 1 else None,
                        username=row[2].strip() if len(row) > 2 else '',
                        password=row[3].strip() if len(row) > 3 else '',
                        notes=row[4].strip() if len(row) > 4 else None
                    ))
            except:
                continue
        
        return passwords
    
    def _generate_import_stats(self, passwords: List[ImportedPassword]) -> Dict:
        """Generate statistics about imported passwords."""
        if not passwords:
            return {
                'total_imported': 0,
                'weak_passwords': 0,
                'duplicate_passwords': 0,
                'missing_urls': 0,
                'categories': {}
            }
        
        weak_count = 0
        duplicate_count = 0
        missing_urls = 0
        categories = {}
        password_values = []
        
        for pwd in passwords:
            # Count weak passwords (simple heuristic)
            if len(pwd.password) < 8 or pwd.password.lower() in ['password', '123456', 'qwerty']:
                weak_count += 1
            
            # Count missing URLs
            if not pwd.site_url:
                missing_urls += 1
            
            # Categorize by domain
            if pwd.site_url:
                try:
                    domain = pwd.site_url.split('/')[2] if '//' in pwd.site_url else pwd.site_url
                    category = self._categorize_site(domain)
                    categories[category] = categories.get(category, 0) + 1
                except:
                    categories['Other'] = categories.get('Other', 0) + 1
            else:
                categories['Other'] = categories.get('Other', 0) + 1
            
            # Track for duplicates
            password_values.append(pwd.password)
        
        # Count duplicates
        from collections import Counter
        password_counts = Counter(password_values)
        duplicate_count = sum(1 for count in password_counts.values() if count > 1)
        
        return {
            'total_imported': len(passwords),
            'weak_passwords': weak_count,
            'duplicate_passwords': duplicate_count,
            'missing_urls': missing_urls,
            'categories': categories,
            'security_score': max(0, 100 - (weak_count / len(passwords) * 50) - (duplicate_count / len(passwords) * 30))
        }
    
    def _categorize_site(self, domain: str) -> str:
        """Categorize site by domain."""
        domain_lower = domain.lower()
        
        if any(x in domain_lower for x in ['bank', 'credit', 'paypal', 'venmo', 'finance']):
            return 'Banking'
        elif any(x in domain_lower for x in ['gmail', 'outlook', 'yahoo', 'proton', 'mail']):
            return 'Email'
        elif any(x in domain_lower for x in ['facebook', 'twitter', 'instagram', 'linkedin', 'social']):
            return 'Social'
        elif any(x in domain_lower for x in ['github', 'gitlab', 'aws', 'azure', 'work', 'corp']):
            return 'Work'
        elif any(x in domain_lower for x in ['netflix', 'spotify', 'youtube', 'disney', 'entertainment']):
            return 'Entertainment'
        else:
            return 'Personal'

# Global instance
import_service = PasswordImportService()