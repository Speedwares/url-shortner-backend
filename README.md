# URL Shortener Service

A simple and efficient URL shortener backend service built with Node.js, Express, and PostgreSQL.

## Features

- Shorten long URLs to compact codes
- Track view counts for each shortened URL
- Get statistics for any shortened URL
- Automatic duplicate detection
- RESTful API design

## Quick Start

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (use `.env.example` as template):
```bash
cp .env.example .env
```

3. Update `.env` with your PostgreSQL credentials

4. Create the database:
```bash
createdb urlshortener
```

5. Initialize database tables:
```bash
npm run init-db
```

6. Start the server:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### 1. Create Short URL
```
POST /api/shorten
Content-Type: application/json

{
  "url": "https://www.example.com/very/long/url"
}
```

### 2. Get URL Statistics
```
GET /api/stats/:shortCode
```

### 3. Redirect to Original URL
```
GET /:shortCode
```

## Complete Tutorial

For a detailed step-by-step tutorial with code examples, see [TUTORIAL.md](./TUTORIAL.md)

## Project Structure

```
backend/
├── utils/
│   └── urlShortener.js    # URL shortening utilities
├── .env                    # Environment variables (gitignored)
├── .env.example           # Example environment variables
├── db.js                  # PostgreSQL connection config
├── index.js               # Main Express server
├── initDb.js              # Database initialization script
├── schema.sql             # Database schema
├── package.json
├── README.md              # This file
└── TUTORIAL.md            # Complete tutorial
```

## License

ISC
