import { z } from 'zod';

/**
 * Example: Create Short URL Request Schema
 * 
 * This schema:
 * 1. Validates incoming request data
 */

/**
 * EXAMPLE: Create Short URL Request Schema
 *
 * This schema:
 * 1. Validates incoming request data
 * 2. Generates TypeScript type automatically
 * 3. Provides clear error messages
 */

export const createShortUrlSchema = z.object({
    url: z.url()
})

export const createShortUrlResultSchema = z.object({
    exists: z.boolean(),
    originalUrl: z.url(),
    shortCode: z.string(),
})

export const urlStatsSchema = z.object({
    shortCode: z.string().min(5),      // The short code
    originalUrl: z.url(),       // The original URL
    views: z.number(),             // Number of views
    createdAt: z.date(),   
})

export const redirectResultSchema = z.object({
     shortCode: z.string().min(5),      // The short code
    originalUrl: z.url(),       // The original URL
    views: z.number(),      
})

export const urlRowSchema = z.object({
    id: z.number().optional(),
    short_code: z.string().min(5),      // The short code
    original_url: z.url(),      // The original URL
    views: z.number(),
    created_at: z.date(),
})

// Inferred TypeScript type (automatically generated from schema)
export type CreateShortUrlRequest = z.infer<typeof createShortUrlSchema>;


export type CreateShortUrlResult = z.infer<typeof createShortUrlResultSchema>

export type UrlRow = z.infer<typeof urlRowSchema>;
export type RedirectResult = z.infer<typeof redirectResultSchema>;
export type UrlStats = z.infer<typeof urlStatsSchema>;