import time
from flask import Flask, Response
import cv2

app = Flask(__name__)

def generate():
    cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)  # Largura da resolução
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)  # Altura da resolução
    cap.set(cv2.CAP_PROP_FPS, 2)  # Taxa de quadros (opcional)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 95]
        _, buffer = cv2.imencode('.jpg', frame, encode_param)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed_1')
def video_feed():
    return Response(generate(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    while True:
        try:
            app.run(host='0.0.0.0', port=5001, debug=True)
        except Exception as e:
            print(f"Erro detectado: {e}. Reiniciando o servidor em 1 segundos...")
            time.sleep(1)
