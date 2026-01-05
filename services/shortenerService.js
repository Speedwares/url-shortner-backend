import {pool} from './../db.js'

export class ShortenerService {
    constructor(url) {
        this.url = url;
    }

    async doesUrlExist() {

        console.log("url", this.url)
        // Check if URL already exists

        const existingUrl = await pool.query(
            'SELECT short_code FROM urls WHERE original_url = $1',
            [this.url]
        );

        return existingUrl.rows
    }

    async generate() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let shortCode = '';
        let shortCodeLength = 6;

        for (let i = 0; i < shortCodeLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            shortCode += characters[randomIndex];
        }

        return shortCode;
    }

    async createShortUrl() {
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
        let shortCode;
        let isUnique = false;

        while (!isUnique) {
            shortCode = await this.generate();
            const result = await pool.query(
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
            [this.url, shortCode]
        );

        return {
            exists: false,
            shortCode,
            originalUrl: this.url
        };
    }

    async updateShortnerData(shortCode) {
        console.log("shortcode: ", shortCode)
    }
}