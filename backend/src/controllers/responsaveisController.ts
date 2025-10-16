import { Request, Response } from 'express';
import pool from '../config/db';
import { config } from '../config/config';
import bcrypt from 'bcryptjs';

interface AlunoFoto {
  id: number;
  nome: string;
  foto: string | null;
}


const baseUrl = process.env.BASE_URL

export const getAlunosDoResponsavel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID do responsável é obrigatório' });
    }

    // Buscar dados do responsável
    const responsavelQuery = `
      SELECT id, nome, id_aluno1, id_aluno2, id_aluno3 
      FROM responsaveis 
      WHERE id = ?
    `;
    
    const [responsavelRows] = await pool.execute(responsavelQuery, [id]) as any;
    
    if (responsavelRows.length === 0) {
      return res.status(404).json({ error: 'Responsável não encontrado' });
    }

    const responsavel = responsavelRows[0];
    const alunosIds = [responsavel.id_aluno1, responsavel.id_aluno2, responsavel.id_aluno3]
      .filter(id => id !== null && id !== undefined);

    if (alunosIds.length === 0) {
      return res.status(404).json({ error: 'Nenhum aluno associado a este responsável' });
    }

    // Buscar dados dos alunos
    const placeholders = alunosIds.map(() => '?').join(',');
    const alunosQuery = `
      SELECT id, nome, foto 
      FROM alunos 
      WHERE id IN (${placeholders}) AND status != 'inativo'
    `;

    const [alunosRows] = await pool.execute(alunosQuery, alunosIds) as any;

    const alunosComFoto = alunosRows.map((aluno: any) => ({
      ...aluno,
      foto: aluno.foto
        ? `${config.baseUrl}${aluno.foto.startsWith('/') ? '' : '/'}${aluno.foto}`
        : null
    }));

    // console.log(
    // '→ [BACKEND] alunosComFoto URLs:',
    // alunosComFoto.map((a: AlunoFoto) => a.foto)
    // );

    res.json({
      responsavel: {
        id: responsavel.id,
        nome: responsavel.nome
      },
      alunos: alunosComFoto
    });

  } catch (error) {
    console.error('Erro ao buscar alunos do responsável:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateResponsavel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nome,
      id_aluno1,
      id_aluno2,
      id_aluno3,
      numero1,
      numero2,
      endereco,
      email,
      cpf,
      grau_parentesco,
    } = req.body;

    // Verifique se todos os campos necessários estão presentes
    if (!nome || !numero1 || !email || !grau_parentesco) {
      return res.status(400).json({ error: 'Campos obrigatórios não podem estar vazios.' });
    }

    const updateQuery = `
      UPDATE responsaveis
      SET
        nome = ?,
        id_aluno1 = ?,
        id_aluno2 = ?,
        id_aluno3 = ?,
        numero1 = ?,
        numero2 = ?,
        endereco = ?,
        email = ?,
        cpf = ?,
        grau_parentesco = ?
      WHERE id = ?
    `;

    await pool.execute(updateQuery, [
      nome || '',
      id_aluno1 || null,
      id_aluno2 || null,
      id_aluno3 || null,
      numero1 || '',
      numero2 || '',
      endereco || '',
      email || '',
      cpf || '',
      grau_parentesco || '',
      id
    ]);

    res.status(200).json({ message: 'Responsável atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar responsável:', error);
    res.status(500).json({ error: 'Erro ao atualizar responsável' });
  }
};

export const getResponsavelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID do responsável é obrigatório' });
    }

    const query = `
      SELECT r.id, r.nome, r.numero1, r.numero2, r.endereco, r.email, r.cpf, r.grau_parentesco, u.login
      FROM responsaveis r
      LEFT JOIN users u ON r.id = u.id
      WHERE r.id = ?
    `;

    const [rows] = await pool.execute(query, [id]) as any;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Responsável não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar responsável:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export const buscarResponsavelPorCPF = async (req: Request, res: Response) => {
  // 1. Pega o CPF dos parâmetros da URL
  const { cpf } = req.params;

  // 2. Validação básica do CPF recebido
  if (!cpf || !/^\d{11}$/.test(cpf)) {
    return res.status(400).json({ message: 'Formato de CPF inválido. Forneça 11 dígitos numéricos.' });
  }

  try {
    // 3. Executa a query no banco de dados
    // A query busca na tabela 'users' por um usuário que tenha o CPF correspondente
    // E que tenha a 'role' de 'responsavel'.
    const [rows]: any = await pool.query(
      `SELECT id, nome, email, telefone FROM users WHERE cpf = ? AND role = 'responsavel'`,
      [cpf]
    );

    // 4. Verifica o resultado da query
    if (rows.length > 0) {
      // Responsável encontrado! Retorna os dados para o frontend.
      const responsavel = rows[0];
      return res.status(200).json(responsavel);
    } else {
      // Nenhum responsável encontrado com este CPF. Retorna 404.
      return res.status(404).json({ message: 'Responsável não encontrado.' });
    }

  } catch (error) {
    console.error('Erro ao buscar responsável por CPF:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const listarResponsaveisPorAluno = async (req: Request, res: Response) => {
  const { alunoId } = req.params;

  try {
    // Esta query faz um JOIN entre a tabela de ligação e a tabela de usuários
    // para pegar os dados completos de cada responsável vinculado ao aluno.
    const [rows]: any = await pool.query(
      `SELECT 
         u.id, 
         u.nome, 
         u.email, 
         u.telefone, 
         ar.parentesco,
         ar.id as vinculoId  -- Importante: retorna o ID do VÍNCULO para a exclusão
       FROM alunos_responsaveis ar
       JOIN users u ON ar.responsavel_id = u.id
       WHERE ar.aluno_id = ?`,
      [alunoId]
    );

    // Renomeia a coluna 'telefone' para 'numero1' para corresponder ao que o frontend espera
    const responsaveis = rows.map((r: any) => ({ ...r, numero1: r.telefone }));

    return res.status(200).json(responsaveis);

  } catch (error) {
    console.error('Erro ao listar responsáveis do aluno:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const vincularResponsavel = async (req: Request, res: Response) => {
  const {
    alunoId,
    responsavelId, // Virá se o responsável já existia
    cpf,
    nome,
    email,
    telefone,
    parentesco
  } = req.body;

  let finalResponsavelId = responsavelId;

  try {
    // Se o responsavelId não foi fornecido, significa que é um novo responsável
    if (!finalResponsavelId) {
      const cpfLimpo = cpf.replace(/\D/g, "");

      // Verificação de segurança: garante que não estamos duplicando
      const [existente]: any = await pool.query(`SELECT id FROM users WHERE cpf = ?`, [cpfLimpo]);
      if (existente.length > 0) {
        return res.status(409).json({ message: 'Um usuário com este CPF já existe. Tente buscar novamente.' });
      }

      // Cria o novo usuário para o responsável
      const senhaPadrao = await bcrypt.hash(cpfLimpo, 10); // Senha padrão baseada no CPF
      const [novoResponsavel]: any = await pool.query(
        `INSERT INTO users (nome, email, cpf, telefone, login, senha, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome, email, cpfLimpo, telefone, email, senhaPadrao, 'responsavel']
      );
      finalResponsavelId = novoResponsavel.insertId;
    }

    // Agora que temos o ID do responsável (seja novo ou existente), criamos o vínculo
    await pool.query(
      `INSERT INTO alunos_responsaveis (aluno_id, responsavel_id, parentesco) VALUES (?, ?, ?)`,
      [alunoId, finalResponsavelId, parentesco]
    );

    return res.status(201).json({ message: 'Responsável vinculado com sucesso!' });

  } catch (error) {
    console.error('Erro ao vincular responsável:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const desvincularResponsavel = async (req: Request, res: Response) => {
  const { vinculoId } = req.params; // Usaremos o ID do VÍNCULO

  try {
    const [result]: any = await pool.query(
      `DELETE FROM alunos_responsaveis WHERE id = ?`,
      [vinculoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Vínculo não encontrado.' });
    }

    return res.status(200).json({ message: 'Responsável desvinculado com sucesso.' });

  } catch (error) {
    console.error('Erro ao desvincular responsável:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};