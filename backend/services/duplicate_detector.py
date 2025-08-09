from models.password_group import PasswordGroup


class DuplicateDetector:
    def find_duplicate_passwords(self, user_id):
        """Find all passwords that are reused across multiple sites"""
        groups = PasswordGroup.query.filter_by(user_id=user_id).all()
        duplicates = []

        for group in groups:
            entries = group.password_entries
            if len(entries) > 1:
                duplicates.append(
                    {
                        "group_id": group.id,
                        "password_hash": group.password_hash,
                        "sites": [entry.site.domain for entry in entries],
                        "count": len(entries),
                    }
                )

        return duplicates
