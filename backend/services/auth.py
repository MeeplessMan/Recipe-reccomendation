"""
Authentication Service
Handles user authentication using Supabase Auth
"""
import jwt
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from supabase import Client
import logging

logger = logging.getLogger(__name__)

class AuthService:
    """Service class for authentication operations"""
    
    def __init__(self, supabase_client: Client, jwt_secret: str, jwt_algorithm: str = 'HS256'):
        """Initialize authentication service"""
        self.supabase = supabase_client
        self.jwt_secret = jwt_secret
        self.jwt_algorithm = jwt_algorithm
        # Store Supabase config for creating new instances when needed
        self.supabase_url = supabase_client.supabase_url
        self.supabase_key = supabase_client.supabase_key
    
    def register_user(self, email: str, password: str, 
                          additional_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Register a new user"""
        try:
            # Create user with Supabase Auth
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": additional_data or {}
                }
            })
            
            if response.user:
                return {
                    'success': True, 
                    'user': response.user,
                    'session': response.session
                }
            else:
                return {
                    'success': False, 
                    'error': 'Failed to create user account'
                }
                
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Login user with email and password"""
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user and response.session:
                # Generate our own JWT token for API access
                token = self._generate_jwt_token(response.user.id, email)
                
                return {
                    'success': True,
                    'user': response.user,
                    'session': response.session,
                    'access_token': token
                }
            else:
                return {
                    'success': False,
                    'error': 'Invalid credentials'
                }
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def logout_user(self, access_token: str) -> Dict[str, Any]:
        """Logout user"""
        try:
            # Set session from token
            self.supabase.auth.set_session(access_token, refresh_token=None)
            
            # Sign out from Supabase
            response = self.supabase.auth.sign_out()
            
            return {'success': True}
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh access token"""
        try:
            response = self.supabase.auth.refresh_session(refresh_token)
            
            if response.session:
                # Generate new JWT token
                token = self._generate_jwt_token(response.user.id, response.user.email)
                
                return {
                    'success': True,
                    'session': response.session,
                    'access_token': token
                }
            else:
                return {
                    'success': False,
                    'error': 'Failed to refresh token'
                }
                
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_current_user(self, access_token: str) -> Dict[str, Any]:
        """Get current user from token"""
        try:
            # Decode JWT token
            payload = jwt.decode(access_token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            user_id = payload.get('user_id')
            
            if user_id:
                # Get user from Supabase
                response = self.supabase.auth.get_user(access_token)
                
                if response.user:
                    return {
                        'success': True,
                        'user': response.user
                    }
                else:
                    return {
                        'success': False,
                        'error': 'User not found'
                    }
            else:
                return {
                    'success': False,
                    'error': 'Invalid token'
                }
                
        except jwt.ExpiredSignatureError:
            return {'success': False, 'error': 'Token expired'}
        except jwt.InvalidTokenError:
            return {'success': False, 'error': 'Invalid token'}
        except Exception as e:
            logger.error(f"Get user error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def reset_password(self, email: str) -> Dict[str, Any]:
        """Send password reset email"""
        try:
            # Configure redirect URL for password reset
            redirect_url = "http://localhost:3000/reset-password"
            
            logger.info(f"Sending password reset email to {email} with redirect to {redirect_url}")
            
            response = self.supabase.auth.reset_password_email(
                email, 
                options={
                    "redirect_to": redirect_url
                }
            )
            
            logger.info(f"Password reset email sent successfully to {email}")
            return {'success': True, 'message': 'Password reset email sent'}
            
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def update_password_with_reset_token(self, reset_token: str, new_password: str) -> Dict[str, Any]:
        """Update user password using Supabase reset token"""
        try:
            logger.info(f"Attempting password update with reset token: {reset_token[:20]}...")
            
            # For password reset, we need to use the token directly with Supabase
            # The reset token is not a JWT - it's a Supabase-specific token
            try:
                # First, verify the token by setting a temporary session
                session_response = self.supabase.auth.set_session(reset_token, reset_token)
                logger.info("Session established with reset token")
                
                if not session_response.user:
                    logger.error("No user found with reset token")
                    return {'success': False, 'error': 'Invalid or expired reset token'}
                
                # Update the password while the session is active
                update_response = self.supabase.auth.update_user({
                    "password": new_password
                })
                
                if update_response.user:
                    logger.info(f"Password updated successfully for user: {update_response.user.email}")
                    return {'success': True, 'message': 'Password updated successfully'}
                else:
                    logger.error("Password update failed - no user returned")
                    return {'success': False, 'error': 'Failed to update password'}
                    
            except Exception as supabase_error:
                logger.error(f"Supabase password update error: {str(supabase_error)}")
                
                # Check for specific error types
                error_msg = str(supabase_error).lower()
                if any(keyword in error_msg for keyword in ['invalid', 'expired', 'signature', 'token']):
                    return {'success': False, 'error': 'Invalid or expired reset token. Please request a new password reset.'}
                else:
                    return {'success': False, 'error': f'Failed to update password: {str(supabase_error)}'}
                
        except Exception as e:
            logger.error(f"Password update error: {str(e)}")
            return {'success': False, 'error': 'Failed to update password. Please try again.'}

    def update_password(self, access_token: str, new_password: str) -> Dict[str, Any]:
        """Update user password - legacy method, redirects to reset token method"""
        return self.update_password_with_reset_token(access_token, new_password)
    
    def _generate_jwt_token(self, user_id: str, email: str, 
                           expires_in_hours: int = 24) -> str:
        """Generate JWT token for API access"""
        try:
            payload = {
                'user_id': user_id,
                'email': email,
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(hours=expires_in_hours)
            }
            
            token = jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
            return token
            
        except Exception as e:
            logger.error(f"JWT generation error: {str(e)}")
            raise e
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT token")
            return None
        except Exception as e:
            logger.error(f"JWT verification error: {str(e)}")
            return None