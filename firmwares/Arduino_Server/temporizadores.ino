
bool auxTempCA1 = false;
bool auxTempCA2 = false;
bool auxTempCA3 = false;
bool auxTempCL = false;
bool auxTempCV = false;

unsigned long millisCarrinhoAzul1 = millis();
unsigned long millisCarrinhoAzul2 = millis();
unsigned long millisCarrinhoAzul3 = millis();
unsigned long millisCarrinhoLaranja = millis();
unsigned long millisCarrinhoVerde = millis();

float P_padrao = 74.4;
float P_varivel = 508.09;
float P = P_padrao+P_varivel;
float Fcor = 2.2;
int Tempo_Ciclo = 50;

void Tempo(){
  if (N_Bolas == 0)
    Tempo_Total = 0;
    
  if (N_Bolas > 0 && Tempo_Total == 0){
    N_Bolas_Restantes = N_Bolas-N_Bolas_Depositadas;
    if(N_Bolas_Restantes < 0)
        N_Bolas_Restantes = 0;
        
    Tempo_Inicio = millis();
    Tempo_Total = int(((N_Bolas_Restantes)/4)*Tempo_Ciclo);// 50s por ciclo
    Serial.println("\nIniciando...");
    Serial.print("Tempo Total: ");
    Serial.println(Tempo_Total);
    int Ciclos = round((N_Bolas_Restantes)/4.0+0.25);
    if (Tempo_Total > 0){      
      Tempo_Restante = Tempo_Total-(millis()-Tempo_Inicio)/1000;
    }
    if (LOCAL == true){
      Velocidade = (P*P*Ciclos/Tempo_Total-Velocidade_Padrao*P_padrao)/P_varivel;
      Serial.print("Velocidade calculada: ");
      Serial.println(Velocidade);
      Velocidade *= Fcor;
      Serial.print("Velocidade corrigida: ");
    }
      Serial.println(Velocidade);
    Velocidade_Carro = Velocidade;
    sendMsg();
  } 
}

void Temporizador()
{    
    TempoCA1();
    TempoCA2();
    TempoCA3();
    TempoCL();
    TempoCV();
    Tempo();
}

void PrintTempo(String carrinho, float tempo)
{
    if(tempo > 1)
    {
      /*
      Serial.print("Carrinho ");
      Serial.print(carrinho);
      Serial.print( " Tempo: ");
      Serial.print(tempo);
      Serial.println(" seg");
      */      
      if(velCA3 != 0){
        velMedia = (velCA1 + velCA2 + velCA3 + velCL + velCV)/5;
        float tempoCiclo = tempoCA1+tempoCA2+tempoCA3+tempoCL+tempoCV;
        
        Serial.print("TA1: ");
        Serial.print(tempoCA1);
        Serial.print(" s   TA2: ");
        Serial.print(tempoCA2);
        Serial.print(" s   TA3: ");
        Serial.print(tempoCA3);
        Serial.print(" s   TL: ");
        Serial.print(tempoCL);
        Serial.print(" s   TV: ");
        Serial.print(tempoCV);
        Serial.print(" s   TCiclo: ");
        Serial.print(tempoCiclo);
        Serial.println(" s");
        
        Serial.print("VA1: ");
        Serial.print(velCA1);
        Serial.print(" mm/s   VA2: ");
        Serial.print(velCA2);
        Serial.print(" mm/s   VA3: ");
        Serial.print(velCA3);
        Serial.print(" mm/s   VL: " );
        Serial.print(velCL);
        Serial.print(" mm/s   VV: ");
        Serial.print(velCV);
        Serial.print(" mm/s   VMed: ");
        Serial.print(velMedia);
        Serial.println(" mm/s");
        
        Serial.println("Fim de ciclo");
        Serial.println("");
        velCA3 = 0;
      }
    }
} 


void TempoCA1()
{
    if(sensorCarrinhoAzul1 == LOW && auxTempCA1 == false)
    {
      auxTempCA1 = true;
      millisCarrinhoAzul1 = millis();
    }
    
    if(sensorCarrinhoAzul1 == HIGH && millis()-millisCarrinhoAzul1 < 2000)
      auxTempCA1 = false;
    
    if(sensorCarrinhoAzul1 == HIGH && auxTempCA1 == true && millis()-millisCarrinhoAzul1 > 2000)
    {
      auxTempCA1 = false;
      tempoCA1 = millis() - millisCarrinhoAzul1;
      tempoCA1 /= 1000;
      velCA1 = velCal(tempoCA1, 77.82);
      PrintTempo("Azul 1", tempoCA1);
      Velocidade_Carro = Velocidade_Padrao;
      sendMsg();
    }
}

void TempoCA2()
{
    if(sensorCarrinhoAzul2 == LOW && auxTempCA2 == false)
    {
      auxTempCA2 = true;
      millisCarrinhoAzul2 = millis();
    }

    if(sensorCarrinhoAzul2 == HIGH && millis()-millisCarrinhoAzul2 < 2000)
      auxTempCA2 = false;
    
    if(sensorCarrinhoAzul2 == HIGH && auxTempCA2 == true && millis()-millisCarrinhoAzul2 > 2000)
    {
      auxTempCA2 = false;
      tempoCA2 = millis() - millisCarrinhoAzul2;
      tempoCA2 /= 1000;
      velCA2 = velCal(tempoCA2, 153.87);
      PrintTempo("Azul 2", tempoCA2);
    }
}

void TempoCA3()
{
    if(sensorCarrinhoAzul3 == LOW && auxTempCA3 == false)
    {
      auxTempCA3 = true;
      millisCarrinhoAzul3 = millis();
    }

    if(sensorCarrinhoAzul3 == HIGH && millis()-millisCarrinhoAzul3 < 2000)
      auxTempCA3 = false;
    
    if(sensorCarrinhoAzul3 == HIGH && auxTempCA3 == true && millis()-millisCarrinhoAzul3 > 2000)
    {
      auxTempCA3 = false;
      tempoCA3 = millis() - millisCarrinhoAzul3;
      tempoCA3 /= 1000;
      velCA3 = velCal(tempoCA3, 114.45);
      PrintTempo("Azul 3", tempoCA3);

      N_Bolas_Restantes = N_Bolas-N_Bolas_Depositadas;
      if(N_Bolas_Restantes < 0)
        N_Bolas_Restantes = 0;
        
      Serial.print("Bolas restantes: ");
      Serial.println(N_Bolas_Restantes);
      if(N_Bolas_Restantes <= 0){
        End();
        Serial.println("Fim de produção, aguardando nova ordem...");
        return;
      }

      if (Tempo_Total > 0){      
        Tempo_Restante = Tempo_Total-(millis()-Tempo_Inicio)/1000;
      }
      int Ciclos = round(N_Bolas_Restantes/4.0+0.25);
      /*if(Tempo_Restante >= 0){
        Velocidade = (P*P*Ciclos/Tempo_Restante-Velocidade_Padrao*P_padrao)/P_varivel;
        Serial.print("Velocidade calculada: ");
        Serial.println(Velocidade);
        Velocidade *= Fcor;
        Serial.print("Velocidade corrigida: ");
        Serial.println(Velocidade);
      }else
        Velocidade = 30;
        
      if (N_Bolas == 0)
        Velocidade = 0;      
      */
      Velocidade_Carro = Velocidade;
      Serial.print("Tempo Restante: ");
      Serial.println(Tempo_Restante);
      Serial.print("Velocidade Calculada: ");
      Serial.println(Velocidade);
      
      sendMsg();
      //Corretor();
    }
}

void TempoCL()
{
    if(sensorCarrinhoLaranja == LOW && auxTempCL == false)
    {
      auxTempCL = true;
      millisCarrinhoLaranja = millis();
    }

    if(sensorCarrinhoLaranja == HIGH && millis()-millisCarrinhoLaranja < 2000)
      auxTempCL = false;
      
    if(sensorCarrinhoLaranja == HIGH && auxTempCL == true && millis()-millisCarrinhoLaranja > 2000)
    {
      
      auxTempCL = false;
      tempoCL = millis() - millisCarrinhoLaranja;
      tempoCL /= 1000;
      velCL = velCal(tempoCL, 74.40);
      PrintTempo("Laranja", tempoCL);
      Velocidade_Carro = Velocidade;
      //sendMsg();
    }
}

void TempoCV()
{
    if(sensorCarrinhoVerde == LOW && auxTempCV == false)
    {
      auxTempCV = true;
      millisCarrinhoVerde = millis();
    }
    
    if (sensorCarrinhoVerde == HIGH && millis()-millisCarrinhoVerde < 2000)
      auxTempCV = false;
    
    if(sensorCarrinhoVerde == HIGH && auxTempCV == true && (millis()-millisCarrinhoVerde) > 2000)
    {
      auxTempCV = false;
      tempoCV = millis() - millisCarrinhoVerde;
      tempoCV /= 1000;
      velCV = velCal(tempoCV, 161.95);
      PrintTempo("Verde", tempoCV);
    }
}

float velCal(float tempo, float dist)
{
    return dist/tempo;
}
