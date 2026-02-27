import express from 'express';
import * as SubscribesController from '../../controllers/subscribe/subscribe.controller.js';


const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.post('/', SubscribesController.subscribe);
router.post('/unsubscribe', SubscribesController.unsubscribe);

// ==================== ADMIN ROUTES ====================
router.get('/subscribers', SubscribesController.getAllSubscribers);
router.get('/subscribers/:id/status', SubscribesController.updateSubscriberStatus);
router.delete('/subscribers/:id', SubscribesController.deleteSubscriber);
router.post('/newsletter/send', SubscribesController.sendNewsletter);

export default router;