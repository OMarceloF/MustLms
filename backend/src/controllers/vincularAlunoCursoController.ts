// backend/src/controllers/vincularAlunoCursoController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * @route   POST /api/matriculas/vincular-aluno-curso
 * @desc    Vincula um aluno a um curso de pós-graduação, incluindo a grade curricular.
 *          Utiliza INSERT ... ON DUPLICATE KEY UPDATE para criar um novo vínculo
 *          ou atualizar um existente, garantindo que o status seja 'Ativa'.
 */
export const vincularAlunoCursoPosGraduacao = async (req: Request, res: Response) => {
    const { alunoId, cursoId, turmaId, gradeId } = req.body;

    if (!alunoId || !cursoId || !turmaId || !gradeId) {
        return res.status(400).json({ message: 'Dados insuficientes para realizar o vínculo. Todos os campos (aluno, curso, turma e grade) são obrigatórios.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validações para garantir que as entidades referenciadas (aluno, curso, etc.) existem no banco de dados.
        const [alunoRows] = await connection.query<RowDataPacket[]>('SELECT id FROM users WHERE id = ?', [alunoId]);
        if (alunoRows.length === 0) {
            throw new Error('Aluno não encontrado no sistema.');
        }

        const [cursoRows] = await connection.query<RowDataPacket[]>('SELECT id FROM cursos_posgraduacao WHERE id = ?', [cursoId]);
        if (cursoRows.length === 0) {
            throw new Error('Curso de pós-graduação não encontrado.');
        }

        const [turmaIngressoRows] = await connection.query<RowDataPacket[]>('SELECT id FROM turmas_ingresso WHERE id = ?', [turmaId]);
        if (turmaIngressoRows.length === 0) {
            throw new Error('A turma de ingresso selecionada não foi encontrada.');
        }
        
        const [gradeRows] = await connection.query<RowDataPacket[]>('SELECT id FROM grades_curriculares WHERE id = ?', [gradeId]);
        if (gradeRows.length === 0) {
            throw new Error('A grade curricular selecionada não foi encontrada.');
        }

        // ====================================================================
        // LÓGICA CENTRAL PARA INSERIR OU ATUALIZAR O VÍNCULO
        // ====================================================================
        // A chave única (UNIQUE KEY) na tabela `vincular_aluno_curso` deve ser no campo `aluno_id`
        // para que o ON DUPLICATE KEY UPDATE funcione corretamente para um aluno específico.
        const sql = `
            INSERT INTO vincular_aluno_curso 
                (aluno_id, curso_posgraduacao_id, turmas_ingresso_id, grade_curricular_id, status_matricula, data_vinculo) 
            VALUES 
                (?, ?, ?, ?, 'Ativa', NOW())
            ON DUPLICATE KEY UPDATE
                curso_posgraduacao_id = VALUES(curso_posgraduacao_id),
                turmas_ingresso_id = VALUES(turmas_ingresso_id),
                grade_curricular_id = VALUES(grade_curricular_id),
                status_matricula = 'Ativa', -- Garante que o status seja 'Ativa' mesmo em caso de reativação/atualização
                data_vinculo = NOW()
        `;
        
        const params = [alunoId, cursoId, turmaId, gradeId];
        const [result] = await connection.execute<ResultSetHeader>(sql, params);

        await connection.commit();

        res.status(201).json({ 
            message: 'Aluno vinculado ao curso com sucesso!',
            // O insertId é retornado na criação. Em caso de UPDATE, ele pode ser 0 ou o ID existente, dependendo da configuração do MySQL.
            vinculoId: result.insertId 
        });

    } catch (error: any) {
        await connection.rollback();
        console.error('Erro ao vincular aluno ao curso:', error);
        
        // Retorna a mensagem de erro das validações personalizadas ou um erro genérico do servidor.
        res.status(500).json({ message: error.message || 'Erro interno do servidor ao processar a matrícula.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @route   PATCH /api/vincular-aluno-curso/:vinculoId/status
 * @desc    Atualiza o status de um vínculo de matrícula existente (Ex: Ativa, Concluída, Trancada).
 * @note    Esta função é uma alternativa à do trancamentoController, operando pelo ID do vínculo.
 *          A do trancamentoController (operando por alunoId) é mais adequada para o fluxo atual.
 */
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
