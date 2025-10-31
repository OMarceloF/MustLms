import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * @description Adiciona um novo curso de pós-graduação.
 * @route POST /api/cursos/adicionar
 */
export const adicionarCurso = async (req: Request, res: Response) => {
    const {
        nome, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
        coordenador_id, vice_coordenador_id, unidade_id, objetivos, perfil_egresso,
        justificativa, ano_inicio, status, link_divulgacao
    } = req.body;

    try {
        const query = `
            INSERT INTO cursos_posgraduacao (
                nome, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
                coordenador_id, vice_coordenador_id, unidade_id, objetivos, perfil_egresso,
                justificativa, ano_inicio, status, link_divulgacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
            nome, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
            coordenador_id, vice_coordenador_id || null, unidade_id, objetivos, perfil_egresso,
            justificativa, ano_inicio, status, link_divulgacao
        ];

        const [result] = await pool.query<ResultSetHeader>(query, values);
        res.status(201).json({ id: result.insertId, message: 'Curso adicionado com sucesso!' });
    } catch (error) {
        console.error("Erro ao adicionar curso:", error);
        res.status(500).json({ message: 'Erro interno ao adicionar o curso.' });
    }
};

/**
 * @description Lista todos os cursos de pós-graduação com informações adicionais.
 * @route GET /api/cursos-posgraduacao
 */
export const listarCursosPosGraduacao = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                c.id, c.nome, c.tipo, c.status, c.modalidade, c.ano_inicio,
                c.duracao_semestres,
                coord.nome AS coordenador_nome,
                (SELECT COUNT(*) FROM cursos_disciplinas WHERE curso_id = c.id) as disciplinas_count,
                (SELECT COUNT(*) FROM turmas WHERE curso_id = c.id) as turmas_count
            FROM cursos_posgraduacao c
            LEFT JOIN users coord ON c.coordenador_id = coord.id
            ORDER BY c.nome;
        `;
        const [rows] = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar cursos:", error);
        res.status(500).json({ message: 'Erro interno ao buscar os cursos.' });
    }
};

/**
 * @description Exclui um curso de pós-graduação.
 * @route DELETE /api/cursos/:id
 */
export const excluirCurso = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM cursos_posgraduacao WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }
        res.status(200).json({ message: 'Curso excluído com sucesso.' });
    } catch (error) {
        console.error("Erro ao excluir curso:", error);
        res.status(500).json({ message: 'Erro interno ao excluir o curso.' });
    }
};

/**
 * @description Atualiza um curso de pós-graduação existente.
 * @route PUT /api/cursos/:id
 */
export const atualizarCurso = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        nome, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
        coordenador_id, vice_coordenador_id, unidade_id, objetivos, perfil_egresso,
        justificativa, ano_inicio, status, link_divulgacao
    } = req.body;

    try {
        const query = `
            UPDATE cursos_posgraduacao SET
                nome = ?, tipo = ?, area_conhecimento = ?, carga_horaria = ?, duracao_semestres = ?, 
                modalidade = ?, coordenador_id = ?, vice_coordenador_id = ?, unidade_id = ?, 
                objetivos = ?, perfil_egresso = ?, justificativa = ?, ano_inicio = ?, 
                status = ?, link_divulgacao = ?
            WHERE id = ?;
        `;
        const values = [
            nome, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
            coordenador_id, vice_coordenador_id || null, unidade_id, objetivos, perfil_egresso,
            justificativa, ano_inicio, status, link_divulgacao, id
        ];

        const [result] = await pool.query<ResultSetHeader>(query, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }
        res.status(200).json({ message: 'Curso atualizado com sucesso!' });
    } catch (error) {
        console.error("Erro ao atualizar curso:", error);
        res.status(500).json({ message: 'Erro interno ao atualizar o curso.' });
    }
};

/**
 * @description Obtém os detalhes de um curso específico para edição ou visualização.
 * @route GET /api/cursos/:id
 */
export const obterDetalhesCurso = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM cursos_posgraduacao WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Curso não encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Erro ao obter detalhes do curso:", error);
        res.status(500).json({ message: 'Erro interno ao buscar o curso.' });
    }
};

/**
 * @description Lista os eventos do calendário de um curso.
 * @route GET /api/cursos/:cursoId/calendario
 */
export const listarEventosCalendario = async (req: Request, res: Response) => {
    // Implementação futura
    res.status(200).json([]);
};

/**
 * @description Adiciona um evento ao calendário de um curso.
 * @route POST /api/cursos/:cursoId/calendario
 */
export const adicionarEventoCalendario = async (req: Request, res: Response) => {
    // Implementação futura
    res.status(201).json({ message: 'Evento adicionado (simulado).' });
};

/**
 * @description Obtém o PPC de um curso.
 * @route GET /api/cursos/:cursoId/ppc
 */
export const obterPPC = async (req: Request, res: Response) => {
    const { cursoId } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT conteudo FROM cursos_ppc WHERE curso_id = ?', [cursoId]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.json({ conteudo: '' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar PPC.' });
    }
};

/**
 * @description Salva ou atualiza o PPC de um curso.
 * @route POST /api/cursos/:cursoId/ppc
 */
export const salvarPPC = async (req: Request, res: Response) => {
    const { cursoId } = req.params;
    const { conteudo } = req.body;
    try {
        await pool.query(
            'INSERT INTO cursos_ppc (curso_id, conteudo) VALUES (?, ?) ON DUPLICATE KEY UPDATE conteudo = ?',
            [cursoId, conteudo, conteudo]
        );
        res.status(200).json({ message: 'PPC salvo com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar PPC.' });
    }
};

/**
 * @description Obtém os professores, turmas e alunos vinculados a um curso específico.
 * @route GET /api/cursos/:cursoId/vinculados
 */
export const obterVinculadosCurso = async (req: Request, res: Response) => {
    const { cursoId } = req.params;

    if (!cursoId) {
        return res.status(400).json({ message: "ID do curso não fornecido." });
    }

    try {
        // Query para buscar professores
        const [professores] = await pool.query<RowDataPacket[]>(`
            SELECT DISTINCT
                f.id, f.nome, f.departamento,
                (SELECT COUNT(*) FROM alunos_turmas at2 WHERE at2.turma_id IN (SELECT id FROM turmas WHERE professor_responsavel = f.id)) AS orientandos
            FROM funcionarios f
            JOIN turmas t ON f.id = t.professor_responsavel
            WHERE t.curso_id = ? AND f.cargo LIKE '%Professor%'
            ORDER BY f.nome;
        `, [cursoId]);

        // Query para buscar turmas
        const [turmasBase] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.id, t.nome_turma AS codigo, cpl.nome AS periodo,
                t.quantidade_alunos AS alunos, t.materias_ids
            FROM turmas t
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            WHERE t.curso_id = ?
            ORDER BY cpl.data_inicio DESC, t.nome_turma;
        `, [cursoId]);

        // Processamento para buscar nomes das disciplinas das turmas
        const turmas = await Promise.all(turmasBase.map(async (turma) => {
            let disciplinaNomes = 'N/A';
            if (turma.materias_ids && turma.materias_ids.length > 2) {
                try {
                    const ids = JSON.parse(turma.materias_ids);
                    if (ids.length > 0) {
                        const placeholders = ids.map(() => '?').join(',');
                        const [disciplinas] = await pool.query<RowDataPacket[]>(
                            `SELECT nome FROM cursos_disciplinas WHERE id IN (${placeholders})`,
                            ids
                        );
                        disciplinaNomes = disciplinas.map(d => d.nome).join(', ');
                    }
                } catch (e) {
                    console.error("Erro ao fazer parse dos IDs de matérias:", e);
                }
            }
            return {
                id: turma.id,
                codigo: turma.codigo,
                periodo: turma.periodo,
                alunos: turma.alunos || 0,
                disciplina: disciplinaNomes
            };
        }));

        // ================== MODIFICAÇÃO APLICADA AQUI ==================
        // Nova query para buscar os alunos vinculados ao curso através das turmas
        const [alunos] = await pool.query<RowDataPacket[]>(`
            SELECT DISTINCT
                u.id,
                u.nome,
                a.matricula,
                a.status
            FROM users u
            JOIN alunos a ON u.id = a.id
            JOIN alunos_turmas at ON u.id = at.aluno_id
            JOIN turmas t ON at.turma_id = t.id
            WHERE t.curso_id = ? AND u.role = 'aluno'
            ORDER BY u.nome ASC;
        `, [cursoId]);

        res.status(200).json({ professores, turmas, alunos });

    } catch (error) {
        console.error("Erro ao buscar vinculados do curso:", error);
        res.status(500).json({ message: "Erro interno ao buscar professores, turmas e alunos." });
    }
};
