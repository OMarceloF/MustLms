import React, { useEffect, useState, useMemo } from 'react';
import SidebarGestor from './components/Sidebar';
import TopbarGestorAuto from './components/TopbarGestorAuto';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const TurmaHorarios = () => {
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const { user } = useAuth();
  const currentUser = user;
  const role = currentUser?.role ?? '';
  const showSidebar = !['responsavel', 'aluno'].includes(role);
  const navigate = useNavigate();
  // Dados da turma
  const turmaInfo = {
    nome: '1º Ano B',
    ano: '2025',
    turno: 'Matutino',
    totalAlunos: 32,
    coordenadora: 'Profª. Maria Silva',
  };

  // Horários das aulas (apenas manhã)
  const horarios = [
    {
      horario: '07:00 - 07:50',
      segunda: 'Historia',
      terca: 'Sociologia',
      quarta: 'Geografia',
      quinta: 'Portugues',
      sexta: 'Matematica',
    },
    {
      horario: '07:50 - 08:40',
      segunda: 'Matematica',
      terca: 'Portugues',
      quarta: 'Ingles',
      quinta: 'Geografia',
      sexta: 'Biologia',
    },
    {
      horario: '08:40 - 09:00',
      segunda: 'INTERVALO',
      terca: 'INTERVALO',
      quarta: 'INTERVALO',
      quinta: 'INTERVALO',
      sexta: 'INTERVALO',
    },
    {
      horario: '09:00 - 09:50',
      segunda: 'Literatura',
      terca: 'Matematica',
      quarta: 'Sociologia',
      quinta: 'Artes',
      sexta: 'Ed. Fisica',
    },
    {
      horario: '09:50 - 10:40',
      segunda: 'Literatura',
      terca: 'Filosofia',
      quarta: 'Portugues',
      quinta: 'Artes',
      sexta: 'Matematica',
    },
    {
      horario: '10:40 - 11:30',
      segunda: 'Matematica',
      terca: 'Portugues',
      quarta: 'Sociologia',
      quinta: 'Filosofia',
      sexta: 'Geografia',
    },
    {
      horario: '11:30 - 12:20',
      segunda: 'Biologia',
      terca: 'Ingles',
      quarta: 'Geografia',
      quinta: 'Portugues',
      sexta: 'Matematica',
    },
  ];

  // Professores por matéria
  const professores = {
    Matematica: 'Prof. João Santos',
    Portugues: 'Profª. Ana Costa',
    Fisica: 'Prof. Carlos Lima',
    Quimica: 'Profª. Rosa Oliveira',
    Historia: 'Prof. Pedro Silva',
    Biologia: 'Profª. Lucia Ferreira',
    Geografia: 'Prof. Roberto Alves',
    Ingles: 'Profª. Patricia Souza',
    'Ed. Fisica': 'Prof. Marcos Pereira',
    Artes: 'Profª. Carmen Rodrigues',
    Sociologia: 'Prof. Antonio Dias',
    Filosofia: 'Profª. Helena Martins',
    Literatura: 'Profª. Sandra Mendes',
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={`dashboard-container flex min-h-screen w-full overflow-x-hidden pl-4 ${showSidebar ? 'md:pl-15' : 'md:pl-0'}`} >
      {/* Sidebar fixa à esquerda, só para gestores e outros perfis ≠ responsável/aluno */}
      {showSidebar && (
        <SidebarGestor
          isMenuOpen={sidebarAberta}
          setActivePage={(page: string) =>
            navigate('/gestor', { state: { activePage: page } })
          }
          handleMouseEnter={() => setSidebarAberta(true)}
          handleMouseLeave={() => setSidebarAberta(false)}
        />
      )}
      {/* Conteúdo principal com Topbar */}
      <div className={`flex-1 ${!showSidebar ? 'px-0' : 'container mx-auto px-4'} py-6`} >
        <TopbarGestorAuto isMenuOpen={sidebarAberta} setIsMenuOpen={setSidebarAberta} />

        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho da Escola */}
          <div className="bg-indigo-700 text-white p-8 rounded-xl mt-8 mb-8 text-center shadow-lg">
            <h2 className="text-3xl mb-4 opacity-90">{turmaInfo.nome}</h2>
            <div className="flex justify-center gap-12 flex-wrap">
              <div>
                <p className="text-sm opacity-80 mb-1">Ano Letivo</p>
                <p className="text-xl font-bold">{turmaInfo.ano}</p>
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">Turno</p>
                <p className="text-xl font-bold">{turmaInfo.turno}</p>
              </div>
              <div>
                <p className="text-sm opacity-80 mb-1">Total de Alunos</p>
                <p className="text-xl font-bold">{turmaInfo.totalAlunos}</p>
              </div>
            </div>
          </div>

          {/* Tabela de Horários */}
          <div className="bg-white rounded-xl shadow-lg">
            {/* wrapper com scroll horizontal */}
            <div className="overflow-x-auto">
              <div className="bg-indigo-500 text-white p-6 text-center">
                <h3 className="text-2xl font-bold">HORÁRIO DAS AULAS</h3>
              </div>

              
              <table className="table-auto w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-4 text-center font-bold border-b-2 border-slate-300 text-gray-700 w-[15%]">
                      HORÁRIO
                    </th>
                    <th className="p-4 text-center font-bold border-b-2 border-slate-300 text-gray-700 w-[17%]">
                      SEGUNDA
                    </th>
                    <th className="p-4 text-center font-bold border-b-2 border-slate-300 text-gray-700 w-[17%]">
                      TERÇA
                    </th>
                    <th className="p-4 text-center font-bold border-b-2 border-slate-300 text-gray-700 w-[17%]">
                      QUARTA
                    </th>
                    <th className="p-4 text-center font-bold border-b-2 border-slate-300 text-gray-700 w-[17%]">
                      QUINTA
                    </th>
                    <th className="p-4 text-center font-bold border-b-2 border-slate-300 text-gray-700 w-[17%]">
                      SEXTA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((linha, index) => (
                    <tr
                      key={index}
                      className={
                        linha.segunda === 'INTERVALO'
                          ? 'bg-yellow-100'
                          : index % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50'
                      }
                    >
                      <td className="p-4 text-center font-bold border-b border-slate-300 bg-slate-100 text-gray-700">
                        {linha.horario}
                      </td>
                      <td
                        className={`p-4 text-center border-b border-slate-300 ${linha.segunda === 'INTERVALO'
                          ? 'font-bold text-yellow-600'
                          : 'text-gray-700'
                          }`}
                      >
                        {linha.segunda === 'INTERVALO' ? (
                          <div>
                            <div className="text-base font-bold">INTERVALO</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold mb-1">{linha.segunda}</div>
                            <div className="text-xs text-gray-500">
                              {
                                professores[
                                linha.segunda as keyof typeof professores
                                ]
                              }
                            </div>
                          </div>
                        )}
                      </td>
                      <td
                        className={`p-4 text-center border-b border-slate-300 ${linha.terca === 'INTERVALO'
                          ? 'font-bold text-yellow-600'
                          : 'text-gray-700'
                          }`}
                      >
                        {linha.terca === 'INTERVALO' ? (
                          <div>
                            <div className="text-base font-bold">INTERVALO</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold mb-1">{linha.terca}</div>
                            <div className="text-xs text-gray-500">
                              {
                                professores[
                                linha.terca as keyof typeof professores
                                ]
                              }
                            </div>
                          </div>
                        )}
                      </td>
                      <td
                        className={`p-4 text-center border-b border-slate-300 ${linha.quarta === 'INTERVALO'
                          ? 'font-bold text-yellow-600'
                          : 'text-gray-700'
                          }`}
                      >
                        {linha.quarta === 'INTERVALO' ? (
                          <div>
                            <div className="text-base font-bold">INTERVALO</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold mb-1">{linha.quarta}</div>
                            <div className="text-xs text-gray-500">
                              {
                                professores[
                                linha.quarta as keyof typeof professores
                                ]
                              }
                            </div>
                          </div>
                        )}
                      </td>
                      <td
                        className={`p-4 text-center border-b border-slate-300 ${linha.quinta === 'INTERVALO'
                          ? 'font-bold text-yellow-600'
                          : 'text-gray-700'
                          }`}
                      >
                        {linha.quinta === 'INTERVALO' ? (
                          <div>
                            <div className="text-base font-bold">INTERVALO</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold mb-1">{linha.quinta}</div>
                            <div className="text-xs text-gray-500">
                              {
                                professores[
                                linha.quinta as keyof typeof professores
                                ]
                              }
                            </div>
                          </div>
                        )}
                      </td>
                      <td
                        className={`p-4 text-center border-b border-slate-300 ${linha.sexta === 'INTERVALO'
                          ? 'font-bold text-yellow-600'
                          : 'text-gray-700'
                          }`}
                      >
                        {linha.sexta === 'INTERVALO' ? (
                          <div>
                            <div className="text-base font-bold">INTERVALO</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold mb-1">{linha.sexta}</div>
                            <div className="text-xs text-gray-500">
                              {
                                professores[
                                linha.sexta as keyof typeof professores
                                ]
                              }
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mt-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h4 className="text-xl font-bold text-gray-700 border-b-2 border-indigo-500 pb-2 mb-4">
                  Resumo Semanal
                </h4>
                <div className="space-y-3">
                  <p>
                    <strong>Total de Aulas:</strong> 30 aulas/semana
                  </p>
                  <p>
                    <strong>Carga Horária:</strong> 25 horas/semana
                  </p>
                  <p>
                    <strong>Disciplinas:</strong> 13 matérias
                  </p>
                  <p>
                    <strong>Intervalo:</strong> 08:40 às 09:00 (20 min)
                  </p>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="text-center mt-12 p-4 text-gray-500 text-sm">
              <p>HubTechLabs - Ano Letivo {turmaInfo.ano}</p>
              <p className="mt-2">
                Este horário pode sofrer alterações mediante comunicação prévia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurmaHorarios;
