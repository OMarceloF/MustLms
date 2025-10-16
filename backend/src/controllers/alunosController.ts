import { Request, Response } from 'express';
import pool from '../config/db';
import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

interface Aluno extends RowDataPacket {
  id: number;
  nome: string;
  matricula: string;
  serie: string;
  turma: string;
  email: string;
  foto: string;
  login: string;
}

interface CSVUser {
  'Nome Completo': string;
  matricula: string;
  senha: string;
  email: string;
  foto?: string;
  valor_mensalidade: string;
  data_primeira_mensalidade: string;
  possui_desconto?: string;
  porcentagem_desconto?: string;
  descricao_desconto?: string;
  data_inicio_desconto?: string;
  data_fim_desconto?: string;
}

const formatCPF = (value: string | null): string => {
  // AQUI ESTÁ A CORREÇÃO:
  // Se o valor for nulo, indefinido ou uma string vazia, retorne uma string vazia imediatamente.
  if (!value) {
    return '';
  }

  // O resto da função só será executado se 'value' for uma string válida.
  const numericValue = value.replace(/\D/g, '');
  const truncatedValue = numericValue.slice(0, 11);

  if (truncatedValue.length > 9) {
    return truncatedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (truncatedValue.length > 6) {
    return truncatedValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (truncatedValue.length > 3) {
    return truncatedValue.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }

  return truncatedValue;
};

const formatTelefone = (value: string | null): string => {
  // AQUI ESTÁ A CORREÇÃO:
  if (!value) {
    return '';
  }

  // O resto da função continua igual.
  const numericValue = value.replace(/\D/g, '');
  const truncatedValue = numericValue.slice(0, 11);

  if (truncatedValue.length > 10) {
    return truncatedValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (truncatedValue.length > 6) {
    return truncatedValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else if (truncatedValue.length > 2) {
    return truncatedValue.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  }

  return truncatedValue.replace(/(\d*)/, '($1');
};

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const getAlunoById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        a.id,
        a.nome,
        a.matricula,
        a.serie,
        a.turma,
        a.email,
        a.foto       AS foto,
        u.login      AS login
      FROM alunos a
      LEFT JOIN users u ON u.id = a.id
      WHERE a.id = ? AND status != 'inativo'
    `;
    const [rows] = await pool.query<Aluno[]>(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar aluno por ID:', error);
    res.status(500).json({ message: 'Erro interno ao buscar aluno.' });
  }
};

/**
 * Lista todos os alunos (GET /api/alunos)
 */
export const listarAlunos = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nome, matricula, serie, turma, email, foto, cpf FROM alunos WHERE status != 'inativo'`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ message: 'Erro interno ao buscar alunos.' });
  }
};

/**
 * Busca a mensalidade atual de um aluno (GET /api/alunos/:id/mensalidade)
 */
export const getMensalidadeByAluno = async (req: Request, res: Response) => {
  const { id } = req.params; // “id” aqui é o aluno_id

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, aluno_id, valor, data_inicial
         FROM mensalidades
        WHERE aluno_id = ?
        ORDER BY data_inicial DESC
        LIMIT 1`,
      [id]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: 'Mensalidade não encontrada' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar mensalidade:', error);
    res.status(500).json({ message: 'Erro interno ao buscar mensalidade.' });
  }
};

/**
 * Busca o desconto atual de um aluno (GET /api/alunos/:id/desconto)
 */
export const getDescontoByAluno = async (req: Request, res: Response) => {
  const { id } = req.params; // “id” aqui é o aluno_id

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, aluno_id, descricao, percentual, data_inicio, data_fim
         FROM descontos
        WHERE aluno_id = ?
        ORDER BY data_inicio DESC
        LIMIT 1`,
      [id]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: 'Desconto não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar desconto:', error);
    res.status(500).json({ message: 'Erro interno ao buscar desconto.' });
  }
};


export const excluirAluno = async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Marca o registro na tabela 'alunos' como 'inativo'
    await connection.query(
      `UPDATE alunos SET status = 'inativo' WHERE id = ?`,
      [id]
    );

    // 2. Marca o registro na tabela 'users' como 'inativo'
    // Isso impede o login e remove o usuário de buscas gerais.
    await connection.query(
      `UPDATE users SET status = 'inativo' WHERE id = ?`,
      [id]
    );

    // 3. (Opcional, mas recomendado) Desvincular de turmas ativas
    // Isso evita que o aluno inativo apareça em listas de chamada, etc.
    await connection.query(
      `DELETE FROM alunos_turmas WHERE aluno_id = ?`,
      [id]
    );

    await connection.commit();
    return res.status(200).json({ message: 'Aluno desativado com sucesso.' });

  } catch (error) {
    await connection.rollback();
    console.error('Erro ao desativar aluno:', error);
    return res.status(500).json({ message: 'Erro ao desativar aluno.' });
  } finally {
    connection.release();
  }
};

export const getResponsaveisByAluno = async (req: Request, res: Response) => {
  const alunoId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT nome, numero1, numero2, endereco, email, grau_parentesco 
       FROM responsaveis 
       WHERE id_aluno1 = ? OR id_aluno2 = ? OR id_aluno3 = ?`,
      [alunoId, alunoId, alunoId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar responsáveis:', error);
    res.status(500).json({ error: 'Erro ao buscar responsáveis' });
  }
};

/**
 * Retorna os dados acadêmicos reais de um aluno (GET /api/alunos/:id/dados-academicos)
 */
export const getDadosAcademicosDoAluno = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;

  try {
    const [relacaoTurma] = await pool.query<RowDataPacket[]>(
      `SELECT turma_id FROM alunos_turmas WHERE aluno_id = ? LIMIT 1`,
      [id]
    );

    if (relacaoTurma.length === 0) {
      return res
        .status(404)
        .json({ message: 'Aluno não está vinculado a nenhuma turma.' });
    }

    const turmaId = relacaoTurma[0].turma_id;

    const [turmaRows] = await pool.query<RowDataPacket[]>(
      `SELECT nome FROM turmas WHERE id = ?`,
      [turmaId]
    );

    const nomeTurma = turmaRows.length > 0 ? turmaRows[0].nome : null;

    const [materiaRows] = await pool.query<RowDataPacket[]>(
      `SELECT m.nome
         FROM turmas_materias tm
         JOIN materias m ON m.id = tm.materia_id
        WHERE tm.turma_id = ?`,
      [turmaId]
    );

    const disciplinas = materiaRows.map((m) => m.nome);

    // Novo bloco: buscar nome do professor regente
    let professorRegente: string | null = null;
    const [professorIdRow] = await pool.query<RowDataPacket[]>(
      `SELECT professor_responsavel FROM turmas WHERE id = ?`,
      [turmaId]
    );
    const professorId = professorIdRow[0]?.professor_responsavel;

    if (professorId && Number(professorId) !== 0) {
      const [professorNomeRow] = await pool.query<RowDataPacket[]>(
        `SELECT 
    f.nome 
FROM 
    funcionarios AS f
JOIN 
    users AS u ON f.id = u.id
WHERE 
    f.id = ? AND u.status = 'ativo'
LIMIT 1;
`,
        [professorId]
      );
      professorRegente = professorNomeRow[0]?.nome || null;
    }

    return res.status(200).json({
      turma: nomeTurma,
      professorRegente,
      disciplinas,
    });
  } catch (error) {
    console.error('Erro ao buscar dados acadêmicos:', error);
    return res
      .status(500)
      .json({ message: 'Erro interno ao buscar dados acadêmicos.' });
  }
};

export const importarUsersLote = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ erro: 'Arquivo CSV não enviado.' });

  const filename = path.basename(file.filename || file.originalname);
  const filePath = path.join(UPLOADS_DIR, filename);


  // Garante que o arquivo está dentro do diretório esperado
  if (!filePath.startsWith(UPLOADS_DIR)) {
    return res.status(400).json({ erro: 'Caminho de arquivo inválido.' });
  }

  const resultados: CSVUser[] = [];

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CSVUser) => resultados.push(data))
      .on('end', async () => {
        for (const userData of resultados) {
          const nome = userData['Nome Completo'];
          const login = userData['matricula'];
          const senhaOriginal = userData['senha'];
          const email = userData['email'];
          const foto_url = userData['foto'] || null;

          const valorMensalidade = parseFloat(userData['valor_mensalidade']);
          const dataInicial = userData['data_primeira_mensalidade'];

          const possuiDesconto =
            userData['possui_desconto']?.toLowerCase() === 'sim';
          const percentualDesconto = parseFloat(
            userData['porcentagem_desconto'] || '0'
          );
          const descricaoDesconto = userData['descricao_desconto'] || '';
          const dataInicioDesconto = userData['data_inicio_desconto'] || null;
          const dataFimDesconto = userData['data_fim_desconto'] || null;

          if (
            !nome ||
            !login ||
            !senhaOriginal ||
            !email ||
            isNaN(valorMensalidade) ||
            !dataInicial
          )
            continue;

          const senhaHash = await bcrypt.hash(senhaOriginal, 10);

          const [userResult]: any = await pool.query(
            `INSERT INTO users (login, senha, email, role, nome, foto_url) VALUES (?, ?, ?, 'aluno', ?, ?)`,
            [login, senhaHash, email, nome, foto_url]
          );
          const userId = userResult.insertId;

          await pool.query(
            `INSERT INTO alunos (id, nome, matricula, serie, turma, email, foto, biografia, telefone, contato_responsaveis, turno, data_nascimento, status)
   VALUES (?, ?, ?, '', '', ?, ?, '', '', '', '', NULL, 'regular')`,
            [userId, nome, login, email, foto_url]
          );

          // Buscar ID do aluno
          const [rows]: any = await pool.query(
            `SELECT id FROM alunos WHERE matricula = ? AND status != 'inativo'`,
            [login]
          );
          const alunoId = rows?.[0]?.id;
          if (!alunoId) continue;

          // Inserir mensalidade
          await pool.query(
            `INSERT INTO mensalidades (aluno_id, valor, data_inicial) VALUES (?, ?, ?)`,
            [alunoId, valorMensalidade, dataInicial]
          );

          // Inserir desconto, se existir
          if (possuiDesconto && !isNaN(percentualDesconto)) {
            await pool.query(
              `INSERT INTO descontos (aluno_id, descricao, percentual, data_inicio, data_fim)
               VALUES (?, ?, ?, ?, ?)`,
              [
                alunoId,
                descricaoDesconto,
                percentualDesconto,
                dataInicioDesconto,
                dataFimDesconto,
              ]
            );
          }
        }

        fs.unlinkSync(filePath);
        res.status(200).json({
          mensagem:
            'Importação completa: usuários, alunos, mensalidades e descontos.',
        });
      });
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    res.status(500).json({ erro: 'Erro interno ao processar o arquivo.' });
  }
};

export const getAlunoEditData = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // A query SQL está correta e busca todos os dados necessários.
    const query = `
      SELECT
          u_aluno.nome, u_aluno.email, u_aluno.login, u_aluno.foto_url,
          a.matricula, a.cpf, a.data_nascimento, a.genero, a.serie, a.turma,
          a.endereco, a.dados_saude,
          u_resp.nome AS responsavel_nome,
          u_resp.cpf AS responsavel_cpf,
          u_resp.email AS responsavel_email,
          u_resp.telefone AS responsavel_telefone,
          ar.parentesco AS responsavel_parentesco
      FROM
          users AS u_aluno
      LEFT JOIN alunos AS a ON u_aluno.id = a.id
      LEFT JOIN alunos_responsaveis AS ar ON u_aluno.id = ar.aluno_id
      LEFT JOIN users AS u_resp ON ar.responsavel_id = u_resp.id
      WHERE
          u_aluno.id = ? AND u_aluno.role = 'aluno'
      LIMIT 1;
    `;

    const [rows]: any = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    const rawData = rows[0];

    // ========================================================================
    // ETAPA DE TRANSFORMAÇÃO DOS DADOS (AQUI ESTÁ A CORREÇÃO PRINCIPAL)
    // ========================================================================

    // 1. Parse dos campos JSON que vêm do banco como string
    const enderecoData = rawData.endereco ? JSON.parse(rawData.endereco) : {};
    const saudeData = rawData.dados_saude ? JSON.parse(rawData.dados_saude) : {};

    // 2. Montagem do objeto final, mapeando CADA campo esperado pelo frontend
    const finalData = {
      // Dados do Aluno
      nome: rawData.nome,
      email: rawData.email,
      login: rawData.login,
      foto_url: rawData.foto_url,
      matricula: rawData.matricula,
      cpf: formatCPF(rawData.cpf), // Formata antes de enviar
      data_nascimento: rawData.data_nascimento ? new Date(rawData.data_nascimento).toISOString().split('T')[0] : '',
      genero: rawData.genero,
      serie: rawData.serie,
      turma: rawData.turma,

      // Dados do Responsável (já vêm com os nomes corretos da query)
      responsavel_nome: rawData.responsavel_nome,
      responsavel_cpf: formatCPF(rawData.responsavel_cpf), // Formata antes de enviar
      responsavel_email: rawData.responsavel_email,
      responsavel_telefone: formatTelefone(rawData.responsavel_telefone), // Formata antes de enviar
      responsavel_parentesco: rawData.responsavel_parentesco,

      // Dados de Endereço (desmembrando o JSON)
      endereco_cep: enderecoData.cep || '',
      endereco_logradouro: enderecoData.logradouro || '',
      endereco_numero: enderecoData.numero || '',
      endereco_complemento: enderecoData.complemento || '',
      endereco_bairro: enderecoData.bairro || '',
      endereco_cidade: enderecoData.cidade || '',
      endereco_uf: enderecoData.uf || '',

      // Dados de Saúde (desmembrando o JSON)
      saude_tem_alergia: saudeData.tem_alergia || false,
      saude_alergias_descricao: saudeData.alergias_descricao || '',
      saude_usa_medicacao: saudeData.usa_medicacao || false,
      saude_medicacao_descricao: saudeData.medicacao_descricao || '',
      saude_plano: saudeData.plano_saude || '',
      saude_plano_numero: saudeData.numero_carteirinha || '',
      saude_contato_emergencia_nome: saudeData.contato_emergencia?.nome || '',
      saude_contato_emergencia_telefone: formatTelefone(saudeData.contato_emergencia?.telefone || ''), // Formata antes de enviar
    };

    // 3. (Opcional, mas recomendado) Buscar dados financeiros e mesclar
    //    Isso pode ser feito aqui ou você pode criar campos na tabela 'alunos'
    //    para simplificar. Por agora, vamos focar nos dados cadastrais.

    // 4. Enviar o objeto final e plano para o frontend
    return res.status(200).json(finalData);

  } catch (error) {
    console.error('Erro ao buscar dados de edição do aluno:', error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const updateAluno = async (req: Request, res: Response) => {
  const { id: alunoId } = req.params;
  // O 'id' do aluno a ser atualizado vem da URL
  const { id } = req.params;
  // Os dados do formulário vêm do corpo da requisição (req.body)
  const data = req.body;
  // O arquivo da foto (se enviado) vem de req.file
  const fotoFile = req.file;

  // Inicia uma conexão com o banco para usar uma transação.
  // Uma transação garante que todas as queries sejam executadas com sucesso,
  // ou nenhuma delas é executada, evitando dados inconsistentes.
  const connection = await pool.getConnection();

  try {
    // Inicia a transação
    await connection.beginTransaction();

    // --- ETAPA 1: LIMPEZA E PREPARAÇÃO DOS DADOS ---
    // Remove a formatação de campos como CPF, telefone e CEP para salvar apenas os números.
    const cpfLimpo = data.cpf ? data.cpf.replace(/\D/g, '') : null;
    const responsavelCpfLimpo = data.responsavel_cpf ? data.responsavel_cpf.replace(/\D/g, '') : null;
    const responsavelTelefoneLimpo = data.responsavel_telefone ? data.responsavel_telefone.replace(/\D/g, '') : null;
    const enderecoCepLimpo = data.endereco_cep ? data.endereco_cep.replace(/\D/g, '') : null;
    const saudeContatoTelefoneLimpo = data.saude_contato_emergencia_telefone ? data.saude_contato_emergencia_telefone.replace(/\D/g, '') : null;

    // --- ETAPA 2: ATUALIZAR A TABELA 'users' DO ALUNO ---
    // Atualiza informações gerais como nome, email e login.
    await connection.query(
      `UPDATE users SET nome = ?, email = ?, login = ? WHERE id = ?`,
      [data.nome, data.email, data.login, id]
    );

    // Atualiza a senha APENAS se uma nova foi enviada no formulário.
    if (data.senha && data.senha.trim() !== '') {
      const senhaHash = await bcrypt.hash(data.senha, 10);
      await connection.query(`UPDATE users SET senha = ? WHERE id = ?`, [senhaHash, id]);
    }

    // Atualiza a URL da foto se um novo arquivo foi enviado.
    if (fotoFile) {
      const fotoUrl = `/uploads/${fotoFile.filename}`;
      await connection.query(`UPDATE users SET foto_url = ? WHERE id = ?`, [fotoUrl, id]);
    }

    // --- ETAPA 3: ATUALIZAR A TABELA 'alunos' ---
    // Monta os objetos JSON para as colunas 'endereco' e 'dados_saude'.
    const enderecoJson = JSON.stringify({
      cep: enderecoCepLimpo,
      logradouro: data.endereco_logradouro,
      numero: data.endereco_numero,
      complemento: data.endereco_complemento,
      bairro: data.endereco_bairro,
      cidade: data.endereco_cidade,
      uf: data.endereco_uf,
    });

    const saudeJson = JSON.stringify({
      tem_alergia: data.saude_tem_alergia === 'true',
      alergias_descricao: data.saude_alergias_descricao,
      usa_medicacao: data.saude_usa_medicacao === 'true',
      medicacao_descricao: data.saude_medicacao_descricao,
      plano_saude: data.saude_plano,
      numero_carteirinha: data.saude_plano_numero,
      contato_emergencia: {
        nome: data.saude_contato_emergencia_nome,
        telefone: saudeContatoTelefoneLimpo,
      }
    });

    // Executa a query de atualização na tabela 'alunos'.
    await connection.query(
      `UPDATE alunos SET 
         matricula = ?, cpf = ?, data_nascimento = ?, genero = ?, 
         serie = ?, turma = ?, endereco = ?, dados_saude = ? 
       WHERE id = ?`,
      [data.matricula, cpfLimpo, data.data_nascimento, data.genero, data.serie, data.turma, enderecoJson, saudeJson, id]
    );

    // ========================================================================
    // --- ETAPA 4: LÓGICA INTELIGENTE DE ATUALIZAÇÃO DO RESPONSÁVEL ---
    // ========================================================================

    // Verifica se foram enviados dados de um responsável no formulário
    if (data.responsavel_nome && responsavelCpfLimpo) {

      // Primeiro, verifica se o aluno JÁ TEM um responsável vinculado.
      const [vinculoExistente]: any = await connection.query(
        `SELECT responsavel_id FROM alunos_responsaveis WHERE aluno_id = ? LIMIT 1`,
        [alunoId]
      );

      if (vinculoExistente.length > 0) {
        // --- CENÁRIO 1: ATUALIZAR RESPONSÁVEL EXISTENTE ---
        const responsavelId = vinculoExistente[0].responsavel_id;

        // Valida se o CPF do responsável não está sendo alterado para um que já existe em outro usuário
        const [outroRespComCpf]: any = await connection.query(
          `SELECT id FROM users WHERE cpf = ? AND id != ?`,
          [responsavelCpfLimpo, responsavelId]
        );
        if (outroRespComCpf.length > 0) {
          throw new Error('O CPF do responsável já está em uso por outro usuário.');
        }

        // Atualiza os dados do responsável na tabela 'users'
        await connection.query(
          `UPDATE users SET nome = ?, email = ?, cpf = ?, telefone = ? WHERE id = ?`,
          [data.responsavel_nome, data.responsavel_email, responsavelCpfLimpo, data.responsavel_telefone.replace(/\D/g, ''), responsavelId]
        );
        // Atualiza o parentesco na tabela de vínculo
        await connection.query(
          `UPDATE alunos_responsaveis SET parentesco = ? WHERE aluno_id = ? AND responsavel_id = ?`,
          [data.responsavel_parentesco, alunoId, responsavelId]
        );

      } else {
        // --- CENÁRIOS 2 E 3: VINCULAR OU CRIAR E VINCULAR ---

        // Verifica se já existe um responsável com o CPF fornecido
        const [responsavelExistente]: any = await connection.query(
          `SELECT id FROM users WHERE cpf = ? AND role = 'responsavel' LIMIT 1`,
          [responsavelCpfLimpo]
        );

        let responsavelIdFinal;

        if (responsavelExistente.length > 0) {
          // --- CENÁRIO 2: VINCULAR RESPONSÁVEL JÁ CADASTRADO ---
          responsavelIdFinal = responsavelExistente[0].id;
        } else {
          // --- CENÁRIO 3: CRIAR NOVO RESPONSÁVEL ---
          const senhaPadrao = await bcrypt.hash(responsavelCpfLimpo, 10);
          const [novoResponsavel]: any = await connection.query(
            `INSERT INTO users (nome, email, cpf, telefone, login, senha, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [data.responsavel_nome, data.responsavel_email, responsavelCpfLimpo, data.responsavel_telefone.replace(/\D/g, ''), data.responsavel_email, senhaPadrao, 'responsavel']
          );
          responsavelIdFinal = novoResponsavel.insertId;
        }

        // Cria o novo vínculo na tabela 'alunos_responsaveis'
        await connection.query(
          `INSERT INTO alunos_responsaveis (aluno_id, responsavel_id, parentesco) VALUES (?, ?, ?)`,
          [alunoId, responsavelIdFinal, data.responsavel_parentesco]
        );
      }
    }

    // --- ETAPA 5: FINALIZAR A TRANSAÇÃO ---
    // Se todas as queries foram executadas sem erro, confirma as alterações no banco.
    await connection.commit();

    res.status(200).json({ message: 'Aluno atualizado com sucesso!' });

  } catch (error) {
    // Se qualquer uma das queries falhar, desfaz todas as alterações.
    await connection.rollback();
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar aluno.' });
  } finally {
    // Libera a conexão de volta para o pool, independentemente de sucesso ou falha.
    connection.release();
  }
};

export const getAlunoDashboardData = async (req: Request, res: Response) => {
  const { id: alunoId } = req.params;

  try {
    // Query principal que já busca dados do aluno e do responsável
    const alunoQuery = `
      SELECT
          u_aluno.nome, u_aluno.email, u_aluno.login, u_aluno.foto_url,
          a.matricula, a.cpf, a.data_nascimento, a.genero, a.serie, a.turma,
          a.endereco, a.dados_saude, a.biografia
      FROM users AS u_aluno
      LEFT JOIN alunos AS a ON u_aluno.id = a.id
      WHERE u_aluno.id = ? AND u_aluno.role = 'aluno' AND u_aluno.status = 'ativo'
      LIMIT 1;
    `;
    const [alunoRows]: any = await pool.query(alunoQuery, [alunoId]);

    if (alunoRows.length === 0) {
      return res.status(404).json({ message: 'Aluno não encontrado ou inativo.' });
    }

    const alunoData = alunoRows[0];

    // Query para buscar todos os responsáveis vinculados
    const responsaveisQuery = `
      SELECT u.id, u.nome, u.email, u.telefone, ar.parentesco, ar.id as vinculoId
      FROM alunos_responsaveis ar
      JOIN users u ON ar.responsavel_id = u.id
      WHERE ar.aluno_id = ? AND u.status = 'ativo';
    `;
    const [responsaveisRows]: any = await pool.query(responsaveisQuery, [alunoId]);

    // Parse dos campos JSON
    const endereco = alunoData.endereco ? JSON.parse(alunoData.endereco) : {};
    const dados_saude = alunoData.dados_saude ? JSON.parse(alunoData.dados_saude) : {};

    // Monta o objeto de resposta final
    const dashboardData = {
      // Dados do Aluno
      id: alunoId,
      type: 'student', // Mantendo a compatibilidade com seu estado 'userData'
      name: alunoData.nome,
      email: alunoData.email,
      registration: alunoData.matricula,
      series: alunoData.serie,
      turma: alunoData.turma,
      biography: alunoData.biografia,
      foto_url: alunoData.foto_url,
      data_nascimento: alunoData.data_nascimento,
      genero: alunoData.genero,
      cpf: alunoData.cpf,

      // Dados de Endereço
      endereco: {
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
        cep: endereco.cep,
      },

      // Dados de Saúde
      saude: {
        tem_alergia: dados_saude.tem_alergia,
        alergias_descricao: dados_saude.alergias_descricao,
        usa_medicacao: dados_saude.usa_medicacao,
        medicacao_descricao: dados_saude.medicacao_descricao,
        plano_saude: dados_saude.plano_saude,
        numero_carteirinha: dados_saude.numero_carteirinha,
        contato_emergencia: dados_saude.contato_emergencia,
      },

      // Lista de Responsáveis
      responsaveis: responsaveisRows,
    };

    res.status(200).json(dashboardData);

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard do aluno:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const getPerfilUsuario = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // 1. Descobre o 'role' do usuário
    const [userRows]: any = await pool.query(
      `SELECT role FROM users WHERE id = ? AND status = 'ativo'`,
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado ou inativo.' });
    }
    const role = userRows[0].role;

    // 2. Chama a função apropriada com base no 'role'
    if (role === 'aluno') {
      // Reutiliza a lógica que já criamos!
      // Supondo que você exportou a função getAlunoDashboardData
      return getAlunoDashboardData(req, res);
    }

    if (role === 'professor' || role === 'gestor' || role === 'secretaria') {
      // Lógica para buscar dados do funcionário
      const query = `
        SELECT
          u.id, u.nome, u.email, u.login, u.foto_url, u.cpf, u.telefone, u.role,
          f.departamento, f.registro, f.biografia, f.formacao_academica, 
          f.especialidades, f.data_nascimento, f.data_contratacao, f.endereco
        FROM users u
        LEFT JOIN funcionarios f ON u.id = f.id
        WHERE u.id = ? AND u.status = 'ativo';
      `;
      const [funcRows]: any = await pool.query(query, [id]);
      console.log("automação bem sucedida!!")

      if (funcRows.length === 0) {
        return res.status(404).json({ message: 'Dados do funcionário não encontrados.' });
      }
      const funcData = funcRows[0];
      const endereco = funcData.endereco ? JSON.parse(funcData.endereco) : {};

      // Monta o objeto de resposta para o funcionário
      const perfilFuncionario = {
        id: funcData.id,
        type: funcData.role, // 'professor', 'gestor', etc.
        name: funcData.nome,
        email: funcData.email,
        foto_url: funcData.foto_url,
        biography: funcData.biografia,
        cpf: funcData.cpf,
        telefone: funcData.telefone,
        data_nascimento: funcData.data_nascimento,
        endereco: endereco,
        // Dados profissionais
        registration: funcData.registro,
        departamento: funcData.departamento,
        data_contratacao: funcData.data_contratacao,
        formacao_academica: funcData.formacao_academica,
        especialidades: funcData.especialidades,
      };
      return res.status(200).json(perfilFuncionario);
    }

    // Fallback para outros roles, se houver
    return res.status(400).json({ message: 'Tipo de usuário não suportado para perfil.' });

  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};