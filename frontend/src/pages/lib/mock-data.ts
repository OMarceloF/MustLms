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
