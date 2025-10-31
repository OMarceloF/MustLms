import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// --- INTERFACES PARA TIPAGEM ---

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

interface TurmaAPI {
    id: string;
    nomeTurma: string;
    anoInicio: number;
    cursoId: string;
    cursoNome?: string;
    materiasIds: string[];
    materiasNomes?: string[];
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
 * OTIMIZADO: Evita o problema de query N+1, buscando todas as matérias de uma vez.
 */
export const getTurmas = async (req: Request, res: Response) => {
    try {
        const [turmasRows] = await pool.query<TurmaFromDB[]>(`
            SELECT 
                t.id, t.nome_turma, t.ano_letivo, t.curso_id, cp.nome AS curso_nome,
                t.materias_ids, t.semestre_id, cpl.nome AS semestre_nome,
                t.professor_responsavel, f.nome AS professor_nome, t.modalidade,
                t.quantidade_alunos, t.status, t.descricao
            FROM turmas t
            LEFT JOIN cursos_posgraduacao cp ON t.curso_id = cp.id
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            LEFT JOIN funcionarios f ON t.professor_responsavel = f.id
            WHERE t.curso_id IS NOT NULL
            ORDER BY t.id DESC;
        `);

        // Pega todos os IDs de matérias de todas as turmas
        const allMateriaIds = turmasRows.flatMap(turma => {
            try {
                // Garante que o parse funcione mesmo com string vazia ou inválida
                const ids = JSON.parse(turma.materias_ids || '[]');
                return Array.isArray(ids) ? ids : [];
            } catch {
                return [];
            }
        });
        
        const uniqueMateriaIds = [...new Set(allMateriaIds)].filter(id => id != null); // Remove nulos/undefined

        // Cria um mapa para associar ID da matéria ao seu nome
        const materiasMap = new Map<number, string>();

        if (uniqueMateriaIds.length > 0) {
            const placeholders = uniqueMateriaIds.map(() => '?').join(',');
            const [disciplinasRows] = await pool.query<RowDataPacket[]>(
                `SELECT id, nome FROM cursos_disciplinas WHERE id IN (${placeholders})`,
                uniqueMateriaIds
            );
            disciplinasRows.forEach(d => materiasMap.set(d.id, d.nome));
        }

        // Mapeia os resultados, agora com os nomes das matérias
        const turmasFormatadas = turmasRows.map(turma => {
            let materiasIds: (string | number)[] = [];
            try {
                const parsedIds = JSON.parse(turma.materias_ids || '[]');
                materiasIds = Array.isArray(parsedIds) ? parsedIds : [];
            } catch {
                // Deixa o array vazio se o JSON for inválido
            }
            
            // *** LINHA DA CORREÇÃO PRINCIPAL ***
            // Converte os IDs para número e busca o nome no mapa
            const materiasNomes = materiasIds
                .map(id => materiasMap.get(Number(id)))
                .filter((nome): nome is string => !!nome); // Filtra nomes não encontrados

            return {
                id: turma.id, // Mantém o ID como número para consistência interna
                nomeTurma: turma.nome_turma,
                anoInicio: turma.ano_letivo,
                cursoId: String(turma.curso_id),
                cursoNome: turma.curso_nome,
                materiasIds: materiasIds.map(String), // Converte para string para o frontend
                materiasNomes: materiasNomes.length > 0 ? materiasNomes : ["Nenhuma matéria vinculada"], // Mensagem padrão se não houver nomes
                semestre: String(turma.semestre_id),
                semestreNome: turma.semestre_nome,
                responsavelId: String(turma.professor_responsavel),
                responsavelNome: turma.professor_nome,
                modalidade: turma.modalidade,
                quantidadeAlunos: turma.quantidade_alunos ?? undefined,
                status: turma.status,
                descricao: turma.descricao ?? undefined,
            };
        });

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
    const { nomeTurma, cursoId, materiasIds, anoInicio, semestre, responsavelId, modalidade, quantidadeAlunos, status, descricao }: TurmaAPI = req.body;

    try {
        const [result] = await pool.execute(
            `INSERT INTO turmas (nome_turma, ano_letivo, curso_id, materias_ids, semestre_id, professor_responsavel, modalidade, quantidade_alunos, status, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nomeTurma, anoInicio, cursoId, JSON.stringify(materiasIds), semestre, responsavelId, modalidade, quantidadeAlunos ?? null, status, descricao ?? null]
        );
        const insertId = (result as ResultSetHeader).insertId;
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
    const { nomeTurma, cursoId, materiasIds, anoInicio, semestre, responsavelId, modalidade, quantidadeAlunos, status, descricao }: TurmaAPI = req.body;

    try {
        await pool.execute(
            `UPDATE turmas SET nome_turma = ?, ano_letivo = ?, curso_id = ?, materias_ids = ?, semestre_id = ?, professor_responsavel = ?, modalidade = ?, quantidade_alunos = ?, status = ?, descricao = ? WHERE id = ?`,
            [nomeTurma, anoInicio, cursoId, JSON.stringify(materiasIds), semestre, responsavelId, modalidade, quantidadeAlunos ?? null, status, descricao ?? null, id]
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

/**
 * [GET] /api/turmas-novo/:id - Busca uma turma pelo ID com todos os detalhes.
 * MELHORADO: Agora inclui a lista de matérias e alunos.
 */
export const getTurmaByIdNovo = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [turmaRows] = await pool.query<TurmaFromDB[]>(`
            SELECT 
                t.id, t.nome_turma, t.ano_letivo, t.modalidade, t.status, t.descricao,
                t.materias_ids, cp.nome AS curso_nome, cpl.nome AS semestre_nome,
                f.nome AS professor_nome
            FROM turmas t
            LEFT JOIN cursos_posgraduacao cp ON t.curso_id = cp.id
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            LEFT JOIN funcionarios f ON t.professor_responsavel = f.id
            WHERE t.id = ?
        `, [id]);

        if (turmaRows.length === 0) {
            return res.status(404).json({ message: 'Turma não encontrada' });
        }
        const turma = turmaRows[0];

        // Busca as matérias vinculadas
        const materiasIds = turma.materias_ids ? JSON.parse(turma.materias_ids) : [];
        let materias: { materiaId: number; nome: string }[] = [];
        if (materiasIds.length > 0) {
            const placeholders = materiasIds.map(() => '?').join(',');
            const [disciplinasRows] = await pool.query<RowDataPacket[]>(
                `SELECT id, nome FROM cursos_disciplinas WHERE id IN (${placeholders})`,
                materiasIds
            );
            materias = disciplinasRows.map(d => ({ materiaId: d.id, nome: d.nome }));
        }

        // Busca os alunos vinculados
        const [alunosRows] = await pool.query<RowDataPacket[]>(`
            SELECT u.id, u.nome, u.foto_url, u.role, a.matricula
            FROM alunos_turmas at
            JOIN users u ON at.aluno_id = u.id
            JOIN alunos a ON u.id = a.id
            WHERE at.turma_id = ?
            ORDER BY u.nome ASC
        `, [id]);
        
        const alunos = alunosRows.map((row: any) => ({
            id: row.id, nome: row.nome, foto_url: row.foto_url, role: row.role, matricula: row.matricula,
        }));

        // Monta o objeto de resposta final
        const responseData = {
            id: turma.id,
            nome: turma.nome_turma,
            ano_letivo: turma.ano_letivo,
            qtd_alunos: alunos.length,
            professor_responsavel: turma.professor_nome,
            alunos: alunos,
            materias: materias,
            serie: turma.curso_nome || 'Não vinculado',
            turno: turma.modalidade || 'Não definido',
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Erro ao buscar detalhes da turma:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

/**
 * @description Lista os alunos disponíveis para serem vinculados a uma turma específica.
 * @route GET /api/turmas-novo/:turmaId/alunos-disponiveis
 */
export const getAlunosDisponiveisParaTurma = async (req: Request, res: Response) => {
    const { turmaId } = req.params;
    if (!turmaId) return res.status(400).json({ message: 'O ID da turma é obrigatório.' });

    try {
        const [alunos] = await pool.query<RowDataPacket[]>(`
            SELECT u.id, u.nome, u.foto_url FROM users u
            WHERE u.role = 'aluno' AND u.status = 'ativo'
              AND u.id NOT IN (SELECT aluno_id FROM alunos_turmas WHERE turma_id = ?)
            ORDER BY u.nome ASC;
        `, [turmaId]);
        res.json(alunos);
    } catch (error) {
        console.error('Erro ao buscar alunos disponíveis:', error);
        res.status(500).json({ message: 'Erro interno ao buscar alunos disponíveis.' });
    }
};

/**
 * @description Adiciona uma lista de alunos a uma turma específica.
 * @route POST /api/turmas-novo/:turmaId/adicionar-alunos
 */
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

/**
 * @description Remove um aluno de uma turma específica.
 * @route DELETE /api/turmas-novo/:turmaId/alunos/:alunoId
 */
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
 * @description Atualiza o status do VÍNCULO de um aluno com uma turma específica.
 * @route   PATCH /api/turmas-novo/:turmaId/alunos/:alunoId/status
 */
export const updateAlunoTurmaStatus = async (req: Request, res: Response) => {
    const { vinculoId } = req.params; // Recebe o ID do vínculo da URL
    const { status } = req.body;

    const allowedStatus = ['ativo', 'inativo', 'trancado'];
    if (!status || !allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Status inválido ou não fornecido.' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            "UPDATE alunos_turmas SET status_vinculo = ? WHERE id = ?", // Usa o ID do vínculo (chave primária)
            [status, vinculoId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vínculo não encontrado.' });
        }

        res.status(200).json({ message: 'Status do vínculo do aluno atualizado com sucesso.' });

    } catch (error) {
        console.error('Erro ao atualizar status do vínculo do aluno:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar o status do vínculo.' });
    }
};
