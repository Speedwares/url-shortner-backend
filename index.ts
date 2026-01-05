import express, { Application } from 'express';
import dotenv from 'dotenv';
import urlRoutes from './routes/urlRoutes.js';
import { corsMiddleware } from './middleware/cors.js';

// Load environment variables from .env file
dotenv.config();

/**
 * Express Application Setup
 *
 * Application: TypeScript type for Express app
 */
const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000');

// Middleware Pipeline (runs in order for each request)
// 1. CORS - Allow cross-origin requests
app.use(corsMiddleware);

// 2. Body Parser - Parse JSON request bodies
app.use(express.json());

// Routes
// All routes are handled by urlRoutes
app.use('/', urlRoutes);

// Start Server
app.listen(PORT, (): void => {
    console.log(`Server running on port ${PORT}`);
});
