// src/controllers/alunosControllerNovo.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import fs from 'fs/promises';
import path from 'path';

// =======================================================================
// INTERFACES PARA TIPAGEM
// =======================================================================
interface NotaDetalhe {
    tipo: string;
    valor: number;
    nota: number | null;
}

interface DisciplinaAcademica {
    id: number;
    nome: string;
    notas: NotaDetalhe[];
    nota_final: number;
    nota_recuperacao: number | null;
    status: 'Aprovado' | 'Reprovado' | 'Pendente';
}

// =======================================================================
// FUNÇÃO AUXILIAR PARA GERAR MATRÍCULA
// =======================================================================
async function gerarProximaMatricula(): Promise<string> {
    const anoAtual = new Date().getFullYear();
    const prefixoAno = String(anoAtual);

    const connection = await pool.getConnection();
    try {
        // Busca a maior matrícula que começa com o ano atual.
        const [rows]: any[] = await connection.execute(
            "SELECT MAX(matricula) as ultimaMatricula FROM alunos WHERE matricula LIKE ?",
            [`${prefixoAno}%`]
        );

        let proximoNumero = 1; // Padrão se não houver nenhuma matrícula no ano.

        if (rows.length > 0 && rows[0].ultimaMatricula) {
            const ultimaMatricula = rows[0].ultimaMatricula;
            // Extrai a parte sequencial (os últimos 6 dígitos) e converte para número.
            const ultimoSequencial = parseInt(ultimaMatricula.substring(4), 10);
            proximoNumero = ultimoSequencial + 1;
        }

        // Formata o próximo número para ter 6 dígitos, preenchendo com zeros à esquerda.
        const proximoSequencialFormatado = String(proximoNumero).padStart(6, '0');

        return `${prefixoAno}${proximoSequencialFormatado}`;

    } finally {
        if (connection) connection.release();
    }
}


/**
 * @route   POST /api/alunos
 * @route   PUT /api/alunos/:id
 * @desc    Cria um novo aluno ou atualiza um existente.
 */
export const criarOuAtualizarAluno = async (req: Request, res: Response) => {
    const { id: alunoId } = req.params;
    // 'matricula' é removida do body, pois será gerada automaticamente ou já existe.
    const {
        nome, cpf, rg, data_nascimento, email, telefone, sexo,
        biografia, restricoes_medicas, login, senha,
        aluno_e_responsavel,
        endereco,
        fotoUrl
    } = req.body;

    const foto = req.file;
    const fotoPath = foto ? `/uploads/${foto.filename}` : (fotoUrl || null);

    if (!nome || !cpf || !rg || !email || !login || (!alunoId && !senha)) {
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

        // Verificações de unicidade (CPF, RG)
        const [cpfExistente]: any[] = await connection.execute('SELECT id FROM users WHERE cpf = ? AND id != ?', [cleanCpf, userId || 0]);
        if (cpfExistente.length > 0) throw new Error('O CPF informado já está cadastrado em nosso sistema.');
        const [rgExistente]: any[] = await connection.execute('SELECT id FROM alunos WHERE rg = ? AND id != ?', [cleanRg, userId || 0]);
        if (rgExistente.length > 0) throw new Error('O RG informado já está cadastrado em nosso sistema.');


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

            // A matrícula não é alterada na atualização.
            const alunoQuery = `UPDATE alunos SET nome = ?, cpf = ?, rg = ?, data_nascimento = ?, email = ?, telefone = ?, genero = ?, biografia = ?, restricoes_medicas = ?, endereco = ? WHERE id = ?`;
            await connection.execute(alunoQuery, [nome, cleanCpf, cleanRg, data_nascimento, email, telefone, sexoFormatado, biografia, restricoes_medicas, enderecoJson, userId]);
        
        } else { // --- LÓGICA DE CRIAÇÃO ---
            // Gerando a matrícula automaticamente
            const novaMatricula = await gerarProximaMatricula();

            const senhaHash = await bcrypt.hash(senha, 10);
            const userSql = `INSERT INTO users (login, senha, email, role, nome, cpf, telefone, foto_url) VALUES (?, ?, ?, 'aluno', ?, ?, ?, ?)`;
            const [userResult]: any = await connection.execute(userSql, [login, senhaHash, email, nome, cleanCpf, telefone, fotoPath]);
            userId = userResult.insertId;

            // Inserindo o aluno com a matrícula gerada
            const alunoSql = `INSERT INTO alunos (id, nome, cpf, rg, matricula, data_nascimento, email, telefone, genero, biografia, restricoes_medicas, foto, endereco) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await connection.execute(alunoSql, [userId, nome, cleanCpf, cleanRg, novaMatricula, data_nascimento, email, telefone, sexoFormatado, biografia, restricoes_medicas, fotoPath, enderecoJson]);
        }

        // Lógica para aluno ser o próprio responsável
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

export const buscarAlunoPorCPF = async (req: Request, res: Response) => {
    const { cpf } = req.params;
    const cleanCpf = String(cpf).replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
        return res.status(400).json({ message: 'Formato de CPF inválido.' });
    }

    try {
        const [rows]: any[] = await pool.execute(
            `SELECT 
                u.id, u.nome, u.cpf, u.email, u.telefone, u.foto_url as foto, u.login,
                a.rg, a.matricula, a.data_nascimento, a.genero, a.biografia,
                a.restricoes_medicas, a.endereco 
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

export const getAlunoEditData = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: 'ID do aluno é obrigatório.' });
    }

    const connection = await pool.getConnection();

    try {
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

        const [responsaveisRows]: any[] = await connection.execute(
            `SELECT r.id, r.nome, r.cpf, r.email, r.numero1 as telefone, r.grau_parentesco, r.responsavel_financeiro
             FROM responsaveis r
             JOIN alunos_responsaveis ar ON r.id = ar.responsavel_id
             WHERE ar.aluno_id = ?
             ORDER BY r.responsavel_financeiro DESC, r.id ASC`,
            [id]
        );

        const [documentosRows]: any[] = await connection.execute(
            `SELECT id, tipo_documento, caminho_arquivo, nome_original, data_upload 
             FROM documentos_alunos 
             WHERE aluno_id = ? 
             ORDER BY data_upload DESC`,
            [id]
        );

        const [contratosRows]: any[] = await connection.execute(
            `SELECT 
                cp.id, c.nome as nome_contrato, cp.situacao_contrato, 
                cp.contrato_url, cp.criado_em 
             FROM contratos_preenchidos cp
             JOIN contratos c ON cp.contrato_id = c.id
             WHERE cp.aluno_id = ?
             ORDER BY cp.criado_em DESC`,
            [id]
        );
        
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
                aluno.endereco = {};
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
        const query = `
            SELECT 
                u.id, 
                u.nome, 
                u.email,
                u.foto_url as foto,
                a.matricula, 
                a.status,
                cpg.nome AS curso_nome,
                ti.nome AS turma_ingresso_nome
            FROM users u
            JOIN alunos a ON u.id = a.id
            LEFT JOIN vincular_aluno_curso vac ON u.id = vac.aluno_id
            LEFT JOIN cursos_posgraduacao cpg ON vac.curso_posgraduacao_id = cpg.id
            LEFT JOIN turmas_ingresso ti ON vac.turmas_ingresso_id = ti.id
            WHERE u.role = 'aluno' AND u.status = 'ativo'
            GROUP BY u.id
            ORDER BY u.nome ASC;
        `;

        const [rows] = await pool.execute(query);
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
    const { id } = req.params;
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

/**
 * @route   GET /api/alunos/:id/detalhes-completos
 * @desc    Busca todos os dados agregados de um aluno para a página de visualização.
 */
export const getDetalhesCompletosAluno = async (req: Request, res: Response) => {
    const { id: alunoId } = req.params;
    if (!alunoId) {
        return res.status(400).json({ message: 'O ID do aluno é obrigatório.' });
    }

    const connection = await pool.getConnection();
    try {
        const [alunoRows] = await connection.query<RowDataPacket[]>(`
            SELECT 
                a.id, u.nome, a.cpf, a.rg, a.matricula, u.email, u.foto_url as foto, a.biografia,
                u.telefone, a.endereco, a.data_nascimento, a.genero, a.status,
                cpg.id as curso_id, 
                cpg.nome as curso_nome,
                ti.nome as turma_ingresso_nome
            FROM alunos a
            JOIN users u ON a.id = u.id
            LEFT JOIN vincular_aluno_curso vac ON a.id = vac.aluno_id
            LEFT JOIN cursos_posgraduacao cpg ON vac.curso_posgraduacao_id = cpg.id
            LEFT JOIN turmas_ingresso ti ON vac.turmas_ingresso_id = ti.id
            WHERE a.id = ?
            ORDER BY vac.data_vinculo DESC
            LIMIT 1;
        `, [alunoId]);

        if (alunoRows.length === 0) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }
        const aluno = alunoRows[0];
        aluno.endereco = aluno.endereco ? JSON.parse(aluno.endereco) : null;

        if (!aluno.curso_id) {
            const [documentos] = await connection.query<RowDataPacket[]>('SELECT * FROM documentos_alunos WHERE aluno_id = ?', [alunoId]);
            const [contratos] = await connection.query<RowDataPacket[]>('SELECT * FROM contratos_preenchidos WHERE aluno_id = ?', [alunoId]);
            return res.status(200).json({ aluno, academico: {}, documentos, contratos });
        }

        const [disciplinasRows] = await connection.query<RowDataPacket[]>(`
            SELECT 
                d.id as disciplina_id, 
                d.nome as disciplina_nome, 
                d.semestre,
                av.descricao as avaliacao_tipo, 
                av.valor as avaliacao_valor,      
                n.nota, 
                n.nota_rec
            FROM cursos_disciplinas d
            LEFT JOIN notas n ON n.aluno_id = ? AND n.materia_id = d.id
            LEFT JOIN avaliacoes av ON n.avaliacao_id = av.id
            WHERE d.curso_id = ?
            ORDER BY d.semestre, d.nome, av.data_inicio;
        `, [alunoId, aluno.curso_id]);

        const academico = disciplinasRows.reduce((acc, row) => {
            const { semestre, disciplina_id, disciplina_nome, avaliacao_tipo, avaliacao_valor, nota, nota_rec } = row;
            const semestreKey = `Semestre ${semestre}`;
            
            if (!acc[semestreKey]) {
                acc[semestreKey] = [];
            }

            let disciplina: DisciplinaAcademica | undefined = acc[semestreKey].find(d => d.id === disciplina_id);
            if (!disciplina) {
                disciplina = { 
                    id: disciplina_id, 
                    nome: disciplina_nome, 
                    notas: [],
                    nota_final: 0,
                    nota_recuperacao: null,
                    status: 'Pendente'
                };
                acc[semestreKey].push(disciplina);
            }

            if (avaliacao_tipo && !disciplina.notas.some(n => n.tipo === avaliacao_tipo)) {
                disciplina.notas.push({
                    tipo: avaliacao_tipo,
                    valor: avaliacao_valor,
                    nota: nota !== null ? parseFloat(nota) : null,
                });
            }
            
            if (nota_rec !== null) {
                const recAtual = disciplina.nota_recuperacao || 0;
                disciplina.nota_recuperacao = Math.max(recAtual, parseFloat(nota_rec));
            }

            return acc;
        }, {} as Record<string, DisciplinaAcademica[]>);

        Object.values(academico).forEach((disciplinas: DisciplinaAcademica[]) => {
            disciplinas.forEach((disciplina: DisciplinaAcademica) => {
                const somaNotasRegulares = disciplina.notas.reduce((sum: number, n: NotaDetalhe) => sum + (n.nota || 0), 0);
                let notaFinal = somaNotasRegulares;

                if (disciplina.nota_recuperacao !== null && disciplina.nota_recuperacao > somaNotasRegulares) {
                    notaFinal = Math.min(disciplina.nota_recuperacao, 60);
                }

                disciplina.nota_final = notaFinal;

                const MEDIA_APROVACAO = 60;
                const temNotasLancadas = disciplina.notas.some((n: NotaDetalhe) => n.nota !== null);
                
                if (temNotasLancadas) {
                    disciplina.status = notaFinal >= MEDIA_APROVACAO ? 'Aprovado' : 'Reprovado';
                } else {
                    disciplina.status = 'Pendente';
                }
            });
        });

        const [documentos] = await connection.query<RowDataPacket[]>('SELECT id, tipo_documento, caminho_arquivo, nome_original, data_upload FROM documentos_alunos WHERE aluno_id = ?;', [alunoId]);
        const [contratos] = await connection.query<RowDataPacket[]>('SELECT cp.id, c.nome as nome_contrato, c.tipo, cp.situacao_contrato, cp.contrato_url, cp.criado_em FROM contratos_preenchidos cp JOIN contratos c ON cp.contrato_id = c.id WHERE cp.aluno_id = ? ORDER BY cp.criado_em DESC;', [alunoId]);

        res.status(200).json({
            aluno,
            academico,
            documentos,
            contratos
        });

    } catch (error) {
        console.error("Erro ao buscar detalhes completos do aluno:", error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @route   POST /api/alunos/:alunoId/documentos/:documentoId/atualizar
 * @desc    Atualiza um documento existente de um aluno.
 */
export const atualizarDocumentoAluno = async (req: Request, res: Response) => {
    const { alunoId, documentoId } = req.params;
    const file = req.file;

    // --- LOG 1: Verificar Parâmetros e Arquivo ---
    console.log('--- INICIANDO ATUALIZAÇÃO DE DOCUMENTO ---');
    console.log(`Recebido alunoId: ${alunoId}, documentoId: ${documentoId}`);
    if (file) {
        console.log('Arquivo recebido:', {
            filename: file.filename,
            originalname: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
        });
    } else {
        console.error('ERRO: Nenhum arquivo foi recebido no req.file.');
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // --- LOG 2: Verificar busca do documento antigo ---
        console.log('Buscando documento antigo no banco de dados...');
        const [docRows]: any[] = await connection.execute(
            'SELECT caminho_arquivo FROM documentos_alunos WHERE id = ? AND aluno_id = ?',
            [documentoId, alunoId]
        );

        if (docRows.length === 0) {
            console.error(`ERRO: Nenhum documento encontrado com id=${documentoId} para o aluno_id=${alunoId}. A atualização não pode continuar.`);
            await connection.rollback();
            return res.status(404).json({ message: 'Documento não encontrado para este aluno.' });
        }
        
        console.log('Documento antigo encontrado. Tentando excluir o arquivo físico...');
        // ... (lógica de exclusão do arquivo antigo)

        // --- LOG 3: Verificar os dados para o UPDATE ---
        const caminhoAbsolutoNovo = file.path;
        const novoCaminhoRelativo = path.relative(process.cwd(), caminhoAbsolutoNovo).replace(/\\/g, '/');
        const urlCaminhoNovo = `/${novoCaminhoRelativo}`;
        const nomeOriginal = file.originalname;

        console.log('Dados para o UPDATE:', {
            novoCaminho: urlCaminhoNovo,
            nomeOriginal: nomeOriginal,
            documentoId: documentoId,
            alunoId: alunoId,
        });

        // --- LOG 4: Executar e verificar o resultado do UPDATE ---
        console.log('Executando o comando UPDATE no banco de dados...');
        const [updateResult]: any = await connection.execute(
            `UPDATE documentos_alunos 
             SET caminho_arquivo = ?, nome_original = ?, data_upload = NOW() 
             WHERE id = ? AND aluno_id = ?`,
            [urlCaminhoNovo, nomeOriginal, documentoId, alunoId]
        );

        console.log('Resultado do UPDATE:', updateResult);
        if (updateResult.affectedRows === 0) {
            console.error('AVISO: O comando UPDATE foi executado, mas nenhuma linha foi afetada. Verifique os IDs.');
            // Mesmo que nada mude, não vamos tratar como erro fatal, mas é um alerta importante.
        } else {
            console.log(`${updateResult.affectedRows} linha(s) atualizada(s) com sucesso.`);
        }

        await connection.commit();
        console.log('Transação commitada com sucesso.');

        res.status(200).json({
            message: 'Documento atualizado com sucesso!',
            caminho_arquivo: urlCaminhoNovo,
        });

    } catch (error) {
        await connection.rollback();
        // --- LOG 5: Capturar e exibir o erro exato ---
        console.error('--- ERRO FATAL NA ATUALIZAÇÃO ---');
        console.error('Erro ao atualizar documento do aluno:', error);
        
        if (file) {
            try {
                await fs.unlink(file.path);
                console.log('Arquivo novo foi limpo após o erro.');
            } catch (cleanupError) {
                console.error('Erro ao limpar arquivo após falha na transação:', cleanupError);
            }
        }
        res.status(500).json({ message: 'Erro interno ao atualizar o documento.' });
    } finally {
        if (connection) {
            connection.release();
            console.log('Conexão com o banco liberada.');
        }
        console.log('--- FIM DA ATUALIZAÇÃO DE DOCUMENTO ---');
    }
};


// Funções stub
export const getMensalidadeByAluno = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const getDescontoByAluno = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const getDadosAcademicosDoAluno = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const importarUsersLote = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const updateAluno = async (req: Request, res: Response) => criarOuAtualizarAluno(req, res);
export const getAlunoDashboardData = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
export const getPerfilUsuario = async (req: Request, res: Response) => res.status(501).json({ message: 'Funcionalidade não implementada.' });
