# 📟 Panduan Integrasi ESP32 + DHT22 ke FactoryForge

Gunakan panduan ini untuk menghubungkan sensor suhu & kelembaban asli (DHT22) ke dashboard FactoryForge menggunakan protokol MQTT.

## 🛠️ Persiapan Hardware
1.  **ESP32 Dev Module** (atau NodeMCU ESP8266)
2.  **Sensor DHT22** (atau DHT11)
3.  **Kabel Jumper**
4.  **Breadboard**

### Skema Kabel (Wiring) - ESP32 38 Pin
| DHT22 Pin | ESP32 Pin (Cari label di board) | Keterangan |
| :--- | :--- | :--- |
| **VCC (+)** | **3V3** (atau 5V) | Power Supply |
| **GND (-)** | **GND** | Ground |
| **DATA** | **D4** (atau **G4** / **IO4**) | Data Signal |
*(Note: Pasang resistor 10kΩ antara VCC dan DATA jika module DHT belum built-in)*

> **Tips:** Di board ESP32 38 pin, cari pin yang tulisannya **D4**, **G4**, atau angka **4** saja. Itu sama dengan GPIO 4 di codingan.

---

## 💻 Persiapan Software (Arduino IDE)

1.  **Install Library**:
    Buka Arduino IDE > **Sketch** > **Include Library** > **Manage Libraries**, cari dan install:
    *   `PubSubClient` (by Nick O'Leary)
    *   `DHT sensor library` (by Adafruit)
    *   `Adafruit Unified Sensor` (by Adafruit)

2.  **Upload Code**:
    Copy code di bawah ini ke Arduino IDE.

    > **PENTING**:
    > *   Ganti `SSID_WIFI` dan `PASSWORD_WIFI` sesuai wifi kamu.
    > *   **MQTT_SERVER**: Berdasarkan `ipconfig` kamu, coba gunakan `192.168.100.12`.
    > *   Pastikan laptop dan ESP32 konek ke WiFi yang sama.

```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

// --- KONFIGURASI WIFI ---
const char* ssid = "NAMA_WIFI_KAMU";
const char* password = "PASSWORD_WIFI_KAMU";

// --- KONFIGURASI MQTT ---
// IP Laptop kamu (cek via ipconfig)
const char* mqtt_server = "192.168.100.12"; 
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
```

## ❓ Troubleshooting (Gagal Konek?)

**Error `rc=-2` (Connection failed)**
Ini artinya ESP32 gagal nyambung ke Laptop. Penyebab paling umum:
1.  **IP Address Berubah**: Cek lagi `ipconfig`, mungkin IP laptop ganti.
2.  **Firewall**: Pastikan rule firewall sudah aktif (Cek langkah di atas).
3.  **Beda Jaringan**: Laptop & ESP32 harus di WiFi yang sama.

**💡 SOLUSI PAMUNGKAS: Pakai Mobile Hotspot Laptop**
Jika pakai WiFi rumah susah konek, coba ini (Paling Stabil):
1.  Nyalakan **Mobile Hotspot** di Laptop (Settings > Network > Mobile Hotspot).
2.  Konek ESP32 ke Hotspot Laptop tersebut (Ganti `ssid` & `password` di codingan).
3.  Cek IP Laptop di Hotspot itu (biasanya `192.168.137.1`).
4.  Upload ulang & Tes.

**Error `Failed to read from DHT sensor!`**
1.  Cek kabel data (pastikan nyolok ke pin yang benar).
2.  Coba ganti `DHTTYPE` jadi `DHT11` di codingan jika pakai sensor biru.

### 🧪 Cara Tes Paling Valid (Cek Pake HP)
Biar tau yang salah Laptop atau ESP32, coba install aplikasi **"MQTT Dashboard"** atau **"MyMQTT"** di HP.
1.  HP harus konek ke WiFi yang sama dengan Laptop.
2.  Bikin koneksi baru di app:
    *   **Host**: IP Laptop (misal `192.168.100.12` atau IP Hotspot).
    *   **Port**: `1883`.
3.  Coba **Connect**.
    *   Kalau HP **BISA Konek**: Berarti masalah ada di codingan/kabel ESP32.
    *   Kalau HP **GAGAL Konek**: Berarti masalah di Laptop (Firewall/Antivirus). **Matikan antivirus sementara!**

