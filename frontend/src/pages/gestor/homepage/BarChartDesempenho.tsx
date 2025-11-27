'use client';

import { Card } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartDesempenhoProps {
  data: any[];
}

export function BarChartDesempenho({ data }: BarChartDesempenhoProps) {
  return (
    <Card className="p-5 shadow-lg border-gray-200">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#363776]">
          Desempenho por Turma
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ranking das turmas com melhor desempenho (Média de Notas 0-100)
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          
          <XAxis 
            type="number"
            domain={[0, 100]} // CORREÇÃO: Escala ajustada para 0-100
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
            hide // Opcional: esconde os números do eixo X para ficar mais limpo se preferir
          />
          
          <YAxis 
            type="category"
            dataKey="turma" 
            stroke="#6b7280"
            style={{ fontSize: '11px', fontWeight: 500 }}
            width={120} // Aumentado para caber nomes de turmas maiores
          />
          
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '11px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value) => [`${value}`, 'Média Geral']}
          />
          
          <Bar 
            dataKey="desempenho" 
            fill="#9dba32"
            radius={[0, 4, 4, 0]}
            barSize={24}
            // Adiciona o valor na ponta da barra para facilitar leitura
            label={{ position: 'right', fill: '#6b7280', fontSize: 11, fontWeight: 'bold' }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}