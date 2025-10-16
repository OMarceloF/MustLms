// src/controllers/criarResponsavelController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import pool from '../config/db';

// Configuração do Multer para upload da foto
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage }).single('foto');

export const criarResponsavel = (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro no upload da foto' });
    }

    const {
      nome,
      login,
      senha,
      email,
      numero1,
      numero2,
      endereco,
      cpf,
      grau_parentesco,
      id_aluno1,
      id_aluno2,
      id_aluno3
    } = req.body;

    try {
      // 1) Verifica duplicidade de login em users
      const [loginExiste]: any = await pool.query(
        'SELECT id FROM users WHERE login = ?',
        [login]
      );
      if (loginExiste.length > 0) {
        return res.status(400).json({ message: 'Login já cadastrado.' });
      }

      // 2) Verifica duplicidade de email em users
      const [emailExiste]: any = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (emailExiste.length > 0) {
        return res.status(400).json({ message: 'Email já cadastrado.' });
      }

      // 3) Criptografa a senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // 4) Trata foto (caminho relativo)
      const fotoPath = req.file ? `/uploads/${req.file.filename}` : '';

      // 5) Insere em users
      const [userResult]: any = await pool.query(
        `INSERT INTO users 
           (nome, login, senha, email, role, foto_url, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [nome, login, hashedPassword, email, 'responsavel', fotoPath, new Date()]
      );
      const userId = userResult.insertId;

      // 6) Insere em responsaveis, vinculando os alunos
      await pool.query(
        `INSERT INTO responsaveis 
         (id, nome, id_aluno1, id_aluno2, id_aluno3, numero1, numero2, endereco, email, cpf, grau_parentesco) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          nome,
          id_aluno1 || null,
          id_aluno2 || null,
          id_aluno3 || null,
          numero1 || null,
          numero2 || null,
          endereco || null,
          email,
          cpf || null,
          grau_parentesco || null
        ]
      );

      return res.status(201).json({ mensagem: 'Responsável criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar responsável:', error);
      return res.status(500).json({ erro: 'Erro ao criar responsável' });
    }
  });
};
