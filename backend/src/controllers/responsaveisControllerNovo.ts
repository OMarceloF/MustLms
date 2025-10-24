// backend/src/controllers/responsaveisControllerNovo.ts
import { Request, Response } from 'express';
import pool from '../config/db';

const apenasDigitos = (valor: string | null | undefined): string => {
    return valor ? String(valor).replace(/\D/g, '') : '';
};

export const criarResponsavelEAssociar = async (req: Request, res: Response) => {
    const { alunoId } = req.params;
    const {
        nomeResponsavel, cpf, rg, email, grauParentesco, estadoCivil, numero1, numero2,
        telefoneContato, nacionalidade, profissao, logradouro, numeroEndereco, bairro,
        cidade, cep, responsavelFinanceiro
    } = req.body;

    if (!alunoId || !nomeResponsavel || !cpf || !rg) {
        return res.status(400).json({ error: 'Campos obrigatórios (alunoId, nome, cpf, rg) estão faltando.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existente]: any[] = await connection.execute(
            'SELECT id FROM responsaveis WHERE cpf = ? OR email = ?',
            [apenasDigitos(cpf), email]
        );
        if (existente.length > 0) {
            throw new Error('CPF ou E-mail já cadastrado para outro responsável.');
        }

        if (responsavelFinanceiro === true) {
            await connection.execute(
                `UPDATE responsaveis r JOIN alunos_responsaveis ar ON r.id = ar.responsavel_id SET r.responsavel_financeiro = 'Não' WHERE ar.aluno_id = ?`,
                [alunoId]
            );
        }
        
        // A query INSERT não inclui a coluna 'id', deixando o AUTO_INCREMENT trabalhar.
        const [result]: any = await connection.execute(
            `INSERT INTO responsaveis (nome, cpf, rg, email, grau_parentesco, estado_civil, numero1, numero2, telefone_contato, nacionalidade, profissao, logradouro, numero_casa, bairro, cidade, cep, responsavel_financeiro)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nomeResponsavel, apenasDigitos(cpf), apenasDigitos(rg), email, grauParentesco, estadoCivil,
                apenasDigitos(numero1), apenasDigitos(numero2), apenasDigitos(telefoneContato),
                nacionalidade, profissao, logradouro, numeroEndereco, bairro, cidade, apenasDigitos(cep),
                responsavelFinanceiro === true ? 'Sim' : 'Não'
            ]
        );
        const responsavelId = result.insertId;

        await connection.execute(
            'INSERT INTO alunos_responsaveis (aluno_id, responsavel_id, parentesco) VALUES (?, ?, ?)',
            [alunoId, responsavelId, grauParentesco]
        );

        await connection.commit();

        const [rows]: any = await connection.execute('SELECT r.*, ar.id as vinculo_id FROM responsaveis r JOIN alunos_responsaveis ar ON r.id = ar.responsavel_id WHERE r.id = ? AND ar.aluno_id = ?', [responsavelId, alunoId]);
        res.status(201).json({ message: 'Responsável criado e vinculado com sucesso!', responsavel: rows[0] });

    } catch (error: any) {
        await connection.rollback();
        console.error("Erro ao criar responsável:", error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor ao criar responsável.' });
    } finally {
        connection.release();
    }
};

// ... (O resto das funções: updateResponsavel, listarResponsaveisPorAluno, etc., permanecem as mesmas)
export const updateResponsavel = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        nomeResponsavel, cpf, rg, email, grauParentesco, estadoCivil, numero1, numero2,
        telefoneContato, nacionalidade, profissao, logradouro, numeroEndereco, bairro,
        cidade, cep, responsavelFinanceiro, id_aluno1
    } = req.body;

    if (!id_aluno1) {
        return res.status(400).json({ error: 'O ID do aluno (id_aluno1) é necessário para o contexto da atualização.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existente]: any[] = await connection.execute(
            'SELECT id FROM responsaveis WHERE (cpf = ? OR email = ?) AND id != ?',
            [apenasDigitos(cpf), email, id]
        );
        if (existente.length > 0) {
            throw new Error('CPF ou E-mail já cadastrado para outro responsável.');
        }

        if (responsavelFinanceiro === true) {
            await connection.execute(
                `UPDATE responsaveis r JOIN alunos_responsaveis ar ON r.id = ar.responsavel_id SET r.responsavel_financeiro = 'Não' WHERE ar.aluno_id = ? AND r.id != ?`,
                [id_aluno1, id]
            );
        }

        const sql = `
            UPDATE responsaveis SET
                nome = ?, cpf = ?, rg = ?, email = ?, grau_parentesco = ?, estado_civil = ?,
                numero1 = ?, numero2 = ?, telefone_contato = ?, nacionalidade = ?, profissao = ?,
                logradouro = ?, numero_casa = ?, bairro = ?, cidade = ?, cep = ?,
                responsavel_financeiro = ?
            WHERE id = ?`;

        await connection.execute(sql, [
            nomeResponsavel, apenasDigitos(cpf), apenasDigitos(rg), email, grauParentesco, estadoCivil,
            apenasDigitos(numero1), apenasDigitos(numero2), apenasDigitos(telefoneContato),
            nacionalidade, profissao, logradouro, numeroEndereco, bairro, cidade, apenasDigitos(cep),
            responsavelFinanceiro === true ? 'Sim' : 'Não',
            id
        ]);

        await connection.commit();
        res.status(200).json({ message: 'Responsável atualizado com sucesso!' });

    } catch (error: any) {
        await connection.rollback();
        console.error("Erro ao atualizar responsável:", error);
        res.status(500).json({ error: error.message || 'Erro interno do servidor ao atualizar responsável.' });
    } finally {
        connection.release();
    }
};

export const listarResponsaveisPorAluno = async (req: Request, res: Response) => {
    const { alunoId } = req.params;
    try {
        const [rows] = await pool.execute(
            `SELECT r.*, ar.id as vinculo_id FROM responsaveis r
             JOIN alunos_responsaveis ar ON r.id = ar.responsavel_id
             WHERE ar.aluno_id = ?`,
            [alunoId]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar responsáveis:", error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

export const desvincularResponsavel = async (req: Request, res: Response) => {
    const { vinculoId } = req.params;
    try {
        const [result]: any = await pool.execute('DELETE FROM alunos_responsaveis WHERE id = ?', [vinculoId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vínculo não encontrado.' });
        }
        res.status(200).json({ message: 'Responsável desvinculado com sucesso.' });
    } catch (error) {
        console.error("Erro ao desvincular responsável:", error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

export const buscarResponsavelPorCPF = async (req: Request, res: Response) => {
    const { cpf } = req.params;
    const cpfLimpo = apenasDigitos(cpf);
    if (cpfLimpo.length !== 11) {
        return res.status(400).json({ message: 'Formato de CPF inválido.' });
    }
    try {
        const [rows]: any[] = await pool.execute('SELECT * FROM responsaveis WHERE cpf = ?', [cpfLimpo]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Responsável não encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar responsável por CPF:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

export const vincularResponsavel = async (req: Request, res: Response) => {
    const { alunoId, responsavelId, parentesco } = req.body;
    try {
        await pool.execute(
            'INSERT INTO alunos_responsaveis (aluno_id, responsavel_id, parentesco) VALUES (?, ?, ?)',
            [alunoId, responsavelId, parentesco]
        );
        res.status(201).json({ message: 'Responsável vinculado com sucesso.' });
    } catch (error) {
        console.error("Erro ao vincular responsável:", error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

export const getAlunosDoResponsavel = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute(
            `SELECT a.* FROM alunos a JOIN alunos_responsaveis ar ON a.id = ar.aluno_id WHERE ar.responsavel_id = ?`,
            [id]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao buscar alunos do responsável:", error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

export const getResponsavelById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows]: any[] = await pool.execute('SELECT * FROM responsaveis WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Responsável não encontrado.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar responsável por ID:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};
