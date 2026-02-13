const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const db = require('./db');
const fs = require('fs');
const path = require('path');

const exportToExcel = async (sensorId, res) => {
    try {
        const history = await db.getHistory(sensorId, 1000);
        
        if (!history || history.length === 0) {
            return res.status(404).send('No data found for this sensor');
        }

        const sensors = await db.getSensors();
        const sensorInfo = sensors.find(s => s.id === sensorId) || { unit: '', name: sensorId };

        // Create Workbook
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Sensor Data');

        // --- Report Header ---
        sheet.mergeCells('A1:E2');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'INDUSTRIAL IOT SENSOR REPORT';
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Dark Slate
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Metadata
        sheet.getCell('A4').value = 'Generated On:';
        sheet.getCell('B4').value = new Date().toLocaleString();
        sheet.getCell('A5').value = 'Sensor Name:';
        sheet.getCell('B5').value = sensorInfo.name;
        sheet.getCell('A6').value = 'Sensor Type:';
        sheet.getCell('B6').value = sensorInfo.type;

        ['A4', 'A5', 'A6'].forEach(cell => {
            sheet.getCell(cell).font = { bold: true };
        });

        // --- Data Table ---
        const startRow = 8;
        const headerRow = sheet.getRow(startRow);
        headerRow.values = ['ID', 'Timestamp', 'Value', 'Unit', 'Status'];
        
        // Header Styling
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } }; // Slate 600
            cell.alignment = { horizontal: 'center' };
            cell.border = { bottom: { style: 'thick' } };
        });

        // Add Data
        history.forEach((record) => {
            const row = sheet.addRow([
                record.id,
                new Date(record.timestamp).toLocaleString(),
                parseFloat(record.value),
                sensorInfo.unit,
                record.status.toUpperCase()
            ]);

            // Value Formatting
            row.getCell(3).numFmt = '0.00'; 

            // Conditional Formatting for Status (Col 5)
            const statusCell = row.getCell(5);
            if (record.status === 'critical') {
                statusCell.font = { color: { argb: 'FFDC2626' }, bold: true }; // Red
            } else if (record.status === 'warning') {
                statusCell.font = { color: { argb: 'D97706' }, bold: true }; // Orange
            } else {
                statusCell.font = { color: { argb: 'FF16A34A' } }; // Green
            }
            statusCell.alignment = { horizontal: 'center' };
        });

        // Column Widths
        sheet.columns = [
            { width: 10 }, // ID
            { width: 25 }, // Timestamp
            { width: 15 }, // Value
            { width: 10 }, // Unit
            { width: 15 }  // Status
        ];

        // Response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${sensorInfo.name.replace(/\s+/g, '_')}_Report.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Excel Export Error:", err);
        res.status(500).send("Error generating Excel file");
    }
};

const exportPDFReport = async (res) => {
    try {
        const doc = new PDFDocument({ margin: 50 });
        
        // Stream to response
        res.header('Content-Type', 'application/pdf');
        res.attachment('industrial-iot-report.pdf');
        doc.pipe(res);

        // --- Header ---
        doc.rect(0, 0, doc.page.width, 120).fill('#0f172a'); // Darker header
        doc.fillColor('white');
        doc.fontSize(26).text('Industrial IoT Operation Report', 50, 40);
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, 50, 80);
        doc.text('Confidential Document', 50, 95);
        doc.fillColor('black');
        
        doc.y = 150; // Reset Y position below header

        // --- Helper: Draw Table Row ---
        const drawRow = (y, col1, col2, col3, col4, isHeader = false) => {
            const startX = 50;
            const colWidths = [150, 100, 150, 100]; // Defined widths
            
            if (isHeader) {
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#334155');
                // Draw background for header
                doc.rect(startX, y - 5, 500, 20).fill('#e2e8f0');
                doc.fillColor('#334155');
            } else {
                doc.font('Helvetica').fontSize(10).fillColor('black');
                // Alternating row colors could go here, but keep simple for now
                doc.moveTo(startX, y + 12).lineTo(550, y + 12).lineWidth(0.5).strokeColor('#cbd5e1').stroke();
            }

            doc.text(col1, startX + 5, y);
            doc.text(col2, startX + colWidths[0] + 5, y);
            doc.text(col3, startX + colWidths[0] + colWidths[1] + 5, y);
            
            // Status Color Logic
            if (!isHeader && (col4 === 'CRITICAL' || col4 === 'WARNING' || col4 === 'NORMAL')) {
                const colors = { CRITICAL: 'red', WARNING: 'orange', NORMAL: 'green' };
                doc.fillColor(colors[col4] || 'black');
            }
            doc.text(col4, startX + colWidths[0] + colWidths[1] + colWidths[2] + 5, y);
            doc.fillColor('black'); // Reset
        };

        // --- System Status Section ---
        doc.fontSize(16).text('1. System Status Summary', 50, doc.y, { underline: false });
        doc.moveDown(1);
        
        // Table Header
        let currentY = doc.y;
        drawRow(currentY, 'Sensor Name', 'Type', 'Current Value', 'Status', true);
        currentY += 25;

        // Table Data
        const sensors = await db.getSensors();
        for (const sensor of sensors) {
            const history = await db.getHistory(sensor.id, 1);
            const latest = history[0] || { value: 0, status: 'unknown' };
            const valStr = `${latest.value} ${sensor.unit}`;
            
            drawRow(currentY, sensor.name, sensor.type, valStr, latest.status.toUpperCase());
            currentY += 20;
        }

        doc.y = currentY + 30; // Move down for next section

        // --- Alerts Section ---
        doc.fontSize(16).text('2. Critical Alerts (Last 24h)', 50, doc.y);
        doc.moveDown(1);

        const alerts = await db.getAlerts();
        
        if (alerts.length === 0) {
            doc.fontSize(12).fillColor('green').text("✅ No active alerts. System is healthy.", { align: 'left' });
        } else {
            alerts.slice(0, 15).forEach(alert => {
                // Check for page break
                if (doc.y > doc.page.height - 100) {
                    doc.addPage();
                    doc.y = 50;
                }

                const type = alert.type ? alert.type.toUpperCase() : 'INFO';
                const msg = alert.message || 'Unknown event';
                const time = alert.created_at ? new Date(alert.created_at).toLocaleString() : '-';
                const bgColor = type === 'CRITICAL' ? '#fee2e2' : '#ffedd5';
                const textColor = type === 'CRITICAL' ? '#b91c1c' : '#c2410c';

                // Alert Box
                doc.rect(50, doc.y, 500, 45).fillAndStroke(bgColor, bgColor);
                
                // Icon/Badge
                doc.roundedRect(60, doc.y + 10, 60, 20, 10).fill(textColor);
                doc.fillColor('white').fontSize(8).text(type, 60, doc.y + 16, { width: 60, align: 'center' });
                
                // Message
                doc.fillColor('#1e293b').fontSize(11).text(msg, 130, doc.y + 10);
                
                // Time
                doc.fillColor('#64748b').fontSize(9).text(time, 130, doc.y + 26);
                
                doc.y += 55; // Spacing between alerts
            });
        }
        
        // Footer (on all pages if we looped, but simple end here)
        const bottom = doc.page.height - 50;
        doc.font('Helvetica-Oblique').fontSize(8).fillColor('gray')
           .text('Automated Report by Industrial IoT Dashboard', 50, bottom, { align: 'center' });

        doc.end();

    } catch (err) {
        console.error("PDF Export Error:", err);
        if (!res.headersSent) res.status(500).send("Error generating PDF");
    }
};

module.exports = {
    exportToExcel,
    exportPDFReport
};
