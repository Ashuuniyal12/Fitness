import { Router } from 'express';
import { getUsers, createUser, updateUser } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middlewares/auth';

const router = Router();

// GET /api/users (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), getUsers);

// POST /api/users (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), createUser);

// PUT /api/users/:id (Admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), updateUser);

export default router;
