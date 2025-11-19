// backend/src/controllers/informacoesComplementaresController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * @description Lista todas as informações complementares de uma disciplina.
 * @route GET /api/disciplinas/:disciplinaId/informacoes
 */
export const listarInformacoes = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                ic.id, 
                ic.titulo, 
                ic.conteudo, 
                ic.categoria,
                ic.turma_id,
                t.nome_turma
             FROM informacoes_complementares ic
             LEFT JOIN turmas t ON ic.turma_id = t.id
             WHERE ic.disciplina_id = ? 
             ORDER BY ic.id DESC`,
            [disciplinaId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar informações complementares:", error);
        res.status(500).json({ message: 'Erro interno ao buscar informações.' });
    }
};

/**
 * @description Cria uma nova informação complementar para uma disciplina.
 * @route POST /api/disciplinas/:disciplinaId/informacoes
 */
export const criarInformacao = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    // Adicionado 'turma_id' à desestruturação
    const { titulo, conteudo, categoria, turma_id } = req.body;

    if (!titulo || !conteudo || !categoria) {
        return res.status(400).json({ message: 'Todos os campos (título, conteúdo, categoria) são obrigatórios.' });
    }

    try {
        // --- CORREÇÃO AQUI ---
        // Adicionamos 'turma_id' na query de INSERT e nos valores.
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO informacoes_complementares (disciplina_id, titulo, conteudo, categoria, turma_id) VALUES (?, ?, ?, ?, ?)',
            [disciplinaId, titulo, conteudo, categoria, turma_id || null]
        );
        res.status(201).json({
            id: result.insertId,
            ...req.body
        });
    } catch (error) {
        console.error("Erro ao criar informação complementar:", error);
        res.status(500).json({ message: 'Erro interno ao criar a informação.' });
    }
};

/**
 * @description Atualiza uma informação complementar existente.
 * @route PUT /api/informacoes/:id
 */
export const atualizarInformacao = async (req: Request, res: Response) => {
    const { id } = req.params;
    // Adicionado 'turma_id' à desestruturação
    const { titulo, conteudo, categoria, turma_id } = req.body;

    if (!titulo || !conteudo || !categoria) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // --- CORREÇÃO AQUI ---
        // Adicionamos 'turma_id' na query de UPDATE e nos valores.
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE informacoes_complementares SET titulo = ?, conteudo = ?, categoria = ?, turma_id = ? WHERE id = ?',
            [titulo, conteudo, categoria, turma_id || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Informação não encontrada.' });
        }

        res.status(200).json({ message: 'Informação atualizada com sucesso.' });
    } catch (error) {
        console.error("Erro ao atualizar informação complementar:", error);
        res.status(500).json({ message: 'Erro interno ao atualizar a informação.' });
    }
};

/**
 * @description Exclui uma informação complementar.
 * @route DELETE /api/informacoes/:id
 */
export const excluirInformacao = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM informacoes_complementares WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Informação não encontrada.' });
        }

        res.status(200).json({ message: 'Informação excluída com sucesso.' });
    } catch (error) {
        console.error("Erro ao excluir informação complementar:", error);
        res.status(500).json({ message: 'Erro interno ao excluir a informação.' });
    }
};

/**
 * @description Lista apenas as turmas ATIVAS de uma disciplina para o seletor de Informações.
 * @route GET /api/disciplinas/:disciplinaId/turmas-para-info
 */
export const getTurmasParaInfo = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;

    if (!disciplinaId) {
        return res.status(400).json({ message: "O ID da disciplina é obrigatório." });
    }

    try {
        const query = `
            SELECT 
                t.id, 
                t.nome_turma AS nome
            FROM turmas t
            WHERE 
                t.disciplina_id = ? 
                AND t.status = 'Ativa'
            ORDER BY t.nome_turma ASC;
        `;
        
        const [turmas] = await pool.query<RowDataPacket[]>(query, [disciplinaId]);
        res.status(200).json(turmas);
    } catch (error) {
        console.error("Erro ao buscar turmas ativas para informações:", error);
        res.status(500).json({ message: "Erro interno ao buscar as turmas." });
    }
};
