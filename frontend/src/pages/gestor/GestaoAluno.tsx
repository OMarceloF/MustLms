import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import EvolucaoAluno from '../gestor/components/ui/EvolucaoAluno';
import axios from 'axios';
axios.defaults.baseURL = `/`;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import TabelaBoletim from './TabelaBoletim';
import { Check, X, AlertTriangle, CalendarCheck, BellRing } from 'lucide-react';
import SidebarGestor from '../gestor/components/Sidebar';
import SidebarAluno from '../aluno/components/sidebaraluno';
import { useAuth } from '../../hooks/useAuth'; // se estiver usando autenticação

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

function getSafeImagePath(path: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i;
  return regex.test(path) ? `/${path}` : null;
}

function getSafeExternalUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const trustedHosts = ['ui-avatars.com', 'cdn.seusite.com'];

    if (
      parsed.protocol === 'https:' &&
      trustedHosts.includes(parsed.hostname)
    ) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}

const etapasPorTipo = {
  bimestre: 4,
  trimestre: 3,
  semestre: 2,
};

const GestaoAluno = () => {
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

  const { id } = useParams<{ id: string }>();
  const studentId = id; // esse é o ID do aluno vindo da rota
  const navigate = useNavigate();
  const currentUser = user;
  const role = currentUser?.role ?? '';
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const handleMouseEnter = () => setSidebarAberta(true);
  const handleMouseLeave = () => setSidebarAberta(false);

  const showSidebarAluno = role === 'aluno';



  const showSidebar = !['responsavel', 'aluno'].includes(role);

  useEffect(() => {
    if (!studentId) return;

    const fetchDados = async () => {
      setLoadingProfile(true);
      try {
        // 1. Perfil do aluno
        const res = await axios.get<Profile>(`/api/users/${studentId}/profile`);
        setProfile(res.data);

        // 2. Boletim
        const boletimRes = await axios.get(`/api/boletim/${studentId}`
        );

        const tipoAvaliacaoBackend = boletimRes.data.tipoAvaliacao as
          | 'bimestre'
          | 'trimestre'
          | 'semestre';
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
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {showSidebar && (
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) =>
            navigate('/gestor', { state: { activePage: page } })
          }
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}

      {/* Sidebar específica para alunos */}
      {showSidebarAluno && (
        <SidebarAluno
          isMenuOpen={sidebarAberta}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}

      {/* Conteúdo principal com Topbar */}
      <div className="flex-1 mt-[60px] px-2 sm:px-4">
        <TopbarGestorAuto
          isMenuOpen={sidebarAberta}
          setIsMenuOpen={setSidebarAberta}
        />

        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-2 sm:px-4">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Boletim Escolar
              </h1>
              <p className="text-gray-600">Gerenciamento de notas do aluno</p>
            </header>

            <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-4">
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {profile.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Matrícula: {profile.registration} | {profile.series} |
                        Ano Letivo: {new Date().getFullYear()}
                      </p>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      <CalendarCheck className="h-3.5 w-3.5 mr-1" />
                      Atualizado em 10/05/2025
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              <Card className="col-span-1">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    {(() => {
                      const avatar =
                        getSafeImagePath(profile.avatar || '') ||
                        getSafeExternalUrl(profile.avatar || '');

                      return avatar ? (
                        <div className="h-16 w-16 rounded-full overflow-hidden mb-3 md:h-24 md:w-24">
                          <img
                            src={avatar}
                            alt={profile.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center mb-3 md:h-24 md:w-24">
                          <span className="text-white font-bold text-xl">
                            {profile.name?.substring(0, 2).toUpperCase() ||
                              'US'}
                          </span>
                        </div>
                      );
                    })()}

                    <h3 className="font-semibold text-gray-900 text-center">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-gray-500 text-center">
                      {profile.series}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="boletim">
              <div className="overflow-x-auto mb-6">
                <TabsList className="flex gap-2 whitespace-nowrap">
                  <TabsTrigger
                    value="boletim"
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-400 rounded-md data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:font-semibold transition"
                  >
                    Boletim
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="overflow-x-auto">
                <TabelaBoletim
                  profile={profile}
                  subjectsData={subjectsData}
                  tipoAvaliacao={tipoAvaliacao}
                />
              </div>

              <TabsContent value="evolucao">
                <Card>
                  <CardContent>
                    <EvolucaoAluno
                      skillsData={skillsData}
                      evolucaoDisciplinas={evolucaoDisciplinas}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <footer className="mt-12 text-center text-sm text-gray-500 pb-8">
              <p>
                Sistema de Gestão Escolar © 2025 | Todos os direitos reservados
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestaoAluno;
