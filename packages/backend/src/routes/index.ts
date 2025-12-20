import { Router } from 'express';
import { container } from '../container.js';
import { TYPES } from '../types.js';
import { WishlistItemController } from '../features/wishlist/wishlist.controller.js';
import { validate } from '../middleware/validation.js';
import {
  createWishlistItemSchema,
  updateWishlistItemSchema,
} from '../features/wishlist/wishlist.schema.js';
import { requireAuth } from '../features/auth/auth.middleware.js';

const router = Router();

// Get controller from DI container
const wishlistController = container.get<WishlistItemController>(TYPES.WishlistItemController);

// Wishlist items routes (all require authentication)
router.get('/items', requireAuth, (req, res, next) => wishlistController.getAll(req, res, next));
router.get('/items/:id', requireAuth, (req, res, next) =>
  wishlistController.getById(req, res, next)
);
router.post('/items', requireAuth, validate(createWishlistItemSchema), (req, res, next) =>
  wishlistController.create(req, res, next)
);
router.put('/items/:id', requireAuth, validate(updateWishlistItemSchema), (req, res, next) =>
  wishlistController.update(req, res, next)
);
router.delete('/items/:id', requireAuth, (req, res, next) =>
  wishlistController.delete(req, res, next)
);

export default router;
