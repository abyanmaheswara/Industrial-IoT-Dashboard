const mqtt = require('mqtt');

// Connect to the local MQTT broker
const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: 'esp32_simulator_' + Math.floor(Math.random() * 1000)
});

const SENSORS = ['temp_01', 'press_01', 'vib_01', 'energy_01'];

client.on('connect', () => {
    console.log('✅ Connected to MQTT Broker!');
    
    // Simulate publishing data every 2 seconds
    setInterval(() => {
        const sensorId = SENSORS[Math.floor(Math.random() * SENSORS.length)];
        let value = 0;

        // Generate realistic random values based on sensor type
        if (sensorId === 'temp_01') value = (20 + Math.random() * 60).toFixed(1); // 20-80 C
        else if (sensorId === 'press_01') value = (1 + Math.random() * 9).toFixed(1); // 1-10 Bar
        else if (sensorId === 'vib_01') value = (Math.random() * 50).toFixed(2); // 0-50 Hz
        else if (sensorId === 'energy_01') value = (200 + Math.random() * 50).toFixed(1); // 200-250 V

        const payload = JSON.stringify({
            id: sensorId,
            value: value
        });

        const topic = `sensors/${sensorId}`;
        client.publish(topic, payload);
        console.log(`📤 Published to ${topic}: ${payload}`);

    }, 2000);
});

client.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
});
