const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);
const db = require('./db');

const startBroker = (io) => {
    const PORT = 1883;

    server.listen(PORT, function () {
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
                    console.log(`[MQTT] Data received from ${data.id}: ${data.value}`);
                    
                    // 1. Save to Database
                    await db.saveReading(data.id, parseFloat(data.value));

                    // 2. Emit to Socket.io (Real-time Dashboard)
                    io.emit('sensorUpdate', {
                        id: data.id,
                        value: parseFloat(data.value),
                        timestamp: new Date()
                    });
                }
            } catch (err) {
                console.error(`[MQTT] Error processing message on ${packet.topic}:`, err.message);
            }
        }
    });
};

module.exports = { startBroker };
