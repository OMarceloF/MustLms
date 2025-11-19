// backend/src/routes/routes.ts

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
  getPerfilUsuario,
  criarOuAtualizarAluno,
  buscarAlunoPorCPF,
  getDetalhesCompletosAluno,
  atualizarDocumentoAluno,
} from '../controllers/alunosControllerNovo';
// import { criarAluno } from '../controllers/criarAlunoController';
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
  getEventosAvaliacoesFormatados,
  getEventosCursos
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
  getAlunosDisponiveis,
  getAlunosTurma,
  getTurmaById,
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
  listarInformacoes,
  criarInformacao,
  atualizarInformacao,
  excluirInformacao
} from '../controllers/informacoesComplementaresController';
import {
  contarAlunos,
  contarFuncionarios,
  contarResponsaveis,
} from '../controllers/homePageController';
import { buscarAlunosPorTermo } from '../models/alunos';
import multer from 'multer';
import { getFollowStatus, toggleFollow } from '../controllers/followController';
import {
  getTotalUsuarios,
  getFuncionarioEditData,
  updateFuncionario,
  desativarFuncionario,
} from '../controllers/usuariosController';
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
   listarMateriaisNovo,
  criarMaterialNovo,
  editarMaterialNovo,
  excluirMaterialNovo,
  buscarMaterialPorId,
} from '../controllers/materiaisController';

// import { listarConversasRecentes } from '../controllers/chatController';
// import { toggleFavorito, listarFavoritos } from '../controllers/chatController';
import {
  obterFrequenciaMensal,
  getNotasPorAluno,
  getNotasByCalendario,
  salvarNotasBatch,
  getFaltasPorEtapa,
  getFrequenciaPorMateria,
} from '../controllers/notaController';
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
import {
  getEstatisticasAlunos,
  getRelatorioAlunos,
  getTaxaPresencaPorTurma,
  exportarRelatorioPDF,
  getCalendarioGestor,
} from '../controllers/relatoriosController';
import fs from 'fs';

import {
    getTurmas as getTurmasNovo,
    createTurma as createTurmaNovo,
    updateTurma as updateTurmaNovo,
    deleteTurma as deleteTurmaNovo,
    getTurmaByIdNovo,
    getCursosParaForm,
    getMateriasPorCursoParaForm,
    getSemestresParaForm,
    getProfessoresParaForm,
    getAlunosDisponiveisParaTurma,
    adicionarAlunosTurma,
    removerAlunoDaTurma,
    updateAlunoTurmaStatus,
} from '../controllers/turmasControllerNovo';

import { getRelatoriosDisciplina } from '../controllers/relatoriosDisciplinasController';

import {
  getAvaliacoesByTurmaMateria,
  createAvaliacao,
  updateAvaliacao,
  deleteAvaliacao,
  upsertNotas,
  getDadosAcademicosCompletos,
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

import {
  listarAvisos,
  criarAviso,
  atualizarAviso,
  excluirAviso,
  getTurmasParaAvisos
} from '../controllers/avisosController';

import {
  getCalendarConfig,
  updateCalendarConfig,
} from '../controllers/configuracoesCalendarioController';

import {
  buscarResponsavelPorCPF,
  criarResponsavelEAssociar,
  vincularResponsavel,
  desvincularResponsavel,
  listarResponsaveisPorAluno,
  getAlunosDoResponsavel,
  getResponsavelById,
  updateResponsavel
} from '../controllers/responsaveisControllerNovo';
import { uploadDocumentosAluno } from '../controllers/documentosController';
import {
  criarEnvio,
  listarEnviosPorProfessor,
  excluirEnvio,
  editarEnvio,
  listarQuestoesAbertas,
  corrigirQuestaoAberta,
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
  getUltimoArquivoEnviado,
} from '../controllers/enviosDeProfessorAlunoController';

import { vincularAlunoCursoPosGraduacao,
         updateStatusVinculo,
 } from '../controllers/vincularAlunoCursoController';

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
  marcarComoVisualizadas,
} from '../controllers/notificacoesController';

import { loginLimiter } from '../middlewares/rateLimiter';

import {
    createGrade,
    getGrades,
    updateGrade,
    deleteGrade,
    getMateriasForGradeForm,
    getPeriodosLetivosForForm,
    getDisciplinasByCursoGrouped,
    getGradesByCurso
} from '../controllers/gradeCurricularController';

import { getPeriodosLetivos, syncPeriodosLetivos,getAllPeriodosLetivos,getPeriodoLetivoAtual } from '../controllers/periodosLetivosController';

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
  enviarArquivoContratoPreenchido,
} from '../controllers/contratosController';

import { consultarCep } from '../controllers/cepController';

import { getFeriados } from '../controllers/externoController';

import {
  uploadSingleImage,
  uploadSingleDoc,
  uploadFields,
  uploadAny,
} from '../lib/upload';

import {
  getSchoolConfig,
  saveSchoolConfig,
} from '../controllers/ConfiguracaoEscolaController';
import { getSystemConfigStatus } from '../controllers/configuracoesSistemaController';
import {
  getColorsController,
  updateColorsController,
} from '../controllers/colorsController';

import {
  adicionarCurso,
  listarCursosPosGraduacao,
  excluirCurso,
  atualizarCurso,
  obterDetalhesCurso,
  listarEventosCalendario,
  adicionarEventoCalendario,
  obterPPC,
  salvarPPC,
  obterVinculadosCurso,
  listarTurmasPorDisciplina,
  listarTurmasAtivasParaAulas,
  listarTurmasDeIngresso,
  listarAlunosVinculados,
  getEventosDeCursosParaGestor,
} from '../controllers/cursosController';

import {
  listarPlanosDeEnsino,
  criarPlanoDeEnsino,
  atualizarPlanoDeEnsino,
  excluirPlanoDeEnsino,
  getTurmasParaPlano
} from '../controllers/planoEnsinoController';

import {
  listarDisciplinasCurso,
  adicionarDisciplinaCurso,
  atualizarDisciplinaCurso,
  deletarDisciplinaCurso,
  listarTodasDisciplinasPosGraduacao,
  listarDisciplinasAgrupadasPorSemestre,
  obterDisciplinaPorId
} from '../controllers/disciplinasController';

import {
  listarAulasGravadas,
  criarAulaGravada,
  atualizarAulaGravada,
  excluirAulaGravada
} from '../controllers/AulasGravadasController';

const aulasUploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'aulas');
if (!fs.existsSync(aulasUploadDir)) {
  fs.mkdirSync(aulasUploadDir, { recursive: true });
}

const aulasStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, aulasUploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const uploadAulas = multer({ storage: aulasStorage });

// Diretório base
const uploadDir = path.join(__dirname, "../../materiais_novos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});


const upload = multer({ dest: "public/materiais_novos/" });

const router = Router();

// ──────────────────────────────────────────────────────────────────────────────
// ENVIAR COMPROVANTES MULTER
// ──────────────────────────────────────────────────────────────────────────────

const comprovantesDir = path.resolve(
  __dirname,
  '..',
  '..',
  'uploads',
  'comprovantes'
);
if (!fs.existsSync(comprovantesDir)) {
  fs.mkdirSync(comprovantesDir, { recursive: true });
}

// Define pasta de armazenamento para contratos assinados
const contratosDir = path.resolve(
  __dirname,
  '..',
  '..',
  'uploads',
  'contratos'
);
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
router.get(
  '/api/alunos/:alunoId/exercicios-online',
  getExerciciosOnlinePorAluno
);


router.get('/api/exercicios/envio/:enviosId/detalhes', getDetalhesExercicio);
router.post(
  '/api/exercicios/:envioId/aluno/:alunoId/salvar-respostas',
  salvarRespostasExercicioOnline
);
router.get(
  '/api/exercicios/:envioId/aluno/:alunoId/tentativas',
  getNumeroTentativas
);
router.get(
  '/api/exercicios/:envioId/aluno/:alunoId/melhor-nota',
  getMelhorNotaExercicio
);
router.get(
  '/api/envios/:envioId/aluno/:alunoId/ultimo-arquivo',
  getUltimoArquivoEnviado
);
router.get('/api/questoes-abertas/professor/:id', listarQuestoesAbertas);
router.put('/api/questoes-abertas/:respostaId', corrigirQuestaoAberta);
router.post(
  '/api/alunos/adicionar-lote',
  uploadAny.single('arquivo'),
  importarUsersLote
);
router.get('/api/alunos/:id/dados-academicos');
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
// router.post('/api/alunos', criarAluno);
router.post('/api/responsaveis', criarResponsavel);
router.post('/api/materias', criarMateria);
router.get('/api/listarFuncionariosMateria', listarFuncionariosMateria);
router.get('/api/listarMateriaisMateria', listarMateriaisMateria);
router.get('/api/listarTurmasMateria', listarTurmasMateria);
router.post('/api/calendario', criarNovoCalendario);
router.get('/api/calendario/:ano_letivo', obterCalendario);
router.post('/api/calendario/unificar', unificarCalendariosLetivos);
router.get('/api/calendarioById/:id', obterCalendarioPorId);
router.get('/api/calendario/gestor/avaliacoes-formatadas', getEventosAvaliacoesFormatados);
router.get('/api/calendario/gestor/eventos-cursos', getEventosCursos);
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
router.get('/turmas', getTurmas);
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
// ROTAS DE MATERIAIS DIDÁTICOS (ajustadas)
router.get('/api/materiais', listarMateriaisNovo);

router.post("/api/materiais", upload.single("arquivo"), criarMaterialNovo);

router.put(
  '/api/materiais/:id',
  uploadAny.single('arquivo'),
  editarMaterialNovo
);

router.delete('/api/materiais/:id', excluirMaterialNovo);
router.get('/api/materiais/:id', buscarMaterialPorId);
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
router.post(
  '/api/funcionarios',
  uploadFuncionarioFoto.single('foto'),
  criarFuncionario
);
router.get('/api/professores/:id', getProfessorById);
router.get('/api/professores/:id/stats', getProfessorStats);
router.delete('/api/professores/:id', excluirProfessor);
router.get('/api/listar_funcionarios', listarFuncionarios);
router.get('/api/calendario/tipo-avaliacao', getTipoAvaliacao);
router.get('/api/boletim/:alunoId', getNotasPorAluno);
router.get(
  '/api/turmas/:turmaId/materias/:materiaId/calendario_gestor',
  getPeriodosCalendarioGestor
);
router.get(
  '/api/turmas/:turmaId/materias/:materiaId/avaliacoes',
  getAvaliacoesByTurmaMateria
);
router.post('/api/avaliacoes', createAvaliacao);
router.put('/api/avaliacoes/:id', updateAvaliacao);
router.delete('/api/avaliacoes/:id', deleteAvaliacao);
router.post('/api/notas/batch', upsertNotas);
router.get('/api/calendario_gestor', getPeriodosCalendarioGestor);

// Rotas para a configuração do calendário da aba "Calendário"
router.get('/api/configuracoes/calendario', getCalendarConfig);
router.put('/api/configuracoes/calendario', updateCalendarConfig);

// ROTAS PARA A GESTÃO DE PERÍODOS LETIVOS (TABELA: configuracoes_periodos_letivos)
router.get('/api/periodos-letivos', getPeriodosLetivos);
router.post('/api/periodos-letivos', syncPeriodosLetivos);
router.get('/api/periodos-letivos/todos', getAllPeriodosLetivos);
router.get('/api/periodos-letivos/atual', getPeriodoLetivoAtual);

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
router.get('/api/alunos/:id/mensalidade', getMensalidadeByAluno);
router.get('/api/alunos/:id/desconto', getDescontoByAluno);
router.get('/api/professores/:id/pagamento', getPagamentoByProfessor);
router.post('/api/financeiro/atualizar-lancamentos', atualizarLancamentos);
router.put(
  '/api/financeiro/transacoes/:id/pagar',
  uploadAny.single('comprovante'),
  pagarTransacao
);
router.post(
  '/api/financeiro/transacoes',
  uploadAny.single('comprovante'),
  criarTransacao
);

router.get('/api/alunos/buscar-por-cpf/:cpf', buscarAlunoPorCPF);

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
  '/api/notificacoes/conversa/:conversaId/usuario/:usuarioId',
  deletarNotificacoesPorConversaEUsuario
);

// --- Rotas para Configurações da Escola ---
router.get('/api/configuracoes-escola', getSchoolConfig);
router.post('/api/configuracoes-escola', saveSchoolConfig);

// --- Rota para Status Geral do Sistema ---
router.get('/api/configuracoes-sistema/status', getSystemConfigStatus);

// 🔹 GET - Listar notificações de mensagens de um usuário (por destinatário_id)
router.get('/api/notificacoes/:id', getNotificacoesPorUsuario);

// 🔹 POST - Criar nova notificação
router.post('/api/notificacoes', criarNotificacao);

// 🔹 PUT - Marcar todas como lidas (lida = 1) para um destinatário
router.put('/api/notificacoes/:id/mensagens-lidas', marcarMensagensComoLidas);

// 🔹 PUT - Marcar como visualizadas (visualizada = 1)
router.put('/api/notificacoes/:usuarioId/visualizadas', marcarComoVisualizadas);

// 🔹 GET - Listar notificações não visualizadas
router.get(
  '/api/notificacoes/:usuarioId/nao-visualizadas',
  listarNaoVisualizadas
);

// 🔹 DELETE - Apagar notificações de uma conversa específica para um destinatário
router.delete(
  '/api/notificacoes/conversa/:conversaId/usuario/:usuarioId',
  deletarNotificacoesPorConversaEUsuario
);

// Criar notificação de evento
router.post('/api/notificacoes-eventos', criarNotificacaoEvento);

// Listar notificações de eventos de um usuário
router.get('/api/notificacoes-eventos/:usuarioId', listarNotificacoesEventos);

// Marcar notificação de evento como lida
router.put(
  '/api/notificacoes-eventos/:notificacaoId/lida',
  marcarNotificacaoEventoComoLida
);

// Marcar notificação de evento como visualizada
router.put(
  '/api/notificacoes-eventos/:notificacaoId/visualizada',
  marcarNotificacaoEventoComoVisualizada
);

router.put(
  '/api/notificacoes/:usuarioId/mensagens-lidas',
  marcarMensagensComoLidas
);

router.put(
  '/api/notificacoes/:usuarioId/conversa/:conversaId/lidas',
  marcarMensagensComoLidas
);

router.get(
  '/api/notificacoes/:usuarioId/nao-visualizadas',
  listarNaoVisualizadas
);
router.put('/api/notificacoes/:usuarioId/visualizadas', marcarComoVisualizadas);

router.delete(
  '/api/notificacoes-eventos/:notificacaoId',
  apagarNotificacaoEvento
);
router.post('/api/notificacoes-eventos', criarNotificacaoEvento);
router.get('/api/notificacoes-eventos/:usuarioId', listarNotificacoesEventos);
router.put(
  '/api/notificacoes-eventos/:notificacaoId/lida',
  marcarNotificacaoEventoComoLida
);
router.put(
  '/api/notificacoes-eventos/:notificacaoId/visualizada',
  marcarNotificacaoEventoComoVisualizada
);
router.get('/api/verificacoes', executarVerificacoes);
router.get(
  '/api/notificacoes-eventos/:usuarioId/nao-visualizadas-contagem',
  contarNaoVisualizadasEventos
);
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
router.put(
  '/api/contratos_preenchidos/:id/upload-contrato',
  uploadAny.single('contrato'),
  enviarArquivoContratoPreenchido
);
router.get('/api/consulta-cep/:cep', consultarCep);
router.get('/api/alunos/:alunoId/responsaveis', listarResponsaveisPorAluno);
router.post('/api/alunos/vincular-responsavel', vincularResponsavel);
router.delete('/api/alunos-responsaveis/:vinculoId', desvincularResponsavel);
router.get('/api/alunos/:id/edit-data', getAlunoEditData);
router.put('/api/alunos/:id', uploadSingleImage('foto'), updateAluno);
router.get('/api/alunos/:id/dashboard', getAlunoDashboardData);
router.get('/api/responsaveis/cpf/:cpf', buscarResponsavelPorCPF);
router.get('/api/usuarios/:id/perfil', getPerfilUsuario);
router.get('/api/funcionarios/:id/edit-data', getFuncionarioEditData);
router.post('/api/funcionarios', uploadSingleImage('foto'), criarFuncionario);
router.put(
  '/api/funcionarios/:id',
  uploadSingleImage('foto'),
  updateFuncionario
);
router.delete('/api/funcionarios/:id', desativarFuncionario);
router.get('/api/ext/feriados/:ano', getFeriados);
// Rotas de configuração de cores
router.get('/api/colors', getColorsController);
router.post('/api/colors', updateColorsController);

// ──────────────────────────────────────────────────────────────────────────────
// ROTAS PARA GERENCIAMENTO DE CURSOS DE PÓS-GRADUAÇÃO
// ──────────────────────────────────────────────────────────────────────────────

// --- ROTA PARA A PÁGINA GERAL DE DISCIPLINAS (GESTOR) ---
router.get('/api/disciplinas-posgraduacao', listarTodasDisciplinasPosGraduacao);

// --- Rota para LISTAR os cursos de pós-graduação cadastrados ---
router.get('/api/cursos-posgraduacao', listarCursosPosGraduacao);

// --- Rota para ADICIONAR um novo curso (página adicionar-curso.tsx) ---
router.post('/api/cursos/adicionar', adicionarCurso);

// --- ROTA CORRIGIDA PARA EXCLUIR ---
router.delete('/api/cursos/:id', excluirCurso);

// --- Rota para ATUALIZAR um curso existente (página editar-curso.tsx) ---
router.put('/api/cursos/:id', atualizarCurso);

// --- Rotas para a página "Configurações do Curso" (Abas internas) ---
router.get('/api/cursos/:id', obterDetalhesCurso);

// --- Aba "Matriz Curricular" ---
router.get('/api/cursos/:cursoId/disciplinas', listarDisciplinasCurso);
router.post('/api/cursos/:cursoId/disciplinas', adicionarDisciplinaCurso);
router.put('/api/cursos/disciplinas/:disciplinaId', atualizarDisciplinaCurso);
router.delete('/api/cursos/disciplinas/:disciplinaId', deletarDisciplinaCurso);
router.get('/api/disciplinas/:id', obterDisciplinaPorId);

// --- Aba "Calendário Acadêmico" ---
router.get('/api/cursos/:cursoId/calendario', listarEventosCalendario);
router.post('/api/cursos/:cursoId/calendario', adicionarEventoCalendario);

// --- Aba "PPC" ---
router.get('/api/cursos/:cursoId/ppc', obterPPC);
router.post('/api/cursos/:cursoId/ppc', salvarPPC);

// --- Aba "Vinculados" ---
router.get('/api/cursos/:cursoId/vinculados', obterVinculadosCurso);

router.post(
  '/api/alunos/:id/documentos', 
  uploadAny.any(),
  uploadDocumentosAluno
);

// =======================================================================
// ROTAS PARA O FLUXO DE CADASTRO DE ALUNOS (SEÇÃO CORRIGIDA)
// =======================================================================

// 1. Busca aluno por CPF (Etapa 1 do formulário)
router.get('/api/alunos/buscar-por-cpf/:cpf', buscarAlunoPorCPF);

// 2. Cria um novo aluno (Etapa 2 do formulário, sem ID na URL)
router.post('/api/alunos', uploadSingleImage('foto'), criarOuAtualizarAluno);

// 3. Atualiza um aluno existente (se o formulário for usado para edição, com ID na URL)
router.put('/api/alunos/:id', uploadSingleImage('foto'), criarOuAtualizarAluno);

// Adicione esta linha junto com as outras rotas de gerenciamento de alunos na turma
router.patch('/api/alunos-turmas/:vinculoId/status', updateAlunoTurmaStatus);


// =======================================================================
// OUTRAS ROTAS DE ALUNOS (ORGANIZADAS)
// =======================================================================

// Rota para listar todos os alunos
router.get('/api/listar_alunos', listarAlunos);

// Rota para obter dados de um aluno específico
router.get('/api/alunos/:id', getAlunoById);

// Rota para desativar (excluir) um aluno
router.delete('/api/alunos/:id', excluirAluno);

// Rota para obter os responsáveis de um aluno
router.get('/api/alunos/:id/responsaveis', getResponsaveisByAluno);


// =======================================================================
// ROTAS DE RESPONSÁVEIS
// =======================================================================

// Busca responsável por CPF
router.get('/api/responsaveis/cpf/:cpf', buscarResponsavelPorCPF);

// Cria um novo responsável e o vincula a um aluno
router.post('/api/alunos/:alunoId/responsaveis', criarResponsavelEAssociar);

// Vincula um responsável já existente a um aluno
router.post('/api/alunos/vincular-responsavel', vincularResponsavel);

// Desvincula um responsável de um aluno (pelo ID do vínculo)
router.delete('/api/alunos-responsaveis/:vinculoId', desvincularResponsavel);

// ROTAS DE MATRÍCULA / VÍNCULO
router.post('/api/matriculas/vincular-aluno-curso', vincularAlunoCursoPosGraduacao);

// --- Aba "Vinculados" ---
router.get('/api/cursos/:cursoId/vinculados', obterVinculadosCurso);

// ==============================================================================
// ROTAS PARA A NOVA GESTÃO DE TURMAS (PÓS-GRADUAÇÃO)
// ==============================================================================

// Rotas para o CRUD de Turmas
router.get('/api/turmas-novo/:id', getTurmaByIdNovo);

// Rotas para o CRUD de Turmas
router.get('/api/turmas-novo', getTurmasNovo);
router.post('/api/turmas-novo', createTurmaNovo);
router.get('/api/turmas-novo/:id', getTurmaByIdNovo);
router.put('/api/turmas-novo/:id', updateTurmaNovo);
router.delete('/api/turmas-novo/:id', deleteTurmaNovo);
router.get('/api/turmas-novo/:turmaId/alunos-disponiveis', getAlunosDisponiveisParaTurma);
router.post('/api/turmas-novo/:turmaId/adicionar-alunos', adicionarAlunosTurma);
router.delete('/api/turmas-novo/:turmaId/alunos/:alunoId', removerAlunoDaTurma);

// Rotas para popular os selects do formulário
router.get('/api/form-data/cursos', getCursosParaForm);
router.get('/api/form-data/materias/:cursoId', getMateriasPorCursoParaForm);
router.get('/api/form-data/semestres', getSemestresParaForm);
router.get('/api/form-data/professores', getProfessoresParaForm);

// ROTA PARA BUSCAR TURMAS VINCULADAS A UMA DISCIPLINA
router.get('/api/disciplinas/:disciplinaId/turmas', listarTurmasPorDisciplina);
router.get('/api/disciplinas/:disciplinaId/turmas-ativas-para-aulas', listarTurmasAtivasParaAulas);

//PÁGINA DE VISUALIZAÇÃO COMPLETA
router.get('/api/alunos/:id/detalhes-completos', getDetalhesCompletosAluno);

// ==============================================================================
// ROTAS PARA O NOVO MÓDULO DE NOTAS E APROVAÇÃO
// ==============================================================================

// Rota para o CRUD de Avaliações
router.get('/api/turmas/:turmaId/materias/:materiaId/periodos/:calendarioId/avaliacoes', getAvaliacoesByTurmaMateria);
router.post('/api/avaliacoes', createAvaliacao);
router.put('/api/avaliacoes/:id', updateAvaliacao);
router.delete('/api/avaliacoes/:id', deleteAvaliacao);

// Rota principal que busca todos os dados de notas, médias e status para a tela do professor
// A rota que o frontend está chamando
router.get('/api/turmas/:turmaId/disciplinas/:materiaId/periodos/:calendarioId/dados-academicos', getDadosAcademicosCompletos);

// Rota para salvar uma nota individual (regular ou de recuperação)
router.post('/api/notas/salvar', upsertNotas);

// Lista de Turmas de Ingresso
router.get('/api/turmas-ingresso', listarTurmasDeIngresso);

//Listar alunos vinculados ao curso
router.get('/api/cursos/:cursoId/alunos-vinculados', listarAlunosVinculados);

//Update Vinculo
router.patch('/api/vincular-aluno-curso/:vinculoId/status', updateStatusVinculo);

router.post(
  '/api/alunos/:alunoId/documentos/:documentoId/atualizar',
  uploadSingleDoc('documento'),
  atualizarDocumentoAluno
);

// ==============================================================================
// ROTAS PARA GESTÃO DE GRADES CURRICULARES
// ==============================================================================
router.post('/api/grades', createGrade);
router.get('/api/grades', getGrades);
router.put('/api/grades/:id', updateGrade);
router.delete('/api/grades/:id', deleteGrade);
router.get('/api/grades/form-data/materias', getMateriasForGradeForm);
router.get('/api/grades/form-data/periodos-letivos', getPeriodosLetivosForForm);
router.get('/api/grades/form-data/disciplinas-por-curso/:cursoId', getDisciplinasByCursoGrouped);
router.get('/api/grades/por-curso/:cursoId', getGradesByCurso);
router.get('/api/cursos/:cursoId/disciplinas-agrupadas', listarDisciplinasAgrupadasPorSemestre);

// --- ROTA PARA A NOVA ABA DE RELATÓRIOS DA DISCIPLINA ---
router.get('/api/disciplinas/:disciplinaId/relatorios', getRelatoriosDisciplina);

// --- ROTA PARA O CALENDÁRIO DO GESTOR ---
router.get('/api/calendario/gestor/eventos-cursos', getEventosDeCursosParaGestor);

// ==============================================================================
// ROTAS PARA AULAS GRAVADAS (CRUD)
// ==============================================================================
router.get('/api/aulas-gravadas', listarAulasGravadas);
router.post('/api/aulas-gravadas', uploadAulas.single('arquivo'), criarAulaGravada);
router.put('/api/aulas-gravadas/:id', uploadAulas.single('arquivo'), atualizarAulaGravada);
router.delete('/api/aulas-gravadas/:id', excluirAulaGravada);

// ==============================================================================
// ROTAS PARA INFORMAÇÕES COMPLEMENTARES (DISCIPLINA)
// ==============================================================================
router.get('/api/disciplinas/:disciplinaId/informacoes', listarInformacoes);
router.post('/api/disciplinas/:disciplinaId/informacoes', criarInformacao);
router.put('/api/informacoes/:id', atualizarInformacao);
router.delete('/api/informacoes/:id', excluirInformacao);

// ==============================================================================
// ROTAS PARA PLANO DE ENSINO (DISCIPLINA)
// ==============================================================================
router.get('/api/disciplinas/:disciplinaId/planos-ensino', listarPlanosDeEnsino);
router.post('/api/disciplinas/:disciplinaId/planos-ensino', criarPlanoDeEnsino);
router.put('/api/planos-ensino/:planoId', atualizarPlanoDeEnsino);
router.delete('/api/planos-ensino/:planoId', excluirPlanoDeEnsino);
router.get('/api/disciplinas/:disciplinaId/turmas-para-plano', getTurmasParaPlano);

// ==============================================================================
// ROTAS PARA AVISOS (DISCIPLINA)
// ==============================================================================
router.get('/api/disciplinas/:disciplinaId/avisos', listarAvisos);
router.post('/api/disciplinas/:disciplinaId/avisos', criarAviso);
router.put('/api/avisos/:avisoId', atualizarAviso);
router.delete('/api/avisos/:avisoId', excluirAviso);
router.get('/api/disciplinas/:disciplinaId/turmas-para-avisos', getTurmasParaAvisos);

export default router;
