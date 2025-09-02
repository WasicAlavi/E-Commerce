# app/models/analytics.py

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.database import get_db_connection
import json

class GeographicAnalytics:
    def __init__(self, id: int, customer_id: int, city: str, region: str, country: str, 
                 latitude: Optional[float] = None, longitude: Optional[float] = None,
                 total_orders: int = 0, total_spent: float = 0.0, last_order_date: Optional[datetime] = None):
        self.id = id
        self.customer_id = customer_id
        self.city = city
        self.region = region
        self.country = country
        self.latitude = latitude
        self.longitude = longitude
        self.total_orders = total_orders
        self.total_spent = total_spent
        self.last_order_date = last_order_date

    @classmethod
    async def create_table(cls):
        """Create geographic analytics table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS geographic_analytics (
                    id SERIAL PRIMARY KEY,
                    customer_id INTEGER REFERENCES customers(id),
                    city VARCHAR(100) NOT NULL,
                    region VARCHAR(100) NOT NULL,
                    country VARCHAR(100) NOT NULL,
                    latitude DECIMAL(10,8),
                    longitude DECIMAL(11,8),
                    total_orders INTEGER DEFAULT 0,
                    total_spent DECIMAL(12,2) DEFAULT 0.0,
                    last_order_date TIMESTAMP,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_geo_city ON geographic_analytics(city)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_geo_region ON geographic_analytics(region)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_geo_country ON geographic_analytics(country)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_geo_customer ON geographic_analytics(customer_id)")
            except Exception as e:
                pass

class MarketingAnalytics:
    def __init__(self, id: int, campaign_name: str, campaign_type: str, start_date: datetime, 
                 end_date: Optional[datetime] = None, budget: float = 0.0, spent: float = 0.0,
                 impressions: int = 0, clicks: int = 0, conversions: int = 0, revenue: float = 0.0,
                 status: str = 'active', source: str = 'unknown'):
        self.id = id
        self.campaign_name = campaign_name
        self.campaign_type = campaign_type
        self.start_date = start_date
        self.end_date = end_date
        self.budget = budget
        self.spent = spent
        self.impressions = impressions
        self.clicks = clicks
        self.conversions = conversions
        self.revenue = revenue
        self.status = status
        self.source = source

    @classmethod
    async def create_table(cls):
        """Create marketing analytics table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS marketing_analytics (
                    id SERIAL PRIMARY KEY,
                    campaign_name VARCHAR(200) NOT NULL,
                    campaign_type VARCHAR(50) NOT NULL,
                    start_date TIMESTAMP NOT NULL,
                    end_date TIMESTAMP,
                    budget DECIMAL(12,2) DEFAULT 0.0,
                    spent DECIMAL(12,2) DEFAULT 0.0,
                    impressions INTEGER DEFAULT 0,
                    clicks INTEGER DEFAULT 0,
                    conversions INTEGER DEFAULT 0,
                    revenue DECIMAL(12,2) DEFAULT 0.0,
                    status VARCHAR(20) DEFAULT 'active',
                    source VARCHAR(50) DEFAULT 'unknown',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_marketing_campaign ON marketing_analytics(campaign_name)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_marketing_type ON marketing_analytics(campaign_type)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_marketing_status ON marketing_analytics(status)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_marketing_date ON marketing_analytics(start_date)")
            except Exception as e:
                pass

class ProductAnalytics:
    def __init__(self, id: int, product_id: int, views: int = 0, clicks: int = 0, 
                 add_to_cart: int = 0, purchases: int = 0, returns: int = 0,
                 avg_rating: float = 0.0, total_reviews: int = 0, 
                 conversion_rate: float = 0.0, revenue: float = 0.0,
                 cost: float = 0.0, profit_margin: float = 0.0,
                 inventory_turnover: float = 0.0, days_in_stock: int = 0):
        self.id = id
        self.product_id = product_id
        self.views = views
        self.clicks = clicks
        self.add_to_cart = add_to_cart
        self.purchases = purchases
        self.returns = returns
        self.avg_rating = avg_rating
        self.total_reviews = total_reviews
        self.conversion_rate = conversion_rate
        self.revenue = revenue
        self.cost = cost
        self.profit_margin = profit_margin
        self.inventory_turnover = inventory_turnover
        self.days_in_stock = days_in_stock

    @classmethod
    async def create_table(cls):
        """Create product analytics table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS product_analytics (
                    id SERIAL PRIMARY KEY,
                    product_id INTEGER REFERENCES products(id),
                    views INTEGER DEFAULT 0,
                    clicks INTEGER DEFAULT 0,
                    add_to_cart INTEGER DEFAULT 0,
                    purchases INTEGER DEFAULT 0,
                    returns INTEGER DEFAULT 0,
                    avg_rating DECIMAL(3,2) DEFAULT 0.0,
                    total_reviews INTEGER DEFAULT 0,
                    conversion_rate DECIMAL(5,4) DEFAULT 0.0,
                    revenue DECIMAL(12,2) DEFAULT 0.0,
                    cost DECIMAL(12,2) DEFAULT 0.0,
                    profit_margin DECIMAL(5,4) DEFAULT 0.0,
                    inventory_turnover DECIMAL(8,4) DEFAULT 0.0,
                    days_in_stock INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_product_analytics_id ON product_analytics(product_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_product_views ON product_analytics(views)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_product_revenue ON product_analytics(revenue)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_product_rating ON product_analytics(avg_rating)")
            except Exception as e:
                pass

class CustomerAnalytics:
    def __init__(self, id: int, customer_id: int, lifetime_value: float = 0.0, 
                 acquisition_cost: float = 0.0, retention_rate: float = 0.0,
                 churn_probability: float = 0.0, avg_order_value: float = 0.0,
                 total_orders: int = 0, days_since_last_order: int = 0,
                 segment: str = 'new', engagement_score: float = 0.0,
                 referral_count: int = 0, total_spent: float = 0.0):
        self.id = id
        self.customer_id = customer_id
        self.lifetime_value = lifetime_value
        self.acquisition_cost = acquisition_cost
        self.retention_rate = retention_rate
        self.churn_probability = churn_probability
        self.avg_order_value = avg_order_value
        self.total_orders = total_orders
        self.days_since_last_order = days_since_last_order
        self.segment = segment
        self.engagement_score = engagement_score
        self.referral_count = referral_count
        self.total_spent = total_spent

    @classmethod
    async def create_table(cls):
        """Create customer analytics table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS customer_analytics (
                    id SERIAL PRIMARY KEY,
                    customer_id INTEGER REFERENCES customers(id),
                    lifetime_value DECIMAL(12,2) DEFAULT 0.0,
                    acquisition_cost DECIMAL(12,2) DEFAULT 0.0,
                    retention_rate DECIMAL(5,4) DEFAULT 0.0,
                    churn_probability DECIMAL(5,4) DEFAULT 0.0,
                    avg_order_value DECIMAL(10,2) DEFAULT 0.0,
                    total_orders INTEGER DEFAULT 0,
                    days_since_last_order INTEGER DEFAULT 0,
                    segment VARCHAR(20) DEFAULT 'new',
                    engagement_score DECIMAL(5,4) DEFAULT 0.0,
                    referral_count INTEGER DEFAULT 0,
                    total_spent DECIMAL(12,2) DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_customer_analytics_id ON customer_analytics(customer_id)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_customer_lifetime_value ON customer_analytics(lifetime_value)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_customer_segment ON customer_analytics(segment)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_customer_churn ON customer_analytics(churn_probability)")
            except Exception as e:
                pass

class RealTimeEvents:
    def __init__(self, id: int, event_type: str, event_data: Dict[str, Any], 
                 user_id: Optional[int] = None, customer_id: Optional[int] = None,
                 product_id: Optional[int] = None, order_id: Optional[int] = None,
                 timestamp: datetime = None, processed: bool = False):
        self.id = id
        self.event_type = event_type
        self.event_data = event_data
        self.user_id = user_id
        self.customer_id = customer_id
        self.product_id = product_id
        self.order_id = order_id
        self.timestamp = timestamp or datetime.now()
        self.processed = processed

    @classmethod
    async def create_table(cls):
        """Create real-time events table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS real_time_events (
                    id SERIAL PRIMARY KEY,
                    event_type VARCHAR(50) NOT NULL,
                    event_data JSONB NOT NULL,
                    user_id INTEGER REFERENCES users(id),
                    customer_id INTEGER REFERENCES customers(id),
                    product_id INTEGER REFERENCES products(id),
                    order_id INTEGER REFERENCES orders(id),
                    timestamp TIMESTAMP DEFAULT NOW(),
                    processed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_events_type ON real_time_events(event_type)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON real_time_events(timestamp)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_events_processed ON real_time_events(processed)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_events_user ON real_time_events(user_id)")
            except Exception as e:
                pass

class PredictiveModels:
    def __init__(self, id: int, model_name: str, model_type: str, 
                 model_data: Dict[str, Any], accuracy: float = 0.0,
                 last_trained: datetime = None, status: str = 'active',
                 version: str = '1.0', description: str = ''):
        self.id = id
        self.model_name = model_name
        self.model_type = model_type
        self.model_data = model_data
        self.accuracy = accuracy
        self.last_trained = last_trained or datetime.now()
        self.status = status
        self.version = version
        self.description = description

    @classmethod
    async def create_table(cls):
        """Create predictive models table"""
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS predictive_models (
                    id SERIAL PRIMARY KEY,
                    model_name VARCHAR(100) NOT NULL,
                    model_type VARCHAR(50) NOT NULL,
                    model_data JSONB NOT NULL,
                    accuracy DECIMAL(5,4) DEFAULT 0.0,
                    last_trained TIMESTAMP DEFAULT NOW(),
                    status VARCHAR(20) DEFAULT 'active',
                    version VARCHAR(20) DEFAULT '1.0',
                    description TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            # Create indexes
            try:
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_models_name ON predictive_models(model_name)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_models_type ON predictive_models(model_type)")
                await conn.execute("CREATE INDEX IF NOT EXISTS idx_models_status ON predictive_models(status)")
            except Exception as e:
                pass 