import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { documentController } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save with unique name to prevent collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  }
});

// All document routes require authentication
router.use(authMiddleware);

router.get('/', (req, res) => documentController.getAll(req, res));
router.post('/upload', upload.single('file'), (req, res) => documentController.upload(req, res));
router.get('/:id/download', (req, res) => documentController.download(req, res));
router.delete('/:id', (req, res) => documentController.delete(req, res));

export default router;
