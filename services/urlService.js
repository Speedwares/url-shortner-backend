import { pool } from "../db.js";

export class UrlService {
    constructor(shortCode) {
        this.shortCode = shortCode;
    }

    async getUrl() {
        const result = await pool.query(
            'SELECT original_url, short_code, views FROM urls WHERE short_code = $1',
            [this.shortCode]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    async incrementViews() {
        await pool.query(
            'UPDATE urls SET views = views + 1 WHERE short_code = $1',
            [this.shortCode]
        );
    }

    async getUrlAndIncrementViews() {
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

    async getStats() {
        const result = await pool.query(
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
            createdAt: data.created_at
        };
    }
}