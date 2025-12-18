import { Router } from 'express';
import { container } from '../container.js';
import { TYPES } from '../types.js';
import { WishlistItemController } from '../features/wishlist/wishlist.controller.js';
import { validate } from '../middleware/validation.js';
import { createWishlistItemSchema, updateWishlistItemSchema } from '../features/wishlist/wishlist.schema.js';

const router = Router();

// Get controller from DI container
const wishlistController = container.get<WishlistItemController>(TYPES.WishlistItemController);

// Wishlist items routes
router.get('/items', (req, res, next) => wishlistController.getAll(req, res, next));
router.get('/items/:id', (req, res, next) => wishlistController.getById(req, res, next));
router.post('/items', validate(createWishlistItemSchema), (req, res, next) => wishlistController.create(req, res, next));
router.put('/items/:id', validate(updateWishlistItemSchema), (req, res, next) => wishlistController.update(req, res, next));
router.delete('/items/:id', (req, res, next) => wishlistController.delete(req, res, next));

export default router;
