// src/controllers/gradeCurricularController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// --- TIPAGEM ---
interface GradeFromDB extends RowDataPacket {
    id: number;
    curso_id: number;
    curso_nome: string;
    curso_tipo: string;
    periodo_academico: string;
}

interface DisciplinaFromDB extends RowDataPacket {
    id: number;
    nome: string;
    codigo: string;
    carga_horaria: number;
    periodo_numero: number;
}

// --- FUNÇÕES DO CONTROLLER ---

/**
 * @description Cria uma nova grade curricular e suas associações.
 * @route POST /api/grades
 */
export const createGrade = async (req: Request, res: Response) => {
    const { curso, periodoAcademico, periodos } = req.body;

    if (!curso || !curso.id || !periodoAcademico || !Array.isArray(periodos)) {
        return res.status(400).json({ message: 'Dados inválidos para criar a grade.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Inserir a grade principal
        const [gradeResult] = await connection.query<ResultSetHeader>(
            'INSERT INTO grades_curriculares (curso_id, periodo_academico) VALUES (?, ?)',
            [curso.id, periodoAcademico]
        );
        const gradeId = gradeResult.insertId;

        // 2. Inserir as disciplinas por período
        const disciplinasParaInserir = [];
        for (const periodo of periodos) {
            if (periodo.materias && periodo.materias.length > 0) {
                for (const materia of periodo.materias) {
                    disciplinasParaInserir.push([gradeId, periodo.id, materia.id]);
                }
            }
        }

        if (disciplinasParaInserir.length > 0) {
            await connection.query(
                'INSERT INTO grade_periodo_disciplinas (grade_id, periodo_numero, disciplina_id) VALUES ?',
                [disciplinasParaInserir]
            );
        }

        await connection.commit();
        res.status(201).json({ id: gradeId, message: 'Grade curricular criada com sucesso!' });

    } catch (error) {
        await connection.rollback();
        console.error("Erro ao criar grade curricular:", error);
        res.status(500).json({ message: 'Erro interno ao criar a grade.' });
    } finally {
        connection.release();
    }
};

/**
 * @description Lista todas as grades curriculares com filtros opcionais.
 * @route GET /api/grades
 */
export const getGrades = async (req: Request, res: Response) => {
    const { curso, periodo } = req.query;

    let query = `
        SELECT 
            g.id,
            g.periodo_academico AS periodoAcademico,
            c.id AS curso_id,
            c.nome AS curso_nome,
            c.tipo AS curso_tipo
        FROM grades_curriculares g
        JOIN cursos_posgraduacao c ON g.curso_id = c.id
    `;
    const params: (string | number)[] = [];

    if (curso && curso !== 'all') {
        query += ' WHERE g.curso_id = ?';
        params.push(curso as string);
    }
    if (periodo && periodo !== 'all') {
        query += params.length > 0 ? ' AND' : ' WHERE';
        query += ' g.periodo_academico = ?';
        params.push(periodo as string);
    }
    query += ' ORDER BY g.id DESC';

    try {
        const [grades] = await pool.query<GradeFromDB[]>(query, params);

        // Para cada grade, buscar suas disciplinas
        const gradesCompletas = await Promise.all(grades.map(async (grade) => {
            const [disciplinas] = await pool.query<DisciplinaFromDB[]>(`
                SELECT 
                    d.id, d.nome, d.codigo, d.carga_horaria AS cargaHoraria,
                    gpd.periodo_numero
                FROM grade_periodo_disciplinas gpd
                JOIN cursos_disciplinas d ON gpd.disciplina_id = d.id
                WHERE gpd.grade_id = ?
                ORDER BY gpd.periodo_numero, d.nome
            `, [grade.id]);

            const periodos = disciplinas.reduce((acc, disc) => {
                let periodo = acc.find(p => p.id === disc.periodo_numero);
                if (!periodo) {
                    periodo = { id: disc.periodo_numero, nome: `${disc.periodo_numero}º Período`, materias: [] };
                    acc.push(periodo);
                }
                periodo.materias.push({ id: disc.id, nome: disc.nome, codigo: disc.codigo, cargaHoraria: disc.cargaHoraria });
                return acc;
            }, [] as { id: number; nome: string; materias: any[] }[]);

            return {
                id: grade.id,
                curso: { id: grade.curso_id, nome: grade.curso_nome, tipo: grade.curso_tipo },
                periodoAcademico: grade.periodoAcademico,
                periodos: periodos.sort((a, b) => a.id - b.id)
            };
        }));

        res.status(200).json(gradesCompletas);
    } catch (error) {
        console.error("Erro ao listar grades:", error);
        res.status(500).json({ message: 'Erro interno ao buscar as grades.' });
    }
};

/**
 * @description Atualiza uma grade curricular.
 * @route PUT /api/grades/:id
 */
export const updateGrade = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { curso, periodoAcademico, periodos } = req.body;

    if (!curso || !curso.id || !periodoAcademico || !Array.isArray(periodos)) {
        return res.status(400).json({ message: 'Dados inválidos para atualizar a grade.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Atualizar a grade principal
        await connection.query(
            'UPDATE grades_curriculares SET curso_id = ?, periodo_academico = ? WHERE id = ?',
            [curso.id, periodoAcademico, id]
        );

        // 2. Deletar as disciplinas antigas
        await connection.query('DELETE FROM grade_periodo_disciplinas WHERE grade_id = ?', [id]);

        // 3. Inserir as novas disciplinas
        const disciplinasParaInserir = [];
        for (const periodo of periodos) {
            if (periodo.materias && periodo.materias.length > 0) {
                for (const materia of periodo.materias) {
                    disciplinasParaInserir.push([id, periodo.id, materia.id]);
                }
            }
        }

        if (disciplinasParaInserir.length > 0) {
            await connection.query(
                'INSERT INTO grade_periodo_disciplinas (grade_id, periodo_numero, disciplina_id) VALUES ?',
                [disciplinasParaInserir]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Grade curricular atualizada com sucesso!' });

    } catch (error) {
        await connection.rollback();
        console.error("Erro ao atualizar grade curricular:", error);
        res.status(500).json({ message: 'Erro interno ao atualizar a grade.' });
    } finally {
        connection.release();
    }
};

/**
 * @description Deleta uma grade curricular.
 * @route DELETE /api/grades/:id
 */
export const deleteGrade = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Graças ao ON DELETE CASCADE, as disciplinas em `grade_periodo_disciplinas` serão removidas automaticamente.
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM grades_curriculares WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Grade não encontrada.' });
        }
        res.status(200).json({ message: 'Grade excluída com sucesso.' });
    } catch (error) {
        console.error("Erro ao excluir grade:", error);
        res.status(500).json({ message: 'Erro interno ao excluir a grade.' });
    }
};

/**
 * @description Obtém a lista de matérias para os formulários.
 * @route GET /api/grades/form-data/materias
 */
export const getMateriasForGradeForm = async (req: Request, res: Response) => {
    try {
        const [materias] = await pool.query<RowDataPacket[]>(
            'SELECT id, nome, codigo, carga_horaria AS cargaHoraria FROM cursos_disciplinas ORDER BY nome'
        );
        res.status(200).json(materias);
    } catch (error) {
        console.error("Erro ao buscar matérias para o formulário:", error);
        res.status(500).json({ message: 'Erro interno ao buscar matérias.' });
    }
};
/**
 * @description Obtém todos os períodos letivos para formulários.
 * @route GET /api/grades/form-data/periodos-letivos
 */
export const getPeriodosLetivosForForm = async (req: Request, res: Response) => {
    try {
        const [periodos] = await pool.query<RowDataPacket[]>(
            'SELECT id, nome FROM configuracoes_periodos_letivos ORDER BY data_inicio DESC'
        );
        res.status(200).json(periodos);
    } catch (error) {
        console.error("Erro ao buscar períodos letivos para o formulário:", error);
        res.status(500).json({ message: 'Erro interno ao buscar períodos letivos.' });
    }
};

// NOVA FUNÇÃO: Buscar disciplinas de um curso, agrupadas por semestre
/**
 * @description Obtém as disciplinas de um curso, agrupadas por semestre.
 * @route GET /api/grades/form-data/disciplinas-por-curso/:cursoId
 */
export const getDisciplinasByCursoGrouped = async (req: Request, res: Response) => {
    const { cursoId } = req.params;
    if (!cursoId) {
        return res.status(400).json({ message: 'O ID do curso é obrigatório.' });
    }

    try {
        const [disciplinas] = await pool.query<RowDataPacket[]>(`
            SELECT id, nome, codigo, carga_horaria AS cargaHoraria, semestre 
            FROM cursos_disciplinas 
            WHERE curso_id = ? 
            ORDER BY semestre, nome
        `, [cursoId]);

        // Agrupa as disciplinas por semestre no backend
        const periodosAgrupados = disciplinas.reduce((acc, disciplina) => {
            const semestre = disciplina.semestre;
            // Garante que o semestre exista no acumulador
            if (!acc[semestre]) {
                acc[semestre] = {
                    id: semestre,
                    nome: `${semestre}º Período`,
                    materias: []
                };
            }
            // Adiciona a disciplina ao semestre correspondente
            acc[semestre].materias.push({
                id: disciplina.id,
                nome: disciplina.nome,
                codigo: disciplina.codigo,
                cargaHoraria: disciplina.cargaHoraria
            });
            return acc;
        }, {} as Record<number, { id: number; nome: string; materias: any[] }>);

        // Converte o objeto em um array e ordena pela chave (número do semestre)
        const resultadoFinal = Object.values(periodosAgrupados).sort((a, b) => a.id - b.id);

        res.status(200).json(resultadoFinal);
    } catch (error) {
        console.error("Erro ao buscar disciplinas agrupadas por curso:", error);
        res.status(500).json({ message: 'Erro interno ao buscar disciplinas.' });
    }
};