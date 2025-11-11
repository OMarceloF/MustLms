// backend/src/controllers/vincularAlunoCursoController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader } from 'mysql2';

/**
 * @route   POST /api/matriculas/vincular-aluno-curso
 * @desc    Vincula um aluno a um curso de pós-graduação, incluindo a grade curricular.
 */
export const vincularAlunoCursoPosGraduacao = async (req: Request, res: Response) => {
    // MODIFICAÇÃO: Trocado 'grade' por 'gradeId' para refletir o que o frontend envia.
    const { alunoId, cursoId, turmaId, gradeId } = req.body;

    // MODIFICAÇÃO: Adicionada validação para o novo campo 'gradeId'.
    if (!alunoId || !cursoId || !turmaId || !gradeId) {
        return res.status(400).json({ message: 'Dados insuficientes para realizar o vínculo. Todos os campos (aluno, curso, turma e grade) são obrigatórios.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validações (sem alteração, mas mantidas por segurança)
        const [alunoRows]: any[] = await connection.execute('SELECT id FROM users WHERE id = ?', [alunoId]);
        if (alunoRows.length === 0) throw new Error('Aluno não encontrado no sistema.');

        const [cursoRows]: any[] = await connection.execute('SELECT id FROM cursos_posgraduacao WHERE id = ?', [cursoId]);
        if (cursoRows.length === 0) throw new Error('Curso de pós-graduação não encontrado.');

        const [turmaIngressoRows]: any[] = await connection.execute('SELECT id FROM turmas_ingresso WHERE id = ?', [turmaId]);
        if (turmaIngressoRows.length === 0) throw new Error('A turma de ingresso selecionada não foi encontrada.');
        
        const [gradeRows]: any[] = await connection.execute('SELECT id FROM grades_curriculares WHERE id = ?', [gradeId]);
        if (gradeRows.length === 0) throw new Error('A grade curricular selecionada não foi encontrada.');

        // MODIFICAÇÃO: A query SQL foi atualizada para usar a nova coluna 'grade_curricular_id'.
        const sql = `
            INSERT INTO vincular_aluno_curso 
            (aluno_id, curso_posgraduacao_id, turmas_ingresso_id, grade_curricular_id, status_matricula) 
            VALUES (?, ?, ?, ?, 'Ativa')
            ON DUPLICATE KEY UPDATE
                turmas_ingresso_id = VALUES(turmas_ingresso_id),
                grade_curricular_id = VALUES(grade_curricular_id),
                status_matricula = 'Ativa'
        `;
        
        // MODIFICAÇÃO: O parâmetro 'grade' foi substituído por 'gradeId'.
        const params = [alunoId, cursoId, turmaId, gradeId];
        const [result] = await connection.execute<ResultSetHeader>(sql, params);

        await connection.commit();

        res.status(201).json({ 
            message: 'Aluno vinculado ao curso com sucesso!',
            vinculoId: result.insertId 
        });

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

export const updateStatusVinculo = async (req: Request, res: Response) => {
    const { vinculoId } = req.params;
    const { status } = req.body;

    const statusPermitidos = ['Ativa', 'Concluída', 'Cancelada', 'Trancada'];
    if (!status || !statusPermitidos.includes(status)) {
        return res.status(400).json({ 
            message: `Status inválido. Os valores permitidos são: ${statusPermitidos.join(', ')}.` 
        });
    }

    if (!vinculoId) {
        return res.status(400).json({ message: "O ID do vínculo é obrigatório." });
    }

    try {
        const query = "UPDATE vincular_aluno_curso SET status_matricula = ? WHERE id = ?";
        
        const [result] = await pool.execute<ResultSetHeader>(query, [status, vinculoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Vínculo de matrícula não encontrado." });
        }

        res.status(200).json({ message: "Status do vínculo atualizado com sucesso." });

    } catch (error: any) {
        console.error("Erro ao atualizar status do vínculo:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar o status." });
    }
};
