// src/controllers/configuracoesSistemaController.ts

import { Request, Response } from 'express';
import pool from '../config/db';

/**
 * @description Busca o status atual de preenchimento ("Sim" ou "Não") de todas as configurações.
 * @route GET /api/configuracoes-sistema/status
 */
export const getSystemConfigStatus = async (req: Request, res: Response) => {
  try {
    // Busca sempre o registro com id = 1, que é nosso registro "mestre".
    const [rows] = await pool.query("SELECT id, escola_status, cores_status, calendario_status FROM configuracoes_sistema WHERE id = 1");

    if ((rows as any[]).length === 0) {
      // Fallback: se o registro não existir, retorna um estado padrão "Não preenchido".
      return res.json({
          escola_status: 'Não',
          cores_status: 'Não',
          calendario_status: 'Não',
      });
    }
    res.json((rows as any[])[0]);
  } catch (error) {
    console.error("Erro ao obter status da configuração do sistema:", error);
    res.status(500).json({ message: "Erro interno ao buscar o status da configuração." });
  }
};

/**
 * @description Função interna para atualizar o status de uma etapa para "Sim".
 * @param step - O nome da coluna de status a ser atualizada.
 */
export const updateConfigStep = async (step: 'escola_status' | 'cores_status' | 'calendario_status') => {
  try {
    // Este comando define o campo especificado como "Sim" no registro mestre (id=1).
    const query = `UPDATE configuracoes_sistema SET ${step} = 'Sim' WHERE id = 1`;
    await pool.query(query);
    console.log(`Etapa de configuração '${step}' marcada como 'Sim'.`);
  } catch (error) {
    console.error(`Erro ao atualizar a etapa '${step}':`, error);
  }
};
