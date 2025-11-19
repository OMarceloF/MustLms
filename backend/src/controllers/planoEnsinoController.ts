// backend/src/controllers/planoEnsinoController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * @description Busca o plano de ensino de uma disciplina específica.
 * @route GET /api/disciplinas/:disciplinaId/plano-ensino
 */
export const getPlanoDeEnsino = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT 
                pe.id,
                cd.nome as disciplina,
                pe.objetivos,
                pe.competencias,
                pe.conteudos,
                pe.cronograma,
                pe.avaliacoes
             FROM planos_ensino pe
             JOIN cursos_disciplinas cd ON pe.disciplina_id = cd.id
             WHERE pe.disciplina_id = ?`,
            [disciplinaId]
        );

        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            // Se não encontrar, retorna um objeto vazio para o frontend não quebrar
            res.status(200).json(null);
        }
    } catch (error) {
        console.error("Erro ao buscar plano de ensino:", error);
        res.status(500).json({ message: 'Erro interno ao buscar o plano de ensino.' });
    }
};

/**
 * @description Cria ou atualiza o plano de ensino de uma disciplina.
 * @route POST /api/disciplinas/:disciplinaId/plano-ensino
 */
export const upsertPlanoDeEnsino = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    const { objetivos, competencias, conteudos, cronograma, avaliacoes } = req.body;

    if (!disciplinaId) {
        return res.status(400).json({ message: 'O ID da disciplina é obrigatório.' });
    }

    try {
        // A cláusula ON DUPLICATE KEY UPDATE faz a mágica de criar ou atualizar
        const query = `
            INSERT INTO planos_ensino (disciplina_id, objetivos, competencias, conteudos, cronograma, avaliacoes)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                objetivos = VALUES(objetivos),
                competencias = VALUES(competencias),
                conteudos = VALUES(conteudos),
                cronograma = VALUES(cronograma),
                avaliacoes = VALUES(avaliacoes);
        `;
        
        const values = [disciplinaId, objetivos, competencias, conteudos, cronograma, avaliacoes];
        const [result] = await pool.query<ResultSetHeader>(query, values);

        // Se insertId > 0, um novo registro foi criado. Se affectedRows > 1, um registro foi atualizado.
        if (result.insertId > 0 || result.affectedRows > 0) {
             res.status(200).json({ message: 'Plano de ensino salvo com sucesso!' });
        } else {
             res.status(200).json({ message: 'Nenhuma alteração detectada.' });
        }

    } catch (error) {
        console.error("Erro ao salvar plano de ensino:", error);
        res.status(500).json({ message: 'Erro interno ao salvar o plano de ensino.' });
    }
};

/**
 * @description Exclui o plano de ensino de uma disciplina.
 * @route DELETE /api/disciplinas/:disciplinaId/plano-ensino
 */
export const deletePlanoDeEnsino = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM planos_ensino WHERE disciplina_id = ?',
            [disciplinaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Plano de ensino não encontrado para esta disciplina.' });
        }

        res.status(200).json({ message: 'Plano de ensino excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao excluir plano de ensino:", error);
        res.status(500).json({ message: 'Erro interno ao excluir o plano.' });
    }
};
