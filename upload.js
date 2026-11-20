import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

export const UPLOAD_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

// Limit uploads: one image, 3 MB, JPG/PNG/WebP only. File names are random, never user-supplied.
export const uploadPhoto = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXT[file.mimetype]),
  }),
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    EXT[file.mimetype]
      ? cb(null, true)
      : cb(Object.assign(new Error('Only JPG, PNG or WebP photos are allowed'), { status: 400 })),
}).single('photo');
