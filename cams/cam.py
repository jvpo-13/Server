from flask import Flask, Response
import cv2
import threading
import time
import numpy as np

app = Flask(__name__)

# Configurações otimizadas
rtsp_urls = {
    2: "rtsp://admin:@143.106.61.220:554/user=admin&password=&channel=0&stream=0.sdp?real_stream",
    # Adicione mais câmeras conforme necessário
}

# Configurações de performance ajustáveis
CONFIG = {
    'target_fps': 60,               # FPS reduzido para aliviar a carga
    'jpeg_quality': 100,              # Qualidade reduzida (0-100)
    'resolution': (2304, 1206),        # Resolução reduzida
    'buffer_size': 1,                # Buffer mínimo para reduzir latência
    'frame_skip': 10,                 # Pular frames para reduzir processamento
    'reconnect_delay': 1,            # Tempo entre tentativas de reconexão
    'tcp_transport': True            # Usar transporte TCP para maior estabilidade
}

# Buffer compartilhado
camera_buffers = {}
for cam_id in rtsp_urls:
    camera_buffers[cam_id] = {"frame": None, "lock": threading.Lock()}

def capture_camera(camera_id):
    url = rtsp_urls[camera_id]
    
    # Adicionar transporte TCP se necessário para maior estabilidade
    if CONFIG['tcp_transport'] and "rtsp" in url:
        url += "&rtsp_transport=tcp" if "?" in url else "?rtsp_transport=tcp"
    
    print(f"Iniciando captura para câmera {camera_id} com FPS={CONFIG['target_fps']}, Qualidade={CONFIG['jpeg_quality']}")
    
    frame_counter = 0
    last_frame_time = time.time()
    frame_interval = 1.0 / CONFIG['target_fps']
    
    while True:
        try:
            cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
            if not cap.isOpened():
                raise RuntimeError(f"Falha ao abrir stream {camera_id}")
                
            cap.set(cv2.CAP_PROP_BUFFERSIZE, CONFIG['buffer_size'])
            
            while True:
                current_time = time.time()
                elapsed = current_time - last_frame_time
                
                # Pular frames para atingir o FPS desejado
                if elapsed < frame_interval:
                    time.sleep(0.001)
                    continue
                
                # Tentar ler frame
                ret, frame = cap.read()
                last_frame_time = current_time
                
                if not ret:
                    print(f"Frame vazio recebido (Câmera {camera_id})")
                    break
                
                # Aplicar otimizações de performance
                frame_counter += 1
                if frame_counter % CONFIG['frame_skip'] != 0:
                    continue
                
                # Reduzir resolução
                if CONFIG['resolution']:
                    frame = cv2.resize(frame, CONFIG['resolution'])
                
                # Codificar com qualidade reduzida
                _, buffer = cv2.imencode(
                    '.jpg', 
                    frame, 
                    [int(cv2.IMWRITE_JPEG_QUALITY), CONFIG['jpeg_quality']]
                )
                
                # Atualizar buffer compartilhado
                with camera_buffers[camera_id]["lock"]:
                    camera_buffers[camera_id]["frame"] = buffer.tobytes()
                
        except Exception as e:
            print(f"Erro na câmera {camera_id}: {str(e)}")
        
        # Reconexão com tratamento de erro
        print(f"Reconectando à câmera {camera_id} em {CONFIG['reconnect_delay']}s...")
        time.sleep(CONFIG['reconnect_delay'])
        if 'cap' in locals() and cap.isOpened():
            cap.release()

def generate_feed(camera_id):
    last_frame = None
    
    while True:
        # Obter frame mais recente
        with camera_buffers[camera_id]["lock"]:
            frame = camera_buffers[camera_id]["frame"]
        
        # Usar último frame válido se o atual for None
        if frame is None:
            frame = last_frame
        else:
            last_frame = frame
        
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        else:
            # Gerar frame preto como fallback
            black_frame = np.zeros((CONFIG['resolution'][1], CONFIG['resolution'][0], 3), dtype=np.uint8)
            _, buffer = cv2.imencode('.jpg', black_frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.1)

# Criar rotas dinamicamente
for cam_id in rtsp_urls:
    app.add_url_rule(
        f'/video_feed_{cam_id}',
        f'video_feed_{cam_id}',
        lambda cam_id=cam_id: Response(
            generate_feed(cam_id),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
    )

if __name__ == '__main__':
    # Iniciar threads de captura
    for cam_id in rtsp_urls:
        threading.Thread(target=capture_camera, args=(cam_id,), daemon=True).start()
    
    app.run(host='0.0.0.0', port=5000, threaded=True, use_reloader=False)