import { Request, Response, NextFunction } from 'express';

/**
 * CORS Middleware - Allows frontend to make requests to backend
 *
 * @param req - Request object
 * @param res - Response object
 * @param next - Function to call next middleware
 *
 * NextFunction: Type for the next() function in Express middleware
 */
export const corsMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): Response | void => {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests (OPTIONS method)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    // Call next middleware in chain
    next();
};
