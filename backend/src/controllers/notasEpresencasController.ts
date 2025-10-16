// src/controllers/notasEpresencasController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2'; 

export interface Presenca extends RowDataPacket {
  turma_id: number;
  aluno_id: number;
  materia_id: number;
  data: string;        // ou Date, dependendo de como você armazena no DB
  descricao: string;
  presenca: 0 | 1;     // 1 = presente, 0 = ausente
}

/**
 * Retorna todas as linhas da tabela "presencas" para uma dada combinação
 * de matéria (materiaId) e turma (turmaId). 
 * Cada registro contém: turma_id, aluno_id, materia_id, data, descricao e presenca.
 */
export const getPresencasByMateriaTurma = async (req: Request, res: Response) => {
  const { materiaId, turmaId } = req.params;

  const matId = parseInt(materiaId, 10);
  const turId = parseInt(turmaId, 10);
  if (isNaN(matId) || isNaN(turId)) {
    return res.status(400).json({ error: 'materiaId ou turmaId inválido.' });
  }

  try {
    const [rows] = await pool.query<Presenca[]>(
      `
        SELECT turma_id, aluno_id, materia_id, data, descricao, presenca
        FROM presencas
        WHERE materia_id = ? AND turma_id = ?
      `,
      [matId, turId]
    );

    return res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar presenças:', error);
    return res.status(500).json({ error: 'Erro interno ao obter presenças' });
  }
};


export interface Nota extends RowDataPacket {
  tipo: string;          // e.g. "Trabalho", "Prova", "Atividade"
  valor: number;         // peso máximo da avaliação (ex.: 10, 5 etc)
  nota: number;          // nota original (0..valor)
  recuperacao: 'Sim' | 'Não';
  nota_rec: number;      // será != 0 apenas se recuperacao === 'Sim'
  turma_id: number;
  aluno_id: number;
  materia_id: number;
  data: string;          // data em que a avaliação foi aplicada
}

export interface NotaDetalhada extends RowDataPacket {
  tipo: string;          // "Trabalho", "Prova", "Atividade" etc
  valor: number;         // peso máximo da avaliação
  nota: number;          // nota original
  recuperacao: 'Sim' | 'Não';
  nota_rec: number;      // nota de recuperação (0 se não houve)
  turma_id: number;
  aluno_id: number;
  materia_id: number;
  data: Date;            // data em que a avaliação foi aplicada
}

export const getNotasByMateriaTurma = async (req: Request, res: Response) => {
  const { materiaId, turmaId } = req.params;
  const matId = parseInt(materiaId, 10);
  const turId = parseInt(turmaId, 10);

  if (isNaN(matId) || isNaN(turId)) {
    return res.status(400).json({ error: 'materiaId ou turmaId inválido.' });
  }

  try {
    // 1) Buscamos todos os registros de notas dessa matéria e turma
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT tipo, valor, nota, recuperacao, nota_rec, turma_id, aluno_id, materia_id, data
      FROM notas
      WHERE materia_id = ? AND turma_id = ?
    `, [matId, turId]);

    // 2) Para cada registro, retornamos nota_inicial, nota_rec e nota_final
    const resultado = (rows as NotaDetalhada[]).map((r) => {
      const notaInicial = r.nota;
      const notaRecuperacao = r.nota_rec;
      const notaFinal = Math.max(notaInicial, notaRecuperacao);

      return {
        tipo: r.tipo,
        valor: r.valor,
        nota_inicial: notaInicial,
        nota_rec: notaRecuperacao,
        nota_final: notaFinal,
        recuperacao: r.recuperacao,
        turma_id: r.turma_id,
        aluno_id: r.aluno_id,
        materia_id: r.materia_id,
        data: r.data.toISOString(),
      };
    });

    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return res.status(500).json({ error: 'Erro interno ao obter notas' });
  }
};
