# 🔍 Live Ingredient Scanner

A real-time AI-powered ingredient detection system using YOLO (You Only Look Once) and Flask. This application uses your camera to continuously scan for ingredients and display results in a professional web interface.

## ✨ Features

- **Real-time Camera Feed**: Live video streaming with 30 FPS
- **AI-Powered Detection**: YOLO classification model trained on 36 ingredient classes
- **Automatic Scanning**: Periodic ingredient detection every 3 seconds
- **Professional Web UI**: Modern, responsive interface with live results
- **Adjustable Settings**: Configurable confidence threshold and scan intervals
- **Background Processing**: Non-blocking ingredient detection using threading
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 🥗 Supported Ingredients (36 Classes)

The model can detect these ingredients:

**Fruits**: Apple, Banana, Grapes, Kiwi, Lemon, Mango, Orange, Pear, Pineapple, Pomegranate, Watermelon

**Vegetables**: Beetroot, Bell Pepper, Cabbage, Capsicum, Carrot, Cauliflower, Chilli Pepper, Corn, Cucumber, Eggplant, Garlic, Ginger, Lettuce, Onion, Paprika, Peas, Potato, Radish, Spinach, Sweet Corn, Sweet Potato, Tomato, Turnip

**Legumes**: Soy Beans

**Peppers**: Jalapeño

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** installed on your system
- **Camera/Webcam** connected to your computer
- **Internet connection** for initial package installation

### Installation

1. **Extract/Download** the application folder to your preferred location

2. **Open Command Prompt/Terminal** and navigate to the application directory:

   ```bash
   cd path/to/ingredient_scanner_app
   ```

3. **Install Dependencies** (choose one method):

   **Method A - Using pip directly:**

   ```bash
   pip install ultralytics opencv-python numpy torch torchvision Pillow Flask
   ```

   **Method B - Using requirements.txt:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Verify Installation** - Check if the model file exists:
   - Ensure `model/best.pt` is present in the application folder
   - This is your trained YOLO classification model

### Running the Application

1. **Start the Server**:

   ```bash
   python app.py
   ```

2. **Open Your Browser** and navigate to:

   ```
   http://localhost:5000
   ```

3. **Begin Scanning**:
   - Click the "🚀 Start Scanning" button
   - Point your camera at ingredients
   - Watch real-time detection results appear on the right panel

## 🎮 How to Use

### Main Interface

1. **Camera Feed**: Live video stream from your camera (left side)
2. **Detection Results**: Real-time ingredient list with confidence scores (right side)
3. **Controls**: Start/Stop scanning buttons
4. **Settings**: Adjustable detection parameters

### Scanning Process

1. **Position Ingredients**: Place ingredients clearly in camera view
2. **Start Scanner**: Click "Start Scanning" button
3. **Wait for Detection**: System scans every 3 seconds automatically
4. **View Results**: Detected ingredients appear with confidence percentages
5. **Adjust Settings**: Fine-tune confidence threshold (10-90%) and scan interval (1-10 seconds)

### Optimal Usage Tips

- **Good Lighting**: Ensure adequate lighting for better detection
- **Clear View**: Keep ingredients unobstructed and well-centered
- **Single Items**: Works best with individual ingredients vs. mixed dishes
- **Camera Distance**: Position camera 1-3 feet from ingredients
- **Stable Position**: Minimize camera movement during scanning

## ⚙️ Configuration

### Detection Settings

**Confidence Threshold** (Default: 30%)

- Lower values: More detections, potentially more false positives
- Higher values: Fewer detections, higher accuracy
- Range: 10-90%

**Scan Interval** (Default: 3.0 seconds)

- Shorter intervals: More frequent scanning, higher CPU usage
- Longer intervals: Less frequent scanning, lower resource usage
- Range: 1.0-10.0 seconds

### Advanced Configuration

Edit `app.py` to modify:

- Camera resolution (default: 640x480)
- Frame rate (default: 30 FPS)
- Supported ingredient classes
- UI appearance and behavior

## 🔧 Troubleshooting

### Common Issues

**"Camera Not Available"**

- ✅ Ensure camera is connected and not in use by other applications
- ✅ Try different camera indices if multiple cameras are present
- ✅ Check camera permissions on your operating system

**"Model Not Loaded"**

- ✅ Verify `model/best.pt` exists in the application folder
- ✅ Ensure the model file is not corrupted (should be ~6MB)
- ✅ Check if ultralytics package is properly installed

**"Poor Detection Accuracy"**

- ✅ Improve lighting conditions
- ✅ Lower confidence threshold in settings
- ✅ Ensure ingredients are clearly visible and unobstructed
- ✅ Try different camera angles

**"Web Interface Not Loading"**

- ✅ Check if Flask is running (look for startup messages)
- ✅ Try different port if 5000 is occupied
- ✅ Disable firewall/antivirus temporarily for testing
- ✅ Access via `127.0.0.1:5000` instead of `localhost:5000`

### Performance Issues

**High CPU Usage**

- ✅ Increase scan interval to reduce detection frequency
- ✅ Lower camera resolution in code settings
- ✅ Close other unnecessary applications

**Slow Detection**

- ✅ Ensure you have adequate RAM (minimum 4GB recommended)
- ✅ Consider using GPU acceleration if CUDA is available
- ✅ Upgrade to faster storage (SSD recommended)

### Checking System Status

The application displays system status on startup:

```
📷 Camera: ✅ Ready / ❌ Not Available
🤖 Model: ✅ Loaded / ❌ Not Loaded
🎯 Classes: 36 ingredients supported
```

## 📁 Project Structure

```
ingredient_scanner_app/
│
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This documentation
│
├── model/
│   └── best.pt           # Trained YOLO classification model
│
├── uploads/              # Temporary image storage
└── results/             # Processing results (auto-created)
```

## 🛠️ Technical Details

### Architecture

- **Backend**: Flask web framework with YOLO integration
- **AI Model**: YOLOv8n classification model (94.3% accuracy)
- **Camera**: OpenCV for camera capture and video streaming
- **Threading**: Background processing for real-time performance
- **Frontend**: Modern HTML5/CSS3/JavaScript interface

### Model Information

- **Type**: YOLOv8 Classification
- **Classes**: 36 ingredient categories
- **Accuracy**: 94.3% on validation set
- **Input Size**: 224x224 pixels
- **Format**: PyTorch (.pt file)

### Performance

- **Detection Speed**: ~0.5-1.0 seconds per image
- **Memory Usage**: ~500MB-1GB RAM
- **CPU Usage**: Moderate (depends on scan frequency)
- **Supported Cameras**: USB webcams, built-in laptop cameras

## 🤝 Support

### Getting Help

1. **Check this README** for common solutions
2. **Review console output** for error messages
3. **Verify system requirements** and dependencies
4. **Test with different camera angles/lighting**

### System Requirements

- **Minimum**: Python 3.8, 4GB RAM, USB camera
- **Recommended**: Python 3.9+, 8GB RAM, good lighting
- **Operating System**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

## 📄 License

This project is for educational and demonstration purposes. The YOLO model is based on Ultralytics' YOLOv8 framework.

---

**Happy Ingredient Scanning! 🥗🔍**

For best results, ensure good lighting and clear ingredient positioning. The AI works best with individual ingredients rather than complex dishes or mixed items.
