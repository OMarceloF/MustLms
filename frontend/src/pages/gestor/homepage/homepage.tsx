import { KpiCard } from './KpiCard';
import { LineChartFrequencia } from './LineChartFrequencia';
import { BarChartDesempenho } from './BarChartDesempenho';
import { DoughnutCiclos } from './DoughnutCiclos';
import { MiniCalendar } from './MiniCalendar';
import { AvisosPanel } from './AvisosPanel';
import { AtividadesRecentes } from './AtividadesRecentes';
import { kpiData } from '../../lib/mock-data';
import { GraduationCap } from 'lucide-react';

export default function HomeGestorNovo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 lg:px-8 py-6">
        <section className="mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpiData.map(kpi => (
              <KpiCard key={kpi.id} data={kpi} />
            ))}
          </div>
        </section>

        <section className="mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Avisos ocupam 2 colunas - área principal de destaque */}
            <div className="lg:col-span-2">
              <AvisosPanel />
            </div>
            {/* Calendário na direita - 1 coluna compacta */}
            <div className="lg:col-span-1">
              <MiniCalendar />
            </div>
          </div>
        </section>

        <section className="mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Line Chart ocupando 75% */}
            <div className="lg:col-span-3">
              <LineChartFrequencia />
            </div>
            {/* Doughnut ocupando 25% */}
            <div className="lg:col-span-1">
              <DoughnutCiclos />
            </div>
          </div>
        </section>

        <section className="mb-5">
          <BarChartDesempenho />
        </section>

        <section>
          <AtividadesRecentes />
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-8 shadow-inner">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              © 2025 LMS - Learning Management System. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-600 hover:text-[#363776] transition-colors font-medium">
                Suporte
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#363776] transition-colors font-medium">
                Documentação
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-[#363776] transition-colors font-medium">
                Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
