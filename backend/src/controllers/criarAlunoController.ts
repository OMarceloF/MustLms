// src/controllers/criarAlunoController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db";
import multer from "multer";
import path from "path";

// Configuração do Multer (sem alterações)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

export const criarAluno = (req: Request, res: Response) => {
  upload.single("foto")(req, res, async (err: any) => {
    if (err) {
      return res.status(500).json({ message: "Erro no upload", error: err });
    }

    try {
      // 1. Desestruturar TODOS os novos campos do req.body
      const {
        // Dados do Aluno
        nome,
        email,
        matricula,
        cpf, // NOVO
        data_nascimento, // NOVO
        genero, // NOVO
        serie,
        turma,

        // Acesso
        login,
        senha,

        // Dados do Responsável
        responsavel_nome, // NOVO
        responsavel_cpf, // NOVO
        responsavel_email, // NOVO
        responsavel_telefone, // NOVO
        responsavel_parentesco, // NOVO

        // Endereço
        endereco_cep, // NOVO
        endereco_logradouro, // NOVO
        endereco_numero, // NOVO
        endereco_complemento, // NOVO
        endereco_bairro, // NOVO
        endereco_cidade, // NOVO
        endereco_uf, // NOVO

        // Saúde
        saude_tem_alergia, // NOVO
        saude_alergias_descricao, // NOVO
        saude_usa_medicacao, // NOVO
        saude_medicacao_descricao, // NOVO
        saude_plano, // NOVO
        saude_plano_numero, // NOVO
        saude_contato_emergencia_nome, // NOVO
        saude_contato_emergencia_telefone, // NOVO

        // Financeiro
        mensalidade_valor,
        mensalidade_data_inicial,
        hasDesconto,
        desconto_percentual,
        desconto_descricao,
        desconto_data_inicio,
        desconto_data_fim,
      } = req.body;

      // 2. Verificações de duplicidade (sem alterações)
      const [loginExiste]: any = await pool.query(`SELECT id FROM users WHERE login = ?`, [login]);
      if (loginExiste.length > 0) {
        return res.status(400).json({ message: "Login já cadastrado." });
      }

      const [emailExiste]: any = await pool.query(`SELECT id FROM users WHERE email = ?`, [email]);
      if (emailExiste.length > 0) {
        return res.status(400).json({ message: "Email já cadastrado." });
      }

      // NOVO: Verificar duplicidade de CPF do aluno
      const [cpfExiste]: any = await pool.query(`SELECT id FROM alunos WHERE cpf = ? AND status != 'inativo'`, [cpf]);
      if (cpfExiste.length > 0) {
        return res.status(400).json({ message: "CPF do aluno já cadastrado." });
      }

      let responsavelId;
      const cpfResponsavelLimpo = responsavel_cpf.replace(/\D/g, "");

      // 1. Verifica se já existe um responsável com este CPF
      const [responsavelExistente]: any = await pool.query(
        `SELECT id FROM users WHERE cpf = ? AND role = 'responsavel'`,
        [cpfResponsavelLimpo]
      );

      if (responsavelExistente.length > 0) {
        // Se existe, apenas pega o ID
        responsavelId = responsavelExistente[0].id;
      } else {
        // Se NÃO existe, cria um novo usuário para o responsável
        const senhaResponsavelPadrao = await bcrypt.hash(cpfResponsavelLimpo, 10); // Gera uma senha padrão a partir do CPF
        const [novoResponsavel]: any = await pool.query(
          `INSERT INTO users (nome, email, cpf, telefone, login, senha, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            responsavel_nome,
            responsavel_email,
            cpfResponsavelLimpo,
            responsavel_telefone,
            responsavel_email, // Usa o email como login padrão
            senhaResponsavelPadrao,
            'responsavel'
          ]
        );
        responsavelId = novoResponsavel.insertId;
      }

      // 3. Criptografia e Foto (sem alterações)
      const senhaCriptografada = await bcrypt.hash(senha, 10);
      const fotoUrl = req.file ? `/uploads/${req.file.filename}` : "";

      // 4. Inserir em `users` (sem alterações)
      const [result]: any = await pool.query(
        `INSERT INTO users (nome, login, senha, email, role, foto_url) VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, login, senhaCriptografada, email, "aluno", fotoUrl]
      );
      const userId = result.insertId;
      const alunoUserId = result.insertId;

      // 5. Montar os objetos JSON para as colunas novas
      const dadosResponsavel = JSON.stringify({
        nome: responsavel_nome,
        cpf: responsavel_cpf,
        email: responsavel_email,
        telefone: responsavel_telefone,
        parentesco: responsavel_parentesco,
      });

      const dadosEndereco = JSON.stringify({
        cep: endereco_cep,
        logradouro: endereco_logradouro,
        numero: endereco_numero,
        complemento: endereco_complemento,
        bairro: endereco_bairro,
        cidade: endereco_cidade,
        uf: endereco_uf,
      });

      const dadosSaude = JSON.stringify({
        tem_alergia: saude_tem_alergia === 'true',
        alergias_descricao: saude_alergias_descricao,
        usa_medicacao: saude_usa_medicacao === 'true',
        medicacao_descricao: saude_medicacao_descricao,
        plano_saude: saude_plano,
        numero_carteirinha: saude_plano_numero,
        contato_emergencia: {
          nome: saude_contato_emergencia_nome,
          telefone: saude_contato_emergencia_telefone,
        }
      });

      await pool.query(
        `INSERT INTO alunos_responsaveis (aluno_id, responsavel_id, parentesco) VALUES (?, ?, ?)`,
        [alunoUserId, responsavelId, responsavel_parentesco]
      );


      // 6. Inserir em `alunos` com TODOS os campos
      await pool.query(
        `INSERT INTO alunos 
           (id, nome, email, foto, matricula, cpf, data_nascimento, genero, serie, turma, contato_responsaveis, endereco, dados_saude) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          nome,
          email,
          fotoUrl,
          matricula,
          cpf, // NOVO
          data_nascimento, // NOVO
          genero, // NOVO
          serie,
          turma,
          dadosResponsavel, // NOVO (JSON)
          dadosEndereco, // NOVO (JSON)
          dadosSaude, // NOVO (JSON)
        ]
      );
      // 7) Insere na tabela "mensalidades"
      // mensalidade_data_inicial chega no formato "YYYY-MM-01"
      await pool.query(
        `INSERT INTO mensalidades 
           (aluno_id, valor, data_inicial) 
         VALUES (?, ?, ?)`,
        [userId, mensalidade_valor, mensalidade_data_inicial]
      );

      // 8) Se houver desconto, insere na tabela "descontos"
      // hasDesconto vem como string "true" quando marcado
      if (hasDesconto === "true") {
        await pool.query(
          `INSERT INTO descontos 
             (aluno_id, descricao, percentual, data_inicio, data_fim) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            userId,
            desconto_descricao || "",
            desconto_percentual || "0",
            desconto_data_inicio || "",
            desconto_data_fim || "",
          ]
        );
      }

      return res
        .status(201)
        .json({ message: "Aluno criado com sucesso!", id: userId });
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      return res
        .status(500)
        .json({ message: "Erro ao criar aluno.", error });
    }
  });
};

