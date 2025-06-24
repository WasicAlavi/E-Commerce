#!/usr/bin/env python3
"""
Test script to verify all imports work correctly
"""

def test_imports():
    """Test all required imports"""
    try:
        import asyncpg
        print("✓ asyncpg imported successfully")
    except ImportError as e:
        print(f"✗ asyncpg import failed: {e}")
    
    try:
        import pydantic
        print("✓ pydantic imported successfully")
    except ImportError as e:
        print(f"✗ pydantic import failed: {e}")
    
    try:
        from pydantic import EmailStr
        print("✓ pydantic.EmailStr imported successfully")
    except ImportError as e:
        print(f"✗ pydantic.EmailStr import failed: {e}")
    
    try:
        import fastapi
        print("✓ fastapi imported successfully")
    except ImportError as e:
        print(f"✗ fastapi import failed: {e}")
    
    try:
        import uvicorn
        print("✓ uvicorn imported successfully")
    except ImportError as e:
        print(f"✗ uvicorn import failed: {e}")
    
    try:
        from app.database import get_db_connection
        print("✓ app.database imported successfully")
    except ImportError as e:
        print(f"✗ app.database import failed: {e}")
    
    try:
        from app.models import user, customer, product
        print("✓ app.models imported successfully")
    except ImportError as e:
        print(f"✗ app.models import failed: {e}")
    
    try:
        from app.schemas import user as user_schemas
        print("✓ app.schemas imported successfully")
    except ImportError as e:
        print(f"✗ app.schemas import failed: {e}")

if __name__ == "__main__":
    print("Testing imports...")
    test_imports()
    print("Import test completed!") 