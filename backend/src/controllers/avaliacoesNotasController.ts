// src/controllers/avaliacoesNotasController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, OkPacket } from 'mysql2';
import { notificarNotaLancada } from './notificacoesEventosController';


/**
 * Interface representando uma avaliação cadastrada
 */
export interface Avaliacao extends RowDataPacket {
  id: number;
  descricao: string;
  valor: number;
  calendario_id: number;
  materia_id: number;
  turma_id: number;
  data: string;
  periodo_label?: string;       // join opcional com calendario_gestor.label
  pontuacao_max?: number;       // join opcional com calendario_gestor.pontuacao_max
}

/**
 * Payload esperado para criação/edição de avaliação
 */
export interface AvaliacaoInput {
  descricao: string;
  valor: number;
  calendario_id: number;
  materia_id: number;
  turma_id: number;
  data: string;
}

/**
 * GET /api/turmas/:turmaId/materias/:materiaId/avaliacoes?calendarioId=
 * Retorna avaliações de uma turma+matéria para o período (calendarioId) informado.
 */
export const getAvaliacoesByTurmaMateria = async (req: Request, res: Response) => {
  const turmaId = Number(req.params.turmaId);
  const materiaId = Number(req.params.materiaId);
  const calendarioId = Number(req.query.calendarioId);
  if ([turmaId, materiaId, calendarioId].some(isNaN)) {
    return res.status(400).json({ error: 'Parâmetros inválidos.' });
  }

  try {
    const [rows] = await pool.query<Avaliacao[]>(`
      SELECT 
      a.id,
      a.descricao,
      a.valor,
      a.calendario_id,
      a.materia_id,
      a.turma_id,
      DATE_FORMAT(a.data, '%Y-%m-%d') AS data,
      cg.tipo         AS periodo_label,
      cg.valor        AS pontuacao_max
      FROM avaliacoes a
      JOIN calendario_gestor cg
        ON a.calendario_id = cg.id
      WHERE a.turma_id = ? 
        AND a.materia_id = ? 
        AND a.calendario_id = ?
      ORDER BY a.data ASC
    `, [turmaId, materiaId, calendarioId]);

    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar avaliações:', err);
    res.status(500).json({ error: 'Erro interno ao obter avaliações' });
  }
};

/**
 * POST /api/avaliacoes
 * Cria uma nova avaliação.
 */
export const createAvaliacao = async (req: Request, res: Response) => {
  const payload: AvaliacaoInput = req.body;
  try {
    const [result] = await pool.query<OkPacket>(`
      INSERT INTO avaliacoes 
        (descricao, valor, calendario_id, materia_id, turma_id, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      payload.descricao,
      payload.valor,
      payload.calendario_id,
      payload.materia_id,
      payload.turma_id,
      payload.data
    ]);
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('Erro ao criar avaliação:', err);
    res.status(500).json({ error: 'Erro interno ao criar avaliação' });
  }
};

/**
 * PUT /api/avaliacoes/:id
 * Atualiza uma avaliação existente.
 */
export const updateAvaliacao = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const payload: AvaliacaoInput = req.body;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    await pool.query(`
      UPDATE avaliacoes
      SET descricao     = ?,
          valor         = ?,
          calendario_id = ?,
          materia_id    = ?,
          turma_id      = ?,
          data          = ?
      WHERE id = ?
    `, [
      payload.descricao,
      payload.valor,
      payload.calendario_id,
      payload.materia_id,
      payload.turma_id,
      payload.data,
      id
    ]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Erro ao atualizar avaliação:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar avaliação' });
  }
};

/**
 * DELETE /api/avaliacoes/:id
 * Remove uma avaliação.
 */
export const deleteAvaliacao = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    // 1) apaga as notas vinculadas
    await pool.query(`DELETE FROM notas WHERE avaliacao_id = ?`, [id]);

    // 2) apaga a avaliação
    await pool.query(`DELETE FROM avaliacoes WHERE id = ?`, [id]);

    res.sendStatus(204);
  } catch (err) {
    console.error('Erro ao deletar avaliação:', err);
    res.status(500).json({ error: 'Erro interno ao deletar avaliação' });
  }
};



/**
 * Interface para o payload de notas que chegam do front-end
 */
export interface NotaInput {
  aluno_id: number;
  avaliacao_id: number;
  nota: number;
  recuperacao: 'Sim' | 'Não';
  nota_rec: number;
}

/**
 * POST /api/notas/batch
 * Insere ou atualiza em lote as notas de várias avaliações.
 * Para cada nota, busca turma_id, materia_id e data na tabela `avaliacoes`.
 */
// Imports no topo do arquivo permanecem iguais
// POST /api/notas/batch
export const upsertNotas = async (req: Request, res: Response) => {
  const notas: NotaInput[] = req.body;
  if (!Array.isArray(notas) || notas.length === 0) {
    return res.status(400).json({ error: 'Payload de notas inválido.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const n of notas) {
      // Validação para garantir que os valores são números
      const notaValue = typeof n.nota === 'number' && !isNaN(n.nota) ? n.nota : 0;
      const notaRecValue = typeof n.nota_rec === 'number' && !isNaN(n.nota_rec) ? n.nota_rec : 0;
      const recuperacaoValue = n.recuperacao === 'Sim' ? 'Sim' : 'Não';

      // Busca os dados da avaliação para popular as colunas restantes
      const [[evalRow]] = await conn.query<RowDataPacket[]>(`
        SELECT turma_id, materia_id, DATE_FORMAT(data, '%Y-%m-%d') AS data, descricao, valor
        FROM avaliacoes
        WHERE id = ?
      `, [n.avaliacao_id]);

      if (!evalRow) {
        console.warn(`Avaliação com ID ${n.avaliacao_id} não encontrada. Pulando nota.`);
        continue; // Pula para a próxima nota se a avaliação não existe
      }

      // Comando de Inserir/Atualizar (UPSERT)
      // A chave primária agora é (aluno_id, avaliacao_id), então o ON DUPLICATE KEY UPDATE funciona perfeitamente.
      await conn.query<OkPacket>(`
        INSERT INTO notas 
          (aluno_id, avaliacao_id, nota, recuperacao, nota_rec, turma_id, materia_id, data, tipo, valor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nota        = VALUES(nota),
          recuperacao = VALUES(recuperacao),
          nota_rec    = VALUES(nota_rec)
      `, [
        n.aluno_id,
        n.avaliacao_id,
        notaValue,
        recuperacaoValue,
        notaRecValue,
        evalRow.turma_id,
        evalRow.materia_id,
        evalRow.data,
        evalRow.descricao,
        evalRow.valor
      ]);

      // Notifica o aluno sobre a nota lançada
      await notificarNotaLancada(n.aluno_id);
    }

    await conn.commit();
    res.status(200).json({ message: 'Notas salvas com sucesso.' });

  } catch (err) {
    await conn.rollback();
    console.error('Erro ao salvar notas em lote (upsert):', err);
    res.status(500).json({ error: 'Erro interno ao salvar as notas.' });
  } finally {
    conn.release();
  }
};


export const updateStatusAvaliacao = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: string };

  // validação simples
  if (!['Pendente', 'Concluído'].includes(status)) {
    return res.status(400).json({ message: 'Status inválido. Use Pendente ou Concluído.' });
  }

  try {
    const [result]: any = await pool.query(
      `UPDATE avaliacoes
         SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }

    return res.status(200).json({ message: `Status da avaliação atualizado para "${status}".` });
  } catch (error) {
    console.error('Erro ao atualizar status da avaliação:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar status.' });
  }
};

export const concluirAvaliacoes = async (req: Request, res: Response) => {
  const { avaliacaoIds } = req.body as { avaliacaoIds: number[] };

  if (!Array.isArray(avaliacaoIds) || avaliacaoIds.length === 0) {
    return res.status(400).json({ error: 'Array de ids de avaliações é obrigatório.' });
  }

  try {
    // Atualiza o status de todas as avaliações cujo id esteja no array
    await pool.query(
      `UPDATE avaliacoes
         SET status = 'Concluído'
       WHERE id IN (?)`,
      [avaliacaoIds]
    );

    return res.status(200).json({ message: 'Avaliações marcadas como Concluído.' });
  } catch (error) {
    console.error('Erro ao concluir avaliações:', error);
    return res.status(500).json({ error: 'Erro interno ao concluir avaliações.' });
  }
};