const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const { generateShortCode, isValidUrl } = require('./utils/urlShortener');

const app = express();

const PORT = process.env.PORT || 3000;

//Middleware
// Manual CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());



//Routes
app.get('/', (req, res) => {
    res.json({ message: 'URL Shortener API' });
});

// Create short URL
app.post('/api/shorten', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        if (!isValidUrl(url)) {
            return res.status(400).json({ error: 'Invalid URL format' });
        }

        // Check if URL already exists
        const existingUrl = await pool.query(
            'SELECT short_code FROM urls WHERE original_url = $1',
            [url]
        );

        if (existingUrl.rows.length > 0) {
            return res.json({
                shortCode: existingUrl.rows[0].short_code,
                shortUrl: `${req.protocol}://${req.get('host')}/${existingUrl.rows[0].short_code}`,
                message: 'URL already shortened'
            });
        }

        // Generate unique short code
        let shortCode;
        let isUnique = false;

        while (!isUnique) {
            shortCode = generateShortCode();
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
            [url, shortCode]
        );

        res.status(201).json({
            shortCode,
            shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
            originalUrl: url
        });

    } catch (error) {
        console.error('Error creating short URL:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get URL stats
app.get('/api/stats/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;

        const result = await pool.query(
            'SELECT original_url, short_code, views, created_at FROM urls WHERE short_code = $1',
            [shortCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        res.json({
            shortCode: result.rows[0].short_code,
            originalUrl: result.rows[0].original_url,
            views: result.rows[0].views,
            createdAt: result.rows[0].created_at
        });

    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Redirect short URL
app.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;

        const result = await pool.query(
            'SELECT original_url FROM urls WHERE short_code = $1',
            [shortCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        // Increment view count
        await pool.query(
            'UPDATE urls SET views = views + 1 WHERE short_code = $1',
            [shortCode]
        );

        res.redirect(result.rows[0].original_url);

    } catch (error) {
        console.error('Error redirecting:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});