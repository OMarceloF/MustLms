import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

export const getRelatoriosGeraisCurso = async (req: Request, res: Response) => {
    const { cursoId } = req.params;

    if (!cursoId) {
        return res.status(400).json({ message: "ID do curso é obrigatório." });
    }

    try {
        // 1. Métricas Gerais
        const queryMetricas = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status_matricula = 'Trancada' THEN 1 ELSE 0 END) as trancados
            FROM vincular_aluno_curso
            WHERE curso_posgraduacao_id = ?
        `;
        const [rowsMetricas] = await pool.query<RowDataPacket[]>(queryMetricas, [cursoId]);
        // Uso de ?. para evitar erro se rowsMetricas estiver vazio
        const totalMatriculados = rowsMetricas[0]?.total || 0;
        const totalTrancados = rowsMetricas[0]?.trancados || 0;
        
        const taxaDesistencia = totalMatriculados > 0 
            ? ((totalTrancados / totalMatriculados) * 100).toFixed(1) 
            : "0";

        // 2. Situação Atual
        const querySituacao = `
            SELECT 
                COALESCE(status_matricula, 'Indefinido') as situacao,
                COUNT(*) as total
            FROM vincular_aluno_curso
            WHERE curso_posgraduacao_id = ?
            GROUP BY status_matricula
        `;
        const [rowsSituacao] = await pool.query<RowDataPacket[]>(querySituacao, [cursoId]);
        
        const situacaoAtual = rowsSituacao.map(row => ({
            situacao: row.situacao,
            total: row.total
        }));

        // 3. Evolução de Matrículas
        const queryEvolucao = `
            SELECT 
                cpl.nome as semestre,
                COUNT(vac.id) as ingressantes,
                SUM(CASE WHEN vac.status_matricula = 'Trancada' THEN 1 ELSE 0 END) as desligados,
                (COUNT(vac.id) - SUM(CASE WHEN vac.status_matricula = 'Trancada' THEN 1 ELSE 0 END)) as total_ativos
            FROM vincular_aluno_curso vac
            JOIN turmas_ingresso ti ON vac.turmas_ingresso_id = ti.id
            JOIN configuracoes_periodos_letivos cpl ON ti.periodo_letivo_id = cpl.id
            WHERE vac.curso_posgraduacao_id = ?
            GROUP BY cpl.id, cpl.nome, cpl.data_inicio
            ORDER BY cpl.data_inicio ASC
        `;
        const [rowsEvolucao] = await pool.query<RowDataPacket[]>(queryEvolucao, [cursoId]);

        // 4. Desempenho
        const queryDesempenho = `
            SELECT 
                cpl.nome as semestre,
                SUM(CASE WHEN media_final >= 60 THEN 1 ELSE 0 END) as aprovados,
                SUM(CASE WHEN media_final < 60 THEN 1 ELSE 0 END) as reprovados
            FROM (
                SELECT 
                    t.semestre_id,
                    n.aluno_id,
                    AVG(n.nota) as media_final
                FROM notas n
                JOIN turmas t ON n.turma_id = t.id
                WHERE t.curso_id = ?
                GROUP BY t.semestre_id, n.aluno_id
            ) as medias
            JOIN configuracoes_periodos_letivos cpl ON medias.semestre_id = cpl.id
            GROUP BY cpl.id, cpl.nome
            ORDER BY cpl.data_inicio ASC
        `;
        const [rowsDesempenho] = await pool.query<RowDataPacket[]>(queryDesempenho, [cursoId]);

        const desempenhoSemestre = rowsDesempenho.map(row => {
            const total = (Number(row.aprovados) + Number(row.reprovados));
            return {
                semestre: row.semestre,
                aprovacao: total > 0 ? Math.round((row.aprovados / total) * 100) : 0,
                reprovacao: total > 0 ? Math.round((row.reprovados / total) * 100) : 0,
                desistencia: 0 
            };
        });

        res.json({
            metricas: {
                totalMatriculados,
                taxaDesistencia
            },
            graficos: {
                situacaoAtual,
                evolucaoMatriculas: rowsEvolucao,
                desempenhoSemestre
            }
        });

    } catch (error) {
        console.error("Erro ao gerar relatórios do curso:", error);
        res.status(500).json({ message: "Erro interno ao gerar relatórios." });
    }
};