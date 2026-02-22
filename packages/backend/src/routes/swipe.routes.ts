import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as swipeController from '../controllers/swipe.controller';

const router = Router();

router.use(requireAuth);

router.post('/', swipeController.createSwipe);
router.get('/liked', swipeController.getLikedSwipes);

export default router;
