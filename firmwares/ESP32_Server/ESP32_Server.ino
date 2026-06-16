#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define RX1_PIN 16
#define TX1_PIN 17

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pCharacteristic;

unsigned long tempo = 0;
unsigned long encoder = 0;
float bateria = 0;
String mensagemSaved = "";

float velocidade;

void updateDisplay(){
  Serial.print("velocidade: ");
  Serial.print(velocidade);
  Serial.println(" cm/s");
  Serial.println();
}

// Callback para lidar com conexões e desconexões
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    Serial.println("\nCliente conectado.\n");
    delay(1000);
    mensagemSaved = ""; // em caso de reconexão os dados são enviados imediatamente
  }

  void onDisconnect(BLEServer* pServer) {
    Serial.println("\nCliente desconectado.\n");
    // Reinicie a publicidade para aceitar novos clientes
    pServer->startAdvertising();
    Serial.println("\nPronto para aceitar novas conexões.\n");
  }
};


// Callback para lidar com mensagens do cliente
class MyCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) override {
    String value = pCharacteristic->getValue();
    if (value.length() > 0) {
      Serial.println("Valores recebidos do cliente:");
      Serial.println(value.c_str());
      Serial.println();

      // Converta String para uma string C (char array)
      size_t length = value.length(); // Use o método length() corretamente
      char input[length + 1];         // +1 para o caractere nulo
      value.toCharArray(input, length + 1); // Copie o conteúdo da String para o array

      // Use strtok para separar os comandos baseados em '\n'
      char* command = strtok(input, "\n");
      while (command != nullptr) {
        // Encontre o separador ':' dentro do comando
        char* separator = strchr(command, ':');
        if (separator != nullptr) {
          // Divida o comando em duas partes
          *separator = '\0';             // Substitua ':' por '\0' para separar as strings
        //
          if(strcmp(command, "Tempo") == 0)
            tempo = atol(separator + 1); // Parte depois do ':'
          if(strcmp(command, "Enconder") == 0)
            encoder = atol(separator + 1); // Parte depois do ':'
          if(strcmp(command, "Bateria") == 0)
            bateria = atof(separator + 1); // Parte depois do ':'
            
          //int valor = atoi(separator + 1); // Parte depois do ':'
          // Exiba os valores para verificação
          //Serial.print("Variável: ");
          //Serial.println(command);
          //Serial.print("Valor: ");
          //Serial.println(valor);

          // Faça algo com variavel e valor
        }
        // Vá para o próximo comando
        command = strtok(nullptr, "\n");
      }
      sendData();
    }
  }
};

void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando Servidor BLE...");
  Serial1.begin(9600, SERIAL_8N1, RX1_PIN, TX1_PIN);

  BLEDevice::init("ESP32_Server");
  BLEServer *pServer = BLEDevice::createServer();

  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Característica configurada para leitura, escrita e notificações
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY
  );

  pServer->setCallbacks(new MyServerCallbacks());
  
  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->setValue("Inicializado");

  pService->start();
  //BLEAdvertising *pAdvertising = pServer->getAdvertising();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->start();
  Serial.println("Servidor BLE pronto!");
}

unsigned long millisSend = 0;
void loop() {
  // Recebe valores do Arduino
  getReadings();
  /*
  if (millis() >= millisSend + 5000){
    sendData();
    millisSend = millis();
  }
  */
  // Mostra os valores recebidos do Arduino
  //updateDisplay();
  
  // Envia notificações ao cliente
  String mensagem = "Velocidade:" + String(velocidade);

  if(mensagem != mensagemSaved){
    mensagemSaved = mensagem;
    pCharacteristic->setValue(mensagem.c_str());
    pCharacteristic->notify();
    Serial.println("Enviado para o cliente: " + mensagem + "\n");
  }
  delay(50);  // Ajuste conforme necessário
}
