import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css'; // Importa o padrão
import Holidays from 'date-holidays';
import SidebarGestor from './components/Sidebar';
import TopBarGestor from './components/Navbar';
import HelpModal from '../../components/AjudaModal';
import NotificationsMenu from '../../components/NotificationsMenu';
import { useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ProfPerfilActions from '../gestor/components/Prof-Perfil-Actions';
import OtherProfs from '../gestor/components/OthersProfs';
import CalendarUsers from '../gestor/components/CalendarUsers';
import TurmasList from '../gestor/components/TurmasList';
import TopbarGestorAuto from './components/TopbarGestorAuto';

const VisualizarProfessorPage = () => {
  const { user } = useAuth(); // assume que já está autenticado

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [mesVisivel, setMesVisivel] = useState(new Date());
  const [feriadosMesVisivel, setFeriadosMesVisivel] = useState<
    { date: string; name: string }[]
  >([]);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const helpModalRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [professor, setProfessor] = useState<any>(null);
  const [erro, setErro] = useState('');
  const [todosProfessores, setTodosProfessores] = useState<any[]>([]);
  const [turmasDoProfessor, setTurmasDoProfessor] = useState<any[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());

  const hd = new Holidays('BR');

  const [feriadosDoMes, setFeriadosDoMes] = useState<
    { date: string; name: string }[]
  >([]);
  const [feriados, setFeriados] = useState<{ date: string; name: string }[]>(
    []
  );
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<{
    [data: string]: string[];
  }>({});
  const [horariosDoDia, setHorariosDoDia] = useState<string[]>([]);
  const [novoHorario, setNovoHorario] = useState('');

  const feriadosFixos = [
    '2025-01-01', // Confraternização Universal
    '2025-04-18', // Sexta-feira Santa (exemplo - pode mudar conforme o ano)
    '2025-04-21', // Tiradentes
    '2025-05-01', // Dia do Trabalho
    '2025-09-07', // Independência
    '2025-10-12', // Nossa Senhora Aparecida
    '2025-11-02', // Finados
    '2025-11-15', // Proclamação da República
    '2025-12-25', // Natal
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
      if (
        helpModalRef.current &&
        !helpModalRef.current.contains(event.target as Node)
      ) {
        setIsHelpModalOpen(false);
      }
      if (
        notificationsMenuRef.current &&
        !notificationsMenuRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const feriadosDoAno = hd.getHolidays(new Date().getFullYear());
    const formatados = feriadosDoAno.map((f) => ({
      date: f.date.split('T')[0],
      name: f.name,
    }));
    setFeriados(formatados);

    // Filtra os feriados do mês atual
    const mesAtual = new Date().getMonth(); // Pega o mês atual (0 a 11)
    const feriadosDoMes = formatados.filter(
      (f) => new Date(f.date).getMonth() === mesAtual
    );
    setFeriadosDoMes(feriadosDoMes);
  }, []);

  useEffect(() => {
    const mes = mesVisivel.getMonth();
    const ano = mesVisivel.getFullYear();

    const feriadosMes = feriados.filter((f) => {
      const data = new Date(f.date);
      return data.getMonth() === mes && data.getFullYear() === ano;
    });

    setFeriadosMesVisivel(feriadosMes);
  }, [mesVisivel, feriados]);

  useEffect(() => {
    axios
      .get(`/api/professores/${id}`)
      .then((res) => {
        setProfessor(res.data);
      })
      .catch((err) => {
        console.error(err);
        setErro('Erro ao carregar dados do professor.');
      });

    axios
      .get(`/api/professores`)
      .then((res) => {
        setTodosProfessores(res.data);
      })
      .catch((err) => {
        console.error('Erro ao buscar todos professores:', err);
      });

    axios
      .get(`/api/professores/${id}/turmas`)
      .then((res) => {
        setTurmasDoProfessor(res.data);
      })
      .catch((err) => {
        console.error('Erro ao carregar turmas do professor:', err);
      });
  }, [id]);

  const alternarSidebar = () => {
    setSidebarAberta(!sidebarAberta);
  };

  const getFotoUrl = (caminhoRelativo: string | null) =>
    caminhoRelativo
      ? `/${caminhoRelativo}`
      : '/user-icon.png';

  const handleDataChange = (
    value: Date | [Date | null, Date | null] | null
  ) => {
    if (value instanceof Date) {
      setDataSelecionada(value);
      const dataFormatada = value.toISOString().split('T')[0];
      setHorariosDoDia(horariosDisponiveis[dataFormatada] || []);
    }
  };

  const adicionarHorario = () => {
    if (!dataSelecionada || !novoHorario) return;

    const data = dataSelecionada.toISOString().split('T')[0];
    const horarios = horariosDisponiveis[data] || [];

    if (!horarios.includes(novoHorario)) {
      const atualizados = {
        ...horariosDisponiveis,
        [data]: [...horarios, novoHorario],
      };
      setHorariosDisponiveis(atualizados);
      setHorariosDoDia(atualizados[data]);
      setNovoHorario('');
    }
  };

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
        <TopbarGestorAuto
          isMenuOpen={sidebarAberta}
          setIsMenuOpen={setSidebarAberta}
        />

        {erro && <p className="visualizar-error-message">{erro}</p>}

        {professor && (
          <>
            <div className="visualizar-layout">
              {/* PERFIL PRINCIPAL */}
              <div className="perfil-principal">
                {/* FOTO E INFORMAÇÕES */}
                <div className="perfil-banner">
                  <div className="foto-circular">
                    {professor.foto_url && (
                      <img
                        src={getFotoUrl(professor.foto_url)}
                        alt="Foto do professor"
                        className="visualizar-imagem-perfil"
                      />
                    )}
                  </div>
                </div>

                {/* INFORMAÇÕES DO PERFIL */}
                <div className="perfil-info">
                  <div className="perfil-info-conteudo">
                    <div className="perfil-info-coluna-esquerda">
                      <h2>{professor.nome}</h2>
                      <p>
                        <strong>Login:</strong> {professor.login}
                      </p>
                      <p>
                        <strong>Email:</strong> {professor.email}
                      </p>
                      <p>
                        <strong>Telefone:</strong> (31) 99999-9999{' '}
                      </p>
                      <p>
                        <strong>Formação:</strong> Bacharel em engenharia de
                        Sistemas{' '}
                      </p>
                      <p>
                        <strong>Matéria:</strong> Tecnologia da Informação
                      </p>
                    </div>

                    <div className="perfil-info-col-di-e-biografia">
                      {/* Coluna de botões */}
                      <div className="perfil-info-coluna-direita">
                        <ProfPerfilActions />
                      </div>

                      {/* Biografia */}
                      <div className="Biografia-perfil">
                        <div className="Biografia-dados">
                          <h3>Biografia</h3>
                          <p>
                            {professor.biografia} Professor dedicado e
                            desenvolvedor fullstack apaixonado por inovação na
                            educação. Atua com jovens de 15 a 24 anos,
                            utilizando metodologias ativas e tecnologias como
                            React, Node.js e Unreal Engine para transformar o
                            aprendizado em experiências envolventes. Fundador de
                            um sistema de gestão escolar completo, também
                            trabalha com projetos de Metaverso e Realidade
                            Virtual para o ensino médio, desenvolvendo ambientes
                            imersivos e interativos nas áreas de Química,
                            Física, Biologia e muito mais.{' '}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OUTROS PROFESSORES */}
              <div className="perfil-lateral">
                <OtherProfs
                  todosProfessores={todosProfessores}
                  getFotoUrl={getFotoUrl}
                />
              </div>
            </div>

            {/* CARD DE HORÁRIOS DISPONÍVEIS */}
            <div className="professor-disponibilidade-card">
              <h3>Disponibilidade de Horários</h3>
              <div className="calendar-wrapper">
                <CalendarUsers
                  dataSelecionada={dataSelecionada}
                  handleDataChange={handleDataChange}
                  mesVisivel={mesVisivel}
                  setMesVisivel={setMesVisivel}
                  feriadosFixos={feriadosFixos}
                  feriadosMesVisivel={feriadosMesVisivel}
                />
              </div>
              {/* CARD DE TURMAS ASSOCIADAS */}
              <TurmasList turmasDoProfessor={turmasDoProfessor} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisualizarProfessorPage;
