"""
Authentication API Routes
"""
from flask import Blueprint, request, jsonify
from services.auth import AuthService
from services.database import SupabaseService
from utils.helpers import validate_email, validate_password
import logging

logger = logging.getLogger(__name__)

def create_auth_routes(auth_service: AuthService, db_service: SupabaseService) -> Blueprint:
    """Create authentication routes blueprint"""
    
    auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
    
    @auth_bp.route('/register', methods=['POST'])
    def register():
        """Register new user"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['email', 'password', 'username']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'Missing field: {field}'}), 400
            
            email = data['email'].lower().strip()
            password = data['password']
            username = data['username'].strip()
            
            # Validate email
            if not validate_email(email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Validate password
            password_validation = validate_password(password)
            if not password_validation['is_valid']:
                return jsonify({
                    'error': 'Invalid password',
                    'details': password_validation['errors']
                }), 400
            
            # Additional user data
            additional_data = {
                'username': username,
                'skill_level': data.get('skill_level', 'beginner'),
                'dietary_restrictions': data.get('dietary_restrictions', [])
            }
            
            # Register with auth service
            auth_result = auth_service.register_user(email, password, additional_data)
            
            if auth_result['success']:
                # Try to create user profile in database (optional for now due to RLS policies)
                user_data = {
                    'user_id': auth_result['user'].id,
                    'username': username,
                    'email': email,
                    'skill_level': additional_data['skill_level'],
                    'dietary_restrictions': additional_data['dietary_restrictions']
                }
                
                profile_result = db_service.create_user_profile(user_data)
                
                # Registration succeeds even if profile creation fails (due to RLS policies)
                if not profile_result['success']:
                    logger.warning(f"Profile creation failed (RLS policy): {profile_result['error']}")
                
                return jsonify({
                    'message': 'User registered successfully',
                    'user': {
                        'id': auth_result['user'].id,
                        'email': auth_result['user'].email,
                        'username': username
                    }
                }), 201
            else:
                return jsonify({'error': auth_result['error']}), 400
                
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @auth_bp.route('/login', methods=['POST'])
    def login():
        """Login user"""
        try:
            data = request.get_json()
            
            # Validate required fields
            if 'email' not in data or 'password' not in data:
                return jsonify({'error': 'Email and password required'}), 400
            
            email = data['email'].lower().strip()
            password = data['password']
            
            # Login with auth service
            auth_result = auth_service.login_user(email, password)
            
            if auth_result['success']:
                # Get user profile
                profile_result = db_service.get_user_profile(auth_result['user'].id)
                
                response_data = {
                    'message': 'Login successful',
                    'access_token': auth_result['access_token'],
                    'user': {
                        'id': auth_result['user'].id,
                        'email': auth_result['user'].email
                    }
                }
                
                # Add profile data if available
                if profile_result['success'] and profile_result['data']:
                    response_data['user'].update({
                        'username': profile_result['data'].get('username'),
                        'skill_level': profile_result['data'].get('skill_level'),
                        'dietary_restrictions': profile_result['data'].get('dietary_restrictions', [])
                    })
                
                return jsonify(response_data), 200
            else:
                return jsonify({'error': auth_result['error']}), 401
                
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @auth_bp.route('/logout', methods=['POST'])
    def logout():
        """Logout user"""
        try:
            # Get token from header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'No valid token provided'}), 401
            
            token = auth_header.split(' ')[1]
            
            # Logout with auth service
            auth_result = auth_service.logout_user(token)
            
            if auth_result['success']:
                return jsonify({'message': 'Logout successful'}), 200
            else:
                return jsonify({'error': auth_result['error']}), 400
                
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @auth_bp.route('/me', methods=['GET'])
    def get_current_user():
        """Get current user profile"""
        try:
            # Get token from header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'No valid token provided'}), 401
            
            token = auth_header.split(' ')[1]
            
            # Get current user
            auth_result = auth_service.get_current_user(token)
            
            if auth_result['success']:
                # Get user profile
                profile_result = db_service.get_user_profile(auth_result['user'].id)
                
                user_data = {
                    'id': auth_result['user'].id,
                    'email': auth_result['user'].email
                }
                
                # Add profile data if available
                if profile_result['success'] and profile_result['data']:
                    user_data.update({
                        'username': profile_result['data'].get('username'),
                        'skill_level': profile_result['data'].get('skill_level'),
                        'dietary_restrictions': profile_result['data'].get('dietary_restrictions', []),
                        'created_at': profile_result['data'].get('created_at')
                    })
                
                return jsonify({'user': user_data}), 200
            else:
                return jsonify({'error': auth_result['error']}), 401
                
        except Exception as e:
            logger.error(f"Get current user error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @auth_bp.route('/reset-password', methods=['POST'])
    def reset_password():
        """Send password reset email"""
        try:
            data = request.get_json()
            
            if 'email' not in data:
                return jsonify({'error': 'Email required'}), 400
            
            email = data['email'].lower().strip()
            
            # Validate email
            if not validate_email(email):
                return jsonify({'error': 'Invalid email format'}), 400
            
            # Send reset email
            auth_result = auth_service.reset_password(email)
            
            if auth_result['success']:
                return jsonify({'message': 'Password reset email sent'}), 200
            else:
                return jsonify({'error': auth_result['error']}), 400
                
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @auth_bp.route('/confirm-password-reset', methods=['POST'])
    def confirm_password_reset():
        """Confirm password reset with token and new password"""
        try:
            data = request.get_json()
            
            if 'access_token' not in data or 'password' not in data:
                return jsonify({'error': 'Access token and password required'}), 400
            
            access_token = data['access_token']
            new_password = data['password']
            
            # Validate password strength
            if len(new_password) < 8:
                return jsonify({'error': 'Password must be at least 8 characters long'}), 400
            
            # Additional password complexity validation
            import re
            if not re.search(r'[a-z]', new_password):
                return jsonify({'error': 'Password must contain at least one lowercase letter'}), 400
            if not re.search(r'[A-Z]', new_password):
                return jsonify({'error': 'Password must contain at least one uppercase letter'}), 400
            if not re.search(r'\d', new_password):
                return jsonify({'error': 'Password must contain at least one number'}), 400
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', new_password):
                return jsonify({'error': 'Password must contain at least one special character'}), 400
            
            # Update password using the access token from email link
            auth_result = auth_service.update_password(access_token, new_password)
            
            if auth_result['success']:
                return jsonify({'message': 'Password updated successfully'}), 200
            else:
                return jsonify({'error': auth_result['error']}), 400
                
        except Exception as e:
            logger.error(f"Password reset confirmation error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @auth_bp.route('/update-profile', methods=['PUT'])
    def update_profile():
        """Update user profile"""
        try:
            # Get token from header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'No valid token provided'}), 401
            
            token = auth_header.split(' ')[1]
            
            # Verify token and get user
            payload = auth_service.verify_jwt_token(token)
            if not payload:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            user_id = payload['user_id']
            data = request.get_json()
            
            # Prepare update data
            update_data = {}
            allowed_fields = ['username', 'skill_level', 'dietary_restrictions']
            
            for field in allowed_fields:
                if field in data:
                    update_data[field] = data[field]
            
            if not update_data:
                return jsonify({'error': 'No valid fields to update'}), 400
            
            # Update profile
            result = db_service.update_user_profile(user_id, update_data)
            
            if result['success']:
                return jsonify({
                    'message': 'Profile updated successfully',
                    'data': result['data']
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

    @auth_bp.route('/allergies', methods=['GET'])
    def get_allergies():
        """Get user allergies"""
        try:
            # Get token from header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'No valid token provided'}), 401
            
            token = auth_header.split(' ')[1]
            
            # Verify token and get user
            payload = auth_service.verify_jwt_token(token)
            if not payload:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            user_id = payload['user_id']
            
            # Get allergies
            result = db_service.get_user_allergies(user_id)
            
            if result['success']:
                return jsonify({
                    'allergies': result['data']
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Get allergies error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

    @auth_bp.route('/allergies', methods=['POST'])
    def add_allergy():
        """Add user allergy"""
        try:
            # Get token from header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'No valid token provided'}), 401
            
            token = auth_header.split(' ')[1]
            
            # Verify token and get user
            payload = auth_service.verify_jwt_token(token)
            if not payload:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            user_id = payload['user_id']
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['ingredient_id', 'severity']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'Missing field: {field}'}), 400
            
            allergy_data = {
                'ingredient_id': data['ingredient_id'],
                'severity': data['severity'],
                'symptoms': data.get('symptoms', '')
            }
            
            # Add allergy
            result = db_service.add_user_allergy(user_id, allergy_data)
            
            if result['success']:
                return jsonify({
                    'message': 'Allergy added successfully',
                    'data': result['data']
                }), 201
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Add allergy error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

    @auth_bp.route('/allergies/<int:allergy_id>', methods=['DELETE'])
    def remove_allergy(allergy_id):
        """Remove user allergy"""
        try:
            # Get token from header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'No valid token provided'}), 401
            
            token = auth_header.split(' ')[1]
            
            # Verify token and get user
            payload = auth_service.verify_jwt_token(token)
            if not payload:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            user_id = payload['user_id']
            
            # Remove allergy
            result = db_service.remove_user_allergy(user_id, allergy_id)
            
            if result['success']:
                return jsonify({
                    'message': 'Allergy removed successfully'
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Remove allergy error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

    @auth_bp.route('/delete-account', methods=['DELETE'])
    def delete_account():
        """Delete user account"""
        try:
            # Get token from header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'No valid token provided'}), 401
            
            token = auth_header.split(' ')[1]
            
            # Verify token and get user
            payload = auth_service.verify_jwt_token(token)
            if not payload:
                return jsonify({'error': 'Invalid or expired token'}), 401
            
            user_id = payload['user_id']
            data = request.get_json()
            
            # Require password confirmation for account deletion
            if 'password' not in data:
                return jsonify({'error': 'Password confirmation required'}), 400
            
            # Verify password before deletion
            auth_result = auth_service.get_current_user(token)
            if not auth_result['success']:
                return jsonify({'error': 'Could not verify user'}), 401
            
            # Attempt to verify password by trying to login
            email = auth_result['user'].email
            login_result = auth_service.login_user(email, data['password'])
            
            if not login_result['success']:
                return jsonify({'error': 'Invalid password'}), 401
            
            # Delete user account from database
            result = db_service.delete_user_account(user_id)
            
            if result['success']:
                # Also delete from auth service (Supabase auth)
                try:
                    auth_service.delete_user(user_id)
                except Exception as e:
                    logger.warning(f"Could not delete from auth service: {str(e)}")
                
                return jsonify({
                    'message': 'Account deleted successfully'
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Delete account error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    return auth_bp