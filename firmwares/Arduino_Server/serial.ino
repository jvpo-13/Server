float velMax = 25;
float velMin = 20;

unsigned long tempo = 0;
unsigned long encoder = 0;
float bateria = 0;
/*
void getReadings() {
  if (Serial1.available() > 0) {
    // Buffer para armazenar a mensagem recebida
    char buffer[128];
    int i = 0;

    // Ler até encontrar um caractere de nova linha ou até encher o buffer
    while (Serial1.available() > 0 && i < sizeof(buffer) - 1) {
      char c = Serial1.read();
      if (c == '@') break;  // Fim da mensagem
      buffer[i++] = c;
    }
    buffer[i] = '\0';  // Adiciona o terminador de string

    // Exibe a mensagem recebida para debug
    Serial.println("\nMensagem recebida via Serial1:");
    Serial.println(buffer);

    // Faz o parsing dos valores com base em identificadores
    char *ptr = strtok(buffer, "!");
    while (ptr != NULL) {
      if (strstr(ptr, "Tempo:") != NULL) {
        tempo = atol(ptr + 6);
        Serial.print("Tempo: ");
        Serial.println(tempo);
      } else if (strstr(ptr, "Encoder:") != NULL) {
        encoder = atol(ptr + 8);
        Serial.print("Encoder: ");
        Serial.println(encoder);
      } else if (strstr(ptr, "Bateria:") != NULL) {
        bateria = atof(ptr + 8);
        Serial.print("Bateria: ");
        Serial.println(bateria);
      }

      ptr = strtok(NULL, "!");
    }
    Tempo_Ligado = tempo;
    Distancia_Percorrida = encoder;
    Nivel_Bateria = bateria;
  }
}*/

char buffer[128];
unsigned long lastReceivedTime = 0;
const int timeout = 100; // Timeout de 100ms

void getReadings() {
  static int i = 0;
  static bool receiving = false;

  while (Serial1.available() > 0) {
    char c = Serial1.read();
    
    // Detecta início da mensagem (opcional)
    if (c == 'T' && !receiving) {
      receiving = true;
      i = 0;
    }

    if (receiving) {
      // Verifica fim da mensagem
      if (c == '@') {
        buffer[i] = '\0';
        processarMensagem(buffer); // Função de parsing
        receiving = false;
        i = 0;
        return;
      }
      
      // Armazena no buffer
      if (i < sizeof(buffer) - 1) {
        buffer[i++] = c;
      }
    }

    lastReceivedTime = millis();
  }

  // Timeout: se começou a receber mas não completou
  if (receiving && (millis() - lastReceivedTime > timeout)) {
    receiving = false;
    i = 0;
    Serial.println("Timeout na recepção!");
  }
}

void processarMensagem(char* msg) {
  Serial.println("\nMensagem completa recebida:");
  Serial.println(msg);

  char *ptr = strtok(msg, "!");
  while (ptr != NULL) {
    if (strstr(ptr, "Tempo:") != NULL) {
      tempo = atol(ptr + 6);
      Serial.print("Tempo: ");
      Serial.println(tempo);
    } else if (strstr(ptr, "Encoder:") != NULL) {
      encoder = atol(ptr + 8);
      Serial.print("Encoder: ");
      Serial.println(encoder);
    } else if (strstr(ptr, "Bateria:") != NULL) {
      bateria = atof(ptr + 8);
      Serial.print("Bateria: ");
      Serial.println(bateria);
    }
    ptr = strtok(NULL, "!");
  }

  // Atualiza variáveis globais
  Tempo_Ligado = tempo;
  Distancia_Percorrida = encoder;
  Nivel_Bateria = bateria;
}

void sendMsg()
{
  //Velocidade_Carro = 18;
  //Velocidade_Motor = Eq_vel(Velocidade_Carro);
  //Velocidade_Motor = 230;

  if(Velocidade_Carro == 0)
    Velocidade_Motor = -1;
  else{
    if(Velocidade_Carro < velMin)
      Velocidade_Carro = velMin; //Velocidade_Motor = Eq_vel(20);
    if(Velocidade_Carro > velMax)
      Velocidade_Carro = velMax; //Velocidade_Motor = Eq_vel(26);
    Velocidade_Motor = Eq_vel(Velocidade_Carro);
  }
  
  Serial1.println(String(Velocidade_Motor));
  
  Serial.print("Velocidade enviada: ");
  Serial.println(Velocidade_Carro);
  Serial.print("Vel Motor: ");
  Serial.println(Velocidade_Motor);
  return;
}

int Eq_vel(float Vel){
  return(46.3 + Vel*(9.04 - 0.0976*Vel));
}
