import cv2

# Abre a webcam (0 para a webcam padrão do sistema)
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Erro ao acessar a webcam")
    exit()

while True:
    # Lê um frame da webcam
    ret, frame = cap.read()

    if not ret:
        print("Erro ao capturar frame")
        break

    # Mostra o frame capturado
    cv2.imshow("Webcam", frame)

    # Fecha a janela quando a tecla 'q' é pressionada
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Libera a câmera e fecha as janelas
cap.release()
cv2.destroyAllWindows()
