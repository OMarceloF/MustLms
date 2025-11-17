'use client';

import { Card } from '../components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ciclosData } from '../../lib/mock-data';

export function DoughnutCiclos() {
  const total = ciclosData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-5 shadow-lg border-gray-200 h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#363776]">
          Distribuição por Ciclo
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {total} alunos matriculados
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={ciclosData}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {ciclosData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '11px'
            }}
            formatter={(value: number) => [
              `${value} alunos (${((value / total) * 100).toFixed(1)}%)`,
              ''
            ]}
          />
          <Legend 
            verticalAlign="bottom"
            height={30}
            wrapperStyle={{ fontSize: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
