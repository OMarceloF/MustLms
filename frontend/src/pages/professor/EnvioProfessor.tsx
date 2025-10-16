'use client';

import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import React, { useState, useEffect } from 'react';


// Tipos para as questões
interface Alternativa {
  id: string;
  texto: string;
  correta: boolean;
}

interface Questao {
  id: string;
  tipo: 'multipla_escolha' | 'verdadeiro_falso' | 'aberta' | 'numerica';
  enunciado: string;
  valor: number;
  alternativas?: Alternativa[];
  respostaCorreta?: string | number | boolean;
  explicacao?: string;
}

interface ExercicioOnline {
  id: string;
  titulo: string;
  descricao: string;
  questoes: Questao[];
  tempoLimite?: number; // em minutos
  tentativasPermitidas: number;
  mostrarResultadoImediato: boolean;
  embaralharQuestoes: boolean;
}

interface Envio {
  id: number;
  titulo: string;
  descricao: string;
  tipo: string;
  arquivo_url?: string;
  data_criacao: string;
  nome_turma?: string;
  nome_materia?: string;
  turma_id?: number;
  materia_id?: number;
}



export default function ProfessorEnvios() {
  const [tipoConteudo, setTipoConteudo] = useState('');
  const [tipoExercicio, setTipoExercicio] = useState(''); // "tradicional" ou "online"
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [tipoDestinatario, setTipoDestinatario] = useState('turma');
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [abaSelecionada, setAbaSelecionada] = useState('enviar');
  const { user } = useAuth();
  const [turmasProfessor, setTurmasProfessor] = useState<any[]>([]);
  const [materiasProfessor, setMateriasProfessor] = useState<any[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [materiaSelecionada, setMateriaSelecionada] = useState('');
  const [historicoEnvios, setHistoricoEnvios] = useState<any[]>([]);
  const [editandoEnvio, setEditandoEnvio] = useState<Envio | null>(null);
  const [descricao, setDescricao] = useState('');
  const [tipo, setTipo] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [questoesAbertas, setQuestoesAbertas] = useState<any[]>([]);
  const [notaEdicao, setNotaEdicao] = useState<Record<number, string>>({});

  // Estados para exercício online
  const [exercicioOnline, setExercicioOnline] = useState<ExercicioOnline>({
    id: '',
    titulo: '',
    descricao: '',
    questoes: [],
    tentativasPermitidas: 1,
    mostrarResultadoImediato: true,
    embaralharQuestoes: false,
  });

  // Estados para modal de questão
  const [modalQuestaoAberto, setModalQuestaoAberto] = useState(false);
  const [questaoEditando, setQuestaoEditando] = useState<Questao | null>(null);
  const [novaQuestao, setNovaQuestao] = useState<Questao>({
    id: '',
    tipo: 'multipla_escolha',
    enunciado: '',
    valor: 1,
    alternativas: [
      { id: '1', texto: '', correta: false },
      { id: '2', texto: '', correta: false },
      { id: '3', texto: '', correta: false },
      { id: '4', texto: '', correta: false },
    ],
    explicacao: '',
  });

  const carregarQuestoesAbertas = async () => {
    try {
      const res = await fetch(`/api/questoes-abertas/professor/${user.id}`);
      const data = await res.json();
      setQuestoesAbertas(data);
    } catch (err) {
      console.error('Erro ao carregar questões abertas:', err);
    }
  };

  const salvarNota = async (respostaId: number) => {
    const nota = parseFloat(notaEdicao[respostaId]);
    if (isNaN(nota)) return toast.error("Nota inválida.");

    try {
      await fetch(`/api/questoes-abertas/${respostaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota_obtida: nota }),
      });

      setNotaEdicao(prev => ({ ...prev, [respostaId]: '' }));
      await carregarQuestoesAbertas();
    } catch (err) {
      console.error('Erro ao salvar nota:', err);
      toast.error('Erro ao salvar nota.');
    }
  };

  const handleArquivoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArquivo(file);
    }
  };

  const handleTipoConteudoChange = (valor: string) => {
    setTipoConteudo(valor);
    if (valor !== 'Exercício') {
      setTipoExercicio('');
    }
  };

  // Funções para gerenciar questões
  const adicionarQuestao = () => {
    const questao: Questao = {
      ...novaQuestao,
      id: Date.now().toString(),
    };

    setExercicioOnline({
      ...exercicioOnline,
      questoes: [...exercicioOnline.questoes, questao],
    });

    // Reset da nova questão
    setNovaQuestao({
      id: '',
      tipo: 'multipla_escolha',
      enunciado: '',
      valor: 1,
      alternativas: [
        { id: '1', texto: '', correta: false },
        { id: '2', texto: '', correta: false },
        { id: '3', texto: '', correta: false },
        { id: '4', texto: '', correta: false },
      ],
      explicacao: '',
    });

    setModalQuestaoAberto(false);
  };

  const editarQuestao = (questao: Questao) => {
    setQuestaoEditando(questao);
    setNovaQuestao({ ...questao });
    setModalQuestaoAberto(true);
  };

  const salvarEdicaoQuestao = () => {
    if (questaoEditando) {
      setExercicioOnline({
        ...exercicioOnline,
        questoes: exercicioOnline.questoes.map((q) =>
          q.id === questaoEditando.id ? novaQuestao : q
        ),
      });
    }

    setQuestaoEditando(null);
    setNovaQuestao({
      id: '',
      tipo: 'multipla_escolha',
      enunciado: '',
      valor: 1,
      alternativas: [
        { id: '1', texto: '', correta: false },
        { id: '2', texto: '', correta: false },
        { id: '3', texto: '', correta: false },
        { id: '4', texto: '', correta: false },
      ],
      explicacao: '',
    });
    setModalQuestaoAberto(false);
  };

  const removerQuestao = (questaoId: string) => {
    setExercicioOnline({
      ...exercicioOnline,
      questoes: exercicioOnline.questoes.filter((q) => q.id !== questaoId),
    });
  };

  const handleTipoQuestaoChange = (tipo: Questao['tipo']) => {
    let novasAlternativas: Alternativa[] | undefined;

    switch (tipo) {
      case 'multipla_escolha':
        novasAlternativas = [
          { id: '1', texto: '', correta: false },
          { id: '2', texto: '', correta: false },
          { id: '3', texto: '', correta: false },
          { id: '4', texto: '', correta: false },
        ];
        break;
      case 'verdadeiro_falso':
        novasAlternativas = [
          { id: '1', texto: 'Verdadeiro', correta: false },
          { id: '2', texto: 'Falso', correta: false },
        ];
        break;
      default:
        novasAlternativas = undefined;
    }

    setNovaQuestao({
      ...novaQuestao,
      tipo,
      alternativas: novasAlternativas,
      respostaCorreta:
        tipo === 'aberta' || tipo === 'numerica' ? '' : undefined,
    });
  };

  const handleAlternativaChange = (alternativaId: string, texto: string) => {
    if (novaQuestao.alternativas) {
      setNovaQuestao({
        ...novaQuestao,
        alternativas: novaQuestao.alternativas.map((alt) =>
          alt.id === alternativaId ? { ...alt, texto } : alt
        ),
      });
    }
  };

  const handleAlternativaCorretaChange = (alternativaId: string) => {
    if (novaQuestao.alternativas) {
      setNovaQuestao({
        ...novaQuestao,
        alternativas: novaQuestao.alternativas.map((alt) => ({
          ...alt,
          correta: alt.id === alternativaId,
        })),
      });
    }
  };

  const handleEnviar = async () => {
    if (!tipoConteudo || !titulo) {
      return;
    }

    if (
      tipoConteudo === 'Exercício' &&
      tipoExercicio === 'online' &&
      exercicioOnline.questoes.length === 0
    ) {
      return;
    }

    setEnviando(true);

    if (!user.id) {
      toast.error('Aguardando identificação do usuário.');
      return;
    }

    const formData = new FormData();
    const tipoFinal2 =
      tipoConteudo === 'Exercício'
        ? tipoExercicio === 'online'
          ? 'Exercício Online'
          : 'Exercício Tradicional'
        : tipoConteudo;

    if (tipoFinal2 === 'Exercício Online') {
      formData.append('tentativasPermitidas', exercicioOnline.tentativasPermitidas.toString());
      formData.append('tempoLimite', exercicioOnline.tempoLimite?.toString() || '0');
      formData.append('mostrarResultadoImediato', exercicioOnline.mostrarResultadoImediato ? '1' : '0');
      formData.append('embaralharQuestoes', exercicioOnline.embaralharQuestoes ? '1' : '0');
      formData.append('nota_max', calcularPontuacaoTotal().toFixed(2));
      formData.append('questoes', JSON.stringify(exercicioOnline.questoes));
    }

    formData.append('tipo', tipoFinal2);
    formData.append('titulo', titulo);
    formData.append('descricao', conteudo);
    formData.append('destinatario', tipoDestinatario);
    formData.append('usuario_id', user.id.toString());
    formData.append('turma_id', turmaSelecionada);
    formData.append('materia_id', materiaSelecionada);
    if (arquivo) formData.append('arquivo', arquivo);

    // Debug
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await fetch(`/api/criar-envios`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro no envio.');

      console.log('Aviso enviado com sucesso:', result);
      setMensagemSucesso('Aviso enviado com sucesso!');
    } catch (err) {
      console.error(err);
      setMensagemSucesso('Erro ao enviar aviso.');
    }

    // Adicionar ao histórico
    const tipoFinal =
      tipoConteudo === 'Exercício'
        ? tipoExercicio === 'online'
          ? 'Exercício Online'
          : 'Exercício Tradicional'
        : tipoConteudo;

    formData.append('tipo', tipoFinal);

    // Limpar formulário
    setTipoConteudo('');
    setTipoExercicio('');
    setTitulo('');
    setConteudo('');
    setArquivo(null);
    setAlunosSelecionados([]);
    setTipoDestinatario('turma');
    setExercicioOnline({
      id: '',
      titulo: '',
      descricao: '',
      questoes: [],
      tentativasPermitidas: 1,
      mostrarResultadoImediato: true,
      embaralharQuestoes: false,
    });
    setEnviando(false);
    setMensagemSucesso('Conteúdo enviado com sucesso!');

    await fetch(`/api/envios/professor/${user.id}`)
      .then(res => res.json())
      .then(setHistoricoEnvios)
      .catch(err => console.error('Erro ao atualizar histórico:', err));

    // Limpar mensagem de sucesso após 3 segundos
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Aviso':
        return '💬';
      case 'PDF':
        return '📄';
      case 'Exercício Tradicional':
        return '📚';
      case 'Exercício Online':
        return '💻';
      case 'Imagem':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'Aviso':
        return 'bg-blue-100 text-blue-800';
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'Exercício Tradicional':
        return 'bg-green-100 text-green-800';
      case 'Exercício Online':
        return 'bg-purple-100 text-purple-800';
      case 'Imagem':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoQuestaoIcon = (tipo: Questao['tipo']) => {
    switch (tipo) {
      case 'multipla_escolha':
        return '☑️';
      case 'verdadeiro_falso':
        return '❓';
      case 'aberta':
        return '✏️';
      case 'numerica':
        return '#️⃣';
      default:
        return '❓';
    }
  };

  const getTipoQuestaoNome = (tipo: Questao['tipo']) => {
    switch (tipo) {
      case 'multipla_escolha':
        return 'Múltipla Escolha';
      case 'verdadeiro_falso':
        return 'Verdadeiro/Falso';
      case 'aberta':
        return 'Questão Aberta';
      case 'numerica':
        return 'Questão Numérica';
      default:
        return 'Desconhecido';
    }
  };

  const calcularPontuacaoTotal = () => {
    return exercicioOnline.questoes.reduce(
      (total, questao) => total + questao.valor,
      0
    );
  };

  // Função para salvar as alterações do envio
  const handleSalvarEdicao = async () => {
    if (!editandoEnvio) return;
    const formData = new FormData();
    const tipoFinal =
      tipoConteudo === 'Exercício'
        ? tipoExercicio === 'online'
          ? 'Exercício Online'
          : 'Exercício Tradicional'
        : tipoConteudo;

    formData.append('tipo', tipoFinal);
    formData.append('titulo', titulo);
    formData.append('descricao', conteudo);
    formData.append('usuario_id', user.id.toString());
    formData.append('turma_id', turmaSelecionada);
    formData.append('materia_id', materiaSelecionada);
    if (arquivo) formData.append('arquivo', arquivo);

    if (tipoFinal === 'Exercício Online') {
      formData.append('tentativasPermitidas', exercicioOnline.tentativasPermitidas.toString());
      formData.append('tempoLimite', exercicioOnline.tempoLimite?.toString() || '0');
      formData.append('mostrarResultadoImediato', exercicioOnline.mostrarResultadoImediato ? '1' : '0');
      formData.append('embaralharQuestoes', exercicioOnline.embaralharQuestoes ? '1' : '0');
      formData.append('nota_max', calcularPontuacaoTotal().toFixed(2));
      formData.append('questoes', JSON.stringify(exercicioOnline.questoes));
    }
    try {
      const response = await fetch(`/api/envios/${editandoEnvio.id}`, {
        method: 'PUT',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao editar envio.');
      console.log('Envio editado com sucesso:', result);
      setMensagemSucesso('Envio editado com sucesso!');
      setHistoricoEnvios(prev => prev.map(env => env.id === editandoEnvio.id ? { ...env, tipo: tipoConteudo, titulo, descricao: conteudo } : env));
      setEditandoEnvio(null); // Limpa o estado de edição
    } catch (err) {
      console.error(err);
      setMensagemSucesso('Erro ao editar envio.');
    }
  };

  // Função para lidar com a edição de um envio
  const handleEditarEnvio = (envio: Envio) => {
    setEditandoEnvio(envio);
    if (envio.tipo === 'Exercício Online') {
      setTipoConteudo('Exercício');
      setTipoExercicio('online');
    } else if (envio.tipo === 'Exercício Tradicional') {
      setTipoConteudo('Exercício');
      setTipoExercicio('tradicional');
    } else {
      setTipoConteudo(envio.tipo); // PDF, Aviso, Imagem...
      setTipoExercicio('');
    }
    setTitulo(envio.titulo);
    setConteudo(envio.descricao);
    setTurmaSelecionada(envio.turma_id?.toString() || '');
    setMateriaSelecionada(envio.materia_id?.toString() || '');
    // Se houver um arquivo, você pode querer lidar com isso aqui
    setAbaSelecionada('editar');
  };

  const excluirEnvio = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este envio?')) return;

    try {
      await fetch(`/api/envios/${id}`, {
        method: 'DELETE',
      });
      setHistoricoEnvios(prev => prev.filter(envio => envio.id !== id));
    } catch (err) {
      console.error('Erro ao excluir envio:', err);
      toast.error('Erro ao excluir envio.');
    }
  };


  useEffect(() => {
    if (user?.id) {
      fetch(`/api/professores/${user.id}/turmas`)
        .then((res) => res.json())
        .then(setTurmasProfessor)
        .catch((err) => console.error('Erro ao buscar turmas:', err));

      fetch(`/api/professores/${user.id}/materias`)
        .then((res) => res.json())
        .then(setMateriasProfessor)
        .catch((err) => console.error('Erro ao buscar matérias:', err));
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/envios/professor/${user.id}`)
        .then(res => res.json())
        .then(setHistoricoEnvios)
        .catch(err => console.error('Erro ao buscar histórico:', err));
    }
  }, [user]);

  useEffect(() => {
    if (abaSelecionada === 'questoesparacorrigir' && user?.id) {
      carregarQuestoesAbertas();
    }
  }, [abaSelecionada, user]);


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Portal do Professor
          </h1>
          <p className="text-gray-600">
            Envie conteúdos e materiais para seus alunos
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setAbaSelecionada('enviar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${abaSelecionada === 'enviar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Enviar Conteúdo
              </button>

              <button
                onClick={() => setAbaSelecionada('historico')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${abaSelecionada === 'historico'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Histórico de Envios
              </button>

              <button
                onClick={() => setAbaSelecionada('questoesparacorrigir')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${abaSelecionada === 'questoesparacorrigir'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Questões para serem corrigidas
              </button>

              {editandoEnvio && (
                <button
                  onClick={() => setAbaSelecionada('editar')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${abaSelecionada === 'editar'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Editar Envio
                </button>
              )}
            </nav>
          </div>

          <div className="p-6">
            {abaSelecionada === 'enviar' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulário Principal */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Destinatários */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <span>👥</span>
                        Destinatários
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Escolha para quem enviar o conteúdo
                      </p>
                    </div>

                    {/* Selecionar Turma */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Turma
                        </label>
                        <select
                          value={turmaSelecionada}
                          onChange={(e) => setTurmaSelecionada(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione uma turma</option>
                          {turmasProfessor.map((turma) => (
                            <option key={turma.id} value={turma.id}>
                              {turma.nome} - {turma.turno}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selecionar Matéria */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Matéria
                        </label>
                        <select
                          value={materiaSelecionada}
                          onChange={(e) => setMateriaSelecionada(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione a matéria</option>
                          {materiasProfessor.map((materia) => (
                            <option key={materia.id} value={materia.id}>
                              {materia.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* Card Novo Envio */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        Novo Envio
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Preencha as informações do conteúdo que deseja enviar
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      {/* Tipo de Conteúdo */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Tipo de Conteúdo
                        </label>
                        <select
                          value={tipoConteudo}
                          onChange={(e) =>
                            handleTipoConteudoChange(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione o tipo de conteúdo</option>
                          <option value="Aviso">Aviso</option>
                          <option value="PDF">PDF</option>
                          <option value="Exercício">Exercício</option>
                          <option value="Imagem">Imagem</option>
                        </select>
                      </div>

                      {/* Tipo de Exercício */}
                      {tipoConteudo === 'Exercício' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Tipo de Exercício
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="tipoExercicio"
                                value="tradicional"
                                checked={tipoExercicio === 'tradicional'}
                                onChange={(e) =>
                                  setTipoExercicio(e.target.value)
                                }
                                className="mr-2"
                              />
                              <span className="flex items-center gap-2">
                                Exercício Tradicional (arquivo)
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="tipoExercicio"
                                value="online"
                                checked={tipoExercicio === 'online'}
                                onChange={(e) =>
                                  setTipoExercicio(e.target.value)
                                }
                                className="mr-2"
                              />
                              <span className="flex items-center gap-2">
                                Exercício Online (interativo)
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Título */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Título/Assunto
                        </label>
                        <input
                          type="text"
                          placeholder="Digite o título ou assunto"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Conteúdo */}
                      {!(
                        tipoConteudo === 'Exercício' &&
                        tipoExercicio === 'online'
                      ) && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Descrição/Conteúdo
                            </label>
                            <textarea
                              placeholder="Digite a descrição ou conteúdo adicional"
                              rows={5}
                              value={conteudo}
                              onChange={(e) => setConteudo(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}

                      {/* Upload de Arquivo */}
                      {!(
                        tipoConteudo === 'Exercício' &&
                        tipoExercicio === 'online'
                      ) && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Anexar Arquivo (opcional)
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleArquivoUpload}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button className="px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                                📤
                              </button>
                            </div>
                            {arquivo && (
                              <p className="text-sm text-gray-600">
                                Arquivo selecionado: {arquivo.name}
                              </p>
                            )}
                          </div>
                        )}


                    </div>
                  </div>

                  {/* Configuração de Exercício Online */}
                  {tipoConteudo === 'Exercício' &&
                    tipoExercicio === 'online' && (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <span>💻</span>
                            Configuração do Exercício Online
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Configure as opções e questões do exercício
                            interativo
                          </p>
                        </div>
                        <div className="p-6 space-y-6">
                          {/* Configurações Gerais */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Tempo Limite (minutos)
                              </label>
                              <input
                                type="number"
                                placeholder="Ex: 60"
                                value={exercicioOnline.tempoLimite || ''}
                                onChange={(e) =>
                                  setExercicioOnline({
                                    ...exercicioOnline,
                                    tempoLimite: e.target.value
                                      ? Number.parseInt(e.target.value)
                                      : undefined,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Tentativas Permitidas
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={exercicioOnline.tentativasPermitidas}
                                onChange={(e) =>
                                  setExercicioOnline({
                                    ...exercicioOnline,
                                    tentativasPermitidas:
                                      Number.parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={
                                  exercicioOnline.mostrarResultadoImediato
                                }
                                onChange={(e) =>
                                  setExercicioOnline({
                                    ...exercicioOnline,
                                    mostrarResultadoImediato: e.target.checked,
                                  })
                                }
                                className="mr-2"
                              />
                              Mostrar resultado imediatamente após envio
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={exercicioOnline.embaralharQuestoes}
                                onChange={(e) =>
                                  setExercicioOnline({
                                    ...exercicioOnline,
                                    embaralharQuestoes: e.target.checked,
                                  })
                                }
                                className="mr-2"
                              />
                              Embaralhar ordem das questões
                            </label>
                          </div>

                          <hr className="border-gray-200" />

                          {/* Questões */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-medium">
                                  Questões
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {exercicioOnline.questoes.length} questão(ões)
                                  • {calcularPontuacaoTotal()} ponto(s) total
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setQuestaoEditando(null);
                                  setModalQuestaoAberto(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                              >
                                <span>➕</span>
                                Nova Questão
                              </button>
                            </div>

                            {/* Lista de Questões */}
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                              {exercicioOnline.questoes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                  <div className="text-4xl mb-2">📚</div>
                                  <p>Nenhuma questão adicionada ainda</p>
                                  <p className="text-sm">
                                    Clique em "Nova Questão" para começar
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {exercicioOnline.questoes.map(
                                    (questao, index) => (
                                      <div
                                        key={questao.id}
                                        className="border border-gray-200 rounded-lg p-3 space-y-2"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                                Questão {index + 1}
                                              </span>
                                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                                                {getTipoQuestaoIcon(
                                                  questao.tipo
                                                )}
                                                {getTipoQuestaoNome(
                                                  questao.tipo
                                                )}
                                              </span>
                                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                {questao.valor}{' '}
                                                {questao.valor === 1
                                                  ? 'ponto'
                                                  : 'pontos'}
                                              </span>
                                            </div>
                                            <p className="text-sm font-medium line-clamp-2">
                                              {questao.enunciado}
                                            </p>
                                            {questao.alternativas && (
                                              <div className="mt-2 text-xs text-gray-600">
                                                {questao.alternativas.map(
                                                  (alt, i) => (
                                                    <div
                                                      key={alt.id}
                                                      className="flex items-center gap-1"
                                                    >
                                                      <span
                                                        className={
                                                          alt.correta
                                                            ? 'text-green-600 font-medium'
                                                            : ''
                                                        }
                                                      >
                                                        {String.fromCharCode(
                                                          65 + i
                                                        )}
                                                        : {alt.texto}
                                                        {alt.correta && ' ✅'}
                                                      </span>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-1 ml-2">
                                            <button
                                              onClick={() =>
                                                editarQuestao(questao)
                                              }
                                              className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                              ✏️
                                            </button>
                                            <button
                                              onClick={() =>
                                                removerQuestao(questao.id)
                                              }
                                              className="p-1 text-gray-400 hover:text-red-600"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Mensagem de Sucesso */}
                  {mensagemSucesso && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                      <span className="text-green-600">✅</span>
                      <span className="text-green-800">{mensagemSucesso}</span>
                    </div>
                  )}

                  {/* Botão Enviar */}
                  <button
                    onClick={handleEnviar}
                    disabled={
                      !tipoConteudo ||
                      !titulo ||
                      enviando ||
                      !turmaSelecionada ||
                      !materiaSelecionada ||
                      (tipoDestinatario === 'individual' && alunosSelecionados.length === 0) ||
                      (tipoConteudo === 'Exercício' && !tipoExercicio) ||
                      (tipoConteudo === 'Exercício' && tipoExercicio === 'online' && exercicioOnline.questoes.length === 0)
                    }
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {enviando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        Enviar Conteúdo
                      </>
                    )}
                  </button>

                </div>

                {/* Resumo */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        Resumo do Envio
                      </h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Tipo:
                        </label>
                        <div className="flex items-center gap-2">
                          <span>
                            {tipoConteudo &&
                              getTipoIcon(
                                tipoConteudo === 'Exercício' &&
                                  tipoExercicio === 'online'
                                  ? 'Exercício Online'
                                  : tipoConteudo
                              )}
                          </span>
                          <span className="text-sm">
                            {tipoConteudo === 'Exercício' &&
                              tipoExercicio === 'online'
                              ? 'Exercício Online'
                              : tipoConteudo || 'Não selecionado'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Título:
                        </label>
                        <p className="text-sm">{titulo || 'Não informado'}</p>
                      </div>

                      {/* Turma */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Turma:
                        </label>
                        <p className="text-sm">
                          {turmasProfessor.find((t) => t.id.toString() === turmaSelecionada)?.nome || 'Não selecionada'}
                        </p>
                      </div>

                      {/* Matéria */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Matéria:
                        </label>
                        <p className="text-sm">
                          {materiasProfessor.find((m) => m.id.toString() === materiaSelecionada)?.nome || 'Não selecionada'}
                        </p>
                      </div>

                      {tipoConteudo === 'Exercício' &&
                        tipoExercicio === 'online' && (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">
                                Questões:
                              </label>
                              <p className="text-sm">
                                {exercicioOnline.questoes.length} questão(ões)
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">
                                Pontuação Total:
                              </label>
                              <p className="text-sm">
                                {calcularPontuacaoTotal()} ponto(s)
                              </p>
                            </div>
                            {exercicioOnline.tempoLimite && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">
                                  Tempo Limite:
                                </label>
                                <p className="text-sm">
                                  {exercicioOnline.tempoLimite} minutos
                                </p>
                              </div>
                            )}
                          </>
                        )}

                      {!(
                        tipoConteudo === 'Exercício' &&
                        tipoExercicio === 'online'
                      ) && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Arquivo:
                            </label>
                            <p className="text-sm">
                              {arquivo ? arquivo.name : 'Nenhum arquivo'}
                            </p>
                          </div>
                        )}

                    </div>
                  </div>

                </div>
              </div>
            )}

            {abaSelecionada === 'historico' && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <span>🕒</span>
                    Histórico de Envios
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Visualize todos os conteúdos enviados anteriormente
                  </p>
                </div>
                <div className="p-6">
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      {historicoEnvios.map((envio) => (
                        <div
                          key={envio.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {getTipoIcon(envio.tipo)}
                            </span>
                            <div>
                              <h4 className="font-medium">{envio.titulo}</h4>
                              <p className="text-sm text-gray-600">
                                Para: {envio.nome_turma ?? 'Turma não informada'} – {envio.nome_materia ?? 'Matéria não informada'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 text-xs rounded ${getTipoBadgeColor(
                                envio.tipo
                              )}`}
                            >
                              {envio.tipo}
                            </span>
                            <div className="text-right text-sm text-gray-500">
                              <button
                                onClick={() => excluirEnvio(envio.id)}
                                className="text-red-600 hover:underline text-sm px-2 py-1 text-xs rounded"
                              >
                                Excluir
                              </button>
                              <button
                                onClick={() => handleEditarEnvio(envio)}
                                className="text-blue-600 hover:underline text-sm px-2 py-1 text-xs rounded"
                              >
                                Editar
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {abaSelecionada === 'editar' && editandoEnvio && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulário Principal */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Destinatários */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <span>👥</span>
                        Destinatários
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Escolha para quem enviar o conteúdo
                      </p>
                    </div>

                    {/* Selecionar Turma */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Turma
                        </label>
                        <select
                          value={turmaSelecionada}
                          onChange={(e) => setTurmaSelecionada(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione uma turma</option>
                          {turmasProfessor.map((turma) => (
                            <option key={turma.id} value={turma.id}>
                              {turma.nome} - {turma.turno}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selecionar Matéria */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Matéria
                        </label>
                        <select
                          value={materiaSelecionada}
                          onChange={(e) => setMateriaSelecionada(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione a matéria</option>
                          {materiasProfessor.map((materia) => (
                            <option key={materia.id} value={materia.id}>
                              {materia.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>

                  {/* Card Novo Envio */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        Novo Envio
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Preencha as informações do conteúdo que deseja enviar
                      </p>
                    </div>
                    <div className="p-6 space-y-4">
                      {/* Tipo de Conteúdo */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Tipo de Conteúdo
                        </label>
                        <select
                          value={tipoConteudo}
                          onChange={(e) =>
                            handleTipoConteudoChange(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Selecione o tipo de conteúdo</option>
                          <option value="Aviso">Aviso</option>
                          <option value="PDF">PDF</option>
                          <option value="Exercício">Exercício</option>
                          <option value="Imagem">Imagem</option>
                        </select>
                      </div>

                      {/* Tipo de Exercício */}
                      {tipoConteudo === 'Exercício' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Tipo de Exercício
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="tipoExercicio"
                                value="tradicional"
                                checked={tipoExercicio === 'tradicional'}
                                onChange={(e) =>
                                  setTipoExercicio(e.target.value)
                                }
                                className="mr-2"
                              />
                              <span className="flex items-center gap-2">
                                Exercício Tradicional (arquivo)
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="tipoExercicio"
                                value="online"
                                checked={tipoExercicio === 'online'}
                                onChange={(e) =>
                                  setTipoExercicio(e.target.value)
                                }
                                className="mr-2"
                              />
                              <span className="flex items-center gap-2">
                                Exercício Online (interativo)
                              </span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Título */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Título/Assunto
                        </label>
                        <input
                          type="text"
                          placeholder="Digite o título ou assunto"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Conteúdo */}
                      {!(
                        tipoConteudo === 'Exercício' &&
                        tipoExercicio === 'online'
                      ) && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Descrição/Conteúdo
                            </label>
                            <textarea
                              placeholder="Digite a descrição ou conteúdo adicional"
                              rows={5}
                              value={conteudo}
                              onChange={(e) => setConteudo(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}

                      {/* Upload de Arquivo */}
                      {!(
                        tipoConteudo === 'Exercício' &&
                        tipoExercicio === 'online'
                      ) && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Anexar Arquivo (opcional)
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleArquivoUpload}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button className="px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                                📤
                              </button>
                            </div>
                            {arquivo && (
                              <p className="text-sm text-gray-600">
                                Arquivo selecionado: {arquivo.name}
                              </p>
                            )}
                          </div>
                        )}


                    </div>
                  </div>

                  {/* Configuração de Exercício Online */}
                  {tipoConteudo === 'Exercício' &&
                    tipoExercicio === 'online' && (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <span>💻</span>
                            Configuração do Exercício Online
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Configure as opções e questões do exercício
                            interativo
                          </p>
                        </div>
                        <div className="p-6 space-y-6">
                          {/* Configurações Gerais */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Tempo Limite (minutos)
                              </label>
                              <input
                                type="number"
                                placeholder="Ex: 60"
                                value={exercicioOnline.tempoLimite || ''}
                                onChange={(e) =>
                                  setExercicioOnline({
                                    ...exercicioOnline,
                                    tempoLimite: e.target.value
                                      ? Number.parseInt(e.target.value)
                                      : undefined,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Tentativas Permitidas
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={exercicioOnline.tentativasPermitidas}
                                onChange={(e) =>
                                  setExercicioOnline({
                                    ...exercicioOnline,
                                    tentativasPermitidas:
                                      Number.parseInt(e.target.value) || 1,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={
                                  exercicioOnline.mostrarResultadoImediato
                                }
                                onChange={(e) =>
                                  setExercicioOnline({
                                    ...exercicioOnline,
                                    mostrarResultadoImediato: e.target.checked,
                                  })
                                }
                                className="mr-2"
                              />
                              Mostrar resultado imediatamente após envio
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={exercicioOnline.embaralharQuestoes}
                                onChange={(e) =>
                                  setExercicioOnline({
                                    ...exercicioOnline,
                                    embaralharQuestoes: e.target.checked,
                                  })
                                }
                                className="mr-2"
                              />
                              Embaralhar ordem das questões
                            </label>
                          </div>

                          <hr className="border-gray-200" />

                          {/* Questões */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-medium">
                                  Questões
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {exercicioOnline.questoes.length} questão(ões)
                                  • {calcularPontuacaoTotal()} ponto(s) total
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setQuestaoEditando(null);
                                  setModalQuestaoAberto(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                              >
                                <span>➕</span>
                                Nova Questão
                              </button>
                            </div>

                            {/* Lista de Questões */}
                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                              {exercicioOnline.questoes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                  <div className="text-4xl mb-2">📚</div>
                                  <p>Nenhuma questão adicionada ainda</p>
                                  <p className="text-sm">
                                    Clique em "Nova Questão" para começar
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {exercicioOnline.questoes.map(
                                    (questao, index) => (
                                      <div
                                        key={questao.id}
                                        className="border border-gray-200 rounded-lg p-3 space-y-2"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                                Questão {index + 1}
                                              </span>
                                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                                                {getTipoQuestaoIcon(
                                                  questao.tipo
                                                )}
                                                {getTipoQuestaoNome(
                                                  questao.tipo
                                                )}
                                              </span>
                                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                {questao.valor}{' '}
                                                {questao.valor === 1
                                                  ? 'ponto'
                                                  : 'pontos'}
                                              </span>
                                            </div>
                                            <p className="text-sm font-medium line-clamp-2">
                                              {questao.enunciado}
                                            </p>
                                            {questao.alternativas && (
                                              <div className="mt-2 text-xs text-gray-600">
                                                {questao.alternativas.map(
                                                  (alt, i) => (
                                                    <div
                                                      key={alt.id}
                                                      className="flex items-center gap-1"
                                                    >
                                                      <span
                                                        className={
                                                          alt.correta
                                                            ? 'text-green-600 font-medium'
                                                            : ''
                                                        }
                                                      >
                                                        {String.fromCharCode(
                                                          65 + i
                                                        )}
                                                        : {alt.texto}
                                                        {alt.correta && ' ✅'}
                                                      </span>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-1 ml-2">
                                            <button
                                              onClick={() =>
                                                editarQuestao(questao)
                                              }
                                              className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                              ✏️
                                            </button>
                                            <button
                                              onClick={() =>
                                                removerQuestao(questao.id)
                                              }
                                              className="p-1 text-gray-400 hover:text-red-600"
                                            >
                                              🗑️
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Botão Enviar */}
                  <button
                    onClick={editandoEnvio ? handleSalvarEdicao : handleEnviar}
                    disabled={
                      !tipoConteudo ||
                      !titulo ||
                      enviando ||
                      !turmaSelecionada ||
                      !materiaSelecionada ||
                      (tipoDestinatario === 'individual' && alunosSelecionados.length === 0) ||
                      (tipoConteudo === 'Exercício' && !tipoExercicio) ||
                      (tipoConteudo === 'Exercício' && tipoExercicio === 'online' && exercicioOnline.questoes.length === 0)
                    }
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {enviando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ENVIANDO ...
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        ENVIAR CONTEÚDO
                      </>
                    )}
                  </button>

                  <button
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={() => {
                      setEditandoEnvio(null);
                      setAbaSelecionada('enviar');
                    }}
                  >
                    CANCELAR
                  </button>

                </div>

                {/* Resumo */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        Resumo do Envio
                      </h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Tipo:
                        </label>
                        <div className="flex items-center gap-2">
                          <span>
                            {tipoConteudo &&
                              getTipoIcon(
                                tipoConteudo === 'Exercício' &&
                                  tipoExercicio === 'online'
                                  ? 'Exercício Online'
                                  : tipoConteudo
                              )}
                          </span>
                          <span className="text-sm">
                            {tipoConteudo === 'Exercício' &&
                              tipoExercicio === 'online'
                              ? 'Exercício Online'
                              : tipoConteudo || 'Não selecionado'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Título:
                        </label>
                        <p className="text-sm">{titulo || 'Não informado'}</p>
                      </div>

                      {/* Turma */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Turma:
                        </label>
                        <p className="text-sm">
                          {turmasProfessor.find((t) => t.id.toString() === turmaSelecionada)?.nome || 'Não selecionada'}
                        </p>
                      </div>

                      {/* Matéria */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">
                          Matéria:
                        </label>
                        <p className="text-sm">
                          {materiasProfessor.find((m) => m.id.toString() === materiaSelecionada)?.nome || 'Não selecionada'}
                        </p>
                      </div>

                      {tipoConteudo === 'Exercício' &&
                        tipoExercicio === 'online' && (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">
                                Questões:
                              </label>
                              <p className="text-sm">
                                {exercicioOnline.questoes.length} questão(ões)
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">
                                Pontuação Total:
                              </label>
                              <p className="text-sm">
                                {calcularPontuacaoTotal()} ponto(s)
                              </p>
                            </div>
                            {exercicioOnline.tempoLimite && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">
                                  Tempo Limite:
                                </label>
                                <p className="text-sm">
                                  {exercicioOnline.tempoLimite} minutos
                                </p>
                              </div>
                            )}
                          </>
                        )}

                      {!(
                        tipoConteudo === 'Exercício' &&
                        tipoExercicio === 'online'
                      ) && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Arquivo:
                            </label>
                            <p className="text-sm">
                              {arquivo ? arquivo.name : 'Nenhum arquivo'}
                            </p>
                          </div>
                        )}

                    </div>
                  </div>

                </div>
              </div>
            )}

            {abaSelecionada === 'questoesparacorrigir' && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                    <span>📝</span>
                    Questões Abertas para Correção
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Corrija as respostas dissertativas dos alunos
                  </p>
                </div>

                <div className="p-6 space-y-4">
                  {questoesAbertas.length === 0 ? (
                    <p className="text-gray-600">Nenhuma questão aberta pendente de correção.</p>
                  ) : (
                    questoesAbertas.map((q) => (
                      <div
                        key={q.resposta_id}
                        className="border p-4 rounded-md bg-white shadow-sm space-y-2"
                      >
                        <p><strong>Aluno:</strong> {q.nome_aluno}</p>
                        <p><strong>Turma:</strong> {q.nome_turma || 'N/D'} | <strong>Matéria:</strong> {q.nome_materia || 'N/D'}</p>
                        <p><strong>Enunciado:</strong> {q.enunciado}</p>
                        <p><strong>Resposta do Aluno:</strong> {q.resp_texto}</p>
                        <p><strong>Explicação/Esperado:</strong> {q.explicacao}</p>
                        <p><strong>Valor:</strong> {q.valor_questao} ponto(s)</p>

                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={notaEdicao[q.resposta_id] ?? q.nota_obtida ?? ''}
                            onChange={(e) =>
                              setNotaEdicao({ ...notaEdicao, [q.resposta_id]: e.target.value })
                            }
                            className="border px-3 py-1 rounded-md w-24"
                            placeholder="Nota"
                            min="0"
                            max={q.valor_questao}
                          />
                          <button
                            onClick={() => salvarNota(q.resposta_id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                          >
                            Salvar Nota
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal de Questão */}
        {modalQuestaoAberto && (
          <div
            className="
      fixed inset-0
      bg-white bg-opacity-50    /* overlay branco */
      flex justify-center items-start /* topo em vez de centro */
      pt-20                     /* desloca pra baixo conforme altura da navbar */
      p-4
      z-50
    "
          >
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {questaoEditando ? 'Editar Questão' : 'Nova Questão'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configure os detalhes da questão
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Tipo da Questão */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo da Questão
                  </label>
                  <select
                    value={novaQuestao.tipo}
                    onChange={(e) =>
                      handleTipoQuestaoChange(e.target.value as Questao['tipo'])
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="multipla_escolha">
                      ☑️ Múltipla Escolha
                    </option>
                    <option value="verdadeiro_falso">
                      ❓ Verdadeiro/Falso
                    </option>
                    <option value="aberta">✏️ Questão Aberta</option>
                    <option value="numerica">#️⃣ Questão Numérica</option>
                  </select>
                </div>

                {/* Enunciado */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Enunciado da Questão
                  </label>
                  <textarea
                    placeholder="Digite o enunciado da questão"
                    rows={4}
                    value={novaQuestao.enunciado}
                    onChange={(e) =>
                      setNovaQuestao({
                        ...novaQuestao,
                        enunciado: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Valor */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Valor da Questão (pontos)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={novaQuestao.valor}
                    onChange={(e) =>
                      setNovaQuestao({
                        ...novaQuestao,
                        valor: Number.parseFloat(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Alternativas */}
                {(novaQuestao.tipo === 'multipla_escolha' ||
                  novaQuestao.tipo === 'verdadeiro_falso') && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Alternativas
                      </label>
                      {novaQuestao.alternativas?.map((alternativa, index) => (
                        <div
                          key={alternativa.id}
                          className="flex items-center gap-3"
                        >
                          <input
                            type="radio"
                            name="alternativa-correta"
                            checked={alternativa.correta}
                            onChange={() =>
                              handleAlternativaCorretaChange(alternativa.id)
                            }
                            className="w-4 h-4"
                          />
                          <label className="text-sm font-medium w-8">
                            {String.fromCharCode(65 + index)}:
                          </label>
                          <input
                            type="text"
                            placeholder={`Alternativa ${String.fromCharCode(
                              65 + index
                            )}`}
                            value={alternativa.texto}
                            onChange={(e) =>
                              handleAlternativaChange(
                                alternativa.id,
                                e.target.value
                              )
                            }
                            disabled={novaQuestao.tipo === 'verdadeiro_falso'}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">
                        Selecione a alternativa correta marcando o círculo
                        correspondente
                      </p>
                    </div>
                  )}

                {/* Resposta Correta */}
                {(novaQuestao.tipo === 'aberta' ||
                  novaQuestao.tipo === 'numerica') && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {novaQuestao.tipo === 'numerica'
                          ? 'Resposta Numérica Correta'
                          : 'Resposta Modelo'}
                      </label>
                      {novaQuestao.tipo === 'aberta' ? (
                        <textarea
                          placeholder="Digite a resposta modelo ou critérios de correção"
                          rows={3}
                          value={novaQuestao.respostaCorreta as string}
                          onChange={(e) =>
                            setNovaQuestao({
                              ...novaQuestao,
                              respostaCorreta: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <input
                          type="number"
                          placeholder="Digite o valor numérico correto"
                          value={novaQuestao.respostaCorreta as number}
                          onChange={(e) =>
                            setNovaQuestao({
                              ...novaQuestao,
                              respostaCorreta: Number.parseFloat(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  )}

                {/* Explicação */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Explicação (opcional)
                  </label>
                  <textarea
                    placeholder="Digite uma explicação que será mostrada após a resposta"
                    rows={3}
                    value={novaQuestao.explicacao}
                    onChange={(e) =>
                      setNovaQuestao({
                        ...novaQuestao,
                        explicacao: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => {
                      setModalQuestaoAberto(false);
                      setQuestaoEditando(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={
                      questaoEditando ? salvarEdicaoQuestao : adicionarQuestao
                    }
                    disabled={!novaQuestao.enunciado.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {questaoEditando
                      ? 'Salvar Alterações'
                      : 'Adicionar Questão'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
