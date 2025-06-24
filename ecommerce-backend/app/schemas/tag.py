from typing import Optional, List
from pydantic import BaseModel, Field, validator

class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Tag name")
    parent_id: Optional[int] = Field(None, description="Parent tag ID")

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Tag name cannot be empty')
        return v.strip().lower()

class TagCreate(TagBase):
    pass

class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50, description="Tag name")
    parent_id: Optional[int] = Field(None, description="Parent tag ID")

    @validator('name')
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Tag name cannot be empty')
        return v.strip().lower() if v else v

class TagOut(TagBase):
    id: int = Field(..., description="Tag ID")

    class Config:
        from_attributes = True

class TagList(BaseModel):
    tags: List[TagOut] = Field(..., description="List of tags")
    total: int = Field(..., description="Total number of tags")

class TagResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[TagOut] = Field(None, description="Tag data")
