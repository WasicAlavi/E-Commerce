from typing import List, Optional
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserOut
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

async def create_user(user_data: UserCreate) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(user_data.password)
    return await User.create(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )

async def get_user_by_id(user_id: int) -> Optional[User]:
    """Get user by ID"""
    return await User.get_by_id(user_id)

async def get_user_by_username(username: str) -> Optional[User]:
    """Get user by username"""
    return await User.get_by_username(username)

async def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email"""
    return await User.get_by_email(email)

async def get_users() -> List[User]:
    """Get all users"""
    return await User.get_all()

async def update_user(user_id: int, user_data: UserUpdate) -> Optional[User]:
    """Update user"""
    user = await User.get_by_id(user_id)
    if not user:
        return None
    
    update_data = {}
    if user_data.username is not None:
        update_data['username'] = user_data.username
    if user_data.email is not None:
        update_data['email'] = user_data.email
    if user_data.password is not None:
        update_data['hashed_password'] = get_password_hash(user_data.password)
    
    return await user.update(**update_data)

async def delete_user(user_id: int) -> bool:
    """Delete user"""
    user = await User.get_by_id(user_id)
    if not user:
        return False
    return await user.delete()

async def update_user_role(user_id: int, role: str) -> Optional[User]:
    """Update user role"""
    user = await User.get_by_id(user_id)
    if not user:
        return None
    return await user.update_role(role)

async def fix_null_roles() -> int:
    """Fix all users with null roles"""
    return await User.fix_null_roles()

async def authenticate_user(username_or_email: str, password: str) -> Optional[User]:
    """Authenticate user with username or email and password"""
    # First try username
    user = await get_user_by_username(username_or_email)
    
    # If not found and input contains @, try email
    if not user and '@' in username_or_email:
        user = await get_user_by_email(username_or_email)
    
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user 