import express, { Router } from 'express';
import { UrlController } from '../controllers/urlController.js';
import { validate } from '../middleware/validate.js';
import { createShortUrlSchema } from '../schemas/url.schema.js';

/**
 * Router: Express router for organizing routes
 *
 * Router() creates a mini-app that only handles routes
 * We export it to be used in main app
 */
const router: Router = express.Router();

// Health check endpoint
// GET / → Returns API status
router.get('/', UrlController.healthCheck);

// Create short URL endpoint
// POST /api/shorten → Creates a short URL
// validate() middleware runs BEFORE controller (validates req.body)
router.post('/api/shorten', validate(createShortUrlSchema), UrlController.createShortUrl);

// Get URL statistics endpoint
// GET /api/stats/:shortCode → Get stats for a short code
router.get('/api/stats/:shortCode', UrlController.getStats);

// Redirect short URL endpoint (must be last!)
// GET /:shortCode → Redirects to original URL
// This is last because it matches ANY path, so it would
// catch /api/shorten if it was first
router.get('/:shortCode', UrlController.redirectToOriginal);

export default router;
