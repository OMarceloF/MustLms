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
  id: string
  nomeTurma: string
  cursoId: string
  materiasIds: string[]
  anoInicio: number
  semestre: 1 | 2
  responsavelId: string
  modalidade: "Presencial" | "Híbrido" | "EAD"
  quantidadeAlunos?: number
  status: "Ativa" | "Em Planejamento" | "Encerrada"
  descricao?: string
}
