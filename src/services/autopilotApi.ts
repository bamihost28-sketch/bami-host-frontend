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

export interface AutopilotAction {
  id: string;
  skill: string;
  action_type: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "executing" | "done" | "dismissed";
  title: string;
  description: string;
  content: string | null;
  platform: string | null;
  trigger_event: string | null;
  trigger_context: Record<string, any>;
  recipients: Array<{ name: string; phone: string; email: string }>;
  auto_execute: boolean;
  executed_at: string | null;
  execution_result: Record<string, any>;
  created_at: string;
}

export interface AutopilotStats {
  pending: number;
  done: number;
  dismissed: number;
  total: number;
  by_skill: Record<string, number>;
}

export const autopilotApi = createApi({
  reducerPath: "autopilotApi",
  baseQuery,
  tagTypes: ["AutopilotActions", "AutopilotStats"],
  endpoints: (builder) => ({
    getQueue: builder.query<{ data: AutopilotAction[] }, { status?: string }>({
      query: ({ status = "pending" } = {}) => `/api/autopilot/queue?status=${status}`,
      providesTags: ["AutopilotActions"],
    }),
    getStats: builder.query<AutopilotStats, void>({
      query: () => "/api/autopilot/stats",
      providesTags: ["AutopilotStats"],
    }),
    generateActions: builder.mutation<{ generated: number; actions: AutopilotAction[] }, void>({
      query: () => ({ url: "/api/autopilot/generate", method: "POST" }),
      invalidatesTags: ["AutopilotActions", "AutopilotStats"],
    }),
    executeAction: builder.mutation<{ success: boolean; result: any }, { id: string; recipients?: any[] }>({
      query: ({ id, recipients }) => ({
        url: `/api/autopilot/execute/${id}`,
        method: "POST",
        body: { recipients },
      }),
      invalidatesTags: ["AutopilotActions", "AutopilotStats"],
    }),
    dismissAction: builder.mutation<{ dismissed: boolean }, string>({
      query: (id) => ({ url: `/api/autopilot/dismiss/${id}`, method: "PUT" }),
      invalidatesTags: ["AutopilotActions", "AutopilotStats"],
    }),
    generateContent: builder.mutation<{ platform: string; content: string }, { platform: string; topic: string; context?: string }>({
      query: (body) => ({ url: "/api/autopilot/generate-content", method: "POST", body }),
    }),
    getChatHistory: builder.query<{ history: Array<{role: string; content: string; created_at?: string}> }, void>({
      query: () => "/api/coach/history",
    }),
    getEmailProspects: builder.query<{ count: number; prospects: any[] }, void>({
      query: () => "/api/autopilot/email-campaign/prospects",
    }),
    sendEmailCampaign: builder.mutation<{ sent: number; failed: number; total: number; results: any[] }, {
      subject: string; body: string; recipients: any[]; ai_personalize?: boolean;
    }>({
      query: (body) => ({ url: "/api/autopilot/email-campaign", method: "POST", body }),
    }),
    getAutopilotSettings: builder.query<{
      auto_execute_types: string[]; enabled: boolean; daily_scan_enabled: boolean;
      notify_high_priority: boolean; notify_all: boolean;
    }, void>({
      query: () => "/api/autopilot/settings",
      providesTags: ["AutopilotActions"],
    }),
    updateAutopilotSettings: builder.mutation<{ success: boolean }, {
      auto_execute_types?: string[]; enabled?: boolean; daily_scan_enabled?: boolean;
      notify_high_priority?: boolean; notify_all?: boolean;
    }>({
      query: (body) => ({ url: "/api/autopilot/settings", method: "PUT", body }),
      invalidatesTags: ["AutopilotActions"],
    }),
    runAutoExecute: builder.mutation<{ executed: number; total_eligible: number }, void>({
      query: () => ({ url: "/api/autopilot/auto-run", method: "POST" }),
      invalidatesTags: ["AutopilotActions", "AutopilotStats"],
    }),
    getHealthScore: builder.query<{ metrics: any; score: any }, void>({
      query: () => "/api/dashboard/health-score",
    }),
    sendTenantBroadcast: builder.mutation<{ sent: number; failed: number }, {
      message: string; tenant_ids?: string[];
    }>({
      query: (body) => ({ url: "/api/autopilot/broadcast", method: "POST", body }),
    }),
    sendPaymentLinks: builder.mutation<{ sent: number; failed: number }, void>({
      query: () => ({ url: "/api/autopilot/payment-links", method: "POST" }),
      invalidatesTags: ["AutopilotActions"],
    }),
  }),
});

export const {
  useGetQueueQuery,
  useGetStatsQuery,
  useGenerateActionsMutation,
  useExecuteActionMutation,
  useDismissActionMutation,
  useGenerateContentMutation,
  useGetChatHistoryQuery,
  useGetEmailProspectsQuery,
  useSendEmailCampaignMutation,
  useGetAutopilotSettingsQuery,
  useUpdateAutopilotSettingsMutation,
  useRunAutoExecuteMutation,
  useGetHealthScoreQuery,
  useSendTenantBroadcastMutation,
  useSendPaymentLinksMutation,
} = autopilotApi;
