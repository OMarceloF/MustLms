import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import pool from '../config/db'; // Verifique se o caminho para seu pool de conexão está correto

// =================================================================================
// FUNÇÕES DO NOVO FLUXO DE MATRÍCULA
// =================================================================================

/**
 * @route   GET /api/alunos/buscar-por-cpf/:cpf
 * @desc    Busca um aluno existente pelo CPF para o formulário de matrícula.
 */
export const buscarAlunoPorCPF = async (req: Request, res: Response) => {
    const { cpf } = req.params;
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
        return res.status(400).json({ message: 'Formato de CPF inválido.' });
    }

    try {
        const [rows]: any[] = await pool.execute('SELECT * FROM alunos WHERE cpf = ?', [cleanCpf]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }
        
        const aluno = rows[0];
        const alunoEncontrado = {
            id: aluno.id,
            nome: aluno.nome,
            cpf: aluno.cpf,
            rg: aluno.rg,
            matricula: aluno.matricula,
            email: aluno.email,
            telefone: aluno.telefone,
            data_nascimento: aluno.data_nascimento,
            foto: aluno.foto || null,
        };
        res.status(200).json(alunoEncontrado);
    } catch (error) {
        console.error('Erro ao buscar aluno por CPF:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @route   POST /api/alunos
 * @route   PUT /api/alunos/:id
 * @desc    Cria um novo aluno ou atualiza um existente a partir do formulário de matrícula.
 */
export const criarOuAtualizarAluno = async (req: Request, res: Response) => {
    const { id: alunoId } = req.params;
    const {
        nome, cpf, rg, matricula, data_nascimento, email, telefone, sexo,
        contato_responsaveis, biografia, restricoes_medicas, login, senha,
        aluno_e_responsavel
    } = req.body;

    const foto = req.file;
    const fotoPath = foto ? `/uploads/${foto.filename}` : (req.body.fotoUrl || null);

    if (!nome || !cpf || !rg || !matricula || !email || !login || (!alunoId && !senha)) {
        return res.status(400).json({ message: 'Campos obrigatórios estão faltando.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        let userId = alunoId ? parseInt(alunoId, 10) : null;
        const cleanCpf = cpf.replace(/\D/g, '');

        if (userId) { // --- LÓGICA DE ATUALIZAÇÃO ---
            let userQuery = 'UPDATE users SET login = ?, email = ?, nome = ?, cpf = ?, telefone = ?';
            const userParams: any[] = [login, email, nome, cleanCpf, telefone];
            if (fotoPath) {
                userQuery += ', foto_url = ?';
                userParams.push(fotoPath);
            }
            userQuery += ' WHERE id = ?';
            userParams.push(userId);
            await connection.execute(userQuery, userParams);

            const alunoQuery = `UPDATE alunos SET nome = ?, cpf = ?, rg = ?, matricula = ?, data_nascimento = ?, email = ?, telefone = ?, genero = ?, contato_responsaveis = ?, biografia = ?, restricoes_medicas = ?, foto = ? WHERE id = ?`;
            await connection.execute(alunoQuery, [nome, cleanCpf, rg, matricula, data_nascimento, email, telefone, sexo, contato_responsaveis, biografia, restricoes_medicas, fotoPath, userId]);
        
        } else { // --- LÓGICA DE CRIAÇÃO ---
            const senhaHash = await bcrypt.hash(senha, 10);
            const userSql = `INSERT INTO users (login, senha, email, role, nome, cpf, telefone, foto_url) VALUES (?, ?, ?, 'aluno', ?, ?, ?, ?)`;
            const [userResult]: any = await connection.execute(userSql, [login, senhaHash, email, nome, cleanCpf, telefone, fotoPath]);
            userId = userResult.insertId;

            const alunoSql = `INSERT INTO alunos (id, nome, cpf, rg, matricula, data_nascimento, email, telefone, genero, contato_responsaveis, biografia, restricoes_medicas, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await connection.execute(alunoSql, [userId, nome, cleanCpf, rg, matricula, data_nascimento, email, telefone, sexo, contato_responsaveis, biografia, restricoes_medicas, fotoPath]);
        }

        if (aluno_e_responsavel === 'true') {
            const [respRows]: any[] = await connection.execute('SELECT id FROM responsaveis WHERE cpf = ?', [cleanCpf]);
            let responsavelId;
            if (respRows.length > 0) {
                responsavelId = respRows[0].id;
                await connection.execute("UPDATE responsaveis SET responsavel_financeiro = 'Sim' WHERE id = ?", [responsavelId]);
            } else {
                const [newResp]: any = await connection.execute(`INSERT INTO responsaveis (nome, cpf, email, numero1, responsavel_financeiro, grau_parentesco) VALUES (?, ?, ?, ?, 'Sim', 'Próprio Aluno')`, [nome, cleanCpf, email, telefone]);
                responsavelId = newResp.insertId;
            }
            await connection.execute('INSERT INTO alunos_responsaveis (aluno_id, responsavel_id, parentesco) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE parentesco = VALUES(parentesco)', [userId, responsavelId, 'Próprio Aluno']);
        }

        await connection.commit();
        res.status(201).json({ id: userId, message: `Aluno ${alunoId ? 'atualizado' : 'criado'} com sucesso.` });
    } catch (error: any) {
        await connection.rollback();
        console.error('Erro ao salvar dados do aluno:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'O CPF ou Login informado já está cadastrado no sistema.' });
        }
        res.status(500).json({ message: 'Erro interno ao salvar os dados do aluno.' });
    } finally {
        if (connection) connection.release();
    }
};

// =================================================================================
// FUNÇÕES DE CRUD E CONSULTA JÁ EXISTENTES NO SISTEMA
// (Estas são as funções que estavam faltando e causando os erros de importação)
// =================================================================================

export const getAlunoById = async (req: Request, res: Response) => {
    // Implemente a lógica para buscar um aluno pelo ID
    res.status(200).json({ message: `Lógica para getAlunoById com id ${req.params.id}` });
};

export const listarAlunos = async (req: Request, res: Response) => {
    // Implemente a lógica para listar todos os alunos
    res.status(200).json({ message: 'Lógica para listarAlunos' });
};

export const getAlunoEditData = async (req: Request, res: Response) => {
    // Implemente a lógica para obter dados de edição do aluno
    res.status(200).json({ message: `Lógica para getAlunoEditData com id ${req.params.id}` });
};

export const excluirAluno = async (req: Request, res: Response) => {
    // Implemente a lógica para excluir um aluno
    res.status(200).json({ message: `Lógica para excluirAluno com id ${req.params.id}` });
};

export const getMensalidadeByAluno = async (req: Request, res: Response) => {
    // Implemente a lógica para buscar mensalidade do aluno
    res.status(200).json({ message: `Lógica para getMensalidadeByAluno com id ${req.params.id}` });
};

export const getDescontoByAluno = async (req: Request, res: Response) => {
    // Implemente a lógica para buscar desconto do aluno
    res.status(200).json({ message: `Lógica para getDescontoByAluno com id ${req.params.id}` });
};

export const getResponsaveisByAluno = async (req: Request, res: Response) => {
    // Implemente a lógica para buscar responsáveis do aluno
    res.status(200).json({ message: `Lógica para getResponsaveisByAluno com id ${req.params.id}` });
};

export const getDadosAcademicosDoAluno = async (req: Request, res: Response) => {
    // Implemente a lógica para buscar dados acadêmicos
    res.status(200).json({ message: `Lógica para getDadosAcademicosDoAluno com id ${req.params.id}` });
};

export const importarUsersLote = async (req: Request, res: Response) => {
    // Implemente a lógica para importação em lote
    res.status(200).json({ message: 'Lógica para importarUsersLote' });
};

export const updateAluno = async (req: Request, res: Response) => {
    // Implemente a lógica de atualização geral do aluno
    res.status(200).json({ message: `Lógica para updateAluno com id ${req.params.id}` });
};

export const getAlunoDashboardData = async (req: Request, res: Response) => {
    // Implemente a lógica para dados do dashboard do aluno
    res.status(200).json({ message: `Lógica para getAlunoDashboardData com id ${req.params.id}` });
};

export const getPerfilUsuario = async (req: Request, res: Response) => {
    // Implemente a lógica para buscar o perfil do usuário
    res.status(200).json({ message: `Lógica para getPerfilUsuario com id ${req.params.id}` });
};
