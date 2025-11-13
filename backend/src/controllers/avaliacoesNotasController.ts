// src/controllers/avaliacoesNotasController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { notificarNotaLancada } from './notificacoesEventosController';

// --- Interfaces ---
interface Avaliacao extends RowDataPacket {
  id: number;
  descricao: string;
  valor: number;
  data_inicio: string;
  data_fim: string | null;
}

// Interface atualizada para suportar o novo status
interface AlunoComNotas {
    aluno_id: number;
    aluno_nome: string;
    aluno_foto: string | null;
    matricula?: string;
    vinculoId: number;
    status_vinculo: 'Ativo' | 'Inativo' | 'Trancado' | 'Concluído';
    notas: { avaliacao_id: number; nota: number | null }[];
    media_final: number;
    status: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente' | 'Trancado' | 'Inativo' | 'Concluído'; // Adicionado novos status
    nota_recuperacao: number | null;
    nota_final: number;
}

// Função auxiliar para capitalizar a primeira letra
const capitalize = (s: string) => {
  if (typeof s !== 'string' || !s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// =======================================================================
// CRUD DE AVALIAÇÕES (Sem alterações)
// =======================================================================
export const getAvaliacoesByTurmaMateria = async (req: Request, res: Response) => {
    const { materiaId, turmaId, calendarioId } = req.params;
    if (!materiaId || !turmaId || !calendarioId) {
        return res.status(400).json({ message: 'IDs de matéria, turma e período são obrigatórios.' });
    }
    try {
        const [rows] = await pool.query<Avaliacao[]>(
            'SELECT id, descricao, valor, DATE_FORMAT(data_inicio, "%Y-%m-%d") as data_inicio, DATE_FORMAT(data_fim, "%Y-%m-%d") as data_fim FROM avaliacoes WHERE materia_id = ? AND turma_id = ? AND calendario_id = ? ORDER BY data_inicio',
            [materiaId, turmaId, calendarioId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
        res.status(500).json({ message: 'Erro interno ao buscar avaliações.' });
    }
};

export const createAvaliacao = async (req: Request, res: Response) => {
    const { descricao, valor, calendario_id, materia_id, turma_id, data_inicio, data_fim } = req.body;
    if (!descricao || !valor || !calendario_id || !materia_id || !turma_id || !data_inicio) {
        return res.status(400).json({ message: 'Nome, valor, data de início e IDs são obrigatórios.' });
    }
    const connection = await pool.getConnection();
    try {
        const [totalRows] = await connection.query<RowDataPacket[]>(
            'SELECT SUM(valor) as total_pontos FROM avaliacoes WHERE materia_id = ? AND turma_id = ? AND calendario_id = ?',
            [materia_id, turma_id, calendario_id]
        );
        const totalPontosAtual = totalRows[0]?.total_pontos || 0;
        if (totalPontosAtual + Number(valor) > 100) {
            return res.status(400).json({ message: `A soma dos pontos (${totalPontosAtual} + ${valor}) excederia 100.` });
        }
        const [result] = await connection.query<ResultSetHeader>(
            'INSERT INTO avaliacoes (descricao, valor, calendario_id, materia_id, turma_id, data_inicio, data_fim, status) VALUES (?, ?, ?, ?, ?, ?, ?, "Pendente")',
            [descricao, valor, calendario_id, materia_id, turma_id, data_inicio, data_fim || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Avaliação criada com sucesso!' });
    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).json({ message: 'Erro interno ao criar a avaliação.' });
    } finally {
        connection.release();
    }
};

export const updateAvaliacao = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { descricao, valor, data_inicio, data_fim } = req.body;
    const connection = await pool.getConnection();
    try {
        const [avaliacaoAtualRows] = await connection.query<RowDataPacket[]>(
            'SELECT materia_id, turma_id, calendario_id FROM avaliacoes WHERE id = ?',
            [id]
        );
        if (avaliacaoAtualRows.length === 0) {
            return res.status(404).json({ message: 'Avaliação não encontrada.' });
        }
        const { materia_id, turma_id, calendario_id } = avaliacaoAtualRows[0];
        const [totalRows] = await connection.query<RowDataPacket[]>(
            'SELECT SUM(valor) as total_pontos FROM avaliacoes WHERE materia_id = ? AND turma_id = ? AND calendario_id = ? AND id != ?',
            [materia_id, turma_id, calendario_id, id]
        );
        const totalPontosOutras = totalRows[0]?.total_pontos || 0;
        if (totalPontosOutras + Number(valor) > 100) {
            return res.status(400).json({ message: `A soma dos pontos excederia 100. Pontuação das outras avaliações: ${totalPontosOutras}.` });
        }
        await connection.query(
            'UPDATE avaliacoes SET descricao = ?, valor = ?, data_inicio = ?, data_fim = ? WHERE id = ?',
            [descricao, valor, data_inicio, data_fim || null, id]
        );
        res.status(200).json({ message: 'Avaliação atualizada com sucesso.' });
    } catch (error) {
        console.error("Erro ao atualizar avaliação:", error);
        res.status(500).json({ message: 'Erro interno ao atualizar a avaliação.' });
    } finally {
        connection.release();
    }
};

export const deleteAvaliacao = async (req: Request, res: Response) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM notas WHERE avaliacao_id = ?', [id]);
        await connection.query('DELETE FROM avaliacoes WHERE id = ?', [id]);
        await connection.commit();
        res.status(200).json({ message: 'Avaliação e notas relacionadas foram deletadas.' });
    } catch (error) {
        await connection.rollback();
        console.error("Erro ao deletar avaliação:", error);
        res.status(500).json({ message: 'Erro interno ao deletar a avaliação.' });
    } finally {
        connection.release();
    }
};

// =======================================================================
// LÓGICA CENTRAL DE NOTAS E STATUS (COM A NOVA REGRA DE PRIORIDADE)
// =======================================================================
export const getDadosAcademicosCompletos = async (req: Request, res: Response) => {
    const { turmaId, materiaId, calendarioId } = req.params;

    if (!turmaId || !materiaId || !calendarioId) {
        return res.status(400).json({ message: 'IDs da turma, matéria e calendário são obrigatórios.' });
    }

    const connection = await pool.getConnection();

    try {
        const [avaliacoes] = await connection.query<RowDataPacket[]>(
            'SELECT id, descricao, valor, data_inicio, data_fim FROM avaliacoes WHERE turma_id = ? AND materia_id = ? AND calendario_id = ? ORDER BY data_inicio, id',
            [turmaId, materiaId, calendarioId]
        );

        const [alunosBase] = await connection.query<RowDataPacket[]>(`
            SELECT 
                u.id AS aluno_id,
                u.nome AS aluno_nome,
                u.foto_url AS aluno_foto,
                a.matricula,
                at.id AS vinculoId,
                at.status_vinculo
            FROM alunos_turmas at
            JOIN users u ON at.aluno_id = u.id
            JOIN alunos a ON u.id = a.id
            WHERE at.turma_id = ?
            ORDER BY u.nome;
        `, [turmaId]);

        if (alunosBase.length === 0) {
            return res.json({ avaliacoes, alunosComNotas: [] });
        }

        const alunoIds = alunosBase.map(a => a.aluno_id);

        const [notas] = await connection.query<RowDataPacket[]>(`
            SELECT aluno_id, avaliacao_id, nota, nota_rec FROM notas 
            WHERE turma_id = ? AND materia_id = ? AND aluno_id IN (?)
        `, [turmaId, materiaId, alunoIds]);

        const alunosComNotas: AlunoComNotas[] = alunosBase.map(alunoInfo => {
            const notasDoAluno = notas.filter(n => n.aluno_id === alunoInfo.aluno_id);

            const notasFormatadas = avaliacoes.map(av => {
                const notaEncontrada = notasDoAluno.find(n => n.avaliacao_id === av.id);
                return {
                    avaliacao_id: av.id,
                    nota: notaEncontrada && notaEncontrada.nota !== null ? parseFloat(notaEncontrada.nota) : null
                };
            });

            const somaNotasRegulares = notasFormatadas.reduce((acc, n) => acc + (n.nota || 0), 0);
            
            const nota_recuperacao = notasDoAluno
                .filter(n => n.nota_rec !== null)
                .reduce((max, n) => Math.max(max, parseFloat(n.nota_rec)), 0) || null;

            const MEDIA_APROVACAO = 60;
            const MEDIA_RECUPERACAO = 40;
            let nota_final = somaNotasRegulares;
            let status_academico: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente' = 'Pendente';

            const temNotasLancadas = notasFormatadas.some(n => n.nota !== null);

            if (temNotasLancadas) {
                if (somaNotasRegulares >= MEDIA_APROVACAO) {
                    status_academico = 'Aprovado';
                } else if (somaNotasRegulares >= MEDIA_RECUPERACAO) {
                    status_academico = 'Recuperação';
                    if (nota_recuperacao !== null) {
                        nota_final = Math.max(somaNotasRegulares, nota_recuperacao);
                        status_academico = nota_final >= MEDIA_APROVACAO ? 'Aprovado' : 'Reprovado';
                    }
                } else {
                    status_academico = 'Reprovado';
                }
            }
            
            if (status_academico === 'Aprovado' && somaNotasRegulares < MEDIA_APROVACAO && nota_recuperacao !== null) {
                nota_final = Math.min(nota_final, MEDIA_APROVACAO);
            }

            // *** NOVA LÓGICA DE PRIORIDADE DE STATUS ***
            const statusVinculoCapitalized = capitalize(alunoInfo.status_vinculo || 'ativo') as AlunoComNotas['status_vinculo'];
            let statusFinal: AlunoComNotas['status'] = status_academico;

            if (statusVinculoCapitalized === 'Trancado' || statusVinculoCapitalized === 'Inativo' || statusVinculoCapitalized === 'Concluído') {
                statusFinal = statusVinculoCapitalized;
            }
            // *******************************************

            return {
                aluno_id: alunoInfo.aluno_id,
                aluno_nome: alunoInfo.aluno_nome,
                aluno_foto: alunoInfo.aluno_foto,
                matricula: alunoInfo.matricula,
                vinculoId: alunoInfo.vinculoId,
                status_vinculo: statusVinculoCapitalized,
                notas: notasFormatadas,
                media_final: parseFloat(somaNotasRegulares.toFixed(1)),
                nota_recuperacao: nota_recuperacao,
                status: statusFinal, // Usa o status final com a regra de prioridade
                nota_final: parseFloat(nota_final.toFixed(1))
            };
        });

        res.json({ avaliacoes, alunosComNotas });

    } catch (error) {
        console.error('Erro ao buscar dados acadêmicos completos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    } finally {
        connection.release();
    }
};

// =======================================================================
// UPSERT DE NOTAS (Sem alterações)
// =======================================================================
export const upsertNotas = async (req: Request, res: Response) => {
    const { aluno_id, materia_id, turma_id, avaliacao_id, nota, tipo_nota } = req.body;

    const notaNumerica = Number(nota);
    const notaParaSalvar = isNaN(notaNumerica) ? null : notaNumerica;

    if (!aluno_id || !materia_id || !turma_id) {
        return res.status(400).json({ message: 'Dados insuficientes para salvar a nota.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        if (tipo_nota === 'recuperacao') {
            if (notaParaSalvar !== null && (notaParaSalvar < 0 || notaParaSalvar > 100)) {
                throw new Error('A nota de recuperação deve estar entre 0 e 100.');
            }
            const [existingNote] = await connection.query<RowDataPacket[]>('SELECT id FROM notas WHERE aluno_id = ? AND materia_id = ? AND turma_id = ? LIMIT 1', [aluno_id, materia_id, turma_id]);
            if (existingNote.length > 0) {
                 await connection.query(
                    'UPDATE notas SET nota_rec = ? WHERE aluno_id = ? AND materia_id = ? AND turma_id = ?', 
                    [notaParaSalvar, aluno_id, materia_id, turma_id]
                );
            } else {
                 await connection.query(
                    'INSERT INTO notas (aluno_id, materia_id, turma_id, nota_rec) VALUES (?, ?, ?, ?)',
                    [aluno_id, materia_id, turma_id, notaParaSalvar]
                );
            }
        } else {
            if (!avaliacao_id) {
                return res.status(400).json({ message: 'ID da avaliação é obrigatório para nota regular.' });
            }
            const [avaliacaoRows] = await connection.query<RowDataPacket[]>('SELECT valor FROM avaliacoes WHERE id = ?', [avaliacao_id]);
            if (avaliacaoRows.length === 0) throw new Error('Avaliação não encontrada.');
            
            const valorMaximo = parseFloat(avaliacaoRows[0].valor);
            let notaFinalParaSalvar = notaParaSalvar;

            if (notaParaSalvar !== null && notaParaSalvar > valorMaximo) {
                notaFinalParaSalvar = valorMaximo;
            }
            
            await connection.query(
                `INSERT INTO notas (aluno_id, avaliacao_id, nota, materia_id, turma_id) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE nota = VALUES(nota)`,
                [aluno_id, avaliacao_id, notaFinalParaSalvar, materia_id, turma_id]
            );
        }
        
        await notificarNotaLancada(aluno_id);
        await connection.commit();
        res.status(200).json({ message: 'Nota salva com sucesso.' });

    } catch (error: any) {
        await connection.rollback();
        console.error("Erro ao salvar nota:", error);
        res.status(500).json({ message: error.message || 'Erro interno ao salvar a nota.' });
    } finally {
        connection.release();
    }
};
