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
      <div className="h-full w-full flex items-center justify-center text-industrial-500">
        <p>Waiting for data history...</p>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#2a343c" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp: number) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            stroke="#688397"
            tick={{ fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis 
            stroke="#688397" 
            tick={{ fontSize: 12 }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#151a1e', borderColor: '#2a343c', color: '#f4f6f8' }}
            labelStyle={{ color: '#879cac' }}
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
