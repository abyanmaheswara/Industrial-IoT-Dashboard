#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// ==========================================
// --- FACTORY FORGE - EDGE NODE FIRMWARE ---
// ==========================================

// --- NETWORK CONFIGURATION ---
const char* ssid = "OPPO Reno8";          
const char* password = "12345678";        

// --- PROTOCOL CONFIGURATION (MQTT) ---
const char* mqtt_server = "10.158.49.141"; 
const int mqtt_port = 1883;

// --- HARDWARE MATRIX ---
#define DHTPIN 4      // DHT22 data pin to D4
#define DHTTYPE DHT22 
#define STATUS_LED 2  // Onboard LED

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
const long interval = 5000; 

// --- SYSTEM INITIALIZATION ---
void setup_wifi() {
  delay(100);
  Serial.println("\n[FACTORY FORGE] Initializing Wireless Link...");
  Serial.printf("SSID: %s\n", ssid);

  WiFi.begin(ssid, password);

  int attempt = 0;
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED)); 
    delay(500);
    Serial.print(".");
    if(++attempt > 30) {
      Serial.println("\n[ERROR] WiFi connection timeout. Restarting...");
      ESP.restart(); 
    }
  }

  digitalWrite(STATUS_LED, HIGH); 
  Serial.println("\n[SYNC] Wireless Link Established");
  Serial.print("[INFO] Local Node IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("[SIGNAL] Attempting Protocol Handshake...");
    
    String mac = WiFi.macAddress();
    mac.replace(":", "");
    String clientId = "FF_NODE_" + mac.substring(8); 
    
    client.setKeepAlive(60); 
    
    if (client.connect(clientId.c_str())) {
      Serial.println("CONNECTED ✅");
      Serial.printf("[INFO] Client ID: %s\n", clientId.c_str());
      Serial.println("[INFO] Telemetry Stream: ONLINE");
    } else {
      Serial.print("FAILED [rc=");
      Serial.print(client.state());
      Serial.println("] - Retrying in 5s");
      delay(5000);
    }
  }
}

void setup() {
  pinMode(STATUS_LED, OUTPUT);
  Serial.begin(115200);
  
  Serial.println("\n\n#########################################");
  Serial.println("#      FACTORY FORGE - INDUSTRIAL OS    #");
  Serial.println("#      Hardware Node: ESP32_EDGE_01     #");
  Serial.println("#      Firmware Version: 1.0.0          #");
  Serial.println("#########################################\n");

  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  
  Serial.println("[INIT] System initialization complete");
  Serial.println("[READY] Entering telemetry loop...\n");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
      Serial.println("[ERROR] DHT22 read failure - Check wiring!");
      return;
    }

    // --- SEND TEMPERATURE ---
    String payloadTemp = "{\"id\": \"dht_temp\", \"value\": " + String(t, 2) + "}";
    if (client.publish("sensors/dht_temp", payloadTemp.c_str())) {
      Serial.printf("[TX] Temperature: %.2f °C\n", t);
    } else {
      Serial.println("[ERROR] Failed to publish temperature");
    }
    
    // --- SEND HUMIDITY ---
    String payloadHumid = "{\"id\": \"dht_humid\", \"value\": " + String(h, 2) + "}";
    if (client.publish("sensors/dht_humid", payloadHumid.c_str())) {
      Serial.printf("[TX] Humidity: %.2f %%\n", h);
    } else {
      Serial.println("[ERROR] Failed to publish humidity");
    }

    // Blink LED on transmission
    digitalWrite(STATUS_LED, LOW);
    delay(50);
    digitalWrite(STATUS_LED, HIGH);
  }
}