from flask import Flask, Response
import cv2
import threading
import time

app = Flask(__name__)

# Buffer compartilhado para cada câmera
camera_buffers = {
    0: {"frame": None, "lock": threading.Lock()},
    1: {"frame": None, "lock": threading.Lock()},
    2: {"frame": None, "lock": threading.Lock()}
}

def capture_camera(camera_id):
    cap = cv2.VideoCapture(camera_id, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))  # Formato melhor para streaming
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Reduz latência
    
    while True:
        ret, frame = cap.read()
        if ret:
            with camera_buffers[camera_id]["lock"]:
                _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 100])
                camera_buffers[camera_id]["frame"] = buffer.tobytes()
        else:
            print(f"Câmera {camera_id} desconectada. Reconectando...")
            cap.release()
            cap = cv2.VideoCapture(camera_id, cv2.CAP_DSHOW)
            time.sleep(2)

def generate_feed(camera_id):
    while True:
        with camera_buffers[camera_id]["lock"]:
            frame = camera_buffers[camera_id]["frame"]
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed_0')
def video_feed_0():
    return Response(generate_feed(0), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed_1')
def video_feed_1():
    return Response(generate_feed(1), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed_2')
def video_feed_2():
    return Response(generate_feed(2), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    # Inicia threads de captura para cada câmera
    for cam_id in [0, 1, 2]:
        threading.Thread(target=capture_camera, args=(cam_id,), daemon=True).start()
    
    app.run(host='0.0.0.0', port=5000, threaded=True)