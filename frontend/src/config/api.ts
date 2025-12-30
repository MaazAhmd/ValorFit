/**
 * Central API configuration
 * 
 * This file contains the single source of truth for the API base URL.
 * All services should import API_BASE from this file.
 * 
 * In development: Set VITE_API_URL in .env file (optional)
 * In production: Set VITE_API_URL in environment variables
 * 
 * If not set, defaults to empty string (relative paths)
 * which works with Vite proxy in development and reverse proxy in production.
 */

export const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Helper to construct full API URLs
 */
export function apiUrl(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${normalizedPath}`;
}
