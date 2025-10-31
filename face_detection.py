try:
    from flask import Flask, request, jsonify
    import cv2
    import numpy as np
    import base64
    import io
    from PIL import Image
except ImportError as e:
    print(f"Import error: {e}")
    print("Please install required packages: pip install flask opencv-python numpy pillow")
    exit(1)

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/api/detect-faces', methods=['POST'])
def detect_faces():
    try:
        data = request.get_json()
        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))

        # Resize uploaded image for consistent detection
        base_width = 640
        w_percent = base_width / float(image.width)
        h_size = int(float(image.height) * w_percent)
        image = image.resize((base_width, h_size), Image.Resampling.LANCZOS)

        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_smile.xml')

        nose_cascade = None
        for path in [
            cv2.data.haarcascades + 'haarcascade_mcs_nose.xml',
            'haarcascade_mcs_nose.xml',
            '/usr/share/opencv4/haarcascades/haarcascade_mcs_nose.xml'
        ]:
            nose_cascade = cv2.CascadeClassifier(path)
            if not nose_cascade.empty():
                break
            nose_cascade = None

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
        features_found = len(faces) > 0

        if features_found:
            overlay = frame.copy()
            cv2.rectangle(overlay, (10, 10), (220, 130), (20, 20, 20), -1)
            cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
            cv2.rectangle(frame, (10, 10), (220, 130), (255, 255, 255), 2)
            cv2.rectangle(frame, (11, 11), (219, 129), (100, 100, 100), 1)
            cv2.putText(frame, 'FEATURE DETECTION', (15, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            cv2.line(frame, (15, 32), (205, 32), (255, 255, 255), 1)

            items = [((0,255,0),'Face'), ((255,100,0),'Eyes'), ((0,255,255),'Nose'),
                     ((255,0,255),'Mouth'), ((0,165,255),'Ears')]
            y = 40
            for color, label in items:
                cv2.rectangle(frame, (15, y), (25, y+10), color, -1)
                cv2.rectangle(frame, (15, y), (25, y+10), (255,255,255), 1)
                cv2.putText(frame, label, (30, y+7), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255,255,255), 1)
                y += 15
            cv2.putText(frame, f'Detected: {len(faces)}', (120, 47), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0,255,0), 1)

        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0,255,0), 3)
            roi_gray = gray[y:y+h, x:x+w]
            roi_color = frame[y:y+h, x:x+w]

            eyes = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=8, minSize=(20,20), maxSize=(80,80))
            valid_eyes = [e for e in eyes if e[1] < h//2]
            for (ex, ey, ew, eh) in valid_eyes[:2]:
                cv2.rectangle(roi_color, (ex,ey), (ex+ew, ey+eh), (255,100,0), 2)

            nose_detected = False
            if nose_cascade:
                noses = nose_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=5, minSize=(30,30), maxSize=(100,100))
                for (nx, ny, nw, nh) in noses:
                    if h*0.3 < ny < h*0.7:
                        cv2.rectangle(roi_color, (nx, ny), (nx+nw, ny+nh), (0,255,255), 2)
                        nose_detected = True
                        break
            if not nose_detected:
                nx, ny, nw, nh = w//2-15, int(h*0.4), 30, 30
                cv2.rectangle(roi_color, (nx, ny), (nx+nw, ny+nh), (0,255,255), 2)

            mouths = smile_cascade.detectMultiScale(roi_gray, scaleFactor=1.2, minNeighbors=15, minSize=(40,20), maxSize=(120,80))
            for (mx, my, mw, mh) in mouths:
                if my > h/2:
                    cv2.rectangle(roi_color, (mx,my), (mx+mw,my+mh), (255,0,255), 2)
                    break

            ear_w, ear_h = int(w*0.15), int(h*0.25)
            left_ear = (max(-5,-ear_w//2), int(h*0.35))
            right_ear = (min(w-ear_w//2, w-5), int(h*0.35))
            cv2.rectangle(roi_color, left_ear, (left_ear[0]+ear_w, left_ear[1]+ear_h), (0,165,255), 2)
            cv2.rectangle(roi_color, right_ear, (right_ear[0]+ear_w, right_ear[1]+ear_h), (0,165,255), 2)

        _, buffer = cv2.imencode('.jpg', frame)
        result_image = base64.b64encode(buffer).decode('utf-8')
        return jsonify({
            'success': True,
            'result_image': f"data:image/jpeg;base64,{result_image}",
            'face_count': len(faces),
            'features_detected': features_found
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("👤 Face Detection Server - Port 8000")
    app.run(host='0.0.0.0', port=8000, debug=True)
