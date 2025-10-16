import { Request, Response } from 'express';
import pool from '../config/db';

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [rows]: any = await pool.query(
      'SELECT id, nome, foto_url FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
