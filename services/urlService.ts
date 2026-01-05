import { pool } from "../db.js";
import { UrlStats, RedirectResult, UrlRow } from "../types/index.js";

/**
 * UrlService - Handles URL operations (fetch, update, stats)
 *
 * This service manages URL-related database operations
 */
export class UrlService {
    private shortCode: string;  // 'private' means only this class can access it

    /**
     * Constructor - runs when you create: new UrlService('abc123')
     * @param shortCode - The short code to work with
     */
    constructor(shortCode: string) {
        this.shortCode = shortCode;
    }

    /**
     * Get URL data from database
     * @returns URL data or null if not found
     */
    async getUrl(): Promise<UrlRow | null> {
        const result = await pool.query<UrlRow>(
            'SELECT original_url, short_code, views FROM urls WHERE short_code = $1',
            [this.shortCode]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    /**
     * Increment the view count for this URL
     * @returns void (nothing)
     */
    async incrementViews(): Promise<void> {
        await pool.query(
            'UPDATE urls SET views = views + 1 WHERE short_code = $1',
            [this.shortCode]
        );
    }

    /**
     * Get URL and increment its view count (for redirects)
     * @returns Redirect data or null if not found
     */
    async getUrlAndIncrementViews(): Promise<RedirectResult | null> {
        const url = await this.getUrl();

        if (!url) {
            return null;
        }

        await this.incrementViews();

        return {
            originalUrl: url.original_url,
            shortCode: url.short_code,
            views: url.views + 1
        };
    }

    /**
     * Get statistics for this URL
     * @returns URL stats or null if not found
     */
    async getStats(): Promise<UrlStats | null> {
        const result = await pool.query<UrlRow>(
            'SELECT original_url, short_code, views, created_at FROM urls WHERE short_code = $1',
            [this.shortCode]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const data = result.rows[0];
        return {
            shortCode: data.short_code,
            originalUrl: data.original_url,
            views: data.views,
            createdAt: data.created_at!  // '!' means "I know this exists"
        };
    }
}
