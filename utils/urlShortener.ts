/**
 * Generate a random short code
 *
 * @param length - Number of characters (default: 6)
 * @returns Random alphanumeric string
 *
 * length: number = 6 means:
 * - Parameter named 'length'
 * - Must be a number
 * - Default value is 6 if not provided
 */
export function generateShortCode(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        shortCode += characters[randomIndex];
    }

    return shortCode;
}

/**
 * Validate if a string is a valid URL
 *
 * @param url - String to validate
 * @returns true if valid URL, false otherwise
 *
 * Uses built-in URL constructor which throws
 * an error if URL is invalid
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}
