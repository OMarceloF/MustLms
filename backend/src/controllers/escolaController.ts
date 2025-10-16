import { Request, Response } from "express";
import pool from "../config/db";
import { RowDataPacket } from "mysql2";

export const getNomeEscola = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT nome FROM escolas WHERE id = 1 LIMIT 1"
    );

    if (rows.length > 0) {
      const nome = rows[0].nome as string;
      return res.json({ nome });
    } else {
      return res.status(404).json({ error: "Escola não encontrada" });
    }
  } catch (error) {
    console.error("Erro ao buscar nome da escola:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
