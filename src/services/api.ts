import { retry } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

// Fall back to the production backend when the build env is missing the URL —
// a Vercel build without VITE_BASE_API_URL once shipped a bundle whose every
// API call hit the SPA's own rewrite (HTML instead of JSON) and broke login.
export const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || 'https://staging-bami-backend.onrender.com';
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

// The backend's free hosting tier spins down after ~15 minutes idle and can
// take 60-90s to wake back up on the next request — long enough that the
// very first request after a quiet period (often exactly a login) used to
// come back as a network failure a component wasn't guarding against,
// crashing into the generic error boundary instead of just... waiting.
// Wrapping fetchBaseQuery in RTK Query's retry lets a cold start be ridden
// out silently. Genuine client errors (400s/401s — wrong password, bad
// input) bail out on the first attempt so they still surface immediately.
export function withColdStartRetry(
  rawBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
) {
  return retry(
    async (args, api, extraOptions) => {
      const result = await rawBaseQuery(args, api, extraOptions);
      if (result.error) {
        const status = result.error.status;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          retry.fail(result.error);
        }
      }
      return result;
    },
    { maxRetries: 8 }
  );
}