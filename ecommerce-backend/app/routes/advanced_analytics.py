# app/routes/advanced_analytics.py

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from app.services.advanced_analytics_service import AdvancedAnalyticsService
from app.utils.jwt_utils import get_current_admin
from app.models.user import User

router = APIRouter(prefix="/advanced-analytics", tags=["Advanced Analytics"])

@router.get("/geographic")
async def get_geographic_analytics(
    current_admin: User = Depends(get_current_admin)
):
    """Get geographic analytics data"""
    try:
        data = await AdvancedAnalyticsService.get_geographic_analytics()
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching geographic analytics: {str(e)}")

@router.get("/product")
async def get_product_analytics(
    current_admin: User = Depends(get_current_admin)
):
    """Get advanced product analytics"""
    try:
        data = await AdvancedAnalyticsService.get_product_analytics()
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching product analytics: {str(e)}")

@router.get("/marketing")
async def get_marketing_analytics(
    current_admin: User = Depends(get_current_admin)
):
    """Get marketing analytics data"""
    try:
        data = await AdvancedAnalyticsService.get_marketing_analytics()
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching marketing analytics: {str(e)}")

@router.get("/customer")
async def get_customer_analytics(
    current_admin: User = Depends(get_current_admin)
):
    """Get advanced customer analytics"""
    try:
        data = await AdvancedAnalyticsService.get_customer_analytics()
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customer analytics: {str(e)}")

@router.get("/predictive")
async def get_predictive_analytics(
    current_admin: User = Depends(get_current_admin)
):
    """Get predictive analytics data"""
    try:
        data = await AdvancedAnalyticsService.get_predictive_analytics()
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching predictive analytics: {str(e)}")

@router.get("/real-time")
async def get_real_time_analytics(
    current_admin: User = Depends(get_current_admin)
):
    """Get real-time analytics data"""
    try:
        data = await AdvancedAnalyticsService.get_real_time_analytics()
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching real-time analytics: {str(e)}")

@router.get("/dashboard")
async def get_advanced_dashboard(
    current_admin: User = Depends(get_current_admin)
):
    """Get comprehensive advanced analytics dashboard data"""
    try:
        # Fetch all analytics data in parallel
        import asyncio
        
        tasks = [
            AdvancedAnalyticsService.get_geographic_analytics(),
            AdvancedAnalyticsService.get_product_analytics(),
            AdvancedAnalyticsService.get_marketing_analytics(),
            AdvancedAnalyticsService.get_customer_analytics(),
            AdvancedAnalyticsService.get_predictive_analytics(),
            AdvancedAnalyticsService.get_real_time_analytics()
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Check for any exceptions
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                raise result
        
        return {
            "success": True,
            "data": {
                "geographic": results[0],
                "product": results[1],
                "marketing": results[2],
                "customer": results[3],
                "predictive": results[4],
                "real_time": results[5]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching advanced dashboard: {str(e)}")

@router.get("/summary")
async def get_analytics_summary(
    current_admin: User = Depends(get_current_admin)
):
    """Get analytics summary with key metrics"""
    try:
        from app.database import get_db_connection
        
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            
            # Key metrics summary
            summary = await conn.fetchrow("""
                SELECT 
                    COUNT(DISTINCT c.id) as total_customers,
                    COUNT(DISTINCT o.id) as total_orders,
                    SUM(o.total_price) as total_revenue,
                    AVG(o.total_price) as avg_order_value,
                    (SELECT COUNT(*) FROM products) as total_products,
                    (SELECT SUM(stock) FROM products) as total_inventory,
                    COUNT(DISTINCT CASE WHEN o.order_date >= CURRENT_DATE - INTERVAL '30 days' THEN o.id END) as orders_last_30_days,
                    SUM(CASE WHEN o.order_date >= CURRENT_DATE - INTERVAL '30 days' THEN o.total_price ELSE 0 END) as revenue_last_30_days,
                    COUNT(DISTINCT CASE WHEN c.first_order_date >= CURRENT_DATE - INTERVAL '30 days' THEN c.id END) as new_customers_last_30_days
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id
            """)
            
            # Growth metrics
            growth_metrics = await conn.fetchrow("""
                WITH current_month AS (
                    SELECT 
                        COUNT(DISTINCT o.id) as orders,
                        SUM(o.total_price) as revenue,
                        COUNT(DISTINCT o.customer_id) as customers
                    FROM orders o
                    WHERE o.order_date >= DATE_TRUNC('month', CURRENT_DATE)
                ),
                previous_month AS (
                    SELECT 
                        COUNT(DISTINCT o.id) as orders,
                        SUM(o.total_price) as revenue,
                        COUNT(DISTINCT o.customer_id) as customers
                    FROM orders o
                    WHERE o.order_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                    AND o.order_date < DATE_TRUNC('month', CURRENT_DATE)
                )
                SELECT 
                    cm.orders as current_orders,
                    pm.orders as previous_orders,
                    cm.revenue as current_revenue,
                    pm.revenue as previous_revenue,
                    cm.customers as current_customers,
                    pm.customers as previous_customers,
                    CASE 
                        WHEN pm.orders > 0 THEN ((cm.orders - pm.orders)::float / pm.orders * 100)
                        WHEN pm.orders = 0 AND cm.orders > 0 THEN 100.0
                        ELSE 0.0 
                    END as order_growth_percent,
                    CASE 
                        WHEN pm.revenue > 0 THEN ((cm.revenue - pm.revenue)::float / pm.revenue * 100)
                        WHEN pm.revenue = 0 AND cm.revenue > 0 THEN 100.0
                        ELSE 0.0 
                    END as revenue_growth_percent,
                    CASE 
                        WHEN pm.customers > 0 THEN ((cm.customers - pm.customers)::float / pm.customers * 100)
                        WHEN pm.customers = 0 AND cm.customers > 0 THEN 100.0
                        ELSE 0.0 
                    END as customer_growth_percent
                FROM current_month cm, previous_month pm
            """)
            
            return {
                "success": True,
                "data": {
                    "summary": dict(summary) if summary else {},
                    "growth": dict(growth_metrics) if growth_metrics else {}
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics summary: {str(e)}") 