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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Rota conforme definida no routes.ts
        const response = await apiLocal.get('/api/dashboard/gestor');
        setDashboardData(response.data);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError("Não foi possível conectar ao servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-[#363776]" />
          <p className="text-sm text-gray-500 font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded-lg shadow-lg border border-red-100 text-center">
          <h3 className="text-lg font-bold text-red-600 mb-2">Erro de Conexão</h3>
          <p className="text-gray-600 mb-4">{error || "Dados não encontrados."}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#363776] text-white rounded hover:bg-opacity-90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-[1800px] mx-auto px-6 lg:px-8 py-6">
        
        {/* KPIs */}
        <section className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {dashboardData.kpiData && dashboardData.kpiData.map((kpi: any) => (
              <KpiCard key={kpi.id} data={kpi} />
            ))}
          </div>
        </section>

        {/* Avisos e Calendário */}
        <section className="mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <AvisosPanel data={dashboardData.comunicados || []} />
            </div>
            <div className="lg:col-span-1">
              <MiniCalendar 
                 events={dashboardData.eventos || []} 
                 holidays={dashboardData.feriados || []} 
              />
            </div>
          </div>
        </section>

        {/* Gráficos */}
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

        {/* Desempenho e Atividades */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
             <BarChartDesempenho data={dashboardData.desempenhoTurmasData || []} />
          </div>
          <div>
             <AtividadesRecentes data={dashboardData.atividadesRecentes || []} />
          </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 shadow-inner py-5">
        <div className="max-w-[1800px] mx-auto px-6 text-center text-sm text-gray-600">
           © 2025 Must University. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}