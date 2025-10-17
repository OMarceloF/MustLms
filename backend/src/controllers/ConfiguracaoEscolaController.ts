// src/controllers/configuracoesEscolaController.ts

import { Request, Response } from 'express';
import pool from '../config/db';

// --- Obter as configurações da escola ---
export const getSchoolConfig = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM configuracoes_escola ORDER BY id DESC LIMIT 1");
    // Se a tabela estiver vazia, retorna um objeto vazio ou valores padrão
    if ((rows as any[]).length === 0) {
      return res.json({}); 
    }
    res.json((rows as any[])[0]);
  } catch (error) {
    console.error("Erro ao obter configurações da escola:", error);
    res.status(500).json({ message: "Erro interno ao buscar as configurações." });
  }
};

// --- Salvar ou Atualizar as configurações da escola ---
export const saveSchoolConfig = async (req: Request, res: Response) => {
  const { nome_completo, razao_social, cnpj, endereco, email, telefone } = req.body;

  try {
    // Verifica se já existe uma configuração para decidir entre INSERT e UPDATE
    const [rows] = await pool.query("SELECT id FROM configuracoes_escola LIMIT 1");
    const configExists = (rows as any[]).length > 0;
    const existingId = configExists ? (rows as any[])[0].id : null;

    if (configExists) {
      // --- Atualiza a configuração existente ---
      const query = `
        UPDATE configuracoes_escola 
        SET nome_completo = ?, razao_social = ?, cnpj = ?, endereco = ?, email = ?, telefone = ?
        WHERE id = ?
      `;
      await pool.query(query, [nome_completo, razao_social, cnpj, endereco, email, telefone, existingId]);
      res.status(200).json({ message: "Configurações da escola atualizadas com sucesso!" });
    } else {
      // --- Insere uma nova configuração ---
      const query = `
        INSERT INTO configuracoes_escola (nome_completo, razao_social, cnpj, endereco, email, telefone) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await pool.query(query, [nome_completo, razao_social, cnpj, endereco, email, telefone]);
      res.status(201).json({ message: "Configurações da escola salvas com sucesso!" });
    }
  } catch (error) {
    console.error("Erro ao salvar configurações da escola:", error);
    res.status(500).json({ message: "Erro interno ao salvar as configurações." });
  }
};
