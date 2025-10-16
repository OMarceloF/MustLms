// src/controllers/professoresController.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import db from '../config/db' // seu client/instância do pg
import { QueryResult } from 'pg'
import { RowDataPacket } from 'mysql2'

interface CountRow extends RowDataPacket {
  count: number
}

/**
 * GET /api/professores/:id
 * Retorna dados de um professor (incluindo login, email, cargo, departamento etc.).
 */
export const getProfessorById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [rows]: any = await pool.query(
      `SELECT 
     u.id, 
     u.nome, 
     u.login, 
     u.email, 
     u.foto_url, 
     f.cargo, 
     f.departamento, 
     f.registro, 
     f.biografia,
     f.materias,
     f.turmas,
     f.total_alunos,
     f.taxa_aprovacao
   FROM users AS u
   LEFT JOIN funcionarios AS f ON u.id = f.id
   WHERE u.id = ? AND u.role = 'professor' AND u.status = 'ativo'`,
      [id]
    );


    if (rows.length === 0) {
      return res.status(404).json({ message: "Professor não encontrado." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar professor por ID:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

/**
 * GET /api/professores/:id/pagamento
 * Retorna os dados de salário do professor (tabela pagamentos_funcionarios).
 */
export const getPagamentoByProfessor = async (req: Request, res: Response) => {
  const { id } = req.params; // “id” aqui é funcionario_id

  try {
    const [rows]: any = await pool.query(
      `SELECT id, funcionario_id, valor, data_inicial
         FROM pagamentos_funcionarios
        WHERE funcionario_id = ?
        ORDER BY data_inicial DESC
        LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pagamento não encontrado." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar pagamento do professor:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

/**
 * PUT /api/professores/:id
 * Atualiza um professor, garantindo unicidade de login e email, e faz upsert na tabela pagamentos_funcionarios.
 */
export const atualizarProfessor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    nome,
    login,
    senha,
    email,
    cargo,
    departamento,
    registro = '',
    biografia = '',
    // Campos financeiros opcionais:
    salario_valor,
    salario_data_inicial,
  } = req.body;

  try {
    // 1) Verifica se outro usuário (com id diferente) já possui o mesmo login
    const [loginRows]: any = await pool.query(
      `SELECT id 
       FROM users 
       WHERE login = ? AND id != ?`,
      [login, id]
    );
    if (loginRows.length > 0) {
      return res.status(400).json({ message: "Login já cadastrado." });
    }

    // 2) Verifica se outro usuário (com id diferente) já possui o mesmo email
    const [emailRows]: any = await pool.query(
      `SELECT id 
       FROM users 
       WHERE email = ? AND id != ?`,
      [email, id]
    );
    if (emailRows.length > 0) {
      return res.status(400).json({ message: "Email já cadastrado." });
    }

    // 3) Recupera senha e foto atuais para manter caso não altere
    const [userRows]: any = await pool.query(
      "SELECT senha AS senha_atual, foto_url AS foto_atual FROM users WHERE id = ? AND role = 'professor'",
      [id]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ message: "Professor não existe." });
    }
    const senhaAtual = userRows[0].senha_atual;
    const fotoAtualUrl = userRows[0].foto_atual || '';

    // 4) Trata a foto: se houver novo arquivo, monta caminho; senão mantém anterior
    const files = req.files as Express.Multer.File[];
    const fotoFile = files?.find((f) => f.fieldname === 'foto');
    const novaFotoUrl = fotoFile
      ? `/uploads/${fotoFile.filename}`
      : fotoAtualUrl;

    // 5) Trata a senha: se enviar em branco, mantém a atual; senão, gera hash
    let senhaParaSalvar = senhaAtual;
    if (senha && senha.trim() !== '') {
      senhaParaSalvar = await bcrypt.hash(senha, 10);
    }

    // 6) Atualiza tabela 'users'
    await pool.query(
      `UPDATE users 
         SET nome = ?, 
             login = ?, 
             senha = ?, 
             email = ?, 
             foto_url = ?
       WHERE id = ?`,
      [nome, login, senhaParaSalvar, email, novaFotoUrl, id]
    );

    // 7) Atualiza tabela 'funcionarios'
    await pool.query(
      `UPDATE 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
SET 
    f.cargo = ?, 
    f.departamento = ?, 
    f.foto = ?, 
    f.registro = ?, 
    f.biografia = ?
WHERE 
    f.id = ? AND u.status = 'ativo';
`,
      [cargo, departamento, novaFotoUrl, registro, biografia, id]
    );

    // 8) Atualiza relacionamento em 'professores_materias'
    await pool.query(
      `DELETE FROM professores_materias WHERE professor_id = ?`,
      [id]
    );
    if (cargo === 'Professor') {
      const [matRows]: any = await pool.query(
        `SELECT id FROM materias WHERE nome = ?`,
        [departamento]
      );
      if (matRows.length > 0) {
        const materiaId = matRows[0].id;
        await pool.query(
          `INSERT INTO professores_materias (professor_id, materia_id) VALUES (?, ?)`,
          [id, materiaId]
        );
      }
    }

    // ================================
    // 9) TRATAMENTO DO SALÁRIO (pagamentos_funcionarios)
    // ================================
    // Se vier valor e data, fazemos upsert; se não vier nenhum, removemos registro antigo
    if (salario_valor && salario_data_inicial) {
      // Primeiro, checamos se já existe registro para este funcionario
      const [rowsPag]: any = await pool.query(
        `SELECT id FROM pagamentos_funcionarios WHERE funcionario_id = ?`,
        [id]
      );
      if (rowsPag.length > 0) {
        // Já existe: atualiza o registro existente
        const pagamentoId = rowsPag[0].id;
        await pool.query(
          `UPDATE pagamentos_funcionarios
             SET valor = ?, data_inicial = ?
           WHERE id = ?`,
          [salario_valor, salario_data_inicial, pagamentoId]
        );
      } else {
        // Não existe: insere novo registro
        await pool.query(
          `INSERT INTO pagamentos_funcionarios
             (funcionario_id, valor, data_inicial)
           VALUES (?, ?, ?)`,
          [id, salario_valor, salario_data_inicial]
        );
      }
    } else {
      // Se não veio salário ou data, removemos qualquer pagamento antigo
      await pool.query(
        `DELETE FROM pagamentos_funcionarios WHERE funcionario_id = ?`,
        [id]
      );
    }

    return res.status(200).json({ message: "Professor atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar professor:", error);
    return res.status(500).json({ message: "Erro ao atualizar professor." });
  }
};

/**
 * DELETE /api/professores/:id
 * Remove um professor de todas as tabelas relacionadas.
 */
export const excluirProfessor = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Remove vínculo em professores_materias
    await pool.query(`DELETE FROM professores_materias WHERE professor_id = ?`, [id]);
    // Remove registro em pagamentos_funcionarios, caso exista
    await pool.query(`DELETE FROM pagamentos_funcionarios WHERE funcionario_id = ?`, [id]);
    // Remove de funcionarios
    await pool.query(`DELETE FROM funcionarios WHERE id = ?`, [id]);
    // Remove de users
    await pool.query(`DELETE FROM users WHERE id = ?`, [id]);

    return res.status(200).json({ message: "Professor excluído com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir professor:", error);
    return res.status(500).json({ message: "Erro ao excluir professor." });
  }
};

/**
 * GET /api/professores
 * Lista todos os professores (id, nome e foto_url).
 */
export const getProfessores = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nome, foto_url 
       FROM users 
       WHERE role = 'professor'`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
};

/**
 * GET /api/listar_funcionarios
 * Lista todos os funcionários (id, nome, email, cargo, departamento, foto).
 */
export const listarFuncionarios = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
    f.id, 
    f.nome, 
    f.email, 
    f.cargo, 
    f.departamento, 
    f.foto 
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    u.status = 'ativo';
`
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    return res.status(500).json({ message: "Erro interno ao buscar funcionários." });
  }
};

export const getMateriasByProfessor = async (req: Request, res: Response) => {
  const professorId = Number(req.params.id);
  if (isNaN(professorId)) {
    return res.status(400).json({ error: 'ID de professor inválido' });
  }

  try {
    const sql = `
      SELECT m.id, m.nome, m.breve_descricao
      FROM materias m
      JOIN professores_materias pm 
        ON pm.materia_id = m.id
      WHERE pm.professor_id = ?
      ORDER BY m.nome COLLATE utf8mb4_general_ci
    `;
    const [rows] = await pool.query(sql, [professorId]);
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar matérias do professor:', err);
    return res.status(500).json({ error: 'Erro no servidor ao buscar matérias' });
  }
};

export const getAlunosByProfessor = async (req: Request, res: Response) => {
  const professorId = Number(req.params.id);
  if (isNaN(professorId)) {
    return res.status(400).json({ error: 'ID de professor inválido' });
  }

  try {
    const sql = `
      SELECT
        u.id,
        u.nome,
        u.email,
        u.login,
        u.role,
        al.turma       AS turma,      -- agora vem direto da coluna turma de alunos
        al.serie       AS serie,      -- idem para série
        al.matricula   AS matricula,  -- já vinha de alunos
        u.foto_url     AS foto,
        u.created_at
      FROM professores_turmas pt
      JOIN alunos_turmas at ON at.turma_id = pt.turma_id
      JOIN users          u  ON u.id        = at.aluno_id
      JOIN alunos         al ON al.id       = u.id
      WHERE pt.professor_id = ?
      ORDER BY u.nome COLLATE utf8mb4_general_ci
    `;
    const [rows]: any = await pool.query(sql, [professorId]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar alunos do professor:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar alunos' });
  }
};


// src/controllers/professoresController.ts

export const getTurmasByProfessor = async (req: Request, res: Response) => {
  const professorId = Number(req.params.id);
  if (isNaN(professorId)) {
    return res.status(400).json({ error: 'ID de professor inválido' });
  }

  try {
    const sql = `
      SELECT
        t.id,
        t.nome,
        t.serie,
        t.ano_letivo,
        t.turno,
        COUNT(at.aluno_id)      AS qtd_alunos,
        t.etapa_ensino,
        u.nome                  AS professor_responsavel
      FROM professores_turmas pt
      JOIN turmas t      ON t.id         = pt.turma_id
      LEFT JOIN alunos_turmas at ON at.turma_id = t.id
      LEFT JOIN users u   ON u.id         = pt.professor_id
      WHERE pt.professor_id = ?
      GROUP BY t.id
      ORDER BY t.nome COLLATE utf8mb4_general_ci
    `;
    const [rows]: any = await pool.query(sql, [professorId]);
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Erro ao buscar turmas do professor:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar turmas' });
  }
};


// controllers/professoresController.ts
export async function getProfessorStats(req: Request, res: Response) {
  const profId = Number(req.params.id);
  if (isNaN(profId)) {
    return res.status(400).json({ error: 'ID de professor inválido' });
  }

  try {
    // 1) contar turmas
    const [turmasRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS count
         FROM turmas
        WHERE professor_responsavel = ?`,
      [profId]
    );
    const turmasCount: number = Number(turmasRows[0].count);

    // 2) contar alunos
    const [alunosRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(DISTINCT at.aluno_id) AS count
         FROM alunos_turmas AS at
         JOIN turmas AS t ON t.id = at.turma_id
        WHERE t.professor_responsavel = ?`,
      [profId]
    );
    const alunosCount: number = Number(alunosRows[0].count);

    // 3) contar aulas pendentes
    const [aulasRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS count
         FROM aulas AS au
         JOIN professores_materias AS pm
           ON au.materia_id = pm.materia_id
        WHERE pm.professor_id = ?
          AND au.status = 'pendente'`,
      [profId]
    );
    const aulasPendentes: number = Number(aulasRows[0].count);

    // 4) contar avaliações sem notas (já ajustado)
    const [avalRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS count
         FROM avaliacoes AS av
         JOIN professores_materias AS pm
           ON av.materia_id = pm.materia_id
        WHERE pm.professor_id = ?
          AND av.id NOT IN (SELECT DISTINCT avaliacao_id FROM notas)`,
      [profId]
    );
    const avaliacoesPendentes: number = Number(avalRows[0].count);

    // AGORA sim você tem todas as variáveis no escopo:
    return res.json({
      turmasCount,
      alunosCount,
      aulasPendentes,
      avaliacoesPendentes
    });
  } catch (err) {
    console.error('Erro ao buscar estatísticas do professor:', err);
    return res.status(500).json({ error: 'Erro interno ao recuperar estatísticas' });
  }
}

export const getNotasByProfessor = async (req: Request, res: Response) => {
  const profId = Number(req.params.id);
  if (isNaN(profId)) {
    return res.status(400).json({ error: 'ID de professor inválido' });
  }
  try {
    const sql = `
      SELECT n.nota
      FROM notas AS n
      JOIN avaliacoes AS av  ON n.avaliacao_id = av.id
      JOIN professores_materias AS pm
        ON av.materia_id = pm.materia_id
      WHERE pm.professor_id = ?
    `;
    const [rows]: any = await pool.query(sql, [profId]);
    // devolve só o array de números
    const notas = rows.map((r: any) => Number(r.nota));
    return res.json(notas);
  } catch (err) {
    console.error('Erro ao buscar notas do professor:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar notas' });
  }
};

export const getFaltasMensaisByProfessor = async (req: Request, res: Response) => {
  const profId = Number(req.params.id);
  if (isNaN(profId)) {
    return res.status(400).json({ error: 'ID de professor inválido' });
  }

  try {
    const sql = `
      SELECT 
        DATE_FORMAT(p.data, '%Y-%m')   AS month,
        t.nome                         AS turma,
        SUM(CASE WHEN p.presenca = 0 THEN 1 ELSE 0 END) AS faltas
      FROM presencas AS p
      JOIN turmas AS t
        ON p.turma_id = t.id
      JOIN professores_materias AS pm
        ON p.materia_id = pm.materia_id
      WHERE pm.professor_id = ?
      GROUP BY month, t.nome
      ORDER BY month;
    `;
    const [rows]: any = await pool.query(sql, [profId]);
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar faltas mensais do professor:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar faltas mensais' });
  }
};