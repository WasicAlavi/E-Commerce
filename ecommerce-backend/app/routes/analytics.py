from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any
from app.services.analytics_service import AnalyticsService
from app.routes.admin import get_current_admin

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/sales-dashboard")
async def get_sales_dashboard(
    days: int = Query(30, ge=1, le=365),
    current_admin: Dict = Depends(get_current_admin)
):
    """Get real-time sales analytics"""
    try:
        data = await AnalyticsService.get_sales_dashboard_data(days)
        return {
            "success": True,
            "message": "Sales dashboard data retrieved successfully",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving sales dashboard: {str(e)}")

@router.get("/inventory")
async def get_inventory_analytics(
    current_admin: Dict = Depends(get_current_admin)
):
    """Get inventory management analytics"""
    try:
        data = await AnalyticsService.get_inventory_analytics()
        return {
            "success": True,
            "message": "Inventory analytics retrieved successfully",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving inventory analytics: {str(e)}")

@router.get("/customer-segmentation")
async def get_customer_segmentation(
    current_admin: Dict = Depends(get_current_admin)
):
    """Get customer segmentation analytics"""
    try:
        data = await AnalyticsService.get_customer_segmentation()
        return {
            "success": True,
            "message": "Customer segmentation data retrieved successfully",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving customer segmentation: {str(e)}")

@router.get("/performance-metrics")
async def get_performance_metrics(
    current_admin: Dict = Depends(get_current_admin)
):
    """Get performance metrics and KPIs"""
    try:
        data = await AnalyticsService.get_performance_metrics()
        return {
            "success": True,
            "message": "Performance metrics retrieved successfully",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving performance metrics: {str(e)}")

@router.get("/trend-analysis")
async def get_trend_analysis(
    current_admin: Dict = Depends(get_current_admin)
):
    """Get trend analysis and seasonal patterns"""
    try:
        data = await AnalyticsService.get_trend_analysis()
        return {
            "success": True,
            "message": "Trend analysis data retrieved successfully",
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving trend analysis: {str(e)}")

@router.get("/dashboard-overview")
async def get_dashboard_overview(
    current_admin: Dict = Depends(get_current_admin)
):
    """Get comprehensive dashboard overview with all analytics"""
    try:
        # Get all analytics data
        sales_data = await AnalyticsService.get_sales_dashboard_data(30)
        inventory_data = await AnalyticsService.get_inventory_analytics()
        customer_data = await AnalyticsService.get_customer_segmentation()
        performance_data = await AnalyticsService.get_performance_metrics()
        trend_data = await AnalyticsService.get_trend_analysis()
        
        return {
            "success": True,
            "message": "Dashboard overview retrieved successfully",
            "data": {
                "sales": sales_data,
                "inventory": inventory_data,
                "customers": customer_data,
                "performance": performance_data,
                "trends": trend_data
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard overview: {str(e)}") 