bool bolinha1Aux = false;
bool bolinha2Aux = false;

unsigned long millisContagemBolinhas1 = millis();
unsigned long millisContagemBolinhas2 = millis();

void End(){
  velCA1 = 0;
  velCA2 = 0;
  velCA3 = 0;
  velCL = 0;
  velCV = 0;

  N_Bolas_Restantes = 0;
  N_Bolas_Depositadas = N_Bolas;
  nBola2 = N_Bolas_Depositadas;
  nBola1 = nBola2;
  
  Velocidade = 0;
  Velocidade_Carro = 0;
  sendMsg();
}

void Clear(){
  velCA1 = 0;
  velCA2 = 0;
  velCA3 = 0;
  velCL = 0;
  velCV = 0;

  N_Bolas_Depositadas = 0;
  nBola2 = 0;
  nBola1 = 0;
  N_Bolas = 0;

  Tempo_Total = 0;
  
  Velocidade = 0;
  Velocidade_Carro = 0;
  sendMsg();

  Start = false;
}

void CarrinhoAzul1()
{
    if(digitalRead(pinSensorCarrinhoAzul1) == LOW)
    {
      sensorCarrinhoAzul1 = true;
      cA1 = true;      
    }
    else if(cA1 == true)
      sensorCarrinhoAzul1 = false;

    if(cA2 == true)
    {
      sensorCarrinhoAzul1 = true;
      cA1 = false;
    }  
}


void CarrinhoAzul2()
{   
    if(digitalRead(pinSensorCarrinhoAzul2) == LOW)
    {
      sensorCarrinhoAzul2 = true;
      cA2 = true;
    }
    else if(cA2 == true)
      sensorCarrinhoAzul2 = false;

    if(cA3 == true)
    {
      sensorCarrinhoAzul2 = true;
      cA2 = false;
      if (N_Bolas_Depositadas != nBola2){
        N_Bolas_Depositadas = nBola2;
        sendMsg();
      }
    }
    
}


void CarrinhoAzul3()
{
    if(digitalRead(pinSensorCarrinhoAzul3) == LOW)
    {
      sensorCarrinhoAzul3 = true;
      cA3 = true;
    }
    else if(cA3 == true)
      sensorCarrinhoAzul3 = false;

    if(cA1 == true)
    {
      sensorCarrinhoAzul3 = true;
      cA3 = false;
    }
}


void CarrinhoLaranja()
{
    if(digitalRead(pinSensorCarrinhoLaranja) == LOW)
      sensorCarrinhoLaranja = true;
    else
      sensorCarrinhoLaranja = false;
}

void CarrinhoVerde()
{
    if(digitalRead(pinSensorCarrinhoVerde) == LOW)
      sensorCarrinhoVerde = true;
    else
      sensorCarrinhoVerde = false;
}

void Bolinha1()
{
    if((millis() - millisContagemBolinhas1)>100)
      sensorBolinha1 = false;
  
    if(digitalRead(pinSensorBolinha1) == LOW)
      bolinha1Aux = false;
        
    if((millis() - millisContagemBolinhas1)>100 && digitalRead(pinSensorBolinha1) == HIGH && bolinha1Aux == false)
    {
      millisContagemBolinhas1 = millis();
      bolinha1Aux = true;
      nBola1++;
      
      sensorBolinha1 = true;
      
      Serial.print("Bolinhas1: ");
      Serial.println(nBola1); 
    }
}

void Bolinha2()
{   
    if((millis()-millisContagemBolinhas2) > 150)
    {
      sensorBolinha2 = false;
      sGate.write(75);
    }
    
    if((millis()-millisContagemBolinhas2) > 1000 && digitalRead(pinSensorBolinha2) == HIGH)
    {
      millisContagemBolinhas2 = millis();
      nBola2++;
      
      sensorBolinha2 = true;

      sGate.write(55);
      
      Serial.print("Bolinhas2: ");
      Serial.println(nBola2);
    }
    
}


void ServoMotor()
{ 
  if (nBola1 > nBola2){
    if(sensorCarrinhoLaranja == false){
      if((millis() - millisServo)>4000){
        srv = true;
        s.write(75);
      }
    }else
       millisServo = millis();
  }else{
    srv = false;
    s.write(0); 
  }
}
