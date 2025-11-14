import { Request, Response } from 'express';
import pool from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Interface para tipar o resultado do banco
interface ICursoEvento extends RowDataPacket {
  id: number;
  curso_id: number;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  tipo: 'prazo' | 'evento' | 'defesa';
}

/**
 * @description Adiciona um novo curso de pós-graduação.
 * @route POST /api/cursos/adicionar
 */
export const adicionarCurso = async (req: Request, res: Response) => {
    const {
        nome, sigla, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
        coordenador_id, vice_coordenador_id, unidade_id, objetivos, perfil_egresso,
        justificativa, ano_inicio, status, link_divulgacao
    } = req.body;

    try {
        const query = `
            INSERT INTO cursos_posgraduacao (
                nome, sigla, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
                coordenador_id, vice_coordenador_id, unidade_id, objetivos, perfil_egresso,
                justificativa, ano_inicio, status, link_divulgacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const values = [
            nome, sigla, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
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
                c.id, 
                c.nome, 
                c.sigla,
                c.duracao_semestres 
            FROM cursos_posgraduacao c
            WHERE c.status = 'Ativo'
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
 * @description Lista as turmas de ingresso, opcionalmente filtrando por curso.
 * @route GET /api/turmas-ingresso
 */
export const listarTurmasDeIngresso = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT id, nome, curso_posgraduacao_id 
            FROM turmas_ingresso 
            ORDER BY nome ASC;
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        res.status(200).json(rows);
    } catch (error: any) {
        console.error("Erro ao listar turmas de ingresso:", error);
        res.status(500).json({ message: 'Erro interno ao buscar as turmas de ingresso: ' + error.message });
    }
};

/**
 * @description Lista os alunos vinculados a um curso de pós-graduação pela tabela de vínculo.
 * @route GET /api/cursos/:cursoId/alunos-vinculados
 */
export const listarAlunosVinculados = async (req: Request, res: Response) => {
    const { cursoId } = req.params;

    if (!cursoId) {
        return res.status(400).json({ message: "O ID do curso é obrigatório." });
    }

    try {
        const query = `
            SELECT 
                u.id,
                u.nome,
                a.matricula,
                vac.id AS vinculoId,
                vac.status_matricula AS status
            FROM vincular_aluno_curso vac
            JOIN users u ON vac.aluno_id = u.id
            JOIN alunos a ON vac.aluno_id = a.id
            WHERE vac.curso_posgraduacao_id = ?
            ORDER BY u.nome ASC;
        `;

        const [alunos] = await pool.query<RowDataPacket[]>(query, [cursoId]);
        res.status(200).json(alunos);
    } catch (error: any) {
        console.error("Erro ao buscar alunos vinculados:", error);
        res.status(500).json({ message: "Erro interno ao buscar os alunos vinculados: " + error.message });
    }
};

/**
 * @description Lista todos os períodos letivos.
 * @route GET /api/periodos-letivos/todos (Exemplo, a rota real pode variar)
 */
export const listarPeriodosLetivos = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT id, nome 
            FROM configuracoes_periodos_letivos 
            ORDER BY data_inicio DESC;
        `;
        const [rows] = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar períodos letivos:", error);
        res.status(500).json({ message: 'Erro interno ao buscar os períodos letivos.' });
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
        nome, sigla, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
        coordenador_id, vice_coordenador_id, unidade_id, objetivos, perfil_egresso,
        justificativa, ano_inicio, status, link_divulgacao
    } = req.body;

    try {
        const query = `
            UPDATE cursos_posgraduacao SET
                nome = ?, sigla = ?, tipo = ?, area_conhecimento = ?, carga_horaria = ?, duracao_semestres = ?, 
                modalidade = ?, coordenador_id = ?, vice_coordenador_id = ?, unidade_id = ?, 
                objetivos = ?, perfil_egresso = ?, justificativa = ?, ano_inicio = ?, 
                status = ?, link_divulgacao = ?
            WHERE id = ?;
        `;
        const values = [
            nome, sigla, tipo, area_conhecimento, carga_horaria, duracao_semestres, modalidade,
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
 * @description Lista os eventos do calendário acadêmico de um curso específico.
 * @route GET /api/cursos/:cursoId/calendario
 */
export const listarEventosCalendario = async (req: Request, res: Response) => {
  const { cursoId } = req.params;

  try {
    const [eventos] = await pool.query<ICursoEvento[]>(
      'SELECT id, titulo, data_inicio AS dataInicio, data_fim AS dataFim, descricao, tipo FROM cursos_eventos WHERE curso_id = ? ORDER BY data_inicio ASC',
      [cursoId]
    );
    res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos do calendário do curso:', error);
    res.status(500).json({ error: 'Erro interno ao buscar eventos.' });
  }
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
 * @description Adiciona um novo evento ao calendário acadêmico de um curso.
 * @route POST /api/cursos/:cursoId/calendario
 */
export const adicionarEventoCalendario = async (req: Request, res: Response) => {
  const { cursoId } = req.params;
  const { titulo, descricao, dataInicio, dataFim, tipo } = req.body;

  if (!titulo || !dataInicio || !dataFim || !tipo) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios: título, data de início, data de fim e tipo.' });
  }

  try {
    const query = 'INSERT INTO cursos_eventos (curso_id, titulo, descricao, data_inicio, data_fim, tipo) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await pool.query(query, [cursoId, titulo, descricao, dataInicio, dataFim, tipo]);
    
    // Para obter o ID do evento recém-criado
    const insertId = (result as any).insertId;

    res.status(201).json({ message: 'Evento adicionado com sucesso!', id: insertId });
  } catch (error) {
    console.error('Erro ao adicionar evento ao calendário do curso:', error);
    res.status(500).json({ error: 'Erro interno ao salvar o evento.' });
  }
};

/**
 * @description Consolida e retorna todos os eventos de todos os cursos para o calendário do gestor.
 * @route GET /api/calendario/gestor/eventos-cursos
 */
export const getEventosDeCursosParaGestor = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<ICursoEvento[]>(`
            SELECT 
                ce.id,
                ce.titulo AS nome,
                ce.data_inicio AS data,
                ce.tipo,
                ce.descricao,
                cp.sigla AS curso_sigla
            FROM cursos_eventos ce
            JOIN cursos_posgraduacao cp ON ce.curso_id = cp.id
            ORDER BY ce.data_inicio ASC
        `);

        // Formata os eventos para serem compatíveis com o FullCalendar do gestor
        const eventosFormatados = rows.map(evento => ({
            id: `curso-evento-${evento.id}`,
            nome: `[${evento.curso_sigla}] ${evento.nome}`, // Adiciona a sigla do curso ao título
            data: evento.data,
            tipo: 'evento_especial', // Mapeia para um tipo visualmente reconhecível no calendário do gestor
            importancia: 'media', // Define uma importância padrão
            descricao: evento.descricao,
        }));

        res.status(200).json(eventosFormatados);
    } catch (error) {
        console.error('Erro ao buscar eventos de cursos para o gestor:', error);
        res.status(500).json({ error: 'Erro interno ao consolidar eventos de cursos.' });
    }
};

/**
 * @description Salva ou atualiza o PPC de um curso.
 * @route POST /api/cursos/:cursoId/ppc
 */
export const salvarPPC = async (req: Request, res: Response) => {
    const { cursoId } = req.params;
    const { conteudo } = req.body;

    if (!cursoId) return res.status(400).json({ message: 'O ID do curso é obrigatório.' });
    if (conteudo === undefined) return res.status(400).json({ message: 'O conteúdo do PPC é obrigatório.' });

    try {
        const query = 'INSERT INTO cursos_ppc (curso_id, conteudo) VALUES (?, ?) ON DUPLICATE KEY UPDATE conteudo = ?';
        await pool.query(query, [cursoId, conteudo, conteudo]);
        res.status(200).json({ message: 'PPC salvo com sucesso.' });
    } catch (error) {
        console.error(`[ERRO AO SALVAR PPC] Curso ID: ${cursoId}`, error);
        res.status(500).json({ message: 'Erro interno no servidor ao salvar o PPC.' });
    }
};

/**
 * @description Lista todas as turmas vinculadas a uma disciplina específica,
 *              opcionalmente filtrando por período letivo.
 * @route GET /api/disciplinas/:disciplinaId/turmas
 */
export const listarTurmasPorDisciplina = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    const { periodoId } = req.query;

    if (!disciplinaId) {
        return res.status(400).json({ message: "O ID da disciplina é obrigatório." });
    }

    try {
        // *** CORREÇÃO: Adicionado t.semestre_id ao SELECT ***
        let query = `
            SELECT 
                t.id, 
                t.nome_turma AS nome, 
                t.semestre_id, 
                cpl.nome AS semestre_nome 
            FROM turmas t
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            WHERE t.disciplina_id = ?
        `;
        const params: (string | number)[] = [disciplinaId];

        if (periodoId && periodoId !== 'all') {
            query += ' AND t.semestre_id = ?';
            params.push(periodoId as string);
        }

        query += ' ORDER BY t.nome_turma ASC;';

        const [turmas] = await pool.query<RowDataPacket[]>(query, params);

        res.status(200).json(turmas);

    } catch (error) {
        console.error("Erro ao buscar turmas por disciplina:", error);
        res.status(500).json({ message: "Erro interno ao buscar as turmas." });
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
        // Query para buscar professores (sem alteração)
        const [professores] = await pool.query<RowDataPacket[]>(`
            SELECT DISTINCT
                f.id, f.nome, f.departamento,
                (SELECT COUNT(*) FROM alunos_turmas at2 WHERE at2.turma_id IN (SELECT id FROM turmas WHERE professor_responsavel = f.id)) AS orientandos
            FROM funcionarios f
            JOIN turmas t ON f.id = t.professor_responsavel
            WHERE t.curso_id = ? AND f.cargo LIKE '%Professor%'
            ORDER BY f.nome;
        `, [cursoId]);

        // ===== QUERY DAS TURMAS CORRIGIDA =====
        const [turmasBase] = await pool.query<RowDataPacket[]>(`
            SELECT 
                t.id, 
                t.nome_turma AS codigo, 
                cpl.nome AS periodo,
                t.quantidade_alunos AS alunos,
                d.nome AS disciplina_nome
            FROM turmas t
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            LEFT JOIN cursos_disciplinas d ON t.disciplina_id = d.id
            WHERE t.curso_id = ?
            ORDER BY cpl.data_inicio DESC, t.nome_turma;
        `, [cursoId]);
        // ======================================

        // Mapeamento simplificado dos resultados
        const turmas = turmasBase.map(turma => ({
            id: turma.id,
            codigo: turma.codigo,
            periodo: turma.periodo,
            alunos: turma.alunos || 0,
            disciplina: turma.disciplina_nome || 'N/A'
        }));

        // Query para buscar alunos (sem alteração)
        const [alunos] = await pool.query<RowDataPacket[]>(`
            SELECT DISTINCT
                u.id,
                u.nome,
                a.matricula,
                at.status_vinculo AS status,
                at.id AS vinculoId 
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
