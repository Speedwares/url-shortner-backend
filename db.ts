import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL connection pool
 *
 * Pool: Manages multiple database connections efficiently
 * Instead of creating a new connection for each query,
 * it reuses connections from a pool
 */
export const pool: Pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),  // parseInt: convert string to number
    database: process.env.DB_NAME || 'urlshortener',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
});

// Event: Fires when connection is established
pool.on('connect', () => {
    console.log('PostgreSQL Database Connected');
});

// Event: Fires when unexpected error occurs
pool.on('error', (err: Error) => {  // err: Error means err is an Error object
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
