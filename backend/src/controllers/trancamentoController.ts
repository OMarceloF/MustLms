// backend/src/controllers/trancamentoController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// Interface para tipar os dados brutos
interface AlunoParaTrancamento extends RowDataPacket {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  foto: string | null;
  status_matricula: 'Ativa' | 'Trancada' | 'Inativo' | null;
  curso_nome: string | null;
  turma_ingresso_nome: string | null;
  vinculo_id: number | null; // <-- Adicionado
}

/**
 * @description Lista alunos com informações de curso, turma e ID do vínculo.
 * @route GET /api/trancamento/alunos
 */
export const listarAlunosParaTrancamento = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
          u.id,
          u.nome,
          a.matricula,
          u.email,
          u.foto_url as foto,
          v.status_matricula,
          c.nome as curso_nome,
          ti.nome as turma_ingresso_nome,
          v.id as vinculo_id -- <-- CORREÇÃO: Retorna o ID do vínculo
      FROM 
          users u
      JOIN 
          alunos a ON u.id = a.id
      LEFT JOIN 
          vincular_aluno_curso v ON u.id = v.aluno_id
      LEFT JOIN 
          cursos_posgraduacao c ON v.curso_posgraduacao_id = c.id
      LEFT JOIN
          turmas_ingresso ti ON v.turmas_ingresso_id = ti.id
      WHERE
          u.role = 'aluno';
    `;

    const [alunos] = await pool.query<AlunoParaTrancamento[]>(query);

    // Agrupa os resultados por aluno, já que um aluno pode ter múltiplos cursos
    const alunosAgrupados = new Map<number, any[]>();
    alunos.forEach(aluno => {
        if (!alunosAgrupados.has(aluno.id)) {
            alunosAgrupados.set(aluno.id, []);
        }
        alunosAgrupados.get(aluno.id)!.push(aluno);
    });

    // Formata a saída para criar uma linha para cada vínculo de curso
    const resultadoFormatado = Array.from(alunosAgrupados.values()).flat().map(aluno => ({
        id: aluno.id,
        vinculoId: aluno.vinculo_id, // <-- Adicionado
        nome: aluno.nome,
        matricula: aluno.matricula,
        email: aluno.email,
        foto: aluno.foto,
        status: aluno.curso_nome ? (aluno.status_matricula || 'Ativa') : null,
        curso: aluno.curso_nome || 'Não vinculado',
        turma: aluno.turma_ingresso_nome || 'Não vinculada'
    }));

    res.status(200).json(resultadoFormatado);
  } catch (error) {
    console.error("Erro ao listar alunos para trancamento:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

/**
 * @description Atualiza o status de uma matrícula específica pelo ID do vínculo.
 * @route PATCH /api/trancamento/vinculos/:vinculoId/status
 */
export const atualizarStatusMatricula = async (req: Request, res: Response) => {
  // <-- CORREÇÃO: Usa vinculoId em vez de alunoId
  const { vinculoId } = req.params; 
  const { status, motivo } = req.body;

  if (!status || (status !== 'Ativa' && status !== 'Trancada')) {
    return res.status(400).json({ message: 'O status fornecido é inválido. Use "Ativa" ou "Trancada".' });
  }

  try {
    // <-- CORREÇÃO: A query agora usa o ID do vínculo para a atualização
    const [result] = await pool.query<RowDataPacket[]>(
      'UPDATE vincular_aluno_curso SET status_matricula = ? WHERE id = ?',
      [status, vinculoId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ message: 'Vínculo de matrícula não encontrado. A operação falhou.' });
    }

    if (status === 'Trancada' && motivo) {
      console.log(`Motivo do trancamento para o vínculo ${vinculoId}: ${motivo}`);
    }

    res.status(200).json({ message: `Matrícula (vínculo ${vinculoId}) foi atualizada para '${status}' com sucesso.` });
  } catch (error) {
    console.error("Erro ao atualizar status da matrícula:", error);
    res.status(500).json({ message: 'Erro interno no servidor ao persistir a alteração.' });
  }
};
