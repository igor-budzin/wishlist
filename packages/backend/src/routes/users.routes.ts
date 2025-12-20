import { Router } from 'express';
import { container } from '../container.js';
import { TYPES } from '../types.js';
import { UserController } from '../features/users/user.controller.js';

const router = Router();

// Get controller from DI container
const userController = container.get<UserController>(TYPES.UserController);

// Public profile route (no authentication required)
router.get('/:userId', (req, res, next) => userController.getPublicProfile(req, res, next));

export default router;
