// src/controllers/disciplinasController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

//==============================================================================
// CRUD para Matriz Curricular (Disciplinas de um CURSO ESPECÍFICO)
//==============================================================================

/**
 * @description Lista as disciplinas de um curso específico, incluindo as turmas vinculadas.
 * @route GET /api/cursos/:cursoId/disciplinas
 */
export const listarDisciplinasCurso = async (req: Request, res: Response) => {
  const { cursoId } = req.params;

  if (!cursoId) {
    return res.status(400).json({ message: "ID do curso não fornecido na URL." });
  }

  try {
    // ALTERAÇÃO: Substituído JSON_ARRAYAGG por GROUP_CONCAT para compatibilidade
    const query = `
      SELECT 
        d.*,
        CONCAT('[', 
          GROUP_CONCAT(
            IF(t.id IS NULL, '', 
              CONCAT(
                '{"id":', t.id, 
                ', "nome":"', t.nome_turma, 
                '", "ano_letivo":', IFNULL(t.ano_letivo, 'null'), 
                '}'
              )
            )
          ),
        ']') AS turmas
      FROM cursos_disciplinas d
      LEFT JOIN disciplinas_turmas dt ON d.id = dt.disciplina_id
      LEFT JOIN turmas t ON dt.turma_id = t.id
      WHERE d.curso_id = ?
      GROUP BY d.id
      ORDER BY d.semestre, d.nome;
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [cursoId]);

    // O GROUP_CONCAT retorna uma string, então precisamos fazer o parse para JSON
    const disciplinas = rows.map(row => {
      try {
        // Se 'turmas' for '[]' ou '[{...}]', o parse funciona.
        // Se for '[null]' (caso de disciplina sem turma), o parse também funciona.
        const parsedTurmas = JSON.parse(row.turmas);
        
        // Remove o 'null' se a disciplina não tiver turmas vinculadas
        row.turmas = parsedTurmas.filter((t: any) => t !== null);

      } catch (e) {
        // Em caso de erro no parse, define como um array vazio para segurança
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