"""
Main Flask Application for Ingredient Scanner Backend
"""
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import config
from services.database import SupabaseService
from services.auth import AuthService  
from services.ai_model import AIModelService
from api.auth_routes import create_auth_routes
from api.scan_routes import create_scan_routes
from api.recipe_routes import create_recipe_routes
from utils.helpers import cleanup_old_files

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(config_name='development'):
    """Application factory function"""
    
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    
    # Configure CORS
    CORS(app, origins=app.config['ALLOWED_ORIGINS'])
    
    # Initialize services
    try:
        # Database service
        db_service = SupabaseService(
            app.config['SUPABASE_URL'],
            app.config['SUPABASE_KEY'],
            app.config.get('SUPABASE_SERVICE_KEY')  # Pass service key for admin operations
        )
        
        # Authentication service
        auth_service = AuthService(
            db_service.supabase,
            app.config['JWT_SECRET_KEY'],
            app.config['JWT_ALGORITHM']
        )
        
        # AI Model service
        ai_service = AIModelService(
            app.config['MODEL_PATH'],
            app.config['INGREDIENT_CLASSES'],
            app.config['CONFIDENCE_THRESHOLD']
        )
        
        logger.info("All services initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize services: {str(e)}")
        raise e
    
    # Create upload folders
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['RESULTS_FOLDER'], exist_ok=True)
    
    # Register blueprints
    app.register_blueprint(
        create_auth_routes(auth_service, db_service)
    )
    
    app.register_blueprint(
        create_scan_routes(ai_service, db_service, auth_service, app.config['UPLOAD_FOLDER'])
    )
    
    app.register_blueprint(
        create_recipe_routes(db_service, auth_service)
    )
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'services': {
                'database': True,  # Could add actual health checks
                'ai_model': ai_service.is_model_loaded(),
                'auth': True
            },
            'version': '1.0.0'
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        """Root endpoint"""
        return jsonify({
            'message': 'Ingredient Scanner API',
            'version': '1.0.0',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth/',
                'scan': '/api/scan/',
                'recipes': '/api/recipes/'
            }
        }), 200
    
    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request'}), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized'}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden'}), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({'error': 'File too large'}), 413
    
    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({'error': 'Internal server error'}), 500
    
    # Cleanup old files on startup
    if app.config['DEBUG']:
        try:
            cleanup_old_files(app.config['UPLOAD_FOLDER'], 24)
            cleanup_old_files(app.config['RESULTS_FOLDER'], 24)
        except Exception as e:
            logger.warning(f"File cleanup warning: {str(e)}")
    
    logger.info("Flask application created successfully")
    return app

# Create application instance
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info("=" * 60)
    logger.info("🚀 Ingredient Scanner Backend API")
    logger.info("=" * 60)
    logger.info(f"🌐 Server starting on port {port}")
    logger.info(f"🔧 Debug mode: {debug}")
    logger.info(f"📁 Upload folder: {app.config['UPLOAD_FOLDER']}")
    logger.info(f"🤖 AI Model loaded: {app.config.get('ai_service', {}).get('is_model_loaded', False)}")
    logger.info("=" * 60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        use_reloader=debug,
        threaded=True
    )