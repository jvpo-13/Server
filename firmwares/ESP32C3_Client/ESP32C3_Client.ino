#include <BLEDevice.h>

#define SERVICE_UUID BLEUUID("4fafc201-1fb5-459e-8fcc-c5c9c331914b")
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLERemoteCharacteristic *pRemoteCharacteristic;
bool connected = false;
BLEAdvertisedDevice *myDevice = nullptr;

// define led according to pin diagram in article
const int batLevel = A0;
const int encoder = A1;
const int enableMotor = D4; // enable motor
const int pwmMotor = D5;    // pwm motor
const int gndMotor = D6;    // gnd motor

int velocidadeMotor = 0;

// variáveis do encoder
bool blackMemory = false;
unsigned long stepRot = 0; // passos da roda

class MyClientCallback : public BLEClientCallbacks {
  void onConnect(BLEClient *pClient) {
    Serial.println("Conectado ao servidor!");
    connected = true;
  }

  void onDisconnect(BLEClient *pClient) {
    Serial.println("Desconectado do servidor!");
    velocidadeMotor = 0;
    analogWrite(pwmMotor, velocidadeMotor);
    connected = false;
  }
};

// Callback para receber notificações
static void notifyCallback(BLERemoteCharacteristic *pBLERemoteCharacteristic, uint8_t *pData, size_t length, bool isNotify) {
  Serial.print("Notificação recebida: ");
  Serial.write(pData, length);
  Serial.println();

  char input[length + 1];
  memcpy(input, pData, length);
  input[length] = '\0';

  char *command = strtok(input, "\n");
  while (command != nullptr) {
    char *separator = strchr(command, ':');
    if (separator != nullptr) {
      *separator = '\0';
      int valor = atoi(separator + 1);

      if (strcmp(command, "Velocidade") == 0) {
        velocidadeMotor = valor;
        analogWrite(pwmMotor, velocidadeMotor);
      }
    }
    command = strtok(nullptr, "\n");
  }
}

bool connectToServer(BLEAdvertisedDevice *myDevice) {
  Serial.print("Conectando ao servidor: ");
  Serial.println(myDevice->getAddress().toString().c_str());

  BLEClient *pClient = BLEDevice::createClient();
  pClient->setClientCallbacks(new MyClientCallback());

  if (!pClient->connect(myDevice)) {
    Serial.println("Falha na conexão!");
    return false;
  }

  BLERemoteService *pRemoteService = pClient->getService(SERVICE_UUID);
  if (pRemoteService == nullptr) {
    Serial.println("Serviço não encontrado!");
    pClient->disconnect();
    return false;
  }

  pRemoteCharacteristic = pRemoteService->getCharacteristic(CHARACTERISTIC_UUID);
  if (pRemoteCharacteristic == nullptr) {
    Serial.println("Característica não encontrada!");
    pClient->disconnect();
    return false;
  }

  if (pRemoteCharacteristic->canNotify()) {
    pRemoteCharacteristic->registerForNotify(notifyCallback);
  }

  connected = true;
  return true;
}

void setup() {
  pinMode(batLevel, INPUT);
  pinMode(encoder, INPUT);
  pinMode(enableMotor, OUTPUT);
  pinMode(pwmMotor, OUTPUT);
  pinMode(gndMotor, OUTPUT);
  digitalWrite(gndMotor, LOW);
  digitalWrite(enableMotor, LOW);
  Serial.begin(115200);
  Serial.println("Iniciando Cliente BLE...");

  BLEDevice::init("");
  BLEScan *pBLEScan = BLEDevice::getScan();
  pBLEScan->setActiveScan(true);

  while (myDevice == nullptr) {
    BLEScanResults *results = pBLEScan->start(5);
    for (int i = 0; i < results->getCount(); i++) {
      BLEAdvertisedDevice advertisedDevice = results->getDevice(i);
      if (advertisedDevice.haveServiceUUID() && advertisedDevice.isAdvertisingService(SERVICE_UUID)) {
        myDevice = new BLEAdvertisedDevice(advertisedDevice);
        break;
      }
    }
  }

  if (myDevice) {
    connectToServer(myDevice);
  }
}

unsigned long distancia() {
  float Vencoder = analogReadMilliVolts(encoder);
  if (Vencoder >= 2400 && !blackMemory) {
    stepRot++;
    blackMemory = true;
  } else if (Vencoder <= 1500 && blackMemory) {
    stepRot++;
    blackMemory = false;
  }
  return (stepRot * (2 * 3.1415 * 28.8 / 8));
}

float readBat() {
  uint32_t Vbatt = 0;
  for (int i = 0; i < 16; i++) {
    Vbatt = Vbatt + analogReadMilliVolts(batLevel);
  }
  return (Vbatt / 16 / 1000.0 * 2);
}

unsigned long millisSend;
void loop() {
  unsigned long distanciaValue = distancia();

  if (velocidadeMotor == 0)
    digitalWrite(enableMotor, LOW);
  else
    digitalWrite(enableMotor, HIGH);
  if (!connected && myDevice != nullptr) {
    Serial.println("Tentando reconectar...");
    connectToServer(myDevice);
    millisSend = 0; // em caso de reconexão os dados são enviados imediatamente
  }

  if (millis() >= millisSend + 10000) {
    if (connected && pRemoteCharacteristic->canWrite()) {
      float batLevelValue = readBat();
      String boot = "Tempo:" + String(millis() / 1000);
      String enc = "Enconder:" + String(distanciaValue);
      String bat = "Bateria:" + String(batLevelValue);
      String mensagem = boot + "\n" + enc + "\n" + bat;
      pRemoteCharacteristic->writeValue(mensagem.c_str(), mensagem.length());
      Serial.println("Enviado ao servidor:\n" + mensagem + "\n");
      millisSend = millis();
    }
  }
  delay(50);
}
