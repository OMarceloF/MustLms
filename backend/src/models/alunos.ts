import pool from '../config/db';

export interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  serie: string;
  turma: string;
  email: string;
  foto?: string | null;
  telefone?: string | null;
  biografia?: string | null;
  contato_responsaveis?: string | null;
  turno?: string | null;
}

// Busca por termo semelhante
export const buscarAlunosPorTermo = async (termo: string): Promise<Aluno[]> => {
  const likeTerm = `%${termo}%`;

  const [rows] = await pool.query(
    `SELECT id, nome, matricula, serie, turma, email, foto, biografia, telefone, contato_responsaveis, turno FROM alunos WHERE nome AND status != 'inativo' LIKE ? OR matricula LIKE ? OR serie LIKE ? OR turma LIKE ? LIMIT 5`,
    [likeTerm, likeTerm, likeTerm, likeTerm]
  );

  return rows as Aluno[]
};
