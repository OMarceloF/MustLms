// src/controllers/calendarioGestorController.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export interface Periodo extends RowDataPacket {
  id: number;
  label: string;         // vamos chamar o "tipo" de label
  pontuacao_max: number; // e o "valor" de pontuacao_max
}

export const getPeriodosCalendarioGestor = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<Periodo[]>(`
      SELECT
        id,
        tipo      AS label,
        valor     AS pontuacao_max
      FROM calendario_gestor
      ORDER BY data_inicial
    `);
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar períodos:', err);
    return res.status(500).json({ error: 'Erro interno ao obter períodos' });
  }
};
