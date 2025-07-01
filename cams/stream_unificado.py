from flask import Flask, Response
import cv2
import threading
import time
import numpy as np

app = Flask(__name__)

# Configuração flexível para cada câmera (local ou RTSP)
camera_configs = {
    # Webcams locais (usando índice)
    0: {"type": "local", "src": 0, "fps": 30, "resolution": (1280, 720), "jpeg_quality": 80},
    1: {"type": "local", "src": 1, "fps": 30, "resolution": (1280, 720), "jpeg_quality": 80},
    
    # Stream RTSP (usando URL)
    2: {
        "type": "rtsp", 
        "src": "rtsp://admin:@143.106.61.220:554/user=admin&password=&channel=0&stream=0.sdp?real_stream",
        "fps": 60, 
        #"resolution": (1280, 960), # Resolução max:(2304, 1206)
        "resolution": (960, 582), # Resolução max:(2304, 1206)
        "jpeg_quality": 50, # Qualidade reduzida (0-100)
        "buffer_size": 1, # Buffer mínimo para reduzir latência
        "frame_skip": 1, # Pular frames para reduzir processamento
        "tcp_transport": False # Usar transporte TCP para maior estabilidade
    },
    # Stream RTSP (usando URL)
    3: {
        "type": "rtsp", 
        "src": "rtsp://143.106.61.220:554/user=admin_password=admin_channel=1_stream=0.sdp?real_stream",
        "fps": 60, 
        #"resolution": (1280, 960), # Resolução max:(2304, 1206)
        "resolution": (960, 582), # Resolução max:(2304, 1206)
        "jpeg_quality": 50, # Qualidade reduzida (0-100)
        "buffer_size": 1, # Buffer mínimo para reduzir latência
        "frame_skip": 1, # Pular frames para reduzir processamento
        "tcp_transport": False # Usar transporte TCP para maior estabilidade
    }
}

# Buffer compartilhado dinâmico
camera_buffers = {}
for cam_id in camera_configs:
    camera_buffers[cam_id] = {"frame": None, "lock": threading.Lock()}

def capture_camera(camera_id):
    config = camera_configs[camera_id]
    cam_type = config["type"]
    
    print(f"Iniciando captura para câmera {camera_id} ({cam_type.upper()})")
    print(f"Config: FPS={config.get('fps', 'N/A')}, Resolução={config.get('resolution', 'N/A')}")
    
    # Variáveis de controle de tempo
    frame_counter = 0
    last_frame_time = time.time()
    frame_interval = 1.0 / config.get("fps", 30) if config.get("fps") else 0
    
    while True:
        try:
            # Configuração específica para tipo de câmera
            if cam_type == "local":
                # Configuração para webcam local
                cap = cv2.VideoCapture(config["src"], cv2.CAP_DSHOW)
                if not cap.isOpened():
                    raise RuntimeError(f"Falha ao abrir câmera local {config['src']}")
                
                # Aplicar configurações da webcam
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, config["resolution"][0])
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config["resolution"][1])
                cap.set(cv2.CAP_PROP_FPS, config["fps"])
                cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                
            elif cam_type == "rtsp":
                # Configuração para stream RTSP
                url = config["src"]
                
                # Adicionar transporte TCP se necessário
                if config.get("tcp_transport", False) and "?" in url:
                    url += "&rtsp_transport=tcp"
                elif config.get("tcp_transport", False):
                    url += "?rtsp_transport=tcp"
                
                cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
                if not cap.isOpened():
                    raise RuntimeError(f"Falha ao abrir stream RTSP: {url}")
                
                # Configurações específicas para RTSP
                cap.set(cv2.CAP_PROP_BUFFERSIZE, config.get("buffer_size", 1))
            
            # Loop principal de captura
            while True:
                current_time = time.time()
                
                # Controle de FPS
                if frame_interval > 0:
                    elapsed = current_time - last_frame_time
                    if elapsed < frame_interval:
                        time.sleep(0.001)
                        continue
                    last_frame_time = current_time
                
                # Capturar frame
                ret, frame = cap.read()
                if not ret:
                    print(f"Falha na leitura do frame (Câmera {camera_id})")
                    break
                
                # Pular frames (se configurado)
                frame_counter += 1
                if config.get("frame_skip", 0) > 0 and frame_counter % config["frame_skip"] != 0:
                    continue
                
                # Redimensionar se necessário
                target_res = config.get("resolution")
                if target_res and (frame.shape[1], frame.shape[0]) != target_res:
                    frame = cv2.resize(frame, target_res)
                
                # Codificar como JPEG
                quality = config.get("jpeg_quality", 80)
                _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
                
                # Atualizar buffer compartilhado
                with camera_buffers[camera_id]["lock"]:
                    camera_buffers[camera_id]["frame"] = buffer.tobytes()
        
        except Exception as e:
            print(f"Erro na câmera {camera_id}: {str(e)}")
        
        # Reconexão com tratamento diferenciado
        reconnect_delay = config.get("reconnect_delay", 2 if cam_type == "local" else 5)
        print(f"Reconectando à câmera {camera_id} em {reconnect_delay}s...")
        time.sleep(reconnect_delay)
        
        # Liberar recursos se existirem
        if 'cap' in locals() and cap.isOpened():
            cap.release()

def generate_feed(camera_id):
    last_valid_frame = None
    config = camera_configs.get(camera_id, {})
    resolution = config.get("resolution", (640, 480))
    
    while True:
        # Obter frame mais recente
        with camera_buffers[camera_id]["lock"]:
            frame = camera_buffers[camera_id]["frame"]
        
        # Usar último frame válido se o atual for None
        if frame:
            last_valid_frame = frame
        elif last_valid_frame:
            frame = last_valid_frame
        else:
            # Gerar frame preto como fallback
            frame = None
        
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        else:
            # Frame preto de fallback
            black_frame = np.zeros((resolution[1], resolution[0], 3), dtype=np.uint8)
            _, buffer = cv2.imencode('.jpg', black_frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.1)

# Criar rotas dinamicamente para cada câmera
for cam_id in camera_configs:
    app.add_url_rule(
        f'/video_feed_{cam_id}',
        f'video_feed_{cam_id}',
        lambda cam_id=cam_id: Response(
            generate_feed(cam_id),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
    )

if __name__ == '__main__':
    # Iniciar threads de captura para cada câmera configurada
    for cam_id in camera_configs:
        threading.Thread(target=capture_camera, args=(cam_id,), daemon=True).start()
    
    app.run(host='0.0.0.0', port=5000, threaded=True, use_reloader=False)