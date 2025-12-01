import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface Atividade {
  id?: number;
  tipo: string;
  nome: string;
  descricao: string;
  criado_em?: string;
  [key: string]: any;
}

// Criar atividade
export const criarAtividade = async (payload: any) => {
  const { data } = await axios.post(`${API_URL}/api/producao-academica`, payload);
  return data;
};

// Listar por curso
export const listarAtividadesPorCurso = async (cursoId: number) => {
  const { data } = await axios.get(`${API_URL}/api/producao-academica/curso/${cursoId}`);
  return data;
};

// Listar por materia
export const listarAtividadesPorMateria = async (materiaId: number) => {
  const { data } = await axios.get(`${API_URL}/api/producao-academica/materia/${materiaId}`);
  return data;
};

// Obter atividade completa
export const obterAtividade = async (id: number) => {
  const { data } = await axios.get(`${API_URL}/api/producao-academica/${id}`);
  return data;
};

// Atualizar
export const atualizarAtividade = async (id: number, payload: any) => {
  const { data } = await axios.put(`${API_URL}/api/producao-academica/${id}`, payload);
  return data;
};

// Deletar
export const deletarAtividade = async (id: number) => {
  const { data } = await axios.delete(`${API_URL}/api/producao-academica/${id}`);
  return data;
};

export const producaoAcademicaService = {
  criar: criarAtividade,
  listarPorCurso: listarAtividadesPorCurso,
  listarPorMateria: listarAtividadesPorMateria,
  obter: obterAtividade,
  atualizar: atualizarAtividade,
  excluir: deletarAtividade
};