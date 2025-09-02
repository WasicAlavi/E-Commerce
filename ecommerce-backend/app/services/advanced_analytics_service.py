# app/services/advanced_analytics_service.py

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from app.database import get_db_connection
import json

class AdvancedAnalyticsService:
    
    @staticmethod
    async def get_geographic_analytics() -> Dict[str, Any]:
        """Get geographic analytics data"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            
            # Customer distribution by city (using address data)
            customer_distribution = await conn.fetch("""
                SELECT 
                    COALESCE(a.city, 'Unknown') as location,
                    COUNT(DISTINCT c.id) as customer_count,
                    COALESCE(SUM(o.total_price), 0) as total_revenue,
                    COALESCE(AVG(o.total_price), 0) as avg_revenue_per_customer
                FROM customers c
                LEFT JOIN addresses a ON c.id = a.customer_id
                LEFT JOIN orders o ON c.id = o.customer_id
                GROUP BY a.city 
                ORDER BY customer_count DESC 
                LIMIT 20
            """)
            
            # Regional sales performance by division/state
            regional_sales = await conn.fetch("""
                WITH regional_data AS (
                    SELECT 
                        a.division as region,
                        COUNT(DISTINCT c.id) as customer_count,
                        COUNT(o.id) as order_count,
                        SUM(o.total_price) as total_revenue,
                        AVG(o.total_price) as avg_order_value
                    FROM customers c
                    LEFT JOIN orders o ON c.id = o.customer_id
                    LEFT JOIN addresses a ON o.address_id = a.id
                    WHERE a.division IS NOT NULL AND a.division != ''
                    GROUP BY a.division
                ),
                total_revenue AS (
                    SELECT SUM(total_revenue) as grand_total FROM regional_data
                )
                SELECT 
                    rd.region,
                    rd.customer_count,
                    rd.order_count,
                    rd.total_revenue,
                    rd.avg_order_value,
                    CASE 
                        WHEN tr.grand_total > 0 THEN (rd.total_revenue / tr.grand_total) * 100
                        ELSE 0 
                    END as revenue_percentage
                FROM regional_data rd
                CROSS JOIN total_revenue tr
                ORDER BY rd.total_revenue DESC
            """)
            
            # Country-wise sales analytics
            country_analytics = await conn.fetch("""
                SELECT 
                    COALESCE(a.country, 'Unknown') as country,
                    COUNT(DISTINCT c.id) as customer_count,
                    COUNT(o.id) as total_orders,
                    SUM(o.total_price) as total_revenue,
                    AVG(o.total_price) as avg_order_value,
                    SUM(o.shipping_cost) as total_shipping_cost
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id
                LEFT JOIN addresses a ON o.address_id = a.id
                GROUP BY a.country
                ORDER BY total_revenue DESC
            """)
            
            # City-wise order distribution
            city_orders = await conn.fetch("""
                SELECT 
                    a.city,
                    a.division,
                    a.country,
                    COUNT(o.id) as total_orders,
                    SUM(o.total_price) as total_revenue,
                    AVG(o.total_price) as avg_order_value,
                    COUNT(DISTINCT o.customer_id) as unique_customers
                FROM orders o
                LEFT JOIN addresses a ON o.address_id = a.id
                WHERE a.city IS NOT NULL
                GROUP BY a.city, a.division, a.country
                ORDER BY total_orders DESC
                LIMIT 30
            """)
            
            return {
                "customer_distribution": [dict(row) for row in customer_distribution],
                "regional_sales": [dict(row) for row in regional_sales],
                "country_analytics": [dict(row) for row in country_analytics],
                "city_orders": [dict(row) for row in city_orders]
            }
    
    @staticmethod
    async def get_product_analytics() -> Dict[str, Any]:
        """Get advanced product analytics"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            
            # Product performance matrix (BCG-style)
            product_matrix = await conn.fetch("""
                SELECT 
                    p.id,
                    p.name,
                    COALESCE(p.views, 0) as views,
                    COALESCE(p.purchase_count, 0) as purchase_count,
                    COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
                    COALESCE(p.profit_margin, 0) as profit_margin,
                    CASE 
                        WHEN COALESCE(p.views, 0) > 30 AND COALESCE(p.profit_margin, 0) > 0.15 THEN 'Star'
                        WHEN COALESCE(p.views, 0) > 30 AND COALESCE(p.profit_margin, 0) <= 0.15 THEN 'Question Mark'
                        WHEN COALESCE(p.views, 0) <= 30 AND COALESCE(p.profit_margin, 0) > 0.15 THEN 'Cash Cow'
                        ELSE 'Low Performance'
                    END as category,
                    CASE 
                        WHEN COALESCE(p.views, 0) > 0 THEN (COALESCE(p.purchase_count, 0)::float / p.views)
                        ELSE 0 
                    END as conversion_rate
                FROM products p
                LEFT JOIN order_items oi ON p.id = oi.product_id
                GROUP BY p.id, p.name, p.views, p.purchase_count, p.profit_margin
                ORDER BY revenue DESC
                LIMIT 50
            """)
            
            # Seasonal product trends
            seasonal_trends = await conn.fetch("""
                SELECT 
                    p.name,
                    p.seasonality,
                    EXTRACT(MONTH FROM o.order_date) as month,
                    COUNT(oi.id) as units_sold,
                    SUM(oi.quantity * oi.price) as revenue
                FROM products p
                JOIN order_items oi ON p.id = oi.product_id
                JOIN orders o ON oi.order_id = o.id
                WHERE p.seasonality IS NOT NULL
                GROUP BY p.id, p.name, p.seasonality, EXTRACT(MONTH FROM o.order_date)
                ORDER BY p.name, month
            """)
            
            # Product affinity analysis (simplified)
            product_affinity = await conn.fetch("""
                SELECT 
                    p1.id as product1,
                    p1.name as product1_name,
                    p2.id as product2,
                    p2.name as product2_name,
                    COUNT(DISTINCT o.id) as frequency
                FROM products p1
                JOIN order_items oi1 ON p1.id = oi1.product_id
                JOIN orders o ON oi1.order_id = o.id
                JOIN order_items oi2 ON o.id = oi2.order_id
                JOIN products p2 ON oi2.product_id = p2.id
                WHERE p1.id < p2.id
                GROUP BY p1.id, p1.name, p2.id, p2.name
                HAVING COUNT(DISTINCT o.id) > 1
                ORDER BY frequency DESC
                LIMIT 20
            """)
            
            # Inventory turnover analysis
            inventory_turnover = await conn.fetch("""
                SELECT 
                    p.id,
                    p.name,
                    p.stock,
                    COALESCE(COUNT(oi.id), 0) as units_sold_last_30_days,
                    CASE 
                        WHEN p.stock > 0 THEN (COUNT(oi.id)::float / p.stock) * 12
                        ELSE 0 
                    END as inventory_turnover,
                    CASE 
                        WHEN p.stock > 0 THEN 365 / NULLIF((COUNT(oi.id)::float / p.stock) * 12, 0)
                        ELSE 999 
                    END as days_in_stock,
                    CASE 
                        WHEN p.stock > 0 AND (COUNT(oi.id)::float / p.stock) * 12 > 12 THEN 'High Turnover'
                        WHEN p.stock > 0 AND (COUNT(oi.id)::float / p.stock) * 12 > 6 THEN 'Medium Turnover'
                        ELSE 'Low Turnover'
                    END as turnover_category,
                    COALESCE(p.cost * p.stock, 0) as inventory_value
                FROM products p
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id
                WHERE p.stock > 0 AND (o.order_date >= CURRENT_DATE - INTERVAL '30 days' OR o.order_date IS NULL)
                GROUP BY p.id, p.name, p.stock, p.cost
                ORDER BY inventory_turnover DESC
                LIMIT 30
            """)
            
            return {
                "product_matrix": [dict(row) for row in product_matrix],
                "seasonal_trends": [dict(row) for row in seasonal_trends],
                "product_affinity": [dict(row) for row in product_affinity],
                "inventory_turnover": [dict(row) for row in inventory_turnover]
            }
    
    @staticmethod
    async def get_marketing_analytics() -> Dict[str, Any]:
        """Get marketing analytics data"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            
            # Campaign performance
            campaign_performance = await conn.fetch("""
                SELECT 
                    o.conversion_source,
                    COUNT(o.id) as orders,
                    COUNT(DISTINCT o.customer_id) as unique_customers,
                    SUM(o.total_price) as revenue,
                    AVG(o.total_price) as avg_order_value,
                    COUNT(o.id)::float / COUNT(DISTINCT o.customer_id) as orders_per_customer
                FROM orders o
                WHERE o.conversion_source IS NOT NULL
                GROUP BY o.conversion_source
                ORDER BY revenue DESC
            """)
            
            # Customer acquisition by source
            acquisition_by_source = await conn.fetch("""
                SELECT 
                    c.source,
                    COUNT(c.id) as new_customers,
                    COUNT(o.id) as orders,
                    SUM(o.total_price) as revenue,
                    AVG(o.total_price) as avg_order_value
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id
                WHERE c.source IS NOT NULL
                GROUP BY c.source
                ORDER BY new_customers DESC
            """)
            
            # UTM parameter analysis
            utm_analysis = await conn.fetch("""
                SELECT 
                    COALESCE(utm_source, 'direct') as source,
                    COALESCE(utm_medium, 'none') as medium,
                    COALESCE(utm_campaign, 'none') as campaign,
                    COUNT(o.id) as orders,
                    SUM(o.total_price) as revenue,
                    AVG(o.total_price) as avg_order_value
                FROM orders o
                WHERE utm_source IS NOT NULL OR utm_medium IS NOT NULL OR utm_campaign IS NOT NULL
                GROUP BY utm_source, utm_medium, utm_campaign
                ORDER BY revenue DESC
                LIMIT 20
            """)
            
            # Device and browser analytics (using real tracking data)
            device_analytics = await conn.fetch("""
                SELECT 
                    COALESCE(e.event_data->>'device_type', 'Unknown') as device_type,
                    COALESCE(e.event_data->>'browser', 'Unknown') as browser,
                    COALESCE(e.event_data->>'operating_system', 'Unknown') as operating_system,
                    COUNT(DISTINCT e.user_id) as unique_users,
                    COUNT(e.id) as total_events,
                    COUNT(DISTINCT CASE WHEN e.event_type = 'purchase' THEN e.id END) as orders,
                    COUNT(DISTINCT CASE WHEN e.event_type = 'add_to_cart' THEN e.id END) as cart_adds,
                    COUNT(DISTINCT CASE WHEN e.event_type = 'product_view' THEN e.id END) as product_views,
                    COALESCE(SUM(CASE WHEN e.event_type = 'purchase' THEN (e.event_data->>'total_amount')::DECIMAL ELSE 0 END), 0) as revenue,
                    CASE 
                        WHEN COUNT(DISTINCT CASE WHEN e.event_type = 'purchase' THEN e.id END) > 0 
                        THEN COALESCE(SUM(CASE WHEN e.event_type = 'purchase' THEN (e.event_data->>'total_amount')::DECIMAL ELSE 0 END), 0) / COUNT(DISTINCT CASE WHEN e.event_type = 'purchase' THEN e.id END)
                        ELSE 0 
                    END as avg_order_value,
                    COALESCE(AVG(CASE WHEN e.event_data ? 'time_spent' THEN (e.event_data->>'time_spent')::DECIMAL ELSE NULL END), 0) as avg_time_on_site
                FROM real_time_events e
                WHERE e.created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY e.event_data->>'device_type', e.event_data->>'browser', e.event_data->>'operating_system'
                ORDER BY total_events DESC
                LIMIT 20
            """)
            
            return {
                "campaign_performance": [dict(row) for row in campaign_performance],
                "acquisition_by_source": [dict(row) for row in acquisition_by_source],
                "utm_analysis": [dict(row) for row in utm_analysis],
                "device_analytics": [dict(row) for row in device_analytics]
            }
    
    @staticmethod
    async def get_customer_analytics() -> Dict[str, Any]:
        """Get advanced customer analytics"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            
            # Customer lifetime value analysis
            clv_analysis = await conn.fetch("""
                SELECT 
                    c.id,
                    c.first_name,
                    c.last_name,
                    COALESCE(SUM(o.total_price), 0) as lifetime_value,
                    COUNT(o.id) as total_orders,
                    COALESCE(AVG(o.total_price), 0) as avg_order_value,
                    CASE 
                        WHEN COALESCE(SUM(o.total_price), 0) >= 10000 THEN 'VIP'
                        WHEN COALESCE(SUM(o.total_price), 0) >= 5000 THEN 'Premium'
                        WHEN COALESCE(SUM(o.total_price), 0) >= 1000 THEN 'Regular'
                        ELSE 'New'
                    END as segment,
                    COALESCE(c.churn_probability, 0) as churn_probability,
                    COALESCE(c.engagement_score, 0) as engagement_score,
                    COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) as days_since_last_order,
                    CASE 
                        WHEN COALESCE(SUM(o.total_price), 0) >= 10000 THEN 'High Value'
                        WHEN COALESCE(SUM(o.total_price), 0) >= 5000 THEN 'Medium Value'
                        ELSE 'Low Value'
                    END as value_category
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'cancelled'
                GROUP BY c.id, c.first_name, c.last_name, c.churn_probability, c.engagement_score
                ORDER BY lifetime_value DESC
                LIMIT 50
            """)
            
            # Customer segmentation analysis
            customer_segments = await conn.fetch("""
                SELECT 
                    segment,
                    COUNT(*) as customer_count,
                    AVG(lifetime_value) as avg_lifetime_value,
                    AVG(total_orders) as avg_orders,
                    AVG(avg_order_value) as avg_order_value,
                    AVG(churn_probability) as avg_churn_probability,
                    AVG(engagement_score) as avg_engagement
                FROM (
                    SELECT 
                        c.id,
                        CASE 
                            WHEN COALESCE(SUM(o.total_price), 0) >= 10000 THEN 'VIP'
                            WHEN COALESCE(SUM(o.total_price), 0) >= 5000 THEN 'Premium'
                            WHEN COALESCE(SUM(o.total_price), 0) >= 1000 THEN 'Regular'
                            ELSE 'New'
                        END as segment,
                        COALESCE(SUM(o.total_price), 0) as lifetime_value,
                        COUNT(o.id) as total_orders,
                        COALESCE(AVG(o.total_price), 0) as avg_order_value,
                        COALESCE(c.churn_probability, 0) as churn_probability,
                        COALESCE(c.engagement_score, 0) as engagement_score
                    FROM customers c
                    LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'cancelled'
                    GROUP BY c.id, c.churn_probability, c.engagement_score
                ) customer_stats
                GROUP BY segment
                ORDER BY avg_lifetime_value DESC
            """)
            
            # Cohort analysis
            cohort_analysis = await conn.fetch("""
                WITH customer_cohorts AS (
                    SELECT 
                        c.id,
                        DATE_TRUNC('month', c.first_order_date) as cohort_month,
                        DATE_TRUNC('month', o.order_date) as order_month,
                        EXTRACT(MONTH FROM AGE(o.order_date, c.first_order_date)) as month_number
                    FROM customers c
                    JOIN orders o ON c.id = o.customer_id
                    WHERE c.first_order_date IS NOT NULL
                )
                SELECT 
                    cohort_month,
                    month_number,
                    COUNT(DISTINCT id) as customers,
                    COUNT(DISTINCT id)::float / 
                        FIRST_VALUE(COUNT(DISTINCT id)) OVER (PARTITION BY cohort_month ORDER BY month_number) as retention_rate
                FROM customer_cohorts
                GROUP BY cohort_month, month_number
                ORDER BY cohort_month, month_number
            """)
            
            # Customer behavior patterns
            behavior_patterns = await conn.fetch("""
                SELECT 
                    behavior_pattern,
                    COUNT(*) as customer_count,
                    AVG(lifetime_value) as avg_lifetime_value,
                    AVG(avg_order_value) as avg_order_value,
                    AVG(days_since_last_order) as avg_days_since_order
                FROM (
                    SELECT 
                        c.id,
                        CASE 
                            WHEN COUNT(o.id) = 0 THEN 'No Orders'
                            WHEN COUNT(o.id) = 1 THEN 'One-time'
                            WHEN COUNT(o.id) BETWEEN 2 AND 5 THEN 'Occasional'
                            WHEN COUNT(o.id) BETWEEN 6 AND 20 THEN 'Regular'
                            ELSE 'Loyal'
                        END as behavior_pattern,
                        COALESCE(SUM(o.total_price), 0) as lifetime_value,
                        COALESCE(AVG(o.total_price), 0) as avg_order_value,
                        COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) as days_since_last_order
                    FROM customers c
                    LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'cancelled'
                    GROUP BY c.id
                ) customer_stats
                GROUP BY behavior_pattern
                ORDER BY avg_lifetime_value DESC
            """)
            
            return {
                "clv_analysis": [dict(row) for row in clv_analysis],
                "customer_segments": [dict(row) for row in customer_segments],
                "cohort_analysis": [dict(row) for row in cohort_analysis],
                "behavior_patterns": [dict(row) for row in behavior_patterns]
            }
    
    @staticmethod
    async def get_predictive_analytics() -> Dict[str, Any]:
        """Get predictive analytics data"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            
            # Sales forecasting (simple trend analysis)
            sales_forecast = await conn.fetch("""
                WITH monthly_sales AS (
                    SELECT 
                        DATE_TRUNC('month', order_date) as month,
                        SUM(total_price) as revenue,
                        COUNT(*) as orders,
                        COUNT(DISTINCT customer_id) as unique_customers
                    FROM orders
                    WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
                    GROUP BY DATE_TRUNC('month', order_date)
                    ORDER BY month
                ),
                sales_with_forecast AS (
                    SELECT 
                        month,
                        revenue,
                        orders,
                        unique_customers,
                        LAG(revenue) OVER (ORDER BY month) as prev_month_revenue,
                        LAG(orders) OVER (ORDER BY month) as prev_month_orders,
                        CASE 
                            WHEN LAG(revenue) OVER (ORDER BY month) > 0 
                            THEN ((revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month)) * 100
                            ELSE 0 
                        END as growth_rate,
                        AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg_revenue
                    FROM monthly_sales
                )
                SELECT 
                    month,
                    revenue,
                    orders,
                    unique_customers,
                    prev_month_revenue,
                    moving_avg_revenue,
                    growth_rate,
                    CASE 
                        WHEN growth_rate > 10 THEN 'Strong Growth'
                        WHEN growth_rate > 0 THEN 'Moderate Growth'
                        WHEN growth_rate = 0 THEN 'Stable'
                        ELSE 'Declining'
                    END as trend_category,
                    CASE 
                        WHEN revenue > 0 THEN revenue * 1.1
                        ELSE 1000
                    END as forecast_next_month
                FROM sales_with_forecast
                ORDER BY month DESC
                LIMIT 12
            """)
            
            # Churn prediction with comprehensive analysis - show ALL customers
            churn_prediction = await conn.fetch("""
                SELECT 
                    c.id,
                    c.first_name,
                    c.last_name,
                    COUNT(o.id) as total_orders,
                    COALESCE(SUM(o.total_price), 0) as lifetime_value,
                    COALESCE(AVG(o.total_price), 0) as avg_order_value,
                    COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) as days_since_last_order,
                    COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - c.created_at)), 0) as days_since_registration,
                    CASE 
                        WHEN COUNT(o.id) = 0 THEN 0.9  -- High churn risk for no orders
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) > 90 THEN 0.8  -- High risk if no order in 90 days
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) > 60 THEN 0.6  -- Medium risk if no order in 60 days
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) > 30 THEN 0.4  -- Low risk if no order in 30 days
                        ELSE 0.1  -- Very low risk for recent orders
                    END as churn_probability,
                    CASE 
                        WHEN COUNT(o.id) = 0 THEN 'High Risk'
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) > 90 THEN 'High Risk'
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) > 60 THEN 'Medium Risk'
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) > 30 THEN 'Low Risk'
                        ELSE 'Very Low Risk'
                    END as churn_risk,
                    CASE 
                        WHEN COUNT(o.id) = 0 THEN 'Never Ordered'
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) <= 7 THEN 'Very Active'
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) <= 30 THEN 'Active'
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) <= 90 THEN 'Inactive'
                        ELSE 'Very Inactive'
                    END as activity_status,
                    CASE 
                        WHEN COALESCE(SUM(o.total_price), 0) >= 10000 THEN 'VIP'
                        WHEN COALESCE(SUM(o.total_price), 0) >= 5000 THEN 'Premium'
                        WHEN COALESCE(SUM(o.total_price), 0) >= 1000 THEN 'Regular'
                        ELSE 'New'
                    END as customer_segment
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'cancelled'
                GROUP BY c.id, c.first_name, c.last_name, c.created_at
                ORDER BY churn_probability DESC, lifetime_value DESC
            """)
            
            # Customer activity analysis
            customer_activity = await conn.fetch("""
                SELECT 
                    c.id,
                    c.first_name,
                    c.last_name,
                    COUNT(o.id) as total_orders,
                    COALESCE(SUM(o.total_price), 0) as lifetime_value,
                    COALESCE(MAX(o.order_date), c.created_at) as last_order_date,
                    COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) as days_since_last_order,
                    CASE 
                        WHEN COUNT(o.id) = 0 THEN 'No Orders'
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) <= 7 THEN 'Very Active'
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) <= 30 THEN 'Active'
                        WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) <= 90 THEN 'Inactive'
                        ELSE 'Very Inactive'
                    END as activity_status
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'cancelled'
                GROUP BY c.id, c.first_name, c.last_name, c.created_at
                ORDER BY days_since_last_order ASC, total_orders DESC
                LIMIT 50
            """)
            
            # Customer activity distribution
            activity_distribution = await conn.fetch("""
                SELECT 
                    activity_status,
                    COUNT(*) as customer_count,
                    AVG(lifetime_value) as avg_lifetime_value,
                    AVG(total_orders) as avg_orders
                FROM (
                    SELECT 
                        c.id,
                        COUNT(o.id) as total_orders,
                        COALESCE(SUM(o.total_price), 0) as lifetime_value,
                        CASE 
                            WHEN COUNT(o.id) = 0 THEN 'No Orders'
                            WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) <= 7 THEN 'Very Active'
                            WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) <= 30 THEN 'Active'
                            WHEN COALESCE(EXTRACT(DAYS FROM (CURRENT_DATE - MAX(o.order_date))), 0) <= 90 THEN 'Inactive'
                            ELSE 'Very Inactive'
                        END as activity_status
                    FROM customers c
                    LEFT JOIN orders o ON c.id = o.customer_id AND o.status != 'cancelled'
                    GROUP BY c.id
                ) activity_stats
                GROUP BY activity_status
                ORDER BY customer_count DESC
            """)
            
            # Demand forecasting with improved inventory turnover - show ALL products
            demand_forecast = await conn.fetch("""
                SELECT 
                    p.id,
                    p.name,
                    p.stock,
                    COALESCE(COUNT(oi.id), 0) as demand_last_30_days,
                    COALESCE(SUM(oi.quantity), 0) as total_quantity_demanded,
                    COALESCE(AVG(oi.quantity), 0) as avg_order_quantity,
                    CASE 
                        WHEN p.stock = 0 THEN 'Out of Stock'
                        WHEN p.stock < COALESCE(COUNT(oi.id), 0) THEN 'Understocked'
                        WHEN p.stock > COALESCE(COUNT(oi.id), 0) * 2 THEN 'Overstocked'
                        ELSE 'Well Stocked'
                    END as stock_status,
                    CASE 
                        WHEN p.stock > 0 THEN (COALESCE(COUNT(oi.id), 0)::float / p.stock) * 12
                        ELSE 0 
                    END as inventory_turnover,
                    CASE 
                        WHEN p.stock > 0 THEN 365 / NULLIF((COALESCE(COUNT(oi.id), 0)::float / p.stock) * 12, 0)
                        ELSE 999 
                    END as days_in_stock,
                    CASE 
                        WHEN p.stock = 0 THEN 'No Turnover'
                        WHEN p.stock > 0 AND (COALESCE(COUNT(oi.id), 0)::float / p.stock) * 12 > 12 THEN 'High Turnover'
                        WHEN p.stock > 0 AND (COALESCE(COUNT(oi.id), 0)::float / p.stock) * 12 > 6 THEN 'Medium Turnover'
                        ELSE 'Low Turnover'
                    END as turnover_category
                FROM products p
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id AND o.order_date >= CURRENT_DATE - INTERVAL '30 days' AND o.status != 'cancelled'
                GROUP BY p.id, p.name, p.stock
                ORDER BY demand_last_30_days DESC, inventory_turnover DESC
            """)
            
            return {
                "sales_forecast": [dict(row) for row in sales_forecast],
                "churn_prediction": [dict(row) for row in churn_prediction],
                "customer_activity": [dict(row) for row in customer_activity],
                "activity_distribution": [dict(row) for row in activity_distribution],
                "demand_forecast": [dict(row) for row in demand_forecast]
            }
    
    @staticmethod
    async def get_real_time_analytics() -> Dict[str, Any]:
        """Get real-time analytics data"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            
            # Recent orders
            recent_orders = await conn.fetch("""
                SELECT 
                    o.id,
                    o.order_date,
                    o.total_price,
                    o.status,
                    c.first_name,
                    c.last_name,
                    a.city
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                LEFT JOIN addresses a ON o.address_id = a.id
                WHERE o.order_date >= CURRENT_DATE - INTERVAL '24 hours'
                ORDER BY o.order_date DESC
                LIMIT 20
            """)
            
            # System health
            system_health = await conn.fetch("""
                SELECT 
                    'orders' as metric,
                    COUNT(*) as count,
                    'Last 24 hours' as period
                FROM orders 
                WHERE order_date >= CURRENT_DATE - INTERVAL '24 hours'
                UNION ALL
                SELECT 
                    'customers' as metric,
                    COUNT(*) as count,
                    'Last 24 hours' as period
                FROM customers 
                WHERE first_order_date >= CURRENT_DATE - INTERVAL '24 hours'
                UNION ALL
                SELECT 
                    'revenue' as metric,
                    SUM(total_price) as count,
                    'Last 24 hours' as period
                FROM orders 
                WHERE order_date >= CURRENT_DATE - INTERVAL '24 hours'
            """)
            
            # Low stock alerts
            low_stock_alerts = await conn.fetch("""
                SELECT 
                    p.id,
                    p.name,
                    p.stock,
                    p.views,
                    p.purchase_count,
                    CASE 
                        WHEN p.stock = 0 THEN 'Out of Stock'
                        WHEN p.stock <= 5 THEN 'Critical'
                        WHEN p.stock <= 10 THEN 'Low'
                        ELSE 'Adequate'
                    END as stock_status
                FROM products p
                WHERE p.stock <= 10
                ORDER BY p.stock ASC
                LIMIT 20
            """)
            
            return {
                "recent_orders": [dict(row) for row in recent_orders],
                "system_health": [dict(row) for row in system_health],
                "low_stock_alerts": [dict(row) for row in low_stock_alerts]
            } 