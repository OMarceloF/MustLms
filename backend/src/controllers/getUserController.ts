import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export const getUserData = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const [rows]: [RowDataPacket[], any] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const excluirId = req.query.excluir; // ID a ser excluído da lista

    // 🔹 Alunos
    const [alunos]: any = await pool.query(`
      SELECT id, nome, 'aluno' AS role, '/uploads/avatars/aluno_default.png' AS foto_url
      FROM users
      WHERE role = 'aluno'
      ${excluirId ? `AND id != ?` : ''}
    `, excluirId ? [excluirId] : []);

    // 🔹 Professores
    const [professores]: any = await pool.query(`
      SELECT 
    f.id, 
    f.nome, 
    'professor' AS role, 
    f.foto
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    f.cargo = 'Professor' AND u.status = 'ativo'
    ${excluirId ? `AND f.id != ?` : ''};
`, excluirId ? [excluirId] : []);

    const usuariosSugeridos = [...alunos, ...professores];
    res.json(usuariosSugeridos);
  } catch (error) {
    console.error('Erro ao buscar perfis sugeridos:', error);
    res.status(500).json({ erro: 'Erro ao buscar perfis sugeridos' });
  }
};