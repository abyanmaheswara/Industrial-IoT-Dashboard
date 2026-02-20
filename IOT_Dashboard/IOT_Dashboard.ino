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
const char* mqtt_server = "industrial-iot-dashboard-production.up.railway.app"; 
const int mqtt_port = 1883;

// --- SECURITY PROTOCOL (CREDENTIALS) ---
// Login dulu di web factoryforge.vercel.app, terus ambil Token & ID-nya
const char* mqtt_user = "3"; // Sesuaikan dengan ID abang (biasanya 1 atau 3)
const char* mqtt_pass = "PASTE_TOKEN_JWT_DARI_LOCAL_STORAGE_DI_SINI"; 

// --- SECURITY PROTOCOL (CREDENTIALS) ---
// [IMPORTANT] User ID abang adalah 3 (diliat dari isi token tadi)
const char* mqtt_user = "3"; 

// [IMPORTANT]
const char* mqtt_pass = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJhYnlhbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTU5NzUyMSwiZXhwIjoxNzcxNjgzOTIxfQ.bumZyq14JCbbL6-E93q9yFB8BKPCINkBAQwStN6ePDg";  

// --- TOPICS (AUTOMATIC ISOLATION) ---
const String base_topic = "factory/" + String(mqtt_user) + "/sensors/";
const String cmd_topic = "factory/" + String(mqtt_user) + "/commands/#";

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

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("\n[COMMAND] Incoming Signal on: ");
  Serial.println(topic);
  
  String msg;
  for (int i = 0; i < length; i++) msg += (char)payload[i];
  Serial.print("[DATA] Payload: ");
  Serial.println(msg);

  // Example: Handle relay toggle if command is for this device
  if (String(topic).indexOf("relay_main") > 0) {
    if (msg.indexOf("\"value\": 1") > 0) {
      Serial.println("[ACTUATOR] RELAY: ON");
      digitalWrite(STATUS_LED, LOW); // Logic depends on your relay wiring
    } else {
      Serial.println("[ACTUATOR] RELAY: OFF");
      digitalWrite(STATUS_LED, HIGH);
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("[SIGNAL] Attempting Protocol Handshake (JWT)...");
    
    String mac = WiFi.macAddress();
    mac.replace(":", "");
    String clientId = "FF_NODE_" + mac.substring(8); 
    
    // Connect syntax: client.connect(id, user, pass)
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("CONNECTED ✅");
      Serial.printf("[INFO] Passport: User %s Secured\n", mqtt_user);
      
      // Subscribe to commands for this specific user
      client.subscribe(cmd_topic.c_str());
      Serial.println("[INFO] Control Channel: LINKED");
    } else {
      Serial.print("AUTH FAILED [rc=");
      Serial.print(client.state());
      Serial.println("] - Check JWT Token & User ID");
      delay(5000);
    }
  }
}

void setup() {
  pinMode(STATUS_LED, OUTPUT);
  Serial.begin(115200);
  
  Serial.println("\n\n#########################################");
  Serial.println("#      FACTORY FORGE - INDUSTRIAL OS    #");
  Serial.println("#      Security Node: JWT_SECURED_01    #");
  Serial.println("#      Version: v2.1 (Pure Hardware)    #");
  Serial.println("#########################################\n");

  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  Serial.println("[INIT] System initialization complete");
  Serial.println("[READY] Listening for Command Uplinks...\n");
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
      Serial.println("[ERROR] DHT22 sensor offline");
      return;
    }

    // --- PACKET: TEMPERATURE ---
    String topT = base_topic + "dht_temp";
    String payT = "{\"value\": " + String(t, 2) + "}";
    if (client.publish(topT.c_str(), payT.c_str())) {
      Serial.printf("[TX] %s -> %.2f\n", topT.c_str(), t);
    }
    
    // --- PACKET: HUMIDITY ---
    String topH = base_topic + "dht_humid";
    String payH = "{\"value\": " + String(h, 2) + "}";
    if (client.publish(topH.c_str(), payH.c_str())) {
      Serial.printf("[TX] %s -> %.2f\n", topH.c_str(), h);
    }

    // Status Pulse
    digitalWrite(STATUS_LED, LOW);
    delay(30);
    digitalWrite(STATUS_LED, HIGH);
  }
}