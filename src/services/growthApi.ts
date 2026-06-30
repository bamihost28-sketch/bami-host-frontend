import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_API_URL } from "./api";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

export interface GrowthPlan {
  exists: boolean;
  data: Record<string, any>;
  current_step: number | null;
  stated_level: number | null;
  target_revenue: number | null;
  target_profit: number | null;
  target_valuation: number | null;
  why_summary: string | null;
  updated_at?: string | null;
}

export interface SaveGrowthPlanBody {
  data?: Record<string, any>;
  current_step?: number;
  stated_level?: number;
  target_revenue?: number;
  target_profit?: number;
  target_valuation?: number;
  why_summary?: string;
}

export const growthApi = createApi({
  reducerPath: "growthApi",
  baseQuery,
  tagTypes: ["GrowthPlan"],
  endpoints: (b) => ({
    getGrowthPlan: b.query<GrowthPlan, void>({
      query: () => "/api/growth/plan",
      providesTags: ["GrowthPlan"],
    }),
    saveGrowthPlan: b.mutation<{ success: boolean }, SaveGrowthPlanBody>({
      query: (body) => ({ url: "/api/growth/plan", method: "PUT", body }),
      // do NOT invalidate — we don't want to refetch & clobber local edits mid-session
    }),
  }),
});

export const { useGetGrowthPlanQuery, useSaveGrowthPlanMutation } = growthApi;
