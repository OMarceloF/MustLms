import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// Define a interface para retorno básico
interface BasicUser extends RowDataPacket {
  id: number;
  role: string;
}

// GET /users/:id/basic
export const getUserBasic = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: [BasicUser[], any] = await pool.query(
      'SELECT id, role FROM users WHERE id = ?',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const user = rows[0];
    return res.json({ id: user.id, role: user.role });
  } catch (error) {
    console.error('Erro ao buscar dados básicos do usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar usuário.' });
  }
};

// GET /users/:id/profile
export const getUserProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 1) Busca role em users
    const [users] = await pool.query<BasicUser[]>(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );
    if (!users.length) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const role = users[0].role;

    if (role === 'aluno') {
      // 2a) Dados do aluno incluindo foto
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT nome,
                email,
                matricula,
                serie,
                biografia,
                foto AS avatar
         FROM alunos
         WHERE id = ? AND status != 'inativo'`,
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ message: 'Aluno não encontrado' });
      }
      const a = rows[0];
      return res.json({
        id,
        type: 'student',
        avatar: a.avatar,
        name: a.nome,
        email: a.email,
        registration: a.matricula,
        series: a.serie,
        biography: a.biografia,
        unidade: '',
        localizacao: ''
      });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
    f.nome,
    f.email,
    f.registro,
    f.departamento,
    f.biografia,
    f.foto AS avatar,
    f.instituicao,
    f.materias,
    f.turmas,
    f.total_alunos,
    f.taxa_aprovacao
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    f.id = ? AND u.status = 'ativo';
`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }
    const f = rows[0];

    return res.json({
      id,
      type: 'teacher',
      avatar: f.avatar,
      name: f.nome,
      email: f.email,
      registration: f.registro,
      formation: f.departamento,
      biography: f.biografia,
      instituicao: f.instituicao,
      materias: f.materias,
      turmas: f.turmas,
      total_alunos: f.total_alunos,
      taxa_aprovacao: f.taxa_aprovacao,
      unidade: '',
      localizacao: ''
    });

  } catch (error) {
    console.error('Erro ao buscar perfil de usuário:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar perfil.' });
  }
};

// PUT /users/:id/profile
export const updateUserProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    type,
    name,
    email,
    registration,
    series,
    formation,
    biography
  } = req.body;

  try {
    if (type === 'student') {
      await pool.query(
        `UPDATE alunos
         SET nome = ?,
             email = ?,
             matricula = ?,
             serie = ?,
             biografia = ?
         WHERE id = ?`,
        [name, email, registration, series, biography, id]
      );
    } else {
      await pool.query(
        `UPDATE 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
SET 
    f.nome = ?,
    f.email = ?,
    f.registro = ?,
    f.departamento = ?,
    f.biografia = ?
WHERE 
    f.id = ? AND u.status = 'ativo';
`,
        [name, email, registration, formation, biography, id]
      );
    }
    return res.json({ message: 'Perfil atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar perfil.' });
  }
};

// PATCH /users/:id/biography
export const updateUserBiography = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { biography } = req.body;

  if (typeof biography !== 'string') {
    return res.status(400).json({ message: 'Campo "biography" é obrigatório e deve ser string.' });
  }

  try {
    // 1) buscar a role do usuário
    const [users] = await pool.query<BasicUser[]>(
      'SELECT role FROM users WHERE id = ?',
      [id]
    );
    if (!users.length) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const role = users[0].role;

    // 2) atualizar na tabela certa
    if (role === 'aluno') {
      await pool.query(
        'UPDATE alunos SET biografia = ? WHERE id = ?',
        [biography, id]
      );
    } else {
      await pool.query(
        'UPDATE funcionarios SET biografia = ? WHERE id = ? AND u.status = "ativo"',
        [biography, id]
      );
    }

    return res.json({ message: 'Biografia atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar biografia:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar biografia.' });
  }
};


// GET /usuarios
export const listarUsuariosSugeridos = async (req: Request, res: Response) => {
  try {
    // Alunos da tabela users
    const [alunos]: any = await pool.query(`
      SELECT id, nome, '/uploads/avatars/aluno_default.png' AS foto, 'aluno' AS role
      FROM users
      WHERE role = 'aluno'
    `);

    // Professores da tabela funcionarios
    const [professores]: any = await pool.query(`
SELECT 
    f.id, 
    f.nome, 
    f.foto, 
    'professor' AS role
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    f.cargo = 'Professor' AND u.status = 'ativo';

    `);

    const perfis = [...alunos, ...professores];
    return res.json(perfis);
  } catch (error) {
    console.error('Erro ao listar perfis sugeridos:', error);
    return res.status(500).json({ message: 'Erro interno ao listar perfis sugeridos.' });
  }
};
