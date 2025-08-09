"""
Password Service - Handles all password-related business logic
"""

import hashlib
import secrets
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from sqlalchemy import and_, func
from sqlalchemy.orm import joinedload

from models.password_entry import PasswordEntry
from models.password_group import PasswordGroup
from models.site import Site
from services.encryption_service import EncryptionService
from config.database import db
from utils.validators import validate_password_strength


class PasswordService:
    """Service class for managing passwords and their relationships"""

    def __init__(self, encryption_service: EncryptionService):
        self.encryption_service = encryption_service

    def create_password_entry(self, user_id: int, password_data: Dict) -> Dict:
        """
        Create a new password entry and handle grouping for duplicates

        Args:
            user_id: ID of the user
            password_data: Dictionary containing password entry data
                - site_url: URL of the site
                - username: Username for the site
                - password: Plain text password
                - notes: Optional notes

        Returns:
            Dictionary containing the created password entry
        """
        try:
            # Validate input
            if not self._validate_password_data(password_data):
                raise ValueError("Invalid password data")

            # Get or create site
            site = self._get_or_create_site(password_data["site_url"])

            # Encrypt sensitive data
            encrypted_username = self.encryption_service.encrypt(
                password_data["username"], user_id
            )
            encrypted_password = self.encryption_service.encrypt(
                password_data["password"], user_id
            )
            encrypted_notes = (
                self.encryption_service.encrypt(password_data.get("notes", ""), user_id)
                if password_data.get("notes")
                else None
            )

            # Find or create password group
            password_group = self._get_or_create_password_group(
                user_id, password_data["password"]
            )

            # Create password entry
            password_entry = PasswordEntry(
                user_id=user_id,
                site_id=site.id,
                username=encrypted_username,
                password=encrypted_password,
                notes=encrypted_notes,
                password_group_id=password_group.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

            db.session.add(password_entry)
            db.session.commit()

            return self._serialize_password_entry(password_entry, user_id)

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to create password entry: {str(e)}")

    def get_all_passwords(
        self, user_id: int, include_compromised: bool = True
    ) -> List[Dict]:
        """
        Get all password entries for a user

        Args:
            user_id: ID of the user
            include_compromised: Whether to include compromised passwords

        Returns:
            List of password entry dictionaries
        """
        try:
            query = PasswordEntry.query.options(
                joinedload(PasswordEntry.site), joinedload(PasswordEntry.password_group)
            ).filter_by(user_id=user_id)

            if not include_compromised:
                query = query.filter_by(is_compromised=False)

            password_entries = query.all()

            return [
                self._serialize_password_entry(entry, user_id)
                for entry in password_entries
            ]

        except Exception as e:
            raise Exception(f"Failed to get passwords: {str(e)}")

    def get_password_by_id(self, password_id: int, user_id: int) -> Optional[Dict]:
        """
        Get a specific password entry by ID

        Args:
            password_id: ID of the password entry
            user_id: ID of the user (for security check)

        Returns:
            Password entry dictionary or None if not found
        """
        try:
            password_entry = (
                PasswordEntry.query.options(
                    joinedload(PasswordEntry.site),
                    joinedload(PasswordEntry.password_group),
                )
                .filter_by(id=password_id, user_id=user_id)
                .first()
            )

            if not password_entry:
                return None

            return self._serialize_password_entry(password_entry, user_id)

        except Exception as e:
            raise Exception(f"Failed to get password: {str(e)}")

    def update_password_entry(
        self, password_id: int, user_id: int, update_data: Dict
    ) -> Dict:
        """
        Update a password entry

        Args:
            password_id: ID of the password entry
            user_id: ID of the user
            update_data: Dictionary containing update data

        Returns:
            Updated password entry dictionary
        """
        try:
            password_entry = PasswordEntry.query.filter_by(
                id=password_id, user_id=user_id
            ).first()

            if not password_entry:
                raise ValueError("Password entry not found")

            # Handle password change - may need to change groups
            if "password" in update_data:
                old_password = self.encryption_service.decrypt(
                    password_entry.password, user_id
                )
                new_password = update_data["password"]

                if old_password != new_password:
                    # Remove from old group and add to new group
                    new_group = self._get_or_create_password_group(
                        user_id, new_password
                    )
                    password_entry.password_group_id = new_group.id
                    password_entry.password = self.encryption_service.encrypt(
                        new_password, user_id
                    )

            # Update other fields
            if "username" in update_data:
                password_entry.username = self.encryption_service.encrypt(
                    update_data["username"], user_id
                )

            if "notes" in update_data:
                password_entry.notes = (
                    self.encryption_service.encrypt(update_data["notes"], user_id)
                    if update_data["notes"]
                    else None
                )

            if "site_url" in update_data:
                site = self._get_or_create_site(update_data["site_url"])
                password_entry.site_id = site.id

            password_entry.updated_at = datetime.utcnow()
            db.session.commit()

            return self._serialize_password_entry(password_entry, user_id)

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to update password entry: {str(e)}")

    def delete_password_entry(self, password_id: int, user_id: int) -> bool:
        """
        Delete a password entry

        Args:
            password_id: ID of the password entry
            user_id: ID of the user

        Returns:
            True if deleted successfully
        """
        try:
            password_entry = PasswordEntry.query.filter_by(
                id=password_id, user_id=user_id
            ).first()

            if not password_entry:
                return False

            # Check if this is the last password in its group
            group_count = PasswordEntry.query.filter_by(
                password_group_id=password_entry.password_group_id
            ).count()

            db.session.delete(password_entry)

            # If this was the last password in the group, delete the group
            if group_count == 1:
                password_group = PasswordGroup.query.get(
                    password_entry.password_group_id
                )
                if password_group:
                    db.session.delete(password_group)

            db.session.commit()
            return True

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to delete password entry: {str(e)}")

    def find_duplicate_passwords(self, user_id: int) -> List[Dict]:
        """
        Find all password groups that have multiple entries (duplicates)

        Args:
            user_id: ID of the user

        Returns:
            List of duplicate password groups
        """
        try:
            # Query for password groups with more than one entry
            duplicate_groups = (
                db.session.query(
                    PasswordGroup.id,
                    PasswordGroup.password_hash,
                    func.count(PasswordEntry.id).label("count"),
                )
                .join(
                    PasswordEntry, PasswordGroup.id == PasswordEntry.password_group_id
                )
                .filter(PasswordGroup.user_id == user_id)
                .group_by(PasswordGroup.id, PasswordGroup.password_hash)
                .having(func.count(PasswordEntry.id) > 1)
                .all()
            )

            result = []
            for group_id, password_hash, count in duplicate_groups:
                # Get all entries in this group
                entries = (
                    PasswordEntry.query.options(joinedload(PasswordEntry.site))
                    .filter_by(password_group_id=group_id)
                    .all()
                )

                sites = [entry.site.domain for entry in entries]

                result.append(
                    {
                        "group_id": group_id,
                        "password_hash": password_hash,
                        "sites": sites,
                        "count": count,
                        "entries": [
                            {
                                "id": entry.id,
                                "site": entry.site.domain,
                                "username": self.encryption_service.decrypt(
                                    entry.username, user_id
                                ),
                            }
                            for entry in entries
                        ],
                    }
                )

            return result

        except Exception as e:
            raise Exception(f"Failed to find duplicate passwords: {str(e)}")

    def update_reused_passwords(
        self,
        user_id: int,
        group_id: int,
        new_password: str,
        selected_entries: List[int] = None,
    ) -> Dict:
        """
        Update all or selected passwords in a reused password group

        Args:
            user_id: ID of the user
            group_id: ID of the password group
            new_password: New password to set
            selected_entries: List of specific entry IDs to update (optional)

        Returns:
            Dictionary with update results
        """
        try:
            # Validate password strength
            if not validate_password_strength(new_password):
                raise ValueError("Password does not meet strength requirements")

            # Get password group
            password_group = PasswordGroup.query.filter_by(
                id=group_id, user_id=user_id
            ).first()

            if not password_group:
                raise ValueError("Password group not found")

            # Get entries to update
            if selected_entries:
                entries_query = PasswordEntry.query.filter(
                    and_(
                        PasswordEntry.password_group_id == group_id,
                        PasswordEntry.user_id == user_id,
                        PasswordEntry.id.in_(selected_entries),
                    )
                )
            else:
                entries_query = PasswordEntry.query.filter_by(
                    password_group_id=group_id, user_id=user_id
                )

            entries = entries_query.all()

            if not entries:
                raise ValueError("No password entries found to update")

            # Encrypt new password
            encrypted_new_password = self.encryption_service.encrypt(
                new_password, user_id
            )

            # Create new password group for the new password
            new_group = self._get_or_create_password_group(user_id, new_password)

            updated_entries = []
            for entry in entries:
                entry.password = encrypted_new_password
                entry.password_group_id = new_group.id
                entry.updated_at = datetime.utcnow()
                updated_entries.append(entry.id)

            # Check if old group is now empty
            remaining_count = PasswordEntry.query.filter_by(
                password_group_id=group_id
            ).count()

            if remaining_count == 0:
                db.session.delete(password_group)

            db.session.commit()

            return {
                "success": True,
                "updated_entries": updated_entries,
                "new_group_id": new_group.id,
                "message": f"Successfully updated {len(updated_entries)} passwords",
            }

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to update reused passwords: {str(e)}")

    def mark_passwords_compromised(self, user_id: int, password_ids: List[int]) -> Dict:
        """
        Mark passwords as compromised

        Args:
            user_id: ID of the user
            password_ids: List of password entry IDs to mark as compromised

        Returns:
            Dictionary with results
        """
        try:
            entries = PasswordEntry.query.filter(
                and_(
                    PasswordEntry.id.in_(password_ids), PasswordEntry.user_id == user_id
                )
            ).all()

            for entry in entries:
                entry.is_compromised = True
                entry.updated_at = datetime.utcnow()

            db.session.commit()

            return {
                "success": True,
                "marked_count": len(entries),
                "message": f"Marked {len(entries)} passwords as compromised",
            }

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to mark passwords as compromised: {str(e)}")

    def get_password_statistics(self, user_id: int) -> Dict:
        """
        Get password statistics for a user

        Args:
            user_id: ID of the user

        Returns:
            Dictionary containing password statistics
        """
        try:
            total_passwords = PasswordEntry.query.filter_by(user_id=user_id).count()

            compromised_count = PasswordEntry.query.filter_by(
                user_id=user_id, is_compromised=True
            ).count()

            # Count duplicate groups (groups with more than one entry)
            duplicate_groups = (
                db.session.query(func.count(PasswordGroup.id))
                .join(PasswordEntry)
                .filter(PasswordGroup.user_id == user_id)
                .group_by(PasswordGroup.id)
                .having(func.count(PasswordEntry.id) > 1)
                .count()
            )

            # Count unique sites
            unique_sites = (
                db.session.query(func.count(func.distinct(Site.id)))
                .join(PasswordEntry)
                .filter(PasswordEntry.user_id == user_id)
                .scalar()
            )

            return {
                "total_passwords": total_passwords,
                "compromised_passwords": compromised_count,
                "duplicate_groups": duplicate_groups,
                "unique_sites": unique_sites,
                "security_score": self._calculate_security_score(
                    total_passwords, compromised_count, duplicate_groups
                ),
            }

        except Exception as e:
            raise Exception(f"Failed to get password statistics: {str(e)}")

    def _get_or_create_site(self, site_url: str) -> Site:
        """Get existing site or create a new one"""
        domain = self._extract_domain(site_url)

        site = Site.query.filter_by(domain=domain).first()
        if not site:
            site = Site(domain=domain, url=site_url, created_at=datetime.utcnow())
            db.session.add(site)
            db.session.flush()  # Get the ID without committing

        return site

    def _get_or_create_password_group(
        self, user_id: int, password: str
    ) -> PasswordGroup:
        """Get existing password group or create a new one"""
        password_hash = self._hash_password(password)

        group = PasswordGroup.query.filter_by(
            user_id=user_id, password_hash=password_hash
        ).first()

        if not group:
            group = PasswordGroup(
                user_id=user_id,
                password_hash=password_hash,
                created_at=datetime.utcnow(),
            )
            db.session.add(group)
            db.session.flush()  # Get the ID without committing

        return group

    def _hash_password(self, password: str) -> str:
        """Create a hash of the password for grouping purposes"""
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        from urllib.parse import urlparse

        parsed = urlparse(url)
        return parsed.netloc.lower()

    def _validate_password_data(self, data: Dict) -> bool:
        """Validate password entry data"""
        required_fields = ["site_url", "username", "password"]
        return all(field in data and data[field] for field in required_fields)

    def _serialize_password_entry(self, entry: PasswordEntry, user_id: int) -> Dict:
        """Convert password entry to dictionary"""
        try:
            return {
                "id": entry.id,
                "site": {
                    "id": entry.site.id,
                    "domain": entry.site.domain,
                    "url": entry.site.url,
                },
                "username": self.encryption_service.decrypt(entry.username, user_id),
                "password": self.encryption_service.decrypt(entry.password, user_id),
                "notes": (
                    self.encryption_service.decrypt(entry.notes, user_id)
                    if entry.notes
                    else None
                ),
                "password_group_id": entry.password_group_id,
                "created_at": entry.created_at.isoformat(),
                "updated_at": entry.updated_at.isoformat(),
                "last_used": entry.last_used.isoformat() if entry.last_used else None,
                "is_compromised": entry.is_compromised,
            }
        except Exception as e:
            raise Exception(f"Failed to serialize password entry: {str(e)}")

    def _calculate_security_score(
        self, total: int, compromised: int, duplicates: int
    ) -> float:
        """Calculate a security score based on password health"""
        if total == 0:
            return 100.0

        # Deduct points for compromised and duplicate passwords
        compromised_penalty = (compromised / total) * 50
        duplicate_penalty = (duplicates / total) * 30

        score = max(0.0, 100.0 - compromised_penalty - duplicate_penalty)
        return round(score, 1)
