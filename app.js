// ID Card Detection System
class IDCardDetector {
    constructor() {
        this.model = null;
        this.isRunning = false;
        this.currentStream = null;
        this.animationId = null;
        this.confidenceThreshold = 0.5;
        this.alarmEnabled = true;
        this.alarmSound = null;
        this.isAlarmPlaying = false;
        
        this.classNames = ['id_card', 'lanyard'];
        this.classColors = {
            'id_card': '#00ff00',
            'lanyard': '#00ffff'
        };
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadAlarmSound();
    }

    initializeElements() {
        this.videoElement = document.getElementById('videoElement');
        this.canvasElement = document.getElementById('canvasElement');
        this.ctx = this.canvasElement.getContext('2d');
        this.placeholder = document.getElementById('placeholder');
        
        this.webcamBtn = document.getElementById('webcamBtn');
        this.imageBtn = document.getElementById('imageBtn');
        this.videoBtn = document.getElementById('videoBtn');
        this.imageInput = document.getElementById('imageInput');
        this.videoInput = document.getElementById('videoInput');
        
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        
        this.confidenceThreshold = document.getElementById('confidenceThreshold');
        this.confidenceValue = document.getElementById('confidenceValue');
        this.alarmToggle = document.getElementById('alarmToggle');
        
        this.statusText = document.getElementById('statusText');
        this.idCardCount = document.getElementById('idCardCount');
        this.lanyardCount = document.getElementById('lanyardCount');
        this.alarmStatus = document.getElementById('alarmStatus');
        this.logContainer = document.getElementById('logContainer');
        
        this.alarmSound = document.getElementById('alarmSound');
    }

    initializeEventListeners() {
        this.webcamBtn.addEventListener('click', () => this.startWebcam());
        this.imageBtn.addEventListener('click', () => this.imageInput.click());
        this.videoBtn.addEventListener('click', () => this.videoInput.click());
        
        this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        this.videoInput.addEventListener('change', (e) => this.handleVideoUpload(e));
        
        this.startBtn.addEventListener('click', () => this.startDetection());
        this.stopBtn.addEventListener('click', () => this.stopDetection());
        
        this.confidenceThreshold.addEventListener('input', (e) => {
            this.confidenceValue.textContent = e.target.value + '%';
        });
        
        this.alarmToggle.addEventListener('change', (e) => {
            this.alarmEnabled = e.target.checked;
            this.log(`Alarm ${this.alarmEnabled ? 'enabled' : 'disabled'}`);
        });
    }

    loadAlarmSound() {
        // Create a simple beep sound using Web Audio API as fallback
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playAlarm() {
        if (!this.alarmEnabled || this.isAlarmPlaying) return;
        
        this.isAlarmPlaying = true;
        this.alarmStatus.textContent = 'ALARM';
        this.alarmStatus.className = 'status-value status-danger';
        
        // Try to play the audio file first
        if (this.alarmSound) {
            this.alarmSound.currentTime = 0;
            this.alarmSound.play().catch(() => {
                // Fallback to Web Audio API
                this.playBeep();
            });
        } else {
            this.playBeep();
        }
    }

    stopAlarm() {
        this.isAlarmPlaying = false;
        this.alarmStatus.textContent = 'OK';
        this.alarmStatus.className = 'status-value status-ok';
        
        if (this.alarmSound) {
            this.alarmSound.pause();
        }
        
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
    }

    playBeep() {
        try {
            this.oscillator = this.audioContext.createOscillator();
            this.gainNode = this.audioContext.createGain();
            
            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            this.oscillator.frequency.value = 800;
            this.oscillator.type = 'sine';
            this.gainNode.gain.value = 0.3;
            
            this.oscillator.start();
            
            // Create beeping pattern
            const beepInterval = setInterval(() => {
                if (!this.isAlarmPlaying) {
                    clearInterval(beepInterval);
                    return;
                }
                this.oscillator.frequency.value = this.oscillator.frequency.value === 800 ? 1200 : 800;
            }, 500);
        } catch (error) {
            console.error('Error playing beep:', error);
        }
    }

    async loadModel() {
        try {
            this.log('Loading ONNX model...');
            this.statusText.textContent = 'Loading model...';
            
            // Try to load the model
            this.model = await ort.InferenceSession.create('best.onnx');
            
            this.log('Model loaded successfully', 'success');
            this.statusText.textContent = 'Model loaded';
            return true;
        } catch (error) {
            this.log(`Error loading model: ${error.message}`, 'error');
            this.statusText.textContent = 'Model load failed';
            console.error('Model loading error:', error);
            return false;
        }
    }

    async startWebcam() {
        try {
            this.log('Starting webcam...');
            this.currentStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            
            this.videoElement.srcObject = this.currentStream;
            this.videoElement.style.display = 'block';
            this.placeholder.style.display = 'none';
            
            this.startBtn.disabled = false;
            this.log('Webcam started successfully', 'success');
        } catch (error) {
            this.log(`Webcam error: ${error.message}`, 'error');
            console.error('Webcam error:', error);
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.log(`Loading image: ${file.name}`);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.videoElement.src = e.target.result;
            this.videoElement.style.display = 'block';
            this.placeholder.style.display = 'none';
            this.startBtn.disabled = false;
            this.log('Image loaded successfully', 'success');
        };
        
        reader.readAsDataURL(file);
    }

    handleVideoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.log(`Loading video: ${file.name}`);
        const url = URL.createObjectURL(file);
        
        this.videoElement.src = url;
        this.videoElement.style.display = 'block';
        this.placeholder.style.display = 'none';
        this.startBtn.disabled = false;
        this.log('Video loaded successfully', 'success');
    }

    async startDetection() {
        if (!this.model) {
            const modelLoaded = await this.loadModel();
            if (!modelLoaded) {
                this.log('Failed to load model. Please ensure best.onnx is in the directory.', 'error');
                return;
            }
        }
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.statusText.textContent = 'Detecting...';
        this.log('Detection started');
        
        // Set canvas size to match video
        this.canvasElement.width = this.videoElement.videoWidth || 640;
        this.canvasElement.height = this.videoElement.videoHeight || 480;
        
        this.detectFrame();
    }

    stopDetection() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.statusText.textContent = 'Stopped';
        this.stopAlarm();
        this.log('Detection stopped');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    async detectFrame() {
        if (!this.isRunning) return;
        
        try {
            // Prepare input tensor
            const input = this.prepareInput();
            
            // Run inference
            const outputs = await this.model.run({ images: input });
            
            // Process outputs
            const detections = this.processOutputs(outputs);
            
            // Draw detections
            this.drawDetections(detections);
            
            // Update status
            this.updateStatus(detections);
            
        } catch (error) {
            console.error('Detection error:', error);
        }
        
        this.animationId = requestAnimationFrame(() => this.detectFrame());
    }

    prepareInput() {
        // Create canvas for preprocessing
        const preprocessCanvas = document.createElement('canvas');
        preprocessCanvas.width = 640;
        preprocessCanvas.height = 640;
        const preprocessCtx = preprocessCanvas.getContext('2d');
        
        // Draw video frame to canvas
        preprocessCtx.drawImage(this.videoElement, 0, 0, 640, 640);
        
        // Get image data
        const imageData = preprocessCtx.getImageData(0, 0, 640, 640);
        const data = imageData.data;
        
        // Convert to RGB and normalize
        const input = new Float32Array(3 * 640 * 640);
        for (let i = 0; i < 640 * 640; i++) {
            input[i] = data[i * 4] / 255.0;           // R
            input[i + 640 * 640] = data[i * 4 + 1] / 255.0;  // G
            input[i + 2 * 640 * 640] = data[i * 4 + 2] / 255.0;  // B
        }
        
        return new ort.Tensor('float32', input, [1, 3, 640, 640]);
    }

    processOutputs(outputs) {
        const detections = [];
        const threshold = this.confidenceThreshold.value / 100;
        
        // YOLO output format: [batch, 84, 8400] for YOLOv8
        // 84 = 4 (bbox) + 80 (classes) - adjust based on your model
        const output = outputs[Object.keys(outputs)[0]];
        const outputData = output.data;
        
        // Process detections (simplified - adjust based on your model's output format)
        const numDetections = 8400; // Standard YOLOv8 output
        const numClasses = this.classNames.length;
        
        for (let i = 0; i < numDetections; i++) {
            const offset = i * (4 + numClasses);
            
            // Get confidence scores
            let maxConfidence = 0;
            let maxClassIndex = 0;
            
            for (let j = 0; j < numClasses; j++) {
                const confidence = outputData[offset + 4 + j];
                if (confidence > maxConfidence) {
                    maxConfidence = confidence;
                    maxClassIndex = j;
                }
            }
            
            if (maxConfidence > threshold) {
                // Get bounding box (center format)
                const cx = outputData[offset];
                const cy = outputData[offset + 1];
                const w = outputData[offset + 2];
                const h = outputData[offset + 3];
                
                // Convert to corner format
                const x = cx - w / 2;
                const y = cy - h / 2;
                
                // Scale to original image size
                const scaleX = this.canvasElement.width / 640;
                const scaleY = this.canvasElement.height / 640;
                
                detections.push({
                    x: x * scaleX,
                    y: y * scaleY,
                    width: w * scaleX,
                    height: h * scaleY,
                    confidence: maxConfidence,
                    class: this.classNames[maxClassIndex]
                });
            }
        }
        
        return detections;
    }

    drawDetections(detections) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Draw each detection
        detections.forEach(detection => {
            const color = this.classColors[detection.class] || '#00ff00';
            
            // Draw bounding box
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(
                detection.x,
                detection.y,
                detection.width,
                detection.height
            );
            
            // Draw label background
            const label = `${detection.class}: ${(detection.confidence * 100).toFixed(1)}%`;
            this.ctx.font = 'bold 16px Arial';
            const textWidth = this.ctx.measureText(label).width;
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
                detection.x,
                detection.y - 25,
                textWidth + 10,
                25
            );
            
            // Draw label text
            this.ctx.fillStyle = '#000';
            this.ctx.fillText(
                label,
                detection.x + 5,
                detection.y - 7
            );
        });
    }

    updateStatus(detections) {
        const idCards = detections.filter(d => d.class === 'id_card');
        const lanyards = detections.filter(d => d.class === 'lanyard');
        
        this.idCardCount.textContent = idCards.length;
        this.lanyardCount.textContent = lanyards.length;
        
        // Alarm logic: trigger alarm if no ID card is detected
        if (idCards.length === 0 && this.alarmEnabled) {
            this.playAlarm();
        } else {
            this.stopAlarm();
        }
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('p');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
        
        // Keep only last 50 entries
        while (this.logContainer.children.length > 50) {
            this.logContainer.removeChild(this.logContainer.firstChild);
        }
    }
}

// Initialize the detector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.detector = new IDCardDetector();
});
