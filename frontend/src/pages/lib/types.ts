export interface Curso {
  id: string
  nome: string
  nivel: "Mestrado" | "Doutorado"
}

export interface Materia {
  id: string
  nome: string
  cursoId: string
  cargaHoraria: number
}

export interface Professor {
  id: string
  nome: string
  titulacao: string
}

export interface Turma {
  id: number
  nomeTurma: string
  cursoId: string
  materiasIds: string[]
  anoInicio: number
  semestre: string
  responsavelId: string
  modalidade: "Presencial" | "Híbrido" | "EAD"
  quantidadeAlunos?: number
  status: "Ativa" | "Em Planejamento" | "Encerrada"
  descricao?: string
  cursoNome?: string;
  semestreNome?: string;
  responsavelNome?: string;
  materiasNomes?: string[];
  disciplinaId: string;
  disciplinaNome?: string
}


export interface PeriodoLetivo {
  id: string
  nome: string // "2023.1", "2023.2", etc.
}

export interface Curso {
  id: string
  nome: string
  modalidade: "presencial" | "ead" | "hibrido"
  coordenador: string
  alunosAtivos: number
  taxaAprovacao: number
  taxaEvasao: number
  mediaNota: number
}

export interface Disciplina {
  id: string
  nome: string
  cursoId: string
  codigo: string
}

export interface Turma {
  id: number
  nome: string
  cursoId: string
  disciplinaId: string
  periodoId: string
  professorId: string
  totalAlunos: number
  aprovados: number
  reprovados: number
  desistentes: number
  presenciaMedia: number
}

export interface Professor {
  id: string
  nome: string
  departamento?: string
}

export interface Aluno {
  id: string
  nome: string
  matricula: string
  cursoId: string
  periodoAtual: number
  mediaSemestral: number
  mediaAcumulada: number
  presencaGlobal: number
  situacao: "ativo" | "trancado" | "concluido"
}

export interface DisciplinaAluno {
  id: string
  alunoId: string
  disciplinaId: string
  professorId: string
  periodoId: string
  notaFinal: number
  frequencia: number
  situacao: "aprovado" | "reprovado" | "cursando"
  disciplinaNome: string
  professorNome: string
}

export interface MetricaInstituicional {
  alunosAtivos: number
  taxaRetencaoGeral: number
  taxaEvasaoGeral: number
  taxaMediaAprovacao: number
  tempoMedioConclusao: number
  professorAtivos: number
  cursosAtivos: number
  turmasAbertas: number
}

export interface FiltrosRelatorio {
  periodoId: string
  cursoId: string
  disciplinaId: string
  turmaId: string
  professorId: string
  modalidade: "todos" | "presencial" | "ead" | "hibrido"
  ano: string
}

export interface DadoGraficoEvolucao {
  semestre: string
  ingressantes: number
  desligados: number
  totalAtivos: number
}

export interface DadoGraficoDesempenho {
  semestre: string
  aprovacao: number
  reprovacao: number
  desistencia: number
}

export interface DadoGraficoTurma {
  turma: string
  aprovados: number
  reprovados: number
  desistentes: number
}