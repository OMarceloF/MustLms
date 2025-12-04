import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

//==============================================================================
// CRUD para Matriz Curricular (Disciplinas de um CURSO ESPECÍFICO)
//==============================================================================

/**
 * @description Lista as disciplinas de um curso, incluindo turmas e pré-requisitos.
 * @route GET /api/cursos/:cursoId/disciplinas
 */
export const listarDisciplinasCurso = async (req: Request, res: Response) => {
  const { cursoId } = req.params;

  if (!cursoId) {
    return res.status(400).json({ message: "ID do curso não fornecido na URL." });
  }

  try {
    // A query busca disciplinas, agrega turmas em um JSON e agrega requisitos em outro JSON
    const query = `
      SELECT 
        d.id,
        d.nome,
        d.codigo,
        d.creditos,
        d.carga_horaria,
        d.semestre,
        d.tipo,
        d.ementa,
        -- Busca os IDs dos pré-requisitos como um array JSON simples [1, 2, 3]
        (
            SELECT JSON_ARRAYAGG(dr.requisito_id)
            FROM disciplina_requisitos dr
            WHERE dr.disciplina_id = d.id
        ) AS requisitos,
        -- Agrega as turmas em um array JSON de objetos
        JSON_UNQUOTE(
          IFNULL(
            CONCAT('[', 
              GROUP_CONCAT(
                DISTINCT JSON_OBJECT(
                  'id', t.id, 
                  'nome', t.nome_turma,
                  'semestre_nome', cpl.nome
                )
              ), 
            ']'),
            '[]'
          )
        ) AS turmas
      FROM cursos_disciplinas d
      LEFT JOIN turmas t ON d.id = t.disciplina_id
      LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
      WHERE d.curso_id = ?
      GROUP BY d.id
      ORDER BY d.semestre, d.nome;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [cursoId]);

    // Processa os resultados para garantir que sejam arrays válidos
    const disciplinas = rows.map(row => {
      try {
        // Parse das Turmas
        row.turmas = typeof row.turmas === 'string' ? JSON.parse(row.turmas) : row.turmas;
        
        // Parse dos Requisitos
        // O MySQL pode retornar null se não houver requisitos, ou uma string JSON
        if (!row.requisitos) {
            row.requisitos = [];
        } else if (typeof row.requisitos === 'string') {
            row.requisitos = JSON.parse(row.requisitos);
        }
        // Se já for array (dependendo do driver), mantém.
      } catch (e) {
        console.error("Erro ao fazer parse de turmas ou requisitos:", e);
        row.turmas = row.turmas || [];
        row.requisitos = row.requisitos || [];
      }
      return row;
    });

    res.json(disciplinas);
  } catch (error) {
    console.error("Erro ao listar disciplinas com detalhes:", error);
    res.status(500).json({ message: "Erro interno ao buscar as disciplinas." });
  }
};

/**
 * @description Adiciona uma nova disciplina a um curso com seus pré-requisitos.
 * @route POST /api/cursos/:cursoId/disciplinas
 */
export const adicionarDisciplinaCurso = async (req: Request, res: Response) => {
  const { cursoId } = req.params;
  const { nome, codigo, carga_horaria, creditos, semestre, ementa, requisitos, tipo } = req.body; 

  if (!cursoId) return res.status(400).json({ message: "ID do curso obrigatório." });

  const connection = await pool.getConnection();
  try {
      // --- VALIDAÇÃO DE SEMESTRE ---
      // Busca a duração do curso
      const [cursoRows] = await connection.query<RowDataPacket[]>(
          "SELECT duracao_semestres FROM cursos_posgraduacao WHERE id = ?", 
          [cursoId]
      );

      if (cursoRows.length === 0) {
          return res.status(404).json({ message: "Curso não encontrado." });
      }

      const duracaoCurso = cursoRows[0].duracao_semestres;

      // Permite semestre 0 (optativas) até a duração máxima
      if (semestre < 0 || semestre > duracaoCurso) {
          return res.status(400).json({ 
              message: `O semestre informado (${semestre}) é inválido. O curso possui duração de ${duracaoCurso} semestres.` 
          });
      }
      // -----------------------------

      await connection.beginTransaction();

      const query = `
        INSERT INTO cursos_disciplinas 
          (curso_id, nome, codigo, carga_horaria, creditos, semestre, ementa, tipo) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const tipoFinal = tipo || 'obrigatoria';
      const [result] = await connection.query<ResultSetHeader>(query, [cursoId, nome, codigo, carga_horaria, creditos, semestre, ementa, tipoFinal]);
      
      const novoId = result.insertId;

      if (requisitos && Array.isArray(requisitos) && requisitos.length > 0) {
          const valores = requisitos.map((reqId: number) => [novoId, reqId]);
          await connection.query(
              `INSERT INTO disciplina_requisitos (disciplina_id, requisito_id) VALUES ?`,
              [valores]
          );
      }
      
      await connection.commit();
      res.status(201).json({ id: novoId, ...req.body });
  } catch (error) {
      await connection.rollback();
      console.error("Erro ao adicionar disciplina:", error);
      res.status(500).json({ message: "Erro interno ao adicionar a disciplina." });
  } finally {
      connection.release();
  }
};

/**
 * @description Atualiza uma disciplina e seus pré-requisitos.
 * @route PUT /api/cursos/disciplinas/:disciplinaId
 */
export const atualizarDisciplinaCurso = async (req: Request, res: Response) => {
  const { disciplinaId } = req.params;
  const { nome, codigo, carga_horaria, creditos, semestre, ementa, requisitos, tipo } = req.body;

  if (!disciplinaId) return res.status(400).json({ message: "ID da disciplina não fornecido." });

  const connection = await pool.getConnection();
  try {
      // --- VALIDAÇÃO DE SEMESTRE ---
      // Busca a duração do curso através da disciplina existente
      const [checkRows] = await connection.query<RowDataPacket[]>(`
          SELECT cp.duracao_semestres 
          FROM cursos_disciplinas cd
          JOIN cursos_posgraduacao cp ON cd.curso_id = cp.id
          WHERE cd.id = ?
      `, [disciplinaId]);

      if (checkRows.length === 0) {
          return res.status(404).json({ message: "Disciplina ou curso vinculado não encontrado." });
      }

      const duracaoCurso = checkRows[0].duracao_semestres;

      if (semestre < 0 || semestre > duracaoCurso) {
          return res.status(400).json({ 
              message: `O semestre informado (${semestre}) é inválido. O curso possui duração de ${duracaoCurso} semestres.` 
          });
      }
      // -----------------------------

      await connection.beginTransaction();

      const query = `
        UPDATE cursos_disciplinas SET 
          nome = ?, codigo = ?, carga_horaria = ?, creditos = ?, semestre = ?, ementa = ?, tipo = ?
        WHERE id = ?
      `;
      const tipoFinal = tipo || 'obrigatoria';
      const [result] = await connection.query<ResultSetHeader>(query, [nome, codigo, carga_horaria, creditos, semestre, ementa, tipoFinal, disciplinaId]);

      // ... resto do código (lógica de requisitos) permanece igual ...
      await connection.query(`DELETE FROM disciplina_requisitos WHERE disciplina_id = ?`, [disciplinaId]);

      if (requisitos && Array.isArray(requisitos) && requisitos.length > 0) {
          const valores = requisitos.map((reqId: number) => [disciplinaId, reqId]);
          await connection.query(
              `INSERT INTO disciplina_requisitos (disciplina_id, requisito_id) VALUES ?`,
              [valores]
          );
      }

      await connection.commit();
      res.status(200).json({ message: "Disciplina atualizada com sucesso." });
  } catch (error) {
      await connection.rollback();
      console.error("Erro ao atualizar disciplina:", error);
      res.status(500).json({ message: "Erro interno ao atualizar a disciplina." });
  } finally {
      connection.release();
  }
};

/**
 * @description Deleta uma disciplina.
 * @route DELETE /api/cursos/disciplinas/:disciplinaId
 */
export const deletarDisciplinaCurso = async (req: Request, res: Response) => {
  const { disciplinaId } = req.params;

  if (!disciplinaId) return res.status(400).json({ message: "ID da disciplina não fornecido." });

  try {
      // Nota: Se houver FK com ON DELETE CASCADE configurado no banco, 
      // os registros em disciplina_requisitos serão apagados automaticamente.
      const [result] = await pool.query<ResultSetHeader>("DELETE FROM cursos_disciplinas WHERE id = ?", [disciplinaId]);
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Disciplina não encontrada." });
      }
      res.status(200).json({ message: "Disciplina deletada com sucesso." });
  } catch (error) {
      console.error("Erro ao deletar disciplina:", error);
      res.status(500).json({ message: "Erro interno ao deletar a disciplina." });
  }
};

// --- Funções Auxiliares existentes (mantidas para compatibilidade) ---

export const listarTodasDisciplinasPosGraduacao = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT d.id, d.nome, d.codigo, c.nome AS breve_descricao 
      FROM cursos_disciplinas AS d
      JOIN cursos_posgraduacao AS c ON d.curso_id = c.id
      ORDER BY d.nome ASC;
    `;
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao listar todas:", error);
    res.status(500).json({ message: "Erro interno." });
  }
};

export const listarDisciplinasAgrupadasPorSemestre = async (req: Request, res: Response) => {
    const { cursoId } = req.params;
    if (!cursoId) return res.status(400).json({ message: 'ID do curso obrigatório.' });

    try {
        const query = `SELECT id, nome, codigo, carga_horaria, semestre FROM cursos_disciplinas WHERE curso_id = ? ORDER BY semestre, nome`;
        const [disciplinas] = await pool.query<RowDataPacket[]>(query, [cursoId]);

        const agrupado = disciplinas.reduce((acc, d) => {
            const key = d.semestre || 0; 
            if (!acc[key]) acc[key] = [];
            acc[key].push(d);
            return acc;
        }, {} as Record<number, any[]>);

        res.status(200).json(agrupado);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno.' });
    }
};

export const obterDisciplinaPorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM cursos_disciplinas WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Não encontrada.' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno.' });
    }
};

/**
 * @description Obtém alunos, professores e turmas vinculados a uma disciplina específica.
 * @route GET /api/disciplinas/:disciplinaId/vinculados
 */
export const getVinculadosByDisciplina = async (req: Request, res: Response) => {
  const { disciplinaId } = req.params;

  if (!disciplinaId) {
    return res.status(400).json({ message: "O ID da disciplina é obrigatório." });
  }

  const connection = await pool.getConnection();
  try {
    // Query de Professores (mantida como na versão anterior)
    const [professores] = await connection.query<RowDataPacket[]>(`
      SELECT DISTINCT
          f.id,
          f.nome,
          f.departamento,
          (SELECT COUNT(DISTINCT va.aluno_id) 
           FROM vincular_aluno_curso va
           JOIN cursos_posgraduacao cp ON va.curso_posgraduacao_id = cp.id
           WHERE cp.coordenador_id = f.id) as orientandos
      FROM funcionarios f
      WHERE f.id IN (
          SELECT DISTINCT professor_responsavel 
          FROM turmas 
          WHERE disciplina_id = ? AND professor_responsavel IS NOT NULL
          UNION
          SELECT DISTINCT c.coordenador_id
          FROM cursos_posgraduacao c
          JOIN cursos_disciplinas d ON c.id = d.curso_id
          WHERE d.id = ? AND c.coordenador_id IS NOT NULL
      ) 
      AND f.status = 'ativo'
      ORDER BY f.nome;
    `, [disciplinaId, disciplinaId]);

    // 🔥 CORREÇÃO APLICADA AQUI: Adicionamos 'at.status_vinculo' à query de alunos.
    const [alunos] = await connection.query<RowDataPacket[]>(`
      SELECT
        u.id,
        u.nome,
        a.matricula,
        at.status_vinculo as status_vinculo, -- <-- MUDANÇA AQUI
        at.id as vinculoId
      FROM users u
      JOIN alunos a ON u.id = a.id
      JOIN alunos_turmas at ON u.id = at.aluno_id
      JOIN turmas t ON at.turma_id = t.id
      WHERE t.disciplina_id = ? AND u.status = 'ativo'
      ORDER BY u.nome;
    `, [disciplinaId]);

    // Query de Turmas (mantida)
    const [turmas] = await connection.query<RowDataPacket[]>(`
      SELECT
        t.id,
        t.nome_turma as codigo,
        cpl.nome as periodo,
        (SELECT COUNT(*) FROM alunos_turmas at WHERE at.turma_id = t.id) as alunos,
        d.nome as disciplina
      FROM turmas t
      LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
      LEFT JOIN cursos_disciplinas d ON t.disciplina_id = d.id
      WHERE t.disciplina_id = ?
      ORDER BY t.nome_turma;
    `, [disciplinaId]);

    res.status(200).json({
      professores,
      alunos,
      turmas,
    });

  } catch (error) {
    console.error("Erro ao buscar vinculados da disciplina:", error);
    res.status(500).json({ message: "Erro interno ao buscar os dados vinculados." });
  } finally {
    connection.release();
  }
};