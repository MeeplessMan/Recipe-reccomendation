#!/usr/bin/env python3
"""
System Test Script for Live Ingredient Scanner
Verifies all components are working properly
"""

import os
import sys
import platform

def print_header(title):
    print("\n" + "=" * 50)
    print(f" {title}")
    print("=" * 50)

def check_python():
    print(f"✓ Python Version: {sys.version}")
    print(f"✓ Platform: {platform.system()} {platform.release()}")

def check_dependencies():
    print("\nChecking Python Dependencies...")
    
    required_packages = [
        'cv2', 'numpy', 'flask', 'ultralytics', 
        'torch', 'torchvision', 'PIL'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'cv2':
                import cv2
                print(f"✓ OpenCV: {cv2.__version__}")
            elif package == 'numpy':
                import numpy as np
                print(f"✓ NumPy: {np.__version__}")
            elif package == 'flask':
                import flask
                print(f"✓ Flask: {flask.__version__}")
            elif package == 'ultralytics':
                import ultralytics
                print(f"✓ Ultralytics: Available")
            elif package == 'torch':
                import torch
                print(f"✓ PyTorch: {torch.__version__}")
            elif package == 'torchvision':
                import torchvision
                print(f"✓ TorchVision: {torchvision.__version__}")
            elif package == 'PIL':
                from PIL import Image
                print(f"✓ Pillow: Available")
                
        except ImportError:
            print(f"✗ {package}: Missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Run: pip install ultralytics opencv-python numpy torch torchvision Pillow Flask")
        return False
    
    return True

def check_camera():
    print("\nTesting Camera Access...")
    
    try:
        import cv2
        
        # Test camera access
        camera_found = False
        for camera_id in range(5):
            cap = cv2.VideoCapture(camera_id)
            if cap.isOpened():
                ret, frame = cap.read()
                if ret and frame is not None:
                    height, width = frame.shape[:2]
                    print(f"✓ Camera {camera_id}: {width}x{height} pixels")
                    camera_found = True
                    cap.release()
                    break
                else:
                    cap.release()
            else:
                if cap:
                    cap.release()
        
        if not camera_found:
            print("✗ No working camera found")
            print("💡 Make sure camera is connected and not in use")
            return False
            
        return True
        
    except Exception as e:
        print(f"✗ Camera test error: {e}")
        return False

def check_model():
    print("\nChecking YOLO Model...")
    
    model_path = "model/best.pt"
    
    if not os.path.exists(model_path):
        print(f"✗ Model file missing: {model_path}")
        print("💡 Ensure the trained model is in the 'model' folder")
        return False
    
    # Check file size
    file_size = os.path.getsize(model_path)
    size_mb = file_size / (1024 * 1024)
    print(f"✓ Model file found: {model_path} ({size_mb:.1f} MB)")
    
    # Try to load the model
    try:
        from ultralytics import YOLO
        model = YOLO(model_path)
        print("✓ Model loads successfully")
        print(f"✓ Model type: {type(model).__name__}")
        return True
        
    except Exception as e:
        print(f"✗ Model loading error: {e}")
        return False

def check_directories():
    print("\nChecking Directory Structure...")
    
    required_dirs = ['model', 'uploads', 'results']
    required_files = ['app.py', 'requirements.txt', 'README.md']
    
    for directory in required_dirs:
        if os.path.exists(directory):
            print(f"✓ Directory exists: {directory}/")
        else:
            print(f"✗ Directory missing: {directory}/")
            os.makedirs(directory, exist_ok=True)
            print(f"  → Created: {directory}/")
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ File exists: {file}")
        else:
            print(f"✗ File missing: {file}")

def run_quick_test():
    print("\nRunning Quick Functionality Test...")
    
    try:
        # Test basic imports
        import cv2
        import numpy as np
        from ultralytics import YOLO
        
        # Test model loading
        if os.path.exists("model/best.pt"):
            model = YOLO("model/best.pt")
            print("✓ Model initialization successful")
            
            # Test with dummy image
            dummy_image = np.zeros((224, 224, 3), dtype=np.uint8)
            temp_path = "uploads/test_frame.jpg"
            cv2.imwrite(temp_path, dummy_image)
            
            results = model(temp_path, verbose=False)
            print("✓ Model prediction successful")
            
            # Clean up
            try:
                os.remove(temp_path)
            except:
                pass
        
        return True
        
    except Exception as e:
        print(f"✗ Quick test failed: {e}")
        return False

def main():
    print_header("Live Ingredient Scanner - System Test")
    
    # System information
    check_python()
    
    # Check all components
    deps_ok = check_dependencies()
    camera_ok = check_camera()
    model_ok = check_model()
    check_directories()
    
    # Overall status
    print_header("Test Summary")
    
    if deps_ok and camera_ok and model_ok:
        print("🎉 ALL TESTS PASSED!")
        print("\nYour system is ready for the Live Ingredient Scanner!")
        print("\nTo start the application:")
        print("  • Windows: Double-click start_scanner.bat")
        print("  • Or run: python app.py")
        print("  • Then open: http://localhost:5000")
        
        if run_quick_test():
            print("\n✅ Quick functionality test also passed!")
        
    else:
        print("⚠️  SOME TESTS FAILED")
        print("\nPlease resolve the issues above before running the application.")
        
        if not deps_ok:
            print("• Install missing Python packages")
        if not camera_ok:
            print("• Check camera connection and permissions")
        if not model_ok:
            print("• Ensure model file is in the correct location")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()