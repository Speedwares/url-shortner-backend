# URL Shortener Service Tutorial

A complete step-by-step guide to building a URL shortener backend service using Node.js, Express, and PostgreSQL.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Database Setup](#database-setup)
4. [Creating the Database Configuration](#creating-the-database-configuration)
5. [Database Schema](#database-schema)
6. [URL Shortening Utility](#url-shortening-utility)
7. [Building the API Endpoints](#building-the-api-endpoints)
8. [Testing the API](#testing-the-api)
9. [Complete Code Overview](#complete-code-overview)

---

## Prerequisites

Before starting, ensure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager
- A code editor (VS Code, Sublime, etc.)

---

## Project Setup

### Step 1: Initialize the Project

First, create a new directory and initialize a Node.js project:

```bash
mkdir url-shortener-backend
cd url-shortener-backend
npm init -y
```

### Step 2: Install Dependencies

Install the required packages:

```bash
npm install express pg cors dotenv
```

**Packages explained:**
- `express`: Web framework for Node.js
- `pg`: PostgreSQL client for Node.js
- `cors`: Enable Cross-Origin Resource Sharing
- `dotenv`: Load environment variables from .env file

### Step 3: Create Environment Variables

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following configuration:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=urlshortener
DB_USER=postgres
DB_PASSWORD=your_password_here
```

**Important:** Replace `your_password_here` with your actual PostgreSQL password.

---

## Database Setup

### Step 4: Create PostgreSQL Database

Open your PostgreSQL terminal or client and create the database:

```sql
CREATE DATABASE urlshortener;
```

Verify the database was created:

```sql
\l
```

You should see `urlshortener` in the list of databases.

---

## Creating the Database Configuration

### Step 5: Create Database Connection Module

Create a file named `db.js` in the project root:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'urlshortener',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

pool.on('connect', () => {
    console.log('PostgreSQL Database Connected');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;
```

**What this does:**
- Creates a connection pool to PostgreSQL
- Loads database credentials from environment variables
- Provides connection event handlers for logging and error handling
- Exports the pool for use in other files

---

## Database Schema

### Step 6: Create Database Schema

Create a file named `schema.sql`:

```sql
-- Create database (run this separately if database doesn't exist)
-- CREATE DATABASE urlshortener;

-- Connect to the database before running the following:

-- Create urls table
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on short_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
```

**Table structure explained:**
- `id`: Auto-incrementing primary key
- `original_url`: The full URL to be shortened
- `short_code`: The unique shortened code (e.g., "aBc123")
- `views`: Counter for tracking how many times the URL has been accessed
- `created_at`: Timestamp when the URL was created
- `idx_short_code`: Index for fast lookups by short code

### Step 7: Create Database Initialization Script

Create a file named `initDb.js`:

```javascript
const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schema);
        console.log('Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDatabase();
```

**Run the initialization script:**

```bash
node initDb.js
```

You should see: `Database initialized successfully`

---

## URL Shortening Utility

### Step 8: Create Utility Functions

Create a folder named `utils` and a file `utils/urlShortener.js`:

```bash
mkdir utils
touch utils/urlShortener.js
```

Add the following code:

```javascript
function generateShortCode(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        shortCode += characters[randomIndex];
    }

    return shortCode;
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    generateShortCode,
    isValidUrl
};
```

**Functions explained:**
- `generateShortCode()`: Generates a random 6-character code using alphanumeric characters
- `isValidUrl()`: Validates if a string is a proper URL format

---

## Building the API Endpoints

### Step 9: Create the Main Server File

Update or create `index.js` with the complete server code:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const { generateShortCode, isValidUrl } = require('./utils/urlShortener');

const app = express();

const PORT = process.env.PORT || 5000;

//Middleware
app.use(cors());
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
```

### API Endpoints Explained

#### 1. POST `/api/shorten` - Create Short URL

**Request:**
```json
{
  "url": "https://www.example.com/very/long/url"
}
```

**Response:**
```json
{
  "shortCode": "aBc123",
  "shortUrl": "http://localhost:5000/aBc123",
  "originalUrl": "https://www.example.com/very/long/url"
}
```

**Logic:**
1. Validates the URL format
2. Checks if URL already exists in database
3. Generates a unique short code
4. Stores the mapping in the database
5. Returns the short URL

#### 2. GET `/api/stats/:shortCode` - Get URL Statistics

**Request:**
```
GET http://localhost:5000/api/stats/aBc123
```

**Response:**
```json
{
  "shortCode": "aBc123",
  "originalUrl": "https://www.example.com/very/long/url",
  "views": 42,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Logic:**
1. Looks up the short code in database
2. Returns URL statistics including view count

#### 3. GET `/:shortCode` - Redirect to Original URL

**Request:**
```
GET http://localhost:5000/aBc123
```

**Response:**
```
HTTP 302 Redirect to: https://www.example.com/very/long/url
```

**Logic:**
1. Looks up the short code
2. Increments the view counter
3. Redirects to the original URL

---

## Testing the API

### Step 10: Start the Server

```bash
node index.js
```

You should see:
```
Server running on port 5000
PostgreSQL Database Connected
```

### Step 11: Test with cURL or Postman

#### Test 1: Create a Short URL

```bash
curl -X POST http://localhost:5000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'
```

Expected response:
```json
{
  "shortCode": "aB3xY9",
  "shortUrl": "http://localhost:5000/aB3xY9",
  "originalUrl": "https://www.google.com"
}
```

#### Test 2: Get URL Statistics

```bash
curl http://localhost:5000/api/stats/aB3xY9
```

Expected response:
```json
{
  "shortCode": "aB3xY9",
  "originalUrl": "https://www.google.com",
  "views": 0,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### Test 3: Access Short URL (Redirect)

Open in browser:
```
http://localhost:5000/aB3xY9
```

You should be redirected to Google. Check stats again - views should increment to 1.

#### Test 4: Verify Views Incremented

```bash
curl http://localhost:5000/api/stats/aB3xY9
```

The `views` field should now be `1` or higher.

---

## Complete Code Overview

### Project Structure

```
url-shortener-backend/
├── node_modules/
├── utils/
│   └── urlShortener.js
├── .env
├── .env.example
├── db.js
├── index.js
├── initDb.js
├── schema.sql
├── package.json
└── TUTORIAL.md
```

### Files Summary

| File | Purpose |
|------|---------|
| `index.js` | Main Express server with API routes |
| `db.js` | PostgreSQL connection configuration |
| `schema.sql` | Database table schema |
| `initDb.js` | Script to initialize database tables |
| `utils/urlShortener.js` | Helper functions for URL shortening |
| `.env` | Environment variables (not in git) |
| `.env.example` | Example environment variables |

---

## How It Works: Complete Flow

### Creating a Short URL

1. User sends POST request to `/api/shorten` with original URL
2. Server validates URL format
3. Server checks if URL already exists in database
4. If exists, returns existing short code
5. If new, generates random 6-character code
6. Checks database to ensure code is unique
7. If collision, generates new code and checks again
8. Stores original URL and short code in database
9. Returns short URL to user

### Using a Short URL

1. User visits `http://localhost:5000/aBc123`
2. Server looks up `aBc123` in database
3. If found, increments view counter
4. Redirects browser to original URL
5. User reaches destination

### Viewing Statistics

1. User sends GET request to `/api/stats/aBc123`
2. Server looks up short code in database
3. Returns original URL, view count, and creation date

---

## Key Features

1. **URL Validation**: Ensures only valid URLs are shortened
2. **Duplicate Detection**: Prevents creating multiple short codes for the same URL
3. **Collision Handling**: Generates new codes if duplicates are found
4. **View Tracking**: Automatically counts each access
5. **Statistics API**: Provides insights into URL usage
6. **Error Handling**: Graceful error responses for all endpoints

---

## Next Steps and Improvements

Consider adding these features:

1. **Custom Short Codes**: Allow users to specify their own short codes
2. **Expiration Dates**: Add TTL (time-to-live) for URLs
3. **Analytics**: Track more details (referrer, user agent, geographic location)
4. **Authentication**: Require API keys for creating short URLs
5. **Rate Limiting**: Prevent abuse with request throttling
6. **QR Code Generation**: Generate QR codes for short URLs
7. **Database Indexes**: Add more indexes for better performance
8. **Caching**: Use Redis to cache frequently accessed URLs
9. **URL Preview**: Show preview of destination before redirecting
10. **Admin Dashboard**: Web interface to manage URLs

---

## Troubleshooting

### Database Connection Errors

If you see connection errors:
1. Verify PostgreSQL is running: `pg_isready`
2. Check your `.env` credentials
3. Ensure database exists: `psql -l`

### Port Already in Use

If port 5000 is busy:
1. Change `PORT` in `.env` file
2. Or kill the process using the port

### Module Not Found Errors

If you see module errors:
1. Run `npm install` to install dependencies
2. Check that all files are in correct locations

---

## Conclusion

You've successfully built a complete URL shortener service with:
- RESTful API endpoints
- PostgreSQL database integration
- URL validation and shortening
- View tracking and statistics
- Proper error handling

This service is production-ready with minor additions like authentication, rate limiting, and hosting configuration.

Happy coding!
