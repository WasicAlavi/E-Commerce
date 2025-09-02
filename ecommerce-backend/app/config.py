import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost/dbname")
    
    # JWT
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # SSL Commerz Configuration
    SSLCOMMERZ_STORE_ID = os.getenv("SSLCOMMERZ_STORE_ID", "")
    SSLCOMMERZ_STORE_PASSWORD = os.getenv("SSLCOMMERZ_STORE_PASSWORD", "")
    SSLCOMMERZ_SANDBOX = os.getenv("SSLCOMMERZ_SANDBOX", "True").lower() == "true"
    SSLCOMMERZ_SUCCESS_URL = os.getenv("SSLCOMMERZ_SUCCESS_URL", "http://localhost:8000/api/v1/payment/sslcommerz/success")
    SSLCOMMERZ_FAIL_URL = os.getenv("SSLCOMMERZ_FAIL_URL", "http://localhost:8000/api/v1/payment/sslcommerz/fail")
    SSLCOMMERZ_CANCEL_URL = os.getenv("SSLCOMMERZ_CANCEL_URL", "http://localhost:8000/api/v1/payment/sslcommerz/cancel")
    SSLCOMMERZ_IPN_URL = os.getenv("SSLCOMMERZ_IPN_URL", "http://localhost:8000/api/v1/payment/sslcommerz/ipn")
    
    # Frontend URLs for redirects
    FRONTEND_SUCCESS_URL = os.getenv("FRONTEND_SUCCESS_URL", "http://localhost:5173/payment/success")
    FRONTEND_FAIL_URL = os.getenv("FRONTEND_FAIL_URL", "http://localhost:5173/payment/fail")
    FRONTEND_CANCEL_URL = os.getenv("FRONTEND_CANCEL_URL", "http://localhost:5173/payment/cancel")

settings = Settings()
