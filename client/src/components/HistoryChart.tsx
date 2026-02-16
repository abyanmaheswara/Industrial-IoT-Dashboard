import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SensorData } from '../types/sensor';

interface HistoryChartProps {
  data: SensorData[];
  color?: string;
}

export const HistoryChart = ({ data, color = "#10b981" }: HistoryChartProps) => {
  // Filter data for the specific sensor if mixed data array is passed, 
  // or assume pre-filtered. For MVP, we'll assume the parent manages history buffering.
  
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-brand-700/50">
        <p className="text-[11px] font-bold uppercase tracking-widest">Waiting for data history...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#473c31" vertical={false} opacity={0.3} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp: number) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            stroke="#826f5a"
            tick={{ fontSize: 10, fill: '#826f5a', fontWeight: 'bold' }}
            minTickGap={30}
          />
          <YAxis 
            stroke="#826f5a" 
            tick={{ fontSize: 10, fill: '#826f5a', fontWeight: 'bold' }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1510', borderColor: '#a87932', borderRadius: '8px', border: '1px solid rgba(168, 121, 50, 0.3)', color: '#f2e9d9' }}
            labelStyle={{ color: '#a87932', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
            labelFormatter={(label: any) => new Date(label).toLocaleTimeString()}
            formatter={(value: any) => [value, '']}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
