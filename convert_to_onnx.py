"""
YOLO Model Conversion Script
Converts PyTorch .pt model to ONNX format for browser deployment
"""

import torch
from ultralytics import YOLO

def convert_model():
    """
    Convert YOLO .pt model to ONNX format
    """
    print("Loading YOLO model...")
    
    # Load the trained model
    model = YOLO('best.pt')
    
    print("Exporting to ONNX format...")
    
    # Export to ONNX
    model.export(
        format='onnx',
        imgsz=640,
        opset=12,
        simplify=True,
        dynamic=False
    )
    
    print("Model conversion completed!")
    print("Output file: best.onnx")
    print("\nImportant: Place 'best.onnx' in the same directory as index.html")

if __name__ == "__main__":
    try:
        convert_model()
    except Exception as e:
        print(f"Error during conversion: {e}")
        print("\nMake sure you have the required packages installed:")
        print("pip install torch ultralytics onnx onnxruntime")
