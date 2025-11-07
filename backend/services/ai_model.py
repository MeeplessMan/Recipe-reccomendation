"""
AI Model Service for Ingredient Detection
Handles YOLO model operations and image processing
"""
import os
import cv2
import numpy as np
from typing import List, Dict, Any, Optional
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class AIModelService:
    """Service class for AI model operations"""
    
    def __init__(self, model_path: str, ingredient_classes: List[str], 
                 confidence_threshold: float = 0.3):
        """Initialize AI model service"""
        self.model_path = model_path
        self.ingredient_classes = ingredient_classes
        self.confidence_threshold = confidence_threshold
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load YOLO model"""
        try:
            from ultralytics import YOLO
            
            if os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
                logger.info(f"YOLO model loaded successfully from {self.model_path}")
            else:
                logger.error(f"Model file not found: {self.model_path}")
                self.model = None
                
        except ImportError:
            logger.error("Ultralytics not installed. Please install: pip install ultralytics")
            self.model = None
        except Exception as e:
            logger.error(f"Error loading YOLO model: {str(e)}")
            self.model = None
    
    def is_model_loaded(self) -> bool:
        """Check if model is successfully loaded"""
        return self.model is not None
    
    def predict_ingredients(self, image_path: str, max_predictions: int = 5) -> List[Dict[str, Any]]:
        """
        Predict ingredients from image
        
        Args:
            image_path: Path to the image file
            max_predictions: Maximum number of predictions to return
            
        Returns:
            List of predictions with class_name, confidence, and class_id
        """
        if not self.model:
            logger.error("Model not loaded, cannot make predictions")
            return []
        
        try:
            # Run YOLO prediction
            results = self.model(image_path, verbose=False)
            predictions = []
            
            if results and len(results) > 0:
                result = results[0]
                
                # Handle classification results (single class per image)
                if hasattr(result, 'probs') and result.probs is not None:
                    probs = result.probs.data.cpu().numpy()
                    
                    # Get top predictions above threshold
                    top_indices = np.argsort(probs)[::-1][:max_predictions]
                    
                    for idx in top_indices:
                        confidence = float(probs[idx])
                        if confidence >= self.confidence_threshold:
                            class_name = (self.ingredient_classes[idx] 
                                        if idx < len(self.ingredient_classes) 
                                        else f"class_{idx}")
                            
                            predictions.append({
                                'class_name': class_name,
                                'confidence': confidence,
                                'class_id': int(idx)
                            })
                
                # Handle detection results (multiple objects per image)
                elif hasattr(result, 'boxes') and result.boxes is not None:
                    boxes = result.boxes
                    
                    for i, box in enumerate(boxes):
                        confidence = float(box.conf[0])
                        if confidence >= self.confidence_threshold:
                            class_id = int(box.cls[0])
                            class_name = (self.ingredient_classes[class_id] 
                                        if class_id < len(self.ingredient_classes) 
                                        else f"class_{class_id}")
                            
                            # Get bounding box coordinates
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                            
                            predictions.append({
                                'class_name': class_name,
                                'confidence': confidence,
                                'class_id': class_id,
                                'bbox': {
                                    'x1': float(x1),
                                    'y1': float(y1),
                                    'x2': float(x2),
                                    'y2': float(y2)
                                }
                            })
                    
                    # Sort by confidence and limit results
                    predictions.sort(key=lambda x: x['confidence'], reverse=True)
                    predictions = predictions[:max_predictions]
            
            logger.info(f"Made {len(predictions)} predictions for {image_path}")
            return predictions
            
        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            return []
    
    def predict_from_numpy_array(self, image_array: np.ndarray, 
                                max_predictions: int = 5) -> List[Dict[str, Any]]:
        """
        Predict ingredients from numpy array (useful for camera frames)
        
        Args:
            image_array: Numpy array representing the image
            max_predictions: Maximum number of predictions to return
            
        Returns:
            List of predictions with class_name, confidence, and class_id
        """
        if not self.model:
            logger.error("Model not loaded, cannot make predictions")
            return []
        
        try:
            # Convert numpy array to PIL Image for YOLO
            if image_array.dtype != np.uint8:
                image_array = (image_array * 255).astype(np.uint8)
            
            image = Image.fromarray(image_array)
            
            # Run YOLO prediction directly on PIL Image
            results = self.model(image, verbose=False)
            predictions = []
            
            if results and len(results) > 0:
                result = results[0]
                
                # Handle classification results
                if hasattr(result, 'probs') and result.probs is not None:
                    probs = result.probs.data.cpu().numpy()
                    
                    # Get top predictions above threshold
                    top_indices = np.argsort(probs)[::-1][:max_predictions]
                    
                    for idx in top_indices:
                        confidence = float(probs[idx])
                        if confidence >= self.confidence_threshold:
                            class_name = (self.ingredient_classes[idx] 
                                        if idx < len(self.ingredient_classes) 
                                        else f"class_{idx}")
                            
                            predictions.append({
                                'class_name': class_name,
                                'confidence': confidence,
                                'class_id': int(idx)
                            })
            
            return predictions
            
        except Exception as e:
            logger.error(f"Error during numpy prediction: {str(e)}")
            return []
    
    def update_confidence_threshold(self, threshold: float):
        """Update confidence threshold"""
        self.confidence_threshold = max(0.1, min(0.9, threshold))
        logger.info(f"Updated confidence threshold to {self.confidence_threshold}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model"""
        return {
            'model_loaded': self.is_model_loaded(),
            'model_path': self.model_path,
            'confidence_threshold': self.confidence_threshold,
            'supported_classes': len(self.ingredient_classes),
            'ingredient_classes': self.ingredient_classes
        }
    
    def preprocess_image(self, image_path: str, target_size: tuple = (640, 640)) -> Optional[str]:
        """
        Preprocess image for better prediction results
        
        Args:
            image_path: Path to the original image
            target_size: Target size for resizing (width, height)
            
        Returns:
            Path to preprocessed image or None if error
        """
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Could not read image: {image_path}")
                return None
            
            # Resize image while maintaining aspect ratio
            height, width = image.shape[:2]
            aspect_ratio = width / height
            
            if aspect_ratio > 1:  # Wider than tall
                new_width = target_size[0]
                new_height = int(target_size[0] / aspect_ratio)
            else:  # Taller than wide
                new_height = target_size[1]
                new_width = int(target_size[1] * aspect_ratio)
            
            resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
            
            # Create a new image with target size and center the resized image
            processed = np.zeros((target_size[1], target_size[0], 3), dtype=np.uint8)
            y_offset = (target_size[1] - new_height) // 2
            x_offset = (target_size[0] - new_width) // 2
            processed[y_offset:y_offset+new_height, x_offset:x_offset+new_width] = resized
            
            # Save preprocessed image
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            processed_path = os.path.join(os.path.dirname(image_path), f"{base_name}_processed.jpg")
            cv2.imwrite(processed_path, processed)
            
            return processed_path
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            return None