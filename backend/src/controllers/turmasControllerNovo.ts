// src/controllers/turmasControllerNovo.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// --- INTERFACES PARA TIPAGEM ---

// Interface para o que vem diretamente do banco de dados na query principal
interface TurmaFromDB extends RowDataPacket {
    id: number;
    nome_turma: string;
    ano_letivo: number;
    curso_id: number;
    curso_nome: string;
    materias_ids: string; // JSON string '[1, 2, 3]'
    semestre_id: number;
    semestre_nome: string;
    professor_responsavel: number;
    professor_nome: string;
    modalidade: 'Presencial' | 'Híbrido' | 'EAD';
    quantidade_alunos: number | null;
    status: 'Ativa' | 'Em Planejamento' | 'Encerrada';
    descricao: string | null;
}

// Interface para o formato final que a API enviará ao frontend
interface TurmaAPI {
    id: string;
    nomeTurma: string;
    anoInicio: number;
    cursoId: string;
    cursoNome?: string;
    materiasIds: string[];
    materiasNomes?: string[]; // Campo adicionado para os nomes das matérias
    semestre: string;
    semestreNome?: string;
    responsavelId: string;
    responsavelNome?: string;
    modalidade: 'Presencial' | 'Híbrido' | 'EAD';
    quantidadeAlunos?: number;
    status: 'Ativa' | 'Em Planejamento' | 'Encerrada';
    descricao?: string;
}

// --- FUNÇÕES DO CONTROLLER ---

/**
 * [GET] /api/turmas-novo - Listar todas as turmas com detalhes.
 * MODIFICADO: Agora também busca e inclui os nomes das matérias vinculadas.
 */
export const getTurmas = async (req: Request, res: Response) => {
    try {
        // 1. Busca os dados principais das turmas
        const [turmasRows] = await pool.query<TurmaFromDB[]>(`
            SELECT 
                t.id,
                t.nome_turma,
                t.ano_letivo,
                t.curso_id,
                cp.nome AS curso_nome,
                t.materias_ids,
                t.semestre_id,
                cpl.nome AS semestre_nome,
                t.professor_responsavel,
                f.nome AS professor_nome,
                t.modalidade,
                t.quantidade_alunos,
                t.status,
                t.descricao
            FROM turmas t
            LEFT JOIN cursos_posgraduacao cp ON t.curso_id = cp.id
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            LEFT JOIN funcionarios f ON t.professor_responsavel = f.id
            WHERE t.curso_id IS NOT NULL; -- Filtra apenas as novas turmas de pós-graduação
        `);

        // 2. Para cada turma, busca os nomes das matérias correspondentes
        const turmasFormatadas = await Promise.all(turmasRows.map(async (turma) => {
            const materiasIds = turma.materias_ids ? JSON.parse(turma.materias_ids) : [];
            let materiasNomes: string[] = [];

            if (materiasIds.length > 0) {
                // Prepara a query SQL para buscar múltiplos IDs de forma segura
                const placeholders = materiasIds.map(() => '?').join(',');
                const [disciplinasRows] = await pool.query<RowDataPacket[]>(
                    `SELECT nome FROM cursos_disciplinas WHERE id IN (${placeholders})`,
                    materiasIds
                );
                materiasNomes = disciplinasRows.map(d => d.nome);
            }

            // 3. Monta o objeto final para a API
            return {
                id: String(turma.id),
                nomeTurma: turma.nome_turma,
                anoInicio: turma.ano_letivo,
                cursoId: String(turma.curso_id),
                cursoNome: turma.curso_nome,
                materiasIds: materiasIds,
                materiasNomes: materiasNomes, // Novo campo com os nomes
                semestre: String(turma.semestre_id),
                semestreNome: turma.semestre_nome,
                responsavelId: String(turma.professor_responsavel),
                responsavelNome: turma.professor_nome,
                modalidade: turma.modalidade,
                quantidadeAlunos: turma.quantidade_alunos ?? undefined,
                status: turma.status,
                descricao: turma.descricao ?? undefined,
            };
        }));

        res.json(turmasFormatadas);
    } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

/**
 * [POST] /api/turmas-novo - Criar uma nova turma.
 */
export const createTurma = async (req: Request, res: Response) => {
    const {
        nomeTurma,
        cursoId,
        materiasIds,
        anoInicio,
        semestre,
        responsavelId,
        modalidade,
        quantidadeAlunos,
        status,
        descricao,
    }: TurmaAPI = req.body;

    try {
        const [result] = await pool.execute(
            `INSERT INTO turmas (
                nome_turma, ano_letivo, curso_id, materias_ids, semestre_id, 
                professor_responsavel, modalidade, quantidade_alunos, status, descricao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nomeTurma,
                anoInicio,
                cursoId,
                JSON.stringify(materiasIds),
                semestre,
                responsavelId,
                modalidade,
                quantidadeAlunos ?? null,
                status,
                descricao ?? null,
            ]
        );
        const insertId = (result as any).insertId;
        res.status(201).json({ id: String(insertId), ...req.body });
    } catch (error) {
        console.error('Erro ao criar turma:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

/**
 * [PUT] /api/turmas-novo/:id - Atualizar uma turma.
 */
export const updateTurma = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        nomeTurma,
        cursoId,
        materiasIds,
        anoInicio,
        semestre,
        responsavelId,
        modalidade,
        quantidadeAlunos,
        status,
        descricao,
    }: TurmaAPI = req.body;

    try {
        await pool.execute(
            `UPDATE turmas SET
                nome_turma = ?, ano_letivo = ?, curso_id = ?, materias_ids = ?, semestre_id = ?,
                professor_responsavel = ?, modalidade = ?, quantidade_alunos = ?, status = ?, descricao = ?
            WHERE id = ?`,
            [
                nomeTurma,
                anoInicio,
                cursoId,
                JSON.stringify(materiasIds),
                semestre,
                responsavelId,
                modalidade,
                quantidadeAlunos ?? null,
                status,
                descricao ?? null,
                id,
            ]
        );
        res.status(200).json({ id, ...req.body });
    } catch (error) {
        console.error('Erro ao atualizar turma:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

/**
 * [DELETE] /api/turmas-novo/:id - Excluir uma turma.
 */
export const deleteTurma = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM turmas WHERE id = ?', [id]);
        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Erro ao excluir turma:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};


// --- ROTAS PARA DADOS DO FORMULÁRIO ---

/**
 * [GET] /api/form-data/cursos - Retorna os cursos de pós-graduação para o select.
 */
export const getCursosParaForm = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, nome FROM cursos_posgraduacao WHERE status = "ativo" ORDER BY nome ASC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cursos.' });
    }
};

/**
 * [GET] /api/form-data/materias/:cursoId - Retorna as matérias de um curso específico.
 */
export const getMateriasPorCursoParaForm = async (req: Request, res: Response) => {
    const { cursoId } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, nome, carga_horaria FROM cursos_disciplinas WHERE curso_id = ? ORDER BY nome ASC',
            [cursoId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar matérias.' });
    }
};

/**
 * [GET] /api/form-data/semestres - Retorna os períodos letivos (semestres).
 */
export const getSemestresParaForm = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, nome FROM configuracoes_periodos_letivos ORDER BY data_inicio DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar semestres.' });
    }
};

/**
 * [GET] /api/form-data/professores - Retorna os professores.
 */
export const getProfessoresParaForm = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, nome FROM funcionarios WHERE cargo LIKE "%Professor%" AND status = "ativo" ORDER BY nome ASC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar professores.' });
    }
};

/**
 * [GET] /api/turmas-novo/:id - Busca uma turma de pós-graduação pelo ID com todos os detalhes.
 * Inspirado na função getTurmaById do controller antigo.
 */
export const getTurmaByIdNovo = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // <<--- CORREÇÃO APLICADA AQUI --- >>
        // Removida a condição "AND t.curso_id IS NOT NULL". O LEFT JOIN já lida com isso.
        // Se a turma existir, ela será encontrada, e os campos do curso virão como NULL se não houver vínculo.
        const [turmaRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.id,
                t.nome_turma,
                t.ano_letivo,
                t.modalidade,
                t.status,
                t.descricao,
                t.quantidade_alunos,
                cp.nome AS curso_nome,
                cpl.nome AS semestre_nome,
                f.nome AS professor_nome
            FROM turmas t
            LEFT JOIN cursos_posgraduacao cp ON t.curso_id = cp.id
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            LEFT JOIN funcionarios f ON t.professor_responsavel = f.id
            WHERE t.id = ?
        `, [id]);

        if (turmaRows.length === 0) {
            // Este erro agora só acontecerá se o ID da turma realmente não existir na tabela.
            return res.status(404).json({ message: 'Turma não encontrada' });
        }
        const turma = turmaRows[0];

        // 2. Busca os alunos vinculados a esta turma (se houver)
        const [alunosRows] = await pool.query<RowDataPacket[]>(`
            SELECT u.id, u.nome, u.foto_url, u.role, a.matricula
            FROM alunos_turmas at
            JOIN users u ON at.aluno_id = u.id
            JOIN alunos a ON u.id = a.id
            WHERE at.turma_id = ?
            ORDER BY u.nome ASC
        `, [id]);
        
        const alunos = alunosRows.map((row: any) => ({
            id: row.id,
            nome: row.nome,
            foto_url: row.foto_url,
            role: row.role,
            matricula: row.matricula,
        }));

        // 3. Monta o objeto de resposta final
        const responseData = {
            id: turma.id,
            nome: turma.nome_turma,
            ano_letivo: turma.ano_letivo,
            qtd_alunos: alunos.length,
            professor_responsavel: turma.professor_nome,
            alunos: alunos,
            // Mapeando campos para compatibilidade com o frontend VisualizarTurmasPage
            serie: turma.curso_nome || 'Não vinculado', // Usa o nome do curso ou um fallback
            turno: turma.modalidade || 'Não definido',   // Usa a modalidade ou um fallback
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Erro ao buscar detalhes da turma:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
