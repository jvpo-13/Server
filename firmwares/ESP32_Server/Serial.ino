void sendData()
{ 
  // Monta a mensagem COMPLETA antes de enviar
  String mensagem = "Tempo:" + String(tempo) + "!";
  mensagem += "Encoder:" + String(encoder) + "!";
  mensagem += "Bateria:" + String(bateria) + "!@\n"; // Terminador único

  // Envia tudo de uma vez
  Serial1.print(mensagem);

  // Debug
  Serial.println("Dados enviados ao Arduino:");
  Serial.println(mensagem);
  Serial.println();
  delay(10); // Delay crítico para estabilidade
  return;
}

void getReadings() {
  if (Serial1.available() > 0) {
    float velocidade_save = velocidade;
    velocidade = Serial1.parseFloat();
    
    if (velocidade == 0)
      velocidade = velocidade_save;
    else if (velocidade < 0)
      velocidade = 0;
    else{
      Serial.println("Valores recebidos via Serial:");
      Serial.println(velocidade);
      Serial.println();
    }

    // Ler os dados disponíveis até não houver mais dados
    while (Serial1.available() > 0)
      Serial1.read();
  }
  return;
}
