// src/controllers/criarProfessorController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destPath = path.join(__dirname, '../../uploads/');
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const tipoDocumento = file.fieldname.startsWith('documentos_')
      ? file.fieldname.replace('documentos_', '')
      : file.fieldname;

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, tipoDocumento + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadFuncionarioFiles = multer({ storage }).any();

export const criarFuncionario = async (req: Request, res: Response) => {
  const data = req.body;
  const files = req.files as Express.Multer.File[];

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // --- 1. PREPARAÇÃO DOS DADOS ---
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

    // --- 3. SEPARAR ARQUIVO DE FOTO DOS DOCUMENTOS ---
    const fotoFile = files.find(file => file.fieldname === 'foto');
    const documentosFiles = files.filter(file => file.fieldname.startsWith('documentos_'));
    
    const fotoUrl = fotoFile ? `/uploads/${fotoFile.filename}` : null;

    // --- 4. CRIAÇÃO DO REGISTRO NA TABELA 'users' ---
    const senhaHash = await bcrypt.hash(data.senha, 10);
    const role = data.cargo === 'Professor' ? 'professor' : (data.cargo === 'Gestor' ? 'gestor' : 'funcionario');

    const [userResult]: any = await connection.query(
      `INSERT INTO users (nome, email, login, senha, cpf, telefone, role, foto_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ativo', NOW())`,
      [data.nome, data.email, data.login, senhaHash, cpfLimpo, telefoneLimpo, role, fotoUrl]
    );
    const funcionarioId = userResult.insertId;

    // --- 5. CRIAÇÃO DO REGISTRO NA TABELA 'funcionarios' ---
    // GARANTIA: Gênero incluído no INSERT
    await connection.query(
      `INSERT INTO funcionarios (
          id, nome, email, cargo, departamento, foto, registro, biografia, 
          formacao_academica, especialidades, cpf, telefone, data_nascimento, 
          data_contratacao, endereco, genero, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')`,
      [
        funcionarioId, data.nome, data.email, data.cargo, data.departamento, fotoUrl, data.registro, data.biografia,
        data.formacao_academica, data.especialidades, cpfLimpo, telefoneLimpo, data.data_nascimento,
        data.data_contratacao, enderecoJson, data.genero 
      ]
    );

    // --- 6. INSERÇÃO DOS DOCUMENTOS ---
    if (documentosFiles.length > 0) {
      const documentosValues = documentosFiles.map(file => {
        const tipoDocumento = file.fieldname.replace('documentos_', '');
        return [funcionarioId, tipoDocumento, `/uploads/${file.filename}`, file.originalname];
      });

      await connection.query(
        `INSERT INTO documentos_funcionarios (funcionario_id, tipo_documento, caminho_arquivo, nome_original) VALUES ?`,
        [documentosValues]
      );
    }

    // --- 7. INSERÇÃO DE CONTRATO ---
    await connection.query(
        `INSERT INTO contratos_funcionarios (funcionario_id, nome_contrato, tipo, situacao_contrato, criado_em) VALUES (?, ?, ?, ?, NOW())`,
        [funcionarioId, 'Contrato de Trabalho Inicial', 'Admissão', 'Pendente de Assinatura']
    );

    await connection.commit();
    res.status(201).json({ message: 'Funcionário criado com sucesso!', id: funcionarioId });

  } catch (error: any) {
    await connection.rollback();
    console.error('Erro ao criar funcionário:', error);
    
    if (files && files.length > 0) {
        for (const file of files) {
            if (file.path) {
                fs.unlink(file.path, (err) => {
                    if (err) console.error(`Erro ao limpar arquivo ${file.path}:`, err);
                });
            }
        }
    }

    res.status(500).json({ message: error.message || 'Erro interno ao criar funcionário.' });
  } finally {
    connection.release();
  }
};