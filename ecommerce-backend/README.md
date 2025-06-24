# E-commerce Backend API

A FastAPI-based e-commerce backend using raw SQL with PostgreSQL.

## Features

- Raw SQL operations (no ORM)
- FastAPI framework
- PostgreSQL database
- User authentication
- Customer management
- Address management
- Async/await support

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up PostgreSQL database:**
   - Create a database named `mydb`
   - Update the `DATABASE_URL` in `app/database.py` if needed
   - Default credentials: `admin:admin@localhost/mydb`

3. **Run the application:**
   ```bash
   python run.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn app.main:app --reload
   ```

4. **Access the API:**
   - API Documentation: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Users
- `POST /api/v1/users/` - Create a new user
- `GET /api/v1/users/` - Get all users
- `GET /api/v1/users/{user_id}` - Get user by ID
- `PUT /api/v1/users/{user_id}` - Update user
- `DELETE /api/v1/users/{user_id}` - Delete user

## Database Schema

The application automatically creates the following tables on startup:
- `users` - User accounts
- `customers` - Customer profiles
- `addresses` - Customer addresses

## Project Structure

```
ecommerce-backend/
├── app/
│   ├── models/          # Raw SQL model classes
│   ├── schemas/         # Pydantic schemas
│   ├── crud/           # CRUD operations
│   ├── routes/         # API routes
│   ├── database.py     # Database connection
│   └── main.py         # FastAPI app
├── requirements.txt    # Dependencies
├── run.py             # Run script
└── README.md          # This file
```

## Converting from ORM to Raw SQL

This project has been converted from SQLAlchemy ORM to raw SQL operations. Key changes:

1. **Database Connection**: Uses `asyncpg` for async PostgreSQL connections
2. **Models**: Converted from SQLAlchemy models to Python classes with raw SQL methods
3. **CRUD Operations**: Implemented using raw SQL queries
4. **Schemas**: Updated to work with the new model structure

## Next Steps

To complete the e-commerce system, you'll need to:

1. Convert remaining models (Product, Order, Cart, etc.)
2. Implement authentication and authorization
3. Add admin panel functionality
4. Implement payment processing
5. Add product catalog and search
6. Implement order management 