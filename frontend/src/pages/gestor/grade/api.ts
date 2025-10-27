// API functions for curriculum management

export type Curso = {
  id: number;
  nome: string;
  tipo: 'Graduação' | 'Pós' | 'Mestrado' | 'Doutorado';
};

export type Materia = {
  id: number;
  nome: string;
  codigo: string;
  cargaHoraria: number;
};

export type Periodo = {
  id: number;
  nome: string;
  materias: Materia[];
};

export type GradeCurricular = {
  id: number;
  curso: Curso;
  periodoAcademico: string;
  periodos: Periodo[];
};

const API_BASE_URL = '/api/grades';

export async function getGrades(filters?: {
  curso?: string;
  periodo?: string;
}): Promise<GradeCurricular[]> {
  const params = new URLSearchParams();
  if (filters?.curso) params.append('curso', filters.curso);
  if (filters?.periodo) params.append('periodo', filters.periodo);

  const url = params.toString() ? `${API_BASE_URL}?${params}` : API_BASE_URL;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao buscar grades curriculares');
  }

  return response.json();
}

export async function getGradeById(id: number): Promise<GradeCurricular> {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar grade curricular');
  }

  return response.json();
}

export async function createGrade(
  grade: Omit<GradeCurricular, 'id'>,
): Promise<GradeCurricular> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(grade),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar grade curricular');
  }

  return response.json();
}

export async function updateGrade(
  id: number,
  grade: Partial<GradeCurricular>,
): Promise<GradeCurricular> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(grade),
  });

  if (!response.ok) {
    throw new Error('Erro ao atualizar grade curricular');
  }

  return response.json();
}

export async function deleteGrade(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Erro ao excluir grade curricular');
  }
}

// Mock data for development
export const mockCursos: Curso[] = [
  { id: 1, nome: 'Ciência da Computação', tipo: 'Graduação' },
  { id: 2, nome: 'Engenharia de Software', tipo: 'Graduação' },
  { id: 3, nome: 'Inteligência Artificial', tipo: 'Pós' },
  { id: 4, nome: 'Ciência de Dados', tipo: 'Mestrado' },
];

export const mockPeriodosAcademicos = [
  '2024.1',
  '2024.2',
  '2025.1',
  '2025.2',
  '2026.1',
];
