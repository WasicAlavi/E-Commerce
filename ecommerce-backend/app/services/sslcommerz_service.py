import requests
import hashlib
import json
from typing import Dict, Any, Optional
from app.config import settings
from app.utils.id_generator import id_generator

class SSLCommerzService:
    def __init__(self):
        self.store_id = settings.SSLCOMMERZ_STORE_ID
        self.store_password = settings.SSLCOMMERZ_STORE_PASSWORD
        self.sandbox = settings.SSLCOMMERZ_SANDBOX
        
        if self.sandbox:
            self.base_url = "https://sandbox.sslcommerz.com"
        else:
            self.base_url = "https://securepay.sslcommerz.com"
    
    def create_session(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a payment session with SSL Commerz"""
        
        # Generate secure transaction ID
        secure_tran_id = id_generator.generate_transaction_id()
        
        # Prepare the data for SSL Commerz
        post_data = {
            'store_id': self.store_id,
            'store_passwd': self.store_password,
            'total_amount': order_data['total_amount'],
            'currency': 'BDT',
            'tran_id': secure_tran_id,
            'product_category': 'general',
            'success_url': settings.SSLCOMMERZ_SUCCESS_URL,
            'fail_url': settings.SSLCOMMERZ_FAIL_URL,
            'cancel_url': settings.SSLCOMMERZ_CANCEL_URL,
            'ipn_url': settings.SSLCOMMERZ_IPN_URL,
            'cus_name': order_data['customer_name'],
            'cus_email': order_data['customer_email'],
            'cus_add1': order_data['customer_address'],
            'cus_city': order_data['customer_city'],
            'cus_postcode': order_data['customer_postcode'],
            'cus_country': 'Bangladesh',
            'cus_phone': order_data['customer_phone'],
            'shipping_method': 'NO',
            'num_of_item': len(order_data['items']),
            'product_name': order_data['product_name'],
            'product_profile': 'general',
            'value_a': str(order_data['order_id']),  # Order ID for tracking
            'value_b': order_data['customer_id'],
            'value_c': order_data['customer_email'],
            'value_d': order_data['customer_phone']
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/gwprocess/v4/api.php",
                data=post_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            print("SSLCommerz response:", response.text)
            print("SSLCommerz response JSON:", response.json() if response.status_code == 200 else "No JSON response")
            
            if response.status_code == 200:
                result = response.json()
                print("SSLCommerz result keys:", list(result.keys()) if isinstance(result, dict) else "Not a dict")
                if result.get('status') in ['VALID', 'SUCCESS']:
                    return {
                        'success': True,
                        'gateway_page_url': result.get('GatewayPageURL'),
                        'sessionkey': result.get('sessionkey'),
                        'tran_id': result.get('tran_id') or result.get('Tran_ID') or secure_tran_id
                    }
                else:
                    return {
                        'success': False,
                        'error': result.get('failedreason', 'Payment session creation failed')
                    }
            else:
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}: {response.text}'
                }
                
        except Exception as e:
            print("Exception in create_session:", str(e))
            return {
                'success': False,
                'error': f'Exception occurred: {str(e)}'
            }
    
    def validate_payment(self, sessionkey: str, tran_id: str, amount: float) -> Dict[str, Any]:
        """Validate payment after successful transaction"""
        
        # Create validation data
        validation_data = {
            'store_id': self.store_id,
            'store_passwd': self.store_password,
            'sessionkey': sessionkey,
            'tran_id': tran_id,
            'amount': amount,
            'currency': 'BDT'
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/validator/api/validationserverAPI.php",
                data=validation_data,
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'VALID':
                    return {
                        'success': True,
                        'payment_status': 'VALID',
                        'tran_id': result.get('tran_id'),
                        'amount': result.get('amount'),
                        'currency': result.get('currency'),
                        'card_type': result.get('card_type'),
                        'card_no': result.get('card_no'),
                        'bank_tran_id': result.get('bank_tran_id'),
                        'card_issuer': result.get('card_issuer'),
                        'card_brand': result.get('card_brand'),
                        'card_sub_brand': result.get('card_sub_brand'),
                        'card_issuer_country': result.get('card_issuer_country'),
                        'card_issuer_country_code': result.get('card_issuer_country_code'),
                        'store_amount': result.get('store_amount'),
                        'currency_rate': result.get('currency_rate'),
                        'base_fair': result.get('base_fair'),
                        'value_a': result.get('value_a'),
                        'value_b': result.get('value_b'),
                        'value_c': result.get('value_c'),
                        'value_d': result.get('value_d')
                    }
                else:
                    return {
                        'success': False,
                        'error': result.get('errorMessage', 'Payment validation failed')
                    }
            else:
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}: {response.text}'
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f'Exception occurred: {str(e)}'
            }
    
    def process_ipn(self, ipn_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process Instant Payment Notification (IPN) from SSL Commerz"""
        
        # Verify the IPN data
        if not self._verify_ipn_signature(ipn_data):
            return {
                'success': False,
                'error': 'Invalid IPN signature'
            }
        
        # Extract order information
        order_id = ipn_data.get('value_a')  # Order ID we passed in value_a
        tran_id = ipn_data.get('tran_id')
        status = ipn_data.get('status')
        amount = ipn_data.get('amount')
        
        return {
            'success': True,
            'order_id': order_id,
            'tran_id': tran_id,
            'status': status,
            'amount': amount,
            'payment_status': 'VALID' if status == 'VALID' else 'FAILED'
        }
    
    def _verify_ipn_signature(self, ipn_data: Dict[str, Any]) -> bool:
        """Verify IPN signature for security"""
        # This is a simplified verification
        # In production, you should implement proper signature verification
        return True

# Create a singleton instance
sslcommerz_service = SSLCommerzService() 