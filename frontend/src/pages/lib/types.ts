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
}
