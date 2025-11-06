"""
Real-time Camera Flask App for YOLO Ingredient Detection
Professional version - Ready for deployment
"""

import os
import cv2
import json
import threading
import time
from datetime import datetime
from flask import Flask, Response, render_template_string, jsonify
import base64
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
MODEL_PATH = 'model/best.pt'

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

class CameraIngredientScanner:
    """Professional camera ingredient scanning system"""
    
    def __init__(self):
        self.model = None
        self.camera = None
        self.current_frame = None
        self.latest_predictions = []
        self.scan_interval = 3.0
        self.confidence_threshold = 0.3
        self.scanning_active = False
        self.last_scan_time = 0
        self.scan_thread = None
        
        # 36 Ingredient classes from trained model
        self.class_names = [
            'apple', 'banana', 'beetroot', 'bell pepper', 'cabbage', 
            'capsicum', 'carrot', 'cauliflower', 'chilli pepper', 'corn',
            'cucumber', 'eggplant', 'garlic', 'ginger', 'grapes',
            'jalepeno', 'kiwi', 'lemon', 'lettuce', 'mango',
            'onion', 'orange', 'paprika', 'pear', 'peas',
            'pineapple', 'pomegranate', 'potato', 'raddish', 'soy beans',
            'spinach', 'sweetcorn', 'sweetpotato', 'tomato', 'turnip', 'watermelon'
        ]
        
        self.initialize_system()
    
    def initialize_system(self):
        """Initialize camera and model"""
        print("🚀 Initializing Ingredient Scanner...")
        
        # Load YOLO model
        self.load_model()
        
        # Initialize camera
        self.initialize_camera()
        
        print("✅ System initialization complete!")
    
    def load_model(self):
        """Load YOLO classification model"""
        try:
            from ultralytics import YOLO
            
            if os.path.exists(MODEL_PATH):
                self.model = YOLO(MODEL_PATH)
                print(f"✅ Model loaded: {MODEL_PATH}")
            else:
                print(f"❌ Model not found: {MODEL_PATH}")
                print("💡 Please ensure the trained model is in the 'model' folder")
                self.model = None
                
        except ImportError:
            print("❌ Ultralytics not installed. Please install: pip install ultralytics")
            self.model = None
        except Exception as e:
            print(f"❌ Model loading error: {e}")
            self.model = None
    
    def initialize_camera(self):
        """Initialize camera with optimal settings"""
        try:
            # Try different camera indices
            for camera_id in range(5):
                self.camera = cv2.VideoCapture(camera_id)
                if self.camera.isOpened():
                    # Test if camera can capture frames
                    ret, frame = self.camera.read()
                    if ret and frame is not None:
                        # Configure camera for optimal performance
                        self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                        self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                        self.camera.set(cv2.CAP_PROP_FPS, 30)
                        self.camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                        
                        print(f"✅ Camera initialized (ID: {camera_id})")
                        return
                    else:
                        self.camera.release()
                else:
                    if self.camera:
                        self.camera.release()
            
            print("❌ No working camera found")
            self.camera = None
            
        except Exception as e:
            print(f"❌ Camera initialization error: {e}")
            self.camera = None
    
    def get_frame(self):
        """Capture current frame from camera"""
        if not self.camera or not self.camera.isOpened():
            return None
            
        success, frame = self.camera.read()
        if success:
            self.current_frame = frame.copy()
            return frame
        return None
    
    def predict_ingredients(self, frame):
        """Analyze frame for ingredients"""
        if not self.model or frame is None:
            return []
        
        try:
            # Save frame temporarily
            temp_path = os.path.join(UPLOAD_FOLDER, 'scan_frame.jpg')
            cv2.imwrite(temp_path, frame)
            
            # Run YOLO prediction
            results = self.model(temp_path, verbose=False)
            predictions = []
            
            if results and len(results) > 0:
                result = results[0]
                
                if hasattr(result, 'probs') and result.probs is not None:
                    probs = result.probs.data.cpu().numpy()
                    
                    # Get top 5 predictions above threshold
                    top_indices = np.argsort(probs)[::-1][:5]
                    
                    for idx in top_indices:
                        confidence = float(probs[idx])
                        if confidence >= self.confidence_threshold:
                            class_name = self.class_names[idx] if idx < len(self.class_names) else f"class_{idx}"
                            predictions.append({
                                'class_name': class_name,
                                'confidence': confidence,
                                'class_id': int(idx)
                            })
            
            # Clean up temporary file
            try:
                os.remove(temp_path)
            except:
                pass
            
            return predictions
            
        except Exception as e:
            print(f"❌ Prediction error: {e}")
            return []
    
    def start_scanning(self):
        """Start periodic ingredient scanning"""
        if self.scanning_active:
            return False
            
        self.scanning_active = True
        
        def scan_worker():
            print("🔍 Started ingredient scanning...")
            while self.scanning_active:
                current_time = time.time()
                
                if current_time - self.last_scan_time >= self.scan_interval:
                    if self.current_frame is not None:
                        self.latest_predictions = self.predict_ingredients(self.current_frame)
                        self.last_scan_time = current_time
                        
                        ingredient_count = len(self.latest_predictions)
                        if ingredient_count > 0:
                            ingredients = ", ".join([p['class_name'] for p in self.latest_predictions])
                            print(f"🥗 Found {ingredient_count} ingredient(s): {ingredients}")
                        else:
                            print("🔍 Scanning... no ingredients detected")
                
                time.sleep(0.5)  # Check every 500ms
        
        # Start scanning thread
        self.scan_thread = threading.Thread(target=scan_worker, daemon=True)
        self.scan_thread.start()
        return True
    
    def stop_scanning(self):
        """Stop ingredient scanning"""
        self.scanning_active = False
        print("⏹️ Stopped ingredient scanning")
        return True
    
    def update_settings(self, confidence=None, interval=None):
        """Update scanning parameters"""
        if confidence is not None:
            self.confidence_threshold = max(0.1, min(0.9, float(confidence)))
            print(f"🔧 Confidence threshold: {self.confidence_threshold:.2f}")
            
        if interval is not None:
            self.scan_interval = max(1.0, min(10.0, float(interval)))
            print(f"⏰ Scan interval: {self.scan_interval:.1f}s")
    
    def get_system_status(self):
        """Get current system status"""
        return {
            'camera_available': self.camera is not None and self.camera.isOpened(),
            'model_loaded': self.model is not None,
            'scanning_active': self.scanning_active,
            'confidence_threshold': self.confidence_threshold,
            'scan_interval': self.scan_interval,
            'latest_predictions': len(self.latest_predictions),
            'supported_classes': len(self.class_names)
        }
    
    def cleanup(self):
        """Clean up resources"""
        self.stop_scanning()
        if self.camera:
            self.camera.release()
            print("📷 Camera released")

# Initialize the scanner system
scanner = CameraIngredientScanner()

def generate_camera_stream():
    """Generate video frames for web streaming"""
    while True:
        frame = scanner.get_frame()
        
        if frame is not None:
            # Add informational overlays
            height, width = frame.shape[:2]
            
            # Timestamp overlay
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cv2.putText(frame, timestamp, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            
            # Scanning status
            status = "SCANNING" if scanner.scanning_active else "STANDBY"
            status_color = (0, 255, 0) if scanner.scanning_active else (0, 165, 255)
            cv2.putText(frame, status, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, status_color, 2)
            
            # Ingredient count
            ingredient_count = len(scanner.latest_predictions)
            if ingredient_count > 0:
                count_text = f"Ingredients: {ingredient_count}"
                cv2.putText(frame, count_text, (10, height - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
            
            # Encode frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if ret:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        else:
            # Camera unavailable - show placeholder
            placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(placeholder, 'Camera Not Available', (180, 240), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            ret, buffer = cv2.imencode('.jpg', placeholder)
            if ret:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        
        time.sleep(0.033)  # ~30 FPS

@app.route('/')
def main_interface():
    """Main web interface with camera feed and controls"""
    return render_template_string("""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🔍 Live Ingredient Scanner</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #2c3e50, #3498db);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 2.5rem;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .header p {
                font-size: 1.2rem;
                opacity: 0.9;
            }
            
            .main-content {
                display: flex;
                gap: 30px;
                padding: 30px;
            }
            
            .camera-section {
                flex: 2;
            }
            
            .camera-feed {
                width: 100%;
                max-width: 640px;
                height: auto;
                border: 3px solid #3498db;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                background: #000;
            }
            
            .controls {
                margin: 25px 0;
                text-align: center;
            }
            
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 15px 30px;
                margin: 0 10px;
                border: none;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                color: white;
            }
            
            .btn-primary:hover {
                background: linear-gradient(135deg, #2ecc71, #27ae60);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .btn-danger {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
            }
            
            .btn-danger:hover {
                background: linear-gradient(135deg, #c0392b, #e74c3c);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
            }
            
            .results-panel {
                flex: 1;
                background: #f8f9fa;
                border-radius: 15px;
                padding: 25px;
                box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .results-panel h3 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 1.4rem;
                text-align: center;
            }
            
            .status-indicator {
                text-align: center;
                padding: 15px;
                margin: 15px 0;
                border-radius: 10px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .status-ready {
                background: #d1ecf1;
                color: #0c5460;
                border: 2px solid #bee5eb;
            }
            
            .status-scanning {
                background: #d4edda;
                color: #155724;
                border: 2px solid #c3e6cb;
                animation: pulse 2s infinite;
            }
            
            .status-stopped {
                background: #f8d7da;
                color: #721c24;
                border: 2px solid #f5c6cb;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            
            .ingredients-list {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .ingredient-card {
                background: white;
                margin: 15px 0;
                padding: 20px;
                border-radius: 12px;
                border-left: 5px solid #3498db;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s ease;
            }
            
            .ingredient-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
            }
            
            .ingredient-name {
                font-size: 1.2rem;
                font-weight: 700;
                color: #2c3e50;
                text-transform: capitalize;
                margin-bottom: 10px;
            }
            
            .confidence-container {
                margin: 10px 0;
            }
            
            .confidence-bar {
                background: #ecf0f1;
                height: 12px;
                border-radius: 6px;
                overflow: hidden;
                position: relative;
            }
            
            .confidence-fill {
                height: 100%;
                border-radius: 6px;
                background: linear-gradient(90deg, #e74c3c 0%, #f39c12 50%, #27ae60 100%);
                transition: width 0.5s ease;
                position: relative;
            }
            
            .confidence-text {
                font-size: 0.9rem;
                color: #7f8c8d;
                margin-top: 5px;
                font-weight: 600;
            }
            
            .settings-panel {
                background: white;
                margin: 20px 30px;
                padding: 25px;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            }
            
            .settings-panel h4 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 1.3rem;
            }
            
            .setting-group {
                margin: 20px 0;
            }
            
            .setting-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #34495e;
            }
            
            .slider {
                width: 100%;
                height: 8px;
                border-radius: 4px;
                background: #bdc3c7;
                outline: none;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .slider::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #3498db;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }
            
            .empty-state {
                text-align: center;
                color: #7f8c8d;
                font-style: italic;
                padding: 30px;
                background: #ecf0f1;
                border-radius: 10px;
                margin: 20px 0;
            }
            
            @media (max-width: 768px) {
                .main-content {
                    flex-direction: column;
                    gap: 20px;
                }
                
                .header h1 {
                    font-size: 2rem;
                }
                
                .btn {
                    padding: 12px 20px;
                    margin: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔍 Live Ingredient Scanner</h1>
                <p>Real-time AI-powered ingredient detection using your camera</p>
            </div>
            
            <div class="main-content">
                <div class="camera-section">
                    <img id="camera-stream" class="camera-feed" 
                         src="{{ url_for('video_stream') }}" 
                         alt="Live Camera Feed">
                    
                    <div class="controls">
                        <button class="btn btn-primary" id="startBtn" onclick="startScanning()">
                            🚀 Start Scanning
                        </button>
                        <button class="btn btn-danger" id="stopBtn" onclick="stopScanning()" style="display: none;">
                            ⏹️ Stop Scanning
                        </button>
                    </div>
                </div>
                
                <div class="results-panel">
                    <h3>🥗 Detected Ingredients</h3>
                    
                    <div id="status" class="status-indicator status-ready">
                        📷 Camera Ready - Click Start to begin scanning
                    </div>
                    
                    <div id="ingredients-container" class="ingredients-list">
                        <div class="empty-state">
                            No ingredients detected yet.<br>
                            Start scanning to see results!
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-panel">
                <h4>⚙️ Detection Settings</h4>
                
                <div class="setting-group">
                    <label>Confidence Threshold: <span id="confidenceValue">30%</span></label>
                    <input type="range" id="confidenceSlider" class="slider" 
                           min="10" max="90" step="5" value="30" 
                           oninput="updateConfidence(this.value)">
                </div>
                
                <div class="setting-group">
                    <label>Scan Interval: <span id="intervalValue">3.0</span> seconds</label>
                    <input type="range" id="intervalSlider" class="slider" 
                           min="1.0" max="10.0" step="0.5" value="3.0" 
                           oninput="updateInterval(this.value)">
                </div>
            </div>
        </div>

        <script>
            let scanningActive = false;
            let resultsPollInterval;

            function startScanning() {
                fetch('/api/start_scanning', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            scanningActive = true;
                            document.getElementById('startBtn').style.display = 'none';
                            document.getElementById('stopBtn').style.display = 'inline-flex';
                            updateStatus('🔍 Scanning active - Looking for ingredients...', 'scanning');
                            
                            // Start polling for results
                            resultsPollInterval = setInterval(fetchLatestResults, 1000);
                        } else {
                            alert('Failed to start scanning: ' + (data.error || 'Unknown error'));
                        }
                    })
                    .catch(error => {
                        console.error('Start scanning error:', error);
                        alert('Error starting scanning. Check console for details.');
                    });
            }

            function stopScanning() {
                fetch('/api/stop_scanning', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        scanningActive = false;
                        document.getElementById('startBtn').style.display = 'inline-flex';
                        document.getElementById('stopBtn').style.display = 'none';
                        updateStatus('⏹️ Scanning stopped', 'stopped');
                        
                        // Stop polling
                        if (resultsPollInterval) {
                            clearInterval(resultsPollInterval);
                        }
                    })
                    .catch(error => {
                        console.error('Stop scanning error:', error);
                    });
            }

            function fetchLatestResults() {
                if (!scanningActive) return;
                
                fetch('/api/get_results')
                    .then(response => response.json())
                    .then(data => {
                        displayIngredients(data.predictions || []);
                        
                        const count = data.predictions ? data.predictions.length : 0;
                        if (count > 0) {
                            updateStatus(`🎯 Found ${count} ingredient${count === 1 ? '' : 's'}`, 'scanning');
                        } else {
                            updateStatus('🔍 Scanning... No ingredients detected', 'scanning');
                        }
                    })
                    .catch(error => {
                        console.error('Results fetch error:', error);
                    });
            }

            function displayIngredients(predictions) {
                const container = document.getElementById('ingredients-container');
                
                if (!predictions || predictions.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            ${scanningActive ? 'Scanning for ingredients...' : 'No ingredients detected yet.<br>Start scanning to see results!'}
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = predictions.map(pred => `
                    <div class="ingredient-card">
                        <div class="ingredient-name">${pred.class_name}</div>
                        <div class="confidence-container">
                            <div class="confidence-bar">
                                <div class="confidence-fill" style="width: ${(pred.confidence * 100).toFixed(1)}%"></div>
                            </div>
                            <div class="confidence-text">${(pred.confidence * 100).toFixed(1)}% confidence</div>
                        </div>
                    </div>
                `).join('');
            }

            function updateStatus(message, type) {
                const statusDiv = document.getElementById('status');
                statusDiv.textContent = message;
                statusDiv.className = `status-indicator status-${type}`;
            }

            function updateConfidence(value) {
                document.getElementById('confidenceValue').textContent = value + '%';
                
                fetch('/api/update_settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ confidence: parseFloat(value) / 100 })
                })
                .catch(error => console.error('Settings update error:', error));
            }

            function updateInterval(value) {
                document.getElementById('intervalValue').textContent = value;
                
                fetch('/api/update_settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ interval: parseFloat(value) })
                })
                .catch(error => console.error('Settings update error:', error));
            }

            // Auto-refresh camera stream periodically to prevent stale connections
            setInterval(() => {
                const img = document.getElementById('camera-stream');
                if (img.src) {
                    const url = new URL(img.src);
                    url.searchParams.set('t', Date.now());
                    img.src = url.toString();
                }
            }, 30000); // Refresh every 30 seconds
        </script>
    </body>
    </html>
    """)

# API Routes
@app.route('/video_stream')
def video_stream():
    """MJPEG video streaming endpoint"""
    return Response(
        generate_camera_stream(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route('/api/start_scanning', methods=['POST'])
def api_start_scanning():
    """Start ingredient scanning"""
    try:
        success = scanner.start_scanning()
        return jsonify({
            'success': success,
            'message': 'Scanning started' if success else 'Scanning already active'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stop_scanning', methods=['POST'])
def api_stop_scanning():
    """Stop ingredient scanning"""
    try:
        success = scanner.stop_scanning()
        return jsonify({
            'success': success,
            'message': 'Scanning stopped'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get_results')
def api_get_results():
    """Get latest scanning results"""
    return jsonify({
        'predictions': scanner.latest_predictions,
        'timestamp': datetime.now().isoformat(),
        'scanning_active': scanner.scanning_active
    })

@app.route('/api/update_settings', methods=['POST'])
def api_update_settings():
    """Update scanning settings"""
    try:
        data = request.get_json()
        scanner.update_settings(
            confidence=data.get('confidence'),
            interval=data.get('interval')
        )
        return jsonify({'success': True, 'message': 'Settings updated'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/status')
def api_status():
    """Get system status"""
    return jsonify(scanner.get_system_status())

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 YOLO Live Ingredient Scanner")
    print("=" * 60)
    
    # Display system status
    status = scanner.get_system_status()
    print(f"📷 Camera: {'✅ Ready' if status['camera_available'] else '❌ Not Available'}")
    print(f"🤖 Model: {'✅ Loaded' if status['model_loaded'] else '❌ Not Loaded'}")
    print(f"🎯 Classes: {status['supported_classes']} ingredients supported")
    
    if not status['camera_available']:
        print("\n⚠️  Warning: No camera detected!")
        print("💡 Make sure a camera is connected and not in use by other applications")
    
    if not status['model_loaded']:
        print("\n⚠️  Warning: YOLO model not loaded!")
        print("💡 Make sure 'model/best.pt' exists in the application directory")
    
    print(f"\n🌐 Starting web server...")
    print(f"📱 Open your browser and go to: http://localhost:5000")
    print(f"🔍 Click 'Start Scanning' to begin ingredient detection")
    print(f"\n📋 Supported ingredients:")
    print(f"   {', '.join(scanner.class_names[:10])}...")
    print(f"   ...and {len(scanner.class_names) - 10} more!")
    
    try:
        app.run(
            host='0.0.0.0', 
            port=5000, 
            debug=False, 
            use_reloader=False, 
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down gracefully...")
        scanner.cleanup()
        print("✅ Cleanup completed")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        scanner.cleanup()