from flask import Flask, Response
import cv2
import threading
import time
import numpy as np

app = Flask(__name__)

# Configuração flexível para cada câmera
camera_configs = {
    0: {"type": "local", "src": 0, "fps": 30, "resolution": (1280, 720), "jpeg_quality": 80},
    1: {"type": "local", "src": 1, "fps": 30, "resolution": (1280, 720), "jpeg_quality": 80},
    2: {
        "type": "rtsp", 
        "src": "rtsp://admin:@143.106.61.220:554/user=admin&password=&channel=0&stream=0.sdp?real_stream",
        "fps": 60, 
        "resolution": (960, 582),
        "jpeg_quality": 50,
        "buffer_size": 1,
        "frame_skip": 3,
        "tcp_transport": False
    },
    3: {
        "type": "rtsp", 
        "src": "rtsp://143.106.61.220:554/user=admin_password=admin_channel=1_stream=0.sdp?real_stream",
        "fps": 30, 
        "resolution": (960, 582),
        "jpeg_quality": 50,
        "buffer_size": 1,
        "frame_skip": 3,
        "tcp_transport": False
    }
}

# Estruturas de dados compartilhadas
camera_buffers = {}
camera_controllers = {}
for cam_id in camera_configs:
    camera_buffers[cam_id] = {"frame": None, "lock": threading.Lock()}
    camera_controllers[cam_id] = {
        "active": False,
        "lock": threading.Lock(),
        "active_clients": 0,
        "thread": None,
        "stop_event": threading.Event()
    }

# Contador global de clientes
active_clients_lock = threading.Lock()
active_clients_count = {cam_id: 0 for cam_id in camera_configs}

def capture_camera(camera_id):
    config = camera_configs[camera_id]
    controller = camera_controllers[camera_id]
    
    print(f"Iniciando captura para câmera {camera_id}")
    
    while not controller["stop_event"].is_set():
        try:
            # Configuração específica para tipo de câmera
            if config["type"] == "local":
                cap = cv2.VideoCapture(config["src"], cv2.CAP_DSHOW)
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, config["resolution"][0])
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config["resolution"][1])
                cap.set(cv2.CAP_PROP_FPS, config["fps"])
                cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            elif config["type"] == "rtsp":
                url = config["src"]
                if config.get("tcp_transport", False):
                    url += "&rtsp_transport=tcp" if "?" in url else "?rtsp_transport=tcp"
                cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, config.get("buffer_size", 1))
            
            if not cap.isOpened():
                raise RuntimeError(f"Falha ao abrir câmera {camera_id}")
            
            # Variáveis de controle
            frame_counter = 0
            last_frame_time = time.time()
            frame_interval = 1.0 / config["fps"]
            
            # Loop de captura ativo
            while not controller["stop_event"].is_set():
                # Verificar se ainda há clientes ativos
                with active_clients_lock:
                    if active_clients_count[camera_id] == 0:
                        break
                
                # Controle de FPS
                current_time = time.time()
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
                
                # Pular frames se necessário
                frame_counter += 1
                if config.get("frame_skip", 0) > 0 and frame_counter % config["frame_skip"] != 0:
                    continue
                
                # Processamento do frame
                target_res = config.get("resolution")
                if target_res and (frame.shape[1], frame.shape[0]) != target_res:
                    frame = cv2.resize(frame, target_res)
                
                quality = config.get("jpeg_quality", 80)
                _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
                
                # Atualizar buffer compartilhado
                with camera_buffers[camera_id]["lock"]:
                    camera_buffers[camera_id]["frame"] = buffer.tobytes()
        
        except Exception as e:
            print(f"Erro na câmera {camera_id}: {str(e)}")
        
        # Reconexão após falha
        if 'cap' in locals() and cap.isOpened():
            cap.release()
        
        if not controller["stop_event"].is_set():
            time.sleep(2 if config["type"] == "local" else 5)
    
    # Limpeza final
    with controller["lock"]:
        controller["active"] = False
        controller["thread"] = None
    print(f"Captura encerrada para câmera {camera_id}")

def manage_camera(camera_id):
    """Inicia ou para a captura conforme necessidade de clientes"""
    controller = camera_controllers[camera_id]
    
    while True:
        with active_clients_lock:
            clients = active_clients_count[camera_id]
        
        with controller["lock"]:
            # Ativar captura se necessário
            if clients > 0 and not controller["active"]:
                controller["stop_event"].clear()
                controller["active"] = True
                controller["thread"] = threading.Thread(
                    target=capture_camera, 
                    args=(camera_id,),
                    daemon=True
                )
                controller["thread"].start()
                print(f"Ativando captura para câmera {camera_id}")
            
            # Desativar captura se não houver clientes
            elif clients == 0 and controller["active"]:
                controller["stop_event"].set()
                controller["active"] = False
        
        time.sleep(1)  # Verificar a cada segundo

def generate_feed(camera_id):
    """Gerador de frames para streaming"""
    # Registrar novo cliente
    with active_clients_lock:
        active_clients_count[camera_id] += 1
    
    config = camera_configs.get(camera_id, {})
    resolution = config.get("resolution", (640, 480))
    last_valid_frame = None
    
    try:
        while True:
            # Obter frame mais recente
            with camera_buffers[camera_id]["lock"]:
                frame = camera_buffers[camera_id]["frame"]
            
            # Usar último frame válido se disponível
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
                black_frame = np.zeros((resolution[1], resolution[0], 3), dtype=np.uint8)
                _, buffer = cv2.imencode('.jpg', black_frame)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
                time.sleep(0.1)
    finally:
        # Desregistrar cliente ao desconectar
        with active_clients_lock:
            active_clients_count[camera_id] = max(0, active_clients_count[camera_id] - 1)

# Criar rotas e iniciar gerenciadores
for cam_id in camera_configs:
    app.add_url_rule(
        f'/video_feed_{cam_id}',
        f'video_feed_{cam_id}',
        lambda cam_id=cam_id: Response(
            generate_feed(cam_id),
            mimetype='multipart/x-mixed-replace; boundary=frame'
        )
    )
    # Iniciar thread de gerenciamento para cada câmera
    threading.Thread(
        target=manage_camera, 
        args=(cam_id,), 
        daemon=True
    ).start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True, use_reloader=False)