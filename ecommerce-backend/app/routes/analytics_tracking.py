from fastapi import APIRouter, Depends, HTTPException, Request
from app.utils.jwt_utils import get_current_user
from app.models.user import User
from typing import Optional
from fastapi.security import HTTPBearer
from app.database import get_db_connection
import json
from datetime import datetime
from typing import Dict, Any, List

router = APIRouter(prefix="/analytics", tags=["Analytics Tracking"])
security = HTTPBearer(auto_error=False)

async def get_optional_user(request: Request):
    """Get user if authenticated, otherwise return None"""
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            from app.utils.jwt_utils import decode_token
            user_data = decode_token(token)
            return user_data
        return None
    except:
        return None

@router.post("/track")
async def track_event(
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Track user events and behavior"""
    try:
        body = await request.json()
        event_type = body.get("event_type")
        event_data = body.get("event_data", {})
        
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Store tracking event
            await conn.execute("""
                INSERT INTO real_time_events (
                    event_type, event_data, user_id, customer_id, 
                    product_id, order_id, timestamp
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            """, 
                event_type,
                json.dumps(event_data),
                current_user.get("user_id") if current_user else None,
                event_data.get("customer_id"),
                event_data.get("product_id"),
                event_data.get("order_id"),
                datetime.utcnow()
            )
            
            # Update product views if it's a product view event
            if event_type == "product_view" and event_data.get("product_id"):
                await conn.execute("""
                    UPDATE products 
                    SET views = COALESCE(views, 0) + 1 
                    WHERE id = $1
                """, event_data["product_id"])
            
            # Update product purchase count if it's an add to cart event
            if event_type == "add_to_cart" and event_data.get("product_id"):
                await conn.execute("""
                    UPDATE products 
                    SET add_to_cart_count = COALESCE(add_to_cart_count, 0) + 1 
                    WHERE id = $1
                """, event_data["product_id"])
            
            # Update product purchase count if it's a purchase event
            if event_type == "purchase" and event_data.get("items"):
                for item in event_data["items"]:
                    if item.get("product_id"):
                        await conn.execute("""
                            UPDATE products 
                            SET purchase_count = COALESCE(purchase_count, 0) + $1 
                            WHERE id = $2
                        """, item.get("quantity", 1), item["product_id"])
        
        return {"success": True, "message": "Event tracked successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tracking event: {str(e)}")

@router.post("/sync-offline")
async def sync_offline_events(
    request: Request,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Sync offline tracking events"""
    try:
        body = await request.json()
        events = body.get("events", [])
        
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            for event in events:
                event_type = event.get("event_type")
                event_data = event.get("event_data", {})
                
                await conn.execute("""
                    INSERT INTO real_time_events (
                        event_type, event_data, user_id, customer_id, 
                        product_id, order_id, timestamp
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                """, 
                    event_type,
                    json.dumps(event_data),
                    current_user.get("user_id") if current_user else None,
                    event_data.get("customer_id"),
                    event_data.get("product_id"),
                    event_data.get("order_id"),
                    datetime.fromisoformat(event.get("timestamp", datetime.utcnow().isoformat()))
                )
        
        return {"success": True, "message": f"Synced {len(events)} offline events"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error syncing offline events: {str(e)}")

@router.get("/user-behavior")
async def get_user_behavior(
    current_user: User = Depends(get_current_user)
):
    """Get user behavior analytics"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Get user's browsing patterns
            browsing_patterns = await conn.fetch("""
                SELECT 
                    event_type,
                    COUNT(*) as event_count,
                    AVG(EXTRACT(EPOCH FROM (timestamp - LAG(timestamp) OVER (ORDER BY timestamp)))) as avg_time_between_events
                FROM real_time_events 
                WHERE user_id = $1
                GROUP BY event_type
                ORDER BY event_count DESC
            """, current_user.get("user_id"))
            
            # Get product interaction
            product_interaction = await conn.fetch("""
                SELECT 
                    p.name as product_name,
                    COUNT(CASE WHEN e.event_type = 'product_view' THEN 1 END) as views,
                    COUNT(CASE WHEN e.event_type = 'add_to_cart' THEN 1 END) as cart_adds,
                    COUNT(CASE WHEN e.event_type = 'purchase' THEN 1 END) as purchases
                FROM real_time_events e
                LEFT JOIN products p ON e.product_id = p.id
                WHERE e.user_id = $1 AND e.event_type IN ('product_view', 'add_to_cart', 'purchase')
                GROUP BY p.id, p.name
                ORDER BY views DESC
                LIMIT 10
            """, current_user.get("user_id"))
            
            return {
                "success": True,
                "data": {
                    "browsing_patterns": [dict(row) for row in browsing_patterns],
                    "product_interaction": [dict(row) for row in product_interaction]
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user behavior: {str(e)}") 