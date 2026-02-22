import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';
import * as photoController from '../controllers/photo.controller';

const router = Router();

router.use(requireAuth);

router.post('/', upload.single('photo'), photoController.uploadPhoto);
router.get('/unseen', photoController.getUnseenPhotos);
router.get('/liked', photoController.getLikedPhotos);
router.get('/mine', photoController.getMyPhotos);
router.delete('/:id', photoController.deletePhoto);

export default router;
