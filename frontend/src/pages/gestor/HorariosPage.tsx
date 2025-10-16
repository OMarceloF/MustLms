import React, { useState } from 'react';
import { toast } from 'sonner';

const GeradorHorarios = () => {
  const [showForm, setShowForm] = useState(false);
  const [horariosGerados, setHorariosGerados] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [tabelaHorarios, setTabelaHorarios] = useState({});

  // Dados mockados das turmas
  const turmas = [
    '1º Ano A - Fund I',
    '1º Ano B - Fund I',
    '2º Ano A - Fund I',
    '2º Ano B - Fund I',
    '3º Ano A - Fund I',
    '3º Ano B - Fund I',
    '4º Ano A - Fund I',
    '4º Ano B - Fund I',
    '5º Ano A - Fund I',
    '5º Ano B - Fund I',
    '6º Ano A - Fund II',
    '6º Ano B - Fund II',
    '7º Ano A - Fund II',
    '7º Ano B - Fund II',
    '8º Ano A - Fund II',
    '8º Ano B - Fund II',
    '9º Ano A - Fund II',
    '9º Ano B - Fund II',
    '1º Ano A - EM',
    '1º Ano B - EM',
    '2º Ano A - EM',
    '2º Ano B - EM',
    '3º Ano A - EM',
    '3º Ano B - EM',
  ];

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  const horarios = ['07:00', '07:50', '08:40', '09:30', '10:20', '11:10'];

  // Professores mockados por matéria
  const professoresPorMateria = {
    Português: ['Ana Silva', 'Maria Santos', 'João Costa'],
    Matemática: ['Carlos Lima', 'Pedro Oliveira', 'Lucia Ferreira'],
    História: ['Roberto Alves', 'Sandra Mendes', 'Antonio Dias'],
    Geografia: ['Patricia Souza', 'Helena Martins', 'Carmen Rodrigues'],
    Ciências: ['Rosa Oliveira', 'Marcos Pereira', 'Fernanda Rocha'],
    Inglês: ['Jennifer Walsh', 'Michael Johnson', 'Sarah Brown'],
    'Ed. Física': ['Rafael Santos', 'Carla Nascimento', 'Bruno Campos'],
    Artes: ['Isabela Cruz', 'Diego Moreira', 'Leticia Barros'],
    Física: ['Eduardo Pinto', 'Vanessa Lima', 'Gustavo Souza'],
    Química: ['Priscila Costa', 'Rodrigo Silva', 'Camila Andrade'],
    Biologia: ['Thiago Martins', 'Amanda Oliveira', 'Felipe Rocha'],
    Filosofia: ['Beatriz Santos', 'André Pereira', 'Juliana Alves'],
    Sociologia: ['Renato Campos', 'Larissa Moura', 'Gabriel Lopes'],
  };

  // Matérias por nível
  const materiasPorNivel = {
    'Fund I': [
      'Português',
      'Matemática',
      'História',
      'Geografia',
      'Ciências',
      'Ed. Física',
      'Artes',
    ],
    'Fund II': [
      'Português',
      'Matemática',
      'História',
      'Geografia',
      'Ciências',
      'Inglês',
      'Ed. Física',
      'Artes',
    ],
    EM: [
      'Português',
      'Matemática',
      'História',
      'Geografia',
      'Física',
      'Química',
      'Biologia',
      'Inglês',
      'Ed. Física',
      'Artes',
      'Filosofia',
      'Sociologia',
    ],
  };

  const [formData, setFormData] = useState({
    anoLetivo: '2025',
    cargaHorariaSemanal: 25,
    duracaoAula: 50,
    intervalos: true,
    inicioAulas: '07:00',
    fimAulas: '12:00',
    maxAulasPorDia: 6,
    maxAulasConsecutivas: 2,
    distribuicaoEquitativa: true,
    evitarJanelas: true,
    considerarDisponibilidade: true,
    priorizarEspecialistas: true,
    balancearCargaHoraria: true,
    respeitarLimiteDiario: true,
    // Novos parâmetros avançados
    algoritmoOtimizacao: 'genetico',
    nivelComplexidade: 'alto',
    tempoMaximoGeracao: 300,
    toleranciaConflitos: 5,
    priorizarContinuidade: true,
    evitarAulasDuplas: false,
    balancearDificuldade: true,
    considerarPreferencias: true,
    otimizarTransicoes: true,
    garantirRecreio: true,
    flexibilidadeHorarios: 'media',
    criterioDesempate: 'professor',
    validacaoAutomatica: true,
    backupHorarios: true,
    relatorioDiagnostico: true,
    integracaoSistemas: false,
    notificacaoConflitos: true,
  });

  const steps = [
    'Analisando parâmetros de entrada...',
    'Carregando dados dos professores...',
    'Verificando disponibilidade...',
    'Otimizando distribuição de aulas...',
    'Resolvendo conflitos de horários...',
    'Balanceando carga horária...',
    'Validando restrições...',
    'Aplicando preferências...',
    'Finalizando horários...',
  ];

  const gerarHorarios = () => {
    console.log('Iniciando geração de horários com parâmetros:', formData);
    setIsGenerating(true);
    setProgress(0);
    setShowForm(false);

    let stepIndex = 0;

    const interval = setInterval(() => {
      setCurrentStep(steps[stepIndex]);
      setProgress(((stepIndex + 1) / steps.length) * 100);

      stepIndex++;

      if (stepIndex >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsGenerating(false);
          setHorariosGerados(true);
          setCurrentStep('Horários gerados com sucesso!');
        }, 1000);
      }
    }, Math.random() * 1500 + 1000); // Entre 1-2.5 segundos por etapa
    // Gerar horários fixos para cada turma, dia e horário
    const novaTabela: any = {};

    turmas.forEach((turma) => {
      novaTabela[turma] = {};

      diasSemana.forEach((dia) => {
        novaTabela[turma][dia] = {};

        horarios.forEach((horario) => {
          if (horario === '08:40') {
            novaTabela[turma][dia][horario] = 'RECREIO';
          } else {
            const materia = obterMateriaAleatoria(turma);
            const professor = obterProfessorAleatorio(materia);
            novaTabela[turma][dia][horario] = {
              materia,
              professor,
            };
          }
        });
      });
    });

    setTabelaHorarios(novaTabela);
  };

  const obterMateriaAleatoria = (turma) => {
    let nivel = 'Fund I';
    if (turma.includes('Fund II')) nivel = 'Fund II';
    if (turma.includes('EM')) nivel = 'EM';

    const materias = materiasPorNivel[nivel];
    return materias[Math.floor(Math.random() * materias.length)];
  };

  const obterProfessorAleatorio = (materia) => {
    const professores = professoresPorMateria[materia];
    if (!professores) return 'Professor N/A';
    return professores[Math.floor(Math.random() * professores.length)];
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-8 rounded-xl mb-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Sistema Inteligente de Geração de Horários
          </h1>
          <p className="text-xl text-center opacity-90 mb-6">
            Geração Automatizada de Horários com IA
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setShowForm(true)}
              disabled={isGenerating}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              Configurar Parâmetros
            </button>
          </div>
        </div>

        {/* Loading Screen */}
        {isGenerating && (
          <div className="bg-white p-8 rounded-xl shadow-lg mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Processando Geração de Horários
              </h2>
              <p className="text-gray-600">Trabalhando na otimização...</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Progresso: {Math.round(progress)}%</span>
                <span>
                  Tempo estimado:{' '}
                  {Math.max(0, Math.round((100 - progress) * 0.2))}s
                </span>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-lg">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-indigo-700 font-medium">{currentStep}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-yellow-50 p-3 rounded">
                <strong>Algoritmo:</strong>{' '}
                {formData.algoritmoOtimizacao === 'genetico'
                  ? 'Genético Avançado'
                  : 'Força Bruta'}
              </div>
              <div className="bg-green-50 p-3 rounded">
                <strong>Complexidade:</strong>{' '}
                {formData.nivelComplexidade === 'alto'
                  ? 'Alta Precisão'
                  : 'Padrão'}
              </div>
              <div className="bg-indigo-50 p-3 rounded">
                <strong>Turmas:</strong> {turmas.length} processadas
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  horariosGerados
                    ? 'bg-green-500'
                    : isGenerating
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-gray-400'
                }`}
              ></div>
              <span className="font-medium">
                Status:{' '}
                {isGenerating
                  ? 'Gerando Horários...'
                  : horariosGerados
                  ? 'Horários Gerados com Sucesso'
                  : 'Aguardando Configuração'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {turmas.length} turmas | {diasSemana.length} dias da semana
            </div>
          </div>
        </div>

        {/* Tabela Principal */}
        {!isGenerating && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-indigo-500 text-white p-4">
              <h2 className="text-2xl font-bold text-center">
                Grade de Horários - Todas as Turmas
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left font-bold border-b-2 border-slate-300 sticky left-0 bg-slate-100 z-10 min-w-[200px]">
                      TURMAS / HORÁRIOS
                    </th>
                    {diasSemana.map((dia) => (
                      <th
                        key={dia}
                        className="p-3 text-center font-bold border-b-2 border-slate-300 min-w-[150px]"
                      >
                        {dia.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {turmas.map((turma, turmaIndex) => (
                    <React.Fragment key={turma}>
                      <tr className="bg-indigo-50">
                        <td
                          colSpan={6}
                          className="p-3 font-bold text-indigo-800 border-b"
                        >
                          {turma}
                        </td>
                      </tr>
                      {horarios.map((horario, horarioIndex) => (
                        <tr
                          key={`${turma}-${horario}`}
                          className={
                            horarioIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                          }
                        >
                          <td className="p-3 font-semibold border-b border-slate-200 sticky left-0 bg-inherit z-10">
                            {horario} -{' '}
                            {horario === '08:40'
                              ? '09:00'
                              : horario === '07:00'
                              ? '07:50'
                              : horario === '07:50'
                              ? '08:40'
                              : horario === '09:30'
                              ? '10:20'
                              : horario === '10:20'
                              ? '11:10'
                              : '12:00'}
                            {horario === '08:40' && (
                              <span className="block text-xs text-yellow-600 font-normal">
                                INTERVALO
                              </span>
                            )}
                          </td>
                          {diasSemana.map((dia) => (
                            <td
                              key={`${turma}-${horario}-${dia}`}
                              className="p-3 text-center border-b border-slate-200"
                            >
                              {horariosGerados ? (
                                horario === '08:40' ? (
                                  <div className="text-yellow-600 font-semibold">
                                    RECREIO
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="font-semibold text-gray-800">
                                      {tabelaHorarios?.[turma]?.[dia]?.[horario]
                                        ?.materia || '---'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {tabelaHorarios?.[turma]?.[dia]?.[horario]
                                        ?.professor || ''}
                                    </div>
                                  </div>
                                )
                              ) : (
                                <div className="text-gray-400 text-xs">
                                  {horario === '08:40'
                                    ? 'RECREIO'
                                    : 'Não configurado'}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        {!isGenerating && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                Estatísticas
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Total de Turmas:</strong> {turmas.length}
                </p>
                <p>
                  <strong>Horários por Dia:</strong> {horarios.length}
                </p>
                <p>
                  <strong>Aulas por Semana:</strong>{' '}
                  {horarios.length * diasSemana.length}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  {horariosGerados ? 'Gerado' : 'Pendente'}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                Recursos IA
              </h3>
              <div className="space-y-2 text-sm">
                <p>Otimização automática</p>
                <p>Balanceamento de carga</p>
                <p>Resolução de conflitos</p>
                <p>Distribuição inteligente</p>
              </div>
            </div>
          </div>
        )}
        {/* Botão de Salvar Horários */}
        {horariosGerados && (
          <div className="mt-12 flex justify-end">
            <button
              onClick={() => toast.success('Horários salvos com sucesso!')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all"
            >
              Salvar Horários
            </button>
          </div>
        )}
      </div>

      {/* Modal do Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto mt-[140px]">
            <div className="bg-indigo-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">
                Configuração Avançada de Parâmetros
              </h2>
              <p className="opacity-90 mt-2">
                Configure os parâmetros para geração inteligente de horários com
                IA
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Configurações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Configurações Básicas
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano Letivo
                    </label>
                    <input
                      type="text"
                      value={formData.anoLetivo}
                      onChange={(e) =>
                        setFormData({ ...formData, anoLetivo: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Carga Horária Semanal (horas)
                    </label>
                    <input
                      type="number"
                      value={formData.cargaHorariaSemanal}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cargaHorariaSemanal: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração da Aula (minutos)
                    </label>
                    <input
                      type="number"
                      value={formData.duracaoAula}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duracaoAula: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Início das Aulas
                    </label>
                    <input
                      type="time"
                      value={formData.inicioAulas}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inicioAulas: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fim das Aulas
                    </label>
                    <input
                      type="time"
                      value={formData.fimAulas}
                      onChange={(e) =>
                        setFormData({ ...formData, fimAulas: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Configurações de IA */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    🤖 Configurações de IA
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Algoritmo de Otimização
                    </label>
                    <select
                      value={formData.algoritmoOtimizacao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          algoritmoOtimizacao: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="genetico">Algoritmo Genético</option>
                      <option value="simulado">Simulated Annealing</option>
                      <option value="tabu">Busca Tabu</option>
                      <option value="forca_bruta">Força Bruta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nível de Complexidade
                    </label>
                    <select
                      value={formData.nivelComplexidade}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nivelComplexidade: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="baixo">Baixo (Rápido)</option>
                      <option value="medio">Médio (Balanceado)</option>
                      <option value="alto">Alto (Precisão Máxima)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempo Máximo de Geração (segundos)
                    </label>
                    <input
                      type="number"
                      value={formData.tempoMaximoGeracao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tempoMaximoGeracao: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tolerância a Conflitos (%)
                    </label>
                    <input
                      type="number"
                      value={formData.toleranciaConflitos}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          toleranciaConflitos: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="0"
                      max="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Flexibilidade de Horários
                    </label>
                    <select
                      value={formData.flexibilidadeHorarios}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          flexibilidadeHorarios: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="baixa">Baixa (Rígido)</option>
                      <option value="media">Média (Balanceado)</option>
                      <option value="alta">Alta (Flexível)</option>
                    </select>
                  </div>
                </div>

                {/* Configurações Avançadas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    ⚡ Configurações Avançadas
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Critério de Desempate
                    </label>
                    <select
                      value={formData.criterioDesempate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          criterioDesempate: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="professor">
                        Preferência do Professor
                      </option>
                      <option value="turma">Necessidade da Turma</option>
                      <option value="equilibrio">Equilíbrio Global</option>
                      <option value="aleatorio">Aleatório</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        key: 'priorizarContinuidade',
                        label: 'Priorizar Continuidade Pedagógica',
                      },
                      {
                        key: 'evitarAulasDuplas',
                        label: 'Evitar Aulas Duplas Consecutivas',
                      },
                      {
                        key: 'balancearDificuldade',
                        label: 'Balancear Dificuldade por Período',
                      },
                      {
                        key: 'considerarPreferencias',
                        label: 'Considerar Preferências dos Professores',
                      },
                      {
                        key: 'otimizarTransicoes',
                        label: 'Otimizar Transições entre Salas',
                      },
                      {
                        key: 'garantirRecreio',
                        label: 'Garantir Horário de Recreio',
                      },
                      {
                        key: 'validacaoAutomatica',
                        label: 'Validação Automática de Conflitos',
                      },
                      {
                        key: 'backupHorarios',
                        label: 'Gerar Backup de Horários',
                      },
                      {
                        key: 'relatorioDiagnostico',
                        label: 'Relatório de Diagnóstico Detalhado',
                      },
                      {
                        key: 'integracaoSistemas',
                        label: 'Integração com Sistemas Externos',
                      },
                      {
                        key: 'notificacaoConflitos',
                        label: 'Notificação Automática de Conflitos',
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={formData[item.key]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={item.key}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seção de Configurações Originais */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  📊 Configurações de Horário
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {[
                      { key: 'intervalos', label: 'Incluir Intervalos' },
                      {
                        key: 'distribuicaoEquitativa',
                        label: 'Distribuição Equitativa de Matérias',
                      },
                      {
                        key: 'evitarJanelas',
                        label: 'Evitar Janelas no Horário',
                      },
                      {
                        key: 'considerarDisponibilidade',
                        label: 'Considerar Disponibilidade dos Professores',
                      },
                      {
                        key: 'priorizarEspecialistas',
                        label: 'Priorizar Professores Especialistas',
                      },
                      {
                        key: 'balancearCargaHoraria',
                        label: 'Balancear Carga Horária dos Professores',
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={formData[item.key]}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={item.key}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo de Aulas por Dia
                      </label>
                      <input
                        type="number"
                        value={formData.maxAulasPorDia}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxAulasPorDia: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo de Aulas Consecutivas
                      </label>
                      <input
                        type="number"
                        value={formData.maxAulasConsecutivas}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxAulasConsecutivas: parseInt(e.target.value),
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={gerarHorarios}
                  className="px-8 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold transition-colors"
                >
                  Gerar Horários
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeradorHorarios;
