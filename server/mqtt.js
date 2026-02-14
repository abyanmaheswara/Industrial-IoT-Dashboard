const Aedes = require('aedes').Aedes;
const aedes = new Aedes();
const server = require('net').createServer(aedes.handle);
const db = require('./db');

const startBroker = (io, onDataReceived) => {
    const PORT = 1883;
    const HOST = '0.0.0.0'; // Explicitly bind to all IPv4 interfaces

    server.listen(PORT, HOST, function () {
        console.log(`📡 MQTT Broker started on port ${PORT}`);
    });

    // Authentication (Optional for now, allow all)
    aedes.authenticate = function (client, username, password, callback) {
        callback(null, true);
    };

    // Client Connected
    aedes.on('client', function (client) {
        console.log(`[MQTT] Client Connected: ${client ? client.id : client}`);
    });

    // Handle incoming messages
    aedes.on('publish', async function (packet, client) {
        if (packet.topic.startsWith('sensors/')) {
            try {
                const payload = packet.payload.toString();
                const data = JSON.parse(payload);
                
                // Expecting payload: { id: "temp_01", value: 25.5 }
                if(data.id && data.value !== undefined) {
                    const val = parseFloat(data.value);
                    console.log(`[MQTT] Data received from ${data.id}: ${val}`);
                    
                    // 1. Save to Database
                    await db.saveReading(data.id, val);

                    // 2. Emit to Socket.io (Real-time Dashboard)
                    io.emit('sensorUpdate', {
                        id: data.id,
                        value: val,
                        timestamp: new Date()
                    });

                    // 3. Trigger Alert/AI Logic (Callback)
                    if (onDataReceived) {
                        onDataReceived(data.id, val);
                    }
                }
            } catch (err) {
                console.error(`[MQTT] Error processing message on ${packet.topic}:`, err.message);
            }
        }
    });
};

module.exports = { startBroker };
