const calculateMean = (data) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
};

const calculateStdDev = (data, mean) => {
    if (data.length === 0) return 0;
    const squareDiffs = data.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
};

const detectAnomaly = (value, history) => {
    // Need at least 10 data points for decent stats
    if (history.length < 10) return { isAnomaly: false, zScore: 0 };

    const mean = calculateMean(history);
    const stdDev = calculateStdDev(history, mean);

    // Prevent division by zero
    if (stdDev === 0) return { isAnomaly: false, zScore: 0 };

    const zScore = (value - mean) / stdDev;
    
    // Threshold: > 2.5 standard deviations
    const isAnomaly = Math.abs(zScore) > 2.5;

    return { isAnomaly, zScore };
};

const updateHealthScore = (currentHealth, sensorValue, sensorThreshold) => {
    let newHealth = currentHealth;
    
    // Decay Logic
    // If value is critical (above threshold), decay fast
    if (sensorValue > sensorThreshold) {
        newHealth -= 2.0; // Critical damage
    } 
    // If value is warning (above 80% threshold), decay slow
    else if (sensorValue > sensorThreshold * 0.8) {
        newHealth -= 0.5; // Minor wear
    } 
    // If normal, slight regeneration (maintenance/cooling) up to 100
    else {
        newHealth += 0.1; 
    }

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, newHealth));
};

module.exports = {
    detectAnomaly,
    updateHealthScore
};
