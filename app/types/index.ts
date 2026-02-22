/**
 * Shared TypeScript type definitions.
 * Add your app-wide interfaces and types here.
 */

// ===== User =====
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: string;
}

// ===== Book =====
export interface Book {
    id: string;
    title: string;
    author: string;
    description?: string;
    coverUrl?: string;
    genre?: string;
    pages?: number;
    publishedAt?: string;
    createdAt: string;
}

// ===== API Response =====
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
}
