from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List, Dict

class SearchHistoryBase(BaseModel):
    query: str = Field(..., max_length=100, description="Search query")

    @validator('query')
    def validate_query(cls, v):
        if not v.strip():
            raise ValueError('Search query cannot be empty')
        return v.strip()

class SearchHistoryCreate(SearchHistoryBase):
    customer_id: int = Field(..., description="ID of the customer")
    search_date: Optional[datetime] = Field(None, description="Date of search")

class SearchHistoryOut(SearchHistoryBase):
    id: int = Field(..., description="Search history ID")
    customer_id: int = Field(..., description="ID of the customer")
    search_date: datetime = Field(..., description="Date of search")

    class Config:
        from_attributes = True

class SearchHistoryList(BaseModel):
    searches: List[SearchHistoryOut] = Field(..., description="List of search history entries")
    total: int = Field(..., description="Total number of searches")

class PopularSearch(BaseModel):
    query: str = Field(..., description="Search query")
    search_count: int = Field(..., description="Number of times this query was searched")

class SearchSuggestion(BaseModel):
    suggestions: List[str] = Field(..., description="List of search suggestions")
    query: str = Field(..., description="Original query")

class SearchHistoryResponse(BaseModel):
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[SearchHistoryOut] = Field(None, description="Search history data")
