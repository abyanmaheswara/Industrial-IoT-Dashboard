import React from 'react';
import { AlertStats } from '../components/Alerts/AlertStats';
import { AlertFilters } from '../components/Alerts/AlertFilters';
import { AlertTable } from '../components/Alerts/AlertTable';
import { socket } from '../socket';
import { RuleConfigModal } from '../components/Alerts/RuleConfigModal';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = React.useState<any[]>([]);
  const [displayedAlerts, setDisplayedAlerts] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState({ critical: 0, warning: 0, acknowledged: 0, avgResponse: '-' });
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  
  // Filter States
  const [filterType, setFilterType] = React.useState('all');
  const [showCriticalOnly, setShowCriticalOnly] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchAlerts = async () => {
    try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${API_URL}/api/alerts`);
        const data = await res.json();
        setAlerts(data);

        // Calculate stats
        const crit = data.filter((a: any) => a.type === 'critical').length;
        const warn = data.filter((a: any) => a.type === 'warning').length;
        const ack = data.filter((a: any) => a.status === 'acknowledged').length;
        
        // Calculate Avg Response
        const resolved = data.filter((a: any) => a.resolved_at);
        let avgTime = "N/A";
        if (resolved.length > 0) {
            const totalTime = resolved.reduce((acc: number, curr: any) => {
                return acc + (new Date(curr.resolved_at).getTime() - new Date(curr.created_at).getTime());
            }, 0);
            const avgMinutes = Math.round((totalTime / resolved.length) / 60000);
            avgTime = `${avgMinutes}m`;
        }

        setStats({ critical: crit, warning: warn, acknowledged: ack, avgResponse: avgTime });

    } catch (err) {
        console.error("Failed to fetch alerts:", err);
    }
  };

  // Apply Filters
  React.useEffect(() => {
    let result = [...alerts];
    
    if (showCriticalOnly) {
        result = result.filter(a => a.type === 'critical');
    }
    
    if (filterType !== 'all') {
        result = result.filter(a => a.type === filterType);
    }

    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(a => {
            const message = (a.message || '').toLowerCase();
            const sensorId = (a.sensor_id || '').toLowerCase();
            const sensorName = (a.sensor_name || '').toLowerCase();
            
            return message.includes(lowerQuery) || 
                   sensorId.includes(lowerQuery) || 
                   sensorName.includes(lowerQuery);
        });
    }
    
    setDisplayedAlerts(result);
  }, [alerts, showCriticalOnly, filterType, searchQuery]);

  React.useEffect(() => {
    fetchAlerts(); // Initial fetch
    
    if (!socket.connected) socket.connect();
    
    const onNewAlert = (newAlert: any) => {
        // Prepend new alert to state
        setAlerts(prev => [newAlert, ...prev]);
    };

    socket.on('newAlert', onNewAlert);

    return () => {
        socket.off('newAlert', onNewAlert);
    };
  }, []);

  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Alerts Management</h1>
          <p className="text-industrial-400 text-sm mt-1">Monitor and respond to system alerts</p>
        </div>
        <button 
            onClick={() => setIsConfigOpen(true)}
            className="px-4 py-2 bg-industrial-800 hover:bg-industrial-700 text-white rounded-md text-sm font-medium transition-colors border border-industrial-700 flex items-center shadow-lg"
        >
            <span className="mr-2">⚙️</span> Configure Rules
        </button>
      </div>

      <AlertStats stats={stats} />
      
      <AlertFilters 
        filterType={filterType} 
        setFilterType={setFilterType} 
        showCriticalOnly={showCriticalOnly} 
        setShowCriticalOnly={setShowCriticalOnly} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <AlertTable alerts={displayedAlerts} onRefresh={fetchAlerts} />

      <RuleConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        onSave={() => {
            fetchAlerts();
        }}
      />
    </div>
  );
};
