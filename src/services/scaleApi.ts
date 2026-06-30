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

export interface LevelRow { level: number; name: string; done: boolean; progress: string; }
export interface StatedPlan {
  has_plan: boolean;
  target_revenue: number | null;
  target_profit: number | null;
  target_valuation: number | null;
  why_summary: string | null;
}
export interface ScaleOverview {
  current_level: number;
  levels: LevelRow[];
  promoters: number;
  promoter_target: number;
  months_above_target: number;
  monthly_target: number;
  stated_plan?: StatedPlan;
}
export interface NpsData {
  promoters: number; passives: number; detractors: number; responses: number;
  total_tenants: number; nps_score: number; target: number; progress_pct: number;
  scores: { id: string; name: string; unit: string; score: number | null; connected: boolean }[];
}
export interface GrowthScorecard {
  stages: { stage: string; metric: number | string; sub: string }[];
  monthly_revenue: { month: string; revenue: number }[];
  occupancy_pct: number; conversion_pct: number; bottleneck: string; monthly_target: number;
}
export interface ScorecardMetric { label: string; value: string | number; status: "green" | "amber" | "red"; }
export interface CompanyScorecard {
  evergreen: ScorecardMetric[];
  north_star: ScorecardMetric[];
  teams: { team: string; metric: number }[];
  as_of: string;
}
export interface VeStage { name: string; metric: number | string; agent: string | null; agent2?: string; power: boolean; terminus?: boolean; }
export interface ValueEngine { name: string; subtitle: string; stages: VeStage[]; }
export interface ValueEnginesData { engines: ValueEngine[]; }
export interface FinancePlan {
  exists: boolean;
  target_monthly_salary: number; living_expenses: number; target_profit_pct: number;
  emergency_fund_target: number; emergency_fund_current: number; expense_ratios: Record<string, number>;
  avg_monthly_revenue: number; recommended_salary: number; salary_gap?: number; emergency_fund_pct: number;
}

export const scaleApi = createApi({
  reducerPath: "scaleApi",
  baseQuery,
  tagTypes: ["Scale", "Nps", "FinancePlan"],
  endpoints: (b) => ({
    getScaleOverview: b.query<ScaleOverview, void>({
      query: () => "/api/scale/overview",
      providesTags: ["Scale"],
    }),
    getNps: b.query<NpsData, void>({
      query: () => "/api/scale/nps",
      providesTags: ["Nps"],
    }),
    requestNps: b.mutation<{ sent: number; total_connected: number; message: string }, void>({
      query: () => ({ url: "/api/scale/nps/request", method: "POST" }),
      invalidatesTags: ["Nps", "Scale"],
    }),
    getGrowthScorecard: b.query<GrowthScorecard, void>({
      query: () => "/api/scale/growth-scorecard",
    }),
    getScorecard: b.query<CompanyScorecard, void>({
      query: () => "/api/scale/scorecard",
    }),
    getValueEngines: b.query<ValueEnginesData, void>({
      query: () => "/api/scale/value-engines",
    }),
    getFinancePlan: b.query<FinancePlan, void>({
      query: () => "/api/scale/finance-plan",
      providesTags: ["FinancePlan"],
    }),
    updateFinancePlan: b.mutation<{ success: boolean }, Partial<FinancePlan>>({
      query: (body) => ({ url: "/api/scale/finance-plan", method: "PUT", body }),
      invalidatesTags: ["FinancePlan", "Scale"],
    }),
  }),
});

export const {
  useGetScaleOverviewQuery,
  useGetNpsQuery,
  useRequestNpsMutation,
  useGetGrowthScorecardQuery,
  useGetScorecardQuery,
  useGetValueEnginesQuery,
  useGetFinancePlanQuery,
  useUpdateFinancePlanMutation,
} = scaleApi;
