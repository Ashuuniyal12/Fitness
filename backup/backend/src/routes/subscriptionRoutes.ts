import { Router } from 'express';
import { getSubscriptions, createSubscription, toggleSubscriptionStatus } from '../controllers/subscriptionController';
import { authenticateToken, requireRole } from '../middlewares/auth';

const router = Router();

// GET /api/subscriptions (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), getSubscriptions);

// POST /api/subscriptions (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), createSubscription);

// PUT /api/subscriptions/:id/status (Admin only)
router.put('/:id/status', authenticateToken, requireRole(['admin']), toggleSubscriptionStatus);

export default router;
