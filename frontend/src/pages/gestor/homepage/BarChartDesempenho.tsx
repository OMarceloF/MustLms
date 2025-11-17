'use client';

import { Card } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { desempenhoTurmasData } from '../../lib/mock-data';

export function BarChartDesempenho() {
  return (
    <Card className="p-5 shadow-lg border-gray-200">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#363776]">
          Desempenho por Turma
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ranking das turmas com melhor desempenho
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={desempenhoTurmasData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            domain={[0, 100]}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            type="category"
            dataKey="turma" 
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            width={60}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '11px'
            }}
            formatter={(value) => [`${value}%`, 'Desempenho']}
          />
          <Bar 
            dataKey="desempenho" 
            fill="#9dba32"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
