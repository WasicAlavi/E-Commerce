"""
Database triggers initialization

"""

from app.database import get_db_connection

async def create_triggers():
    """Create all database triggers"""
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        
        # 1. PRODUCT STOCK MANAGEMENT TRIGGERS
        await conn.execute("""
            CREATE OR REPLACE FUNCTION update_product_stock_on_order()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE products 
                SET stock = stock - NEW.quantity 
                WHERE id = NEW.product_id;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_update_product_stock_on_order ON order_items;
            CREATE TRIGGER trigger_update_product_stock_on_order
                AFTER INSERT ON order_items
                FOR EACH ROW
                EXECUTE FUNCTION update_product_stock_on_order();
        """)
        
        # 2. RESTORE STOCK ON ORDER CANCELLATION
        await conn.execute("""
            CREATE OR REPLACE FUNCTION restore_product_stock_on_order_cancel()
            RETURNS TRIGGER AS $$
            BEGIN
                IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
                    UPDATE products 
                    SET stock = stock + (
                        SELECT SUM(quantity) 
                        FROM order_items 
                        WHERE order_id = NEW.id
                    )
                    WHERE id IN (
                        SELECT product_id 
                        FROM order_items 
                        WHERE order_id = NEW.id
                    );
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_restore_product_stock_on_order_cancel ON orders;
            CREATE TRIGGER trigger_restore_product_stock_on_order_cancel
                AFTER UPDATE ON orders
                FOR EACH ROW
                EXECUTE FUNCTION restore_product_stock_on_order_cancel();
        """)
        
        # 3. COUPON USAGE TRACKING
        await conn.execute("""
            CREATE OR REPLACE FUNCTION update_coupon_usage_on_redeem()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE coupons 
                SET used = used + 1 
                WHERE id = NEW.coupon_id;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_update_coupon_usage_on_redeem ON coupon_redeems;
            CREATE TRIGGER trigger_update_coupon_usage_on_redeem
                AFTER INSERT ON coupon_redeems
                FOR EACH ROW
                EXECUTE FUNCTION update_coupon_usage_on_redeem();
        """)
        
        # 4. USER ROLE MANAGEMENT
        await conn.execute("""
            CREATE OR REPLACE FUNCTION sync_user_role_on_admin_change()
            RETURNS TRIGGER AS $$
            BEGIN
                IF TG_OP = 'INSERT' THEN
                    UPDATE users SET role = 'admin' WHERE id = NEW.user_id;
                ELSIF TG_OP = 'DELETE' THEN
                    IF NOT EXISTS (SELECT 1 FROM admins WHERE user_id = OLD.user_id) THEN
                        UPDATE users SET role = 'user' WHERE id = OLD.user_id;
                    END IF;
                END IF;
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_sync_user_role_on_admin_insert ON admins;
            CREATE TRIGGER trigger_sync_user_role_on_admin_insert
                AFTER INSERT ON admins
                FOR EACH ROW
                EXECUTE FUNCTION sync_user_role_on_admin_change();
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_sync_user_role_on_admin_delete ON admins;
            CREATE TRIGGER trigger_sync_user_role_on_admin_delete
                AFTER DELETE ON admins
                FOR EACH ROW
                EXECUTE FUNCTION sync_user_role_on_admin_change();
        """)
        
        # 5. PRODUCT RATING CALCULATION
        await conn.execute("""
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name = 'products' AND column_name = 'average_rating') THEN
                    ALTER TABLE products ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
                END IF;
            END $$;
        """)
        
        await conn.execute("""
            CREATE OR REPLACE FUNCTION update_product_rating_on_review()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE products 
                SET average_rating = (
                    SELECT ROUND(AVG(rating)::numeric, 2)
                    FROM reviews 
                    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
                )
                WHERE id = COALESCE(NEW.product_id, OLD.product_id);
                
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Create review triggers
        for trigger_name in ['insert', 'update', 'delete']:
            await conn.execute(f"""
                DROP TRIGGER IF EXISTS trigger_update_product_rating_on_review_{trigger_name} ON reviews;
                CREATE TRIGGER trigger_update_product_rating_on_review_{trigger_name}
                    AFTER {trigger_name.upper()} ON reviews
                    FOR EACH ROW
                    EXECUTE FUNCTION update_product_rating_on_review();
            """)
        
        # 6. PAYMENT METHOD DEFAULT MANAGEMENT
        await conn.execute("""
            CREATE OR REPLACE FUNCTION manage_payment_method_default()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.is_default = TRUE THEN
                    UPDATE payment_methods 
                    SET is_default = FALSE 
                    WHERE customer_id = NEW.customer_id 
                    AND id != NEW.id;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_manage_payment_method_default ON payment_methods;
            CREATE TRIGGER trigger_manage_payment_method_default
                BEFORE INSERT OR UPDATE ON payment_methods
                FOR EACH ROW
                EXECUTE FUNCTION manage_payment_method_default();
        """)
        
        # 7. PRODUCT IMAGE PRIMARY MANAGEMENT
        await conn.execute("""
            CREATE OR REPLACE FUNCTION manage_product_image_primary()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.is_primary = TRUE THEN
                    UPDATE product_images 
                    SET is_primary = FALSE 
                    WHERE product_id = NEW.product_id 
                    AND id != NEW.id;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_manage_product_image_primary ON product_images;
            CREATE TRIGGER trigger_manage_product_image_primary
                BEFORE INSERT OR UPDATE ON product_images
                FOR EACH ROW
                EXECUTE FUNCTION manage_product_image_primary();
        """)
        
        # 8. CUSTOMER CREATION TRIGGER
        await conn.execute("""
            CREATE OR REPLACE FUNCTION create_customer_on_user_insert()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO customers (user_id, first_name, last_name)
                VALUES (NEW.id, NEW.name, '');
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_create_customer_on_user_insert ON users;
            CREATE TRIGGER trigger_create_customer_on_user_insert
                AFTER INSERT ON users
                FOR EACH ROW
                EXECUTE FUNCTION create_customer_on_user_insert();
        """)
        
        # 9. VALIDATION TRIGGERS
        # Discount validation
        await conn.execute("""
            CREATE OR REPLACE FUNCTION validate_discount_dates()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.end_date <= NEW.start_date THEN
                    RAISE EXCEPTION 'Discount end_date must be after start_date';
                END IF;
                
                IF NEW.value <= 0 THEN
                    RAISE EXCEPTION 'Discount value must be greater than 0';
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_validate_discount_dates ON discounts;
            CREATE TRIGGER trigger_validate_discount_dates
                BEFORE INSERT OR UPDATE ON discounts
                FOR EACH ROW
                EXECUTE FUNCTION validate_discount_dates();
        """)
        
        # Cart item quantity validation
        await conn.execute("""
            CREATE OR REPLACE FUNCTION validate_cart_item_quantity()
            RETURNS TRIGGER AS $$
            DECLARE
                available_stock INTEGER;
            BEGIN
                SELECT stock INTO available_stock 
                FROM products 
                WHERE id = NEW.product_id;
                
                IF NEW.quantity > available_stock THEN
                    RAISE EXCEPTION 'Quantity exceeds available stock. Available: %, Requested: %', 
                                   available_stock, NEW.quantity;
                END IF;
                
                IF NEW.quantity <= 0 THEN
                    RAISE EXCEPTION 'Quantity must be greater than 0';
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_validate_cart_item_quantity ON cart_items;
            CREATE TRIGGER trigger_validate_cart_item_quantity
                BEFORE INSERT OR UPDATE ON cart_items
                FOR EACH ROW
                EXECUTE FUNCTION validate_cart_item_quantity();
        """)
        
        # Review rating validation
        await conn.execute("""
            CREATE OR REPLACE FUNCTION validate_review_rating()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.rating < 1 OR NEW.rating > 5 THEN
                    RAISE EXCEPTION 'Rating must be between 1 and 5';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_validate_review_rating ON reviews;
            CREATE TRIGGER trigger_validate_review_rating
                BEFORE INSERT OR UPDATE ON reviews
                FOR EACH ROW
                EXECUTE FUNCTION validate_review_rating();
        """)
        
        # Coupon validation
        await conn.execute("""
            CREATE OR REPLACE FUNCTION validate_coupon()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.valid_until <= NEW.valid_from THEN
                    RAISE EXCEPTION 'Coupon valid_until must be after valid_from';
                END IF;
                
                IF NEW.value <= 0 THEN
                    RAISE EXCEPTION 'Coupon value must be greater than 0';
                END IF;
                
                IF NEW.usage_limit <= 0 THEN
                    RAISE EXCEPTION 'Coupon usage_limit must be greater than 0';
                END IF;
                
                IF NEW.used > NEW.usage_limit THEN
                    RAISE EXCEPTION 'Coupon used count cannot exceed usage_limit';
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        await conn.execute("""
            DROP TRIGGER IF EXISTS trigger_validate_coupon ON coupons;
            CREATE TRIGGER trigger_validate_coupon
                BEFORE INSERT OR UPDATE ON coupons
                FOR EACH ROW
                EXECUTE FUNCTION validate_coupon();
        """)
        
        # 10. ORDER TOTAL CALCULATION
        await conn.execute("""
            CREATE OR REPLACE FUNCTION calculate_order_total()
            RETURNS TRIGGER AS $$
            BEGIN
                UPDATE orders 
                SET total_price = (
                    SELECT COALESCE(SUM(quantity * price), 0)
                    FROM order_items 
                    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
                )
                WHERE id = COALESCE(NEW.order_id, OLD.order_id);
                
                RETURN COALESCE(NEW, OLD);
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        for operation in ['insert', 'update', 'delete']:
            await conn.execute(f"""
                DROP TRIGGER IF EXISTS trigger_calculate_order_total_{operation} ON order_items;
                CREATE TRIGGER trigger_calculate_order_total_{operation}
                    AFTER {operation.upper()} ON order_items
                    FOR EACH ROW
                    EXECUTE FUNCTION calculate_order_total();
            """)
        
        print("✅ All database triggers created successfully!")

async def drop_all_triggers():
    """Drop all triggers (for testing/cleanup)"""
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        triggers = [
            'trigger_update_product_stock_on_order',
            'trigger_restore_product_stock_on_order_cancel',
            'trigger_update_coupon_usage_on_redeem',
            'trigger_sync_user_role_on_admin_insert',
            'trigger_sync_user_role_on_admin_delete',
            'trigger_update_product_rating_on_review_insert',
            'trigger_update_product_rating_on_review_update',
            'trigger_update_product_rating_on_review_delete',
            'trigger_manage_payment_method_default',
            'trigger_manage_product_image_primary',
            'trigger_create_customer_on_user_insert',
            'trigger_validate_discount_dates',
            'trigger_validate_cart_item_quantity',
            'trigger_validate_review_rating',
            'trigger_validate_coupon',
            'trigger_calculate_order_total_insert',
            'trigger_calculate_order_total_update',
            'trigger_calculate_order_total_delete'
        ]
        
        for trigger in triggers:
            try:
                await conn.execute(f"DROP TRIGGER IF EXISTS {trigger} CASCADE;")
            except Exception as e:
                print(f"Warning: Could not drop trigger {trigger}: {e}")
        
        print("✅ All triggers dropped successfully!")

async def list_triggers():
    """List all triggers in the database"""
    pool = await get_db_connection()
    async with pool.acquire() as conn:
        result = await conn.fetch("""
            SELECT 
                trigger_name,
                event_manipulation,
                event_object_table,
                action_statement
            FROM information_schema.triggers 
            WHERE trigger_schema = 'public'
            ORDER BY event_object_table, trigger_name;
        """)
        
        print("📋 Current Triggers in Database:")
        for row in result:
            print(f"  • {row['trigger_name']} on {row['event_object_table']} ({row['event_manipulation']})")
        
        return result 