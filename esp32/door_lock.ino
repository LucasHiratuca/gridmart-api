/*
  GridMart - ESP32 Trava Eletroímã (Portaria)
  - Conecta no Wi-Fi da loja
  - Faz polling na API buscando comandos de liberação
  - Abre no 1º comando de um grupo e mantém por OPEN_MS
    (assim 2+ pessoas entrando juntas não levam porta batendo)
*/

#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "WIFI_DA_LOJA";
const char* password = "SENHA_DO_WIFI";
const char* apiUrl = "https://gridmart-api.seu-dominio.workers.dev/access/door";
const char* doorToken = "MESMO_TOKEN_DA_VAR_DOOR_TOKEN";

const int RELAY_PIN = 23;           // Pino conectado no IN do módulo relé
const unsigned long POLL_MS = 500;  // intervalo entre polls
const unsigned long OPEN_MS = 6000; // tempo que a porta fica aberta

bool doorOpen = false;
unsigned long openedAt = 0;

void openDoor() {
  digitalWrite(RELAY_PIN, HIGH); // Aciona o relé (corta 12V do eletroímã)
  doorOpen = true;
  openedAt = millis();
}

void closeDoor() {
  digitalWrite(RELAY_PIN, LOW); // Trava novamente
  doorOpen = false;
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWi-Fi Conectado!");
}

void loop() {
  // Fecha sozinho após OPEN_MS, mesmo se vierem novos comandos do grupo
  if (doorOpen && millis() - openedAt >= OPEN_MS) closeDoor();

  if (WiFi.status() == WL_CONNECTED && !doorOpen) {
    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("x-door-token", doorToken);

    int code = http.GET();
    if (code == 200) openDoor(); // 200 = 1º comando de liberação do grupo

    http.end();
  }
  delay(POLL_MS);
}