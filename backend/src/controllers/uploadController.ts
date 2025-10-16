// filepath: c:\Users\mayar\OneDrive\Área de Trabalho\LMSProject\LmsMain\backend\src\controllers\uploadController.ts
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/db';

const ensureUploadDirExists = (uploadDir: string) => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

const createUploadHandler = (uploadDir: string) => {
  ensureUploadDirExists(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  return multer({ storage });
};

const uploadFoto = createUploadHandler(path.join(__dirname, '../../uploads/'));

export const uploadFotoHandler = (req: Request, res: Response) => {
  uploadFoto.single('foto')(req, res, async (err: any) => {
    if (err) {
      return res.status(500).json({ message: 'Erro no upload da imagem', error: err });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const fotoUrl = `/uploads/${req.file.filename}`; // Caminho relativo da imagem
    const { id } = req.body; // ID do professor (ou usuário)

    try {
      // Atualiza o caminho da foto no banco de dados
      await pool.query('UPDATE users SET foto_url = ? WHERE id = ?', [fotoUrl, id]);

      return res.status(200).json({ message: 'Upload realizado com sucesso', fotoUrl });
    } catch (error) {
      console.error('Erro ao salvar no banco:', error);
      return res.status(500).json({ message: 'Erro ao salvar a imagem no banco de dados' });
    }
  });
};

const uploadMaterial = createUploadHandler(path.join(__dirname, '../../uploads/material'));

export const uploadMaterialHandler = (req: Request, res: Response) => {
  uploadMaterial.single('file')(req, res, (err: any) => {
    if (err) {
      console.error('Erro no upload do arquivo:', err);
      return res.status(500).json({ message: 'Erro no upload do arquivo', error: err });
    }

    if (!req.file) {
      console.error('Nenhum arquivo enviado');
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const fileUrl = `/uploads/material/${req.file.filename}`;
    console.log('Arquivo enviado com sucesso:', fileUrl);
    
    return res.status(200).json({ message: 'Upload realizado com sucesso', fileUrl });
  });
};