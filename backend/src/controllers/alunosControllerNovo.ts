import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';

// =================================================================================
// FUNÇÕES DO FLUXO DE MATRÍCULA E EDIÇÃO
// =================================================================================

/**
 * @route   GET /api/alunos/buscar-por-cpf/:cpf
 * @desc    Busca um aluno existente pelo CPF para o formulário de matrícula.
 */
export const buscarAlunoPorCPF = async (req: Request, res: Response) => {
    const { cpf } = req.params;
    const cleanCpf = String(cpf).replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
        return res.status(400).json({ message: 'Formato de CPF inválido.' });
    }

    try {
        const [rows]: any[] = await pool.execute(
            `SELECT 
                u.id, 
                u.nome, 
                u.cpf, 
                u.email, 
                u.telefone,
                u.foto_url as foto,
                u.login,
                a.rg, 
                a.matricula, 
                a.data_nascimento, 
                a.genero,
                a.biografia,
                a.restricoes_medicas,
                a.endereco 
             FROM users u
             JOIN alunos a ON u.id = a.id 
             WHERE u.cpf = ? AND u.status = 'ativo'`,
            [cleanCpf]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }
        
        const aluno = rows[0];
        try {
            aluno.endereco = aluno.endereco ? JSON.parse(aluno.endereco) : {};
        } catch (e) {
            aluno.endereco = {};
        }
        
        res.status(200).json(aluno);

    } catch (error) {
        console.error('Erro ao buscar aluno por CPF:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

/**
 * @route   POST /api/alunos
 * @route   PUT /api/alunos/:id
 * @desc    Cria um novo aluno ou atualiza um existente.
 */
export const criarOuAtualizarAluno = async (req: Request, res: Response) => {
    const { id: alunoId } = req.params;
    const {
        nome, cpf, rg, matricula, data_nascimento, email, telefone, sexo,
        biografia, restricoes_medicas, login, senha,
        aluno_e_responsavel,
        endereco,
        fotoUrl
    } = req.body;

    const foto = req.file;
    const fotoPath = foto ? `/uploads/${foto.filename}` : (fotoUrl || null);

    if (!nome || !cpf || !rg || !matricula || !email || !login || (!alunoId && !senha)) {
        return res.status(400).json({ message: 'Campos obrigatórios estão faltando.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        let userId = alunoId ? parseInt(alunoId, 10) : null;
        const cleanCpf = String(cpf).replace(/\D/g, '');
        const cleanRg = String(rg).replace(/\D/g, '');
        const sexoFormatado = sexo === 'Masculino' ? 'Masculino' : (sexo === 'Feminino' ? 'Feminino' : null);
        const enderecoJson = typeof endereco === 'string' ? endereco : (endereco ? JSON.stringify(endereco) : null);

        const [cpfExistente]: any[] = await connection.execute(
            'SELECT id FROM users WHERE cpf = ? AND id != ?',
            [cleanCpf, userId || 0]
        );
        if (cpfExistente.length > 0) {
            throw new Error('O CPF informado já está cadastrado em nosso sistema.');
        }

        const [rgExistente]: any[] = await connection.execute(
            'SELECT id FROM alunos WHERE rg = ? AND id != ?',
            [cleanRg, userId || 0]
        );
        if (rgExistente.length > 0) {
            throw new Error('O RG informado já está cadastrado em nosso sistema.');
        }

        if (userId) { // --- LÓGICA DE ATUALIZAÇÃO ---
            let userQuery = 'UPDATE users SET login = ?, email = ?, nome = ?, cpf = ?, telefone = ?';
            const userParams: any[] = [login, email, nome, cleanCpf, telefone];
            if (senha) {
                const senhaHash = await bcrypt.hash(senha, 10);
                userQuery += ', senha = ?';
                userParams.push(senhaHash);
            }
            if (foto) {
                userQuery += ', foto_url = ?';
                userParams.push(fotoPath);
            }
            userQuery += ' WHERE id = ?';
            userParams.push(userId);
            await connection.execute(userQuery, userParams);

            const alunoQuery = `UPDATE alunos SET nome = ?, cpf = ?, rg = ?, matricula = ?, data_nascimento = ?, email = ?, telefone = ?, genero = ?, biografia = ?, restricoes_medicas = ?, endereco = ? WHERE id = ?`;
            await connection.execute(alunoQuery, [nome, cleanCpf, cleanRg, matricula, data_nascimento, email, telefone, sexoFormatado, biografia, restricoes_medicas, enderecoJson, userId]);
        
        } else { // --- LÓGICA DE CRIAÇÃO ---
            const senhaHash = await bcrypt.hash(senha, 10);
            const userSql = `INSERT INTO users (login, senha, email, role, nome, cpf, telefone, foto_url) VALUES (?, ?, ?, 'aluno', ?, ?, ?, ?)`;
            const [userResult]: any = await connection.execute(userSql, [login, senhaHash, email, nome, cleanCpf, telefone, fotoPath]);
            userId = userResult.insertId;

            const alunoSql = `INSERT INTO alunos (id, nome, cpf, rg, matricula, data_nascimento, email, telefone, genero, biografia, restricoes_medicas, foto, endereco) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await connection.execute(alunoSql, [userId, nome, cleanCpf, cleanRg, matricula, data_nascimento, email, telefone, sexoFormatado, biografia, restricoes_medicas, fotoPath, enderecoJson]);
        }

        if (aluno_e_responsavel === 'true' && userId) {
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
        res.status(201).json({ 
            id: userId, 
            message: `Aluno ${alunoId ? 'atualizado' : 'criado'} com sucesso.`,
            fotoUrl: fotoPath
        });
    } catch (error: any) {
        await connection.rollback();
        console.error('Erro ao salvar dados do aluno:', error);
        if (error.message.includes('CPF') || error.message.includes('RG') || error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: error.message || 'O CPF, RG, Login ou E-mail informado já está cadastrado no sistema.' });
        }
        res.status(500).json({ message: 'Erro interno ao salvar os dados do aluno.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @route   GET /api/alunos/:id/edit-data
 * @desc    Busca todos os dados agregados de um aluno para a página de edição.
 */
export const getAlunoEditData = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'ID do aluno é obrigatório.' });
    }

    const connection = await pool.getConnection();

    try {
        // 1. Buscar dados principais do aluno
        const [alunoRows]: any[] = await connection.execute(
            `SELECT 
                u.nome, u.email, u.login, u.foto_url, u.telefone,
                a.matricula, a.cpf, a.rg, a.data_nascimento, a.genero, a.endereco
             FROM users u
             JOIN alunos a ON u.id = a.id
             WHERE u.id = ?`,
            [id]
        );

        if (alunoRows.length === 0) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }
        const alunoData = alunoRows[0];

        // 2. Buscar responsáveis vinculados
        const [responsaveisRows]: any[] = await connection.execute(
            `SELECT r.id, r.nome, r.cpf, r.email, r.numero1 as telefone, r.grau_parentesco, r.responsavel_financeiro
             FROM responsaveis r
             JOIN alunos_responsaveis ar ON r.id = ar.responsavel_id
             WHERE ar.aluno_id = ?
             ORDER BY r.responsavel_financeiro DESC, r.id ASC`,
            [id]
        );

        // 3. Buscar documentos do aluno
        const [documentosRows]: any[] = await connection.execute(
            `SELECT id, tipo_documento, caminho_arquivo, nome_original, data_upload 
             FROM documentos_alunos 
             WHERE aluno_id = ? 
             ORDER BY data_upload DESC`,
            [id]
        );

        // 4. Buscar contratos do aluno
        const [contratosRows]: any[] = await connection.execute(
            `SELECT 
                cp.id, 
                c.nome as nome_contrato, 
                cp.situacao_contrato, 
                cp.contrato_url, 
                cp.criado_em 
             FROM contratos_preenchidos cp
             JOIN contratos c ON cp.contrato_id = c.id
             WHERE cp.aluno_id = ?
             ORDER BY cp.criado_em DESC`,
            [id]
        );
        
        // 5. Montar o objeto de resposta final
        const responseData = {
            ...alunoData,
            endereco: alunoData.endereco ? JSON.parse(alunoData.endereco) : {},
            responsaveis: responsaveisRows,
            documentos: documentosRows,
            contratos: contratosRows,
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error("Erro ao buscar dados agregados do aluno:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar dados.' });
    } finally {
        if (connection) connection.release();
    }
};


// =================================================================================
// FUNÇÕES DE CRUD E CONSULTA (EXISTENTES)
// =================================================================================

export const getAlunoById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows]: any[] = await pool.execute(
            `SELECT a.*, u.login, u.status AS user_status
             FROM alunos a
             LEFT JOIN users u ON a.id = u.id
             WHERE a.id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }
        const aluno = rows[0];
        if (aluno.endereco) {
            try {
                aluno.endereco = JSON.parse(aluno.endereco);
            } catch (e) {
                aluno.endereco = {}; // Proteção contra JSON inválido
            }
        }
        res.status(200).json(aluno);
    } catch (error) {
        console.error('Erro ao buscar aluno por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

export const listarAlunos = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.execute(
            `SELECT a.id, u.nome, a.matricula, a.serie, a.turma, u.email, u.telefone, a.status 
             FROM alunos a
             JOIN users u ON a.id = u.id
             WHERE u.status = 'ativo'
             ORDER BY u.nome ASC`
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

export const excluirAluno = async (req: Request, res: Response) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute("UPDATE alunos SET status = 'inativo' WHERE id = ?", [id]);
        await connection.execute("UPDATE users SET status = 'inativo' WHERE id = ?", [id]);
        await connection.commit();
        res.status(200).json({ message: 'Aluno desativado com sucesso.' });
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao desativar aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        connection.release();
    }
};

export const getResponsaveisByAluno = async (req: Request, res: Response) => {
    const { id } = req.params; // id do aluno
    try {
        const [rows] = await pool.execute(
            `SELECT r.* 
             FROM responsaveis r
             JOIN alunos_responsaveis ar ON r.id = ar.responsavel_id
             WHERE ar.aluno_id = ?`,
            [id]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar responsáveis do aluno:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Funções stub (não implementadas ou delegadas)
export const getMensalidadeByAluno = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const getDescontoByAluno = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const getDadosAcademicosDoAluno = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const importarUsersLote = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const updateAluno = async (req: Request, res: Response) => criarOuAtualizarAluno(req, res);
export const getAlunoDashboardData = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const getPerfilUsuario = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
