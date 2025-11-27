'use client';

import { Card } from '../components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DoughnutCiclosProps {
  data: any[];
}

export function DoughnutCiclos({ data }: DoughnutCiclosProps) {
  const safeData = Array.isArray(data) ? data : [];
  
  const total = safeData.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <Card className="p-5 shadow-lg border-gray-200 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-base font-bold text-[#363776]">
          Alunos por Curso
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {total} alunos matriculados ativos
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={safeData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {safeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number, name: string) => [
                `${value} alunos`,
                name
              ]}
            />
            <Legend 
              verticalAlign="bottom"
              layout="horizontal"
              align="center"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ 
                fontSize: '10px',
                paddingTop: '20px',
                lineHeight: '14px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}