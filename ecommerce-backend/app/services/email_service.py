import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from datetime import datetime

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@yourstore.com')
        self.store_name = os.getenv('STORE_NAME', 'Your Store')

    def send_shipping_notification(self, customer_email: str, customer_name: str, 
                                  order_id: str, courier_service: str, tracking_id: str,
                                  estimated_delivery: Optional[str] = None) -> bool:
        """Send shipping notification email to customer"""
        try:
            subject = f"Your Order #{order_id} Has Been Shipped! 🚚"
            
            # Create HTML email content
            html_content = self._create_shipping_email_html(
                customer_name, order_id, courier_service, tracking_id, estimated_delivery
            )
            
            # Create plain text version
            text_content = self._create_shipping_email_text(
                customer_name, order_id, courier_service, tracking_id, estimated_delivery
            )
            
            return self._send_email(customer_email, subject, html_content, text_content)
            
        except Exception as e:
            print(f"Error sending shipping notification email: {e}")
            return False

    def send_delivery_notification(self, customer_email: str, customer_name: str, 
                                  order_id: str, delivery_date: str = None) -> bool:
        """Send delivery notification email to customer"""
        try:
            subject = f"Your Order #{order_id} Has Been Delivered! 📦"
            
            # Create HTML email content
            html_content = self._create_delivery_email_html(
                customer_name, order_id, delivery_date
            )
            
            # Create plain text version
            text_content = self._create_delivery_email_text(
                customer_name, order_id, delivery_date
            )
            
            return self._send_email(customer_email, subject, html_content, text_content)
            
        except Exception as e:
            print(f"Error sending delivery notification email: {e}")
            return False

    def _create_shipping_email_html(self, customer_name: str, order_id: str, 
                                   courier_service: str, tracking_id: str,
                                   estimated_delivery: Optional[str] = None) -> str:
        """Create HTML email content for shipping notification"""
        delivery_info = f"<p><strong>Estimated Delivery:</strong> {estimated_delivery}</p>" if estimated_delivery else ""
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Shipped - {self.store_name}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #9DC08B 0%, #40513B 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .shipping-info {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #9DC08B;
                }}
                .tracking-box {{
                    background: #e8f5e8;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                }}
                .button {{
                    display: inline-block;
                    background: #9DC08B;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🚚 Your Order Has Been Shipped!</h1>
                <p>Great news! Your order is on its way to you.</p>
            </div>
            
            <div class="content">
                <h2>Hello {customer_name},</h2>
                
                <p>We're excited to let you know that your order <strong>#{order_id}</strong> has been shipped and is on its way to you!</p>
                
                <div class="shipping-info">
                    <h3>📦 Shipping Details</h3>
                    <p><strong>Courier Service:</strong> {courier_service}</p>
                    <p><strong>Tracking ID:</strong> {tracking_id}</p>
                    {delivery_info}
                </div>
                
                <div class="tracking-box">
                    <h4>🔍 Track Your Package</h4>
                    <p>You can track your package using the tracking ID above on the courier service's website.</p>
                    <p><strong>Tracking ID:</strong> <code>{tracking_id}</code></p>
                </div>
                
                <p>We'll send you another email once your package has been delivered.</p>
                
                <p>If you have any questions about your order, please don't hesitate to contact our customer support team.</p>
                
                <p>Thank you for choosing {self.store_name}!</p>
                
                <div class="footer">
                    <p>Best regards,<br>The {self.store_name} Team</p>
                    <p><small>This email was sent on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</small></p>
                </div>
            </div>
        </body>
        </html>
        """

    def _create_shipping_email_text(self, customer_name: str, order_id: str, 
                                   courier_service: str, tracking_id: str,
                                   estimated_delivery: Optional[str] = None) -> str:
        """Create plain text email content for shipping notification"""
        delivery_info = f"\nEstimated Delivery: {estimated_delivery}" if estimated_delivery else ""
        
        return f"""
        Your Order Has Been Shipped! 🚚

        Hello {customer_name},

        Great news! Your order #{order_id} has been shipped and is on its way to you!

        Shipping Details:
        - Courier Service: {courier_service}
        - Tracking ID: {tracking_id}{delivery_info}

        Track Your Package:
        You can track your package using the tracking ID above on the courier service's website.

        We'll send you another email once your package has been delivered.

        If you have any questions about your order, please don't hesitate to contact our customer support team.

        Thank you for choosing {self.store_name}!

        Best regards,
        The {self.store_name} Team

        This email was sent on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        """

    def _create_delivery_email_html(self, customer_name: str, order_id: str, 
                                   delivery_date: Optional[str] = None) -> str:
        """Create HTML email content for delivery notification"""
        delivery_info = f"<p><strong>Delivery Date:</strong> {delivery_date}</p>" if delivery_date else ""
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Delivered - {self.store_name}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .delivery-info {{
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #28a745;
                }}
                .success-box {{
                    background: #d4edda;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 15px 0;
                    border: 1px solid #c3e6cb;
                }}
                .button {{
                    display: inline-block;
                    background: #28a745;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 10px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📦 Your Order Has Been Delivered!</h1>
                <p>Your package has arrived safely at your doorstep.</p>
            </div>
            
            <div class="content">
                <h2>Hello {customer_name},</h2>
                
                <p>Great news! Your order <strong>#{order_id}</strong> has been successfully delivered to your address.</p>
                
                <div class="delivery-info">
                    <h3>🎉 Delivery Confirmation</h3>
                    <p><strong>Order ID:</strong> #{order_id}</p>
                    {delivery_info}
                    <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">✅ Delivered</span></p>
                </div>
                
                <div class="success-box">
                    <h4>📋 What's Next?</h4>
                    <ul>
                        <li>Please check your package for any damage</li>
                        <li>If you're satisfied with your order, consider leaving a review</li>
                        <li>Keep your order details for future reference</li>
                    </ul>
                </div>
                
                <p>If you have any issues with your delivery or need to return an item, please contact our customer support team within 24 hours.</p>
                
                <p>Thank you for choosing {self.store_name}! We hope you enjoy your purchase.</p>
                
                <div class="footer">
                    <p>Best regards,<br>The {self.store_name} Team</p>
                    <p><small>This email was sent on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</small></p>
                </div>
            </div>
        </body>
        </html>
        """

    def _create_delivery_email_text(self, customer_name: str, order_id: str, 
                                   delivery_date: Optional[str] = None) -> str:
        """Create plain text email content for delivery notification"""
        delivery_info = f"\nDelivery Date: {delivery_date}" if delivery_date else ""
        
        return f"""
        Your Order Has Been Delivered! 📦

        Hello {customer_name},

        Great news! Your order #{order_id} has been successfully delivered to your address.

        Delivery Confirmation:
        - Order ID: #{order_id}{delivery_info}
        - Status: ✅ Delivered

        What's Next?
        - Please check your package for any damage
        - If you're satisfied with your order, consider leaving a review
        - Keep your order details for future reference

        If you have any issues with your delivery or need to return an item, please contact our customer support team within 24 hours.

        Thank you for choosing {self.store_name}! We hope you enjoy your purchase.

        Best regards,
        The {self.store_name} Team

        This email was sent on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        """

    def _send_email(self, to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """Send email using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email

            # Attach both HTML and text versions
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            msg.attach(text_part)
            msg.attach(html_part)

            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                if self.smtp_username and self.smtp_password:
                    server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)

            print(f"Shipping notification email sent successfully to {to_email}")
            return True

        except Exception as e:
            print(f"Error sending email: {e}")
            return False

# Create global instance
email_service = EmailService() 