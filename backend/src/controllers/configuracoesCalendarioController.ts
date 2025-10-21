// src/controllers/configuracoesCalendarioController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Interface para a tabela `configuracoes_calendario`
interface ConfiguracoesCalendario extends RowDataPacket {
  id: number;
  ano_letivo: number;
  fuso_horario: string;
  primeiro_dia_semana: string;
  feriados_personalizados: string | null;
}

/**
 * @description Obtém as configurações do calendário para o ano letivo atual.
 * Se não existirem, cria um registo padrão e retorna-o.
 */
export const getCalendarConfig = async (req: Request, res: Response) => {
  const anoLetivo = new Date().getFullYear();
  console.log(`✅ [GET /api/configuracoes/calendario] Buscando configurações gerais para o ano ${anoLetivo}`);

  try {
    const [rows] = await pool.query<ConfiguracoesCalendario[]>(
      'SELECT * FROM configuracoes_calendario WHERE ano_letivo = ?',
      [anoLetivo]
    );

    if (rows.length > 0) {
      console.log('🔍 [GET /api/configuracoes/calendario] Configuração encontrada.');
      return res.json(rows[0]);
    } else {
      console.log('✨ [GET /api/configuracoes/calendario] Nenhuma configuração encontrada. Criando uma padrão.');
      const [insertResult] = await pool.query<ResultSetHeader>(
        'INSERT INTO configuracoes_calendario (ano_letivo) VALUES (?)',
        [anoLetivo]
      );
      const [newRows] = await pool.query<ConfiguracoesCalendario[]>(
        'SELECT * FROM configuracoes_calendario WHERE id = ?',
        [insertResult.insertId]
      );
      return res.status(200).json(newRows[0]);
    }
  } catch (error) {
    console.error("🚨 [GET /api/configuracoes/calendario] Erro ao buscar ou criar configuração:", error);
    res.status(500).json({ error: 'Erro interno ao buscar configurações.' });
  }
};

/**
 * @description Atualiza APENAS as configurações gerais do calendário (fuso horário, feriados, etc.).
 * A gestão dos períodos letivos foi movida para periodosLetivosController.
 */
export const updateCalendarConfig = async (req: Request, res: Response) => {
  const anoLetivo = new Date().getFullYear();
  const { fusoHorario, primeiroDia, feriados } = req.body;
  
  console.log(`✅ [PUT /api/configuracoes/calendario] Atualizando configurações gerais para o ano ${anoLetivo}`);
  console.log('👉 Dados recebidos:', JSON.stringify(req.body, null, 2));

  if (!fusoHorario || !primeiroDia) {
    return res.status(400).json({ error: 'Fuso horário e primeiro dia são obrigatórios.' });
  }

  try {
    const [updateResult] = await pool.query<ResultSetHeader>(
      `UPDATE configuracoes_calendario SET fuso_horario = ?, primeiro_dia_semana = ?, feriados_personalizados = ? WHERE ano_letivo = ?`,
      [fusoHorario, primeiroDia, feriados || null, anoLetivo]
    );

    if (updateResult.affectedRows === 0) {
        // Isso pode acontecer se a configuração para o ano ainda não existir.
        // Uma abordagem mais robusta seria criar se não existir.
        console.log('⚠️ [PUT /api/configuracoes/calendario] Nenhuma linha foi atualizada. A configuração para o ano pode não existir.');
        // Vamos tentar inserir como fallback.
        await pool.query(
            `INSERT INTO configuracoes_calendario (ano_letivo, fuso_horario, primeiro_dia_semana, feriados_personalizados) VALUES (?, ?, ?, ?)`,
            [anoLetivo, fusoHorario, primeiroDia, feriados || null]
        );
        console.log('✨ [PUT /api/configuracoes/calendario] Configuração inserida como fallback.');
    } else {
        console.log('✔️ [PUT /api/configuracoes/calendario] Configurações gerais atualizadas com sucesso.');
    }

    res.status(200).json({ message: 'Configurações gerais do calendário atualizadas!' });

  } catch (error) {
    console.error("🚨 [PUT /api/configuracoes/calendario] Erro ao atualizar configs:", error);
    res.status(500).json({ error: 'Erro ao salvar configurações gerais.' });
  }
};
