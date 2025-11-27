'use client';

import { Card } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartDesempenhoProps {
  data: any[];
  cursos: any[];
  periodos: any[];
  disciplinas: any[]; // Nova prop
  selectedCurso: string;
  setSelectedCurso: (value: string) => void;
  selectedPeriodo: string;
  setSelectedPeriodo: (value: string) => void;
  selectedDisciplina: string; // Nova prop
  setSelectedDisciplina: (value: string) => void; // Nova prop
}

export function BarChartDesempenho({ 
    data, 
    cursos, 
    periodos, 
    disciplinas,
    selectedCurso, 
    setSelectedCurso, 
    selectedPeriodo, 
    setSelectedPeriodo,
    selectedDisciplina,
    setSelectedDisciplina
}: BarChartDesempenhoProps) {
    
  return (
    <Card className="p-5 shadow-lg border-gray-200">
      {/* Cabeçalho Flexível: Quebra linha em mobile */}
      <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
            <h3 className="text-base font-bold text-[#363776]">
            Desempenho por Turma
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
            Média das notas finais dos alunos por turma (0-100)
            </p>
        </div>

        {/* FILTROS (3 Selects) */}
        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
            
            {/* Filtro Curso */}
            <div className="relative w-full sm:w-48">
                <select 
                    className="w-full pl-2 pr-8 py-1.5 text-xs border rounded-md bg-white focus:ring-2 focus:ring-[#363776] outline-none border-gray-300 text-gray-600"
                    value={selectedCurso}
                    onChange={(e) => setSelectedCurso(e.target.value)}
                >
                    <option value="">Todos os Cursos</option>
                    {cursos.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
            </div>

            {/* Filtro Disciplina (Novo) */}
            <div className="relative w-full sm:w-48">
                <select 
                    className="w-full pl-2 pr-8 py-1.5 text-xs border rounded-md bg-white focus:ring-2 focus:ring-[#363776] outline-none border-gray-300 text-gray-600"
                    value={selectedDisciplina}
                    onChange={(e) => setSelectedDisciplina(e.target.value)}
                >
                    <option value="">Todas as Disciplinas</option>
                    {disciplinas.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.nome}</option>
                    ))}
                </select>
            </div>

            {/* Filtro Período */}
            <div className="relative w-full sm:w-36">
                <select 
                    className="w-full pl-2 pr-8 py-1.5 text-xs border rounded-md bg-white focus:ring-2 focus:ring-[#363776] outline-none border-gray-300 text-gray-600"
                    value={selectedPeriodo}
                    onChange={(e) => setSelectedPeriodo(e.target.value)}
                >
                    <option value="">Todos Períodos</option>
                    {periodos.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          
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
            style={{ fontSize: '11px', fontWeight: 500 }}
            width={120} 
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
            dataKey="desempenhoNum" 
            fill="#9dba32"
            radius={[0, 4, 4, 0]}
            barSize={24}
            label={{ position: 'right', fill: '#6b7280', fontSize: 11, fontWeight: 'bold' }} 
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}