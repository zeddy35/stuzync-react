import { Router } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth';
import { rateLimitBasic } from '../middleware/rateLimitBasic';
import { quotaGuard } from '../middleware/quotaGuard';
import { fileTypeGuard } from '../middleware/fileTypeGuard';
import { deleteAssetHandler, getSignedUrlHandler, uploadHandler } from '../controllers/uploadController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 1 } });

router.post('/api/upload', auth, rateLimitBasic, upload.single('file'), fileTypeGuard, quotaGuard, uploadHandler);
router.delete('/api/assets/:id', auth, rateLimitBasic, deleteAssetHandler);
router.get('/api/assets/:id/url', auth, rateLimitBasic, getSignedUrlHandler);

export default router;

