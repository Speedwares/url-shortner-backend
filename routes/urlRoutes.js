import express from 'express';
import { UrlController } from '../controllers/urlController.js';

const router = express.Router();

// Health check
router.get('/', UrlController.healthCheck);

// Create short URL
router.post('/api/shorten', UrlController.createShortUrl);

// Get URL stats
router.get('/api/stats/:shortCode', UrlController.getStats);

// Redirect short URL (must be last to avoid conflicts)
router.get('/:shortCode', UrlController.redirectToOriginal);

export default router;
