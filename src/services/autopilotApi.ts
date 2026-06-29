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
      query: ({ status = "pending" } = {}) => `/api/v1/autopilot/queue?status=${status}`,
      providesTags: ["AutopilotActions"],
    }),
    getStats: builder.query<AutopilotStats, void>({
      query: () => "/api/v1/autopilot/stats",
      providesTags: ["AutopilotStats"],
    }),
    generateActions: builder.mutation<{ generated: number; actions: AutopilotAction[] }, void>({
      query: () => ({ url: "/api/v1/autopilot/generate", method: "POST" }),
      invalidatesTags: ["AutopilotActions", "AutopilotStats"],
    }),
    executeAction: builder.mutation<{ success: boolean; result: any }, { id: string; recipients?: any[] }>({
      query: ({ id, recipients }) => ({
        url: `/api/v1/autopilot/execute/${id}`,
        method: "POST",
        body: { recipients },
      }),
      invalidatesTags: ["AutopilotActions", "AutopilotStats"],
    }),
    dismissAction: builder.mutation<{ dismissed: boolean }, string>({
      query: (id) => ({ url: `/api/v1/autopilot/dismiss/${id}`, method: "PUT" }),
      invalidatesTags: ["AutopilotActions", "AutopilotStats"],
    }),
    generateContent: builder.mutation<{ platform: string; content: string }, { platform: string; topic: string; context?: string }>({
      query: (body) => ({ url: "/api/v1/autopilot/generate-content", method: "POST", body }),
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
} = autopilotApi;
