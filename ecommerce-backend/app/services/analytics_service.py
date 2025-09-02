from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from app.database import get_db_connection
import json

class AnalyticsService:
    @staticmethod
    async def get_sales_dashboard_data(days: int = 30) -> Dict[str, Any]:
        """Get real-time sales analytics"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Get date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Total sales
            total_sales = await conn.fetchval("""
                SELECT COALESCE(SUM(total_price), 0)
                FROM orders 
                WHERE order_date >= $1 AND order_date <= $2
                AND status != 'cancelled'
            """, start_date, end_date)
            
            # Total orders
            total_orders = await conn.fetchval("""
                SELECT COUNT(*)
                FROM orders 
                WHERE order_date >= $1 AND order_date <= $2
                AND status != 'cancelled'
            """, start_date, end_date)
            
            # Average order value
            avg_order_value = await conn.fetchval("""
                SELECT COALESCE(AVG(total_price), 0)
                FROM orders 
                WHERE order_date >= $1 AND order_date <= $2
                AND status != 'cancelled'
            """, start_date, end_date)
            
            # Daily sales data for chart
            daily_sales = await conn.fetch("""
                SELECT 
                    DATE(order_date) as date,
                    COUNT(*) as orders,
                    SUM(total_price) as revenue
                FROM orders 
                WHERE order_date >= $1 AND order_date <= $2
                AND status != 'cancelled'
                GROUP BY DATE(order_date)
                ORDER BY date
            """, start_date, end_date)
            
            # Top selling products
            top_products = await conn.fetch("""
                SELECT 
                    p.name,
                    p.id,
                    SUM(oi.quantity) as total_sold,
                    SUM(oi.quantity * oi.price) as revenue
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.order_date >= $1 AND o.order_date <= $2
                AND o.status != 'cancelled'
                GROUP BY p.id, p.name
                ORDER BY total_sold DESC
                LIMIT 10
            """, start_date, end_date)
            
            # Sales by status
            sales_by_status = await conn.fetch("""
                SELECT 
                    status,
                    COUNT(*) as count,
                    SUM(total_price) as revenue
                FROM orders 
                WHERE order_date >= $1 AND order_date <= $2
                GROUP BY status
            """, start_date, end_date)
            
            return {
                "total_sales": float(total_sales),
                "total_orders": total_orders,
                "avg_order_value": float(avg_order_value),
                "daily_sales": [dict(row) for row in daily_sales],
                "top_products": [dict(row) for row in top_products],
                "sales_by_status": [dict(row) for row in sales_by_status]
            }

    @staticmethod
    async def get_inventory_analytics() -> Dict[str, Any]:
        """Get inventory management analytics"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Low stock alerts (less than 10 items)
            low_stock_products = await conn.fetch("""
                SELECT 
                    id, name, stock, price,
                    CASE 
                        WHEN stock = 0 THEN 'Out of Stock'
                        WHEN stock <= 5 THEN 'Critical'
                        WHEN stock <= 10 THEN 'Low'
                        ELSE 'Normal'
                    END as stock_status
                FROM products 
                WHERE stock <= 10
                ORDER BY stock ASC
            """)
            
            # Stock value
            total_stock_value = await conn.fetchval("""
                SELECT COALESCE(SUM(stock * price), 0)
                FROM products
            """)
            
            # Products by stock level
            stock_distribution = await conn.fetch("""
                SELECT 
                    stock_level,
                    product_count,
                    stock_value
                FROM (
                    SELECT 
                        CASE 
                            WHEN stock = 0 THEN 'Out of Stock'
                            WHEN stock <= 5 THEN 'Critical (1-5)'
                            WHEN stock <= 10 THEN 'Low (6-10)'
                            WHEN stock <= 50 THEN 'Medium (11-50)'
                            ELSE 'High (50+)'
                        END as stock_level,
                        COUNT(*) as product_count,
                        SUM(stock * price) as stock_value,
                        CASE 
                            WHEN stock = 0 THEN 1
                            WHEN stock <= 5 THEN 2
                            WHEN stock <= 10 THEN 3
                            WHEN stock <= 50 THEN 4
                            ELSE 5
                        END as sort_order
                    FROM products
                    GROUP BY 
                        CASE 
                            WHEN stock = 0 THEN 'Out of Stock'
                            WHEN stock <= 5 THEN 'Critical (1-5)'
                            WHEN stock <= 10 THEN 'Low (6-10)'
                            WHEN stock <= 50 THEN 'Medium (11-50)'
                            ELSE 'High (50+)'
                        END,
                        CASE 
                            WHEN stock = 0 THEN 1
                            WHEN stock <= 5 THEN 2
                            WHEN stock <= 10 THEN 3
                            WHEN stock <= 50 THEN 4
                            ELSE 5
                        END
                ) subquery
                ORDER BY sort_order
            """)
            
            # Fast moving products (sold in last 30 days)
            fast_moving = await conn.fetch("""
                SELECT 
                    p.name,
                    p.id,
                    p.stock,
                    SUM(oi.quantity) as sold_last_30_days
                FROM products p
                LEFT JOIN order_items oi ON p.id = oi.product_id
                LEFT JOIN orders o ON oi.order_id = o.id
                AND o.order_date >= CURRENT_DATE - INTERVAL '30 days'
                AND o.status != 'cancelled'
                GROUP BY p.id, p.name, p.stock
                HAVING SUM(oi.quantity) > 0
                ORDER BY sold_last_30_days DESC
                LIMIT 10
            """)
            
            # Product views and performance
            product_views = await conn.fetch("""
                SELECT 
                    p.name,
                    COALESCE(p.views, 0) as views,
                    COALESCE(p.purchase_count, 0) as purchase_count,
                    COALESCE(p.add_to_cart_count, 0) as add_to_cart_count,
                    CASE 
                        WHEN COALESCE(p.views, 0) > 0 THEN (COALESCE(p.purchase_count, 0)::float / p.views) * 100
                        ELSE 0 
                    END as conversion_rate
                FROM products p
                ORDER BY COALESCE(p.views, 0) DESC
                LIMIT 10
            """)
            
            return {
                "low_stock_products": [dict(row) for row in low_stock_products],
                "total_stock_value": float(total_stock_value),
                "stock_distribution": [dict(row) for row in stock_distribution],
                "fast_moving_products": [dict(row) for row in fast_moving],
                "product_views": [dict(row) for row in product_views],
                "total_products": await conn.fetchval("SELECT COUNT(*) FROM products")
            }

    @staticmethod
    async def get_customer_segmentation() -> Dict[str, Any]:
        """Get customer segmentation analytics"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Customer segments by order value
            customer_segments = await conn.fetch("""
                SELECT 
                    CASE 
                        WHEN total_spent >= 10000 THEN 'VIP'
                        WHEN total_spent >= 5000 THEN 'Premium'
                        WHEN total_spent >= 1000 THEN 'Regular'
                        ELSE 'New'
                    END as segment,
                    COUNT(*) as customer_count,
                    AVG(total_spent) as avg_spent,
                    AVG(order_count) as avg_orders
                FROM (
                    SELECT 
                        c.id,
                        COUNT(o.id) as order_count,
                        COALESCE(SUM(o.total_price), 0) as total_spent
                    FROM customers c
                    LEFT JOIN orders o ON c.id = o.customer_id
                    AND o.status != 'cancelled'
                    GROUP BY c.id
                ) customer_stats
                GROUP BY 
                    CASE 
                        WHEN total_spent >= 10000 THEN 'VIP'
                        WHEN total_spent >= 5000 THEN 'Premium'
                        WHEN total_spent >= 1000 THEN 'Regular'
                        ELSE 'New'
                    END
                ORDER BY avg_spent DESC
            """)
            
            # Customer behavior analysis
            customer_behavior = await conn.fetch("""
                SELECT 
                    c.id,
                    c.first_name,
                    c.last_name,
                    COUNT(o.id) as total_orders,
                    COALESCE(SUM(o.total_price), 0) as total_spent,
                    MAX(o.order_date) as last_order_date,
                    AVG(o.total_price) as avg_order_value
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id
                AND o.status != 'cancelled'
                GROUP BY c.id, c.first_name, c.last_name
                ORDER BY total_spent DESC
                LIMIT 20
            """)
            
            # Customer acquisition data
            customer_acquisition = await conn.fetch("""
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as new_customers
                FROM customers 
                WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
                GROUP BY DATE(created_at)
                ORDER BY date
            """)
            
            return {
                "customer_segments": [dict(row) for row in customer_segments],
                "customer_behavior": [dict(row) for row in customer_behavior],
                "customer_acquisition": [dict(row) for row in customer_acquisition]
            }

    @staticmethod
    async def get_performance_metrics() -> Dict[str, Any]:
        """Get performance metrics and KPIs"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Conversion rates
            conversion_data = await conn.fetch("""
                SELECT 
                    COUNT(DISTINCT c.id) as total_customers,
                    COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN c.id END) as customers_with_orders,
                    ROUND(
                        (COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN c.id END)::DECIMAL / 
                         COUNT(DISTINCT c.id)::DECIMAL) * 100, 2
                    ) as conversion_rate
                FROM customers c
                LEFT JOIN orders o ON c.id = o.customer_id
                AND o.status != 'cancelled'
            """)
            
            # Average order value trends
            aov_trends = await conn.fetch("""
                SELECT 
                    DATE(order_date) as date,
                    AVG(total_price) as avg_order_value,
                    COUNT(*) as order_count
                FROM orders
                WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
                AND status != 'cancelled'
                GROUP BY DATE(order_date)
                ORDER BY date
            """)
            
            # Revenue per customer
            revenue_per_customer = await conn.fetchval("""
                SELECT COALESCE(AVG(total_spent), 0)
                FROM (
                    SELECT COALESCE(SUM(total_price), 0) as total_spent
                    FROM orders
                    WHERE status != 'cancelled'
                    GROUP BY customer_id
                ) customer_revenue
            """)
            
            # Return customer rate
            return_customer_rate = await conn.fetchval("""
                SELECT ROUND(
                    (COUNT(DISTINCT customer_id)::DECIMAL / 
                     (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE status != 'cancelled')::DECIMAL) * 100, 2
                )
                FROM (
                    SELECT customer_id, COUNT(*) as order_count
                    FROM orders
                    WHERE status != 'cancelled'
                    GROUP BY customer_id
                    HAVING COUNT(*) > 1
                ) repeat_customers
            """)
            
            return {
                "conversion_rate": float(conversion_data[0]['conversion_rate']) if conversion_data else 0,
                "avg_order_value_trends": [dict(row) for row in aov_trends],
                "revenue_per_customer": float(revenue_per_customer),
                "return_customer_rate": float(return_customer_rate) if return_customer_rate else 0
            }

    @staticmethod
    async def get_trend_analysis() -> Dict[str, Any]:
        """Get trend analysis and seasonal patterns"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # Monthly sales trends
            monthly_trends = await conn.fetch("""
                SELECT 
                    DATE_TRUNC('month', order_date) as month,
                    COUNT(*) as orders,
                    SUM(total_price) as revenue,
                    AVG(total_price) as avg_order_value
                FROM orders
                WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
                AND status != 'cancelled'
                GROUP BY DATE_TRUNC('month', order_date)
                ORDER BY month
            """)
            
            # Popular products by month
            popular_products_monthly = await conn.fetch("""
                SELECT 
                    p.name,
                    DATE_TRUNC('month', o.order_date) as month,
                    SUM(oi.quantity) as total_sold
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.order_date >= CURRENT_DATE - INTERVAL '6 months'
                AND o.status != 'cancelled'
                GROUP BY p.name, DATE_TRUNC('month', o.order_date)
                ORDER BY month DESC, total_sold DESC
            """)
            
            # Category performance
            category_performance = await conn.fetch("""
                SELECT 
                    t.tag_name as category,
                    COUNT(DISTINCT o.id) as orders,
                    SUM(oi.quantity) as items_sold,
                    SUM(oi.quantity * oi.price) as revenue
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                JOIN product_tags pt ON p.id = pt.product_id
                JOIN tags t ON pt.tag_id = t.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
                AND o.status != 'cancelled'
                GROUP BY t.tag_name
                ORDER BY revenue DESC
            """)
            
            # Peak hours analysis
            peak_hours = await conn.fetch("""
                SELECT 
                    EXTRACT(HOUR FROM order_date) as hour,
                    COUNT(*) as orders,
                    AVG(total_price) as avg_order_value
                FROM orders
                WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
                AND status != 'cancelled'
                GROUP BY EXTRACT(HOUR FROM order_date)
                ORDER BY hour
            """)
            
            return {
                "monthly_trends": [dict(row) for row in monthly_trends],
                "popular_products_monthly": [dict(row) for row in popular_products_monthly],
                "category_performance": [dict(row) for row in category_performance],
                "peak_hours": [dict(row) for row in peak_hours]
            } 