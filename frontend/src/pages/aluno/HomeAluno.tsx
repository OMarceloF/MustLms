import SmallChart from '../gestor/components/SmallChart';
import LargeChart from '../gestor/components/LargeChart';
import BottomChart from '../gestor/components/BottomChart';
import MiniCalendar from '../../components/MiniCalendar';
import Anuncios from '../gestor/components/Anuncios';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UsuariosOnlineCard from '../gestor/components/UsuarioOnlineCard';
import TabelaBoletim from '../gestor/TabelaBoletim';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import.meta.env.VITE_API_URL

interface Subject {
  id: number;
  name: string;
  grades: number[]; // vamos simular por enquanto
  finalGrade: number;
  attendance: number;
  status: string;
}

interface Profile {
  id: number;
  type: 'student' | 'teacher';
  avatar: string;
  name: string;
  email: string;
  registration: string;
  series: string;
  formation?: string;
  biography?: string;
}

const etapasPorTipo = {
  bimestre: 4,
  trimestre: 3,
  semestre: 2,
};


const HomeAluno = () => {
  const [evolucaoDisciplinas, setEvolucaoDisciplinas] = useState<
    { nome: string; notas: number[] }[]
  >([]);
  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [tipoAvaliacao, setTipoAvaliacao] = useState<
    'bimestre' | 'trimestre' | 'semestre'
  >('bimestre');

  const { user } = useAuth();

  const skillsData = [
    { id: 1, name: 'Participação', value: 75 },
    { id: 2, name: 'Organização', value: 60 },
    { id: 3, name: 'Cooperação', value: 85 },
    { id: 4, name: 'Proatividade', value: 65 },
    { id: 5, name: 'Pontualidade', value: 70 },
    { id: 6, name: 'Comunicação', value: 80 },
  ];

  const currentUser = user;
  const studentId = currentUser?.id;
  const navigate = useNavigate();

  const [sidebarAberta, setSidebarAberta] = useState(false);

  const role = currentUser?.role ?? '';
  const showSidebar = !['responsavel', 'aluno'].includes(role);
  const [totalAlunos, setTotalAlunos] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalAlunos = async () => {
      try {
        const response = await axios.get(`/api/dashboard/contar-alunos`);
        setTotalAlunos(response.data.total);
      } catch (error) {
        console.error("Erro ao buscar total de alunos:", error);
      }
    };

    fetchTotalAlunos();
  }, []);

  const [totalFuncionarios, setTotalFuncionarios] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalFuncionarios = async () => {
      try {
        const response = await axios.get(`/api/dashboard/contar-funcionarios`);
        setTotalFuncionarios(response.data.totalF);
      } catch (error) {
        console.error("Erro ao buscar total de funcionarios:", error);
      }
    };

    fetchTotalFuncionarios();
  }, []);

  const [totalResponsaveis, setTotalResponsaveis] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalResponsaveis = async () => {
      try {
        const response = await axios.get(`/api/dashboard/contar-responsaveis`);
        setTotalResponsaveis(response.data.totalR);
      } catch (error) {
        console.error("Erro ao buscar total de responsaveis:", error);
      }
    };

    fetchTotalResponsaveis();
  }, []);

  const [verificacaoExecutada, setVerificacaoExecutada] = useState(false);

  const [verificou, setVerificou] = useState(false);

  useEffect(() => {
    if (!verificou) {
      axios.get(`/api/verificacoes`)
        .then(() => {
          console.log('✅ Verificações executadas com sucesso ao entrar no painel do gestor.');
          setVerificou(true);
        })
        .catch((err) => {
          console.error('❌ Erro ao executar verificações:', err);
        });
    }
  }, [verificou]);

  useEffect(() => {
    if (!studentId) return;

    const fetchDados = async () => {
      setLoadingProfile(true);
      try {
        // 1. Perfil do aluno
        const res = await axios.get<Profile>(`/api/users/${studentId}/profile`);
        setProfile(res.data);

        // 2. Boletim
        const boletimRes = await axios.get(
          `/api/boletim/${studentId}`
        );

        const tipoAvaliacaoBackend =
          boletimRes.data.tipoAvaliacao as 'bimestre' | 'trimestre' | 'semestre';
        setTipoAvaliacao(tipoAvaliacaoBackend);

        const materias = boletimRes.data.materias;
        const qtdEtapas = etapasPorTipo[tipoAvaliacaoBackend];

        // 3. Buscar faltas por etapa
        const faltasRes = await axios.get(`/api/faltas-por-etapa/${studentId}`);
        const faltasPorMateria = faltasRes.data;

        // 4. Buscar frequência (%)
        const frequenciaRes = await axios.get(`/api/frequencia/${studentId}`);
        const frequencias = frequenciaRes.data;

        // 5. Combinar tudo
        const materiasComTudo = materias.map((materia: any) => {
          const faltasEtapas = Array(qtdEtapas).fill(0);
          const registros = faltasPorMateria[materia.id];

          if (registros) {
            registros.forEach((f: { etapa: number; faltas: number }) => {
              if (f.etapa >= 1 && f.etapa <= qtdEtapas) {
                faltasEtapas[f.etapa - 1] = f.faltas;
              }
            });
          }

          return {
            ...materia,
            faltas: faltasEtapas,
            attendance: frequencias[materia.id] ?? 0,
          };
        });

        setSubjectsData(materiasComTudo);

        // 6. Evolução
        const evolucaoConvertida = materias.map((m: any) => ({
          nome: m.name,
          notas: m.grades,
        }));

        setEvolucaoDisciplinas(evolucaoConvertida);
      } catch (err) {
        console.error(err);
        setErrorProfile('Erro ao carregar dados do boletim.');
      } finally {
        setLoadingProfile(false);
      }
    };


    fetchDados();
  }, [studentId]);


  if (loadingProfile) return <div>Carregando dados do usuário…</div>;
  if (errorProfile || !profile)
    return (
      <div className="text-red-600">
        {errorProfile || 'Perfil não encontrado.'}
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-6 py-2 px-2 md:py-4 md:px-4 overflow-x-hidden">
      {/* Coluna principal (esquerda) */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        {/* Cards iniciais */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <div
            className="w-52 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#303030', color: '#ffffff' }}
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#dee3df', color: '#ffffff' }}
              >
                2025
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                0
              </h2>
              <p>Tarefas Pendentes</p>
            </div>
          </div>

          <div className="w-52">
            <UsuariosOnlineCard />
          </div>

          <div
            className="w-52 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#303030', color: '#ffffff' }}
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#dee3df', color: '#ffffff' }}
              >
                2025
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                5%
              </h2>
              <p>Média Geral</p>
            </div>
          </div>



          {/* <div
            className="w-52 rounded-lg p-4 flex flex-col shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#30C9A8', color: 'black' }}
          >
            <div className="flex justify-between items-center mb-4">
              <span
                className="px-2 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#acdde7', color: '#1B263B' }}
              >
                2025
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {totalFuncionarios ?? '...'}
              </h2>
              <p>Funcionários</p>
            </div>
          </div> */}
        </div>


        <div className="bg-white rounded-xl shadow p-4 w-full lg:flex-1 h-56 md:h-72 flex justify-center items-center overflow-hidden text-xs md:text-base">
          <TabelaBoletim
            profile={profile}
            subjectsData={subjectsData}
            tipoAvaliacao={tipoAvaliacao}
          /></div></div>

      {/* Coluna lateral direita */}
      <div className="w-full md:w-1/3 flex flex-col gap-6" >
        <div className="bg-white rounded-xl shadow p-4 min-h-[200px] md:min-h-72 overflow-hidden">
          <MiniCalendar />
        </div>
        <div
          className="bg-white rounded-xl shadow p-4 min-h-[200px] md:min-h-72 border-l-4 overflow-hidden"
          style={{ borderLeftColor: '#1B263B' }}
        >
          <Anuncios />
        </div>
      </div>
    </div>
  );
};

export default HomeAluno
