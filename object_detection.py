from flask import Flask, request, jsonify, Response
import cv2
import numpy as np
import base64
from PIL import Image
import io
import threading

app = Flask(__name__)

# ------------------- Load YOLOv8 Model -------------------
try:
    from ultralytics import YOLO
    model = YOLO("yolov8n.pt")
    YOLO_AVAILABLE = True
    print("✅ YOLOv8 model loaded successfully.")
except Exception as e:
    YOLO_AVAILABLE = False
    model = None
    print("⚠️ YOLOv8 not available:", e)


# ------------------- Webcam Globals -------------------
camera = None
camera_running = False


# ------------------- Detection Function -------------------
def detect_objects(frame):
    """Runs YOLO detection on frame and returns annotated frame + detected object list"""
    detected_objects = []
    if YOLO_AVAILABLE:
        results = model(frame)
        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                label = model.names[cls_id]

                # Detect only Person, Cat, Dog
                if label.lower() not in ['person', 'cat', 'dog']:
                    continue
                if conf < 0.4:
                    continue

                color = (0, 0, 255)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"{label.capitalize()} {conf:.2f}",
                            (x1, max(20, y1 - 10)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                detected_objects.append({
                    "label": label.capitalize(),
                    "confidence": round(conf, 2),
                    "box": [x1, y1, x2, y2]
                })
    return frame, detected_objects


# ------------------- CORS Settings -------------------
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response


# ------------------- Image Upload Detection -------------------
@app.route("/api/detect-objects", methods=["POST"])
def detect_image():
    try:
        data = request.get_json()
        image_data = data["image"].split(",")[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        frame = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        frame, detected_objects = detect_objects(frame)

        _, buffer = cv2.imencode(".jpg", frame)
        result_image = base64.b64encode(buffer).decode("utf-8")

        return jsonify({
            "success": True,
            "result_image": f"data:image/jpeg;base64,{result_image}",
            "object_count": len(detected_objects),
            "detected_objects": [obj["label"] for obj in detected_objects]
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


# ------------------- Webcam Stream -------------------
def generate_frames():
    global camera, camera_running
    while camera_running and camera.isOpened():
        success, frame = camera.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)  # Mirror effect for webcam
        frame, _ = detect_objects(frame)

        _, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()

        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")


@app.route("/api/start-webcam", methods=["GET"])
def start_webcam():
    global camera, camera_running
    if camera_running:
        return jsonify({"success": False, "message": "Webcam already running"})

    camera = cv2.VideoCapture(0)
    if not camera.isOpened():
        return jsonify({"success": False, "message": "Failed to open webcam"})

    camera_running = True
    threading.Thread(target=lambda: None, daemon=True).start()
    return jsonify({"success": True, "message": "Webcam started"})


@app.route("/api/stop-webcam", methods=["GET"])
def stop_webcam():
    global camera, camera_running
    if camera_running:
        camera_running = False
        camera.release()
        return jsonify({"success": True, "message": "Webcam stopped"})
    return jsonify({"success": False, "message": "Webcam not running"})


@app.route("/api/video-feed")
def video_feed():
    if not camera_running:
        return jsonify({"success": False, "message": "Webcam not running"})
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")


# ------------------- Health Check -------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


# ------------------- Run Server -------------------
if __name__ == "__main__":
    print("🐾 AI Object Detection Server - Port 8001")
    print("✨ Supports both: Webcam Stream + Image Upload")
    print("🎯 Detects only: Person, Cat, Dog")
    app.run(host="0.0.0.0", port=8001, debug=True)