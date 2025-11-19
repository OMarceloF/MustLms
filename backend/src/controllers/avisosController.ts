// backend/src/controllers/avisosController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * @description Lista todos os avisos de uma disciplina específica.
 * @route GET /api/disciplinas/:disciplinaId/avisos
 */
export const listarAvisos = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                id, 
                titulo, 
                descricao, 
                data_aviso as data, 
                autor_nome as autor 
             FROM avisos_disciplina 
             WHERE disciplina_id = ? 
             ORDER BY data_aviso DESC, id DESC`,
            [disciplinaId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar avisos:", error);
        res.status(500).json({ message: 'Erro interno ao buscar os avisos.' });
    }
};

/**
 * @description Cria um novo aviso para uma disciplina.
 * @route POST /api/disciplinas/:disciplinaId/avisos
 */
export const criarAviso = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    const { titulo, descricao, data, autor, autor_id } = req.body;

    if (!titulo || !descricao || !data || !autor) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO avisos_disciplina (disciplina_id, titulo, descricao, data_aviso, autor_nome, autor_id) VALUES (?, ?, ?, ?, ?, ?)',
            [disciplinaId, titulo, descricao, data, autor, autor_id || null]
        );
        res.status(201).json({
            id: result.insertId,
            ...req.body
        });
    } catch (error) {
        console.error("Erro ao criar aviso:", error);
        res.status(500).json({ message: 'Erro interno ao criar o aviso.' });
    }
};

/**
 * @description Atualiza um aviso existente.
 * @route PUT /api/avisos/:avisoId
 */
export const atualizarAviso = async (req: Request, res: Response) => {
    const { avisoId } = req.params;
    const { titulo, descricao, data, autor } = req.body;

    if (!titulo || !descricao || !data || !autor) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE avisos_disciplina SET titulo = ?, descricao = ?, data_aviso = ?, autor_nome = ? WHERE id = ?',
            [titulo, descricao, data, autor, avisoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Aviso não encontrado.' });
        }
        res.status(200).json({ message: 'Aviso atualizado com sucesso.' });
    } catch (error) {
        console.error("Erro ao atualizar aviso:", error);
        res.status(500).json({ message: 'Erro interno ao atualizar o aviso.' });
    }
};

/**
 * @description Exclui um aviso.
 * @route DELETE /api/avisos/:avisoId
 */
export const excluirAviso = async (req: Request, res: Response) => {
    const { avisoId } = req.params;
    try {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM avisos_disciplina WHERE id = ?',
            [avisoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Aviso não encontrado.' });
        }
        res.status(200).json({ message: 'Aviso excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao excluir aviso:", error);
        res.status(500).json({ message: 'Erro interno ao excluir o aviso.' });
    }
};
