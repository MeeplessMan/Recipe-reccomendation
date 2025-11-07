"""
Scan API Routes
Handles fridge scanning and ingredient detection
"""
from flask import Blueprint, request, jsonify
from werkzeug.datastructures import FileStorage
from services.ai_model import AIModelService
from services.database import SupabaseService
from services.auth import AuthService
from utils.helpers import save_uploaded_file, generate_scan_filename, format_ingredient_name
import logging
import os
from datetime import datetime

logger = logging.getLogger(__name__)

def create_scan_routes(ai_service: AIModelService, db_service: SupabaseService, 
                      auth_service: AuthService, upload_folder: str) -> Blueprint:
    """Create scan routes blueprint"""
    
    scan_bp = Blueprint('scan', __name__, url_prefix='/api/scan')
    
    def verify_token_middleware():
        """Middleware to verify JWT token"""
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        payload = auth_service.verify_jwt_token(token)
        return payload
    
    @scan_bp.route('/upload', methods=['POST'])
    def scan_upload():
        """Upload and scan fridge image"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            
            # Check if file is present
            if 'image' not in request.files:
                return jsonify({'error': 'No image file provided'}), 400
            
            file = request.files['image']
            if file.filename == '':
                return jsonify({'error': 'No image file selected'}), 400
            
            # Generate unique filename
            custom_filename = generate_scan_filename(user_id)
            
            # Save uploaded file
            file_path = save_uploaded_file(file, upload_folder, custom_filename.rsplit('.', 1)[0])
            
            if not file_path:
                return jsonify({'error': 'Failed to save uploaded image'}), 500
            
            # Check if AI model is loaded
            if not ai_service.is_model_loaded():
                return jsonify({'error': 'AI model not available'}), 503
            
            # Preprocess image for better results
            processed_path = ai_service.preprocess_image(file_path)
            prediction_path = processed_path if processed_path else file_path
            
            # Run AI prediction
            predictions = ai_service.predict_ingredients(prediction_path)
            
            # Create fridge scan record
            scan_data = {
                'user_id': user_id,
                'image_url': file_path,
                'ai_confidence': max([p['confidence'] for p in predictions], default=0.0),
                'scanned_at': datetime.utcnow().isoformat()
            }
            
            scan_result = db_service.create_fridge_scan(scan_data)
            
            if not scan_result['success']:
                logger.error(f"Failed to create scan record: {scan_result['error']}")
                return jsonify({'error': 'Failed to save scan results'}), 500
            
            scan_id = scan_result['data']['scan_id']
            
            # Process and save detected ingredients
            detected_ingredients = []
            for prediction in predictions:
                # Get ingredient ID from database
                ingredient_result = db_service.get_ingredient_by_name(
                    format_ingredient_name(prediction['class_name'])
                )
                
                if ingredient_result['success'] and ingredient_result['data']:
                    ingredient_id = ingredient_result['data']['ingredient_id']
                    detected_ingredients.append({
                        'ingredient_id': ingredient_id,
                        'confidence': prediction['confidence'],
                        'quantity': 'unknown',  # Could be enhanced with quantity detection
                        'freshness': 'good'     # Could be enhanced with freshness detection
                    })
            
            # Save detected ingredients
            if detected_ingredients:
                ingredients_result = db_service.save_detected_ingredients(
                    scan_id, detected_ingredients
                )
                
                if not ingredients_result['success']:
                    logger.error(f"Failed to save detected ingredients: {ingredients_result['error']}")
            
            # Clean up processed image if it was created
            if processed_path and processed_path != file_path:
                try:
                    os.remove(processed_path)
                except Exception as e:
                    logger.warning(f"Failed to clean up processed image: {str(e)}")
            
            # Format response
            response_data = {
                'scan_id': scan_id,
                'detected_ingredients': [
                    {
                        'name': format_ingredient_name(p['class_name']),
                        'confidence': p['confidence'],
                        'class_id': p['class_id']
                    }
                    for p in predictions
                ],
                'total_detected': len(predictions),
                'scan_timestamp': scan_data['scanned_at']
            }
            
            return jsonify(response_data), 200
            
        except Exception as e:
            logger.error(f"Scan upload error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @scan_bp.route('/history', methods=['GET'])
    def get_scan_history():
        """Get user's scan history"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            
            # Get query parameters
            limit = request.args.get('limit', 20, type=int)
            limit = min(limit, 100)  # Max 100 records
            
            # Get scan history
            result = db_service.get_user_scan_history(user_id, limit)
            
            if result['success']:
                # Format response
                scans = []
                for scan in result['data']:
                    ingredients = [
                        {
                            'name': detection['ingredients']['name'],
                            'confidence': detection['confidence'],
                            'quantity': detection.get('quantity'),
                            'freshness': detection.get('freshness')
                        }
                        for detection in scan.get('detected_ingredients', [])
                    ]
                    
                    scans.append({
                        'scan_id': scan['scan_id'],
                        'scanned_at': scan['scanned_at'],
                        'ingredients_count': len(ingredients),
                        'ingredients': ingredients,
                        'ai_confidence': scan.get('ai_confidence')
                    })
                
                return jsonify({
                    'scans': scans,
                    'total': len(scans)
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Scan history error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @scan_bp.route('/fridge-contents', methods=['GET'])
    def get_fridge_contents():
        """Get user's current fridge contents"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            
            # Get fridge contents
            result = db_service.get_user_fridge_contents(user_id)
            
            if result['success']:
                return jsonify({
                    'ingredients': result['data'],
                    'total': len(result['data'])
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Fridge contents error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @scan_bp.route('/model-info', methods=['GET'])
    def get_model_info():
        """Get AI model information"""
        try:
            model_info = ai_service.get_model_info()
            return jsonify(model_info), 200
            
        except Exception as e:
            logger.error(f"Model info error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @scan_bp.route('/live-scan', methods=['POST'])
    def live_scan():
        """Process live camera frame for ingredient detection"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            
            # Check if image data is present
            if 'image' not in request.files:
                return jsonify({'error': 'No image data provided'}), 400
            
            file = request.files['image']
            if file.filename == '':
                return jsonify({'error': 'No image data'}), 400
            
            # Check if AI model is loaded
            if not ai_service.is_model_loaded():
                return jsonify({'error': 'AI model not available'}), 503
            
            # Generate temporary filename for live scan
            temp_filename = f"live_scan_{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
            
            # Save temporary file
            file_path = save_uploaded_file(file, upload_folder, temp_filename)
            
            if not file_path:
                return jsonify({'error': 'Failed to process image'}), 500
            
            try:
                # Preprocess image for better results
                processed_path = ai_service.preprocess_image(file_path)
                prediction_path = processed_path if processed_path else file_path
                
                # Run AI prediction
                predictions = ai_service.predict_ingredients(prediction_path)
                
                # Format response for live scanning (no database storage for performance)
                detected_ingredients = []
                for prediction in predictions:
                    detected_ingredients.append({
                        'name': format_ingredient_name(prediction['class_name']),
                        'confidence': prediction['confidence'],
                        'class_id': prediction['class_id'],
                        'bbox': prediction.get('bbox', None)  # Bounding box for overlay
                    })
                
                response_data = {
                    'detected_ingredients': detected_ingredients,
                    'total_detected': len(predictions),
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                return jsonify(response_data), 200
                
            finally:
                # Clean up temporary files
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    if processed_path and processed_path != file_path and os.path.exists(processed_path):
                        os.remove(processed_path)
                except Exception as e:
                    logger.warning(f"Failed to clean up temporary files: {str(e)}")
            
        except Exception as e:
            logger.error(f"Live scan error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @scan_bp.route('/save-live-scan', methods=['POST'])
    def save_live_scan():
        """Save ingredients detected from live scan to user's fridge"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            data = request.get_json()
            
            if 'ingredients' not in data:
                return jsonify({'error': 'No ingredients data provided'}), 400
            
            ingredients_data = data['ingredients']
            
            # Create fridge scan record
            scan_data = {
                'user_id': user_id,
                'image_url': 'live_scan',  # Placeholder for live scans
                'ai_confidence': max([ing['confidence'] for ing in ingredients_data], default=0.0),
                'scanned_at': datetime.utcnow().isoformat()
            }
            
            scan_result = db_service.create_fridge_scan(scan_data)
            
            if not scan_result['success']:
                logger.error(f"Failed to create scan record: {scan_result['error']}")
                return jsonify({'error': 'Failed to save scan results'}), 500
            
            scan_id = scan_result['data']['scan_id']
            
            # Process and save detected ingredients
            detected_ingredients = []
            for ingredient_data in ingredients_data:
                # Get ingredient ID from database
                ingredient_result = db_service.get_ingredient_by_name(ingredient_data['name'])
                
                if ingredient_result['success'] and ingredient_result['data']:
                    ingredient_id = ingredient_result['data']['ingredient_id']
                    detected_ingredients.append({
                        'ingredient_id': ingredient_id,
                        'confidence': ingredient_data['confidence'],
                        'quantity': 'detected',
                        'freshness': 'good'
                    })
            
            # Save detected ingredients
            if detected_ingredients:
                ingredients_result = db_service.save_detected_ingredients(
                    scan_id, detected_ingredients
                )
                
                if ingredients_result['success']:
                    return jsonify({
                        'message': 'Ingredients saved successfully',
                        'scan_id': scan_id,
                        'saved_count': len(detected_ingredients)
                    }), 200
                else:
                    return jsonify({'error': 'Failed to save ingredients'}), 500
            else:
                return jsonify({'error': 'No valid ingredients to save'}), 400
                
        except Exception as e:
            logger.error(f"Save live scan error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @scan_bp.route('/update-settings', methods=['POST'])
    def update_scan_settings():
        """Update scan settings"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            data = request.get_json()
            
            # Update confidence threshold if provided
            if 'confidence_threshold' in data:
                threshold = float(data['confidence_threshold'])
                ai_service.update_confidence_threshold(threshold)
            
            return jsonify({
                'message': 'Settings updated successfully',
                'current_settings': {
                    'confidence_threshold': ai_service.confidence_threshold
                }
            }), 200
            
        except Exception as e:
            logger.error(f"Update settings error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    return scan_bp