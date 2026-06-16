float tempoCA1 = 0;
float tempoCA2 = 0;
float tempoCA3 = 0;
float tempoCL = 0;
float tempoCV = 0;

float velCA1 = 0;
float velCA2 = 0;
float velCA3 = 0;
float velCL = 0;
float velCV = 0;
float velMedia = 0;

float Callback_Velocidade(const char *itemID, const opcOperation opcOP, const float value){
  if (opcOP == opc_opwrite) {
    Velocidade = value;
    Velocidade_Carro = Velocidade;
    sendMsg();
  } 
  else 
    return Velocidade;  
}

int Callback_Tempo_Ligado(const char *itemID, const opcOperation opcOP, const int value){
  if (opcOP == opc_opwrite)
    Tempo_Ligado = value;
  else 
    return Tempo_Ligado;
}
int Callback_Distancia_Percorrida(const char *itemID, const opcOperation opcOP, const int value){
  if (opcOP == opc_opwrite)
    Distancia_Percorrida = value;
  else 
    return Distancia_Percorrida;
}
float Callback_Nivel_Bateria(const char *itemID, const opcOperation opcOP, const float value){
  if (opcOP == opc_opwrite)
    Nivel_Bateria = value;
  else 
    return Nivel_Bateria;
}

int Callback_Tempo_Restante(const char *itemID, const opcOperation opcOP, const int value){
  if (opcOP == opc_opwrite)
    Tempo_Restante = value;
  else 
    return Tempo_Restante;
}
int Callback_Bolas_Restantes(const char *itemID, const opcOperation opcOP, const int value){
  if (opcOP == opc_opwrite) 
    N_Bolas_Restantes = value;
  else 
    return N_Bolas_Restantes;
}

int Callback_N_Bolas(const char *itemID, const opcOperation opcOP, const int value){
  if (opcOP == opc_opwrite)
    N_Bolas = value;
  else 
    return N_Bolas;
}
int Callback_Tempo_Total(const char *itemID, const opcOperation opcOP, const int value){
  if (opcOP == opc_opwrite) 
    Tempo_Total = value;
  else 
    return Tempo_Total;
}

bool Callback_Servo(const char *itemID, const opcOperation opcOP, const bool value){
  if (opcOP == opc_opwrite) 
    srv = value;
  else 
    return srv;
}

bool Callback_Start(const char *itemID, const opcOperation opcOP, const bool value){
  if (opcOP == opc_opwrite) 
    Start = value;
    if(Start == true)
      Clear();
  else 
    return Start;
}

bool Callback_CA1(const char *itemID, const opcOperation opcOP, const bool value){
  return sensorCarrinhoAzul1;
}
bool Callback_CA2(const char *itemID, const opcOperation opcOP, const bool value){
  return sensorCarrinhoAzul2;
}
bool Callback_CA3(const char *itemID, const opcOperation opcOP, const bool value){
  return sensorCarrinhoAzul3;
}
bool Callback_CL(const char *itemID, const opcOperation opcOP, const bool value){
  return sensorCarrinhoLaranja;
}
bool Callback_CV(const char *itemID, const opcOperation opcOP, const bool value){
  return sensorCarrinhoVerde;
}

int Callback_Bola1(const char *itemID, const opcOperation opcOP, const int value){
  if (opcOP == opc_opwrite) 
    nBola1 = value;
  else 
    return nBola1;
}
int Callback_Bola2(const char *itemID, const opcOperation opcOP, const int value){
  if (opcOP == opc_opwrite) 
    nBola2 = value;
  else 
    return nBola2;
}

float Callback_Tempo_CA1(const char *itemID, const opcOperation opcOP, const float value){
  return tempoCA1;
}
float Callback_Tempo_CA2(const char *itemID, const opcOperation opcOP, const float value){
  return tempoCA2;
}
float Callback_Tempo_CA3(const char *itemID, const opcOperation opcOP, const float value){
  return tempoCA3;
}
float Callback_Tempo_CL(const char *itemID, const opcOperation opcOP, const float value){
  return tempoCL;
}
float Callback_Tempo_CV(const char *itemID, const opcOperation opcOP, const float value){
  return tempoCV;
}


float Callback_Velocidade_CA1(const char *itemID, const opcOperation opcOP, const float value){
  return velCA1;
}
float Callback_Velocidade_CA2(const char *itemID, const opcOperation opcOP, const float value){
  return velCA2;
}
float Callback_Velocidade_CA3(const char *itemID, const opcOperation opcOP, const float value){
  return velCA3;
}
float Callback_Velocidade_CL(const char *itemID, const opcOperation opcOP, const float value){
  return velCL;
}
float Callback_Velocidade_CV(const char *itemID, const opcOperation opcOP, const float value){
  return velCV;
}
float Callback_Velocidade_Media(const char *itemID, const opcOperation opcOP, const float value){
  if (opcOP == opc_opwrite) 
    velMedia = value;
    else 
  return velMedia;
}
