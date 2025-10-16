import { Request, Response } from 'express';
import pool from '../config/db'; // ajuste o caminho conforme sua estrutura
import { OkPacket, RowDataPacket } from 'mysql2';

// ─────────────────────────────────────────────────────────────
// AULAS
// ─────────────────────────────────────────────────────────────

export const listarAulas = async (req: Request, res: Response) => {
    const { turmaId, materiaId, calendarioId } = req.query;

    try {
        const [rows] = await pool.query(
            `SELECT * FROM aulas 
       WHERE turma_id = ? AND materia_id = ? AND calendario_id = ?
       ORDER BY data ASC`,
            [turmaId, materiaId, calendarioId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar aulas:', err);
        res.status(500).json({ error: 'Erro ao buscar aulas.' });
    }
};

export const criarAula = async (req: Request, res: Response) => {
    const { data, descricao, status, materia_id, turma_id, calendario_id } = req.body;

    try {
        const [result] = await pool.query(
            `INSERT INTO aulas (data, descricao, status, materia_id, turma_id, calendario_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [data, descricao, status, materia_id, turma_id, calendario_id]
        );

        const insertResult = result as OkPacket; // cast explícito

        res.json({ id: insertResult.insertId });
    } catch (err) {
        console.error('Erro ao criar aula:', err);
        res.status(500).json({ error: 'Erro ao criar aula.' });
    }
};
// ─────────────────────────────────────────────────────────────
// PRESENÇAS
// ─────────────────────────────────────────────────────────────

export const salvarPresencasBatch = async (req: Request, res: Response) => {
    const presencas = req.body as Array<{
        aluno_id: number;
        presenca: number;
        aula_id: number;
    }>;

    const aulaId = presencas[0]?.aula_id;
    if (!aulaId) {
        return res.status(400).json({ error: 'Aula inválida.' });
    }

    try {
        // 👉 busca dados da aula
        const [aulaRows] = (await pool.query(
            `SELECT turma_id, materia_id, data AS dataAula, descricao
   FROM aulas
   WHERE id = ?`, [aulaId]
        )) as [RowDataPacket[], any[]];

        if (!aulaRows.length) {
            return res.status(404).json({ error: 'Aula não encontrada.' });
        }
        const { turma_id, materia_id, dataAula, descricao } = aulaRows[0];

        // 👉 monta payload com os FKs e campos corretos
        const values = presencas.map((p: any) => [
            turma_id,
            p.aluno_id,
            materia_id,
            dataAula,
            descricao,
            p.presenca,
            aulaId
        ]);

        // Usar ON DUPLICATE KEY UPDATE para garantir que se a combinação aluno_id + aula_id já existir, seja feita uma atualização
        await pool.query(
            `INSERT INTO presencas 
         (turma_id, aluno_id, materia_id, data, descricao, presenca, aula_id) 
       VALUES ?
       ON DUPLICATE KEY UPDATE
         presenca = VALUES(presenca)`,
            [values]
        );

        // opcional: atualiza status da aula para "realizada"
        await pool.query(
            `UPDATE aulas SET status = 'realizada' WHERE id = ?`,
            [aulaId]
        );

        res.json({ status: 'Presenças registradas com sucesso.' });
    } catch (err) {
        console.error('Erro ao salvar presenças:', err);
        res.status(500).json({ error: 'Erro ao registrar presenças.' });
    }
};



export const listarPresencas = async (req: Request, res: Response) => {
    const { turmaId, materiaId } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT * FROM presencas 
       WHERE turma_id = ? AND materia_id = ?`,
            [turmaId, materiaId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar presenças:', err);
        res.status(500).json({ error: 'Erro ao buscar presenças.' });
    }
};

export const listarPresencasPorAula = async (req: Request, res: Response) => {
    const { aulaId } = req.params;
    if (!aulaId) {
        return res.status(400).json({ error: 'Parâmetro aulaId é obrigatório.' });
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
         p.aluno_id,
         a.nome,
         a.matricula,
         p.presenca
       FROM presencas p
       JOIN alunos a ON a.id = p.aluno_id
      WHERE p.aula_id = ?`,
            [aulaId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar presenças:', err);
        res.status(500).json({ error: 'Erro ao buscar presenças.' });
    }
};


export const atualizarStatusAula = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await pool.query(`UPDATE aulas SET status = ? WHERE id = ?`, [status, id]);
        res.json({ message: 'Status atualizado com sucesso.' });
    } catch (err) {
        console.error('Erro ao atualizar status da aula:', err);
        res.status(500).json({ error: 'Erro ao atualizar status da aula.' });
    }
};

export const excluirAula = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // 1) apaga todas as presenças ligadas a essa aula
        await pool.query<OkPacket>(
            'DELETE FROM presencas WHERE aula_id = ?',
            [id]
        );

        // 2) apaga a própria aula
        const [result] = await pool.query<OkPacket>(
            'DELETE FROM aulas WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Aula não encontrada.' });
        }

        res.json({ message: 'Aula e presenças removidas com sucesso.' });
    } catch (err) {
        console.error('Erro ao excluir aula:', err);
        res.status(500).json({ error: 'Erro ao excluir aula.' });
    }
};

export const getFaltasPorPeriodo = async (req: Request, res: Response) => {
    const { turmaId, materiaId } = req.params;

    try {
        // 1) Tenta com calendário_gestor.periodo
        let [rows] = await pool.query<RowDataPacket[]>(
            `SELECT
         p.aluno_id,
         cg.periodo       AS periodo,
         COUNT(*)         AS total_faltas
       FROM presencas p
       JOIN aulas a ON p.aula_id = a.id
       JOIN calendario_gestor cg ON a.calendario_id = cg.id
      WHERE p.presenca = 0
        AND a.turma_id   = ?
        AND a.materia_id = ?
      GROUP BY p.aluno_id, cg.periodo
      ORDER BY cg.periodo`,
            [turmaId, materiaId]
        );

        console.log('getFaltasPorPeriodo (cg) →', rows);

        // 2) Se não achou nada, usa fallback por a.calendario_id
        if (!rows.length) {
            [rows] = await pool.query<RowDataPacket[]>(
                `SELECT
           p.aluno_id,
           a.calendario_id AS periodo,
           COUNT(*)        AS total_faltas
         FROM presencas p
         JOIN aulas a ON p.aula_id = a.id
        WHERE p.presenca = 0
          AND a.turma_id   = ?
          AND a.materia_id = ?
        GROUP BY p.aluno_id, a.calendario_id
        ORDER BY a.calendario_id`,
                [turmaId, materiaId]
            );
            console.log('getFaltasPorPeriodo (fallback) →', rows);
        }

        return res.json(rows);
    } catch (error) {
        console.error('Erro interno ao buscar faltas por período:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar faltas.' });
    }
};
