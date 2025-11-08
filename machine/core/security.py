# machine/core/security.py
"""Security and Authentication Module"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import logging

from machine.core.config import settings

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SecurityManager:
    """Manage security operations"""
    
    def __init__(self):
        self.blacklisted_tokens = set()
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
        
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify a JWT token"""
        try:
            # Check if token is blacklisted
            if token in self.blacklisted_tokens:
                logger.warning("Attempt to use blacklisted token")
                return None
            
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            return payload
            
        except JWTError as e:
            logger.error(f"Token verification failed: {e}")
            return None
    
    def blacklist_token(self, token: str) -> bool:
        """Add a token to the blacklist"""
        try:
            self.blacklisted_tokens.add(token)
            logger.info("Token blacklisted successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error blacklisting token: {e}")
            return False
    
    def clean_expired_tokens(self) -> int:
        """Clean expired tokens from blacklist"""
        try:
            initial_count = len(self.blacklisted_tokens)
            
            # This is a simplified implementation
            # In production, you'd want to track token expiration times
            
            # For now, we'll just limit the size of the blacklist
            if len(self.blacklisted_tokens) > 1000:
                # Remove oldest tokens (first 100)
                tokens_to_remove = list(self.blacklisted_tokens)[:100]
                for token in tokens_to_remove:
                    self.blacklisted_tokens.remove(token)
            
            cleaned_count = initial_count - len(self.blacklisted_tokens)
            logger.info(f"Cleaned {cleaned_count} expired tokens")
            
            return cleaned_count
            
        except Exception as e:
            logger.error(f"Error cleaning expired tokens: {e}")
            return 0

# Global security manager instance
security_manager = SecurityManager()

def get_security_manager() -> SecurityManager:
    """Get the security manager instance"""
    return security_manager