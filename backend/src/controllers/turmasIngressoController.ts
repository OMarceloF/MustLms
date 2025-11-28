// src/controllers/turmasIngressoController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * @route POST /api/turmas-ingresso
 * @description Cria uma nova turma de ingresso vinculada a um curso e período letivo.
 * Tratamento de erro adicionado para duplicidade de período.
 */
export const createTurmaIngresso = async (req: Request, res: Response) => {
    const { nome, cursoId, periodoLetivoId } = req.body;

    // Validação básica
    if (!nome || !cursoId || !periodoLetivoId) {
        return res.status(400).json({ 
            message: 'Todos os campos (nome, cursoId, periodoLetivoId) são obrigatórios.' 
        });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Tenta Inserir a nova turma
        const query = `
            INSERT INTO turmas_ingresso (nome, curso_posgraduacao_id, periodo_letivo_id)
            VALUES (?, ?, ?)
        `;

        const [result] = await connection.execute<ResultSetHeader>(query, [
            nome, 
            cursoId, 
            periodoLetivoId
        ]);

        const newId = result.insertId;

        // 2. Recupera o objeto criado para devolver ao frontend
        const [newTurma] = await connection.execute<RowDataPacket[]>(
            `SELECT id, nome, curso_posgraduacao_id 
             FROM turmas_ingresso 
             WHERE id = ?`,
            [newId]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Turma de ingresso criada com sucesso!',
            turma: newTurma[0]
        });

    } catch (error: any) {
        await connection.rollback();

        // --- CORREÇÃO DO ERRO ---
        // Captura violação de unicidade (Erro 1062 - ER_DUP_ENTRY)
        if (error.code === 'ER_DUP_ENTRY') {
            console.warn('Tentativa de duplicidade em turmas de ingresso:', error.sqlMessage);
            
            // Mensagem amigável para o usuário
            return res.status(409).json({ 
                message: 'Já existe uma turma de ingresso vinculada a este Período Acadêmico para este Curso. Selecione a turma existente na lista ou escolha outro período.' 
            });
        }

        console.error('Erro ao criar turma de ingresso:', error);
        res.status(500).json({ message: 'Erro interno ao criar a turma de ingresso.' });
    } finally {
        connection.release();
    }
};

/**
 * @route GET /api/form-data/periodos-letivos
 * @description Lista períodos letivos para popular o dropdown do modal
 */
export const getPeriodosLetivosParaSelect = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.execute(
            `SELECT id, nome FROM configuracoes_periodos_letivos ORDER BY nome DESC`
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar períodos letivos:', error);
        res.status(500).json({ message: 'Erro ao buscar períodos.' });
    }
};