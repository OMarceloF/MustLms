// src/controllers/avaliacoesNotasController.ts

import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { notificarNotaLancada } from './notificacoesEventosController';

// --- Interfaces (sem alterações) ---
interface Avaliacao extends RowDataPacket {
  id: number;
  descricao: string;
  valor: number;
  data_inicio: string;
  data_fim: string | null;
}

interface AlunoComNotas {
    aluno_id: number;
    aluno_nome: string;
    aluno_foto: string | null;
    matricula?: string;
    status_aluno?: 'ativo' | 'inativo';
    notas: { avaliacao_id: number; nota: number | null }[];
    media_final: number;
    status: 'Aprovado' | 'Recuperação' | 'Reprovado' | 'Pendente';
    nota_recuperacao: number | null;
    nota_final: number;
}

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
// LÓGICA CENTRAL DE NOTAS E STATUS (COM CORREÇÃO)
// =======================================================================
export const getDadosAcademicosCompletos = async (req: Request, res: Response) => {
    const { turmaId, materiaId, calendarioId } = req.params;
    try {
        const [alunos] = await pool.query<RowDataPacket[]>(
            `SELECT u.id, u.nome, u.foto_url, a.matricula, u.status as status_aluno
             FROM users u 
             JOIN alunos_turmas at ON u.id = at.aluno_id 
             JOIN alunos a ON u.id = a.id
             WHERE at.turma_id = ? AND at.status_vinculo = 'ativo'
             ORDER BY u.nome`,
            [turmaId]
        );

        if (alunos.length === 0) {
            return res.status(200).json({ avaliacoes: [], alunosComNotas: [] });
        }

        const [avaliacoes] = await pool.query<Avaliacao[]>(
            'SELECT id, descricao, valor, DATE_FORMAT(data_inicio, "%Y-%m-%d") as data_inicio, DATE_FORMAT(data_fim, "%Y-%m-%d") as data_fim FROM avaliacoes WHERE turma_id = ? AND materia_id = ? AND calendario_id = ? ORDER BY data_inicio',
            [turmaId, materiaId, calendarioId]
        );

        const alunoIds = alunos.map(a => a.id);
        if (alunoIds.length === 0) {
             return res.status(200).json({ avaliacoes, alunosComNotas: [] });
        }
        
        const [notas] = await pool.query<RowDataPacket[]>(
            `SELECT aluno_id, avaliacao_id, nota, nota_rec 
             FROM notas
             WHERE aluno_id IN (?) AND materia_id = ? AND turma_id = ?`,
            [alunoIds, materiaId, turmaId]
        );
        
        const notasMap = new Map(notas.map(n => [`${n.aluno_id}-${n.avaliacao_id}`, parseFloat(n.nota)]));
        const recMap = new Map<number, number>();
        notas.forEach(n => {
            if (n.nota_rec !== null) {
                const currentRec = recMap.get(n.aluno_id) || 0;
                recMap.set(n.aluno_id, Math.max(currentRec, parseFloat(n.nota_rec)));
            }
        });

        const resultadoFinal: AlunoComNotas[] = alunos.map(aluno => {
            let media_final = 0;
            const notasDoAluno = avaliacoes.map(av => {
                const nota = notasMap.get(`${aluno.id}-${av.id}`) ?? null;
                if (nota !== null) media_final += nota;
                return { avaliacao_id: av.id, nota };
            });

            if (media_final > 100) {
                media_final = 100;
            }

            const nota_recuperacao = recMap.get(aluno.id) ?? null;
            let status: AlunoComNotas['status'] = 'Pendente';
            let nota_final = media_final;

            const MEDIA_APROVACAO = 60;
            const MEDIA_RECUPERACAO = 40;

            const temAvaliacoes = avaliacoes.length > 0;
            const temNotasLancadas = notasDoAluno.some(n => n.nota !== null);

            if (temAvaliacoes && temNotasLancadas) {
                if (media_final >= MEDIA_APROVACAO) {
                    status = 'Aprovado';
                } else if (media_final >= MEDIA_RECUPERACAO) {
                    status = 'Recuperação';
                    if (nota_recuperacao !== null) {
                        if (nota_recuperacao > media_final) {
                            nota_final = nota_recuperacao;
                        }
                        status = nota_final >= MEDIA_APROVACAO ? 'Aprovado' : 'Reprovado';
                    }
                } else {
                    status = 'Reprovado';
                }
            }

            return {
                aluno_id: aluno.id, 
                aluno_nome: aluno.nome, 
                aluno_foto: aluno.foto_url,
                matricula: aluno.matricula,
                status_aluno: aluno.status_aluno,
                notas: notasDoAluno, 
                media_final: parseFloat(media_final.toFixed(1)), 
                status, 
                nota_recuperacao, 
                nota_final: parseFloat(nota_final.toFixed(1))
            };
        });

        res.status(200).json({ avaliacoes, alunosComNotas: resultadoFinal });
    } catch (error) {
        console.error("Erro ao buscar dados acadêmicos completos:", error);
        res.status(500).json({ message: 'Erro interno ao processar os dados acadêmicos.' });
    }
};

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
                // A linha do toast foi removida daqui
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
