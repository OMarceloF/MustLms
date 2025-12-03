// src/lib/upload.ts
import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
ensureDir(UPLOAD_ROOT);

const MB = 1024 * 1024;
const MAX_ANY = Number(process.env.UPLOAD_MAX_MB || 50) * MB;
const MAX_IMG = Number(process.env.UPLOAD_IMAGE_MAX_MB || 10) * MB;
const MAX_DOC = Number(process.env.UPLOAD_DOC_MAX_MB || 40) * MB;

// Decide pasta pelo mimetype
function resolveSubdir(mime: string) {
  if (mime.startsWith('image/')) return 'images';
  
  // MODIFICADO: Agrupa PDFs e arquivos do Office na pasta 'docs'
  if (
    mime === 'application/pdf' || 
    mime.includes('word') || 
    mime.includes('sheet') || 
    mime.includes('excel') || 
    mime.includes('presentation') || 
    mime.includes('powerpoint')
  ) {
    return 'docs';
  }
  
  return 'misc';
}

// Nome de arquivo seguro (slug + timestamp)
function safeName(original: string) {
  const ext = (path.extname(original) || '').toLowerCase();
  const base = path.basename(original, ext)
    .toLowerCase()
    .replace(/[^a-z0-9\-_.]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  return `${base}-${Date.now()}${ext || ''}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sub = resolveSubdir(file.mimetype);
    const dest = path.join(UPLOAD_ROOT, sub);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, safeName(file.originalname));
  },
});

// MODIFICADO: Lista expandida para aceitar Docs, Planilhas, Slides e Texto
const ACCEPTED = new Set([
  // Imagens
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  
  // Documentos
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain', // .txt
  'text/csv', // .csv
  'application/zip', // .zip
  'application/x-rar-compressed' // .rar
]);

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  // Verifica se o tipo está na lista aceita
  if (ACCEPTED.has(file.mimetype)) {
    cb(null, true);
  } else {
    // Opcional: Se quiser liberar QUALQUER arquivo, descomente a linha abaixo e comente a linha do erro
    // cb(null, true); 
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
  }
}

export const uploadAny = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_ANY },
});

export function uploadSingleImage(field: string) {
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_IMG },
  }).single(field);
}

export function uploadSingleDoc(field: string) {
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_DOC },
  }).single(field);
}

// Para endpoints com múltiplos campos (ex.: capa + pdf)
export function uploadFields(defs: { name: string; maxCount?: number }[]) {
  return uploadAny.fields(defs);
}