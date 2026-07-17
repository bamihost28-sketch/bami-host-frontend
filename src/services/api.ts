// Fall back to the production backend when the build env is missing the URL —
// a Vercel build without VITE_BASE_API_URL once shipped a bundle whose every
// API call hit the SPA's own rewrite (HTML instead of JSON) and broke login.
export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || 'https://staging-bami-backend.onrender.com';
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';