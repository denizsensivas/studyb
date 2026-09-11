import { Router } from 'express';
import multer from 'multer';
import { documentController } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/epub+zip',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error('Bu dosya türü desteklenmiyor'));
      return;
    }
    callback(null, true);
  },
});

// All document routes require authentication
router.use(authMiddleware);

router.get('/', (req, res) => documentController.getAll(req, res));
router.get('/storage', (req, res) => documentController.getStorageUsage(req, res));
router.post('/upload', (req, res) => {
  upload.single('file')(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'Dosya boyutu 10 MB sınırını aşamaz' });
      return;
    }
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    void documentController.upload(req, res);
  });
});
router.get('/:id/download', (req, res) => documentController.download(req, res));
router.delete('/:id', (req, res) => documentController.delete(req, res));

export default router;
