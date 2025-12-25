import { Router } from 'express';
import { container } from '../container.js';
import { TYPES } from '../types.js';
import { LinkAnalysisController } from '../features/link-analysis/link-analysis.controller.js';
import { validate } from '../middleware/validation.js';
import { analyzeLinkSchema } from '../features/link-analysis/link-analysis.schema.js';
import { requireAuth } from '../features/auth/auth.middleware.js';

const router = Router();

// Get controller from DI container
const linkAnalysisController = container.get<LinkAnalysisController>(TYPES.LinkAnalysisController);

// Link analysis route (requires authentication)
router.post('/analyze-link', requireAuth, validate(analyzeLinkSchema), (req, res, next) =>
  linkAnalysisController.analyzeLink(req, res, next)
);

export default router;
