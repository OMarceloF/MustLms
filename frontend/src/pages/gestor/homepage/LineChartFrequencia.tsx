'use client';

import { Card } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { frequenciaData } from '../../lib/mock-data';

export function LineChartFrequencia() {
  return (
    <Card className="p-5 shadow-lg border-gray-200">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#363776]">
          Evolução de Frequência Mensal
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Comparativo entre 2024 e 2025
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={frequenciaData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            domain={[80, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '11px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px' }}
          />
          <Line 
            type="monotone" 
            dataKey="2024" 
            stroke="#9ca3af" 
            strokeWidth={2}
            dot={{ fill: '#9ca3af', r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="2025" 
            stroke="#363776" 
            strokeWidth={3}
            dot={{ fill: '#363776', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
