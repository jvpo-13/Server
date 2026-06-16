
unsigned long millisPrint = millis();

void Print()
{
  if((millis() - millisPrint)>2000)
  {
    //Sensores();
    Bolinhas();
    Sineco();
    millisPrint = millis();
  }
}

void Bolinhas()
{
  Serial.print("Bolinhas 1: ");
  Serial.println(nBola1);
  //Serial.print("   D: ");
  //Serial.print(digitalRead(pinSensorBolinha1));
  //Serial.print("   A: ");
  //Serial.println(analogRead(pinSensorBolinha1));
  Serial.print("Bolinhas 2: ");
  Serial.print(nBola2);
  //Serial.print("   D: ");
  //Serial.print(digitalRead(pinSensorBolinha2));
  //Serial.print("   A: ");
  //Serial.println(analogRead(pinSensorBolinha2));

  Serial.println(" ");
}

void Sensores()
{
  Serial.print("Carrinho Azul 1: ");
  Serial.println(digitalRead(pinSensorCarrinhoAzul1));
  Serial.print("Carrinho Azul 2: ");
  Serial.println(digitalRead(pinSensorCarrinhoAzul2));
  Serial.print("Carrinho Azul 3: ");
  Serial.println(digitalRead(pinSensorCarrinhoAzul3));
 
  Serial.print("Carrinho Laranja: ");
  Serial.println(digitalRead(pinSensorCarrinhoLaranja));
  Serial.print("Carrinho Verde: ");
  Serial.println(digitalRead(pinSensorCarrinhoVerde));
 
  Serial.println(" ");
}

void Sineco()
{    
  //Serial.print("SCA1 : ");
  //Serial.println(cA1);
  //Serial.print("SCA2 : ");
  //Serial.println(cA2);
  //Serial.print("SCA3 : ");
  //Serial.println(cA3);

  Serial.print("CA1 : ");
  Serial.println(sensorCarrinhoAzul1);
  Serial.print("CA2 : ");
  Serial.println(sensorCarrinhoAzul2);
  Serial.print("CA3 : ");
  Serial.println(sensorCarrinhoAzul3);
  Serial.print("CL : ");
  Serial.println(sensorCarrinhoLaranja);
  Serial.print("CV : ");
  Serial.println(sensorCarrinhoVerde);
  
  Serial.println();
}
