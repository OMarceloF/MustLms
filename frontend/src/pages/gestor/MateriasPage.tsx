import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Book, ArrowLeft, User, CalendarDays } from 'lucide-react';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';

import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';

interface Professor {
  id: number;
  nome: string;
  email: string;
  foto: string;
  registro: string;
}

interface Material {
  id: number;
  nome: string;
  autor: string;
  capa_url: string;
  conteudo_url: string;
}

interface Materia {
  nome: string;
  breve_descricao: string;
  aulas_semanais: number;
  qtd_turmas_vinculadas: number;
  sobre_a_materia: string;
  professores?: Professor[];
  materiais?: Material[];
}

interface Presenca {
  turma_id: number;
  aluno_id: number;
  materia_id: number;
  data: string;
  descricao: string;
  presenca: 0 | 1;
}

interface Nota {
  tipo: string; // Trabalho, Prova, Atividade...
  valor: number; // peso máximo da avaliação
  nota_inicial: number; // nota original tirada na avaliação
  nota_rec: number; // nota de recuperação (0 se não houve)
  nota_final: number; // maior entre nota_inicial e nota_rec
  recuperacao: 'Sim' | 'Não';
  turma_id: number;
  aluno_id: number;
  materia_id: number;
  data: string; // data em ISO
}

interface Aluno {
  id: number;
  nome: string;
}

type DistribuicaoTipo = {
  tipo: string;
  valor: number;
  data: { name: string; value: number }[];
};

interface Turma {
  id: number;
  nome: string;
  qtd_alunos: number;
}

interface ProfessorResponsavel {
  id: number;
  nome: string;
  email: string;
  foto: string;
  registro: string;
}

function getSafeImagePath(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? path : null;
}

const MateriasPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const backendUrl = ``;

  const [materia, setMateria] = useState<Materia | null>(null);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<number | null>(null);

  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [frequenciaMedia, setFrequenciaMedia] = useState<number>(0);
  const [notaMediaTurma, setNotaMediaTurma] = useState<number>(0);

  const [alunosDaTurma, setAlunosDaTurma] = useState<Aluno[]>([]);
  const [alunosRiscoLista, setAlunosRiscoLista] = useState<Aluno[]>([]);

  const [distribuicaoPorTipo, setDistribuicaoPorTipo] = useState<
    DistribuicaoTipo[]
  >([]);

  const [professorResponsavel, setProfessorResponsavel] =
    useState<ProfessorResponsavel | null>(null);

  const [loading, setLoading] = useState(true);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'materials' | 'performance' | 'risk'
  >('overview');

  const selectedTurma = turmas.find((t) => t.id === selectedTurmaId);

  const api = (p: string) => (p.startsWith('/') ? p : '/' + p);

  // ─── Busca “Professor Responsável” sempre que muda a turma selecionada filtrando por matéria + turma ─────────────
  useEffect(() => {
    if (selectedTurmaId === null || !id) {
      setProfessorResponsavel(null);
      return;
    }

    axios
      .get<{ professor: ProfessorResponsavel | null }>(
        api(`professores_turmas/${id}/${selectedTurmaId}/professor`)
      )
      .then((resp) => {
        setProfessorResponsavel(resp.data.professor); // agora é objeto ou null
      })
      .catch((err) => {
        console.error('Erro ao buscar professor responsável:', err);
        setProfessorResponsavel(null);
      });
  }, [selectedTurmaId, id]);

  // ─── Calcula distribuição por tipo em pontos (0–39%, 40–59%, 60–79%, 80–100%) ───────
  useEffect(() => {
    if (notas.length === 0) {
      setDistribuicaoPorTipo([]);
      return;
    }

    const tiposUnicos = Array.from(new Set(notas.map((n) => n.tipo)));

    const distribPorTipo: DistribuicaoTipo[] = tiposUnicos.map((tipo) => {
      const notasDoTipo = notas.filter((n) => n.tipo === tipo);
      const totalRegistros = notasDoTipo.length;
      const valorMax = notasDoTipo[0]?.valor ?? 0;

      let countInsuf = 0;
      let countReg = 0;
      let countBom = 0;
      let countExc = 0;

      notasDoTipo.forEach((n) => {
        const percentual = (n.nota_final / n.valor) * 100;
        if (percentual < 40) countInsuf++;
        else if (percentual < 60) countReg++;
        else if (percentual < 80) countBom++;
        else countExc++;
      });

      const percInsuf = (countInsuf / totalRegistros) * 100;
      const percReg = (countReg / totalRegistros) * 100;
      const percBom = (countBom / totalRegistros) * 100;
      const percExc = (countExc / totalRegistros) * 100;

      const pontoInsufMax = parseFloat((valorMax * 0.39).toFixed(2));
      const pontoRegMin = parseFloat((valorMax * 0.4).toFixed(2));
      const pontoRegMax = parseFloat((valorMax * 0.59).toFixed(2));
      const pontoBomMin = parseFloat((valorMax * 0.6).toFixed(2));
      const pontoBomMax = parseFloat((valorMax * 0.79).toFixed(2));
      const pontoExcMin = parseFloat((valorMax * 0.8).toFixed(2));
      const pontoMaxTotal = parseFloat(valorMax.toFixed(2));

      // Mantém todas as classes para legenda, sem filtrar valor zero
      const distribuicaoCompleta = [
        {
          name: `Insuficiente (0 – ${pontoInsufMax})`,
          value: parseFloat(percInsuf.toFixed(1)),
        },
        {
          name: `Regular (${pontoRegMin} – ${pontoRegMax})`,
          value: parseFloat(percReg.toFixed(1)),
        },
        {
          name: `Bom (${pontoBomMin} – ${pontoBomMax})`,
          value: parseFloat(percBom.toFixed(1)),
        },
        {
          name: `Excelente (${pontoExcMin} – ${pontoMaxTotal})`,
          value: parseFloat(percExc.toFixed(1)),
        },
      ];

      return {
        tipo,
        valor: valorMax,
        data: distribuicaoCompleta,
      };
    });

    setDistribuicaoPorTipo(distribPorTipo);
  }, [notas]);

  // ─── Calcula lista de alunos em risco (< 60% da média ponderada) ─────────────────────
  useEffect(() => {
    if (notas.length === 0 || alunosDaTurma.length === 0) {
      setAlunosRiscoLista([]);
      return;
    }

    const notasPorAluno: Record<
      number,
      { somaNota: number; somaValor: number }
    > = {};

    notas.forEach((n) => {
      const alunoId = Number(n.aluno_id);

      if (!Number.isInteger(alunoId) || alunoId < 0) return;

      if (!notasPorAluno[alunoId]) {
        notasPorAluno[alunoId] = { somaNota: 0, somaValor: 0 };
      }

      notasPorAluno[alunoId].somaNota += Number(n.nota_final);
      notasPorAluno[alunoId].somaValor += Number(n.valor);
    });

    const emRiscoIds = Object.entries(notasPorAluno)
      .filter(([_, { somaNota, somaValor }]) => {
        const percentual = (somaNota / somaValor) * 100;
        return percentual < 60;
      })
      .map(([alunoId]) => parseInt(alunoId, 10));

    const emRiscoAlunos = alunosDaTurma.filter((aluno) =>
      emRiscoIds.includes(aluno.id)
    );

    setAlunosRiscoLista(emRiscoAlunos);
  }, [notas, alunosDaTurma]);

  // ─── Busca lista de alunos da turma ─────────────────────────────────────────────────
  useEffect(() => {
    if (selectedTurmaId === null) {
      setAlunosDaTurma([]);
      return;
    }
    const fetchAlunosTurma = async () => {
      try {
        const resp = await axios.get<Aluno[]>(
          api(`turmas/${selectedTurmaId}/alunos`)
        );
        setAlunosDaTurma(resp.data);
      } catch (err) {
        console.error('Erro ao buscar alunos da turma:', err);
        setAlunosDaTurma([]);
      }
    };
    fetchAlunosTurma();
  }, [selectedTurmaId]);

  // ─── Busca dados iniciais: matéria, professores, materiais e turmas ────────────────
  useEffect(() => {
    if (!id) return;

    const fetchDados = async () => {
      try {
        // 1.1) Dados básicos da matéria
        const respMat = await axios.get<Materia>(
          api(`materiasPage/${id}`)
        );
        setMateria(respMat.data);

        // 1.2) Professores e materiais (via /api/materias/:id/detalhes)
        const respDetalhes = await axios.get<{
          professores: Professor[];
          materiais: Material[];
        }>(api(`materias/${id}/detalhes`));
        setProfessores(respDetalhes.data.professores || []);
        setMateriais(respDetalhes.data.materiais || []);

        // 1.3) Buscar turmas vinculadas
        const respTurmas = await axios.get<Turma[]>(
          api(`materiasPage/${id}/turmas`)
        );
        setTurmas(respTurmas.data);
        if (respTurmas.data.length > 0) {
          setSelectedTurmaId(respTurmas.data[0].id);
        }
      } catch (error) {
        console.error('Erro ao buscar dados iniciais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [id]);

  // ─── Busca presenças ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || selectedTurmaId === null) return;

    const fetchPresencas = async () => {
      try {
        const respP = await axios.get<Presenca[]>(
          api(`presencas/${id}/${selectedTurmaId}`)
        );
        setPresencas(respP.data);
      } catch (err) {
        console.error('Erro ao buscar presenças:', err);
        setPresencas([]);
      }
    };

    fetchPresencas();
  }, [id, selectedTurmaId]);

  // ─── Busca notas ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || selectedTurmaId === null) return;

    const fetchNotas = async () => {
      try {
        const respN = await axios.get<Nota[]>(
          api(`notas/${id}/${selectedTurmaId}`)
        );
        setNotas(respN.data);
      } catch (err) {
        console.error('Erro ao buscar notas:', err);
        setNotas([]);
      }
    };

    fetchNotas();
  }, [id, selectedTurmaId]);

  // ─── Calcula frequência média ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (presencas.length === 0) {
      setFrequenciaMedia(0);
      return;
    }
    const turmaSelecionada = turmas.find((t) => t.id === selectedTurmaId);
    const totalAlunos = turmaSelecionada?.qtd_alunos ?? 0;
    if (totalAlunos === 0) {
      setFrequenciaMedia(0);
      return;
    }

    const presencasPorData: Record<string, Presenca[]> = {};
    presencas.forEach((p) => {
      const dataSomente = p.data.split('T')[0];
      if (!presencasPorData[dataSomente]) presencasPorData[dataSomente] = [];
      presencasPorData[dataSomente].push(p);
    });

    const porcentagensPorData: number[] = [];
    Object.keys(presencasPorData).forEach((dataKey) => {
      const lista = presencasPorData[dataKey];
      const qtdPresentes = lista.filter((x) => x.presenca === 1).length;
      const perc = (qtdPresentes / totalAlunos) * 100;
      porcentagensPorData.push(perc);
    });

    const soma = porcentagensPorData.reduce((acc, val) => acc + val, 0);
    const media = soma / porcentagensPorData.length;
    setFrequenciaMedia(Math.round(media));
  }, [presencas, turmas, selectedTurmaId]);

  // ─── Calcula nota média ponderada (0–10) ─────────────────────────────────────────────
  useEffect(() => {
    if (notas.length === 0) {
      setNotaMediaTurma(0);
      return;
    }

    const totalNotasObtidas = notas.reduce((acc, r) => acc + r.nota_final, 0);
    const totalValoresMaximos = notas.reduce((acc, r) => acc + r.valor, 0);

    if (totalValoresMaximos === 0) {
      setNotaMediaTurma(0);
      return;
    }

    const mediaPonderada = (totalNotasObtidas / totalValoresMaximos) * 10;
    const mediaArredondada = Math.round(mediaPonderada * 100) / 100;
    setNotaMediaTurma(mediaArredondada);
  }, [notas]);

  if (loading) {
    return <div className="p-10 text-center">Carregando matéria...</div>;
  }
  if (!materia) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Matéria não encontrada
        </h2>
        <p className="text-gray-600 mb-6">
          A matéria solicitada não existe ou foi removida.
        </p>
        <Link
          to="/gestor"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o painel
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <SidebarGestor
        isMenuOpen={sidebarAberta}
        setActivePage={(page: string) =>
          navigate('/gestor', { state: { activePage: page } })
        }
        handleMouseEnter={() => setSidebarAberta(true)}
        handleMouseLeave={() => setSidebarAberta(false)}
      />

      <div
        className={`
         flex-1 flex flex-col pt-20
         px-4 sm:px-6           /* mobile=4, desktop mantém 6 */
         ml-0 sm:ml-10          /* remove margem esquerda no mobile */
         pl-4 sm:pl-10          /* padding-left 4 no mobile, 10 no desktop */
         min-w-0 transition-all duration-300
      `}
      >
        <TopbarGestorAuto
          isMenuOpen={sidebarAberta}
          setIsMenuOpen={setSidebarAberta}
        />

        {/* ─── Cabeçalho da Matéria ──────────────────────────────────────────────── */}
        <div className="bg-indigo-900 p-4 sm:p-6 text-white rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-2">
            <Book className="h-10 w-10 sm:h-12 sm:w-12 mr-0 sm:mr-4" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{materia.nome}</h1>
              <p>{materia.breve_descricao}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Seleção de Turma */}
            <div className="bg-[rgba(0,0,0,0.15)] bg-opacity-20 rounded-lg p-3 flex items-center">
              <User className="h-6 w-6 mr-3" />
              <div>
                <p className="text-sm opacity-80">Turma Disponível</p>
                <select
                  id="turma-select"
                  value={selectedTurmaId || ''}
                  onChange={(e) => setSelectedTurmaId(parseInt(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-white"
                >
                  {turmas.map((turma) => (
                    <option
                      key={turma.id}
                      value={turma.id}
                      className="text-black"
                    >
                      {turma.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Aulas por Semana */}
            <div className="bg-[rgba(0,0,0,0.15)] bg-opacity-20 rounded-lg p-3 flex items-center">
              <CalendarDays className="h-6 w-6 mr-3" />
              <div>
                <p className="text-sm opacity-80">Aulas por Semana</p>
                <p className="font-medium">{materia.aulas_semanais} aulas</p>
              </div>
            </div>
            {/* Total de Alunos */}
            <div className="bg-[rgba(0,0,0,0.15)] bg-opacity-20 rounded-lg p-3 flex items-center">
              <User className="h-6 w-6 mr-3" />
              <div>
                <p className="text-sm opacity-80">Total de Alunos</p>
                <p className="font-medium">
                  {selectedTurma?.qtd_alunos || 0} alunos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Métricas da Turma ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">
              Alunos com risco de reprovação (abaixo da Média - 60%)
            </h3>
            <div className="flex items-end mt-2">
              <span className="text-2xl font-bold text-black">
                {alunosRiscoLista.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">
              Frequência Média por Aula
            </h3>
            <div className="flex items-end mt-2">
              <span className="text-2xl font-bold text-black">
                {frequenciaMedia}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">
              Nota Média da Turma
            </h3>
            <div className="flex itens-end mt-2">
              <span className="text-2xl font-bold text-black">
                {notaMediaTurma.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Abas ─────────────────────────────────────────────────────────────── */}
        <div className="border-b border-gray-200 bg-[rgba(0,0,0,0.01)] mt-4">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'overview'
                ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'materials'
                ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Materiais
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'performance'
                ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Indicadores de Desempenho
            </button>
            <button
              onClick={() => setActiveTab('risk')}
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'risk'
                ? 'bg-white text-indigo-900 border-b-2 border-indigo-900'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Alunos em Risco
            </button>
          </div>
        </div>

        {/* ─── Conteúdo de cada Aba ────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="bg-[rgba(0,0,0,0.01)] p-2 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Sobre a Matéria */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Sobre a Matéria
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p>{materia.sobre_a_materia}</p>
                </div>
              </div>

              {/* Professor Responsável */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Professor Responsável – {selectedTurma?.nome || ''}
                  </h3>
                </div>
                <div className="p-4">
                  {professorResponsavel ? (
                    <div className="flex items-center space-x-4">
                      {(() => {
                        const fotoSegura = getSafeImagePath(
                          professorResponsavel.foto || ''
                        );

                        return fotoSegura ? (
                          <img
                            src={`${backendUrl}${fotoSegura}`}
                            alt={professorResponsavel.nome}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                            {professorResponsavel.nome
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </div>
                        );
                      })()}
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {professorResponsavel.nome}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {professorResponsavel.email}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Registro: {professorResponsavel.registro}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Nenhum professor para essa matéria e turma foi selecionado
                      ainda – por favor vá em “Turmas → Visualizar Turmas” para
                      escolher.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Corpo Docente ocupa toda a largura abaixo, em 3 colunas */}
            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-[rgba(0,0,0,0.06)]">
                <h3 className="font-semibold text-lg text-gray-800">
                  Corpo Docente – {materia.nome}
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {professores.length > 0 ? (
                  professores.map((prof) => {
                    const fotoSegura = getSafeImagePath(prof.foto || '');

                    return (
                      <div
                        key={prof.id}
                        className="flex items-center space-x-4"
                      >
                        {fotoSegura ? (
                          <img
                            src={`${backendUrl}${fotoSegura}`}
                            alt={prof.nome}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                            {prof.nome?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {prof.nome}
                          </h4>
                          <p className="text-gray-600 text-sm">{prof.email}</p>
                          <p className="text-gray-500 text-xs">
                            Registro: {prof.registro}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">
                    Nenhum professor cadastrado para esta matéria.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="p-2 sm:p-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-gray-50">
                <h3 className="font-semibold text-lg text-gray-800">
                  Materiais Disponíveis – {materia.nome}
                </h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {materiais.length > 0 ? (
                  materiais.map((material) => (
                    <div
                      key={material.id}
                      className="flex border rounded-md p-3 bg-gray-50 shadow-sm"
                    >
                      <img
                        src={`${material.capa_url}`}
                        alt={`Capa de ${material.nome}`}
                        className="w-20 h-28 object-cover rounded-md mr-4"
                      />
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {material.nome}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Autor: {material.autor}
                          </p>
                        </div>
                        <div>
                          <a
                            href={`${material.conteudo_url}`}
                            download={`${material.nome}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            Baixar
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">
                    Nenhum material disponível para esta matéria.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="p-2 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {distribuicaoPorTipo.map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="border-b border-gray-200 p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg text-gray-800">
                      Distribuição de Alunos por Nota: {entry.tipo} (Valor:{' '}
                      {entry.valor.toFixed(2)})
                    </h3>
                  </div>
                  <div className="p-4 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          dataKey="value"
                          data={entry.data}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          labelLine={false}
                          label={({ name, value }) => {
                            if (value === 0) return '';
                            const classe = name.split(' ')[0];
                            return `${classe}: ${value.toFixed(1)}%`;
                          }}
                        >
                          {entry.data.map((slice, i) => {
                            let fillColor = '#000000';
                            if (slice.name.startsWith('Insuficiente')) {
                              fillColor = '#EF4444';
                            } else if (slice.name.startsWith('Regular')) {
                              fillColor = '#F59E0B';
                            } else if (slice.name.startsWith('Bom')) {
                              fillColor = '#3B82F6';
                            } else if (slice.name.startsWith('Excelente')) {
                              fillColor = '#10B981';
                            }
                            return <Cell key={`cell-${i}`} fill={fillColor} />;
                          })}
                        </Pie>
                        <RechartsTooltip
                          formatter={(val: number) => `${val.toFixed(1)}%`}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="p-2 sm:p-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-4 bg-gray-50">
                <h3 className="font-semibold text-lg text-gray-800">
                  Alunos em Risco de Reprovação
                </h3>
              </div>
              <div className="p-4 overflow-x-auto">
                {alunosRiscoLista.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome do Aluno
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nota Obtida
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nota Recuperação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nota Final (MAIOR VALOR)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Média 60%
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {alunosRiscoLista.map((aluno) => {
                        const notasDoAluno = notas.filter(
                          (n) => n.aluno_id === aluno.id
                        );
                        const k = notasDoAluno.length;
                        if (k === 0) {
                          return (
                            <tr key={`sem-notas-${aluno.id}`}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {aluno.nome}
                              </td>
                              <td
                                colSpan={6}
                                className="px-6 py-4 text-sm text-gray-500"
                              >
                                Nenhuma avaliação disponível.
                              </td>
                            </tr>
                          );
                        }

                        const somaNotasFinais = notasDoAluno.reduce(
                          (acc, n) => acc + n.nota_final,
                          0
                        );
                        const somaValores = notasDoAluno.reduce(
                          (acc, n) => acc + n.valor,
                          0
                        );
                        const media60 = somaValores * 0.6;

                        return (
                          <React.Fragment key={`grupo-${aluno.id}`}>
                            {notasDoAluno.map((n, idx) => (
                              <tr key={`${aluno.id}-nota-${idx}`}>
                                {idx === 0 ? (
                                  <td
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                    rowSpan={k + 1}
                                  >
                                    {aluno.nome}
                                  </td>
                                ) : null}

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {n.tipo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {n.valor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {n.nota_inicial}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {n.nota_rec}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {n.nota_final}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {/* coluna “Média 60%” vazia em linhas de avaliação */}
                                </td>
                              </tr>
                            ))}

                            {/* Linha de resumo: somaNotasFinais em “Nota Final” + média60 em “Média 60%” */}
                            <tr key={`soma-${aluno.id}`}>
                              {/* O <td> do nome já foi consumido */}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {/* vazio para “Tipo” */}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {/* vazio para “Valor” */}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {/* vazio para “Nota Inicial” */}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {/* vazio para “Nota Recuperação” */}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                {/* Soma total na coluna Nota Final */}
                                Soma total das notas finais: {somaNotasFinais}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                                {/* Média 60% na coluna correspondente */}
                                {media60.toFixed(2)}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">Nenhum aluno em risco.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MateriasPage;
