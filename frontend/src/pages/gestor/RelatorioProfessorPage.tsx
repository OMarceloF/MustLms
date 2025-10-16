import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import '../../styles/RelatorioProfessorPage.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import SidebarGestor from './components/Sidebar';
import TopBarGestor from './components/Navbar';
import HelpModal from '../../components/AjudaModal';
import NotificationsMenu from '../../components/NotificationsMenu';
import { useAuth } from '../../hooks/useAuth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HiArrowLeft } from 'react-icons/hi'; // Importar ícone
import TopbarGestorAuto from './components/TopbarGestorAuto';



const RelatorioProfessorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('lista');
  const [modoGeral, setModoGeral] = useState(false);
  const [professor, setProfessor] = useState<any>(null);
  const { user } = useAuth();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState('relatorio');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroDisciplina, setFiltroDisciplina] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDepartamento, setFiltroDepartamento] = useState('');
  const [filtroAvaliacao, setFiltroAvaliacao] = useState(0);
  const exportRef = useRef<HTMLDivElement>(null);


  const professores = [
    {
      id: '1', nome: 'Ana Silva', departamento: 'Matemática', disciplinas: ['Álgebra', 'Geometria'], cargaHoraria: '40h', frequencia: 98, desempenho: 87, avaliacao: 83, status: 'ativo',
    },
    {
      id: '2', nome: 'Carlos Oliveira', departamento: 'Ciências', disciplinas: ['Biologia', 'Química'], cargaHoraria: '32h', frequencia: 95, desempenho: 82, avaliacao: 78, status: 'ativo',
    },
    {
      id: '3', nome: 'Mariana Costa', departamento: 'Língua Portuguesa', disciplinas: ['Gramática', 'Literatura'], cargaHoraria: '40h', frequencia: 97, desempenho: 90, avaliacao: 92, status: 'licenca',
    },
    {
      id: '6', nome: 'Roberto Santos', departamento: 'História', disciplinas: ['História Geral', 'História do Brasil'], cargaHoraria: '30h', frequencia: 92, desempenho: 85, avaliacao: 87, status: 'licenca',
    },
    {
      id: '7', nome: 'Juliana Mello', departamento: 'Física', disciplinas: ['Cinemática', 'Eletromagnetismo'], cargaHoraria: '36h', frequencia: 94, desempenho: 88, avaliacao: 98, status: 'ativo',
    },
    {
      id: '8', nome: 'Eduardo Lima', departamento: 'Inglês', disciplinas: ['Conversação', 'Gramática'], cargaHoraria: '28h', frequencia: 96, desempenho: 84, avaliacao: 69, status: 'ativo',
    },
    {
      id: '15',
      nome: 'Beatriz Rocha', departamento: 'Educação Física',
      disciplinas: ['Esportes Coletivos', 'Alongamento'],
      cargaHoraria: '25h',
      frequencia: 99,
      desempenho: 90,
      avaliacao: 91,
      status: 'licenca',
    },
    {
      id: '17',
      nome: 'Vinícius Almeida',
      departamento: 'Arte',
      disciplinas: ['Teoria da Arte', 'Prática de Pintura'],
      cargaHoraria: '20h',
      frequencia: 93,
      desempenho: 86,
      avaliacao: 88,
      status: 'ativo',
    },
    {
      id: '16',
      nome: 'Fernanda Duarte',
      departamento: 'Geografia',
      disciplinas: ['Geografia Física', 'Geopolítica'],
      cargaHoraria: '34h',
      frequencia: 97,
      desempenho: 91,
      avaliacao: 94,
      status: 'licenca',
    },
    {
      id: '18',
      nome: 'Rafael Martins',
      departamento: 'Química',
      disciplinas: ['Química Orgânica', 'Química Geral'],
      cargaHoraria: '38h',
      frequencia: 95,
      desempenho: 89,
      avaliacao: 90,
      status: 'ativo',
    },
  ];

  const professoresFiltrados = professores.filter((p) => {
    const nomeMatch = p.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const disciplinaMatch = filtroDisciplina === '' || p.disciplinas.includes(filtroDisciplina);
    const statusMatch = filtroStatus === '' || p.status === filtroStatus;
    return nomeMatch && disciplinaMatch && statusMatch;
  });

  const exportarPDF = async () => {
    if (!exportRef.current) return;
  
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const marginTop = 10;
    const marginBottom = 10;
    const usableHeight = pdfHeight - marginTop - marginBottom;
  
    const canvas = await html2canvas(exportRef.current, {
      scrollY: -window.scrollY,
      windowWidth: document.body.scrollWidth
    });
  
    const imgData = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
    let heightLeft = imgHeight;
    let position = marginTop;
  
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= usableHeight;
  
    while (heightLeft > 0) {
      position -= usableHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, marginTop, pdfWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    pdf.save(`relatorio-${abaAtiva}.pdf`);
  
    pdf.save(`relatorio-${professor.nome}.pdf`);
  };
  

  useEffect(() => {
    const encontrado = professores.find(p => p.id === id);
    if (encontrado) setProfessor(encontrado);
  }, [id]);

  

  if (!modoGeral && professor) {
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
      <div className="relatorio-professor-container" ref={exportRef}>
        <div className="relatorio-bloco">
          
          <h1>Relatório de {professor.nome}</h1>
          
          <p className="subtitulo">Informações detalhadas do professor</p>
          <div className="relatorio-bloco">
          <h2>Informações Pessoais</h2>
          <ul>
            <li><strong>Email:</strong> {professor.email || 'carlos.edu@escola.com'}</li>
            <li><strong>Telefone:</strong> (11) 98765-4321</li>
            <li><strong>Data de Entrada:</strong> 15/02/2021</li>
            <li><strong>Tempo de Casa:</strong> 3 anos e 2 meses</li>
          </ul>
        </div>
        <div className="relatorio-bloco">
            <h2>Informações Acadêmicas</h2>
            <ul>
              <li><strong>Titulação:</strong> Mestre em Educação Matemática</li>
              <li><strong>Área de formação:</strong> Licenciatura em Matemática</li>
              <li><strong>Certificações:</strong> Didática Aplicada, Inclusão Digital</li>
              <li><strong>Disciplinas:</strong>
                <div className="disciplinas">
                  {professor.disciplinas.map((d: string, i: number) => (
                  
                    <span key={i} className="disciplina-badge">{d}</span>
                  ))}
                </div>
              </li>
              <li><strong>Turmas Associadas:</strong> 1º A, 2º B, 3º C</li>
              <li><strong>Carga Horária:</strong> {professor.cargaHoraria}</li>
            </ul>
          </div>

          <button className="btn-voltar" onClick={() => setModoGeral(true)}>
            Mostrar todos os professores
          </button>
          <button className="btn-voltar" onClick={exportarPDF}>
          Exportar PDF
         </button>
        </div>

        <div className="cards-resumo">
          <div className="card-info">
            <p>Departamento</p>
            <h2>{professor.departamento}</h2>
          </div>
          <div className="card-info">
            <p>Carga Horária</p>
            <h2>{professor.cargaHoraria}</h2>
          </div>
          <div className="card-info">
            <p>Frequência</p>
            <h2>{professor.frequencia}%</h2>
            <div className="barra-progresso">
              <div className="barra-preenchida" style={{ width: `${professor.frequencia}%` }}></div>
            </div>
          </div>
          <div className="card-info">
            <p>Desempenho das Turmas</p>
            <h2>{professor.desempenho}%</h2>
            <div className="barra-progresso">
              <div className="barra-preenchida" style={{ width: `${professor.desempenho}%` }}></div>
            </div>
          </div>
          <div className="card-info">
            <p>Avaliação Média</p>
            <h2>{professor.avaliacao.toFixed(1)} / 100</h2>
            <div className="avaliacao-pontos">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`avaliacao-ponto ${i < Math.round(professor.avaliacao) ? 'ativo' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="relatorio-bloco">
          <h2>Feedbacks Recentes</h2>
          <ul>
            <li>“Professor muito didático e atencioso.”</li>
            <li>“As aulas online são bem organizadas.”</li>
            <li>“Pode melhorar o uso de exemplos práticos.”</li>
          </ul>
        </div>

        <div className="relatorio-bloco">
          <h2>Observações da Coordenação</h2>
          <ul>
            <li>Presença regular em reuniões pedagógicas.</li>
            <li>Relatórios de aula sempre entregues em dia.</li>
            <li>Sem registros de advertência até o momento.</li>
          </ul>
        </div>
        <div className="relatorio-bloco">
          <h2>Eventos e Atividades</h2>
          <ul>
            <li>Participação no congresso de Educação Matemática.</li>
            <li>Organização da feira de ciências da escola.</li>
            <li>Ministrou workshop sobre tecnologia na educação.</li>
          </ul>
        </div>

                <div className="relatorio-bloco">
          <h2>Situação Contratual e Financeira</h2>
          <ul>
            <li><strong>Vínculo:</strong> CLT</li>
            <li><strong>Status do Pagamento:</strong> Em dia</li>
            <li><strong>Vencimento de Contrato:</strong> 12/12/2024</li>
            <li><strong>Possui pendências:</strong> Não</li>
          </ul>
        </div>
        <div className="relatorio-bloco">
          <h2>Indicadores Pedagógicos</h2>
          <ul>
            <li>Entrega de Planos de Aula: ✅</li>
            <li>Aderência ao cronograma: 94%</li>
            <li>Participação em formações internas: 3 de 3 concluídas</li>
            <li>Aplicou avaliações em todas as turmas? ✅</li>
          </ul>
        </div>
        <div className="relatorio-bloco">
            <h2>Indicadores Digitais (LMS)</h2>
            <ul>
              <li>Frequência de login: 4x por semana</li>
              <li>Respostas a alunos: até 24h</li>
              <li>Interações em fóruns: 22 postagens</li>
            </ul>
          </div>

        <div className="relatorio-bloco">
          <h2>Disciplinas e Status</h2>
          <ul>
            <li>
              Disciplinas:
              <div className="disciplinas">
                {professor.disciplinas.map((d: string, i: number) => (
                  <span key={i} className="disciplina-badge">{d}</span>
                ))}
              </div>
            </li>
            <li>
              Status:
              <span className={`status ${professor.status}`}>{professor.status === 'ativo' ? 'Ativo' : 'Licença'}</span>
            </li>
          </ul>
        </div>

        <div className="relatorio-bloco">
          <h2>Comparativo de Professores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={professores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="frequencia" fill="#9A3934" name="Frequência (%)" />
              <Bar dataKey="desempenho" fill="#593635" name="Desempenho (%)" />
              <Bar dataKey="avaliacao" fill="#34995A" name="Avaliação (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
      </div>
    );
  }

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

    <div className="tabela-relatorio-container">
      <h1>Relatório de Professores</h1>
      
      <div className="tabela-relatorio-bloco" ref={exportRef}>
  
      <div className="tabela-relatorio-bloco">

        <div className="tabela-relatorio-tabs">
          <button
            className={`tab ${abaAtiva === 'lista' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('lista')}
          >
            Lista de Professores
          </button>
          <button
            className={`tab ${abaAtiva === 'departamento' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('departamento')}
          >
            Por Departamento
          </button>
          <button
            className={`tab ${abaAtiva === 'desempenho' ? 'active' : ''}`} 
            onClick={() => setAbaAtiva('desempenho')}
          >
            Desempenho
          </button>

          <button className="btn-professoresExport" onClick={exportarPDF}>Exportar PDF</button>

          <div className="tabela-relatorio-filtros">
            <input
              type="text"
              placeholder="Buscar professor..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="select-input-filtro-professor"
            />

            <select
              value={filtroDisciplina}
              onChange={(e) => setFiltroDisciplina(e.target.value)}
              className="select-input-filtro-professor"
            >
              <option value="">Todas as disciplinas</option>
              {Array.from(new Set(professores.flatMap(p => p.disciplinas))).map((disc, i) => (
                <option key={i} value={disc}>{disc}</option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="select-input-filtro-professor"
            >
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="licenca">Licença</option>
            </select>
          </div>

        </div>
  
        {abaAtiva === 'lista' && (
          <table className="tabela-relatorio-tabela">
            <thead>
              <tr>
                <th>Professor</th>
                <th>Departamento</th>
                <th>Disciplinas</th>
                <th>CH</th>
                <th>Frequência</th>
                <th>Desempenho</th>
                <th>Avaliação</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
            {professoresFiltrados.map((p, i) => (
                <tr key={i}>
                  <td>{p.nome}</td>
                  <td>{p.departamento}</td>
                  <td>
                    <div className="disciplinas">
                      {p.disciplinas.map((d, j) => (
                        <span key={j} className="disciplina-badge">{d}</span>
                      ))}
                    </div>
                  </td>
                  <td>{p.cargaHoraria}</td>
                  <td>
                    <span>{p.frequencia}%</span>
                    <div className="barra-progresso">
                      <div className="barra-preenchida" style={{ width: `${p.frequencia}%` }}></div>
                    </div>
                  </td>
                  <td>
                    <span>{p.desempenho}%</span>
                    <div className="barra-progresso">
                      <div className="barra-preenchida" style={{ width: `${p.desempenho}%` }}></div>
                    </div>
                  </td>
                  <td>
                    <span>{p.avaliacao.toFixed(1)}</span>
                    <div className="avaliacao-pontos">
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className={`avaliacao-ponto ${j < Math.round((p.avaliacao / 100) * 5) ? 'ativo' : ''}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status ${p.status}`}>{p.status === 'ativo' ? 'Ativo' : 'Licença'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
  
          {abaAtiva === 'departamento' && (
          <div className="tabela-relatorio-bloco">
            <h2>Professores por Departamento</h2>
            {Array.from(
              professores.reduce((acc, prof) => {
                if (!acc.has(prof.departamento)) acc.set(prof.departamento, []);
                acc.get(prof.departamento)?.push(prof);
                return acc;
              }, new Map<string, typeof professores>())
            ).map(([departamento, profs]) => (
              <div key={departamento} style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{departamento}</h2>
                <table className="tabela-relatorio-tabela">
                  <thead>
                    <tr>
                      <th>Professor</th>
                      <th>Disciplinas</th>
                      <th>CH</th>
                      <th>Frequência</th>
                      <th>Desempenho</th>
                      <th>Avaliação</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profs.map((p, i) => (
                      <tr key={i}>
                        <td>{p.nome}</td>
                        <td>
                          <div className="disciplinas">
                            {p.disciplinas.map((d, j) => (
                              <span key={j} className="disciplina-badge">{d}</span>
                            ))}
                          </div>
                        </td>
                        <td>{p.cargaHoraria}</td>
                        <td>
                          <span>{p.frequencia}%</span>
                          <div className="barra-progresso">
                            <div className="barra-preenchida" style={{ width: `${p.frequencia}%` }}></div>
                          </div>
                        </td>
                        <td>
                          <span>{p.desempenho}%</span>
                          <div className="barra-progresso">
                            <div className="barra-preenchida" style={{ width: `${p.desempenho}%` }}></div>
                          </div>
                        </td>
                        <td>
                          <span>{p.avaliacao.toFixed(1)}</span>
                          <div className="avaliacao-pontos">
                            {[...Array(5)].map((_, j) => (
                              <div
                                key={j}
                                className={`avaliacao-ponto ${j < Math.round((p.avaliacao / 100) * 5) ? 'ativo' : ''}`}
                              />
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`status ${p.status}`}>
                            {p.status === 'ativo' ? 'Ativo' : 'Licença'}
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
          <div className="tabela-relatorio-bloco">
            <h2>Desempenho dos Professores</h2>
            <table className="tabela-relatorio-tabela">
              <thead>
                <tr>
                  <th>Professor</th>
                  <th>Frequência</th>
                  <th>Desempenho</th>
                  <th>Avaliação</th>
                </tr>
              </thead>
              <tbody>
                {professores.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nome}</td>
                    <td>
                      <span>{p.frequencia}%</span>
                      <div className="barra-progresso">
                        <div className="barra-preenchida" style={{ width: `${p.frequencia}%` }}></div>
                      </div>
                    </td>
                    <td>
                      <span>{p.desempenho}%</span>
                      <div className="barra-progresso">
                        <div className="barra-preenchida" style={{ width: `${p.desempenho}%` }}></div>
                      </div>
                    </td>
                    <td>
                      <span>{p.avaliacao.toFixed(1)}</span>
                      <div className="avaliacao-pontos">
                        {[...Array(5)].map((_, j) => (
                          <div
                            key={j}
                            className={`avaliacao-ponto ${j < Math.round((p.avaliacao / 100) * 5) ? 'ativo' : ''}`}
                          />
                        ))}
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
    </div>
  );
  
};

export default RelatorioProfessorPage;