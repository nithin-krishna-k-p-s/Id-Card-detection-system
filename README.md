# ID Card Detection System

A professional web-based ID card and lanyard detection system using YOLO (You Only Look Once) deep learning model. The system detects ID cards and lanyards in real-time from webcam, images, or video files, and triggers an alarm when no ID card is detected.

## Features

- **Multiple Input Sources**: Support for webcam, image files, and video files
- **Real-time Detection**: Live detection with bounding boxes and confidence scores
- **Alarm System**: Automatic alarm when no ID card is detected
- **Professional UI**: Modern, responsive interface with gradient styling
- **Adjustable Threshold**: Customizable confidence threshold for detection
- **Detection Logging**: Real-time log of detection events
- **GitHub Pages Ready**: Easy deployment to GitHub Pages

## Prerequisites

### For Model Conversion (One-time setup)

- Python 3.8 or higher
- PyTorch
- Ultralytics YOLO
- ONNX

### For Web Application

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam (for live detection)

## Setup Instructions

### Step 1: Convert YOLO Model to ONNX Format

The web application requires the model in ONNX format. Convert your trained `best.pt` model:

```bash
pip install torch ultralytics onnx onnxruntime
python convert_to_onnx.py
```

This will generate `best.onnx` in the same directory.

### Step 2: Prepare Files

Ensure you have the following files in your project directory:

```
id-card-detection/
├── index.html
├── style.css
├── app.js
├── best.onnx          (Generated from Step 1)
├── alarm.mp3          (Optional - alarm sound file)
├── convert_to_onnx.py
└── README.md
```

### Step 3: Test Locally

Open `index.html` in your web browser to test the application locally.

**Note**: Due to browser security restrictions, some features (like webcam) may require serving the files through a local web server rather than opening the HTML file directly.

To run a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

Then open `http://localhost:8000` in your browser.

## Usage

### Webcam Detection

1. Click the "📷 Webcam" button
2. Grant camera permissions when prompted
3. Click "▶ Start Detection" to begin
4. The system will detect ID cards and lanyards in real-time
5. An alarm will sound if no ID card is detected

### Image Detection

1. Click the "📁 Upload Image" button
2. Select an image file
3. Click "▶ Start Detection" to analyze the image

### Video Detection

1. Click the "🎬 Upload Video" button
2. Select a video file
3. Click "▶ Start Detection" to analyze the video

### Settings

- **Confidence Threshold**: Adjust the minimum confidence level for detections (0-100%)
- **Alarm Toggle**: Enable or disable the alarm for missing ID cards

## Deployment to GitHub Pages

### Method 1: Using GitHub Actions (Recommended)

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to repository Settings → Pages
4. Under "Build and deployment", select "GitHub Actions" as the source
5. The `.github/workflows/pages.yml` file will automatically deploy your site

### Method 2: Using Main Branch

1. Create a new GitHub repository
2. Push all files to the repository
3. Go to repository Settings → Pages
4. Under "Build and deployment", select "Deploy from a branch"
5. Choose "main" (or "master") branch and "/ (root)" folder
6. Click Save

Your site will be available at: `https://yourusername.github.io/repository-name/`

## Customization

### Model Classes

Edit the `classNames` array in `app.js` to match your trained model's classes:

```javascript
this.classNames = ['id_card', 'lanyard'];
```

### Detection Colors

Modify the `classColors` object in `app.js` to change bounding box colors:

```javascript
this.classColors = {
    'id_card': '#00ff00',
    'lanyard': '#00ffff'
};
```

### Alarm Sound

Replace `alarm.mp3` with your preferred alarm sound file, or the system will use a generated beep sound as fallback.

## Troubleshooting

### Model Loading Issues

- Ensure `best.onnx` is in the same directory as `index.html`
- Check browser console for specific error messages
- Verify the model was converted correctly

### Webcam Not Working

- Ensure you've granted camera permissions
- Check if another application is using the webcam
- Try using HTTPS or localhost (browsers restrict camera access on regular HTTP)

### Detection Not Accurate

- Adjust the confidence threshold
- Ensure the model was trained on similar data
- Check lighting conditions for webcam detection

### GitHub Pages Deployment Issues

- Ensure the repository is public
- Check GitHub Actions logs for deployment errors
- Verify all files are committed and pushed

## Technical Details

- **Framework**: Pure HTML/CSS/JavaScript
- **Model Runtime**: ONNX Runtime Web
- **Detection Model**: YOLO (converted to ONNX)
- **Browser Compatibility**: Modern browsers with WebGL support

## License

This project is provided as-is for ID card detection purposes. Ensure compliance with local privacy laws and regulations when deploying this system.

## Support

For issues or questions, please refer to the YOLO documentation and ONNX Runtime Web documentation.
