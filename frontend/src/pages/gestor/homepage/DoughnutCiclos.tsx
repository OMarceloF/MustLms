'use client';

import { Card } from '../components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Label } from 'recharts';

interface DoughnutCiclosProps {
  data: any[];
}

// Paleta de cores mais profissional e extensa para cobrir vários cursos
const COLORS = [
  '#363776', // Azul principal da marca
  '#F97316', // Laranja
  '#10B981', // Verde Esmeralda
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#06B6D4', // Ciano
  '#EAB308', // Amarelo escuro
  '#64748B', // Slate
];

export function DoughnutCiclos({ data }: DoughnutCiclosProps) {
  const safeData = Array.isArray(data) ? data : [];
  
  // Garante que usamos nossas cores ou as do banco se existirem
  const chartData = safeData.map((item, index) => ({
    ...item,
    color: item.color || COLORS[index % COLORS.length]
  }));

  const total = chartData.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <Card className="p-6 shadow-lg border-gray-200 h-full flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[#363776]">
          Distribuição de Alunos por Curso
        </h3>
        <p className="text-sm text-muted-foreground">
          Visão geral das matrículas ativas
        </p>
      </div>
      
      <div className="flex-1 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={80} // Raio interno maior para visual "Donut" moderno
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                />
              ))}
              
              {/* Texto Centralizado com o Total */}
              <Label
                value={total}
                position="center"
                className="fill-[#363776] text-4xl font-bold"
                dy={-5}
              />
              <Label
                value="Alunos"
                position="center"
                className="fill-gray-500 text-sm font-medium"
                dy={20}
              />
            </Pie>
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#374151' }}
              formatter={(value: number, name: string) => {
                const percent = ((value / total) * 100).toFixed(1);
                return [
                  <span key="val" className="font-semibold">{value} alunos ({percent}%)</span>,
                  name
                ];
              }}
            />
            
            <Legend 
              verticalAlign="bottom"
              layout="horizontal"
              align="center"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '11px',
                fontFamily: 'inherit'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}