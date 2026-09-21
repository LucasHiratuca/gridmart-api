/*
  GridMart - ESP32 Trava Eletroímã (Portaria)
  - Conecta no Wi-Fi da loja
  - Aguarda requisição GET /open vinda do Tablet da entrada
  - Aciona o relé por 3 segundos para soltar o eletroímã
*/

#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "WIFI_DA_LOJA";
const char* password = "SENHA_DO_WIFI";

const int RELAY_PIN = 23; // Pino conectado no IN do módulo relé
WebServer server(80);

void handleOpen() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", "{\"status\":\"OPEN\"}");
  
  digitalWrite(RELAY_PIN, HIGH); // Aciona o relé (corta 12V do eletroímã)
  delay(3000);                   // 3 segundos para o cliente empurrar a porta
  digitalWrite(RELAY_PIN, LOW);  // Trava novamente
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
  Serial.print("IP do ESP32 para colocar no Tablet: ");
  Serial.println(WiFi.localIP());

  server.on("/open", handleOpen);
  server.begin();
}

void loop() {
  server.handleClient();
}
