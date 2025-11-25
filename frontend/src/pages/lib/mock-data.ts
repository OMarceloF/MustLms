// =====================================================
// ARQUIVO DE MOCKS REFATORADO (Versão Final)
// Incluído todos os mocks necessários para as abas Cursos, Disciplinas, Professores, Alunos e Institucional.
// =====================================================

import type { Disciplina, Professor, Turma, Aluno, Category, Comunicado } from './types';


// --- MOCKS DE CURSOS (Usado em CursosTab, DisciplinasTab e AlunosTab) ---
export const cursos: {
  id: string;
  nome: string;
  modalidade: string;
  coordenador: string;
  alunosAtivos: number;
  taxaAprovacao: number;
  taxaEvasao: number;
  mediaNota: number;
}[] = [
  {
    id: 'adm',
    nome: 'Administração',
    modalidade: 'presencial',
    coordenador: 'Dr. João Silva',
    alunosAtivos: 250,
    taxaAprovacao: 82,
    taxaEvasao: 6,
    mediaNota: 7.2,
  },
  {
    id: 'si',
    nome: 'Sistemas de Informação',
    modalidade: 'hibrido',
    coordenador: 'Dra. Maria Santos',
    alunosAtivos: 180,
    taxaAprovacao: 85,
    taxaEvasao: 5,
    mediaNota: 7.5,
  },
  {
    id: 'ped',
    nome: 'Pedagogia',
    modalidade: 'presencial',
    coordenador: 'Dr. Carlos Oliveira',
    alunosAtivos: 120,
    taxaAprovacao: 88,
    taxaEvasao: 4,
    mediaNota: 7.8,
  },
  {
    id: 'dir',
    nome: 'Direito',
    modalidade: 'presencial',
    coordenador: 'Dra. Ana Paula',
    alunosAtivos: 200,
    taxaAprovacao: 78,
    taxaEvasao: 8,
    mediaNota: 6.9,
  },
  {
    id: 'enf',
    nome: 'Enfermagem',
    modalidade: 'presencial',
    coordenador: 'Dr. Felipe Costa',
    alunosAtivos: 70,
    taxaAprovacao: 90,
    taxaEvasao: 3,
    mediaNota: 8.1,
  },
];

// --- MOCKS DE DISCIPLINAS (Usado em CursosTab, DisciplinasTab e ProfessoresTab) ---
export const disciplinas: Disciplina[] = [
  { id: 'd1', nome: 'Contabilidade I', cursoId: 'adm', codigo: 'ADM101' },
  { id: 'd2', nome: 'Gestão Estratégica', cursoId: 'adm', codigo: 'ADM102' },
  { id: 'd3', nome: 'Direito Comercial', cursoId: 'adm', codigo: 'ADM103' },
  { id: 'd4', nome: 'Programação I', cursoId: 'si', codigo: 'SI101' },
  { id: 'd5', nome: 'Banco de Dados', cursoId: 'si', codigo: 'SI102' },
  { id: 'd6', nome: 'Redes de Computadores', cursoId: 'si', codigo: 'SI103' },
  { id: 'd7', nome: 'Didática Geral', cursoId: 'ped', codigo: 'PED101' },
  {
    id: 'd8',
    nome: 'Psicologia da Educação',
    cursoId: 'ped',
    codigo: 'PED102',
  },
  {
    id: 'd9',
    nome: 'Direito Constitucional',
    cursoId: 'dir',
    codigo: 'DIR101',
  },
  { id: 'd10', nome: 'Direito Civil', cursoId: 'dir', codigo: 'DIR102' },
  { id: 'd11', nome: 'Anatomia Humana', cursoId: 'enf', codigo: 'ENF101' },
  { id: 'd12', nome: 'Farmacologia', cursoId: 'enf', codigo: 'ENF102' },
];

// --- MOCKS DE PROFESSORES (Usado em ProfessoresTab) ---
export const professores: Professor[] = [
  {
    id: 'p1',
    nome: 'Ana Souza',
    departamento: 'Administração',
    titulacao: 'Mestre',
  },
  {
    id: 'p2',
    nome: 'Carlos Lima',
    departamento: 'Tecnologia',
    titulacao: 'Doutor',
  },
  {
    id: 'p3',
    nome: 'Fernanda Rocha',
    departamento: 'Educação',
    titulacao: 'Especialista',
  },
  {
    id: 'p4',
    nome: 'Dr. Roberto Martins',
    departamento: 'Direito',
    titulacao: 'Doutor',
  },
  {
    id: 'p5',
    nome: 'Dra. Patricia Silva',
    departamento: 'Saúde',
    titulacao: 'Doutora',
  },
  {
    id: 'p6',
    nome: 'João Pereira',
    departamento: 'Tecnologia',
    titulacao: 'Mestre',
  },
];

// --- MOCKS DE TURMAS (Usado em CursosTab, DisciplinasTab e ProfessoresTab) ---
export const turmas: Turma[] = [
  {
    id: 't1',
    nome: 'Contabilidade I - Turma A',
    cursoId: 'adm',
    disciplinaId: 'd1',
    periodoId: '2024_2',
    professorId: 'p1',
    totalAlunos: 45,
    aprovados: 38,
    reprovados: 5,
    desistentes: 2,
    presenciaMedia: 88,
  },
  {
    id: 't2',
    nome: 'Contabilidade I - Turma B',
    cursoId: 'adm',
    disciplinaId: 'd1',
    periodoId: '2024_2',
    professorId: 'p1',
    totalAlunos: 42,
    aprovados: 35,
    reprovados: 6,
    desistentes: 1,
    presenciaMedia: 85,
  },
  {
    id: 't3',
    nome: 'Programação I - Turma A',
    cursoId: 'si',
    disciplinaId: 'd4',
    periodoId: '2024_2',
    professorId: 'p2',
    totalAlunos: 40,
    aprovados: 35,
    reprovados: 4,
    desistentes: 1,
    presenciaMedia: 92,
  },
  {
    id: 't4',
    nome: 'Banco de Dados',
    cursoId: 'si',
    disciplinaId: 'd5',
    periodoId: '2024_2',
    professorId: 'p2',
    totalAlunos: 38,
    aprovados: 33,
    reprovados: 4,
    desistentes: 1,
    presenciaMedia: 90,
  },
  {
    id: 't5',
    nome: 'Didática Geral',
    cursoId: 'ped',
    disciplinaId: 'd7',
    periodoId: '2024_2',
    professorId: 'p3',
    totalAlunos: 35,
    aprovados: 32,
    reprovados: 2,
    desistentes: 1,
    presenciaMedia: 94,
  },
];

// --- MOCKS DE ALUNOS (Usado em AlunosTab) ---
export const alunos: Aluno[] = [
  {
    id: 'a1',
    nome: 'Alice Silva',
    matricula: '2024001',
    cursoId: 'adm',
    periodoAtual: 3,
    mediaSemestral: 8.5,
    presencaGlobal: 95,
    situacao: 'ativo',
    mediaAcumulada: 7.8,
  },
  {
    id: 'a2',
    nome: 'Bruno Costa',
    matricula: '2023015',
    cursoId: 'si',
    periodoAtual: 5,
    mediaSemestral: 7.2,
    presencaGlobal: 88,
    situacao: 'ativo',
    mediaAcumulada: 7.5,
  },
  {
    id: 'a3',
    nome: 'Carla Oliveira',
    matricula: '2022030',
    cursoId: 'adm',
    periodoAtual: 7,
    mediaSemestral: 9.1,
    presencaGlobal: 98,
    situacao: 'concluido',
    mediaAcumulada: 8.9,
  },
  {
    id: 'a4',
    nome: 'Daniel Santos',
    matricula: '2024005',
    cursoId: 'ped',
    periodoAtual: 1,
    mediaSemestral: 6.8,
    presencaGlobal: 75,
    situacao: 'ativo',
    mediaAcumulada: 6.8,
  },
  {
    id: 'a5',
    nome: 'Eduarda Lima',
    matricula: '2023022',
    cursoId: 'si',
    periodoAtual: 4,
    mediaSemestral: 5.5,
    presencaGlobal: 80,
    situacao: 'trancado',
    mediaAcumulada: 6.5,
  },
];

// --- MOCKS INSTITUCIONAIS (Usado em InstitucionalTab) ---

export const metricasInstitucionais = {
  alunosAtivos: 820,
  taxaRetencaoGeral: 92,
  taxaEvasaoGeral: 8,
  taxaMediaAprovacao: 84,
  tempoMedioConclusao: 48,
  professorAtivos: 55,
  cursosAtivos: 12,
  turmasAbertas: 65,
};

export const dadosEvolucaoMatriculas = [
  { semestre: '2022.1', ingressantes: 150, desligados: 20, totalAtivos: 750 },
  { semestre: '2022.2', ingressantes: 180, desligados: 25, totalAtivos: 805 },
  { semestre: '2023.1', ingressantes: 160, desligados: 22, totalAtivos: 843 },
  { semestre: '2023.2', ingressantes: 190, desligados: 30, totalAtivos: 863 },
  { semestre: '2024.1', ingressantes: 170, desligados: 28, totalAtivos: 820 },
];

export const dadosDesempenhoAcademico = [
  { semestre: '2023.1', aprovacao: 80, reprovacao: 15, desistencia: 5 },
  { semestre: '2023.2', aprovacao: 82, reprovacao: 13, desistencia: 5 },
  { semestre: '2024.1', aprovacao: 85, reprovacao: 10, desistencia: 5 },
  { semestre: '2024.2', aprovacao: 88, reprovacao: 8, desistencia: 4 },
];

export const dadosEvasaoPorCurso = [
  { curso: 'Direito', evasaoPercentual: 8 },
  { curso: 'Administração', evasaoPercentual: 6 },
  { curso: 'Sistemas de Informação', evasaoPercentual: 5 },
  { curso: 'Pedagogia', evasaoPercentual: 4 },
  { curso: 'Enfermagem', evasaoPercentual: 3 },
];

export const dadosModalidade = [
  { name: 'Presencial', value: 65, fill: '#3b82f6' },
  { name: 'Híbrido', value: 20, fill: '#f59e0b' },
  { name: 'EAD', value: 15, fill: '#10b981' },
];

export const satisfacaoPorCurso = [
  { nome: 'Corpo Docente', satisfacao: 90 },
  { nome: 'Infraestrutura', satisfacao: 75 },
  { nome: 'Metodologia', satisfacao: 85 },
  { nome: 'Suporte', satisfacao: 80 },
];

// --- MOCKS ADICIONAIS (Mantidos para o futuro) ---
export const periodosLetivos = [
  { id: '2023_1', nome: '2023.1' },
  { id: '2023_2', nome: '2023.2' },
  { id: '2024_1', nome: '2024.1' },
  { id: '2024_2', nome: '2024.2' },
  { id: '2025_1', nome: '2025.1' },
];

// --- MOCK DE FREQUÊNCIA (Usado em LineChartFrequencia) ---
export const frequenciaData = [
  { month: 'Jan', '2024': 92, '2025': 94 },
  { month: 'Fev', '2024': 90, '2025': 93 },
  { month: 'Mar', '2024': 91, '2025': 95 },
  { month: 'Abr', '2024': 89, '2025': 94 },
  { month: 'Mai', '2024': 93, '2025': 96 },
  { month: 'Jun', '2024': 91, '2025': 95 },
  { month: 'Jul', '2024': 88, '2025': 93 },
  { month: 'Ago', '2024': 90, '2025': 94 },
  { month: 'Set', '2024': 92, '2025': 95 },
  { month: 'Out', '2024': 91, '2025': 94 },
];

// --- MOCK DE DESEMPENHO POR TURMA (Usado em BarChartDesempenho) ---
export const desempenhoTurmasData = [
  { turma: 'Contabilidade I - Turma A', desempenho: 95 },
  { turma: 'Contabilidade I - Turma B', desempenho: 92 },
  { turma: 'Programação I - Turma A', desempenho: 89 },
  { turma: 'Banco de Dados', desempenho: 88 },
  { turma: 'Didática Geral', desempenho: 86 },
];

export const ciclosData = [
  { name: 'Educação Infantil', value: 320, color: '#363776' },
  { name: 'Fundamental I', value: 412, color: '#9dba32' },
  { name: 'Fundamental II', value: 356, color: '#3b82f6' },
  { name: 'Ensino Médio', value: 160, color: '#f59e0b' },
];

// --- MOCK DE EVENTOS (Usado em MiniCalendar) ---
export const eventos = [
  {
    id: '1',
    title: 'Prova de Matemática - 9º Ano',
    date: new Date(2025, 0, 20),
    type: 'prova',
    description: 'Avaliação bimestral',
  },
  {
    id: '2',
    title: 'Reunião de Pais',
    date: new Date(2025, 0, 22),
    type: 'evento',
    description: 'Discussão sobre o desempenho do 1º bimestre',
  },
  {
    id: '3',
    title: 'Aula de Campo - Ciências',
    date: new Date(2025, 0, 25),
    type: 'aula-especial',
    description: 'Visita ao museu de ciências',
  },
  {
    id: '4',
    title: 'Entrega de Trabalho de História',
    date: new Date(2025, 0, 27),
    type: 'entrega',
    description: 'Trabalho sobre a Era Vargas',
  },
];

// --- MOCK DE COMUNICADOS (Usado em AvisosPanel) ---
export const comunicados: Comunicado[] = [
  {
    id: '1',
    title: 'Atualização do Calendário Escolar 2025',
    author: 'Diretoria',
    date: new Date(2025, 0, 15),
    category: 'geral',
    excerpt:
      'Foram realizadas alterações importantes no calendário escolar deste ano...',
  },
  {
    id: '2',
    title: 'Reunião Pedagógica - Fundamental II',
    author: 'Coordenação Pedagógica',
    date: new Date(2025, 0, 14),
    category: 'professores',
    excerpt: 'Convocação para reunião pedagógica...',
  },
  {
    id: '3',
    title: 'Aviso Importante ao Segmento',
    author: 'Coordenação Geral',
    date: new Date(2025, 0, 11),
    category: 'segmento',
    excerpt: 'Informações relevantes para o segmento institucional...',
  },
  {
    id: '4',
    title: 'Atividades Extracurriculares',
    author: 'Coordenação de Esportes',
    date: new Date(2025, 0, 12),
    category: 'alunos',
    excerpt: 'Novos horários para as atividades...',
  },
];

// --- MOCK DE ATIVIDADES RECENTES (Usado em AtividadesRecentes.tsx) ---
export const atividadesRecentes = [
  {
    id: '1',
    description: 'Aluno João Silva matriculado no 7º Ano A',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'matricula',
  },
  {
    id: '2',
    description: 'Nova turma criada: 1º Ano B - Educação Infantil',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: 'turma',
  },
  {
    id: '3',
    description: 'Prof. Maria publicou novo conteúdo em Matemática',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    type: 'post',
  },
  {
    id: '4',
    description: 'Evento "Feira de Ciências" agendado para 15/02',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    type: 'evento',
  },
  {
    id: '5',
    description: 'Aluna Ana Costa matriculada no 9º Ano B',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'matricula',
  },
  {
    id: '6',
    description: 'Nova turma criada: 5º Ano C - Fundamental I',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
    type: 'turma',
  },
];

// --- MOCK DE KPIs (Usado na homepage / dashboard principal) ---
export const kpiData = [
  {
    id: 'alunos',
    title: 'Total de Alunos',
    value: 1248,
    trend: 12,
    period: '2025',
    icon: 'users',
  },
  {
    id: 'professores',
    title: 'Total de Professores',
    value: 87,
    trend: 5,
    period: 'últimos 30 dias',
    icon: 'user-check',
  },
  {
    id: 'responsaveis',
    title: 'Total de Responsáveis',
    value: 956,
    trend: 8,
    period: '2025',
    icon: 'user-circle',
  },
  {
    id: 'turmas',
    title: 'Turmas Ativas',
    value: 42,
    trend: 0,
    period: '2025',
    icon: 'layers',
  },
  {
    id: 'frequencia',
    title: 'Taxa de Frequência Geral',
    value: '94.5%',
    trend: 3,
    period: 'últimos 30 dias',
    icon: 'check-circle',
  },
  {
    id: 'engajamento',
    title: 'Engajamento na Plataforma',
    value: '78%',
    trend: 15,
    period: 'últimos 30 dias',
    icon: 'activity',
  },
];
