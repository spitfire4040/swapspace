import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth';
import { upload, validateFileType } from '../middleware/upload';
import * as photoController from '../controllers/photo.controller';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many uploads, please try again later.' },
});

router.use(requireAuth);

router.post('/', uploadLimiter, upload.single('photo'), validateFileType, photoController.uploadPhoto);
router.get('/unseen', photoController.getUnseenPhotos);
router.get('/liked', photoController.getLikedPhotos);
router.get('/mine', photoController.getMyPhotos);
router.delete('/:id', photoController.deletePhoto);

export default router;
