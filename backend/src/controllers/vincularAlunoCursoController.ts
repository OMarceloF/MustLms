// backend/src/controllers/vincularAlunoCursoController.ts

import { Request, Response } from 'express';
import pool from '../config/db'; // Ajuste o caminho se necessário

/**
 * @route   POST /api/matriculas/vincular-aluno-curso
 * @desc    Vincula um aluno a um curso de pós-graduação.
 */
export const vincularAlunoCursoPosGraduacao = async (req: Request, res: Response) => {
    const { alunoId, cursoId, turmaId, grade } = req.body;

    if (!alunoId || !cursoId || !turmaId || !grade) {
        return res.status(400).json({ message: 'Dados insuficientes para realizar o vínculo.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [alunoRows]: any[] = await connection.execute('SELECT id FROM users WHERE id = ?', [alunoId]);
        if (alunoRows.length === 0) {
            throw new Error('Aluno não encontrado no sistema.');
        }

        const [cursoRows]: any[] = await connection.execute('SELECT id FROM cursos_posgraduacao WHERE id = ?', [cursoId]);
        if (cursoRows.length === 0) {
            throw new Error('Curso de pós-graduação não encontrado.');
        }

        // MODIFICAÇÃO: Usando o nome da tabela corrigido 'vincular_aluno_curso'
        const sql = `
            INSERT INTO vincular_aluno_curso 
            (aluno_id, curso_posgraduacao_id, turma_id_mocado, grade_mocada, status_matricula) 
            VALUES (?, ?, ?, ?, 'Ativa')
            ON DUPLICATE KEY UPDATE
                turma_id_mocado = VALUES(turma_id_mocado),
                grade_mocada = VALUES(grade_mocada),
                status_matricula = 'Ativa'
        `;
        
        const params = [alunoId, cursoId, turmaId, grade];
        await connection.execute(sql, params);

        await connection.commit();

        res.status(201).json({ message: 'Aluno vinculado ao curso com sucesso!' });

    } catch (error: any) {
        await connection.rollback();
        console.error('Erro ao vincular aluno ao curso:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este aluno já está matriculado neste curso.' });
        }
        
        res.status(500).json({ message: error.message || 'Erro interno do servidor ao processar a matrícula.' });
    } finally {
        if (connection) connection.release();
    }
};
