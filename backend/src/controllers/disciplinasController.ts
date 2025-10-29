// src/controllers/disciplinasController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader } from 'mysql2';

//==============================================================================
// NOVA FUNÇÃO - Para a página de Gestão Escolar
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


//==============================================================================
// CRUD para Matriz Curricular (Disciplinas de um CURSO ESPECÍFICO)
//==============================================================================

/**
 * @description Lista as disciplinas de um curso específico.
 * @route GET /api/cursos/:cursoId/disciplinas
 */
export const listarDisciplinasCurso = async (req: Request, res: Response) => {
  const { cursoId } = req.params; 

  if (!cursoId) {
    return res.status(400).json({ message: "ID do curso não fornecido na URL." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM cursos_disciplinas WHERE curso_id = ? ORDER BY semestre, nome", [cursoId]);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar disciplinas:", error);
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
