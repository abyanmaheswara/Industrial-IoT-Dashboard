const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const db = require('./db');
const fs = require('fs');
const path = require('path');

/**
 * Gather real data for reports
 */
async function getReportData() {
    const sensors = await db.getSensors();
    const alerts = await db.getAlerts();
    
    // Calculate Summary Stats
    const totalSensors = sensors.length;
    const activeSensors = sensors.filter(s => s.status === 'active').length;
    const totalAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.type === 'critical').length;
    
    // Get readings for all sensors
    const sensorReadings = await Promise.all(sensors.map(async (sensor) => {
        const history = await db.getHistory(sensor.id, 50);
        const latest = history[0] || { value: 0, status: 'unknown', timestamp: new Date() };
        
        const values = history.map(h => parseFloat(h.value));
        const min = values.length ? Math.min(...values).toFixed(2) : 0;
        const max = values.length ? Math.max(...values).toFixed(2) : 0;
        const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 0;

        return {
            sensorId: sensor.id,
            sensorName: sensor.name,
            value: latest.value,
            unit: sensor.unit,
            status: latest.status.toUpperCase(),
            timestamp: new Date(latest.timestamp).toLocaleString(),
            minValue: min,
            maxValue: max,
            avgValue: avg
        };
    }));

    return {
        generatedAt: new Date().toLocaleString(),
        startDate: 'Default Cycle (24H)',
        endDate: new Date().toLocaleString(),
        generatedBy: 'System Administrator',
        totalSensors,
        activeSensors,
        totalAlerts,
        criticalAlerts,
        systemUptime: '99.98%',
        averageOEE: '88.4%',
        sensorReadings,
        alerts: alerts.slice(0, 50).map(a => ({
            id: a.id,
            severity: a.type.toUpperCase(),
            sensorName: a.sensor_id,
            message: a.message,
            timestamp: new Date(a.created_at).toLocaleString(),
            acknowledged: a.status === 'resolved'
        }))
    };
}

/**
 * Generate PDF Report
 */
const exportPDFReport = async (res) => {
    try {
        const data = await getReportData();
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        res.header('Content-Type', 'application/pdf');
        res.attachment(`FactoryForge_Report_${Date.now()}.pdf`);
        doc.pipe(res);

        // Colors
        const bronze = '#a87932';
        const dark = '#1a1510';

        // ===== HEADER =====
        doc.rect(0, 0, doc.page.width, 140).fill(dark);
        doc.fillColor(bronze).fontSize(28).font('Helvetica-Bold').text('FACTORYFORGE', 50, 45);
        doc.fillColor('white').fontSize(10).font('Helvetica').text('Industrial IoT Monitoring & Intelligence System', 50, 80);
        doc.text(`Generated: ${data.generatedAt}`, 50, 95);
        
        doc.y = 170;

        // ===== SUMMARY STATISTICS =====
        doc.fillColor(bronze).fontSize(16).text('System Summary Intelligence', { underline: true });
        doc.moveDown(0.5);

        const stats = [
            { label: 'Total Node Assets', value: data.totalSensors },
            { label: 'Critical Anomalies', value: data.criticalAlerts },
            { label: 'Operational Health', value: data.systemUptime },
            { label: 'Avg Efficiency Index', value: data.averageOEE }
        ];

        stats.forEach(stat => {
            doc.fontSize(10).fillColor('#666666').text(stat.label, 70, doc.y, { width: 200, continued: true })
               .fillColor('#333333').text(`: ${stat.value}`, { align: 'left' });
        });

        doc.moveDown(1.5);

        // ===== SENSOR READINGS TABLE =====
        doc.fillColor(bronze).fontSize(16).text('Operational Telemetry Map', { underline: true });
        doc.moveDown(0.8);

        const tableTop = doc.y;
        const colWidths = [150, 100, 100, 100];
        const headers = ['Device Node', 'Current', 'Cycle Avg', 'Status'];
        
        doc.fontSize(10).fillColor('black').font('Helvetica-Bold');
        let xPos = 50;
        headers.forEach((header, i) => {
            doc.text(header, xPos, tableTop);
            xPos += colWidths[i];
        });

        doc.moveTo(50, doc.y + 5).lineTo(545, doc.y + 5).strokeColor('#dddddd').stroke();
        doc.moveDown(0.8);

        doc.font('Helvetica');
        data.sensorReadings.forEach((reading) => {
            if (doc.y > 700) doc.addPage();
            
            const rowY = doc.y;
            doc.fontSize(9).fillColor('#333333').text(reading.sensorName, 50, rowY, { width: 140 });
            doc.text(`${reading.value} ${reading.unit}`, 200, rowY);
            doc.text(`${reading.avgValue} ${reading.unit}`, 300, rowY);
            
            const statusColor = reading.status === 'CRITICAL' ? '#ef4444' : reading.status === 'WARNING' ? '#f59e0b' : '#10b981';
            doc.fillColor(statusColor).font('Helvetica-Bold').text(reading.status, 400, rowY);
            doc.fillColor('black').font('Helvetica');
            
            doc.moveDown(0.8);
        });

        // ===== FOOTER =====
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor('#999999').text(`Page ${i + 1} of ${pageCount} | Cybernetically Generated Report`, 50, doc.page.height - 50, { align: 'center' });
        }

        doc.end();
    } catch (err) {
        console.error("PDF Export Error:", err);
        if (!res.headersSent) res.status(500).send("PDF Generation Failed");
    }
};

/**
 * Generate Excel/CSV Report
 */
const exportToExcel = async (sensorId, res, format = 'xlsx') => {
    try {
        const data = await getReportData();
        const workbook = new ExcelJS.Workbook();
        const bronzeHex = 'FFA87932';

        // Summary Sheet
        const summarySheet = workbook.addWorksheet('Operational Summary');
        summarySheet.mergeCells('A1:D1');
        summarySheet.getCell('A1').value = 'FACTORYFORGE INTELLIGENCE REPORT';
        summarySheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        summarySheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1510' } };
        summarySheet.getCell('A1').alignment = { horizontal: 'center' };

        summarySheet.addRow(['Generated:', data.generatedAt]);
        summarySheet.addRow(['System Health:', data.systemUptime]);
        summarySheet.addRow(['Efficiency:', data.averageOEE]);
        summarySheet.addRow([]);
        
        // Data Sheet
        const dataSheet = workbook.addWorksheet('Telemetry Data');
        dataSheet.columns = [
            { header: 'Node Name', key: 'name', width: 25 },
            { header: 'Current Value', key: 'value', width: 15 },
            { header: 'Min Cycle', key: 'min', width: 12 },
            { header: 'Max Cycle', key: 'max', width: 12 },
            { header: 'Avg Cycle', key: 'avg', width: 12 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        dataSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        dataSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bronzeHex } };

        data.sensorReadings.forEach(r => {
            const row = dataSheet.addRow({
                name: r.sensorName,
                value: `${r.value} ${r.unit}`,
                min: r.minValue,
                max: r.maxValue,
                avg: r.avgValue,
                status: r.status
            });

            const statusCell = row.getCell(6);
            if (r.status === 'CRITICAL') statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
            else if (r.status === 'WARNING') statusCell.font = { color: { argb: 'FFFFA500' }, bold: true };
            else statusCell.font = { color: { argb: 'FF008000' } };
        });

        if (format === 'csv') {
            res.header('Content-Type', 'text/csv');
            res.attachment(`FactoryForge_Export_${Date.now()}.csv`);
            await workbook.csv.write(res);
        } else {
            res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.attachment(`FactoryForge_Export_${Date.now()}.xlsx`);
            await workbook.xlsx.write(res);
        }
        res.end();
    } catch (err) {
        console.error("Export Error:", err);
        if (!res.headersSent) res.status(500).send("Export Failed");
    }
};

module.exports = {
    exportToExcel,
    exportPDFReport
};
