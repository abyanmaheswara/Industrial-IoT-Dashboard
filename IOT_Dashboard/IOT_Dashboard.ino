#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// --- KONFIGURASI WIFI ---
const char* ssid = "OPPO Reno8";
const char* password = "12345678";

// --- KONFIGURASI MQTT ---
// IP Laptop kamu (cek via ipconfig)
const char* mqtt_server = "10.158.49.141"; 
const int mqtt_port = 1883;

// --- KONFIGURASI SENSOR ---
#define DHTPIN 4      // Pin Data DHT22 (GPIO 4)
#define DHTTYPE DHT22 // Ganti DHT11 jika pakai DHT11

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
// Kirim data setiap 2 detik
#define MSG_INTERVAL 2000 

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > MSG_INTERVAL) {
    lastMsg = now;

    // Baca data sensor
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    // Cek jika bacaan geblek (NaN)
    if (isnan(h) || isnan(t)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    // --- KIRIM TEMPERATURE ---
    // Topik: sensors/dht_temp
    // Payload: { "id": "dht_temp", "value": 25.5 }
    String payloadTemp = "{\"id\": \"dht_temp\", \"value\": " + String(t) + "}";
    client.publish("sensors/dht_temp", payloadTemp.c_str());
    Serial.print("Sent Temp: ");
    Serial.println(payloadTemp);
    
    // --- KIRIM HUMIDITY ---
    // Topik: sensors/dht_humid
    // Payload: { "id": "dht_humid", "value": 60.5 }
    String payloadHumid = "{\"id\": \"dht_humid\", \"value\": " + String(h) + "}";
    client.publish("sensors/dht_humid", payloadHumid.c_str());
    Serial.print("Sent Humid: ");
    Serial.println(payloadHumid);
  }
}