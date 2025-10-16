import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import multer from "multer";
import path from "path";

export const criarMateria = async (req: Request, res: Response) => {
  try {
    const {
      nome,
      breve_descricao,
      aulas_semanais,
      sobre_a_materia,
      qtd_professores,
      qtd_materiais,
      qtd_turmas_vinculadas,
      professores,
      materiais,
      turmas,
    } = req.body;

    if (!nome || !breve_descricao || !aulas_semanais || !sobre_a_materia) {
      return res.status(400).json({ error: "Campos obrigatórios não enviados" });
    }

    // Inserir matéria na tabela materias
    const [result]: any = await pool.query(
      "INSERT INTO materias (nome, breve_descricao, aulas_semanais, sobre_a_materia, qtd_professores, qtd_materiais, qtd_turmas_vinculadas) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        nome,
        breve_descricao,
        aulas_semanais,
        sobre_a_materia,
        qtd_professores || 0,
        qtd_materiais || 0,
        qtd_turmas_vinculadas || 0,
      ]
    );

    const materiaId = result.insertId;

    // Vínculos professores_materias
    if (professores && Array.isArray(professores)) {
      const valoresProfessores = professores.map((profId: number) => [profId, materiaId]);
      if (valoresProfessores.length > 0) {
        await pool.query(
          "INSERT INTO professores_materias (professor_id, materia_id) VALUES ?",
          [valoresProfessores]
        );
      }
    }

    // Vínculos materiais_materias (supondo nome da tabela "materias_materiais")
    if (materiais && Array.isArray(materiais)) {
      const valoresMateriais = materiais.map((matId: number) => [matId, materiaId]);
      if (valoresMateriais.length > 0) {
        await pool.query(
          "INSERT INTO materias_materiais (material_id, materia_id) VALUES ?",
          [valoresMateriais]
        );
      }
    }

    // Vínculos materias_turmas (supondo nome da tabela "turmas_materias")
    if (turmas && Array.isArray(turmas)) {
      const valoresTurmas = turmas.map((turmaId: number) => [turmaId, materiaId]);
      if (valoresTurmas.length > 0) {
        await pool.query(
          "INSERT INTO turmas_materias (turma_id, materia_id) VALUES ?",
          [valoresTurmas]
        );
      }
    }

    return res.status(201).json({ message: "Matéria criada com sucesso" });
  } catch (error) {
    console.error("Erro criarMateriaController:", error);
    return res.status(500).json({ error: "Erro ao criar matéria" });
  }
};

export const listarFuncionariosMateria = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`SELECT 
    f.id, 
    f.nome 
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    u.status = 'ativo';
`);
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    res.status(500).json({ error: "Erro ao buscar funcionários" });
  }
};

export const listarMateriaisMateria = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT id, nome FROM materiais");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar materiais:", error);
    res.status(500).json({ error: "Erro ao buscar materiais" });
  }
};

export const listarTurmasMateria = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT id, nome FROM turmas");
    res.json(rows);
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    res.status(500).json({ error: "Erro ao buscar turmas" });
  }
};