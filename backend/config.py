"""
Configuration settings for the Ingredient Scanner Backend
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Supabase Configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', '24')))
    JWT_ALGORITHM = 'HS256'
    
    # Upload Configuration
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_UPLOAD_SIZE', '10485760'))  # 10MB
    UPLOAD_FOLDER = os.path.abspath(os.getenv('UPLOAD_FOLDER', '../uploads'))
    RESULTS_FOLDER = os.path.abspath(os.getenv('RESULTS_FOLDER', '../results'))
    
    # Model Configuration
    MODEL_PATH = os.path.abspath(os.getenv('MODEL_PATH', '../model/best.pt'))
    CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', '0.5'))
    MAX_PREDICTIONS = int(os.getenv('MAX_PREDICTIONS', '5'))
    
    # CORS Configuration
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
    
    # Supported ingredient classes (must match model training)
    INGREDIENT_CLASSES = [
        'apple', 'banana', 'beetroot', 'bell pepper', 'cabbage', 
        'capsicum', 'carrot', 'cauliflower', 'chilli pepper', 'corn',
        'cucumber', 'eggplant', 'garlic', 'ginger', 'grapes',
        'jalepeno', 'kiwi', 'lemon', 'lettuce', 'mango',
        'onion', 'orange', 'paprika', 'pear', 'peas',
        'pineapple', 'pomegranate', 'potato', 'raddish', 'soy beans',
        'spinach', 'sweetcorn', 'sweetpotato', 'tomato', 'turnip', 'watermelon'
    ]

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}