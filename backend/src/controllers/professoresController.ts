// src/controllers/professoresController.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';

interface CountRow extends RowDataPacket {
  count: number;
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
    if (salario_valor && salario_data_inicial) {
      const [rowsPag]: any = await pool.query(
        `SELECT id FROM pagamentos_funcionarios WHERE funcionario_id = ?`,
        [id]
      );
      if (rowsPag.length > 0) {
        const pagamentoId = rowsPag[0].id;
        await pool.query(
          `UPDATE pagamentos_funcionarios
             SET valor = ?, data_inicial = ?
           WHERE id = ?`,
          [salario_valor, salario_data_inicial, pagamentoId]
        );
      } else {
        await pool.query(
          `INSERT INTO pagamentos_funcionarios
             (funcionario_id, valor, data_inicial)
           VALUES (?, ?, ?)`,
          [id, salario_valor, salario_data_inicial]
        );
      }
    } else {
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
    await pool.query(`DELETE FROM professores_materias WHERE professor_id = ?`, [id]);
    await pool.query(`DELETE FROM pagamentos_funcionarios WHERE funcionario_id = ?`, [id]);
    await pool.query(`DELETE FROM funcionarios WHERE id = ?`, [id]);
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
        al.turma       AS turma,
        al.serie       AS serie,
        al.matricula   AS matricula,
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

export async function getProfessorStats(req: Request, res: Response) {
  const profId = Number(req.params.id);
  if (isNaN(profId)) {
    return res.status(400).json({ error: 'ID de professor inválido' });
  }

  try {
    const [turmasRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS count
         FROM turmas
        WHERE professor_responsavel = ?`,
      [profId]
    );
    const turmasCount: number = Number(turmasRows[0].count);

    const [alunosRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(DISTINCT at.aluno_id) AS count
         FROM alunos_turmas AS at
         JOIN turmas AS t ON t.id = at.turma_id
        WHERE t.professor_responsavel = ?`,
      [profId]
    );
    const alunosCount: number = Number(alunosRows[0].count);

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

/**
 * @description Obtém todos os detalhes de um funcionário para a página de visualização.
 * @route GET /api/funcionarios/:id/detalhes-completos
 */
export const getFuncionarioDetalhesCompletos = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "O ID do funcionário é obrigatório." });
    }

    try {
        // 1. Buscar dados principais do funcionário
        const [funcionarioRows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                u.id, u.nome, u.cpf, u.login, u.email, u.foto_url as foto, u.telefone, u.role, u.status,
                f.biografia, f.endereco, f.data_nascimento, f.cargo, f.departamento, f.data_contratacao as data_admissao,
                f.registro, f.formacao_academica, f.especialidades, f.instituicao
             FROM users u
             LEFT JOIN funcionarios f ON u.id = f.id
             WHERE u.id = ?`,
            [id]
        );

        if (funcionarioRows.length === 0) {
            return res.status(404).json({ message: "Funcionário não encontrado." });
        }

        const funcionario = funcionarioRows[0];
        if (funcionario.endereco && typeof funcionario.endereco === 'string') {
            try {
                funcionario.endereco = JSON.parse(funcionario.endereco);
            } catch (e) {
                console.error("Erro ao fazer parse do endereço JSON:", e);
                funcionario.endereco = null;
            }
        }

        // 2. Buscar documentos da tabela 'documentos_funcionarios'
        const [documentos] = await pool.query<RowDataPacket[]>(
            'SELECT id, tipo_documento, caminho_arquivo, nome_original, data_upload FROM documentos_funcionarios WHERE funcionario_id = ?',
            [id]
        );

        // 3. Buscar contratos da tabela 'contratos_funcionarios'
        const [contratos] = await pool.query<RowDataPacket[]>(
            'SELECT id, nome_contrato, tipo, situacao_contrato, contrato_url, criado_em FROM contratos_funcionarios WHERE funcionario_id = ?',
            [id]
        );

        // 4. Montar e retornar o objeto completo
        const respostaCompleta = {
            funcionario,
            documentos,
            contratos
        };

        res.status(200).json(respostaCompleta);

    } catch (error) {
        console.error("Erro ao buscar detalhes completos do funcionário:", error);
        res.status(500).json({ message: "Erro interno ao buscar os detalhes do funcionário." });
    }
};

/**
 * @description Atualiza um documento específico de um funcionário.
 * @route POST /api/funcionarios/:funcionarioId/documentos/:documentoId/atualizar
 */
export const atualizarDocumentoFuncionario = async (req: Request, res: Response) => {
    // 1. Converter IDs para número para garantir compatibilidade com a query
    const funcionarioId = Number(req.params.funcionarioId);
    const documentoId = Number(req.params.documentoId);
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 2. Busca o caminho do documento antigo
        const [docRows] = await connection.query<RowDataPacket[]>(
            'SELECT caminho_arquivo FROM documentos_funcionarios WHERE id = ? AND funcionario_id = ?',
            [documentoId, funcionarioId]
        );

        if (docRows.length === 0) {
            await connection.rollback();
            // Limpa o arquivo enviado se não encontrou o registro no banco para evitar lixo no servidor
            await fs.unlink(file.path).catch(() => {}); 
            return res.status(404).json({ message: "Documento não encontrado para este funcionário." });
        }

        const caminhoAntigo = docRows[0].caminho_arquivo; // Ex: /uploads/arquivo_velho.pdf

        // 3. Caminho relativo para salvar no banco (padronizado com /uploads/)
        const novoCaminhoRelativo = `/uploads/${file.filename}`;
        
        // 4. Atualiza o banco de dados
        await connection.query(
            'UPDATE documentos_funcionarios SET caminho_arquivo = ?, nome_original = ?, data_upload = NOW() WHERE id = ?',
            [novoCaminhoRelativo, file.originalname, documentoId]
        );

        // 5. Apaga o arquivo antigo do disco
        if (caminhoAntigo) {
            // CORREÇÃO CRÍTICA: Remove a barra inicial se existir para garantir que o path.join use a pasta do projeto
            // Se deixar a barra inicial, o path.join pode tentar deletar na raiz do sistema (ex: C:\uploads ou /uploads)
            const caminhoRelativoLimpo = caminhoAntigo.startsWith('/') || caminhoAntigo.startsWith('\\') 
                ? caminhoAntigo.slice(1) 
                : caminhoAntigo;

            const fullPathAntigo = path.join(process.cwd(), caminhoRelativoLimpo);
            
            try {
                // Verifica se o arquivo existe antes de tentar apagar
                await fs.access(fullPathAntigo); 
                await fs.unlink(fullPathAntigo);
            } catch (unlinkError) {
                console.warn(`Aviso: Arquivo antigo não encontrado ou erro ao apagar: ${fullPathAntigo}`);
                // Não damos throw aqui para não cancelar a transação se for apenas erro de arquivo não encontrado
            }
        }

        await connection.commit();
        res.status(200).json({ message: "Documento atualizado com sucesso!", novoCaminho: novoCaminhoRelativo });

    } catch (error) {
        await connection.rollback();
        // Se deu erro na transação, apaga o arquivo NOVO que acabou de subir
        if (file) {
            await fs.unlink(file.path).catch(() => {});
        }
        console.error("Erro ao atualizar documento do funcionário:", error);
        res.status(500).json({ message: "Erro interno ao atualizar o documento." });
    } finally {
        connection.release();
    }
};