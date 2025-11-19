// backend/src/controllers/planoEnsinoController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * @description Lista TODOS os planos de ensino de uma disciplina específica.
 * @route GET /api/disciplinas/:disciplinaId/planos-ensino
 */
export const listarPlanosDeEnsino = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                pe.id,
                pe.objetivos,
                pe.competencias,
                pe.conteudos,
                pe.cronograma,
                pe.avaliacoes,
                pe.turma_id,
                t.nome_turma AS turma_nome
             FROM planos_ensino pe
             LEFT JOIN turmas t ON pe.turma_id = t.id
             WHERE pe.disciplina_id = ?
             ORDER BY t.nome_turma ASC, pe.id ASC`,
            [disciplinaId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar planos de ensino:", error);
        res.status(500).json({ message: 'Erro interno ao buscar os planos de ensino.' });
    }
};

/**
 * @description Cria um novo plano de ensino para uma disciplina.
 * @route POST /api/disciplinas/:disciplinaId/planos-ensino
 */
export const criarPlanoDeEnsino = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    const { objetivos, competencias, conteudos, cronograma, avaliacoes, turma_id } = req.body;

    if (!objetivos || !competencias || !conteudos) {
        return res.status(400).json({ message: 'Campos essenciais (objetivos, competências, conteúdos) são obrigatórios.' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO planos_ensino (disciplina_id, objetivos, competencias, conteudos, cronograma, avaliacoes, turma_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [disciplinaId, objetivos, competencias, conteudos, cronograma, avaliacoes, turma_id || null]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error("Erro ao criar plano de ensino:", error);
        res.status(500).json({ message: 'Erro interno ao criar o plano de ensino.' });
    }
};

/**
 * @description Atualiza um plano de ensino existente pelo seu ID.
 * @route PUT /api/planos-ensino/:planoId
 */
export const atualizarPlanoDeEnsino = async (req: Request, res: Response) => {
    const { planoId } = req.params;
    const { objetivos, competencias, conteudos, cronograma, avaliacoes, turma_id } = req.body;

    if (!objetivos || !competencias || !conteudos) {
        return res.status(400).json({ message: 'Campos essenciais são obrigatórios.' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE planos_ensino SET objetivos = ?, competencias = ?, conteudos = ?, cronograma = ?, avaliacoes = ?, turma_id = ? WHERE id = ?',
            [objetivos, competencias, conteudos, cronograma, avaliacoes, turma_id || null, planoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Plano de ensino não encontrado.' });
        }
        res.status(200).json({ message: 'Plano de ensino atualizado com sucesso.' });
    } catch (error) {
        console.error("Erro ao atualizar plano de ensino:", error);
        res.status(500).json({ message: 'Erro interno ao atualizar o plano.' });
    }
};

/**
 * @description Exclui um plano de ensino pelo seu ID.
 * @route DELETE /api/planos-ensino/:planoId
 */
export const excluirPlanoDeEnsino = async (req: Request, res: Response) => {
    const { planoId } = req.params;
    try {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM planos_ensino WHERE id = ?',
            [planoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Plano de ensino não encontrado.' });
        }
        res.status(200).json({ message: 'Plano de ensino excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao excluir plano de ensino:", error);
        res.status(500).json({ message: 'Erro interno ao excluir o plano.' });
    }
};

/**
 * @description Lista apenas as turmas ATIVAS de uma disciplina para o seletor do Plano de Ensino.
 * @route GET /api/disciplinas/:disciplinaId/turmas-para-plano
 */
export const getTurmasParaPlano = async (req: Request, res: Response) => {
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
        console.error("Erro ao buscar turmas ativas para o plano de ensino:", error);
        res.status(500).json({ message: "Erro interno ao buscar as turmas." });
    }
};
