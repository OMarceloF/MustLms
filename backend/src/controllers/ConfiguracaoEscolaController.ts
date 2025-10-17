// src/controllers/configuracoesEscolaController.ts

import { Request, Response } from 'express';
import pool from '../config/db'; 
// Importa a função que atualiza a tabela de status
import { updateConfigStep } from './configuracoesSistemaController';

/**
 * @description Busca os dados mais recentes da tabela `configuracoes_escola`.
 * @route GET /api/configuracoes-escola
 */
export const getSchoolConfig = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM configuracoes_escola ORDER BY id DESC LIMIT 1");
    if ((rows as any[]).length === 0) {
      return res.json({});
    }
    res.json((rows as any[])[0]);
  } catch (error) {
    console.error("Erro ao obter configurações da escola:", error);
    res.status(500).json({ message: "Erro interno ao buscar as configurações." });
  }
};

/**
 * @description Salva/atualiza as informações da escola e marca a etapa como "Sim" na tabela de status.
 * @route POST /api/configuracoes-escola
 */
export const saveSchoolConfig = async (req: Request, res: Response) => {
    console.log("Recebida requisição para salvar. Corpo da requisição:", req.body);
  const { nome_completo, razao_social, cnpj, endereco, email, telefone } = req.body;

  try {
    // Verifica se já existe um registro para decidir entre INSERT e UPDATE
    const [rows] = await pool.query("SELECT id FROM configuracoes_escola ORDER BY id DESC LIMIT 1");
    const configExists = (rows as any[]).length > 0;

    if (configExists) {
      // Atualiza o registro existente
      const existingId = (rows as any[])[0].id;
      const query = `UPDATE configuracoes_escola SET nome_completo = ?, razao_social = ?, cnpj = ?, endereco = ?, email = ?, telefone = ? WHERE id = ?`;
      await pool.query(query, [nome_completo, razao_social, cnpj, endereco, email, telefone, existingId]);
    } else {
      // Insere um novo registro
      const query = `INSERT INTO configuracoes_escola (nome_completo, razao_social, cnpj, endereco, email, telefone) VALUES (?, ?, ?, ?, ?, ?)`;
      await pool.query(query, [nome_completo, razao_social, cnpj, endereco, email, telefone]);
    }
    
    // Após o sucesso, chama a função para atualizar o status para "Sim"
    await updateConfigStep('escola_status');

    res.status(200).json({ message: "Configurações da escola salvas e status atualizado com sucesso!" });

  } catch (error) {
    console.error("Erro ao salvar configurações da escola:", error);
    res.status(500).json({ message: "Erro interno ao salvar as configurações." });
  }
};
