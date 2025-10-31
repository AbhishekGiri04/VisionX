#!/usr/bin/env python3
import subprocess
import threading
import time
import os

def run_server(file, name):
    print(f"🚀 Starting {name}...")
    subprocess.run(['python3', file])

def run_frontend():
    print("🎨 Starting Frontend...")
    time.sleep(3)  # Wait for backend servers
    
    # Get absolute path to frontend directory
    frontend_path = os.path.join(os.getcwd(), 'frontend')
    
    # Set environment to auto-open browser
    env = os.environ.copy()
    env['BROWSER'] = 'chrome'  # Auto open Chrome
    env['PORT'] = '3001'  # Use different port if 3000 is busy
    
    subprocess.run(['npm', 'start'], cwd=frontend_path, env=env)

if __name__ == '__main__':
    print("🚀 VisionX - Starting All Servers")
    print("📍 Face Detection: http://localhost:8000")
    print("📍 Object Detection: http://localhost:8001")
    print("📍 Frontend: http://localhost:3001")
    
    # Start all backend servers
    threading.Thread(target=run_server, args=('face_detection.py', 'Face Detection')).start()
    threading.Thread(target=run_server, args=('object_detection.py', 'Object Detection')).start()
    
    # Start frontend
    run_frontend()