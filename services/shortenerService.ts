import { pool } from './../db.js';
import { CreateShortUrlResult, UrlRow } from '../types/index.js';

/**
 * ShortenerService - Handles URL shortening logic
 */
export class ShortenerService {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    /**
     * Check if this URL already exists in database
     * @returns Array of matching URLs (empty if not found)
     */
    async doesUrlExist(): Promise<UrlRow[]> {
        console.log("url", this.url);

        const existingUrl = await pool.query<UrlRow>(
            'SELECT short_code FROM urls WHERE original_url = $1',
            [this.url]
        );

        return existingUrl.rows;
    }

    /**
     * Generate a random short code
     * @returns 6-character random string
     */
    async generate(): Promise<string> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let shortCode = '';
        const shortCodeLength = 6;

        for (let i = 0; i < shortCodeLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            shortCode += characters[randomIndex];
        }

        return shortCode;
    }

    /**
     * Create a short URL (or return existing one)
     * @returns Result with short code and whether it already existed
     */
    async createShortUrl(): Promise<CreateShortUrlResult> {
        // Check if URL already exists
        const existing = await this.doesUrlExist();

        if (existing.length > 0) {
            return {
                exists: true,
                shortCode: existing[0].short_code,
                originalUrl: this.url
            };
        }

        // Generate unique short code
        let shortCode: string;
        let isUnique = false;

        while (!isUnique) {
            shortCode = await this.generate();
            const result = await pool.query<{ id: number }>(
                'SELECT id FROM urls WHERE short_code = $1',
                [shortCode]
            );
            if (result.rows.length === 0) {
                isUnique = true;
            }
        }

        // Insert new URL
        await pool.query(
            'INSERT INTO urls (original_url, short_code) VALUES ($1, $2)',
            [this.url, shortCode!]  // '!' because we know it's defined
        );

        return {
            exists: false,
            shortCode: shortCode!,
            originalUrl: this.url
        };
    }

    /**
     * Update shortener data (placeholder for future use)
     */
    async updateShortnerData(shortCode: string): Promise<void> {
        console.log("shortcode: ", shortCode);
    }
}
