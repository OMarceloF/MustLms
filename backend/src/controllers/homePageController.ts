import { Request, Response } from "express";
import pool from "../config/db";

export const contarAlunos = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query("SELECT COUNT(*) as total FROM alunos WHERE status != 'inativo'");
    const total = rows[0].total;
    res.json({ total });
  } catch (error) {
    console.error("Erro ao contar alunos:", error);
    res.status(500).json({ message: "Erro ao contar alunos." });
  }
};

export const contarFuncionarios = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(`SELECT 
    COUNT(*) as totalF 
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    u.status = 'ativo';
    ` );
    const totalF = rows[0].totalF;
    res.json({ totalF });
  } catch (error) {
    console.error("Erro ao contar alunos:", error);
    res.status(500).json({ message: "Erro ao contar alunos." });
  }
};

export const contarResponsaveis = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query("SELECT COUNT(*) as totalR FROM responsaveis");
    const totalR = rows[0].totalR;
    res.json({ totalR });
  } catch (error) {
    console.error("Erro ao contar alunos:", error);
    res.status(500).json({ message: "Erro ao contar alunos." });
  }
};