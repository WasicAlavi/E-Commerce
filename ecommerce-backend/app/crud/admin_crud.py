from typing import List, Optional
from app.models.admin import Admin
from app.schemas.admin import AdminCreate, AdminUpdate, AdminOut

async def create_admin(admin_data: AdminCreate) -> Admin:
    """Create a new admin"""
    return await Admin.create(
        user_id=admin_data.user_id,
        role=admin_data.role,
        permissions=admin_data.permissions,
        is_active=admin_data.is_active
    )

async def get_admin_by_id(admin_id: int) -> Optional[Admin]:
    """Get admin by ID"""
    return await Admin.get_by_id(admin_id)

async def get_admin_by_user_id(user_id: int) -> Optional[Admin]:
    """Get admin by user ID"""
    return await Admin.get_by_user_id(user_id)

async def get_admins(skip: int = 0, limit: int = 100) -> List[Admin]:
    """Get all admins with pagination"""
    return await Admin.get_all(skip=skip, limit=limit)

async def get_admins_by_role(role: str) -> List[Admin]:
    """Get admins by role"""
    return await Admin.get_by_role(role)

async def get_active_admins() -> List[Admin]:
    """Get all active admins"""
    return await Admin.get_active()

async def update_admin(admin_id: int, admin_data: AdminUpdate) -> Optional[Admin]:
    """Update admin"""
    admin = await Admin.get_by_id(admin_id)
    if not admin:
        return None
    
    update_data = {}
    if admin_data.role is not None:
        update_data['role'] = admin_data.role
    if admin_data.permissions is not None:
        update_data['permissions'] = admin_data.permissions
    if admin_data.is_active is not None:
        update_data['is_active'] = admin_data.is_active
    
    return await admin.update(**update_data)

async def delete_admin(admin_id: int) -> bool:
    """Delete admin"""
    admin = await Admin.get_by_id(admin_id)
    if not admin:
        return False
    return await admin.delete()

async def get_admin_with_user_details(admin_id: int) -> Optional[dict]:
    """Get admin with user details"""
    return await Admin.get_with_user_details(admin_id)

async def check_admin_permissions(admin_id: int, required_permissions: List[str]) -> bool:
    """Check if admin has required permissions"""
    return await Admin.check_permissions(admin_id, required_permissions)

async def activate_admin(admin_id: int) -> Optional[Admin]:
    """Activate an admin"""
    admin = await Admin.get_by_id(admin_id)
    if not admin:
        return None
    return await admin.activate()

async def deactivate_admin(admin_id: int) -> Optional[Admin]:
    """Deactivate an admin"""
    admin = await Admin.get_by_id(admin_id)
    if not admin:
        return None
    return await admin.deactivate()

async def get_admin_statistics() -> dict:
    """Get admin statistics"""
    return await Admin.get_statistics()

async def search_admins(search_term: str, skip: int = 0, limit: int = 100) -> List[Admin]:
    """Search admins by name or email"""
    return await Admin.search(search_term, skip=skip, limit=limit)

async def get_admin_activity_log(admin_id: int, skip: int = 0, limit: int = 100) -> List[dict]:
    """Get admin activity log"""
    return await Admin.get_activity_log(admin_id, skip=skip, limit=limit) 