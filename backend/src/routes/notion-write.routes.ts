import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { generalRateLimiter } from '../middleware/rate-limit.middleware.js';
import { queueClipWrite, getClipJobStatus, getClipJobResult } from '../controllers/notion-write.controller.js';

const router = Router();

router.post('/clip', authenticateToken, generalRateLimiter, queueClipWrite);
router.get('/status/:jobId', authenticateToken, generalRateLimiter, getClipJobStatus);
router.get('/result/:jobId', authenticateToken, generalRateLimiter, getClipJobResult);

export default router;
