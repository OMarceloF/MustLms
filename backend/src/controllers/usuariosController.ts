import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

const formatCPF = (value: string | null): string => {
  // AQUI ESTÁ A CORREÇÃO:
  // Se o valor for nulo, indefinido ou uma string vazia, retorne uma string vazia imediatamente.
  if (!value) {
    return '';
  }

  // O resto da função só será executado se 'value' for uma string válida.
  const numericValue = value.replace(/\D/g, '');
  const truncatedValue = numericValue.slice(0, 11);

  if (truncatedValue.length > 9) {
    return truncatedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (truncatedValue.length > 6) {
    return truncatedValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (truncatedValue.length > 3) {
    return truncatedValue.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }

  return truncatedValue;
};

const formatTelefone = (value: string | null): string => {
  // AQUI ESTÁ A CORREÇÃO:
  if (!value) {
    return '';
  }

  // O resto da função continua igual.
  const numericValue = value.replace(/\D/g, '');
  const truncatedValue = numericValue.slice(0, 11);

  if (truncatedValue.length > 10) {
    return truncatedValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (truncatedValue.length > 6) {
    return truncatedValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else if (truncatedValue.length > 2) {
    return truncatedValue.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  }

  return truncatedValue.replace(/(\d*)/, '($1');
};

// 🔹 GET /api/usuarios - Buscar todos os usuários da plataforma
export const buscarTodosUsuarios = async (req: Request, res: Response) => {
  try {
    const [usuarios] = await pool.query(
      `SELECT 
        id,
        nome,
        email,
        role,
        foto_url,
        last_seen,
        created_at
       FROM users
       ORDER BY nome ASC`
    );

    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar usuários' });
  }
};

// 🔹 GET /api/usuarios/:id - Buscar usuário específico por ID
export const buscarUsuarioPorId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [usuarios] = await pool.query(
      `SELECT 
        id,
        nome,
        email,
        role,
        foto_url,
        last_seen,
        created_at
       FROM users
       WHERE id = ?`,
      [id]
    );

    if ((usuarios as any[]).length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.status(200).json((usuarios as any[])[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar usuário' });
  }
};

// 🔹 GET /api/usuarios/buscar/:termo - Buscar usuários por termo
export const buscarUsuariosPorTermo = async (req: Request, res: Response) => {
  const { termo } = req.params;

  try {
    const [usuarios] = await pool.query(
      `SELECT 
        id,
        nome,
        email,
        role,
        foto_url,
        last_seen,
        created_at
       FROM users
       WHERE nome LIKE ? OR email LIKE ?
       ORDER BY nome ASC
       LIMIT 50`,
      [`%${termo}%`, `%${termo}%`]
    );

    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários por termo:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar usuários' });
  }
};

// 🔹 GET /api/usuarios/online - Buscar usuários online
export const buscarUsuariosOnline = async (req: Request, res: Response) => {
  try {
    // Esta função seria integrada com o sistema de Socket.IO
    // Por enquanto, retornamos uma lista vazia
    // Em produção, você manteria uma lista de usuários online em memória ou Redis

    res.status(200).json({
      usuariosOnline: [],
      total: 0,
      message: 'Lista de usuários online deve ser obtida via Socket.IO',
    });
  } catch (error) {
    console.error('Erro ao buscar usuários online:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar usuários online' });
  }
};

// 🔹 GET /api/usuarios/por-role/:role - Buscar usuários por role
export const buscarUsuariosPorRole = async (req: Request, res: Response) => {
  const { role } = req.params;

  // Validar role
  const rolesValidas = ['aluno', 'responsavel', 'professor', 'gestor'];
  if (!rolesValidas.includes(role)) {
    return res.status(400).json({ erro: 'Role inválida' });
  }

  try {
    const [usuarios] = await pool.query(
      `SELECT 
        id,
        nome,
        email,
        role,
        foto_url,
        last_seen,
        created_at
       FROM users
       WHERE role = ?
       ORDER BY nome ASC`,
      [role]
    );

    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuários por role:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar usuários por role' });
  }
};

// 🔹 PUT /api/usuarios/:id/last-seen - Atualizar last_seen do usuário
export const atualizarLastSeen = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE users SET last_seen = NOW() WHERE id = ?',
      [id]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.status(200).json({
      status: 'ok',
      message: 'Last seen atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar last_seen:', error);
    res.status(500).json({ erro: 'Erro interno ao atualizar last_seen' });
  }
};

export const getTotalUsuarios = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM users'
    );
    const total = rows[0].total;
    res.status(200).json({ total: total });
  } catch (error) {
    console.error('Erro ao buscar total de usuários:', error);
    res
      .status(500)
      .json({ message: 'Erro interno ao buscar total de usuários.' });
  }
};

export const getFuncionarioEditData = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 1. A Query Principal: Faz um JOIN entre 'users' e 'funcionarios'
    const query = `
      SELECT
        u.nome, u.email, u.login, u.foto_url,
        f.cpf, f.telefone, f.data_nascimento, f.endereco,
        f.cargo, f.departamento, f.data_contratacao, f.registro,
        f.formacao_academica, f.especialidades, f.biografia
      FROM users AS u
      LEFT JOIN funcionarios AS f ON u.id = f.id
      WHERE u.id = ? AND u.status = 'ativo'
      LIMIT 1;
    `;

    const [rows]: any = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado ou inativo.' });
    }

    const rawData = rows[0];

    // 2. Etapa de Transformação e Limpeza dos Dados
    const enderecoData = rawData.endereco ? JSON.parse(rawData.endereco) : {};

    // 3. Montagem do Objeto Final (espelhando o formSchema do frontend)
    const finalData = {
      // Dados Pessoais
      nome: rawData.nome || '',
      email: rawData.email || '',
      cpf: formatCPF(rawData.cpf),       // <-- CORRIGIDO
      telefone: formatTelefone(rawData.telefone), // <-- CORRIGIDO
      data_nascimento: rawData.data_nascimento ? new Date(rawData.data_nascimento).toISOString().split('T')[0] : '',

      // Endereço
      endereco_cep: enderecoData.cep || '',
      endereco_logradouro: enderecoData.logradouro || '',
      endereco_numero: enderecoData.numero || '',
      endereco_complemento: enderecoData.complemento || '',
      endereco_bairro: enderecoData.bairro || '',
      endereco_cidade: enderecoData.cidade || '',
      endereco_uf: enderecoData.uf || '',

      // Dados Profissionais
      cargo: rawData.cargo || '',
      departamento: rawData.departamento || '',
      data_contratacao: rawData.data_contratacao ? new Date(rawData.data_contratacao).toISOString().split('T')[0] : '',
      registro: rawData.registro || '',
      formacao_academica: rawData.formacao_academica || '',
      especialidades: rawData.especialidades || '',
      biografia: rawData.biografia || '',

      // Acesso
      login: rawData.login || '',
      senha: '', // Senha nunca é enviada para o frontend

      // Foto (apenas a URL para o preview inicial)
      foto_url: rawData.foto_url || '',
    };

    // 4. Enviar o objeto formatado para o frontend
    return res.status(200).json(finalData);

  } catch (error) {
    console.error('Erro ao buscar dados de edição do funcionário:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const updateFuncionario = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const fotoFile = req.file;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // --- 1. LIMPEZA E PREPARAÇÃO DOS DADOS ---
    const cpfLimpo = data.cpf ? data.cpf.replace(/\D/g, '') : null;
    const telefoneLimpo = data.telefone ? data.telefone.replace(/\D/g, '') : null;
    const enderecoJson = JSON.stringify({
      cep: data.endereco_cep,
      logradouro: data.endereco_logradouro,
      numero: data.endereco_numero,
      complemento: data.endereco_complemento,
      bairro: data.endereco_bairro,
      cidade: data.endereco_cidade,
      uf: data.endereco_uf,
    });

    // --- 2. VALIDAÇÃO DE DUPLICIDADE (LOGIN, EMAIL, CPF) ---
    // Verifica se o novo login, email ou CPF já pertence a OUTRO usuário.
    const [existente]: any = await connection.query(
      `SELECT id FROM users WHERE (login = ? OR email = ? OR cpf = ?) AND id != ?`,
      [data.login, data.email, cpfLimpo, id]
    );
    if (existente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Login, Email ou CPF já está em uso por outro usuário.' });
    }

    // --- 3. ATUALIZAÇÃO DA TABELA 'users' ---
    let senhaQueryPart = '';
    const queryParamsUsers = [data.nome, data.email, data.login, cpfLimpo, telefoneLimpo, data.cargo.toLowerCase()];

    // Apenas atualiza a senha se uma nova foi fornecida
    if (data.senha) {
      const senhaHash = await bcrypt.hash(data.senha, 10);
      senhaQueryPart = ', senha = ?';
      queryParamsUsers.push(senhaHash);
    }

    // Apenas atualiza a foto se um novo arquivo foi enviado
    if (fotoFile) {
      const fotoUrl = `/uploads/${fotoFile.filename}`;
      senhaQueryPart += ', foto_url = ?';
      queryParamsUsers.push(fotoUrl);
    }

    queryParamsUsers.push(id); // Adiciona o ID no final para a cláusula WHERE

    await connection.query(
      `UPDATE users SET nome = ?, email = ?, login = ?, cpf = ?, telefone = ?, role = ? ${senhaQueryPart} WHERE id = ?`,
      queryParamsUsers
    );

    // --- 4. ATUALIZAÇÃO DA TABELA 'funcionarios' ---
    const queryParamsFuncionarios = [
      data.nome, data.email, data.cargo, data.departamento, data.registro, data.biografia,
      data.formacao_academica, data.especialidades, cpfLimpo, telefoneLimpo, data.data_nascimento,
      data.data_contratacao, enderecoJson
    ];

    // Se uma nova foto foi enviada, atualiza o campo 'foto' também
    if (fotoFile) {
      const fotoUrl = `/uploads/${fotoFile.filename}`;
      await connection.query(
        `UPDATE 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
SET 
    f.nome = ?, f.email = ?, f.cargo = ?, f.departamento = ?, f.registro = ?, f.biografia = ?, 
    f.formacao_academica = ?, f.especialidades = ?, f.cpf = ?, f.telefone = ?, f.data_nascimento = ?, 
    f.data_contratacao = ?, f.endereco = ?, f.foto = ?
WHERE 
    f.id = ? AND u.status = 'ativo';
`,
        [...queryParamsFuncionarios, fotoUrl, id]
      );
    } else {
      await connection.query(
        `UPDATE 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
SET 
    f.nome = ?, f.email = ?, f.cargo = ?, f.departamento = ?, f.registro = ?, f.biografia = ?, 
    f.formacao_academica = ?, f.especialidades = ?, f.cpf = ?, f.telefone = ?, f.data_nascimento = ?, 
    f.data_contratacao = ?, f.endereco = ?
WHERE 
    f.id = ? AND u.status = 'ativo';
`,
        [...queryParamsFuncionarios, id]
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Funcionário atualizado com sucesso!' });

  } catch (error: any) {
    await connection.rollback();
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({ message: error.message || 'Erro interno ao atualizar funcionário.' });
  } finally {
    connection.release();
  }
};

export const desativarFuncionario = async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validação básica para garantir que um ID foi fornecido
  if (!id) {
    return res.status(400).json({ message: 'ID do funcionário não fornecido.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Atualiza o status na tabela 'users'
    // A tabela 'users' é a fonte da verdade para o status de login e visibilidade geral.
    const [updateResult]: any = await connection.query(
      `UPDATE users SET status = 'inativo' WHERE id = ?`,
      [id]
    );

    // Verifica se alguma linha foi realmente atualizada. Se não, o usuário não existe.
    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Funcionário não encontrado.' });
    }

    // 2. (Opcional, mas recomendado) Atualiza o status na tabela 'funcionarios' também
    // Isso mantém a consistência se você consultar a tabela 'funcionarios' diretamente.
    await connection.query(
      `UPDATE users SET status = 'inativo' WHERE id = ?;`,
      [id]
    );

    await connection.commit();

    return res.status(200).json({ message: 'Funcionário desativado com sucesso.' });

  } catch (error) {
    await connection.rollback();
    console.error('Erro ao desativar funcionário:', error);
    return res.status(500).json({ message: 'Erro interno ao desativar o funcionário.' });
  } finally {
    connection.release();
  }
};
