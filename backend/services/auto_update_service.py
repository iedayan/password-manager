from models import PasswordEntry, PasswordGroup
from datetime import datetime, timezone
from config.database import db


class AutoUpdateService:
    def __init__(self, password_service, encryption_service):
        self.password_service = password_service
        self.encryption_service = encryption_service

    def update_reused_passwords(self, user_id, old_password, new_password):
        """Update all instances of a reused password"""
        # Find password group by hash
        group = self.find_password_group(user_id, old_password)
        if not group:
            return False

        # Update all passwords in the group
        entries = PasswordEntry.query.filter_by(
            user_id=user_id, password_group_id=group.id
        ).all()

        for entry in entries:
            encrypted_new_password = self.encryption_service.encrypt(
                new_password, user_id
            )
            entry.password = encrypted_new_password
            entry.updated_at = datetime.now(timezone.utc)

        # Update group hash
        group.password_hash = self.hash_password(new_password)

        db.session.commit()
        return True
