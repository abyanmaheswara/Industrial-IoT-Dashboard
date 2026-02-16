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
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const url = type === 'csv' 
                ? `${API_URL}/api/export/csv/${sensorId}`
                : `${API_URL}/api/export/pdf/report`;
            
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
                    className="flex items-center gap-2 px-3 py-2 bg-industrial-800 hover:bg-industrial-700 text-industrial-100 rounded-md text-xs font-bold uppercase tracking-wider transition-all border border-industrial-700 disabled:opacity-50"
                >
                    {loading === 'csv' ? <Loader className="animate-spin" size={14} /> : <Download size={14} />}
                    Export Excel
                </button>
            )}
            
            <button 
                onClick={() => handleDownload('pdf')}
                disabled={!!loading}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-600 hover:to-brand-400 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(168,121,50,0.2)] disabled:opacity-50 border border-brand-500/20"
            >
                {loading === 'pdf' ? <Loader className="animate-spin" size={14} /> : <FileText size={14} />}
                Download Report (PDF)
            </button>
        </div>
    );
};
