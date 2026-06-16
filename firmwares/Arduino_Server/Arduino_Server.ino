#include "config.h"

OPCSerial aOPCSerial;

const bool LOCAL = false;//Ativa ou desativa o controle por monitor serial

int nBola1 = 0;
int nBola2 = 0;

bool cA1 = false;
bool cA2 = false;
bool cA3 = false;

bool sensorBolinha1 = false;
bool sensorBolinha2 = false;
bool sensorCarrinhoVerde = false;
bool sensorCarrinhoAzul1 = true;
bool sensorCarrinhoAzul2 = true;
bool sensorCarrinhoAzul3 = true;
bool sensorCarrinhoLaranja = false;

//Create a new software  serial
Servo s;
Servo sGate;

static bool Start = false;

static float Velocidade = 0;

int Tempo_Ligado = 0;
int Distancia_Percorrida = 0;
float Nivel_Bateria = 0;

float Velocidade_Padrao = 20;
float Velocidade_Carro = 0;
int Velocidade_Motor = 0;

static int N_Bolas = 0;

static int N_Bolas_Depositadas = 0;
static int N_Bolas_Restantes = 0;

static bool srv = false;

static int Tempo_Total = 0;
static int Tempo_Restante = 0;
static int Tempo_Inicio = 0;

void setup()

{
  Serial.begin(9600);
  Serial1.begin(9600);
    
  pinMode(pinSensorBolinha1, INPUT);
  pinMode(pinSensorBolinha2, INPUT);
  pinMode(pinSensorCarrinhoVerde, INPUT);
  pinMode(pinSensorCarrinhoAzul1, INPUT);
  pinMode(pinSensorCarrinhoAzul2, INPUT);
  pinMode(pinSensorCarrinhoAzul3, INPUT);
  pinMode(pinSensorCarrinhoLaranja, INPUT);

  pinMode(pinEsp32, OUTPUT);
  digitalWrite(pinEsp32, HIGH);

  s.attach(servo);
  s.write(0);

  sGate.attach(servoGate);
  sGate.write(75);

  aOPCSerial.setup();

  aOPCSerial.addItem("Velocidade",opc_readwrite, opc_float, Callback_Velocidade);

  aOPCSerial.addItem("Tempo_Ligado",opc_readwrite, opc_int, Callback_Tempo_Ligado);
  aOPCSerial.addItem("Distancia_Percorrida",opc_readwrite, opc_int, Callback_Distancia_Percorrida);
  aOPCSerial.addItem("Nivel_Bateria",opc_readwrite, opc_float, Callback_Nivel_Bateria);
  
  aOPCSerial.addItem("Tempo_Restante",opc_readwrite, opc_int, Callback_Tempo_Restante);
  aOPCSerial.addItem("Bolas_Restantes",opc_readwrite, opc_int, Callback_Bolas_Restantes);
  
  aOPCSerial.addItem("N_Bolas",opc_readwrite, opc_int, Callback_N_Bolas);
  aOPCSerial.addItem("Tempo_Total",opc_readwrite, opc_int, Callback_Tempo_Total);

  aOPCSerial.addItem("Servo",opc_readwrite, opc_bool, Callback_Servo);
  aOPCSerial.addItem("Start",opc_readwrite, opc_bool, Callback_Start);
  
  aOPCSerial.addItem("OPC_CA1",opc_read, opc_bool, Callback_CA1);
  aOPCSerial.addItem("OPC_CA2",opc_read, opc_bool, Callback_CA2);
  aOPCSerial.addItem("OPC_CA3",opc_read, opc_bool, Callback_CA3);
  aOPCSerial.addItem("OPC_CL",opc_read, opc_bool, Callback_CL);
  aOPCSerial.addItem("OPC_CV",opc_read, opc_bool, Callback_CV);
  
  aOPCSerial.addItem("OPC_Bola1",opc_readwrite, opc_int, Callback_Bola1);
  aOPCSerial.addItem("OPC_Bola2",opc_readwrite, opc_int, Callback_Bola2);
  
  aOPCSerial.addItem("OPC_Velocidade_Media",opc_readwrite, opc_float, Callback_Velocidade_Media);
  
  Clear();
}

unsigned long millisServo = millis();


void loop()
{
  Print();
  getReadings();

  while(N_Bolas == 0 and LOCAL == true){
    Serial.println("\nDigite o numero de bolinhas desejadas ");
    for(int i = 0; i < 5; i++) {
      Serial.print(".");
      delay(1000);
    }
    Serial.println("");
    if (Serial.available() > 0) {
      int leitura = Serial.parseInt();
      if (leitura % 4 > 0){
        Serial.println("Erro!");
        Serial.print(leitura);
        Serial.println(" é um valor invalido");
        Serial.println("Escolha um multiplo de quatro");
      }else{
        N_Bolas = leitura;
        Serial.print("Quantidade de bolas desejadas: ");
        Serial.println(N_Bolas);
      }
    }
  }
  
  Bolinha1();
  Bolinha2();
  
  CarrinhoVerde();
  CarrinhoAzul1();
  CarrinhoAzul2();
  CarrinhoAzul3();
  CarrinhoLaranja();

  Temporizador();
  aOPCSerial.processOPCCommands();
  ServoMotor();
  
  //delay(50);
}
