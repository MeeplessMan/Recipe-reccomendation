"""
Utility functions for the backend
"""
import os
import re
import uuid
from typing import Optional, Dict, Any
from werkzeug.utils import secure_filename
import logging

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

def allowed_file(filename: str) -> bool:
    """Check if uploaded file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, upload_folder: str, custom_filename: Optional[str] = None) -> Optional[str]:
    """
    Save uploaded file to specified folder
    
    Args:
        file: Uploaded file object
        upload_folder: Directory to save file
        custom_filename: Optional custom filename (without extension)
        
    Returns:
        Full path to saved file or None if error
    """
    try:
        if file and file.filename and allowed_file(file.filename):
            # Generate secure filename
            if custom_filename:
                extension = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{secure_filename(custom_filename)}.{extension}"
            else:
                # Generate unique filename
                extension = file.filename.rsplit('.', 1)[1].lower()
                unique_id = str(uuid.uuid4())
                filename = f"{unique_id}.{extension}"
            
            # Ensure upload folder exists
            os.makedirs(upload_folder, exist_ok=True)
            
            # Save file
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            
            logger.info(f"File saved successfully: {file_path}")
            return file_path
        else:
            logger.warning(f"Invalid file or filename: {file.filename if file else 'None'}")
            return None
            
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        return None

def generate_scan_filename(user_id: str) -> str:
    """Generate unique filename for fridge scan"""
    timestamp = uuid.uuid4().hex[:8]
    return f"scan_{user_id}_{timestamp}.jpg"

def cleanup_old_files(directory: str, max_age_hours: int = 24):
    """Clean up old files from directory"""
    try:
        import time
        
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getctime(file_path)
                if file_age > max_age_seconds:
                    os.remove(file_path)
                    logger.info(f"Cleaned up old file: {file_path}")
                    
    except Exception as e:
        logger.error(f"Error cleaning up files: {str(e)}")

def format_ingredient_name(name: str) -> str:
    """Format ingredient name for consistency"""
    return name.lower().strip().replace('_', ' ')

def calculate_recipe_match_score(available_ingredients: set, recipe_ingredients: set) -> float:
    """Calculate how well available ingredients match recipe requirements"""
    if not recipe_ingredients:
        return 0.0
    
    matched = len(available_ingredients.intersection(recipe_ingredients))
    total = len(recipe_ingredients)
    
    return matched / total

def validate_email(email: str) -> bool:
    """Basic email validation"""
    import re
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> Dict[str, Any]:
    """Validate password strength"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number")
    
    return {
        'is_valid': len(errors) == 0,
        'errors': errors
    }