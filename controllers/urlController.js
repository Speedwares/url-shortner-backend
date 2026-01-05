import { isValidUrl } from '../utils/urlShortener.js';
import { ShortenerService } from '../services/shortenerService.js';
import { UrlService } from '../services/urlService.js';

export class UrlController {
    // Create short URL
    static async createShortUrl(req, res) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({ error: 'URL is required' });
            }

            if (!isValidUrl(url)) {
                return res.status(400).json({ error: 'Invalid URL format' });
            }

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

            res.status(201).json({
                shortCode: result.shortCode,
                shortUrl: `${req.protocol}://${req.get('host')}/${result.shortCode}`,
                originalUrl: result.originalUrl
            });

        } catch (error) {
            console.error('Error creating short URL:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get URL stats
    static async getStats(req, res) {
        try {
            const { shortCode } = req.params;

            const urlService = new UrlService(shortCode);
            const stats = await urlService.getStats();

            if (!stats) {
                return res.status(404).json({ error: 'Short URL not found' });
            }

            res.json(stats);

        } catch (error) {
            console.error('Error getting stats:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Redirect short URL
    static async redirectToOriginal(req, res) {
        try {
            const { shortCode } = req.params;

            const urlService = new UrlService(shortCode);
            const result = await urlService.getUrlAndIncrementViews();

            if (!result) {
                return res.status(404).json({ error: 'Short URL not found' });
            }

            res.redirect(result.originalUrl);

        } catch (error) {
            console.error('Error redirecting:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Health check
    static healthCheck(req, res) {
        res.json({ message: 'URL Shortener API' });
    }
}
