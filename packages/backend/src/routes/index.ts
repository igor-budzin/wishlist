import { Router } from 'express';
import type { ApiResponse } from '@wishlist/shared';
import { prisma } from '../lib/prisma.js';

const router = Router();

// GET /api/items - Get all wishlist items
router.get('/items', async (_req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Convert Prisma enum to lowercase to match shared types
    const formattedItems = items.map((item: (typeof items)[0]) => ({
      ...item,
      priority: item.priority.toLowerCase() as 'low' | 'medium' | 'high',
    }));

    const response: ApiResponse<typeof formattedItems> = {
      success: true,
      data: formattedItems,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/items/:id - Get a specific item
router.get('/items/:id', async (req, res, next) => {
  try {
    const item = await prisma.wishlistItem.findUnique({
      where: { id: req.params.id },
    });

    if (!item) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Item not found',
      };
      return res.status(404).json(response);
    }

    const formattedItem = {
      ...item,
      priority: item.priority.toLowerCase() as 'low' | 'medium' | 'high',
    };

    const response: ApiResponse<typeof formattedItem> = {
      success: true,
      data: formattedItem,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/items - Create a new item
router.post('/items', async (req, res, next) => {
  try {
    const { title, description, url, priority } = req.body;

    if (!title) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Title is required',
      };
      return res.status(400).json(response);
    }

    const item = await prisma.wishlistItem.create({
      data: {
        title,
        description,
        url,
        priority: priority ? priority.toUpperCase() : 'MEDIUM',
      },
    });

    const formattedItem = {
      ...item,
      priority: item.priority.toLowerCase() as 'low' | 'medium' | 'high',
    };

    const response: ApiResponse<typeof formattedItem> = {
      success: true,
      data: formattedItem,
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// PUT /api/items/:id - Update an item
router.put('/items/:id', async (req, res, next) => {
  try {
    const { title, description, url, priority } = req.body;

    const existingItem = await prisma.wishlistItem.findUnique({
      where: { id: req.params.id },
    });

    if (!existingItem) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Item not found',
      };
      return res.status(404).json(response);
    }

    const item = await prisma.wishlistItem.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(url !== undefined && { url }),
        ...(priority !== undefined && { priority: priority.toUpperCase() }),
      },
    });

    const formattedItem = {
      ...item,
      priority: item.priority.toLowerCase() as 'low' | 'medium' | 'high',
    };

    const response: ApiResponse<typeof formattedItem> = {
      success: true,
      data: formattedItem,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/items/:id - Delete an item
router.delete('/items/:id', async (req, res, next) => {
  try {
    const existingItem = await prisma.wishlistItem.findUnique({
      where: { id: req.params.id },
    });

    if (!existingItem) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Item not found',
      };
      return res.status(404).json(response);
    }

    await prisma.wishlistItem.delete({
      where: { id: req.params.id },
    });

    const response: ApiResponse<null> = {
      success: true,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
