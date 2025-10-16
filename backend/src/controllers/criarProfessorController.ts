import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import multer from 'multer';
import path from 'path';

// A configuração do Multer pode ser mantida ou importada de um arquivo central
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads/')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
export const uploadFuncionarioFoto = multer({ storage });


// NOVA FUNÇÃO 'criarFuncionario'
export const criarFuncionario = async (req: Request, res: Response) => {
  const data = req.body;
  const fotoFile = req.file; // req.file, não req.files, se você usar upload.single()

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // --- 1. LIMPEZA E PREPARAÇÃO DOS DADOS ---
    const cpfLimpo = data.cpf ? data.cpf.replace(/\D/g, '') : null;
    const telefoneLimpo = data.telefone ? data.telefone.replace(/\D/g, '') : null;
    const enderecoJson = JSON.stringify({
      cep: data.endereco_cep,
      logradouro: data.endereco_logradouro,
      numero: data.endereco_numero,
      complemento: data.endereco_complemento,
      bairro: data.endereco_bairro,
      cidade: data.endereco_cidade,
      uf: data.endereco_uf,
    });

    // --- 2. VALIDAÇÃO DE DUPLICIDADE ---
    const [existente]: any = await connection.query(
      `SELECT id FROM users WHERE login = ? OR email = ? OR cpf = ?`,
      [data.login, data.email, cpfLimpo]
    );
    if (existente.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Login, Email ou CPF já cadastrado no sistema.' });
    }

    // --- 3. CRIAÇÃO DO REGISTRO NA TABELA 'users' ---
    const senhaHash = await bcrypt.hash(data.senha, 10);
    const fotoUrl = fotoFile ? `/uploads/${fotoFile.filename}` : null;
    const role = data.cargo.toLowerCase(); // 'professor', 'gestor', 'secretaria'

    const [userResult]: any = await connection.query(
      `INSERT INTO users (nome, email, login, senha, cpf, telefone, role, foto_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativo')`,
      [data.nome, data.email, data.login, senhaHash, cpfLimpo, telefoneLimpo, role, fotoUrl]
    );
    const funcionarioId = userResult.insertId;

    // --- 4. CRIAÇÃO DO REGISTRO NA TABELA 'funcionarios' ---
    await connection.query(
      `INSERT INTO funcionarios (
         id, nome, email, cargo, departamento, foto, registro, biografia, 
         formacao_academica, especialidades, cpf, telefone, data_nascimento, 
         data_contratacao, endereco, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')`,
      [
        funcionarioId, data.nome, data.email, data.cargo, data.departamento, fotoUrl, data.registro, data.biografia,
        data.formacao_academica, data.especialidades, cpfLimpo, telefoneLimpo, data.data_nascimento,
        data.data_contratacao, enderecoJson
      ]
    );

    await connection.commit();
    res.status(201).json({ message: 'Funcionário criado com sucesso!', id: funcionarioId });

  } catch (error: any) {
    await connection.rollback();
    console.error('Erro ao criar funcionário:', error);
    res.status(500).json({ message: error.message || 'Erro interno ao criar funcionário.' });
  } finally {
    connection.release();
  }
};