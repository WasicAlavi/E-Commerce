from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List
from app.crud import user_crud
from app.schemas.user import UserCreate, UserUpdate, UserOut, UserLogin
from app.models.customer import Customer
from passlib.context import CryptContext
from app.utils.jwt_utils import create_access_token, get_current_user
from app.models.user import User
from app.database import get_db_connection

router = APIRouter(prefix="/users", tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/", response_model=UserOut)
async def create_user(user_data: UserCreate):
    try:
        user = await user_crud.create_user(user_data)
        
        # The trigger automatically creates a customer record
        # Just fetch the created customer
        customer = await Customer.get_by_user_id(user.id)
        
        # Return user with customer_id
        user_dict = user.to_dict()
        user_dict["customer_id"] = customer.id if customer else None
        
        return user_dict
    except Exception as e:
        # Check if it's a duplicate key error
        if "duplicate key value violates unique constraint" in str(e):
            if "customers_user_id_key" in str(e):
                raise HTTPException(status_code=400, detail="User already has a customer profile")
            elif "ix_users_email" in str(e):
                raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: int):
    user = await user_crud.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[UserOut])
async def get_users():
    users = await user_crud.get_users()
    return users

@router.put("/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user_data: UserUpdate):
    user = await user_crud.update_user(user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}")
async def delete_user(user_id: int):
    success = await user_crud.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "User deleted successfully"}

@router.post("/authenticate")
async def authenticate_user(login_data: UserLogin):
    user = await user_crud.authenticate_user(login_data.username, login_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Fetch customer_id for this user
    customer = await Customer.get_by_user_id(user.id)
    user_dict = user.to_dict()
    user_dict["customer_id"] = customer.id if customer else None
    
    # Fetch all customer addresses
    if customer:
        from app.models.address import Address
        addresses = await Address.get_by_customer_id(customer.id)
        user_dict["addresses"] = [addr.to_dict() for addr in addresses]
        user_dict["address_id"] = addresses[0].id if addresses else None
    else:
        user_dict["addresses"] = []
        user_dict["address_id"] = None
    
    return {"success": True, "user": user_dict}

@router.get("/by-username/{username}", response_model=UserOut)
async def get_user_by_username(username: str):
    user = await user_crud.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Fetch customer_id for this user
    customer = await Customer.get_by_user_id(user.id)
    user_dict = user.to_dict()
    user_dict["customer_id"] = customer.id if customer else None
    return user_dict

@router.post("/login")
async def login(data: dict):
    username_or_email = data.get("username")
    password = data.get("password")
    
    if not username_or_email or not password:
        raise HTTPException(status_code=400, detail="Username/email and password are required")
    
    # Try to authenticate using the proper method
    user = await user_crud.authenticate_user(username_or_email, password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Debug logging
    print(f"DEBUG: User before role fix: {user.to_dict()}")
    print(f"DEBUG: User role is None: {user.role is None}")
    
    # Fix null role if needed
    if user.role is None:
        print(f"DEBUG: Fixing null role for user {user.id}")
        user = await user.update_role('user')
        print(f"DEBUG: User after role fix: {user.to_dict()}")
    
    # Record the login
    user = await user.record_login()
    print(f"DEBUG: User after login record: {user.to_dict()}")
    
    # Create token payload
    token_payload = {"sub": str(user.id), "username": user.name, "role": user.role}
    print(f"DEBUG: Token payload: {token_payload}")
    token = create_access_token(token_payload)

    # Fetch the customer for this user
    customer = await Customer.get_by_user_id(user.id)
    user_dict = user.to_dict()
    user_dict["customer_id"] = customer.id if customer else None
    user_dict["role"] = user.role

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout user - In a real implementation, you might want to blacklist the token"""
    # For now, we'll just return success since JWT tokens are stateless
    # In production, you might want to implement a token blacklist
    return {
        "success": True,
        "message": "Logged out successfully"
    }

@router.get("/me", response_model=dict)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    user = await User.get_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Fetch the customer for this user
    customer = await Customer.get_by_user_id(user.id)
    user_dict = user.to_dict()
    user_dict["customer_id"] = customer.id if customer else None
    user_dict["role"] = user.role
    
    return {
        "success": True,
        "user": user_dict
    }

@router.get("/debug/users")
async def debug_users():
    """Debug endpoint to check users in database"""
    try:
        users = await User.get_all()
        return {
            "success": True,
            "user_count": len(users),
            "users": [user.to_dict() for user in users]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@router.get("/debug/token")
async def debug_token(current_user: dict = Depends(get_current_user)):
    """Debug endpoint to test token validation"""
    return {
        "success": True,
        "message": "Token is valid",
        "user": current_user
    }

@router.put("/{user_id}/role")
async def update_user_role(user_id: int, role: str):
    """Update user role (admin only)"""
    # This should be protected by admin authentication in production
    user = await user_crud.update_user_role(user_id, role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "success": True,
        "message": f"User role updated to {role}",
        "user": user.to_dict()
    }

@router.post("/fix-null-roles")
async def fix_null_roles():
    """Fix all users with null roles by setting them to 'user'"""
    count = await user_crud.fix_null_roles()
    return {
        "success": True,
        "message": f"Fixed {count} users with null roles",
        "fixed_count": count
    }

@router.post("/debug-auth")
async def debug_auth(data: dict):
    """Debug authentication process"""
    username_or_email = data.get("username")
    password = data.get("password")
    
    if not username_or_email or not password:
        return {"error": "Username/email and password are required"}
    
    try:
        # Get user by username
        user_by_username = await user_crud.get_user_by_username(username_or_email)
        print(f"User by username: {user_by_username.to_dict() if user_by_username else None}")
        
        # Get user by email
        user_by_email = await user_crud.get_user_by_email(username_or_email)
        print(f"User by email: {user_by_email.to_dict() if user_by_email else None}")
        
        # Authenticate
        auth_user = await user_crud.authenticate_user(username_or_email, password)
        print(f"Authenticated user: {auth_user.to_dict() if auth_user else None}")
        
        return {
            "username_search": user_by_username.to_dict() if user_by_username else None,
            "email_search": user_by_email.to_dict() if user_by_email else None,
            "authenticated_user": auth_user.to_dict() if auth_user else None,
            "role_is_none": auth_user.role is None if auth_user else None
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/activity/stats")
async def get_user_activity_stats():
    """Get user activity statistics"""
    try:
        stats = await User.get_user_activity_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user activity stats: {str(e)}")

@router.get("/activity/active")
async def get_active_users(days: int = 7):
    """Get active users (logged in within specified days)"""
    try:
        users = await User.get_active_users(days)
        return {"success": True, "users": [user.to_dict() for user in users]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting active users: {str(e)}")

@router.get("/activity/inactive")
async def get_inactive_users(days: int = 30):
    """Get inactive users (haven't logged in for specified days)"""
    try:
        users = await User.get_inactive_users(days)
        return {"success": True, "users": [user.to_dict() for user in users]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting inactive users: {str(e)}")

@router.put("/{user_id}/activity")
async def update_user_activity(user_id: int, is_active: bool):
    """Update user activity status (admin only)"""
    try:
        user = await User.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = await user.update_activity_status(is_active)
        return {"success": True, "user": user.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user activity: {str(e)}")

@router.post("/activity/mark-inactive")
async def mark_inactive_users():
    """Mark users as inactive after 90 days of inactivity (admin only)"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            result = await conn.execute("SELECT mark_inactive_users()")
            return {"success": True, "message": "Inactive users marked successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error marking inactive users: {str(e)}")
