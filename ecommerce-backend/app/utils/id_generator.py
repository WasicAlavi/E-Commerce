#!/usr/bin/env python3
"""
Utility for generating secure, randomized IDs
"""
import secrets
import string
import time
from typing import Optional

class SecureIDGenerator:
    """Generate secure, randomized IDs for sensitive data"""
    
    @staticmethod
    def generate_order_id(prefix: str = "ORD") -> str:
        """
        Generate a secure order ID
        Format: ORD-YYYYMMDD-XXXXXXXX (e.g., ORD-20241201-A7B9C2D4)
        """
        timestamp = time.strftime("%Y%m%d")
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        return f"{prefix}-{timestamp}-{random_part}"
    
    @staticmethod
    def generate_transaction_id(prefix: str = "TXN") -> str:
        """
        Generate a secure transaction ID
        Format: TXN-YYYYMMDD-HHMMSS-XXXXXXXX (e.g., TXN-20241201-143052-A7B9C2D4)
        """
        timestamp = time.strftime("%Y%m%d-%H%M%S")
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        return f"{prefix}-{timestamp}-{random_part}"
    
    @staticmethod
    def generate_rider_id(prefix: str = "RID") -> str:
        """
        Generate a secure rider ID
        Format: RID-XXXXXXXX-XXXXXXXX (e.g., RID-A7B9C2D4-E5F6G7H8)
        """
        part1 = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        part2 = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        return f"{prefix}-{part1}-{part2}"
    
    @staticmethod
    def generate_delivery_assignment_id(prefix: str = "DEL") -> str:
        """
        Generate a secure delivery assignment ID
        Format: DEL-YYYYMMDD-XXXXXXXX (e.g., DEL-20241201-A7B9C2D4)
        """
        timestamp = time.strftime("%Y%m%d")
        random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        return f"{prefix}-{timestamp}-{random_part}"
    
    @staticmethod
    def generate_reference_id(prefix: str = "REF") -> str:
        """
        Generate a secure reference ID
        Format: REF-XXXXXXXX-XXXXXXXX (e.g., REF-A7B9C2D4-E5F6G7H8)
        """
        part1 = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        part2 = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        return f"{prefix}-{part1}-{part2}"
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """
        Generate a secure random token
        """
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def generate_numeric_id(length: int = 12) -> str:
        """
        Generate a secure numeric ID
        """
        return ''.join(secrets.choice(string.digits) for _ in range(length))
    
    @staticmethod
    def generate_uuid_like() -> str:
        """
        Generate a UUID-like string
        """
        import uuid
        return str(uuid.uuid4()).replace('-', '').upper()

# Global instance
id_generator = SecureIDGenerator() 