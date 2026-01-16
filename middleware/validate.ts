import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation Middleware Factory
 *
 * Enterprise pattern: Separate validation from business logic
 *
 * Usage in routes:
 * router.post('/api/shorten', validate(createShortUrlSchema), UrlController.createShortUrl);
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Validate and parse request body
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Return formatted validation errors
                res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };
};
