import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Importação dos componentes
import { KpiCard } from './KpiCard';
import { LineChartFrequencia } from './LineChartFrequencia';
import { BarChartDesempenho } from './BarChartDesempenho';
import { DoughnutCiclos } from './DoughnutCiclos';
import { MiniCalendar } from './MiniCalendar';
import { AvisosPanel } from './AvisosPanel';
import { AtividadesRecentes } from './AtividadesRecentes';

// --- CORREÇÃO: Instância local do Axios apontando para a porta 3001 ---
const apiLocal = axios.create({
  baseURL: 'http://localhost:3001', // Garante que usa a porta onde o backend está rodando
});

export default function HomeGestorNovo() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados dos filtros
  const [selectedCurso, setSelectedCurso] = useState('');
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [selectedDisciplina, setSelectedDisciplina] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiLocal.get('/api/dashboard/gestor', {
        params: {
            cursoId: selectedCurso,
            periodoId: selectedPeriodo,
            disciplinaId: selectedDisciplina
        }
      });
      setDashboardData(response.data);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCurso, selectedPeriodo, selectedDisciplina]);

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#363776]" />
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-[1800px] mx-auto px-6 lg:px-8 py-6">
        
        {/* 1. KPIs (Cards do Topo) */}
        <section className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {dashboardData.kpiData.map((kpi: any) => (
              <KpiCard key={kpi.id} data={kpi} />
            ))}
          </div>
        </section>

        {/* 2. Avisos e Calendário (MOVIDO PARA CIMA) */}
        <section className="mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <AvisosPanel data={dashboardData.comunicados || []} />
            </div>
            <div className="lg:col-span-1">
              <MiniCalendar events={dashboardData.eventos || []} holidays={dashboardData.feriados || []} />
            </div>
          </div>
        </section>

        {/* 3. Gráfico Desempenho com Filtros (MOVIDO PARA BAIXO) */}
        <section className="mb-5">
             <BarChartDesempenho 
                data={dashboardData.desempenhoTurmasData || []}
                cursos={dashboardData.filtros?.cursos || []}
                periodos={dashboardData.filtros?.periodos || []}
                disciplinas={dashboardData.filtros?.disciplinas || []}
                selectedCurso={selectedCurso}
                setSelectedCurso={setSelectedCurso}
                selectedPeriodo={selectedPeriodo}
                setSelectedPeriodo={setSelectedPeriodo}
                selectedDisciplina={selectedDisciplina}
                setSelectedDisciplina={setSelectedDisciplina}
             />
        </section>

        {/* 4. Gráficos de Frequência e Ciclos */}
        <section className="mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <LineChartFrequencia data={dashboardData.frequenciaData || []} />
            </div>
            <div className="lg:col-span-1">
              <DoughnutCiclos data={dashboardData.ciclosData || []} />
            </div>
          </div>
        </section>

        {/* 5. Atividades Recentes */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
             <AtividadesRecentes data={dashboardData.atividadesRecentes || []} />
          </div>
        </section>

      </main>
    </div>
  );
}