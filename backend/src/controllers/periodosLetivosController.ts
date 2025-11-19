// src/controllers/periodosLetivosController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface PeriodoLetivoDB extends RowDataPacket {
  id: number;
  nome: string;
  data_inicio: string;
  data_fim: string;
  config_calendario_id: number;
}

/**
 * @description Obtém TODOS os períodos letivos para popular seletores no frontend.
 * @route GET /api/periodos-letivos/todos
 */
export const getAllPeriodosLetivos = async (req: Request, res: Response) => {
  console.log(`✅ [GET /api/periodos-letivos/todos] Buscando todos os períodos letivos.`);

  try {
    const [periodos] = await pool.query<PeriodoLetivoDB[]>(
      'SELECT id, nome, data_inicio, data_fim FROM configuracoes_periodos_letivos ORDER BY data_inicio DESC'
    );
    
    console.log(`🔍 [GET /api/periodos-letivos/todos] Encontrados ${periodos.length} períodos.`);
    return res.json(periodos);

  } catch (error) {
    console.error("🚨 [GET /api/periodos-letivos/todos] Erro ao buscar todos os períodos:", error);
    res.status(500).json({ error: 'Erro interno ao buscar todos os períodos letivos.' });
  }
};

/**
 * @description Obtém os períodos letivos associados à configuração do calendário do ano atual.
 * @route GET /api/periodos-letivos
 */
export const getPeriodosLetivos = async (req: Request, res: Response) => {
  const anoLetivo = new Date().getFullYear();
  console.log(`✅ [GET /api/periodos-letivos] Buscando períodos para o ano ${anoLetivo}`);

  try {
    // Primeiro, encontramos o ID da configuração do calendário para o ano atual.
    const [configRows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM configuracoes_calendario WHERE ano_letivo = ?',
      [anoLetivo]
    );

    if (configRows.length === 0) {
      console.log('⚠️ [GET /api/periodos-letivos] Nenhuma configuração de calendário encontrada para o ano.');
      return res.json([]); // Retorna um array vazio se não houver configuração
    }
    const configId = configRows[0].id;

    // Agora, buscamos os períodos associados a esse ID de configuração.
    const [periodos] = await pool.query<PeriodoLetivoDB[]>(
      'SELECT * FROM configuracoes_periodos_letivos WHERE config_calendario_id = ? ORDER BY data_inicio',
      [configId]
    );
    
    console.log(`🔍 [GET /api/periodos-letivos] Encontrados ${periodos.length} períodos.`);
    return res.json(periodos);

  } catch (error) {
    console.error("🚨 [GET /api/periodos-letivos] Erro ao buscar períodos:", error);
    res.status(500).json({ error: 'Erro interno ao buscar períodos letivos.' });
  }
};

/**
 * @description Sincroniza (apaga e recria) os períodos letivos para o ano atual.
 * @route POST /api/periodos-letivos
 */
export const syncPeriodosLetivos = async (req: Request, res: Response) => {
  const anoLetivo = new Date().getFullYear();
  const { periodos } = req.body; // O frontend enviará um array de períodos

  console.log(`✅ [POST /api/periodos-letivos] Sincronizando períodos para o ano ${anoLetivo}`);
  console.log('👉 Dados recebidos:', JSON.stringify(periodos, null, 2));

  if (!Array.isArray(periodos)) {
    return res.status(400).json({ error: 'Formato de dados inválido. É esperado um array de períodos.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Encontra o ID da configuração do calendário para o ano atual.
    const [configRows] = await connection.query<RowDataPacket[]>(
      'SELECT id FROM configuracoes_calendario WHERE ano_letivo = ?',
      [anoLetivo]
    );

    if (configRows.length === 0) {
      throw new Error(`Configuração de calendário para o ano ${anoLetivo} não encontrada.`);
    }
    const configId = configRows[0].id;

    // 2. Apaga TODOS os períodos letivos antigos associados a esta configuração.
    await connection.query('DELETE FROM configuracoes_periodos_letivos WHERE config_calendario_id = ?', [configId]);
    console.log(`🗑️ [POST /api/periodos-letivos] Períodos antigos para config_id=${configId} apagados.`);

    // 3. Insere os novos períodos.
    if (periodos.length > 0) {
      const valoresInsert = periodos.map(p => [
        p.nome,
        p.dataInicio,
        p.dataFim,
        configId
      ]);
      const insertQuery = 'INSERT INTO configuracoes_periodos_letivos (nome, data_inicio, data_fim, config_calendario_id) VALUES ?';
      await connection.query(insertQuery, [valoresInsert]);
      console.log(`➕ [POST /api/periodos-letivos] Inseridos ${periodos.length} novos períodos.`);
    }

    await connection.commit();
    res.status(201).json({ message: 'Períodos letivos salvos com sucesso!' });

  } catch (error) {
    await connection.rollback();
    console.error("🚨 [POST /api/periodos-letivos] Erro na transação:", error);
    res.status(500).json({ error: 'Erro interno ao salvar os períodos.' });
  } finally {
    connection.release();
  }
};

// --- NOVA FUNÇÃO ADICIONADA ---

/**
 * @description Busca o período letivo que está ativo na data atual.
 * @route GET /api/periodos-letivos/atual
 */
export const getPeriodoLetivoAtual = async (req: Request, res: Response) => {
    console.log(`✅ [GET /api/periodos-letivos/atual] Buscando período letivo atual.`);
    try {
        const hoje = new Date().toISOString().split('T')[0]; // Formato 'YYYY-MM-DD'

        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT id, nome 
             FROM configuracoes_periodos_letivos 
             WHERE ? BETWEEN data_inicio AND data_fim
             LIMIT 1`,
            [hoje]
        );

        if (rows.length > 0) {
            console.log(`🔍 [GET /api/periodos-letivos/atual] Período encontrado: ${rows[0].nome}`);
            res.status(200).json(rows[0]);
        } else {
            console.log(`⚠️ [GET /api/periodos-letivos/atual] Nenhum período letivo ativo encontrado para hoje.`);
            res.status(404).json({ message: 'Nenhum período letivo ativo encontrado para a data atual.' });
        }
    } catch (error) {
        console.error("🚨 [GET /api/periodos-letivos/atual] Erro ao buscar período letivo atual:", error);
        res.status(500).json({ message: 'Erro interno ao buscar o período letivo.' });
    }
};
