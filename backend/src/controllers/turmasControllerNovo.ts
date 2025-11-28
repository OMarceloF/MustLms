// src/controllers/turmasControllerNovo.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { getDadosAcademicosCompletos } from './avaliacoesNotasController'; // Importando a função correta

// --- INTERFACES ---
interface TurmaFromDB extends RowDataPacket {
    id: number;
    nome_turma: string;
    curso_id: number;
    curso_nome: string;
    disciplina_id: number;
    disciplina_nome: string;
    semestre_id: number;
    semestre_nome: string;
    semestre_data_inicio: string;
    semestre_data_fim: string;
    professor_responsavel: number;
    professor_nome: string;
    modalidade: 'Presencial' | 'Híbrido' | 'EAD';
    quantidade_alunos: number | null;
    descricao: string | null;
}

interface TurmaAPI {
    id: number;
    nomeTurma: string;
    cursoId: string;
    cursoNome?: string;
    disciplinaId: string;
    disciplinaNome?: string;
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

export const getTurmas = async (req: Request, res: Response) => {
    try {
        const [turmasRows] = await pool.query<TurmaFromDB[]>(`
            SELECT 
                t.id, t.nome_turma, t.curso_id,
                cp.nome AS curso_nome,
                t.disciplina_id,
                d.nome AS disciplina_nome,
                t.semestre_id, 
                cpl.nome AS semestre_nome,
                cpl.data_inicio AS semestre_data_inicio,
                cpl.data_fim AS semestre_data_fim,
                t.professor_responsavel, f.nome AS professor_nome, t.modalidade,
                t.quantidade_alunos, t.descricao, t.status AS status_db
            FROM turmas t
            LEFT JOIN cursos_posgraduacao cp ON t.curso_id = cp.id
            LEFT JOIN cursos_disciplinas d ON t.disciplina_id = d.id
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            LEFT JOIN funcionarios f ON t.professor_responsavel = f.id
            WHERE t.curso_id IS NOT NULL
            ORDER BY t.id DESC;
        `);

        const turmasFormatadas = turmasRows.map(turma => {
            // Prioridade: Calcula baseado na data atual vs datas do semestre
            // Se não tiver datas (erro de cadastro), usa o status que está no banco
            let statusExibicao: string = turma.status_db || 'Em Planejamento';

            if (turma.semestre_data_inicio && turma.semestre_data_fim) {
                statusExibicao = determinarStatusPorDatas(turma.semestre_data_inicio, turma.semestre_data_fim);
            }

            return {
                id: turma.id,
                nomeTurma: turma.nome_turma,
                cursoId: String(turma.curso_id),
                cursoNome: turma.curso_nome,
                disciplinaId: String(turma.disciplina_id || ''),
                disciplinaNome: turma.disciplina_nome || "Nenhuma disciplina vinculada",
                semestre: String(turma.semestre_id),
                semestreNome: turma.semestre_nome,
                responsavelId: String(turma.professor_responsavel),
                responsavelNome: turma.professor_nome,
                modalidade: turma.modalidade,
                quantidadeAlunos: turma.quantidade_alunos ?? undefined,
                status: statusExibicao, // Retorna o status calculado em tempo real
                descricao: turma.descricao ?? undefined,
            };
        });

        res.json(turmasFormatadas);
    } catch (error) {
        console.error('Erro ao buscar turmas:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const determinarStatusPorDatas = (inicio: string | Date, fim: string | Date): 'Ativa' | 'Em Planejamento' | 'Encerrada' => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera hora para comparar apenas datas

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (hoje < dataInicio) {
        return 'Em Planejamento';
    } else if (hoje > dataFim) {
        return 'Encerrada';
    } else {
        return 'Ativa';
    }
};

export const createTurma = async (req: Request, res: Response) => {
    // Removemos 'status' do body, pois ele será calculado
    const { nomeTurma, cursoId, disciplinaId, semestre, responsavelId, modalidade, quantidadeAlunos, descricao }: TurmaAPI = req.body;

    try {
        // 1. Buscar as datas do semestre selecionado para calcular o status inicial correto
        const [semestreRows] = await pool.query<RowDataPacket[]>(
            'SELECT data_inicio, data_fim FROM configuracoes_periodos_letivos WHERE id = ?',
            [semestre]
        );

        let statusCalculado = 'Em Planejamento'; // Default

        if (semestreRows.length > 0) {
            const { data_inicio, data_fim } = semestreRows[0];
            statusCalculado = determinarStatusPorDatas(data_inicio, data_fim);
        }

        // 2. Inserir com o status calculado
        const [result] = await pool.execute(
            `INSERT INTO turmas (nome_turma, curso_id, disciplina_id, semestre_id, professor_responsavel, modalidade, quantidade_alunos, descricao, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nomeTurma, 
                cursoId, 
                disciplinaId, 
                semestre, 
                responsavelId, 
                modalidade, 
                quantidadeAlunos ?? null, 
                descricao ?? null, 
                statusCalculado // Usa o status calculado pelo backend, ignora o do front
            ]
        );
        
        const insertId = (result as ResultSetHeader).insertId;
        
        // Retorna o objeto criado com o status real
        res.status(201).json({ id: String(insertId), ...req.body, status: statusCalculado });
    } catch (error) {
        console.error('Erro ao criar turma:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

export const updateTurma = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nomeTurma, cursoId, disciplinaId, semestre, responsavelId, modalidade, quantidadeAlunos, descricao }: TurmaAPI = req.body;

    try {
        // 1. Buscar as datas do semestre (caso o usuário tenha trocado o semestre na edição)
        const [semestreRows] = await pool.query<RowDataPacket[]>(
            'SELECT data_inicio, data_fim FROM configuracoes_periodos_letivos WHERE id = ?',
            [semestre]
        );

        let statusCalculado = 'Em Planejamento'; 

        if (semestreRows.length > 0) {
            const { data_inicio, data_fim } = semestreRows[0];
            statusCalculado = determinarStatusPorDatas(data_inicio, data_fim);
        }

        // 2. Atualizar no banco com o status correto
        await pool.execute(
            `UPDATE turmas SET nome_turma = ?, curso_id = ?, disciplina_id = ?, semestre_id = ?, professor_responsavel = ?, modalidade = ?, quantidade_alunos = ?, descricao = ?, status = ? WHERE id = ?`,
            [
                nomeTurma, 
                cursoId, 
                disciplinaId, 
                semestre, 
                responsavelId, 
                modalidade, 
                quantidadeAlunos ?? null, 
                descricao ?? null, 
                statusCalculado, // Força a atualização do status baseado na data
                id
            ]
        );

        res.status(200).json({ id, ...req.body, status: statusCalculado });
    } catch (error) {
        console.error('Erro ao atualizar turma:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

export const deleteTurma = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM turmas WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao excluir turma:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

// --- FUNÇÕES PARA DADOS DE FORMULÁRIO ---

export const getCursosParaForm = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM cursos_posgraduacao WHERE status = "ativo" ORDER BY nome ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar cursos.' });
    }
};

export const getMateriasPorCursoParaForm = async (req: Request, res: Response) => {
    const { cursoId } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome, carga_horaria FROM cursos_disciplinas WHERE curso_id = ? ORDER BY nome ASC', [cursoId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar matérias.' });
    }
};

export const getSemestresParaForm = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM configuracoes_periodos_letivos ORDER BY data_inicio DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar semestres.' });
    }
};

export const getProfessoresParaForm = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT id, nome FROM funcionarios WHERE cargo LIKE "%Professor%" AND status = "ativo" ORDER BY nome ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar professores.' });
    }
};

// --- FUNÇÕES PARA GERENCIAMENTO DE UMA TURMA ESPECÍFICA ---

export const getTurmaByIdNovo = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [turmaRows] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.id, t.nome_turma, 
                cc.ano_letivo, /* CORREÇÃO: Busca da tabela de calendario (cc), não de turmas (t) */
                t.modalidade, t.status, t.descricao,
                t.disciplina_id,
                t.semestre_id,
                cp.nome AS curso_nome,
                cpl.nome AS semestre_nome,
                f.nome AS professor_nome,
                d.nome AS disciplina_nome
            FROM turmas t
            LEFT JOIN cursos_posgraduacao cp ON t.curso_id = cp.id
            LEFT JOIN cursos_disciplinas d ON t.disciplina_id = d.id
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            LEFT JOIN configuracoes_calendario cc ON cpl.config_calendario_id = cc.id /* CORREÇÃO: Join adicionado para pegar o ano */
            LEFT JOIN funcionarios f ON t.professor_responsavel = f.id
            WHERE t.id = ?
        `, [id]);

        if (turmaRows.length === 0) {
            return res.status(404).json({ message: 'Turma não encontrada' });
        }
        const turma = turmaRows[0];

        const disciplina = turma.disciplina_id 
            ? [{ materiaId: turma.disciplina_id, nome: turma.disciplina_nome }] 
            : [];

        const [alunosRows] = await pool.query<RowDataPacket[]>(`
            SELECT u.id, u.nome, u.foto_url, a.matricula, 'aluno' as role
            FROM alunos_turmas at
            JOIN users u ON at.aluno_id = u.id
            JOIN alunos a ON u.id = a.id
            WHERE at.turma_id = ? ORDER BY u.nome ASC
        `, [id]);
        
        const responseData = {
            id: turma.id,
            nome: turma.nome_turma,
            ano_letivo: turma.ano_letivo ? String(turma.ano_letivo) : '', // Converte para string pois o front espera string
            professor_responsavel: turma.professor_nome,
            alunos: alunosRows,
            materias: disciplina,
            curso_nome: turma.curso_nome,
            modalidade: turma.modalidade,
            materiaId: turma.disciplina_id,
            semestreId: turma.semestre_id,
            semestre_nome: turma.semestre_nome,
            qtd_alunos: alunosRows.length // Atualiza qtd real baseada nos alunos retornados
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Erro ao buscar detalhes da turma:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

export const getAlunosDisponiveisParaTurma = async (req: Request, res: Response) => {
    const { turmaId } = req.params;
    if (!turmaId) return res.status(400).json({ message: 'O ID da turma é obrigatório.' });

    try {
        const [alunos] = await pool.query<RowDataPacket[]>(`
            SELECT DISTINCT u.id, u.nome, u.foto_url 
            FROM users u
            INNER JOIN vincular_aluno_curso vac ON u.id = vac.aluno_id
            INNER JOIN turmas t ON t.curso_id = vac.curso_posgraduacao_id
            WHERE t.id = ? 
              AND u.role = 'aluno' 
              AND u.status = 'ativo'
              AND vac.status_matricula = 'Ativa' -- Opcional: Garante que só traga alunos com matrícula ativa no curso
              AND u.id NOT IN (
                  SELECT aluno_id 
                  FROM alunos_turmas 
                  WHERE turma_id = ?
              )
            ORDER BY u.nome ASC;
        `, [turmaId, turmaId]);

        res.json(alunos);
    } catch (error) {
        console.error('Erro ao buscar alunos disponíveis:', error);
        res.status(500).json({ message: 'Erro interno ao buscar alunos disponíveis.' });
    }
};

export const adicionarAlunosTurma = async (req: Request, res: Response) => {
    const { turmaId } = req.params;
    const { alunos } = req.body;
    if (!turmaId || !Array.isArray(alunos) || alunos.length === 0) {
        return res.status(400).json({ message: 'ID da turma e uma lista de alunos são obrigatórios.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const values = alunos.map(alunoId => [turmaId, alunoId]);
        await connection.query('INSERT IGNORE INTO alunos_turmas (turma_id, aluno_id) VALUES ?', [values]);
        await connection.commit();
        res.status(200).json({ message: 'Alunos vinculados com sucesso!' });
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao adicionar alunos à turma:', error);
        res.status(500).json({ message: 'Erro interno ao vincular alunos.' });
    } finally {
        connection.release();
    }
};

export const removerAlunoDaTurma = async (req: Request, res: Response) => {
    const { turmaId, alunoId } = req.params;
    if (!turmaId || !alunoId) {
        return res.status(400).json({ message: 'Os IDs da turma e do aluno são obrigatórios.' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM alunos_turmas WHERE turma_id = ? AND aluno_id = ?', [turmaId, alunoId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vínculo entre aluno e turma não encontrado.' });
        }
        res.status(200).json({ message: 'Aluno removido da turma com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover aluno da turma:', error);
        res.status(500).json({ message: 'Erro interno ao remover o aluno.' });
    }
};

/**
 * @description Atualiza o status de um aluno em uma turma específica.
 * @route PATCH /api/alunos-turmas/:vinculoId/status
 */
export const updateAlunoTurmaStatus = async (req: Request, res: Response) => {
    const { vinculoId } = req.params;
    const { status } = req.body;

    // Validação para garantir que o status enviado é um dos permitidos
    const allowedStatus = ['Ativo', 'Inativo', 'Trancado', 'Concluído'];
    if (!status || !allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Status inválido ou não fornecido.' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            "UPDATE alunos_turmas SET status_vinculo = ? WHERE id = ?",
            [status, vinculoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vínculo do aluno na turma não encontrado.' });
        }

        res.status(200).json({ message: 'Status do aluno atualizado com sucesso.' });

    } catch (error) {
        console.error('Erro ao atualizar status do vínculo do aluno:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar o status.' });
    }
};

/**
 * @description Lista apenas as turmas com status 'Ativa' para uso em filtros.
 * @route GET /api/turmas-ativas-para-filtro
 */
export const getTurmasAtivasParaFiltro = async (req: Request, res: Response) => {
    try {
        const [turmas] = await pool.query<RowDataPacket[]>(
            "SELECT id, nome_turma AS nome FROM turmas WHERE status = 'Ativa' ORDER BY nome_turma ASC"
        );
        res.status(200).json(turmas);
    } catch (error) {
        console.error("Erro ao buscar turmas ativas para filtro:", error);
        res.status(500).json({ message: "Erro interno ao buscar as turmas." });
    }
};

/**
 * @description Busca turmas ativas vinculadas a uma disciplina específica para o dropdown de aulas gravadas.
 * @route GET /api/disciplinas/:disciplinaId/turmas-ativas-para-aulas
 */
export const getTurmasAtivasPorDisciplina = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;

    if (!disciplinaId) {
        return res.status(400).json({ message: "ID da disciplina é obrigatório." });
    }

    try {
        // CORREÇÃO: A busca agora verifica se a data atual está dentro do período letivo (Status calculado: Ativa)
        // Isso alinha o dropdown com a lógica da listagem principal, ignorando status estáticos desatualizados no banco.
        const [turmas] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.id, 
                t.nome_turma, 
                t.professor_responsavel AS professor_id
            FROM turmas t
            JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            WHERE t.disciplina_id = ? 
            AND CURDATE() BETWEEN cpl.data_inicio AND cpl.data_fim
            ORDER BY t.nome_turma ASC
        `, [disciplinaId]);

        // Log para debug
        console.log(`Buscando turmas ativas (por data) para disciplina ${disciplinaId}:`, turmas);

        res.status(200).json(turmas);
    } catch (error) {
        console.error("Erro ao buscar turmas por disciplina:", error);
        res.status(500).json({ message: "Erro interno ao buscar as turmas." });
    }
};