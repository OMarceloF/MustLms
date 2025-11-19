// src/controllers/disciplinasController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

//==============================================================================
// CRUD para Matriz Curricular (Disciplinas de um CURSO ESPECÍFICO)
//==============================================================================

/**
 * @description Lista as disciplinas de um curso específico, incluindo as turmas vinculadas em uma única query.
 * @route GET /api/cursos/:cursoId/disciplinas
 */
export const listarDisciplinasCurso = async (req: Request, res: Response) => {
  const { cursoId } = req.params;

  if (!cursoId) {
    return res.status(400).json({ message: "ID do curso não fornecido na URL." });
  }

  try {
    // --- QUERY OTIMIZADA ---
    // Usamos LEFT JOIN para incluir turmas e GROUP_CONCAT para agregá-las em um JSON.
    const query = `
      SELECT 
        d.id,
        d.nome,
        d.codigo,
        d.creditos,
        d.carga_horaria,
        d.semestre,
        d.ementa,
        -- Agrega as turmas em um array JSON. Se não houver turmas, retorna um array vazio '[]'.
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

    // O resultado de 'turmas' já é uma string JSON, então precisamos fazer o parse.
    const disciplinas = rows.map(row => {
      try {
        // Se 'turmas' for '[]' ou '[{...}]', o parse funciona.
        row.turmas = JSON.parse(row.turmas);
      } catch (e) {
        // Em caso de erro no parse (improvável com a query acima), define como array vazio.
        row.turmas = [];
      }
      return row;
    });

    res.json(disciplinas);
  } catch (error) {
    console.error("Erro ao listar disciplinas com turmas:", error);
    res.status(500).json({ message: "Erro interno ao buscar as disciplinas." });
  }
};

/**
 * @description Adiciona uma nova disciplina a um curso.
 * @route POST /api/cursos/:cursoId/disciplinas
 */
export const adicionarDisciplinaCurso = async (req: Request, res: Response) => {
  const { cursoId } = req.params;
  const { nome, codigo, carga_horaria, creditos, semestre, ementa } = req.body;

  if (!cursoId) {
    return res.status(400).json({ message: "ID do curso não foi encontrado na requisição." });
  }

  if (!nome || carga_horaria === undefined || creditos === undefined || semestre === undefined) {
      return res.status(400).json({ message: "Campos obrigatórios (nome, carga horária, créditos, semestre) não foram preenchidos." });
  }

  try {
      const query = `
        INSERT INTO cursos_disciplinas 
          (curso_id, nome, codigo, carga_horaria, creditos, semestre, ementa) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [cursoId, nome, codigo, carga_horaria, creditos, semestre, ementa];
      
      const [result] = await pool.query<ResultSetHeader>(query, values);
      
      res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
      console.error("Erro ao adicionar disciplina:", error);
      res.status(500).json({ message: "Erro interno ao adicionar a disciplina." });
  }
};

/**
 * @description Atualiza uma disciplina existente.
 * @route PUT /api/cursos/disciplinas/:disciplinaId
 */
export const atualizarDisciplinaCurso = async (req: Request, res: Response) => {
  const { disciplinaId } = req.params;
  const { nome, codigo, carga_horaria, creditos, semestre, ementa } = req.body;

  if (!disciplinaId) {
    return res.status(400).json({ message: "ID da disciplina não fornecido." });
  }
  if (!nome || carga_horaria === undefined || creditos === undefined || semestre === undefined) {
      return res.status(400).json({ message: "Campos obrigatórios não foram preenchidos." });
  }

  try {
      const query = `
        UPDATE cursos_disciplinas SET 
          nome = ?, codigo = ?, carga_horaria = ?, creditos = ?, semestre = ?, ementa = ? 
        WHERE id = ?
      `;
      const values = [nome, codigo, carga_horaria, creditos, semestre, ementa, disciplinaId];
      
      const [result] = await pool.query<ResultSetHeader>(query, values);

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Disciplina não encontrada." });
      }
      res.status(200).json({ message: "Disciplina atualizada com sucesso." });
  } catch (error) {
      console.error("Erro ao atualizar disciplina:", error);
      res.status(500).json({ message: "Erro interno ao atualizar a disciplina." });
  }
};

/**
 * @description Deleta uma disciplina de um curso.
 * @route DELETE /api/cursos/disciplinas/:disciplinaId
 */
export const deletarDisciplinaCurso = async (req: Request, res: Response) => {
  const { disciplinaId } = req.params;

  if (!disciplinaId) {
    return res.status(400).json({ message: "ID da disciplina não fornecido." });
  }

  try {
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

//==============================================================================
// FUNÇÃO para a página de Gestão Escolar
//==============================================================================

/**
 * @description Lista TODAS as disciplinas de pós-graduação para a página de gestão.
 * @route GET /api/disciplinas-posgraduacao
 */
export const listarTodasDisciplinasPosGraduacao = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        d.id, 
        d.nome, 
        d.codigo,
        c.nome AS breve_descricao 
      FROM cursos_disciplinas AS d
      JOIN cursos_posgraduacao AS c ON d.curso_id = c.id
      ORDER BY d.nome ASC;
    `;
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Erro ao listar todas as disciplinas de pós-graduação:", error);
    res.status(500).json({ message: "Erro interno ao buscar as disciplinas." });
  }
};

/**
 * @description Lista todas as disciplinas de um curso, agrupadas por semestre.
 * @route GET /api/cursos/:cursoId/disciplinas-agrupadas
 */
export const listarDisciplinasAgrupadasPorSemestre = async (req: Request, res: Response) => {
    const { cursoId } = req.params;
    if (!cursoId) {
        return res.status(400).json({ message: 'O ID do curso é obrigatório.' });
    }

    try {
        const query = `
            SELECT id, nome, codigo, carga_horaria, semestre 
            FROM cursos_disciplinas 
            WHERE curso_id = ? 
            ORDER BY semestre, nome;
        `;
        const [disciplinas] = await pool.query<RowDataPacket[]>(query, [cursoId]);

        // Agrupa as disciplinas por semestre em um objeto
        const agrupado = disciplinas.reduce((acc, disciplina) => {
            // Disciplinas com semestre 0 ou null são agrupadas como 'Optativas'
            const semestreKey = disciplina.semestre || 0; 
            if (!acc[semestreKey]) {
                acc[semestreKey] = [];
            }
            acc[semestreKey].push(disciplina);
            return acc;
        }, {} as Record<number, any[]>);

        res.status(200).json(agrupado);

    } catch (error) {
        console.error("Erro ao buscar disciplinas agrupadas:", error);
        res.status(500).json({ message: 'Erro interno ao buscar as disciplinas.' });
    }
};

/**
 * @description Obtém os detalhes de uma disciplina específica pelo seu ID.
 * @route GET /api/disciplinas/:id
 */
export const obterDisciplinaPorId = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: "O ID da disciplina é obrigatório." });
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, nome FROM cursos_disciplinas WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Disciplina não encontrada.' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Erro ao obter detalhes da disciplina:", error);
        res.status(500).json({ message: 'Erro interno ao buscar a disciplina.' });
    }
};
