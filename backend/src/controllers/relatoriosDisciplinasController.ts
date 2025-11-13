// src/controllers/relatoriosDisciplinasController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';

// Função auxiliar para capitalizar a primeira letra
const capitalize = (s: string) => {
  if (typeof s !== 'string' || !s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * @description Gera dados de relatórios para uma DISCIPLINA específica.
 * @route GET /api/disciplinas/:disciplinaId/relatorios
 */
export const getRelatoriosDisciplina = async (req: Request, res: Response) => {
    const { disciplinaId } = req.params;
    const { periodoId, turmaId } = req.query;

    if (!disciplinaId) {
        return res.status(400).json({ message: 'O ID da disciplina é obrigatório.' });
    }

    const connection = await pool.getConnection();
    try {
        let queryParams: (string | number)[] = [disciplinaId];
        let queryConditions = '';

        if (periodoId && periodoId !== 'all') {
            queryConditions += ' AND t.semestre_id = ?';
            queryParams.push(periodoId as string);
        }
        if (turmaId && turmaId !== 'all') {
            queryConditions += ' AND t.id = ?';
            queryParams.push(turmaId as string);
        }

        const [alunosBase] = await connection.query<RowDataPacket[]>(`
            SELECT DISTINCT
                at.aluno_id,
                at.status_vinculo,
                t.id AS turma_id,
                t.nome_turma,
                f.nome AS professor_nome
            FROM turmas t
            JOIN alunos_turmas at ON t.id = at.turma_id
            LEFT JOIN funcionarios f ON t.professor_responsavel = f.id
            WHERE t.disciplina_id = ? ${queryConditions}
        `, queryParams);

        if (alunosBase.length === 0) {
            return res.status(200).json({
                metrics: { totalAlunos: 0, taxaAprovacao: 0, taxaReprovacao: 0, taxaDesistencia: 0, totalProfessores: 0 },
                turmas: [],
                chartData: []
            });
        }

        const alunoIds = alunosBase.map(a => a.aluno_id);

        const [notas] = await connection.query<RowDataPacket[]>(`
            SELECT aluno_id, turma_id, nota, nota_rec 
            FROM notas 
            WHERE materia_id = ? AND aluno_id IN (?)
        `, [disciplinaId, alunoIds]);

        const kpis = { totalAlunos: alunosBase.length, aprovados: 0, reprovados: 0, desistentes: 0, totalProfessores: 0 };
        const resumoPorTurmaMap = new Map<number, { turma: string, professor: string, aprovados: number, reprovados: number, desistentes: number, somaMedias: number, totalAlunos: number }>();
        const professoresSet = new Set<string>();

        alunosBase.forEach(aluno => {
            if (aluno.professor_nome) professoresSet.add(aluno.professor_nome);
            if (!resumoPorTurmaMap.has(aluno.turma_id)) {
                resumoPorTurmaMap.set(aluno.turma_id, {
                    turma: aluno.nome_turma,
                    professor: aluno.professor_nome || 'N/A',
                    aprovados: 0, reprovados: 0, desistentes: 0, somaMedias: 0, totalAlunos: 0
                });
            }
        });
        kpis.totalProfessores = professoresSet.size;

        alunosBase.forEach(aluno => {
            const turmaResumo = resumoPorTurmaMap.get(aluno.turma_id)!;
            turmaResumo.totalAlunos++;

            const statusVinculo = capitalize(aluno.status_vinculo || 'ativo');
            if (['Trancado', 'Inativo', 'Concluído'].includes(statusVinculo)) {
                kpis.desistentes++;
                turmaResumo.desistentes++;
                return;
            }

            const notasDoAluno = notas.filter(n => n.aluno_id === aluno.aluno_id && n.turma_id === aluno.turma_id);
            const somaNotas = notasDoAluno.reduce((sum, n) => sum + parseFloat(n.nota || 0), 0);
            const notaRec = notasDoAluno.reduce((max, n) => Math.max(max, parseFloat(n.nota_rec || 0)), 0);

            let notaFinal = somaNotas;
            if (notaRec > notaFinal) {
                notaFinal = Math.min(notaRec, 60);
            }
            
            turmaResumo.somaMedias += notaFinal;

            if (notaFinal >= 60) {
                kpis.aprovados++;
                turmaResumo.aprovados++;
            } else {
                kpis.reprovados++;
                turmaResumo.reprovados++;
            }
        });

        const totalConsiderado = kpis.aprovados + kpis.reprovados + kpis.desistentes;
        const metrics = {
            totalAlunos: kpis.totalAlunos,
            taxaAprovacao: totalConsiderado > 0 ? parseFloat(((kpis.aprovados / totalConsiderado) * 100).toFixed(1)) : 0,
            taxaReprovacao: totalConsiderado > 0 ? parseFloat(((kpis.reprovados / totalConsiderado) * 100).toFixed(1)) : 0,
            taxaDesistencia: totalConsiderado > 0 ? parseFloat(((kpis.desistentes / totalConsiderado) * 100).toFixed(1)) : 0,
            totalProfessores: kpis.totalProfessores,
        };

        const turmasTabela = Array.from(resumoPorTurmaMap.values()).map(t => ({
            ...t,
            mediaGeral: (t.aprovados + t.reprovados) > 0 ? t.somaMedias / (t.aprovados + t.reprovados) : 0
        }));

        res.status(200).json({
            metrics,
            turmas: turmasTabela,
            // *** CORREÇÃO APLICADA AQUI ***
            chartData: turmasTabela.map(t => ({ turma: t.turma, aprovados: t.aprovados, reprovados: t.reprovados, desistentes: t.desistentes }))
        });

    } catch (error) {
        console.error("Erro ao gerar relatórios da disciplina:", error);
        res.status(500).json({ message: 'Erro interno ao gerar relatórios.' });
    } finally {
        connection.release();
    }
};
