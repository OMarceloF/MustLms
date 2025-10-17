import { Router } from 'express';
import path from 'path';
import {
  loginUser,
  checkAuth,
  logoutUser,
  ensureAuth,
  verifyPassword,
} from '../controllers/authController';
import { getUserData, getUsers } from '../controllers/getUserController';
import { getUserInfo } from '../controllers/getUserInfo';
import {
  uploadFotoHandler,
  uploadMaterialHandler,
} from '../controllers/uploadController';
import {
  criarFuncionario,
  uploadFuncionarioFoto,
} from '../controllers/criarProfessorController';
import {
  getAlunoById,
  listarAlunos,
  getAlunoEditData,
  excluirAluno,
  getMensalidadeByAluno,
  getDescontoByAluno,
  getResponsaveisByAluno,
  getDadosAcademicosDoAluno,
  importarUsersLote,
  updateAluno,
  getAlunoDashboardData,
  getPerfilUsuario
} from "../controllers/alunosController";
import { criarAluno } from '../controllers/criarAlunoController';
import { criarResponsavel } from '../controllers/criarResponsavelController';
import {
  criarMateria,
  listarFuncionariosMateria,
  listarMateriaisMateria,
  listarTurmasMateria,
} from '../controllers/criarMateriaController';
import {
  criarNovoCalendario,
  obterCalendario,
  unificarCalendariosLetivos,
  obterCalendarioPorId,
} from '../controllers/calendarioController';
import {
  criarNovoEvento,
  obterEventos,
  excluirEvento,
  editarEvento,
  obterRolesEvento,
  obterUsuariosEvento,
  obterEventosUsuario,
} from '../controllers/eventoController';
import {
  criarTurma,
  getTurmas,
  deleteTurma,
  adicionarAlunosTurma,
  getAlunosDisponiveis,
  getAlunosTurma,
  getTurmaById,
  removerAlunoDaTurma,
  editarTurma,
  getDisciplinasComProfessorPorTurma,
  getProfessoresPorMateria,
  atribuirProfessorPorMateriaTurma,
  atribuirMateriasParaTurma,
  removerMateriaDaTurma,
} from '../controllers/turmasController';
import {
  listarMateriasPage,
  excluirMateria,
  obterMateriaPorId,
  atualizarMateria,
} from '../controllers/gestaoEscolarController';
import {
  obterDetalhesMateria,
  getMateriaById,
  getTurmasDaMateria,
  getProfessorPorTurma,
  listarMaterias,
  getProfessorResponsavel,
} from '../controllers/materiasController';
import {
  getProfessores,
  listarFuncionarios,
  getProfessorById,
  atualizarProfessor,
  excluirProfessor,
  getPagamentoByProfessor,
  getMateriasByProfessor,
  getAlunosByProfessor,
  getTurmasByProfessor,
  getProfessorStats,
  getNotasByProfessor,
  getFaltasMensaisByProfessor,

} from '../controllers/professoresController';
import { responderPerguntaIA } from '../controllers/ia';
import {
  contarAlunos,
  contarFuncionarios,
  contarResponsaveis,
} from '../controllers/homePageController';
import { buscarAlunosPorTermo } from '../models/alunos';
import multer from 'multer';
import { getFollowStatus, toggleFollow } from '../controllers/followController';
import { getTotalUsuarios, getFuncionarioEditData, updateFuncionario, desativarFuncionario } from '../controllers/usuariosController';
import {
  getUserBasic,
  getUserProfile,
  updateUserProfile,
  updateUserBiography,
} from '../controllers/getUserBasic';
import {
  getTransacoes,
  criarTransacao,
  getMensalidadesAluno,
  pagarMensalidade,
  exportarCSV,
  exportarExcel,
  exportarPDF,
  getResponsaveis,
  getTurmasFinanceiro,
  atualizarLancamentos,
  pagarTransacao,
} from '../controllers/financeiroController';

// import {
//   getOrCreateConversa,
//   listarMensagens,
//   enviarMensagem,
// } from '../controllers/chatController';
// import { listarTodosUsuarios } from '../controllers/chatController';
import {
  listarMateriais,
  criarMaterial,
  excluirMaterial,
  editarMaterial,
} from '../controllers/materiaisController';

// import { listarConversasRecentes } from '../controllers/chatController';
// import { toggleFavorito, listarFavoritos } from '../controllers/chatController';
import { obterFrequenciaMensal, getNotasPorAluno, getNotasByCalendario, salvarNotasBatch, getFaltasPorEtapa, getFrequenciaPorMateria } from '../controllers/notaController';
import {
  getPresencasByMateriaTurma,
  getNotasByMateriaTurma,
} from '../controllers/notasEpresencasController';
import {
  buscarAnuncioPorId,
  criarAnuncio,
  editarAnuncio,
  excluirAnuncio,
  incrementarVisualizacao,
  listarAnuncios,
  listarAnunciosLidos,
  marcarAnuncioComoLido,
} from '../controllers/anunciosController';
import { getNomeEscola } from '../controllers/escolaController';
import { getTipoAvaliacao } from '../controllers/calendarioController';
import { getEstatisticasAlunos, getRelatorioAlunos, getTaxaPresencaPorTurma, exportarRelatorioPDF, getCalendarioGestor } from '../controllers/relatoriosController';
import fs from 'fs';

import {
  getAvaliacoesByTurmaMateria,  // <- importe
  createAvaliacao,
  updateAvaliacao,
  deleteAvaliacao,
  upsertNotas,
  updateStatusAvaliacao,
  concluirAvaliacoes,
} from '../controllers/avaliacoesNotasController';
import { getPeriodosCalendarioGestor } from '../controllers/calendarioGestorController';
import {
  listarAulas,
  criarAula,
  salvarPresencasBatch,
  listarPresencas,
  listarPresencasPorAula,
  atualizarStatusAula,
  excluirAula,
  getFaltasPorPeriodo,
} from './../controllers/diarioController';




import { getAlunosDoResponsavel, getResponsavelById, updateResponsavel, buscarResponsavelPorCPF, listarResponsaveisPorAluno, vincularResponsavel, desvincularResponsavel } from '../controllers/responsaveisController';
import {
  criarEnvio,
  listarEnviosPorProfessor,
  excluirEnvio,
  editarEnvio,
  listarQuestoesAbertas,
  corrigirQuestaoAberta
} from '../controllers/criarEnvio';


// import { listarUsuariosOnline } from '../controllers/socketController';


import {
  getEnviosPorAluno,
  enviarExercicioTradicionalAluno,
  getExerciciosEnviados,
  getExerciciosOnlinePorAluno,
  getQuestoesPorEnvioId,
  getDetalhesExercicio,
  salvarRespostasExercicioOnline,
  getNumeroTentativas,
  getMelhorNotaExercicio,
  getUltimoArquivoEnviado
} from '../controllers/enviosDeProfessorAlunoController';

// import {
//   criarGrupo,
//   convidarParaGrupo,
//   listarGruposDoUsuario,
//   listarConvitesPendentes,
//   aceitarConviteGrupo,
//   recusarConviteGrupo
// } from '../controllers/chatController';


// import {
//   enviarMensagemGrupo,
//   listarMensagensGrupo
// } from '../controllers/chatController';
// import { marcarMensagensComoVistas, apagarNotificacoesDaConversa, salvarStatusDigitando, buscarStatusDigitando, listarNotificacoes } from '../controllers/chatController';

// import {
//   setDigitando,
//   getDigitando,

//   // ... outros
// } from '../controllers/chatController';



import {
  apagarNotificacaoEvento,
  criarNotificacaoEvento,
  listarNotificacoesEventos,
  marcarNotificacaoEventoComoLida,
  marcarNotificacaoEventoComoVisualizada,
  executarVerificacoes,
  contarNaoVisualizadasEventos,
} from '../controllers/notificacoesEventosController';

import {
  getNotificacoesPorUsuario,
  criarNotificacao,
  marcarMensagensComoLidas,
  deletarNotificacoesPorConversaEUsuario,
  listarNaoVisualizadas,
  marcarComoVisualizadas
} from '../controllers/notificacoesController';


import { loginLimiter } from '../middlewares/rateLimiter';

import {
  createContrato,
  getContratos,
  updateContrato,
  deleteContrato,
  createContratoPreenchido,
  getContratosPreenchidos,
  updateContratoPreenchido,
  deleteContratoPreenchido,
  previewContratoPreenchido,
  getTransacoesPorAluno,
  enviarArquivoContratoPreenchido
} from '../controllers/contratosController';

import { consultarCep } from '../controllers/cepController';

import { getFeriados } from '../controllers/externoController';

import { uploadSingleImage, uploadSingleDoc, uploadFields, uploadAny } from '../lib/upload';

import { getSchoolConfig, saveSchoolConfig } from '../controllers/ConfiguracaoEscolaController';

const router = Router();

// ──────────────────────────────────────────────────────────────────────────────
// ENVIAR COMPROVANTES MULTER
// ──────────────────────────────────────────────────────────────────────────────

const comprovantesDir = path.resolve(__dirname, '..', '..', 'uploads', 'comprovantes');
if (!fs.existsSync(comprovantesDir)) {
  fs.mkdirSync(comprovantesDir, { recursive: true });
}

// Define pasta de armazenamento para contratos assinados
const contratosDir = path.resolve(__dirname, '..', '..', 'uploads', 'contratos');
if (!fs.existsSync(contratosDir)) {
  fs.mkdirSync(contratosDir, { recursive: true });
}

router.get('/teste-buscar-alunos', async (req, res) => {
  const termo = (req.query.termo as string) || ''; // pegar query param "termo"
  if (!termo) {
    return res.status(400).json({ erro: 'Query param termo é obrigatório' });
  }

  try {
    const resultados = await buscarAlunosPorTermo(termo);
    res.json({ resultados });
  } catch (error) {
    console.error('Erro no teste buscar alunos:', error);
    res.status(500).json({ erro: 'Erro ao buscar alunos' });
  }
});

router.get('/api/alunos/:id/envios', getEnviosPorAluno);
router.post(
  '/api/envios/:envioId/aluno/:alunoId/enviar',
  uploadAny.single('arquivo'),
  enviarExercicioTradicionalAluno
);
router.get('/api/alunos/:alunoId/exercicios-enviados', getExerciciosEnviados);
router.get('/api/exercicios/envios/:enviosId/questoes', getQuestoesPorEnvioId);
router.get('/api/alunos/:alunoId/exercicios-online', getExerciciosOnlinePorAluno);
router.get('/api/exercicios/envio/:enviosId/detalhes', getDetalhesExercicio);
router.post('/api/exercicios/:envioId/aluno/:alunoId/salvar-respostas', salvarRespostasExercicioOnline);
router.get('/api/exercicios/:envioId/aluno/:alunoId/tentativas', getNumeroTentativas);
router.get('/api/exercicios/:envioId/aluno/:alunoId/melhor-nota', getMelhorNotaExercicio);
router.get('/api/envios/:envioId/aluno/:alunoId/ultimo-arquivo', getUltimoArquivoEnviado);
router.get('/api/questoes-abertas/professor/:id', listarQuestoesAbertas);
router.put('/api/questoes-abertas/:respostaId', corrigirQuestaoAberta);
router.post('/api/alunos/adicionar-lote', uploadAny.single('arquivo'), importarUsersLote);
router.get('/api/alunos/:id/dados-academicos',);
router.put('/api/responsaveis/:id', updateResponsavel);
router.get('/api/responsaveis/:id', getResponsavelById);
router.get('/alunos/:id/responsaveis', getResponsaveisByAluno);
router.get('/api/alunos/:id/dados-academicos', getDadosAcademicosDoAluno);
router.get('/api/alunos/estatisticas', getEstatisticasAlunos);
router.get('/api/alunos/relatorio', getRelatorioAlunos);
router.get('/api/presencas/taxa-por-turma', getTaxaPresencaPorTurma);
router.get('/api/relatorio/exportar-pdf', exportarRelatorioPDF);
router.get('/api/calendario/gestor', getCalendarioGestor);
router.post('/api/login', loginLimiter, loginUser);
router.get('/api/check-auth', checkAuth);
router.post('/api/logout', logoutUser);
router.post('/api/verify-password', verifyPassword);
router.get('/api/user/:id', getUserData);
router.get('/api/userinfo/:id', getUserInfo);
// A rota '/api/usuarios' já existe, mas está comentada ou sendo usada por 'getUsers'.
// Vamos adicionar nossa nova rota aqui perto.
router.get('/api/users/total', getTotalUsuarios);
router.get('/api/usuarios', getUsers);
// router.get('/api/professores', getProfessores);
// router.get('/api/listar_funcionarios', listarFuncionarios);
router.post('/api/upload', uploadFotoHandler);
// router.post('/api/professores', uploadProfessorFoto, criarProfessor);
// router.put('/api/professores/:id', atualizarProfessor);
// router.get('/api/professores/:id', getProfessorById);
// router.delete('/api/professores/:id', excluirProfessor);
router.delete('/api/alunos/:id', excluirAluno);
router.put('/api/alunos/:id', listarAlunos);
router.get('/api/listar_alunos', listarAlunos);
// router.get('/api/alunos', getAlunos);
// router.get('/api/listar_alunos', listarAlunos);
router.post('/api/alunos', criarAluno);
router.post('/api/responsaveis', criarResponsavel);
router.post('/api/materias', criarMateria);
router.get('/api/listarFuncionariosMateria', listarFuncionariosMateria);
router.get('/api/listarMateriaisMateria', listarMateriaisMateria);
router.get('/api/listarTurmasMateria', listarTurmasMateria);
router.post('/api/calendario', criarNovoCalendario);
router.get('/api/calendario/:ano_letivo', obterCalendario);
router.post('/api/calendario/unificar', unificarCalendariosLetivos);
router.get('/api/calendarioById/:id', obterCalendarioPorId);
router.get('/api/anuncios', listarAnuncios);
router.post('/api/anuncios', criarAnuncio);
router.get('/api/anuncios/:id', buscarAnuncioPorId);
router.put('/api/anuncios/:id', editarAnuncio);
router.delete('/api/anuncios/:id', excluirAnuncio);
router.post('/api/anuncios/:id/visualizar', incrementarVisualizacao);
router.post('/api/anuncios/:id/lido', marcarAnuncioComoLido);
router.get('/api/anuncios-lidos', listarAnunciosLidos);
router.post('/api/evento', criarNovoEvento);
router.get('/api/evento/:calendario_id', obterEventos);
router.delete('/api/evento/:id', excluirEvento);
router.put('/api/evento/:id', editarEvento);
router.get('/api/evento/:id/roles', obterRolesEvento);
router.get('/api/evento/:id/usuarios', obterUsuariosEvento);
router.get('/api/evento/usuario/:user_id/:role', obterEventosUsuario);
router.post('/api/turmas', criarTurma);
router.get('/api/turmas/alunos/disponiveis', getAlunosDisponiveis);
router.get('/api/turmas', getTurmas);
router.get('/api/turmas/:turmaId', getTurmaById);
router.put('/api/turmas/:id', editarTurma);
router.delete('/api/turmas/:id', deleteTurma);
router.get('/api/turmas/:turmaId/alunos', getAlunosTurma);
router.post('/api/turmas/:turmaId/adicionar-alunos', adicionarAlunosTurma);
router.delete('/api/turmas/:turmaId/alunos/:alunoId', removerAlunoDaTurma);
router.get('/api/listarMateriasPage', listarMateriasPage);
router.delete('/api/materias/:id', excluirMateria);
router.get('/api/materias/:id', obterMateriaPorId);
router.put('/api/materias/:id', atualizarMateria);
router.get('/api/materias/:id/detalhes', obterDetalhesMateria);
router.get('/api/materiasPage/:id', getMateriaById);
router.get('/api/materiasPage/:id/turmas', getTurmasDaMateria);
router.post('/api/uploadFile', uploadMaterialHandler);
router.post('/api/ia', responderPerguntaIA);
router.get('/api/dashboard/contar-alunos', contarAlunos);
router.get('/api/dashboard/contar-funcionarios', contarFuncionarios);
router.get('/api/dashboard/contar-responsaveis', contarResponsaveis);
router.get('/api/alunos/:id', getAlunoById);
// router.get('/user/:id', getUserAndAlunoById);
router.get('/api/users/:id/basic', getUserBasic);
router.get('/api/users/:id/profile', getUserProfile);
router.put('/api/users/:id/profile', updateUserProfile);
router.get('/api/follow/status/:targetId', ensureAuth, getFollowStatus);
router.post('/api/follow/toggle/:targetId', ensureAuth, toggleFollow);
router.get('/api/financeiro/transacoes', getTransacoes);
router.get('/api/financeiro/mensalidades/:alunoId', getMensalidadesAluno);
router.put(
  '/api/financeiro/mensalidades/:id/pagar',
  uploadAny.single('comprovante'),
  pagarMensalidade
);
// router.delete(
//   '/api/notificacoes/:usuarioId/conversa/:conversaId/lidas',
//   apagarNotificacoesDaConversa
// );

router.patch('/api/users/:id/biography', updateUserBiography);
// router.get('/conversas/:usuario1/:usuario2', getOrCreateConversa);
// router.get('/mensagens/:conversaId', listarMensagens);
// router.post('/mensagens', enviarMensagem);
// router.get('/api/usuarios/:usuarioId', listarTodosUsuarios);
router.get('/api/financeiro/exportar/excel', exportarExcel);
router.get('/api/financeiro/exportar/pdf', exportarPDF);
router.get('/api/materiais', listarMateriais);
router.post(
  '/api/materiais',
  uploadFields([
    { name: 'capa', maxCount: 1 },
    { name: 'conteudo', maxCount: 1 },
  ]),
  criarMaterial
);
router.delete('/api/materiais/:id', excluirMaterial);
router.put(
  '/api/materiais/:id',
  uploadFields([
    { name: 'capa', maxCount: 1 },
    { name: 'conteudo', maxCount: 1 },
  ]),
  editarMaterial
);
// router.get('/api/recentes/:usuarioId', listarConversasRecentes);
// router.post('/api/favoritos/toggle', toggleFavorito);
// router.get('/api/favoritos/:usuarioId', listarFavoritos);
router.get('/api/notas/presencas', obterFrequenciaMensal);
router.get('/api/presencas/aula/:aulaId', listarPresencasPorAula);
router.get('/api/presencas/:materiaId/:turmaId', getPresencasByMateriaTurma);
router.get('/api/notas/:materiaId/:turmaId', getNotasByMateriaTurma);
router.get('/api/turmas/:turmaId/professor', getProfessorPorTurma);
router.get(
  '/api/turmas/:turmaId/disciplinas-com-professor',
  getDisciplinasComProfessorPorTurma
);
router.get('/api/materias/:materiaId/professores', getProfessoresPorMateria);
router.post(
  '/api/turmas/:turmaId/professores',
  atribuirProfessorPorMateriaTurma
);
router.post('/api/turmas/:turmaId/materias', atribuirMateriasParaTurma);
router.get('/api/listarMaterias', listarMaterias);
router.delete(
  '/api/turmas/:turmaId/materias/:materiaId',
  removerMateriaDaTurma
);
router.get(
  '/api/professores_turmas/:materiaId/:turmaId/professor',
  getProfessorResponsavel
);
router.get('/api/escola/nome', getNomeEscola);
router.get('/api/professores', getProfessores);
router.post('/api/funcionarios', uploadFuncionarioFoto.single('foto'), criarFuncionario);
router.get('/api/professores/:id', getProfessorById);
router.get('/api/professores/:id/stats', getProfessorStats);
router.delete('/api/professores/:id', excluirProfessor);
router.get('/api/listar_funcionarios', listarFuncionarios);
router.get('/api/calendario/tipo-avaliacao', getTipoAvaliacao);
router.get("/api/boletim/:alunoId", getNotasPorAluno);
router.get('/api/turmas/:turmaId/materias/:materiaId/calendario_gestor', getPeriodosCalendarioGestor);
router.get('/api/turmas/:turmaId/materias/:materiaId/avaliacoes', getAvaliacoesByTurmaMateria);
router.post('/api/avaliacoes',
  createAvaliacao);
router.put('/api/avaliacoes/:id', updateAvaliacao);
router.delete('/api/avaliacoes/:id', deleteAvaliacao);
router.post('/api/notas/batch', upsertNotas);
router.put('/api/avaliacoes/:id/status', updateStatusAvaliacao);
router.put('/api/avaliacoes/status/batch', concluirAvaliacoes);
router.get('/api/calendario_gestor', getPeriodosCalendarioGestor);

// // 🔹 Criação de grupo
// router.post('/api/grupos', criarGrupo);

// // 🔹 Enviar convite para grupo
// router.post('/api/grupos/:grupoId/convidar', convidarParaGrupo);

// // 🔹 Listar grupos do usuário
// router.get('/api/grupos/:usuarioId', listarGruposDoUsuario);

// // 🔹 Listar convites pendentes do usuário
// router.get('/api/grupos/convites/:usuarioId', listarConvitesPendentes);

// // 🔹 Aceitar convite
// router.post('/api/grupos/convites/:conviteId/aceitar', aceitarConviteGrupo);

// // 🔹 Recusar convite
// router.post('/api/grupos/convites/:conviteId/recusar', recusarConviteGrupo);

// router.get('/api/grupos/:grupoId/mensagens', listarMensagensGrupo);
// router.post('/api/grupos/:grupoId/mensagens', enviarMensagemGrupo);

router.get('/api/financeiro/exportar/csv', exportarCSV);
router.get('/api/financeiro/responsaveis', getResponsaveis);
router.get('/api/financeiro/turmas', getTurmasFinanceiro);
router.get("/api/alunos/:id/mensalidade", getMensalidadeByAluno);
router.get("/api/alunos/:id/desconto", getDescontoByAluno);
router.get('/api/professores/:id/pagamento', getPagamentoByProfessor);
router.post('/api/financeiro/atualizar-lancamentos', atualizarLancamentos);
router.put('/api/financeiro/transacoes/:id/pagar', uploadAny.single('comprovante'), pagarTransacao);
router.post('/api/financeiro/transacoes', uploadAny.single('comprovante'), criarTransacao);
router.get('/api/aulas', listarAulas);
router.post('/api/aulas', criarAula);
router.post('/api/presencas/batch', salvarPresencasBatch);
router.get('/api/presencas/:materiaId/:turmaId', listarPresencas);
router.put('/api/aulas/:id/status', atualizarStatusAula);
router.delete('/api/aulas/:id', excluirAula);


router.get('/api/responsaveis/:id/alunos', getAlunosDoResponsavel);
router.get('/api/notas', getNotasByCalendario);
router.get('/api/professores/:id/materias', getMateriasByProfessor);
router.get('/api/professores/:id/alunos', getAlunosByProfessor);
router.get('/api/professores/:id/turmas', getTurmasByProfessor);
router.get('/api/professores/:id/notas', getNotasByProfessor);
router.get('/api/professores/:id/faltas-mensais', getFaltasMensaisByProfessor);

router.post('/api/criar-envios', uploadAny.single('arquivo'), criarEnvio);
router.get('/api/envios/professor/:id', listarEnviosPorProfessor);
router.delete('/api/envios/:id', excluirEnvio);
router.put('/api/envios/:id', uploadAny.single('arquivo'), editarEnvio);

// router.post('/conversas/:conversaId/mensagens', enviarMensagem);
// router.put('/mensagens/:conversaId/visto/:usuarioId', marcarMensagensComoVistas);
// router.put('/mensagens/:conversaId/:usuarioId/vistas', marcarMensagensComoVistas);
// router.get('/usuarios/online', listarUsuariosOnline);


// // ✅ Adicione essas rotas REST de digitação:
// router.post('/digitando', setDigitando);
// router.get('/digitando/:conversaId', getDigitando);
// router.delete('/api/notificacoes/:usuarioId/conversa/:conversaId', apagarNotificacoesDaConversa);
// router.post('/api/digitando', salvarStatusDigitando);
// router.get('/api/digitando/:conversaId', buscarStatusDigitando);

// router.get('/api/notificacoes/:usuarioId', listarNotificacoes);

// 🔹 Rota DELETE para limpar notificações recebidas de uma conversa específica
router.delete(
  "/api/notificacoes/conversa/:conversaId/usuario/:usuarioId",
  deletarNotificacoesPorConversaEUsuario
);

// --- Rotas para Configurações da Escola ---
router.get('/api/configuracoes-escola', getSchoolConfig);
router.post('/api/configuracoes-escola', saveSchoolConfig);

// 🔹 GET - Listar notificações de mensagens de um usuário (por destinatário_id)
router.get('/api/notificacoes/:id', getNotificacoesPorUsuario);

// 🔹 POST - Criar nova notificação
router.post('/api/notificacoes', criarNotificacao);

// 🔹 PUT - Marcar todas como lidas (lida = 1) para um destinatário
router.put('/api/notificacoes/:id/mensagens-lidas', marcarMensagensComoLidas);

// 🔹 PUT - Marcar como visualizadas (visualizada = 1)
router.put('/api/notificacoes/:usuarioId/visualizadas', marcarComoVisualizadas);

// 🔹 GET - Listar notificações não visualizadas
router.get('/api/notificacoes/:usuarioId/nao-visualizadas', listarNaoVisualizadas);

// 🔹 DELETE - Apagar notificações de uma conversa específica para um destinatário
router.delete('/api/notificacoes/conversa/:conversaId/usuario/:usuarioId', deletarNotificacoesPorConversaEUsuario);


// Criar notificação de evento
router.post('/api/notificacoes-eventos', criarNotificacaoEvento);

// Listar notificações de eventos de um usuário
router.get('/api/notificacoes-eventos/:usuarioId', listarNotificacoesEventos);

// Marcar notificação de evento como lida
router.put('/api/notificacoes-eventos/:notificacaoId/lida', marcarNotificacaoEventoComoLida);

// Marcar notificação de evento como visualizada
router.put('/api/notificacoes-eventos/:notificacaoId/visualizada', marcarNotificacaoEventoComoVisualizada);

router.put('/api/notificacoes/:usuarioId/mensagens-lidas', marcarMensagensComoLidas);

router.put('/api/notificacoes/:usuarioId/conversa/:conversaId/lidas', marcarMensagensComoLidas);

router.get("/api/notificacoes/:usuarioId/nao-visualizadas", listarNaoVisualizadas);
router.put("/api/notificacoes/:usuarioId/visualizadas", marcarComoVisualizadas);

router.delete('/api/notificacoes-eventos/:notificacaoId', apagarNotificacaoEvento);
router.post('/api/notificacoes-eventos', criarNotificacaoEvento);
router.get('/api/notificacoes-eventos/:usuarioId', listarNotificacoesEventos);
router.put('/api/notificacoes-eventos/:notificacaoId/lida', marcarNotificacaoEventoComoLida);
router.put('/api/notificacoes-eventos/:notificacaoId/visualizada', marcarNotificacaoEventoComoVisualizada);
router.get('/api/verificacoes', executarVerificacoes);
router.get('/api/notificacoes-eventos/:usuarioId/nao-visualizadas-contagem', contarNaoVisualizadasEventos);
router.get('/api/faltas/:turmaId/:materiaId', getFaltasPorPeriodo);
router.get('/api/faltas-por-etapa/:alunoId', getFaltasPorEtapa);
router.get('/api/frequencia/:alunoId', getFrequenciaPorMateria);

router.get('/api/contratos', getContratos);
router.post('/api/contratos', createContrato);
router.put('/api/contratos/:id', updateContrato);
router.delete('/api/contratos/:id', deleteContrato);
router.post('/api/contratos_preenchidos', createContratoPreenchido);
router.get('/api/contratos_preenchidos', getContratosPreenchidos);
router.put('/api/contratos_preenchidos/:id', updateContratoPreenchido);
router.delete('/api/contratos_preenchidos/:id', deleteContratoPreenchido);
router.get('/api/contratos_preenchidos/:id/preview', previewContratoPreenchido);
router.get('/financeiro/transacoes_aluno/:alunoId', getTransacoesPorAluno);
router.put('/api/contratos_preenchidos/:id/upload-contrato', uploadAny.single('contrato'), enviarArquivoContratoPreenchido);
router.get('/api/consulta-cep/:cep', consultarCep);
router.get('/api/alunos/:alunoId/responsaveis', listarResponsaveisPorAluno);
router.post('/api/alunos/vincular-responsavel', vincularResponsavel);
router.delete('/api/alunos-responsaveis/:vinculoId', desvincularResponsavel);
router.get('/api/alunos/:id/edit-data', getAlunoEditData);
router.put('/api/alunos/:id', uploadSingleImage('foto'), updateAluno);
router.get('/api/alunos/:id/dashboard', getAlunoDashboardData);
router.get('/api/responsaveis/cpf/:cpf', buscarResponsavelPorCPF)
router.get('/api/usuarios/:id/perfil', getPerfilUsuario);
router.get('/api/funcionarios/:id/edit-data', getFuncionarioEditData);
router.post('/api/funcionarios', uploadSingleImage('foto'), criarFuncionario);
router.put('/api/funcionarios/:id', uploadSingleImage('foto'), updateFuncionario);
router.delete('/api/funcionarios/:id', desativarFuncionario);
router.get('/api/ext/feriados', getFeriados);
router.get('/api/ext/feriados/:ano', getFeriados)



export default router;