#include <Arduino.h>
#include <stdio.h>
#include <Ethernet.h>
#include <SoftwareSerial.h>
#include <Servo.h>
#include <EEPROM.h>
#include "SPI.h"
#include "OPC.h"

#define pinEsp32 A2

#define servo A8
#define servoGate A7

#define pinSensorBolinha1 A10
#define pinSensorBolinha2 A12

#define pinSensorCarrinhoVerde A15
#define pinSensorCarrinhoAzul1 A9
#define pinSensorCarrinhoAzul2 A14
#define pinSensorCarrinhoAzul3 A11
#define pinSensorCarrinhoLaranja A13