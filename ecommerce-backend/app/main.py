from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import (
    user as user_routes,
    product as product_routes,
    address as address_routes,
    customer as customer_routes,
    order as order_routes,
    cart as cart_routes,
    payment as payment_routes,
    review as review_routes,
    wishlist as wishlist_routes,
    discount as discount_routes,
    coupon as coupon_routes,
    admin as admin_routes,
    analytics as analytics_routes,
    advanced_analytics as advanced_analytics_routes,
    analytics_tracking as analytics_tracking_routes,
    rider as rider_routes
)
from app.models import (
    user, customer, address, product, tag, product_tag, product_image,
    order, order_item, order_status, cart, cart_item, payment_method,
    review, wishlist, wishlist_item, search_history, discount, coupon,
    coupon_redeem, admin, shipping, analytics, rider, delivery_assignment
)
from app.db.init_triggers import create_triggers

app = FastAPI(title="E-commerce API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000", 
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:3000",
        "https://your-app-name.netlify.app",  # Replace with your actual Netlify domain
        "https://*.netlify.app"  # Allow all Netlify subdomains
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Mount the static directory
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(user_routes.router, prefix="/api/v1")
app.include_router(product_routes.router, prefix="/api/v1")
app.include_router(address_routes.router, prefix="/api/v1")
app.include_router(customer_routes.router, prefix="/api/v1")
app.include_router(order_routes.router, prefix="/api/v1")
app.include_router(cart_routes.router, prefix="/api/v1")
app.include_router(payment_routes.router, prefix="/api/v1")
app.include_router(review_routes.router, prefix="/api/v1")
app.include_router(wishlist_routes.router, prefix="/api/v1")
app.include_router(discount_routes.router, prefix="/api/v1")
app.include_router(coupon_routes.router, prefix="/api/v1")
app.include_router(admin_routes.router, prefix="/api/v1")
app.include_router(analytics_routes.router, prefix="/api/v1")
app.include_router(advanced_analytics_routes.router, prefix="/api/v1")
app.include_router(analytics_tracking_routes.router, prefix="/api/v1")
app.include_router(rider_routes.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    # Create tables in dependency order
    await user.User.create_table()
    await customer.Customer.create_table()
    await address.Address.create_table()
    await product.Product.create_table()
    await tag.Tag.create_table()
    await product_tag.ProductTag.create_table()
    await product_image.ProductImage.create_table()
    await payment_method.PaymentMethod.create_table()  # Must be before order
    await order.Order.create_table()
    await order_item.OrderItem.create_table()
    await admin.Admin.create_table()  # Must be before order_status
    await order_status.OrderStatus.create_table()
    await cart.Cart.create_table()
    await cart_item.CartItem.create_table()
    await review.Review.create_table()
    await wishlist.Wishlist.create_table()
    await wishlist_item.WishlistItem.create_table()
    await search_history.SearchHistory.create_table()
    await discount.Discount.create_table()
    await coupon.Coupon.create_table()
    await coupon_redeem.CouponRedeem.create_table()
    await shipping.ShippingInfo.create_table()
    await analytics.RealTimeEvents.create_table() # Add this line
    await rider.Rider.create_table()
    await delivery_assignment.DeliveryAssignment.create_table()
    # await order_status.OrderStatus.create_table()  # Temporarily disabled
    
    # Initialize database triggers
    await create_triggers()

@app.get("/")
async def root():
    return {"message": "Welcome to E-commerce API"}
