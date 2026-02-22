/**
 * App-wide constants
 */

export const APP_NAME = "বই পড়া";
export const APP_NAME_EN = "Boi Pora";
export const APP_DESCRIPTION = "আপনার ডিজিটাল পড়ার সঙ্গী";

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
} as const;

export const ROUTES = {
    HOME: "/",
    ABOUT: "/about",
    CONTACT: "/contact",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    SETTINGS: "/dashboard/settings",
} as const;
