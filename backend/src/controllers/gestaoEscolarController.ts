import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, OkPacket } from 'mysql2';
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";

export const listarMateriasPage = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT id, nome, breve_descricao FROM materias");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao listar matérias:", error);
    res.status(500).json({ error: "Erro ao listar matérias" });
  }
};

export const excluirMateria = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM professores_materias WHERE materia_id = ?', [id]);
    await pool.query('DELETE FROM materias_materiais WHERE materia_id = ?', [id]);
    await pool.query('DELETE FROM turmas_materias WHERE materia_id = ?', [id]);
    await pool.query('DELETE FROM materias WHERE id = ?', [id]);

    res.status(200).json({ message: 'Matéria e vínculos removidos com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir matéria:', error);
    res.status(500).json({ error: 'Erro ao excluir matéria' });
  }
};

export const atualizarMateria = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    nome, breve_descricao, aulas_semanais, sobre_a_materia,
    professores, materiais, turmas
  } = req.body;

  try {
    await pool.query("UPDATE materias SET nome=?, breve_descricao=?, aulas_semanais=?, sobre_a_materia=? WHERE id=?",
      [nome, breve_descricao, aulas_semanais, sobre_a_materia, id]);

    await pool.query("DELETE FROM professores_materias WHERE materia_id=?", [id]);
    await pool.query("DELETE FROM materias_materiais WHERE materia_id=?", [id]);
    await pool.query("DELETE FROM turmas_materias WHERE materia_id=?", [id]);

    if (professores?.length) {
      await pool.query(
        "INSERT INTO professores_materias (professor_id, materia_id) VALUES ?",
        [professores.map((pid: number) => [pid, id])]
      );
    }

    if (materiais?.length) {
      await pool.query(
        "INSERT INTO materias_materiais (material_id, materia_id) VALUES ?",
        [materiais.map((mid: number) => [mid, id])]
      );
    }

    if (turmas?.length) {
      await pool.query(
        "INSERT INTO turmas_materias (turma_id, materia_id) VALUES ?",
        [turmas.map((tid: number) => [tid, id])]
      );
    }

    res.status(200).json({ message: "Matéria atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar matéria:", error);
    res.status(500).json({ error: "Erro ao atualizar matéria" });
  }
};

export const obterMateriaPorId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [materiaRows] = await pool.query(
      "SELECT id, nome, breve_descricao, aulas_semanais, sobre_a_materia FROM materias WHERE id = ?",
      [id]
    );

    if (!Array.isArray(materiaRows) || materiaRows.length === 0) {
      return res.status(404).json({ error: "Matéria não encontrada" });
    }

    const materia = materiaRows[0];

    const [professores] = await pool.query(
      `SELECT 
    f.id, 
    f.nome 
FROM 
    professores_materias AS pm
JOIN 
    funcionarios AS f ON f.id = pm.professor_id
JOIN 
    users AS u ON f.id = u.id  -- << ADICIONE ESTA LINHA
WHERE 
    pm.materia_id = ? AND u.status = 'ativo';
`,
      [id]
    );

    const [materiais] = await pool.query(
      `SELECT m.id, m.nome FROM materias_materiais mm
       JOIN materiais m ON m.id = mm.material_id
       WHERE mm.materia_id = ?`,
      [id]
    );

    const [turmas] = await pool.query(
      `SELECT t.id, t.nome FROM turmas_materias mt
       JOIN turmas t ON t.id = mt.turma_id
       WHERE mt.materia_id = ?`,
      [id]
    );

    res.json({
      ...materia,
      professores,
      materiais,
      turmas,
    });
  } catch (error) {
    console.error("Erro ao buscar matéria por ID:", error);
    res.status(500).json({ error: "Erro interno ao buscar matéria" });
  }
};