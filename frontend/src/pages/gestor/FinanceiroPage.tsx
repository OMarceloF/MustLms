import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  Download,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';


// ───────────────────────────────────────────────────────────────────────────────
// Variáveis para inicialização de datas (corrige o TS2304 “Cannot find name”) 
// ───────────────────────────────────────────────────────────────────────────────
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

type TransactionType = 'receita' | 'despesa';
type TransactionStatus = 'pago' | 'pendente' | 'atrasado' | 'aguardando';

interface Transaction {
  id: string;
  date: string;                 // data_referencia (YYYY-MM-DD)
  description: string;          // descricao
  amount: number;               // valor (bruto)
  netAmount: number;            // valor_com_desconto
  discount: number;             // desconto_percentual
  type: TransactionType;        // tipo
  category: string;             // categoria
  dueDate: string;              // data_vencimento
  paymentDate: string | null;   // data_pagamento ou null
  paymentMethod?: string;       // forma_pagamento
  responsible?: string;         // responsavel
  status: TransactionStatus;    // status
  observation?: string;         // observacao
  receiptUrl?: string;          // comprovante_url
  personId: number;             // id_pessoa
}

interface FilterState {
  dateRange: string;
  startDate: string;
  endDate: string;
  category: string;
  transactionType: string;
  status: string;
  paymentMethod: string;
  responsible: string;
  searchQuery: string;
  selectedMonth: string;
  selectedQuarter: string;
}

// ───────────────────────────────────────────────────────────────────────────────
// Funções utilitárias para calcular métricas e gerar dados de gráficos
// ───────────────────────────────────────────────────────────────────────────────
const calculateMetrics = (
  transactions: Transaction[],
  dateFilter: { startDate: string; endDate: string }
) => {
  const filtered = transactions.filter((t) => {
    return t.date >= dateFilter.startDate && t.date <= dateFilter.endDate;
  });

  const revenue = filtered
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.netAmount, 0);

  const expenses = filtered
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.netAmount, 0);

  return {
    currentBalance: revenue - expenses,
    monthlyRevenue: revenue,
    monthlyExpenses: expenses,
    result: revenue - expenses,
  };
};

const calculateRealMetrics = (
  transactions: Transaction[],
  dateFilter: { startDate: string; endDate: string }
) => {
  const filtered = transactions.filter(
    (t) =>
      t.status === 'pago' &&
      t.date >= dateFilter.startDate &&
      t.date <= dateFilter.endDate
  );

  const revenue = filtered
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.netAmount, 0);

  const expenses = filtered
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.netAmount, 0);

  return {
    realRevenue: revenue,
    realExpenses: expenses,
    realResult: revenue - expenses,
  };
};


const generateChartData = (
  transactions: Transaction[],
  filters: FilterState
) => {
  if (filters.dateRange === 'month') {
    // const year = new Date(filters.startDate).getFullYear();
    // const month = new Date(filters.startDate).getMonth(); // 0‐based
    // const lastDay = new Date(year, month + 1, 0).getDate();

    const [yearStr, monthStr] = filters.startDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0–11
    const lastDay = new Date(year, month + 1, 0).getDate();
    

    return Array.from({ length: lastDay }, (_, i) => {
      const day = i + 1;
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(
        day
      ).padStart(2, '0')}`;

      const dailyTransactions = transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getFullYear() === year &&
          d.getMonth() === month &&
          d.getDate() === day
        );
      });

      const receita = dailyTransactions
        .filter((t) => t.type === 'receita')
        .reduce((sum, t) => sum + t.netAmount, 0);
      const despesa = dailyTransactions
        .filter((t) => t.type === 'despesa')
        .reduce((sum, t) => sum + t.netAmount, 0);

      return {
        name: String(day),
        receita,
        despesa,
        saldo: receita - despesa,
      };
    });
  } else {
    const months = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    return months.map((monthName) => {
      const monthIndex = months.indexOf(monthName);
      const filtered = transactions.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === monthIndex;
      });
      const receita = filtered
        .filter((t) => t.type === 'receita')
        .reduce((sum, t) => sum + t.netAmount, 0);
      const despesa = filtered
        .filter((t) => t.type === 'despesa')
        .reduce((sum, t) => sum + t.netAmount, 0);
      return {
        name: monthName,
        receita,
        despesa,
        saldo: receita - despesa,
      };
    });
  }
};

const generateExpenseDistribution = (transactions: Transaction[]) => {
  const categories: { [key: string]: number } = {};
  transactions
    .filter((t) => t.type === 'despesa')
    .forEach((t) => {
      if (!categories[t.category]) categories[t.category] = 0;
      categories[t.category] += t.netAmount;
    });

  return Object.keys(categories).map((category) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: categories[category],
  }));
};

const generateRevenueSources = (transactions: Transaction[]) => {
  const sources: { [key: string]: number } = {};
  transactions
    .filter((t) => t.type === 'receita')
    .forEach((t) => {
      if (!sources[t.category]) sources[t.category] = 0;
      sources[t.category] += t.netAmount;
    });

  return Object.keys(sources).map((source) => ({
    name: source.charAt(0).toUpperCase() + source.slice(1),
    value: sources[source],
  }));
};

const FinancialDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'month',
    // Inicializamos startDate e endDate usando currentYear e currentDate:
    startDate: `${currentYear}-${String(currentDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-01`,
    endDate: new Date(currentYear, currentDate.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0],
    category: 'all',
    transactionType: 'all',
    status: 'all',
    paymentMethod: 'all',
    responsible: 'all',
    searchQuery: '',
    selectedMonth: '',
    selectedQuarter: '',
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) Busca inicial de transações e mapeia para nosso formato
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        const res = await fetch(`/api/financeiro/transacoes`);
        const rawData = await res.json();

        const mapped: Transaction[] = rawData.map((item: any) => ({
          id: String(item.id),
          date: item.data_referencia,                    // campo no banco
          description: item.descricao,                    // campo no banco
          amount: parseFloat(item.valor),                 // valor bruto
          netAmount: parseFloat(item.valor_com_desconto), // após desconto
          discount: parseFloat(item.desconto_percentual || '0'),
          type: item.tipo as TransactionType,             // “receita” ou “despesa”
          category: item.categoria,                       // ex: “mensalidades”
          dueDate: item.data_vencimento,                  // data de vencimento
          paymentDate: item.data_pagamento || null,       // caso já pago
          paymentMethod: item.forma_pagamento || undefined,
          responsible: item.responsavel || undefined,
          status: item.status as TransactionStatus,       // ex: “aguardando” ou “pago”
          observation: item.observacao || undefined,
          receiptUrl: item.comprovante_url || undefined,
          personId: item.id_pessoa,                       // id do aluno
        }));

        setTransactions(mapped);
        setFilteredTransactions(mapped);
      } catch (err) {
        toast.error('Erro ao carregar transações');
        console.error(err);
      }
    };

    fetchTransacoes();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) Função genérica para reaplicar filtros via backend
  // ─────────────────────────────────────────────────────────────────────────────
  const applyFilters = async () => {
    try {
      const params = new URLSearchParams();
      params.append('inicio', filters.startDate);
      params.append('fim', filters.endDate);

      if (filters.category !== 'all') params.append('categoria', filters.category);
      if (filters.transactionType !== 'all')
        params.append('tipo', filters.transactionType);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.paymentMethod !== 'all')
        params.append('forma_pagamento', filters.paymentMethod);
      if (filters.responsible !== 'all') params.append('responsavel', filters.responsible);
      if (filters.searchQuery.trim()) params.append('q', filters.searchQuery.toLowerCase());

      const res = await fetch(
        `/api/financeiro/transacoes?${params.toString()}`
      );
      const rawData = await res.json();

      const mapped: Transaction[] = rawData.map((item: any) => ({
        id: String(item.id),
        date: item.data_referencia,
        description: item.descricao,
        amount: parseFloat(item.valor),
        netAmount: parseFloat(item.valor_com_desconto),
        discount: parseFloat(item.desconto_percentual || '0'),
        type: item.tipo as TransactionType,
        category: item.categoria,
        dueDate: item.data_vencimento,
        paymentDate: item.data_pagamento || null,
        paymentMethod: item.forma_pagamento || undefined,
        responsible: item.responsavel || undefined,
        status: item.status as TransactionStatus,
        observation: item.observacao || undefined,
        receiptUrl: item.comprovante_url || undefined,
        personId: item.id_pessoa,
      }));

      if (sortConfig) {
        mapped.sort((a: Transaction, b: Transaction) => {
          const aValue = a[sortConfig.key as keyof Transaction] as
            | number
            | string;
          const bValue = b[sortConfig.key as keyof Transaction] as
            | number
            | string;
          if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        });
      }

      setTransactions(mapped);
      setFilteredTransactions(mapped);
      // toast.success('Filtros aplicados com sucesso!');
    } catch (err) {
      toast.error('Erro ao aplicar filtros');
      console.error('Erro em applyFilters:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4) Quando o componente montar, chama applyFilters para trazer dados já filtrados 
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) Funções auxiliares: <getComparisonPeriod>, <handleSort> e <handleDateRangeChange>
  // ─────────────────────────────────────────────────────────────────────────────
  const getComparisonPeriod = (range: string, start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let prevStart = new Date(startDate);
    let prevEnd = new Date(endDate);

    switch (range) {
      case 'week':
        prevStart.setDate(prevStart.getDate() - 7);
        prevEnd.setDate(prevEnd.getDate() - 7);
        break;
      case 'month':
        prevStart.setMonth(prevStart.getMonth() - 1);
        prevEnd.setMonth(prevEnd.getMonth() - 1);
        break;
      case 'quarter':
        prevStart.setMonth(prevStart.getMonth() - 3);
        prevEnd.setMonth(prevEnd.getMonth() - 3);
        break;
      case 'year':
        prevStart.setFullYear(prevStart.getFullYear() - 1);
        prevEnd.setFullYear(prevEnd.getFullYear() - 1);
        break;
      default:
        return null;
    }

    return {
      previousStart: prevStart.toISOString().split('T')[0],
      previousEnd: prevEnd.toISOString().split('T')[0],
    };
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredTransactions].sort((a, b) => {
      const aValue = a[key as keyof Transaction] as number | string;
      const bValue = b[key as keyof Transaction] as number | string;
      if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setFilteredTransactions(sorted);
  };

  const handleDateRangeChange = (range: string) => {
    let startDate = filters.startDate;
    let endDate = filters.endDate;
    const today = new Date();

    switch (range) {
      case 'week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        startDate = startOfWeek.toISOString().split('T')[0];
        endDate = endOfWeek.toISOString().split('T')[0];
        break;
      }
      case 'month': {
        startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate = lastDay.toISOString().split('T')[0];
        break;
      }
      case 'quarter': {
        const quarterStart = new Date(today);
        const quarterNumber = Math.floor(today.getMonth() / 3);
        quarterStart.setMonth(quarterNumber * 3);
        quarterStart.setDate(1);
        const quarterEnd = new Date(today);
        quarterEnd.setMonth(quarterNumber * 3 + 3);
        quarterEnd.setDate(0);
        startDate = quarterStart.toISOString().split('T')[0];
        endDate = quarterEnd.toISOString().split('T')[0];
        break;
      }
      case 'year': {
        startDate = `${today.getFullYear()}-01-01`;
        endDate = `${today.getFullYear()}-12-31`;
        break;
      }
      case 'custom':
        break;
    }

    setFilters({
      ...filters,
      dateRange: range,
      selectedMonth: '',
      selectedQuarter: '',
      startDate,
      endDate,
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 6) Cálculo de métricas e dados de gráficos
  // ─────────────────────────────────────────────────────────────────────────────
  // const metrics = calculateMetrics(transactions, {
  const metrics = calculateMetrics(filteredTransactions, {
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  // const realMetrics = calculateRealMetrics(transactions, {
  const realMetrics = calculateRealMetrics(filteredTransactions, {
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  let revenueTrend: number | null = null;
  let expenseTrend: number | null = null;
  if (filters.dateRange !== 'custom' && filters.responsible === 'all') {
    const comparison = getComparisonPeriod(
      filters.dateRange,
      filters.startDate,
      filters.endDate
    );
    if (comparison) {
      const previousMetrics = calculateMetrics(transactions, {
        startDate: comparison.previousStart,
        endDate: comparison.previousEnd,
      });
      const safePercent = (current: number, previous: number) => {
        if (previous === 0) return null;
        return ((current - previous) / previous) * 100;
      };
      revenueTrend = safePercent(
        metrics.monthlyRevenue,
        previousMetrics.monthlyRevenue
      );
      expenseTrend = safePercent(
        metrics.monthlyExpenses,
        previousMetrics.monthlyExpenses
      );
    }
  }

  // const monthlyData = generateChartData(transactions, filters);
  const monthlyData = generateChartData(filteredTransactions, filters);
  const expenseDistribution = generateExpenseDistribution(transactions);
  const revenueSources = generateRevenueSources(transactions);

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FDBF6F',
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 7) Nova função: handleAtualizarLancamentos()
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAtualizarLancamentos = async () => {
    try {
      const res = await fetch(
        `/api/financeiro/atualizar-lancamentos`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Erro ao disparar atualização de lançamentos');

      // Se tudo der certo, mostramos toast e reaplicamos filtros (para puxar as novas transações)
      toast.success('Verificação de lançamentos concluída!');
      await applyFilters();
    } catch (err) {
      toast.error('Falha ao atualizar lançamentos.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
     <header className="bg-white shadow-sm py-4 px-6 border-gray-100 sticky top-18 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Gestão Financeira Escolar
            </h1>
            {/* <p className="text-sm text-gray-500">Escola Técnica Profissional</p> */}
          </div>

          <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`flex items-center justify-center gap-2 w-full max-w-[440px] px-4 py-1.5 text-sm border-gray-200 rounded-md mb-2 
                ${isFiltersOpen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <Search size={16} />
              <span className="hidden sm:inline">Filtrar</span>
            </button>

          {/* Bloco principal dos botões */}
          <div className="flex flex-col items-end"> 
            {/* Grupo de botões alinhados – mesma largura total nas duas linhas */}
            <div className="w-full max-w-[1500px] flex flex-col">
              {/* Linha 1: dois botões */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/gestor/financeiro/lancamento')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 text-sm bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Lançamentos e Relatório</span>
                </button>
                <button
                  onClick={handleAtualizarLancamentos}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 text-sm bg-indigo-800 text-white rounded-md hover:bg-green-700 transition"
                >
                  <ArrowUp size={16} />
                  <span className="hidden sm:inline">Atualizar Lançamentos</span>
                </button>
              </div>
              {/* Linha 2: dois botões */}
              <div className="flex gap-2 mt-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 text-sm bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition"
                  onClick={() => navigate('/gestor/financeiro/ficha-aluno')}
                >
                  <span>Ficha Financeira do Aluno</span>
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 text-sm bg-indigo-800 text-white rounded-md hover:bg-indigo-700 transition"
                  onClick={() => navigate('/gestor/financeiro/contratos')}
                >
                  <span>Modelos de Contratos e Documentos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      

      <main className="w-full px-2 sm:px-4 py-6">
        {/* Painel de Filtros */}
        {isFiltersOpen && (
          <div className="bg-white border-gray-200 rounded-lg p-4 mb-6 shadow-sm animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold mb-4">Filtros Financeiros</h2>

            <div className="space-y-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <div className="grid grid-cols-5 gap-1 mb-2">
                  <button
                    onClick={() => handleDateRangeChange('week')}
                    className={`py-2 px-2 text-center text-sm ${
                      filters.dateRange === 'week'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('month')}
                    className={`py-2 px-2 text-center text-sm ${
                      filters.dateRange === 'month'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    Mês
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('quarter')}
                    className={`py-2 px-2 text-center text-sm ${
                      filters.dateRange === 'quarter'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    Trimestre
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('year')}
                    className={`py-2 px-2 text-center text-sm ${
                      filters.dateRange === 'year'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    Ano
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('custom')}
                    className={`py-2 px-2 text-center text-sm ${
                      filters.dateRange === 'custom'
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    Personalizado
                  </button>
                </div>

                {filters.dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          setFilters({ ...filters, startDate: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          setFilters({ ...filters, endDate: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="all">Todas as categorias</option>
                    <option value="mensalidades">Mensalidades</option>
                    <option value="eventos">Eventos</option>
                    <option value="doações">Doações</option>
                    <option value="folha de pagamento">
                      Folha de Pagamento
                    </option>
                    <option value="manutenção">Manutenção</option>
                    <option value="material didático">Material Didático</option>
                    <option value="utilidades">Utilidades</option>
                  </select>
                </div>

                {/* Tipo de Lançamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Lançamento
                  </label>
                  <select
                    value={filters.transactionType}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        transactionType: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="all">Todos os status</option>
                    <option value="aguardando">Aguardando</option>
                    <option value="pago">Pago</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) =>
                    setFilters({ ...filters, paymentMethod: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="cartão">Cartão</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="transferência">Transferência</option>
                </select>
              </div>

              {/* Responsável */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável
                </label>
                <select
                  value={filters.responsible}
                  onChange={(e) =>
                    setFilters({ ...filters, responsible: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="Maria Oliveira">Maria Oliveira</option>
                  <option value="Carlos Santos">Carlos Santos</option>
                  <option value="Paulo Ferreira">Paulo Ferreira</option>
                </select>
              </div>

              {/* Busca por Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por descrição
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters({ ...filters, searchQuery: e.target.value })
                    }
                    placeholder="Digite para buscar..."
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              {/* Seleção de Mês (quando dateRange for “month” ou “year”) */}
              {['month', 'year'].includes(filters.dateRange) && (
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mt-2">
                  {[
                    '01',
                    '02',
                    '03',
                    '04',
                    '05',
                    '06',
                    '07',
                    '08',
                    '09',
                    '10',
                    '11',
                    '12',
                  ].map((month) => {
                    const label = new Date(0, parseInt(month) - 1).toLocaleString(
                      'pt-BR',
                      { month: 'short' }
                    );
                    return (
                      <button
                        key={month}
                        className={`py-2 px-2 text-center text-sm rounded ${
                          filters.selectedMonth === month
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                        onClick={() => {
                          const ano = new Date().getFullYear();
                          if (filters.selectedMonth === month) {
                            setFilters((prev) => ({
                              ...prev,
                              selectedMonth: '',
                              startDate: `${ano}-01-01`,
                              endDate: `${ano}-12-31`,
                            }));
                          } else {
                            const start = `${ano}-${month}-01`;
                            const lastDay = new Date(ano, parseInt(month), 0).getDate();
                            const end = `${ano}-${month}-${lastDay}`;
                            setFilters((prev) => ({
                              ...prev,
                              selectedMonth: month,
                              startDate: start,
                              endDate: end,
                            }));
                          }
                        }}
                      >
                        {label.charAt(0).toUpperCase() + label.slice(1)}
                      </button>
                    );
                  })}
                  <div className="col-span-full text-sm text-gray-600 mb-2">
                      Escolha o mês de referência:
                  </div>
                </div>
                
              )}

              {/* Seleção de Trimestre (quando dateRange for “quarter”) */}
              {filters.dateRange === 'quarter' && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { label: '1º Período', start: '01', end: '04' },
                    { label: '2º Período', start: '05', end: '08' },
                    { label: '3º Período', start: '09', end: '12' },
                  ].map(({ label, start, end }) => {
                    const isActive = filters.selectedQuarter === label;
                    const ano = new Date().getFullYear();
                    const startDate = `${ano}-${start}-01`;
                    const lastDay = new Date(ano, parseInt(end), 0).getDate();
                    const endDate = `${ano}-${end}-${lastDay}`;
                    return (
                      <button
                        key={label}
                        className={`py-2 px-2 text-center text-sm rounded ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                        onClick={() => {
                          if (isActive) {
                            setFilters((prev) => ({
                              ...prev,
                              selectedQuarter: '',
                              startDate: `${ano}-01-01`,
                              endDate: `${ano}-12-31`,
                            }));
                          } else {
                            setFilters((prev) => ({
                              ...prev,
                              selectedQuarter: label,
                              selectedMonth: '',
                              startDate,
                              endDate,
                            }));
                          }
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Botão “Aplicar Filtros” */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cards de KPI (Receita Mensal / Despesa Mensal / Resultado) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Receita Mensal */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Receita Mensal Prevista</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">
                  {formatCurrency(metrics.monthlyRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  {revenueTrend !== null ? (
                    <>
                      {revenueTrend > 0 ? (
                        <ArrowUp className="text-green-500 h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="text-red-500 h-4 w-4 mr-1" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {Math.abs(revenueTrend).toFixed(1)}%{' '}
                        {revenueTrend >= 0 ? 'aumento' : 'queda'}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              </div>
              <div className="p-2 rounded-full bg-blue-50">
                <ArrowUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Despesas Mensais */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Despesas Mensais Previstas</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {formatCurrency(metrics.monthlyExpenses)}
                </p>
              </div>
              <div className="p-2 rounded-full bg-red-50">
                <ArrowDown className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Resultado Previsto</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    metrics.result >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(metrics.result)}
                </p>
                <div className="flex items-center mt-1">
                  {metrics.result >= 0 ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Superávit
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Déficit
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`p-2 rounded-full ${
                  metrics.result >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <Banknote
                  className={`h-5 w-5 ${
                    metrics.result >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cards de KPI Real */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Receita Mensal Real */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Receita Mensal Real</p>
                <p className="text-2xl font-bold mt-1 text-blue-600">
                  {formatCurrency(realMetrics.realRevenue)}
                </p>
              </div>
              <div className="p-2 rounded-full bg-blue-50">
                <ArrowUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Despesas Mensais Reais */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Despesas Mensais Reais</p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {formatCurrency(realMetrics.realExpenses)}
                </p>
              </div>
              <div className="p-2 rounded-full bg-red-50">
                <ArrowDown className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>

          {/* Resultado Real */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Resultado Real</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    realMetrics.realResult >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(realMetrics.realResult)}
                </p>
              </div>
              <div
                className={`p-2 rounded-full ${
                  realMetrics.realResult >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <Banknote
                  className={`h-5 w-5 ${
                    realMetrics.realResult >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Observação explicativa */}
        <div className="mb-6 text-sm text-gray-600 italic">
          * Os valores “Reais” consideram apenas as transações com status <strong>pago</strong>.
        </div>

        {/* Gráficos de Barra e Linha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Receita vs Despesa (BarChart) */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <h3 className="text-lg font-semibold mb-4">Receitas vs Despesas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="#3b82f6" />
                <Bar dataKey="despesa" name="Despesa" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fluxo de Caixa (LineChart) */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <h3 className="text-lg font-semibold mb-4">Fluxo de Caixa</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PieCharts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Distribuição de Despesas */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <h3 className="text-lg font-semibold mb-4">Distribuição de Despesas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {expenseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Fontes de Receita */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-xs w-full mx-auto sm:max-w-full">
            <h3 className="text-lg font-semibold mb-4">Fontes de Receita</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueSources}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {revenueSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden max-w-xs w-full mx-auto sm:max-w-full">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Transações</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border border-gray-100">
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('date')}
                  >
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('netAmount')}
                  >
                    Valor Líquido
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('paymentMethod')}
                  >
                    Método
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {tx.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                        {tx.category}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                          tx.type === 'receita' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'receita' ? '+' : '-'}
                        {formatCurrency(tx.netAmount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span
                          className={`
                            px-2 py-0.5 text-xs font-medium rounded-full
                            ${tx.status === 'pago' ? 'bg-green-50 text-green-600' : ''}
                            ${tx.status === 'aguardando' ? 'bg-yellow-50 text-yellow-600' : ''}
                            ${tx.status === 'atrasado' ? 'bg-red-50 text-red-600' : ''}
                          `}
                        >
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {tx.paymentMethod || '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma transação encontrada com os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinancialDashboard;
