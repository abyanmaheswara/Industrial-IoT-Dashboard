import React, { useState } from 'react';
import { FileText, Download, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ExportControlsProps {
    sensorId?: string; // Optional: if provided, export CSV for specific sensor
}

export const ExportControls: React.FC<ExportControlsProps> = ({ sensorId }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState<'csv' | 'pdf' | null>(null);

    const handleDownload = async (type: 'csv' | 'pdf') => {
        setLoading(type);
        try {
            const url = type === 'csv' 
                ? `http://localhost:3001/api/export/csv/${sensorId}`
                : `http://localhost:3001/api/export/pdf/report`;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Download failed');

            // Handle Blob download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = type === 'csv' ? `sensor-${sensorId}-history.csv` : 'operational-report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error("Export error:", err);
            alert("Failed to download report. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex gap-2">
            {sensorId && (
                <button 
                    onClick={() => handleDownload('csv')}
                    disabled={!!loading}
                    className="flex items-center gap-2 px-3 py-2 bg-industrial-700 hover:bg-industrial-600 text-industrial-100 rounded text-sm transition-colors disabled:opacity-50"
                >
                    {loading === 'csv' ? <Loader className="animate-spin" size={16} /> : <Download size={16} />}
                    Export Excel
                </button>
            )}
            
            <button 
                onClick={() => handleDownload('pdf')}
                disabled={!!loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded text-sm transition-colors disabled:opacity-50"
            >
                {loading === 'pdf' ? <Loader className="animate-spin" size={16} /> : <FileText size={16} />}
                Download Report (PDF)
            </button>
        </div>
    );
};
