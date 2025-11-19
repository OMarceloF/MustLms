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
            'SELECT id, titulo, conteudo, categoria FROM informacoes_complementares WHERE disciplina_id = ? ORDER BY id DESC',
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
    const { titulo, conteudo, categoria } = req.body;

    if (!titulo || !conteudo || !categoria) {
        return res.status(400).json({ message: 'Todos os campos (título, conteúdo, categoria) são obrigatórios.' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO informacoes_complementares (disciplina_id, titulo, conteudo, categoria) VALUES (?, ?, ?, ?)',
            [disciplinaId, titulo, conteudo, categoria]
        );
        res.status(201).json({
            id: result.insertId,
            disciplina_id: parseInt(disciplinaId),
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
    const { titulo, conteudo, categoria } = req.body;

    if (!titulo || !conteudo || !categoria) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE informacoes_complementares SET titulo = ?, conteudo = ?, categoria = ? WHERE id = ?',
            [titulo, conteudo, categoria, id]
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
