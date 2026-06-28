import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;
  volume: number;
}

interface WorkoutChartProps {
  data: ChartData[];
}

export function WorkoutChart({ data }: WorkoutChartProps) {
  // Using Tailwind variables for colors (need to be hex for recharts usually, but we can pass them in or use hardcoded max-brand colors)
  const brandColor = '#FFA500'; 
  const surfaceColor = '#1E1E1E';

  return (
    <div className="w-full h-64 bg-maximus-surface-light dark:bg-maximus-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-800">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">Volume Progression</h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: surfaceColor, border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: brandColor }}
            />
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke={brandColor} 
              fillOpacity={1} 
              fill={`url(#colorVolume)`} 
            />
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={brandColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={brandColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
