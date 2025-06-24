from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.crud import user_crud
from app.schemas.user import UserCreate, UserUpdate, UserOut, UserLogin
from app.models.customer import Customer

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserOut)
async def create_user(user_data: UserCreate):
    try:
        user = await user_crud.create_user(user_data)
        return user
    except Exception as e:
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
    return {"success": True, "user": user}

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
