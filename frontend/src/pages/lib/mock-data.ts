import type { Curso, Materia, Professor, Turma } from "./types"

export const cursos: Curso[] = [
  { id: "1", nome: "Mestrado em Ciência da Computação", nivel: "Mestrado" },
  { id: "2", nome: "Doutorado em Engenharia de Software", nivel: "Doutorado" },
  { id: "3", nome: "Mestrado em Inteligência Artificial", nivel: "Mestrado" },
]

export const materias: Materia[] = [
  { id: "1", nome: "Algoritmos Avançados", cursoId: "1", cargaHoraria: 60 },
  { id: "2", nome: "Estruturas de Dados", cursoId: "1", cargaHoraria: 60 },
  { id: "3", nome: "Arquitetura de Software", cursoId: "2", cargaHoraria: 45 },
  { id: "4", nome: "Testes de Software", cursoId: "2", cargaHoraria: 45 },
  { id: "5", nome: "Machine Learning", cursoId: "3", cargaHoraria: 60 },
  { id: "6", nome: "Redes Neurais", cursoId: "3", cargaHoraria: 60 },
]

export const professores: Professor[] = [
  { id: "1", nome: "Dr. João Silva", titulacao: "Doutor" },
  { id: "2", nome: "Dra. Maria Santos", titulacao: "Doutora" },
  { id: "3", nome: "Dr. Pedro Oliveira", titulacao: "Doutor" },
  { id: "4", nome: "Dra. Ana Costa", titulacao: "Doutora" },
]

export const turmas: Turma[] = [
  {
    id: "1",
    nomeTurma: "Turma A - 2024/1",
    cursoId: "1",
    materiasIds: ["1", "2"],
    anoInicio: 2024,
    semestre: 1,
    responsavelId: "1",
    modalidade: "Presencial",
    quantidadeAlunos: 25,
    status: "Ativa",
    descricao: "Turma inaugural do programa de mestrado",
  },
  {
    id: "2",
    nomeTurma: "Turma B - 2024/1",
    cursoId: "2",
    materiasIds: ["3", "4"],
    anoInicio: 2024,
    semestre: 1,
    responsavelId: "2",
    modalidade: "Híbrido",
    quantidadeAlunos: 15,
    status: "Ativa",
    descricao: "Turma com foco em metodologias ágeis",
  },
  {
    id: "3",
    nomeTurma: "Turma C - 2024/2",
    cursoId: "3",
    materiasIds: ["5", "6"],
    anoInicio: 2024,
    semestre: 2,
    responsavelId: "3",
    modalidade: "EAD",
    quantidadeAlunos: 30,
    status: "Em Planejamento",
    descricao: "Turma com ênfase em deep learning",
  },
]


// Mock data for the Manager Dashboard

export interface KpiData {
  id: string;
  title: string;
  value: string | number;
  trend: number;
  period: string;
  icon: string;
}

export interface EventData {
  id: string;
  title: string;
  date: Date;
  type: 'prova' | 'evento' | 'aula-especial' | 'entrega';
  description: string;
}

export interface ComunicadoData {
  id: string;
  title: string;
  author: string;
  date: Date;
  category: 'geral' | 'segmento' | 'professores' | 'alunos';
  excerpt: string;
}

export interface AtividadeRecenteData {
  id: string;
  description: string;
  timestamp: Date;
  type: 'matricula' | 'turma' | 'post' | 'evento';
}

export const kpiData: KpiData[] = [
  {
    id: 'alunos',
    title: 'Total de Alunos',
    value: 1248,
    trend: 12,
    period: '2025',
    icon: 'users'
  },
  {
    id: 'professores',
    title: 'Total de Professores',
    value: 87,
    trend: 5,
    period: 'últimos 30 dias',
    icon: 'user-check'
  },
  {
    id: 'responsaveis',
    title: 'Total de Responsáveis',
    value: 956,
    trend: 8,
    period: '2025',
    icon: 'user-circle'
  },
  {
    id: 'turmas',
    title: 'Turmas Ativas',
    value: 42,
    trend: 0,
    period: '2025',
    icon: 'layers'
  },
  {
    id: 'frequencia',
    title: 'Taxa de Frequência Geral',
    value: '94.5%',
    trend: 3,
    period: 'últimos 30 dias',
    icon: 'check-circle'
  },
  {
    id: 'engajamento',
    title: 'Engajamento na Plataforma',
    value: '78%',
    trend: 15,
    period: 'últimos 30 dias',
    icon: 'activity'
  }
];

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

export const desempenhoTurmasData = [
  { turma: '9º A', desempenho: 95 },
  { turma: '8º B', desempenho: 92 },
  { turma: '7º A', desempenho: 89 },
  { turma: '9º B', desempenho: 88 },
  { turma: '6º A', desempenho: 86 },
  { turma: '8º A', desempenho: 84 },
  { turma: '7º B', desempenho: 82 },
  { turma: '6º B', desempenho: 80 },
];

export const ciclosData = [
  { name: 'Educação Infantil', value: 320, color: '#363776' },
  { name: 'Fundamental I', value: 412, color: '#9dba32' },
  { name: 'Fundamental II', value: 356, color: '#3b82f6' },
  { name: 'Ensino Médio', value: 160, color: '#f59e0b' },
];

export const eventos: EventData[] = [
  {
    id: '1',
    title: 'Prova de Matemática - 9º Ano',
    date: new Date(2025, 0, 20),
    type: 'prova',
    description: 'Avaliação bimestral'
  },
  {
    id: '2',
    title: 'Reunião de Pais',
    date: new Date(2025, 0, 22),
    type: 'evento',
    description: 'Discussão sobre o desempenho do 1º bimestre'
  },
  {
    id: '3',
    title: 'Aula de Campo - Ciências',
    date: new Date(2025, 0, 25),
    type: 'aula-especial',
    description: 'Visita ao museu de ciências'
  },
  {
    id: '4',
    title: 'Entrega de Trabalho de História',
    date: new Date(2025, 0, 27),
    type: 'entrega',
    description: 'Trabalho sobre a Era Vargas'
  },
];

export const comunicados: ComunicadoData[] = [
  {
    id: '1',
    title: 'Atualização do Calendário Escolar 2025',
    author: 'Diretoria',
    date: new Date(2025, 0, 15),
    category: 'geral',
    excerpt: 'Foram realizadas alterações importantes no calendário escolar deste ano...'
  },
  {
    id: '2',
    title: 'Reunião Pedagógica - Fundamental II',
    author: 'Coordenação Pedagógica',
    date: new Date(2025, 0, 14),
    category: 'professores',
    excerpt: 'Convocação para reunião pedagógica na próxima sexta-feira...'
  },
  {
    id: '3',
    title: 'Matrículas Abertas para 2026',
    author: 'Secretaria',
    date: new Date(2025, 0, 13),
    category: 'geral',
    excerpt: 'Estão abertas as matrículas para o próximo ano letivo...'
  },
  {
    id: '4',
    title: 'Atividades Extracurriculares',
    author: 'Coordenação de Esportes',
    date: new Date(2025, 0, 12),
    category: 'alunos',
    excerpt: 'Novos horários para as atividades extracurriculares...'
  },
  {
    id: '5',
    title: 'Formação Continuada - BNCC',
    author: 'Coordenação Pedagógica',
    date: new Date(2025, 0, 10),
    category: 'professores',
    excerpt: 'Workshop sobre implementação da BNCC nas práticas pedagógicas...'
  },
];

export const atividadesRecentes: AtividadeRecenteData[] = [
  {
    id: '1',
    description: 'Aluno João Silva matriculado no 7º Ano A',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'matricula'
  },
  {
    id: '2',
    description: 'Nova turma criada: 1º Ano B - Educação Infantil',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: 'turma'
  },
  {
    id: '3',
    description: 'Prof. Maria publicou novo conteúdo em Matemática',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    type: 'post'
  },
  {
    id: '4',
    description: 'Evento "Feira de Ciências" agendado para 15/02',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    type: 'evento'
  },
  {
    id: '5',
    description: 'Aluna Ana Costa matriculada no 9º Ano B',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'matricula'
  },
  {
    id: '6',
    description: 'Nova turma criada: 5º Ano C - Fundamental I',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
    type: 'turma'
  },
];
