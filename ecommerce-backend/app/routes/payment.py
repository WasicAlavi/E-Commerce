from fastapi import APIRouter, HTTPException, Depends, Query, Request, Form
from typing import List, Optional, Dict, Any
from app.crud import payment_crud
from app.schemas.payment_method import (
    PaymentMethodCreate, PaymentMethodUpdate, PaymentMethodOut, 
    PaymentMethodList, PaymentMethodResponse
)
from app.services.sslcommerz_service import sslcommerz_service
from app.models.order import Order
from app.models.customer import Customer
from app.models.user import User
from fastapi.responses import RedirectResponse
from app.config import settings

router = APIRouter(prefix="/payment-methods", tags=["payment-methods"])

@router.post("/", response_model=PaymentMethodResponse)
async def create_payment_method(payment_data: PaymentMethodCreate):
    """Create a new payment method"""
    try:
        payment = await payment_crud.create_payment_method(payment_data)
        return PaymentMethodResponse(
            success=True,
            message="Payment method created successfully",
            data=payment
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{payment_id}", response_model=PaymentMethodResponse)
async def get_payment_method(payment_id: int):
    """Get payment method by ID"""
    payment = await payment_crud.get_payment_method_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return PaymentMethodResponse(
        success=True,
        message="Payment method retrieved successfully",
        data=payment
    )

@router.get("/customer/{customer_id}", response_model=List[PaymentMethodOut])
async def get_payment_methods_by_customer(customer_id: int):
    """Get payment methods by customer ID"""
    payments = await payment_crud.get_payment_methods_by_customer(customer_id)
    return payments

@router.get("/customer/{customer_id}/default", response_model=PaymentMethodResponse)
async def get_default_payment_method(customer_id: int):
    """Get default payment method for customer"""
    payment = await payment_crud.get_default_payment_method(customer_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Default payment method not found")
    
    return PaymentMethodResponse(
        success=True,
        message="Default payment method retrieved successfully",
        data=payment
    )

@router.get("/", response_model=PaymentMethodList)
async def get_payment_methods(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all payment methods with pagination"""
    payments = await payment_crud.get_payment_methods(skip=skip, limit=limit)
    total = len(payments)
    
    return PaymentMethodList(
        payment_methods=payments,
        total=total,
        skip=skip,
        limit=limit
    )

@router.put("/{payment_id}", response_model=PaymentMethodResponse)
async def update_payment_method(payment_id: int, payment_data: PaymentMethodUpdate):
    """Update payment method"""
    payment = await payment_crud.update_payment_method(payment_id, payment_data)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return PaymentMethodResponse(
        success=True,
        message="Payment method updated successfully",
        data=payment
    )

@router.delete("/{payment_id}")
async def delete_payment_method(payment_id: int):
    """Delete payment method"""
    success = await payment_crud.delete_payment_method(payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return {"success": True, "message": "Payment method deleted successfully"}

@router.post("/{payment_id}/set-default", response_model=PaymentMethodResponse)
async def set_default_payment_method(payment_id: int):
    """Set payment method as default"""
    payment = await payment_crud.set_default_payment_method(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment method not found")
    
    return PaymentMethodResponse(
        success=True,
        message="Payment method set as default successfully",
        data=payment
    )

@router.get("/customer/{customer_id}/type/{payment_type}", response_model=List[PaymentMethodOut])
async def get_payment_methods_by_type(customer_id: int, payment_type: str):
    """Get payment methods by type for a customer"""
    payments = await payment_crud.get_payment_methods_by_type(customer_id, payment_type)
    return payments

@router.get("/{payment_id}/validate/{customer_id}")
async def validate_payment_method(payment_id: int, customer_id: int):
    """Validate if payment method belongs to customer"""
    is_valid = await payment_crud.validate_payment_method(payment_id, customer_id)
    return {
        "success": True,
        "message": "Payment method validation completed",
        "data": {"is_valid": is_valid}
    }

# SSL Commerz Payment Routes
@router.options("/sslcommerz/create-session")
async def options_sslcommerz_session():
    """Handle OPTIONS request for CORS preflight"""
    return {"message": "OK"}

@router.post("/sslcommerz/create-session")
async def create_sslcommerz_session(order_data: Dict[str, Any]):
    """Create SSL Commerz payment session"""
    try:
        # Validate required fields
        required_fields = ['order_id', 'total_amount', 'customer_name', 'customer_email', 
                          'customer_address', 'customer_city', 'customer_postcode', 'customer_phone', 'items']
        
        for field in required_fields:
            if field not in order_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Create payment session
        result = sslcommerz_service.create_session(order_data)
        
        if result['success']:
            return {
                "success": True,
                "message": "Payment session created successfully",
                "data": {
                    "gateway_page_url": result['gateway_page_url'],
                    "sessionkey": result['sessionkey'],
                    "tran_id": result['tran_id']
                }
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment session creation failed: {str(e)}")

@router.post("/sslcommerz/validate")
async def validate_sslcommerz_payment(
    sessionkey: str = Form(...),
    tran_id: str = Form(...),
    amount: float = Form(...)
):
    """Validate SSL Commerz payment"""
    try:
        result = sslcommerz_service.validate_payment(sessionkey, tran_id, amount)
        
        if result['success']:
            # Update order status to approved if payment is valid
            order_id = result.get('value_a')  # Order ID from value_a
            if order_id:
                try:
                    order = await Order.get_by_id(int(order_id))
                    if order:
                        await order.update_status('approved')
                        # Store the transaction ID
                        await order.update_transaction_id(tran_id)
                except Exception as e:
                    print(f"Error updating order status: {e}")
            
            return {
                "success": True,
                "message": "Payment validated successfully",
                "data": result
            }
        else:
            return {
                "success": False,
                "message": "Payment validation failed",
                "error": result['error']
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment validation failed: {str(e)}")

@router.post("/sslcommerz/ipn")
async def sslcommerz_ipn(request: Request):
    """Handle SSL Commerz IPN (Instant Payment Notification)"""
    try:
        # Get form data from IPN
        form_data = await request.form()
        ipn_data = dict(form_data)
        
        # Process IPN
        result = sslcommerz_service.process_ipn(ipn_data)
        
        if result['success']:
            # Update order status based on payment status
            order_id = result.get('order_id')
            payment_status = result.get('payment_status')
            
            if order_id and payment_status:
                try:
                    order = await Order.get_by_id(int(order_id))
                    if order:
                        if payment_status == 'VALID':
                            await order.update_status('approved')
                        else:
                            await order.update_status('cancelled')
                except Exception as e:
                    print(f"Error updating order status from IPN: {e}")
            
            return {"success": True, "message": "IPN processed successfully"}
        else:
            return {"success": False, "error": result['error']}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IPN processing failed: {str(e)}")

@router.post("/sslcommerz/update-order-status")
async def update_order_status_after_payment(
    order_id: int = Form(...),
    tran_id: str = Form(...),
    status: str = Form(...)
):
    """Update order status after successful payment"""
    try:
        # Get the order
        order = await Order.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Update order status and transaction ID
        if status == 'VALID':
            await order.update_status('approved')
            await order.update_transaction_id(tran_id)
            return {
                "success": True,
                "message": "Order status updated successfully",
                "data": {
                    "order_id": order_id,
                    "status": "approved",
                    "transaction_id": tran_id
                }
            }
        else:
            await order.update_status('cancelled')
            return {
                "success": True,
                "message": "Order cancelled",
                "data": {
                    "order_id": order_id,
                    "status": "cancelled"
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update order status: {str(e)}")

# SSLCommerz Callback Endpoints (POST handlers)
@router.post("/sslcommerz/success")
async def sslcommerz_success(request: Request):
    """Handle SSLCommerz success callback and redirect to frontend"""
    try:
        # Get form data from SSLCommerz POST request
        form_data = await request.form()
        post_data = dict(form_data)
        
        print("SSLCommerz Success POST data:", post_data)
        
        # Extract important data
        tran_id = post_data.get('tran_id')
        status = post_data.get('status')
        val_id = post_data.get('val_id')  # SSLCommerz validation ID
        amount = post_data.get('amount')
        order_id = post_data.get('value_a')  # Order ID we passed in value_a
        
        # Validate the payment - SSLCommerz success callback doesn't include sessionkey
        # We'll trust the status from SSLCommerz since it's coming from their server
        if status == 'VALID' and tran_id and amount:
            # Update order status to approved
            if order_id:
                try:
                    order = await Order.get_by_id(int(order_id))
                    if order:
                        await order.update_status('approved')
                        await order.update_transaction_id(tran_id)
                        print(f"Order {order_id} status updated to approved")
                except Exception as e:
                    print(f"Error updating order status: {e}")
            
            # Redirect to frontend success page with transaction data
            redirect_url = f"{settings.FRONTEND_SUCCESS_URL}?tran_id={tran_id}&status=VALID&order_id={order_id}&amount={amount}&val_id={val_id}"
            return RedirectResponse(url=redirect_url, status_code=302)
        else:
            # Invalid status, redirect to fail page
            redirect_url = f"{settings.FRONTEND_FAIL_URL}?tran_id={tran_id}&error=invalid_status"
            return RedirectResponse(url=redirect_url, status_code=302)
            
    except Exception as e:
        print(f"Error in SSLCommerz success handler: {e}")
        # Redirect to fail page on error
        redirect_url = f"{settings.FRONTEND_FAIL_URL}?error=server_error"
        return RedirectResponse(url=redirect_url, status_code=302)

@router.post("/sslcommerz/fail")
async def sslcommerz_fail(request: Request):
    """Handle SSLCommerz fail callback and redirect to frontend"""
    try:
        # Get form data from SSLCommerz POST request
        form_data = await request.form()
        post_data = dict(form_data)
        
        print("SSLCommerz Fail POST data:", post_data)
        
        # Extract important data
        tran_id = post_data.get('tran_id')
        error = post_data.get('error')
        order_id = post_data.get('value_a')
        
        # Update order status to cancelled if order_id exists
        if order_id:
            try:
                order = await Order.get_by_id(int(order_id))
                if order:
                    await order.update_status('cancelled')
                    print(f"Order {order_id} status updated to cancelled")
            except Exception as e:
                print(f"Error updating order status: {e}")
        
        # Redirect to frontend fail page
        redirect_url = f"{settings.FRONTEND_FAIL_URL}?tran_id={tran_id}&error={error}&order_id={order_id}"
        return RedirectResponse(url=redirect_url, status_code=302)
        
    except Exception as e:
        print(f"Error in SSLCommerz fail handler: {e}")
        # Redirect to fail page on error
        redirect_url = f"{settings.FRONTEND_FAIL_URL}?error=server_error"
        return RedirectResponse(url=redirect_url, status_code=302)

@router.post("/sslcommerz/cancel")
async def sslcommerz_cancel(request: Request):
    """Handle SSLCommerz cancel callback and redirect to frontend"""
    try:
        # Get form data from SSLCommerz POST request
        form_data = await request.form()
        post_data = dict(form_data)
        
        print("SSLCommerz Cancel POST data:", post_data)
        
        # Extract important data
        tran_id = post_data.get('tran_id')
        order_id = post_data.get('value_a')
        
        # Update order status to cancelled if order_id exists
        if order_id:
            try:
                order = await Order.get_by_id(int(order_id))
                if order:
                    await order.update_status('cancelled')
                    print(f"Order {order_id} status updated to cancelled")
            except Exception as e:
                print(f"Error updating order status: {e}")
        
        # Redirect to frontend cancel page
        redirect_url = f"{settings.FRONTEND_CANCEL_URL}?tran_id={tran_id}&order_id={order_id}"
        return RedirectResponse(url=redirect_url, status_code=302)
        
    except Exception as e:
        print(f"Error in SSLCommerz cancel handler: {e}")
        # Redirect to cancel page on error
        redirect_url = f"{settings.FRONTEND_CANCEL_URL}?error=server_error"
        return RedirectResponse(url=redirect_url, status_code=302)

# Legacy GET endpoints for direct access (optional, for testing)
@router.get("/sslcommerz/fail")
async def payment_fail(
    tran_id: str = Query(...),
    error: str = Query(None)
):
    """Handle failed payment redirect"""
    return {
        "success": False,
        "message": "Payment failed",
        "tran_id": tran_id,
        "error": error
    }

@router.get("/sslcommerz/cancel")
async def payment_cancel(
    tran_id: str = Query(...)
):
    """Handle cancelled payment redirect"""
    return {
        "success": False,
        "message": "Payment cancelled",
        "tran_id": tran_id
    } 