/// RelatorioAlunoPage.tsx - Relatório detalhado do aluno com Sidebar, TopBar e gráficos interativos

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import '../../styles/RelatorioAlunoPage.css';
import SidebarGestor from './components/Sidebar';
import TopBarGestor from './components/Navbar';
import HelpModal from '../../components/AjudaModal';
import NotificationsMenu from '../../components/NotificationsMenu';
import { useAuth } from '../../hooks/useAuth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HiArrowLeft } from 'react-icons/hi'; // Importar ícone
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import TopbarGestorAuto from './components/TopbarGestorAuto';


interface NotaDisciplina { disciplina: string; nota: number; }
interface FrequenciaMes { mes: string; frequencia: number; }
interface DesempenhoEtapa { etapa: string; desempenho: number; }

const RelatorioAlunoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aluno, setAluno] = useState<any>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  const [modoGeral, setModoGeral] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('lista');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroSerie, setFiltroSerie] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [activePage, setActivePage] = useState('relatorio');
  const [mostrarTodos, setMostrarTodos] = useState(false);



  const exportarPDF = async () => {
    if (!exportRef.current) return;
    const pdf = new jsPDF();
    const canvas = await html2canvas(exportRef.current);
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(`relatorio-${aluno?.nome || 'aluno'}.pdf`);
  };

  const alunos = [
    {
      id: '4',
      nome: 'Lucas Oliveira',
      serie: '2º ano',
      turma: 'Turma B',
      frequencia: 94,
      desempenho: 82,
      comportamento: 'Excelente',
      avaliacao: 88,
      status: 'ativo',
      disciplinas: ['Matemática', 'Física'],
    },
    {
      id: '9',
      nome: 'Mariana Costa',
      serie: '1º ano',
      turma: 'Turma A',
      frequencia: 89,
      desempenho: 75,
      comportamento: 'Bom',
      avaliacao: 79,
      status: 'licenca',
      disciplinas: ['História', 'Português'],
    },
    {
      id: '20',
      nome: 'Carlos Eduardo',
      serie: '3º ano',
      turma: 'Turma C',
      frequencia: 97,
      desempenho: 91,
      comportamento: 'Muito Bom',
      avaliacao: 95,
      status: 'ativo',
      disciplinas: ['Química', 'Biologia'],
    },
    {
      id: '21',
      nome: 'Beatriz Mendes',
      serie: '2º ano',
      turma: 'Turma B',
      frequencia: 92,
      desempenho: 88,
      comportamento: 'Excelente',
      avaliacao: 90,
      status: 'ativo',
      disciplinas: ['Matemática', 'Inglês'],
    },
    {
        id: '22',
        nome: 'João Pedro Lima',
        serie: '1º ano',
        turma: 'Turma A',
        frequencia: 87,
        desempenho: 72,
        comportamento: 'Regular',
        avaliacao: 70,
        status: 'ativo',
        disciplinas: ['Geografia', 'História'],
      },
      {
        id: '23',
        nome: 'Larissa Gomes',
        serie: '3º ano',
        turma: 'Turma C',
        frequencia: 93,
        desempenho: 89,
        comportamento: 'Excelente',
        avaliacao: 92,
        status: 'ativo',
        disciplinas: ['Literatura', 'Redação'],
      },
      {
        id: '24',
        nome: 'Rafael Torres',
        serie: '2º ano',
        turma: 'Turma B',
        frequencia: 85,
        desempenho: 76,
        comportamento: 'Bom',
        avaliacao: 81,
        status: 'ativo',
        disciplinas: ['Física', 'Química'],
      },
      {
        id: '25',
        nome: 'Giovanna Alves',
        serie: '1º ano',
        turma: 'Turma A',
        frequencia: 90,
        desempenho: 84,
        comportamento: 'Muito Bom',
        avaliacao: 87,
        status: 'licenca',
        disciplinas: ['Matemática', 'Português'],
      },
      {
        id: '26',
        nome: 'Henrique Souza',
        serie: '3º ano',
        turma: 'Turma C',
        frequencia: 88,
        desempenho: 79,
        comportamento: 'Bom',
        avaliacao: 85,
        status: 'ativo',
        disciplinas: ['Inglês', 'Filosofia'],
      },
      {
        id: '10',
        nome: 'Camila Ferreira',
        serie: '2º ano',
        turma: 'Turma B',
        frequencia: 96,
        desempenho: 93,
        comportamento: 'Excelente',
        avaliacao: 97,
        status: 'ativo',
        disciplinas: ['Artes', 'Educação Física'],
      },
  ];

  const alunosFiltrados = alunos.filter((a) => {
    const nomeMatch = a.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const serieMatch = filtroSerie === '' || a.serie === filtroSerie;
    const turmaMatch = filtroTurma === '' || a.turma === filtroTurma;
    return nomeMatch && serieMatch && turmaMatch;
  });

  useEffect(() => {
    const alunosDetalhados = [
      {
        id: '1', nome: 'Lucas Oliveira', email: 'lucas.oliveira@escola.com', serie: '2º ano', turma: 'Turma B', desempenho: 82, frequencia: 94, comportamento: 'Excelente', participacoes: ['Feira de Tecnologia', 'Olimpíada de Matemática'], observacoes: ['Participação ativa em sala', 'Entrega de trabalhos em dia'], notasPorDisciplina: [
          { disciplina: 'Matemática', nota: 85 },
          { disciplina: 'Português', nota: 78 },
          { disciplina: 'História', nota: 88 },
          { disciplina: 'Ciências', nota: 82 },
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 92 },
          { mes: 'Fev', frequencia: 95 },
          { mes: 'Mar', frequencia: 90 },
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 76 },
          { etapa: 'Bimestre 2', desempenho: 82 },
          { etapa: 'Bimestre 3', desempenho: 87 },
        ]
      },
      {
        id: '2', nome: 'Mariana Costa', email: 'mariana.costa@escola.com', serie: '1º ano', turma: 'Turma A', desempenho: 75, frequencia: 89, comportamento: 'Bom', participacoes: ['Feira Literária'], observacoes: ['Boa escrita, mas tímida nas apresentações'], notasPorDisciplina: [
          { disciplina: 'Português', nota: 81 },
          { disciplina: 'História', nota: 74 },
          { disciplina: 'Matemática', nota: 67 },
          { disciplina: 'Inglês', nota: 79 },
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 88 },
          { mes: 'Fev', frequencia: 85 },
          { mes: 'Mar', frequencia: 94 },
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 70 },
          { etapa: 'Bimestre 2', desempenho: 74 },
          { etapa: 'Bimestre 3', desempenho: 80 },
        ]
      },
      {
        id: '3', nome: 'Carlos Eduardo', email: 'carlos.eduardo@escola.com', serie: '3º ano', turma: 'Turma C', desempenho: 91, frequencia: 97, comportamento: 'Muito Bom', participacoes: ['Cine Debate Filosófico', 'Campeonato de Robótica'], observacoes: ['Engajado e ajuda colegas com dificuldades'], notasPorDisciplina: [
          { disciplina: 'Filosofia', nota: 90 },
          { disciplina: 'Matemática', nota: 93 },
          { disciplina: 'Química', nota: 89 },
          { disciplina: 'Física', nota: 91 },
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 98 },
          { mes: 'Fev', frequencia: 96 },
          { mes: 'Mar', frequencia: 97 },
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 88 },
          { etapa: 'Bimestre 2', desempenho: 92 },
          { etapa: 'Bimestre 3', desempenho: 93 },
        ]
      },
      {
        id: '4', nome: 'Beatriz Mendes', email: 'beatriz.mendes@escola.com', serie: '2º ano', turma: 'Turma B', desempenho: 88, frequencia: 92, comportamento: 'Excelente', participacoes: ['Feira de Ciências', 'Grupo de Dança'], observacoes: ['Sempre entrega trabalhos com criatividade'], notasPorDisciplina: [
          { disciplina: 'Inglês', nota: 90 },
          { disciplina: 'Biologia', nota: 86 },
          { disciplina: 'Artes', nota: 92 },
          { disciplina: 'Educação Física', nota: 100 },
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 93 },
          { mes: 'Fev', frequencia: 91 },
          { mes: 'Mar', frequencia: 92 },
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 84 },
          { etapa: 'Bimestre 2', desempenho: 88 },
          { etapa: 'Bimestre 3', desempenho: 90 },
        ]
      },
      {
        id: '5', nome: 'João Pedro Lima', email: 'joao.pedro@escola.com', serie: '1º ano', turma: 'Turma A', desempenho: 72, frequencia: 87, comportamento: 'Regular', participacoes: ['Oficina de Teatro'], observacoes: ['Precisa melhorar atenção nas aulas'], notasPorDisciplina: [
          { disciplina: 'História', nota: 70 },
          { disciplina: 'Geografia', nota: 68 },
          { disciplina: 'Português', nota: 75 },
          { disciplina: 'Educação Física', nota: 92 }
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 85 },
          { mes: 'Fev', frequencia: 90 },
          { mes: 'Mar', frequencia: 86 }
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 68 },
          { etapa: 'Bimestre 2', desempenho: 72 },
          { etapa: 'Bimestre 3', desempenho: 76 }
        ]
      },
      {
        id: '6', nome: 'Larissa Gomes', email: 'larissa.gomes@escola.com', serie: '3º ano', turma: 'Turma C', desempenho: 89, frequencia: 93, comportamento: 'Excelente', participacoes: ['Clube de Leitura', 'Simulação da ONU'], observacoes: ['Excelente argumentadora e liderança natural'], notasPorDisciplina: [
          { disciplina: 'Redação', nota: 95 },
          { disciplina: 'Literatura', nota: 90 },
          { disciplina: 'Sociologia', nota: 88 },
          { disciplina: 'Geografia', nota: 84 }
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 92 },
          { mes: 'Fev', frequencia: 94 },
          { mes: 'Mar', frequencia: 93 }
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 85 },
          { etapa: 'Bimestre 2', desempenho: 89 },
          { etapa: 'Bimestre 3', desempenho: 92 }
        ]
      },
      {
        id: '7', nome: 'Rafael Torres', email: 'rafael.torres@escola.com', serie: '2º ano', turma: 'Turma B', desempenho: 76, frequencia: 85, comportamento: 'Bom', participacoes: ['Atletismo Escolar'], observacoes: ['Melhorou desde o último semestre'], notasPorDisciplina: [
          { disciplina: 'Física', nota: 72 },
          { disciplina: 'Matemática', nota: 78 },
          { disciplina: 'Educação Física', nota: 100 },
          { disciplina: 'História', nota: 74 }
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 80 },
          { mes: 'Fev', frequencia: 87 },
          { mes: 'Mar', frequencia: 88 }
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 70 },
          { etapa: 'Bimestre 2', desempenho: 75 },
          { etapa: 'Bimestre 3', desempenho: 78 }
        ]
      },
      {
        id: '8', nome: 'Giovanna Alves', email: 'giovanna.alves@escola.com', serie: '1º ano', turma: 'Turma A', desempenho: 84, frequencia: 90, comportamento: 'Muito Bom', participacoes: ['Coral Escolar', 'Projeto Reciclagem'], observacoes: ['Criativa e comprometida'], notasPorDisciplina: [
          { disciplina: 'Biologia', nota: 82 },
          { disciplina: 'Português', nota: 87 },
          { disciplina: 'História', nota: 83 },
          { disciplina: 'Matemática', nota: 85 }
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 91 },
          { mes: 'Fev', frequencia: 89 },
          { mes: 'Mar', frequencia: 90 }
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 80 },
          { etapa: 'Bimestre 2', desempenho: 84 },
          { etapa: 'Bimestre 3', desempenho: 86 }
        ]
      },
      {
        id: '9', nome: 'Henrique Souza', email: 'henrique.souza@escola.com', serie: '3º ano', turma: 'Turma C', desempenho: 79, frequencia: 88, comportamento: 'Bom', participacoes: ['Feira de Profissões'], observacoes: ['Bom desempenho, mas precisa ser mais pontual'], notasPorDisciplina: [
          { disciplina: 'Filosofia', nota: 77 },
          { disciplina: 'Matemática', nota: 82 },
          { disciplina: 'Biologia', nota: 78 },
          { disciplina: 'Educação Física', nota: 88 }
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 87 },
          { mes: 'Fev', frequencia: 90 },
          { mes: 'Mar', frequencia: 87 }
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 76 },
          { etapa: 'Bimestre 2', desempenho: 80 },
          { etapa: 'Bimestre 3', desempenho: 81 }
        ]
      },
      {
        id: '10', nome: 'Camila Ferreira', email: 'camila.ferreira@escola.com', serie: '2º ano', turma: 'Turma B', desempenho: 93, frequencia: 96, comportamento: 'Excelente', participacoes: ['Projeto Robótica', 'Gincana Interclasse'], observacoes: ['Líder de equipe, alto desempenho e excelente disciplina'], notasPorDisciplina: [
          { disciplina: 'Física', nota: 95 },
          { disciplina: 'Química', nota: 92 },
          { disciplina: 'Matemática', nota: 96 },
          { disciplina: 'História', nota: 89 }
        ], frequenciaMensal: [
          { mes: 'Jan', frequencia: 95 },
          { mes: 'Fev', frequencia: 97 },
          { mes: 'Mar', frequencia: 96 }
        ], evolucaoDesempenho: [
          { etapa: 'Bimestre 1', desempenho: 90 },
          { etapa: 'Bimestre 2', desempenho: 93 },
          { etapa: 'Bimestre 3', desempenho: 95 }
        ]
      },

    ];

    const alunoEncontrado = alunosDetalhados.find((a) => a.id === id);
    if (alunoEncontrado) setAluno(alunoEncontrado);
  }, [id]);

  if (!modoGeral && aluno) {
    return (
      <div className="dashboard-container">
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) =>
            navigate('/gestor', { state: { activePage: page } })
          }
          handleMouseEnter={() => setSidebarAberta(true)}
          handleMouseLeave={() => setSidebarAberta(false)}
        />
  
        <div className="main-content">
          <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
  
          <button
            className="btn-voltar-professores"
            title="Voltar para a página anterior"
            onClick={() => navigate(-1)}
          >
            <HiArrowLeft size={20} />
          </button>
  
          <div className="relatorio-aluno-detalhado" ref={exportRef}>
            <div className="relatorio-bloco">
              <h1>Relatório de {aluno?.nome}</h1>
              <p className="subtitulo">Informações detalhadas do aluno</p>
  
              <div className="relatorio-bloco">
                <h2>Informações Pessoais</h2>
                <ul>
                  <li><strong>Email:</strong> {aluno?.email}</li>
                  <li><strong>Série:</strong> {aluno?.serie}</li>
                  <li><strong>Turma:</strong> {aluno?.turma}</li>
                  <li><strong>Comportamento:</strong> {aluno?.comportamento}</li>
                </ul>
              </div>
  
              <div className="relatorio-bloco">
                <h2>Notas por Disciplina</h2>
                <ul>
                  {aluno?.notasPorDisciplina.map((nota: NotaDisciplina, i: number) => (
                    <li key={i}><strong>{nota.disciplina}:</strong> {nota.nota}</li>
                  ))}
                </ul>
              </div>
  
              <div className="cards-resumo">
                <div className="card-info">
                  <p>Frequência</p>
                  <h2>{aluno?.frequencia}%</h2>
                  <div className="barra-progresso">
                    <div className="barra-preenchida" style={{ width: `${aluno?.frequencia}%` }}></div>
                  </div>
                </div>
                <div className="card-info">
                  <p>Desempenho Geral</p>
                  <h2>{aluno?.desempenho}%</h2>
                  <div className="barra-progresso">
                    <div className="barra-preenchida" style={{ width: `${aluno?.desempenho}%` }}></div>
                  </div>
                </div>
              </div>
  
              <div className="relatorio-bloco">
                <h2>Participações</h2>
                <ul>
                  {aluno?.participacoes.map((p: string, i: number) => <li key={i}>{p}</li>)}
                </ul>
              </div>
  
              <div className="relatorio-bloco">
                <h2>Observações da Coordenação</h2>
                <ul>
                  {aluno?.observacoes.map((obs: string, i: number) => <li key={i}>{obs}</li>)}
                </ul>
              </div>
  
              <div className="relatorio-bloco">
                <h2>Frequência Mensal</h2>
                <ul>
                  {aluno?.frequenciaMensal.map((f: FrequenciaMes, i: number) => (
                    <li key={i}><strong>{f.mes}:</strong> {f.frequencia}%</li>
                  ))}
                </ul>
              </div>
  
              <div className="relatorio-bloco">
                <h2>Evolução de Desempenho</h2>
                <ul>
                  {aluno?.evolucaoDesempenho.map((e: DesempenhoEtapa, i: number) => (
                    <li key={i}><strong>{e.etapa}:</strong> {e.desempenho}%</li>
                  ))}
                </ul>
              </div>
  
              <div className="relatorio-bloco">
                <h2>Indicadores Digitais (LMS)</h2>
                <ul>
                  <li>Frequência de login: 3x por semana</li>
                  <li>Interações na plataforma: média semanal de 8 ações</li>
                  <li>Tempo médio de permanência por acesso: 22 minutos</li>
                </ul>
              </div>
  
              <button className="btn-aluno-voltar" onClick={() => setModoGeral(true)}>
                Mostrar todos os alunos
              </button>
  
              <button className="btn-aluno-voltar" onClick={() => {
                if (!exportRef.current) return;
                const pdf = new jsPDF();
                html2canvas(exportRef.current).then((canvas) => {
                  const imgData = canvas.toDataURL('image/png');
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                  pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
                  pdf.save(`relatorio-${aluno?.nome || 'aluno'}.pdf`);
                });
              }}>Exportar PDF</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (modoGeral) {
    return (
      <div className="dashboard-container">
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) => navigate('/gestor', { state: { activePage: page } })}
          handleMouseEnter={() => setSidebarAberta(true)}
          handleMouseLeave={() => setSidebarAberta(false)}
        />
  
        <div className="main-content">
          <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />
  
          <button className="btn-voltar-alunos" title="Voltar para a página anterior" onClick={() => setModoGeral(false)}>
            <HiArrowLeft size={20} />
          </button>
  
          <div className="tabela-aluno-container">
            <h1>Relatório de Alunos</h1>
  
            <div className="tabela-aluno-bloco" ref={exportRef}>
              <div className="tabela-aluno-tabs">
                <button className={`tab-aluno ${abaAtiva === 'lista' ? 'active' : ''}`} onClick={() => setAbaAtiva('lista')}>
                  Lista de Alunos
                </button>
                <button className={`tab ${abaAtiva === 'turma' ? 'active' : ''}`} onClick={() => setAbaAtiva('turma')}>
                  Por Turma
                </button>
                <button className={`tab ${abaAtiva === 'desempenho' ? 'active' : ''}`} onClick={() => setAbaAtiva('desempenho')}>
                  Desempenho
                </button>
                <button className="btn-aluno-exportar" onClick={() => window.print()}>
                  Exportar PDF
                </button>
              </div>
  
              {abaAtiva === 'lista' && (
                <table className="tabela-aluno-tabela">
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Série</th>
                      <th>Turma</th>
                      <th>Frequência</th>
                      <th>Desempenho</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map((a, i) => (
                      <tr key={i}>
                        <td>{a.nome}</td>
                        <td>{a.serie}</td>
                        <td>{a.turma}</td>
                        <td>
                          {a.frequencia}%
                          <div className="barra-progresso-aluno">
                            <div className="barra-preenchida-aluno" style={{ width: `${a.frequencia}%` }}></div>
                          </div>
                        </td>
                        <td>
                          {a.desempenho}%
                          <div className="barra-progresso">
                            <div className="barra-preenchida" style={{ width: `${a.desempenho}%` }}></div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-aluno ${a.status}`}>
                            {a.status === 'ativo' ? 'Ativo' : 'Licença'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}

                    {abaAtiva === 'turma' && (
                    <div className="tabela-aluno-bloco">
                        <h2>Alunos por Turma</h2>
                        {Array.from(
                        alunos.reduce((acc, aluno) => {
                            if (!acc.has(aluno.turma)) acc.set(aluno.turma, []);
                            acc.get(aluno.turma)?.push(aluno);
                            return acc;
                        }, new Map<string, typeof alunos>())
                        ).map(([turma, alunosDaTurma]) => (
                        <div key={turma} style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{turma}</h2>
                            <table className="tabela-aluno-tabela">
                            <thead>
                                <tr>
                                <th>Aluno</th>
                                <th>Série</th>
                                <th>Frequência</th>
                                <th>Desempenho</th>
                                <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alunosDaTurma.map((a, i) => (
                                <tr key={i}>
                                    <td>{a.nome}</td>
                                    <td>{a.serie}</td>
                                    <td>
                                    {a.frequencia}%
                                    <div className="barra-progresso-aluno">
                                        <div className="barra-preenchida-aluno" style={{ width: `${a.frequencia}%` }}></div>
                                    </div>
                                    </td>
                                    <td>
                                    {a.desempenho}%
                                    <div className="barra-progresso">
                                        <div className="barra-preenchida" style={{ width: `${a.desempenho}%` }}></div>
                                    </div>
                                    </td>
                                    <td>
                                    <span className={`status-aluno ${a.status}`}>
                                        {a.status === 'ativo' ? 'Ativo' : 'Licença'}
                                    </span>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        ))}
                    </div>
                    )}

                    {abaAtiva === 'desempenho' && (
                    <div className="tabela-aluno-bloco">
                        <h2>Ranking de Desempenho</h2>
                        <table className="tabela-aluno-tabela">
                        <thead>
                            <tr>
                            <th>Aluno</th>
                            <th>Série</th>
                            <th>Turma</th>
                            <th>Desempenho</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...alunos]
                            .sort((a, b) => b.desempenho - a.desempenho)
                            .map((a, i) => (
                                <tr key={i}>
                                <td>{a.nome}</td>
                                <td>{a.serie}</td>
                                <td>{a.turma}</td>
                                <td>
                                    {a.desempenho}%
                                    <div className="barra-progresso">
                                    <div className="barra-preenchida" style={{ width: `${a.desempenho}%` }}></div>
                                    </div>
                                </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
}


export default RelatorioAlunoPage;
