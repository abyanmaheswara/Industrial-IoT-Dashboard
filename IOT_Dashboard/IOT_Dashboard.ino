#include <WiFi.h>
#include <DHT.h>

// --- BUFFER OVERRIDE (CRITICAL FOR JWT) ---
// Default PubSubClient buffer is 256. JWT tokens are long.
#define MQTT_MAX_PACKET_SIZE 1024 
#include <PubSubClient.h> // Include AFTER defining buffer size

// ==========================================
// --- FACTORY FORGE - EDGE NODE FIRMWARE ---
// ==========================================

// --- NETWORK CONFIGURATION ---
const char* ssid = "OPPO Reno8";          
const char* password = "12345678";        

// --- PROTOCOL CONFIGURATION (MQTT) ---
const char* mqtt_server = "shuttle.proxy.rlwy.net"; 
const int mqtt_port = 36414;

// --- SECURITY PROTOCOL (CREDENTIALS) ---
// 1. Ambil User ID & Token dari web factoryforge.vercel.app
// 2. Klik kanan di dashboard -> Inspect -> Application -> Local Storage
// 3. User ID bisa diliat di logs (tadi User 1) atau di menu Profile
const char* mqtt_user = "1"; // SESUAIKAN DENGAN ID ABANG (biasanya 1)
const char* mqtt_pass = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhYnlhbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTYxMDM0NiwiZXhwIjoxNzcxNjk2NzQ2fQ.MM82XjgzWxe8n9ODfs4QGOF78cqLgEMYmgi0sor1Wtc"; 

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
      Serial.printf("[INFO] Passport Success: User ID [%s] is Secure\n", mqtt_user);
      Serial.printf("[INFO] Client ID: %s\n", clientId.c_str());
      
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
  client.setSocketTimeout(30); // Allow more time for JWT handshake over proxy
  
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