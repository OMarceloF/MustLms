import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { LineChart, Line } from 'recharts';


// Define types
interface Student {
  id: string;
  name: string;
  class: string;
  averageGrade?: number;
  attendancePercent?: number;
  completedTasks?: number;
  pendingTasks?: number;
  progress?: number;
  status: 'normal' | 'warning' | 'alert';
  [key: string]: any; // Para as médias dinâmicas por matéria
}

interface Materia {
  id: number;
  nome: string;
  coluna: string;
}

interface FilterValues {
  dateRange: string;
  selectedClass: string;
  selectedSubject: string;
  selectedUserType: string;
}

interface CalendarioEntry {
  periodo: number;
  tipo: string;
  data_inicial: string;
  data_final: string;
}

function getSubPeriodDates(
  subPeriod: string, 
  calendarioDados: CalendarioEntry[]
): { startDate?: string; endDate?: string } {
  if (!subPeriod || !calendarioDados.length) return {};

  let tipo: string | null = null;
  let valor: number | null = null;

  if (subPeriod.toLowerCase().includes('bimestre')) {
    tipo = 'bimestral';
    valor = getNumeroSubPeriodo(subPeriod);
  } else if (subPeriod.toLowerCase().includes('trimestre')) {
    tipo = 'trimestral';
    valor = getNumeroSubPeriodo(subPeriod);
  } else if (subPeriod.toLowerCase().includes('semestre')) {
    tipo = 'semestral';
    valor = getNumeroSubPeriodo(subPeriod);
  }
  if (!tipo || !valor) return {};

  console.log(calendarioDados)


  const periodo = calendarioDados.find(d =>
    d.tipo.toLowerCase() === tipo &&
    d.periodo === valor
  );
  if (!periodo) return {};
  return { startDate: periodo.data_inicial, endDate: periodo.data_final };
}

function getNumeroSubPeriodo(subPeriod: string) {
  // Pega só o número (ex: "1º Bimestre" -> 1)
  const match = subPeriod.match(/^(\d+)/);
  return match ? parseInt(match[1]) : null;
}

const Index = () => {
  // State for filters panel
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [dateRange, setDateRange] = useState('this-month');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [nomeEscola, setNomeEscola] = useState('Carregando...');
  const [studentData, setStudentData] = useState<Student[]>([]);
  const [mediaPresenca, setMediaPresenca] = useState<string>('—');
  const [graficoDesempenho, setGraficoDesempenho] = useState<any[]>([]);

  const [turmasOptions, setTurmasOptions] = useState<{ id: number; nome: string }[]>([]);
  const [materias, setMaterias] = useState<{ id: number; nome: string }[]>([]);
  const [materiasTabela, setMateriasTabela] = useState<Materia[]>([]);
  const [subPeriod, setSubPeriod] = useState<string>('');

  // State for filtered data and active tab
  const [activeTab, setActiveTab] = useState('performance');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  // dados da linha de presença por turma
  const [taxaPorTurmaData, setTaxaPorTurmaData] = useState<any[]>([]);
  const [turmaNames, setTurmaNames]           = useState<string[]>([]);

  const [calendarioTipos, setCalendarioTipos] = useState<string[]>([]);
  const [subPeriodOptions, setSubPeriodOptions] = useState<string[]>([]);
  const [calendarioDados, setCalendarioDados] = useState<CalendarioEntry[]>([]);

  // Toggle filters panel visibility
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const getPercentageColor = (percent: number) => {
    return percent < 60 ? 'text-red-600' : 'text-green-600';
  };

  // Apply filters by calling o back-end

  const handleApplyFilters = () => {
    let startDate, endDate;
    const year = new Date().getFullYear();

    if (dateRange === 'this-month' && subPeriod) {
      // Mês selecionado
      const month = String(['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].indexOf(subPeriod) + 1).padStart(2, '0');
      startDate = `${year}-${month}-01`;
      endDate = `${year}-${month}-31`;
    }
    // Atenção aqui!
    else if (dateRange === 'bimestral' && subPeriod) {
      // Busca datas do bimestre selecionado
      const { startDate: s, endDate: e } = getSubPeriodDates(subPeriod, calendarioDados);
      startDate = s;
      endDate = e;
    }
    // Idem para trimestral/semestral se usar
    else if (dateRange === 'trimestral' && subPeriod) {
      const { startDate: s, endDate: e } = getSubPeriodDates(subPeriod, calendarioDados);
      startDate = s;
      endDate = e;
    }
    else if (dateRange === 'semestral' && subPeriod) {
      const { startDate: s, endDate: e } = getSubPeriodDates(subPeriod, calendarioDados);
      startDate = s;
      endDate = e;
    }
    else if (dateRange === 'year') {
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    }

    console.log({ subPeriod })

    console.log({ startDate, endDate })

    console.log('Enviando para backend:', { dateRange, startDate, endDate, selectedClass, selectedSubject });
    

    axios
      .get(`/api/alunos/relatorio`, {
        params: {
          dateRange,
          selectedClass,
          selectedSubject,
          startDate, // Envia para backend!
          endDate,
        },
      })
      .then((res) => {
        // Ordena alfabeticamente pelo nome antes de setar
        const sorted = res.data.alunos.sort((a: Student, b: Student) =>
          a.name.localeCompare(b.name)
        );
        setFilteredStudents(sorted);
        
        // Atualizar lista de matérias da tabela
        if (res.data.materias) {
          setMateriasTabela(res.data.materias);
        }
      })
      .catch((err) => {
        console.error('Erro ao aplicar filtros:', err);
        toast.error('Erro ao aplicar filtros');
    });

    // -- busca taxa de presença por turma --

    let presenceMonth: string | undefined;
    if (dateRange === 'this-month' && subPeriod) {
      // subPeriod é 'Jan','Fev',… então:
      const monthNum = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
        .indexOf(subPeriod) + 1;
      presenceMonth = `${year}-${String(monthNum).padStart(2,'0')}`;
    }

    axios
      .get(`/api/presencas/taxa-por-turma`, {
        params: { month: presenceMonth }
      })
      .then(res => {
        setTaxaPorTurmaData(res.data.data);
        setTurmaNames(res.data.turmas);
      })
      .catch(err => {
        console.error('Erro ao buscar taxa por turma', err);
        toast.error('Não foi possível carregar taxa por turma');
    });
  };

  // Disciplinas a exibir: todas ou apenas a selecionada
  const displayedMaterias = useMemo(() => {
    if (selectedSubject === 'all') {
      return materiasTabela;
    }
    return materiasTabela.filter(
      m => m.id.toString() === selectedSubject
    );
  }, [selectedSubject, materiasTabela]);

  // Chart data - Dados dinâmicos baseados nos filtros aplicados
  const academicPerformanceData = useMemo(() => {
    if (displayedMaterias.length === 0 || filteredStudents.length === 0) {
      return [];
    }

    // Calcula a média de cada disciplina
    const disciplinasData: { [key: string]: number } = {};
    
    displayedMaterias.forEach(materia => {
      const notasValidas = filteredStudents
        .map(student => student[materia.coluna])
        .filter(nota => nota != null && !isNaN(nota));
      
      if (notasValidas.length > 0) {
        const media = notasValidas.reduce((acc, nota) => acc + nota, 0) / notasValidas.length;
        disciplinasData[materia.nome] = Number((media * 10).toFixed(1)); // Converte para escala 0-10
      }
    });

    // Retorna um array com um único objeto contendo todas as disciplinas
    return [{
      name: 'Média por Disciplina',
      ...disciplinasData
    }];
  }, [filteredStudents, materiasTabela]);

  // Helper functions for table display
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'alert':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  useEffect(() => {
    axios
      .get(`/api/alunos/estatisticas`)
      .then((res) => {
        setStudentData(res.data.alunos);
        setMediaPresenca(res.data.mediaPresenca + '%');
      })
      .catch((err) => {
        console.error('Erro ao carregar estatísticas dos alunos:', err);
        toast.error('Erro ao carregar estatísticas dos alunos');
      });
    // e já traz a lista completa de alunos com o filtro padrão
    handleApplyFilters();
  }, []);

  useEffect(() => {
    axios
      .get(`/api/escola/nome`)
      .then((res) => setNomeEscola(res.data.nome))
      .catch(() => setNomeEscola('Nome não encontrado'));
  }, []);

  useEffect(() => {
    axios
      .get(`/api/listarMateriasPage`)
      .then((res) => setMaterias(res.data))
      .catch((err) => {
        console.error('Erro ao buscar matérias:', err);
        toast.error('Erro ao carregar lista de matérias');
      });
  }, []);

  // carrega lista de turmas
   useEffect(() => {
     axios
       .get(`/api/turmas`)
       .then(res => {
        setTurmasOptions(res.data);
       })
       .catch(err => {
         console.error('Erro ao carregar turmas:', err);
         toast.error('Erro ao carregar lista de turmas');
       });
   }, []);
 
  // carrega lista de matérias (já existia)
  useEffect(() => {
    axios
      .get(`/api/listarMateriasPage`)
      .then((res) => {
      setMaterias(res.data);
      })
      .catch((err) => {
        console.error('Erro ao buscar matérias:', err);
        toast.error('Erro ao carregar lista de matérias');
      });
  }, []);

  // Cores para as disciplinas (paleta de cores variadas)
  const disciplinaColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EF4444', '#06B6D4', '#84CC16', '#F97316',
    '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  // Gera as barras dinamicamente baseadas nas disciplinas da tabela
  const renderDisciplinaBars = () => {
    return displayedMaterias.map((materia, index) => (
      <Bar 
        key={materia.id} 
        dataKey={materia.nome} 
        fill={disciplinaColors[index % disciplinaColors.length]} 
      />
    ));
  };

  const mediaGeralPercent = useMemo(() => {
    let soma = 0;
    let qtd = 0;
    filteredStudents.forEach(student => {
      materiasTabela.forEach(mat => {
        const val = student[mat.coluna];
        if (val != null) {
          soma += val * 100;
          qtd++;
        }
      });
    });
    return qtd > 0 ? `${(soma / qtd).toFixed(0)}%` : '—';
  }, [filteredStudents, materiasTabela]);

  const mediaPresencaPercent = useMemo(() => {
    // Verificar se há dados
    if (!filteredStudents || filteredStudents.length === 0) {
      return '—';
    }
    
    // Extrair e validar dados de presença
    const presencasValidas = filteredStudents
      .map(student => {
        const attendance = student.attendancePercent;
        // Converter para número se for string
        const numericAttendance = typeof attendance === 'string' ? parseFloat(attendance) : attendance;
        return numericAttendance;
      })
      .filter((presenca): presenca is number => {
        // Validação rigorosa + excluir 0%
        return presenca != null && 
              !isNaN(presenca) && 
              isFinite(presenca) && 
              presenca > 0 &&        // MUDANÇA: > 0 ao invés de >= 0
              presenca <= 100;
      });
    
    // Verificar se há dados válidos após filtro
    if (presencasValidas.length === 0) {
      return '—';
    }
    
    // Calcular média
    const somaPresencas = presencasValidas.reduce((acc, presenca) => acc + presenca, 0);
    const mediaPresenca = somaPresencas / presencasValidas.length;
    
    // Verificar se o resultado é válido
    if (isNaN(mediaPresenca) || !isFinite(mediaPresenca)) {
      return '—';
    }
    
    return `${Math.round(mediaPresenca)}%`;
  }, [filteredStudents]);

  const handleExportReport = async () => {
    try {
      toast.info('Gerando relatório PDF...');
      
      // const response = await axios.get(`/api/relatorio/exportar-pdf`, {
      //   params: {
      //     dateRange,
      //     selectedClass,
      //     selectedSubject,
      //     subPeriod,
      //   },
      //   responseType: 'blob', // Importante para receber o arquivo
      // });

      let startDate, endDate;
      const year = new Date().getFullYear();

      if (dateRange === 'this-month' && subPeriod) {
        const month = String(['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].indexOf(subPeriod) + 1).padStart(2, '0');
        startDate = `${year}-${month}-01`;
        endDate = `${year}-${month}-31`;
      } else if (['bimestral','trimestral','semestral'].includes(dateRange) && subPeriod) {
        const result = getSubPeriodDates(subPeriod, calendarioDados);
        startDate = result.startDate;
        endDate = result.endDate;
      } else if (dateRange === 'year') {
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
      }

      const response = await axios.get(`/api/relatorio/exportar-pdf`, {
        params: {
          dateRange,
          selectedClass,
          selectedSubject,
          subPeriod,
          startDate,
          endDate,
        },
        responseType: 'blob',
      });

      // Criar um blob URL para o PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório. Tente novamente.');
    }
  };

  // UseEffect para buscar os tipos de calendário
  useEffect(() => {
    axios
      .get(`/api/calendario/gestor`)
      .then((res) => {
        setCalendarioTipos(res.data.tipos);
        setCalendarioDados(res.data.dados);
        // Defina as opções de sub-período com base nos tipos de calendário
        if (res.data.tipos.includes('bimestral')) {
          setSubPeriodOptions(['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre']);
        }
        if (res.data.tipos.includes('trimestral')) {
          setSubPeriodOptions(['1º Trimestre', '2º Trimestre', '3º Trimestre']);
        }
        if (res.data.tipos.includes('semestral')) {
          setSubPeriodOptions(['1º Semestre', '2º Semestre']);
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar tipos de calendário:', err);
        toast.error('Erro ao carregar tipos de calendário');
      });
  }, []);

  // Renderizar as opções de sub-período
  const renderSubPeriodOptions = () => {
    if (dateRange === 'bimester') {
      return subPeriodOptions.map(b => (
        <button
          key={b}
          onClick={() => setSubPeriod(b)}
          className={`py-1 px-2 text-sm rounded ${
            subPeriod === b
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          {b}
        </button>
      ));
    } else if (dateRange === 'trimestre') {
      return subPeriodOptions.map(t => (
        <button
          key={t}
          onClick={() => setSubPeriod(t)}
          className={`py-1 px-2 text-sm rounded ${
            subPeriod === t
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          {t}
        </button>
      ));
    } else if (dateRange === 'semestral') {
      return subPeriodOptions.map(s => (
        <button
          key={s}
          onClick={() => setSubPeriod(s)}
          className={`py-1 px-2 text-sm rounded ${
            subPeriod === s
              ? 'bg-indigo-100 text-indigo-700 font-medium'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          {s}
        </button>
      ));
    }
    return null;
  };

  

  return (
    <div className="min-h-screen w-full min-w-0">
      {/* Header */}
      <div className="bg-white shadow-sm py-4 px-2 sm:px-4 border border-gray-100 sticky top-16 z-10 w-full min-w-0 overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full min-w-0">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-800 truncate">
              Relatórios e Estatísticas
            </h1>
            <p className="text-sm text-gray-500 truncate">{nomeEscola}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleFilters}
              className={`flex items-center gap-2 px-3 py-2 border border-gray-100 rounded-md ${
                isFiltersOpen
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filtrar</span>
            </button>

            <button onClick={handleExportReport} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              <Download size={16} />
              <span className="hidden sm:inline">Exportar Relatório</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 px-2 sm:px-4 py-4">
        {/* Filters Panel */}
        {isFiltersOpen && (
          <section className="mb-6 bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Filtros de Relatório</h2>

            {/* Período */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {['this-month', ...calendarioTipos].map((tipo) => {
                const labels: { [key: string]: string } = {
                  'this-month': 'Mês',
                  'bimestral': 'Bimestre',
                  'trimestral': 'Trimestre',
                  'semestral': 'Semestre',
                  'year': 'Ano'
                };

                // Verifica se a opção é um tipo de calendário
                const isCalendarioTipo = ['bimestral', 'trimestral', 'semestral'].includes(tipo);

                return (
                  <React.Fragment key={tipo}>
                    <button
                      onClick={() => { setDateRange(tipo); setSubPeriod(''); }}
                      className={`py-2 px-4 text-sm rounded ${
                        dateRange === tipo
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {labels[tipo] || tipo}
                    </button>

                    {/* Adiciona a opção "Ano" ao lado do tipo de calendário correspondente */}
                    {isCalendarioTipo && (
                      <button
                        onClick={() => { setDateRange('year'); setSubPeriod(''); }}
                        className={`py-2 px-4 text-sm rounded ${
                          dateRange === 'year'
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {labels['year']}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Adiciona a opção "Ano" se houver um tipo de calendário selecionado
              {calendarioTipos.length > 0 && (
                <button
                  onClick={() => { setDateRange('year'); setSubPeriod(''); }}
                  className={`py-2 px-4 text-sm rounded ${
                    dateRange === 'year'
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  Ano
                </button>
              )} */}
            </div>

            {/* Turma e Disciplina */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="all">Todas as turmas</option>
                  {turmasOptions.map(t => (
                    <option key={t.id} value={t.nome}>{t.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="all">Todas as disciplinas</option>
                  {materiasTabela.map(m => (
                    <option key={m.id} value={m.id.toString()}>{m.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sub-período */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {dateRange === 'this-month' && ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map(m => (
                <button
                  key={m}
                  onClick={() => setSubPeriod(m)}
                  className={`py-1 px-2 text-sm rounded ${
                    subPeriod === m
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {m}
                </button>
              ))}
              {dateRange === 'bimestral' && ['1º Bimestre','2º Bimestre','3º Bimestre','4º Bimestre'].map(b => (
                <button
                  key={b}
                  onClick={() => setSubPeriod(b)}
                  className={`py-1 px-2 text-sm rounded ${
                    subPeriod === b
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {b}
                </button>
              ))}
              {dateRange === 'trimestral' && ['1º Trimestre','2º Trimestre','3º Trimestre'].map(t => (
                <button
                  key={t}
                  onClick={() => setSubPeriod(t)}
                  className={`py-1 px-2 text-sm rounded ${
                    subPeriod === t
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
              {dateRange === 'semestral' && ['1º Semestre','2º Semestre'].map(s => (
                <button
                  key={s}
                  onClick={() => setSubPeriod(s)}
                  className={`py-1 px-2 text-sm rounded ${
                    subPeriod === s
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Aplicar */}
            <div className="flex justify-end">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full sm:w-auto"
              >
                Aplicar Filtros
              </button>
            </div>
          </section>

        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {/* KPI Card: Average Grade */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Média Geral</p>
                {/* <p className="text-2xl font-bold mt-1">{mediaGeral}</p> */}
                <p className="text-2xl font-bold mt-1">{mediaGeralPercent}</p>
              </div>
            </div>
          </div>

          {/* KPI Card: Attendance Rate */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">Taxa de Presença</p>
                <p className="text-2xl font-bold mt-1">{mediaPresencaPercent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-chart Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Academic Performance Chart */}
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm">
            <div className="px-4 py-3 border border-gray-100">
              <h3 className="font-medium text-gray-800">
                Desempenho Acadêmico
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Média de notas por disciplina
              </p>
            </div>
            <div className="p-2 sm:p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={academicPerformanceData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    formatter={(value, name) => [`${value}`, name]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  {renderDisciplinaBars()}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Taxa de Presença por Turma */}
        {dateRange === 'this-month' && (
          <div className="bg-white border border-gray-100 rounded-lg shadow-sm mb-8">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">Taxa de Presença Diária por Turma</h3>
              <p className="text-xs text-gray-500 mt-1">
                Percentual de presenças diárias para cada turma - Aparece apenas selecionando o mês desejado
              </p>
            </div>
            <div className="p-2 sm:p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={taxaPorTurmaData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {turmaNames.map((nome, idx) => (
                    <Line
                      key={nome}
                      type="monotone"
                      dataKey={nome}
                      stroke={disciplinaColors[idx % disciplinaColors.length]}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Student Table */}
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-x-auto mb-6">
          <div className="px-4 py-3 border border-gray-100">
            <h3 className="font-medium text-gray-800">
              Desempenho Detalhado dos Alunos (as Médias exibidas representam a porcentagem da nota pelo valor total)
            </h3>
          </div>

          <div className="min-w-[600px]">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border border-gray-100">
                <tr className="border border-gray-100 transition-colors hover:bg-gray-50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 w-[250px]">
                    Nome do Aluno
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">
                    Turma
                  </th>
                  {displayedMaterias.map((materia) => (
                    <th key={materia.id} className="p-4 text-right font-medium text-gray-500">
                      {materia.nome}
                    </th>
                  ))}
                  <th className="h-12 px-4 text-right align-middle font-medium text-gray-500">
                    Presença %
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border border-gray-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <td className="p-4 align-middle font-medium">
                      {student.name}
                    </td>
                    <td className="p-4 align-middle">{student.class}</td>
                    {displayedMaterias.map(materia => {
                      const media = student[materia.coluna];
                      const mediaPercent = media != null ? media * 100 : null;
                      return (
                        <td
                          key={materia.id}
                          className={`p-4 align-middle text-right font-medium ${
                            // media ? getGradeColor(Number(media)) : 'text-gray-400'
                            mediaPercent != null
                              ? getPercentageColor(mediaPercent)
                              : 'text-gray-400'
                          }`}
                        >
                          {/* {media ? Number(media).toFixed(1) : '—'} */}
                          {mediaPercent != null ? `${mediaPercent.toFixed(0)}%` : '—'}
                        </td>
                      );
                    })}

                    <td className="p-4 align-middle text-right">
                      {student.attendancePercent != null
                        ? `${student.attendancePercent}%`
                        : '—'}
                    </td>

                    <td className="p-4 align-middle">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          student.status
                        )}`}
                      >
                        {student.status === 'alert' && (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {student.status === 'alert'
                          ? 'Atenção'
                          : student.status === 'warning'
                          ? 'Observação'
                          : 'Regular'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;