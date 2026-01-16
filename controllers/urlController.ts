import { Request, Response } from 'express';
import { ShortenerService } from '../services/shortenerService.js';
import { UrlService } from '../services/urlService.js';
import { CreateShortUrlRequest } from '../schemas/url.schema.js';

/**
 * UrlController - Handles all URL-related HTTP requests
 *
 * Each method is 'static' meaning you can call it without creating an instance:
 * UrlController.createShortUrl() instead of new UrlController().createShortUrl()
 */
export class UrlController {
    /**
     * Create a short URL
     *
     * @param req - Express Request (body already validated by Zod middleware)
     * @param res - Express Response
     *
     * Note: No manual validation needed - Zod middleware handles it
     */
    static async createShortUrl(
        req: Request<{}, any, CreateShortUrlRequest>,
        res: Response
    ): Promise<Response | void> {
        try {
            // Body is already validated by Zod middleware
            const { url } = req.body;

            // Use service to handle business logic
            const shortenerService = new ShortenerService(url);
            const result = await shortenerService.createShortUrl();

            // Handle response based on service result
            if (result.exists) {
                return res.json({
                    shortCode: result.shortCode,
                    shortUrl: `${req.protocol}://${req.get('host')}/${result.shortCode}`,
                    originalUrl: result.originalUrl,
                    message: 'URL already shortened'
                });
            }

            // Return newly created short URL
            return res.status(201).json({
                shortCode: result.shortCode,
                shortUrl: `${req.protocol}://${req.get('host')}/${result.shortCode}`,
                originalUrl: result.originalUrl
            });

        } catch (error) {
            console.error('Error creating short URL:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Get statistics for a short URL
     *
     * @param req - Request with shortCode in params
     * @param res - Response object
     *
     * Request<{ shortCode: string }> means:
     * - URL parameters type: { shortCode: string }
     * - Example: /api/stats/:shortCode → params.shortCode
     */
    static async getStats(
        req: Request<{ shortCode: string }>,
        res: Response
    ): Promise<Response> {
        try {
            const { shortCode } = req.params;

            const urlService = new UrlService(shortCode);
            const stats = await urlService.getStats();

            // If URL not found, return 404
            if (!stats) {
                return res.status(404).json({ error: 'Short URL not found' });
            }

            return res.json(stats);

        } catch (error) {
            console.error('Error getting stats:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Redirect to original URL and increment view count
     *
     * @param req - Request with shortCode in params
     * @param res - Response object (performs redirect)
     */
    static async redirectToOriginal(
        req: Request<{ shortCode: string }>,
        res: Response
    ): Promise<Response | void> {
        try {
            const { shortCode } = req.params;

            const urlService = new UrlService(shortCode);
            const result = await urlService.getUrlAndIncrementViews();

            // If URL not found, return error
            if (!result) {
                return res.status(404).json({ error: 'Short URL not found' });
            }

            // Redirect to original URL
            return res.redirect(result.originalUrl);

        } catch (error) {
            console.error('Error redirecting:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Health check endpoint
     *
     * @param _req - Request (prefixed with _ because unused)
     * @param res - Response object
     */
    static healthCheck(_req: Request, res: Response): Response {
        return res.json({ message: 'URL Shortener API' });
    }
}
