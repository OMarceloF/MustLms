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
  if (mime === 'application/pdf') return 'docs';
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

const ACCEPTED = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
]);

function fileFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (ACCEPTED.has(file.mimetype)) cb(null, true);
  else cb(new Error('Tipo de arquivo não permitido.'));
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
