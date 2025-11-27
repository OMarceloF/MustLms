import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import axios from 'axios';

/**
 * Retorna todos os dados necessários para a Dashboard do Gestor
 */
export const getDashboardGestorData = async (req: Request, res: Response) => {
    try {
        const connection = await pool.getConnection();
        const currentYear = new Date().getFullYear();

        // =========================================================
        // 0. Captura de Filtros (Query Params)
        // =========================================================
        const cursoId = req.query.cursoId ? Number(req.query.cursoId) : null;
        const periodoId = req.query.periodoId ? Number(req.query.periodoId) : null;
        const disciplinaId = req.query.disciplinaId ? Number(req.query.disciplinaId) : null;

        // Buscando listas para popular os Selects no Frontend
        const [listaCursos] = await connection.query<RowDataPacket[]>('SELECT id, nome FROM cursos_posgraduacao WHERE status = "ativo" ORDER BY nome');
        const [listaPeriodos] = await connection.query<RowDataPacket[]>('SELECT id, nome FROM configuracoes_periodos_letivos ORDER BY data_inicio DESC');
        const [listaDisciplinas] = await connection.query<RowDataPacket[]>('SELECT id, nome FROM cursos_disciplinas ORDER BY nome');

        // =========================================================
        // 1. KPIs (Cards do Topo)
        // =========================================================

        // 1. Total de Alunos
        const [totalAlunosResult] = await connection.query<RowDataPacket[]>(`
            SELECT COUNT(*) as total FROM users WHERE role = 'aluno'
        `);
        const totalAlunos = totalAlunosResult[0].total;

        // 2. Alunos Ativos
        const [alunosAtivosResult] = await connection.query<RowDataPacket[]>(`
            SELECT COUNT(*) as total FROM users WHERE role = 'aluno' AND status = 'ativo'
        `);
        const alunosAtivos = alunosAtivosResult[0].total;

        // 3. Total de Professores
        const [totalProfsResult] = await connection.query<RowDataPacket[]>(`
            SELECT COUNT(*) as total FROM users WHERE role = 'professor'
        `);
        const totalProfessores = totalProfsResult[0].total;

        // 4. Total de Responsáveis
        const [totalRespResult] = await connection.query<RowDataPacket[]>(`
            SELECT COUNT(*) as total FROM users WHERE role = 'responsavel'
        `);
        const totalResponsaveis = totalRespResult[0].total;

        // 5. Total de Turmas
        const [totalTurmasResult] = await connection.query<RowDataPacket[]>(`
            SELECT COUNT(*) as total FROM turmas
        `);
        const totalTurmas = totalTurmasResult[0].total;

        // 6. Turmas Ativas
        // Filtra turmas 'Ativa' de semestres iniciados (não futuros)
        const [turmasAtivasResult] = await connection.query<RowDataPacket[]>(`
            SELECT COUNT(t.id) as total 
            FROM turmas t
            LEFT JOIN configuracoes_periodos_letivos cpl ON t.semestre_id = cpl.id
            WHERE t.status = 'Ativa'
            AND (cpl.data_inicio <= CURRENT_DATE() OR cpl.data_inicio IS NULL)
        `);
        const turmasAtivasCount = turmasAtivasResult[0].total;

        const kpiData = [
            { id: 1, title: 'TOTAL DE ALUNOS', value: totalAlunos, icon: 'users', trend: 0, period: 'Cadastrados' },
            { id: 2, title: 'ALUNOS ATIVOS', value: alunosAtivos, icon: 'user-check', trend: 0, period: 'Com acesso' },
            { id: 3, title: 'TOTAL DE PROFESSORES', value: totalProfessores, icon: 'users', trend: 0, period: 'Cadastrados' },
            { id: 4, title: 'TOTAL DE RESPONSÁVEIS', value: totalResponsaveis, icon: 'user-circle', trend: 0, period: 'Cadastrados' },
            { id: 5, title: 'TOTAL DE TURMAS', value: totalTurmas, icon: 'layers', trend: 0, period: 'Geral' },
            { id: 6, title: 'TURMAS ATIVAS', value: turmasAtivasCount, icon: 'check-circle', trend: 0, period: 'Em andamento' }
        ];

        // =========================================================
        // 2. Gráfico de Distribuição: ALUNOS POR CURSO
        // =========================================================
        const [ciclosRows] = await connection.query<RowDataPacket[]>(`
            SELECT 
                c.nome as name, 
                c.tipo as type, 
                COUNT(v.id) as value
            FROM cursos_posgraduacao c
            LEFT JOIN vincular_aluno_curso v ON c.id = v.curso_posgraduacao_id AND v.status_matricula = 'Ativa'
            WHERE c.status = 'ativo'
            GROUP BY c.id, c.nome, c.tipo
            ORDER BY value DESC
        `);

        const colorsMap: any = {
            'mestrado': '#363776',
            'doutorado': '#9dba32',
            'especializacao': '#f97316',
            'mba': '#0ea5e9'
        };

        const ciclosData = ciclosRows.map(row => ({
            // Corta nomes muito longos se necessário para a legenda não quebrar
            name: row.name.length > 30 ? row.name.substring(0, 30) + '...' : row.name,
            value: row.value,
            color: colorsMap[row.type] || '#8884d8'
        }));

        // =========================================================
        // 3. Desempenho por Turma (COM FILTROS E SUBQUERY)
        // =========================================================
        
        let whereClause = "WHERE 1=1";
        const queryParams: any[] = [];

        if (cursoId) {
            whereClause += " AND t.curso_id = ?";
            queryParams.push(cursoId);
        }
        if (periodoId) {
            whereClause += " AND t.semestre_id = ?";
            queryParams.push(periodoId);
        }
        if (disciplinaId) {
            whereClause += " AND t.disciplina_id = ?";
            queryParams.push(disciplinaId);
        }

        const queryDesempenho = `
            SELECT 
                t.nome_turma as turma,
                u.nome as professor,
                SUM(CASE WHEN COALESCE(student_grades.nota_total, 0) >= 60 THEN 1 ELSE 0 END) as aprovados,
                SUM(CASE WHEN COALESCE(student_grades.nota_total, 0) < 60 AND student_grades.aluno_id IS NOT NULL THEN 1 ELSE 0 END) as reprovados,
                0 as desistentes,
                COALESCE(AVG(student_grades.nota_total), 0) as media
            FROM turmas t
            LEFT JOIN funcionarios f ON t.professor_responsavel = f.id
            LEFT JOIN users u ON f.id = u.id
            -- Subquery para somar as notas de cada aluno na turma antes de fazer a média da turma
            LEFT JOIN (
                SELECT turma_id, aluno_id, SUM(nota) as nota_total
                FROM notas
                GROUP BY turma_id, aluno_id
            ) student_grades ON t.id = student_grades.turma_id
            ${whereClause}
            GROUP BY t.id, t.nome_turma, u.nome
            ORDER BY media DESC
            LIMIT 10
        `;

        const [desempenhoRows] = await connection.query<RowDataPacket[]>(queryDesempenho, queryParams);

        const desempenhoTurmasData = desempenhoRows.map(row => ({
            turma: row.turma,
            professor: row.professor || 'Não atribuído',
            aprovados: Number(row.aprovados),
            reprovados: Number(row.reprovados),
            desistentes: Number(row.desistentes),
            desempenho: parseFloat(row.media).toFixed(1), // String para tabela
            desempenhoNum: Number(Number(row.media).toFixed(1)) // Número arredondado para gráfico (Ex: 70.7)
        }));

        // =========================================================
        // 4. Calendário / Próximos Eventos
        // =========================================================
        const [eventosRows] = await connection.query<RowDataPacket[]>(`
            SELECT DISTINCT
                ec.id, 
                ec.nome as title, 
                ec.data, 
                DATE_FORMAT(ec.data, '%Y-%m-%d') as date, 
                ec.tipo as type 
            FROM eventos_calendario ec
            INNER JOIN eventos_roles er ON ec.id = er.evento_id
            WHERE LOWER(er.role) = 'gestor' 
            AND ec.data >= DATE_FORMAT(NOW(), '%Y-%m-01')
            ORDER BY ec.data ASC 
            LIMIT 100
        `);

        // =========================================================
        // 5. Atividades Recentes
        // =========================================================
        const [atividadesRows] = await connection.query<RowDataPacket[]>(`
            SELECT 
                id, titulo as description, data as timestamp,
                CASE 
                    WHEN tipo = 'nota_lancada' THEN 'post'
                    WHEN tipo = 'envio_material' THEN 'matricula'
                    ELSE 'evento'
                END as type
            FROM notificacoes_eventos
            ORDER BY data DESC
            LIMIT 10
        `);

        // =========================================================
        // 6. Avisos e Comunicados
        // =========================================================
        const [avisosRows] = await connection.query<RowDataPacket[]>(`
            SELECT 
                id, titulo as title, descricao as excerpt, 'geral' as category,
                autor_nome as author, data_aviso as date
            FROM avisos_disciplina
            ORDER BY data_aviso DESC
            LIMIT 5
        `);

        // =========================================================
        // 7. Feriados (BrasilAPI)
        // =========================================================
        let feriadosData = [];
        try {
            const response = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${currentYear}`, { timeout: 3000 });
            feriadosData = response.data;
        } catch (err) {
            console.error('Erro ao buscar feriados (API Externa):', err);
        }

        // =========================================================
        // 8. Gráfico de Frequência (Mock)
        // =========================================================
        const frequenciaData = [
            { month: 'Jan', 2024: 85, 2025: 0 },
            { month: 'Fev', 2024: 88, 2025: 0 },
            { month: 'Mar', 2024: 90, 2025: 0 },
            { month: 'Abr', 2024: 85, 2025: 0 },
            { month: 'Mai', 2024: 89, 2025: 0 },
            { month: 'Jun', 2024: 92, 2025: 0 },
        ];

        connection.release();

        res.json({
            filtros: { cursos: listaCursos, periodos: listaPeriodos, disciplinas: listaDisciplinas }, // Lista atualizada
            kpiData,
            ciclosData,
            desempenhoTurmasData,
            eventos: eventosRows,
            atividadesRecentes: atividadesRows,
            comunicados: avisosRows,
            frequenciaData,
            feriados: feriadosData 
        });

    } catch (error) {
        console.error('Erro ao buscar dados da dashboard:', error);
        res.status(500).json({ message: 'Erro interno ao carregar dashboard.' });
    }
};