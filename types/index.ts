// Service return types
export interface CreateShortUrlResult {
    exists: boolean;           // Does the URL already exist?
    shortCode: string;         // The generated short code
    originalUrl: string;       // The original URL
}

export interface UrlStats {
    shortCode: string;         // The short code
    originalUrl: string;       // The original URL
    views: number;             // Number of views
    createdAt: Date;           // When it was created
}

export interface RedirectResult {
    originalUrl: string;       // URL to redirect to
    shortCode: string;         // The short code
    views: number;             // Updated view count
}

// Database row types
export interface UrlRow {
    id?: number;
    original_url: string;
    short_code: string;
    views: number;
    created_at?: Date;
}

// Request body types
export interface CreateShortUrlBody {
    url: string;               // The URL to shorten
}
