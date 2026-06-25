import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BlockType = 'signal' | 'noise' | 'reminder' | 'neutral';

export interface Mission {
  id: string;
  title: string;
  deadline: string | null;
  completed: boolean;
  missionDate: string;
  sortOrder: number;
  createdAt: string;
}

export interface SummaryResponse {
  success: boolean;
  date: string;
  windowHours: number;
  missionsTotal: number;
  missionsDone: number;
  snrScore: number;
  missions: Mission[];
}

export interface TimeBlock {
  id: string;
  blockDate: string;
  timeLabel: string;
  activity: string;
  blockType: BlockType;
  note: string | null;
}

export interface KingsAuditItem {
  id: string;
  bucket: 'low' | 'high';
  text: string;
}

export interface KingsAuditResponse {
  success: boolean;
  low: KingsAuditItem[];
  high: KingsAuditItem[];
}

export interface TimeValueProfile {
  weeklyHours: number;
  weeklyIncome: number;
  hourlyRate: number;
  outsourceThreshold: number;
  delegate: string[];
  outsource: string[];
  automate: string[];
  delete: string[];
}

export interface AnalyticsResponse {
  success: boolean;
  days: number;
  daily: { date: string; total: number; done: number; snr: number | null }[];
  streak: number;
  completionRate: number;
  timeSplit: { signal: number; noise: number; reminder: number; neutral: number };
  timeSnr: number;
  kingsSplit: { high: number; low: number };
}

// ── API ───────────────────────────────────────────────────────────────────────

export const billionaireApi = createApi({
  reducerPath: 'billionaireApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Summary', 'Mission', 'TimeBlock', 'KingsAudit', 'TimeValue', 'Analytics'],
  endpoints: (builder) => ({

    // ── dashboard ────────────────────────────────────────────────────────────
    getSummary: builder.query<SummaryResponse, { day?: string } | void>({
      query: (params) => `/api/billionaire/summary${params?.day ? `?day=${params.day}` : ''}`,
      providesTags: ['Summary', 'Mission'],
    }),

    getAnalytics: builder.query<AnalyticsResponse, { days?: number } | void>({
      query: (params) => `/api/billionaire/analytics?days=${params?.days ?? 7}`,
      providesTags: ['Analytics', 'Mission', 'TimeBlock', 'KingsAudit'],
    }),

    // ── missions ─────────────────────────────────────────────────────────────
    listMissions: builder.query<{ success: boolean; date: string; data: Mission[] }, { day?: string } | void>({
      query: (params) => `/api/billionaire/missions${params?.day ? `?day=${params.day}` : ''}`,
      providesTags: ['Mission'],
    }),

    createMission: builder.mutation<{ success: boolean; data: Mission }, { title: string; deadline?: string; missionDate?: string }>({
      query: (body) => ({ url: '/api/billionaire/missions', method: 'POST', body }),
      invalidatesTags: ['Mission', 'Summary', 'Analytics'],
    }),

    updateMission: builder.mutation<{ success: boolean; data: Mission }, { id: string; body: { title?: string; deadline?: string; completed?: boolean } }>({
      query: ({ id, body }) => ({ url: `/api/billionaire/missions/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Mission', 'Summary', 'Analytics'],
    }),

    deleteMission: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/api/billionaire/missions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Mission', 'Summary', 'Analytics'],
    }),

    rolloverMissions: builder.mutation<{ success: boolean; carried: number; date: string; data: Mission[] }, { fromDate?: string; toDate?: string }>({
      query: (body) => ({ url: '/api/billionaire/missions/rollover', method: 'POST', body }),
      invalidatesTags: ['Mission', 'Summary', 'Analytics'],
    }),

    // ── time blocks ──────────────────────────────────────────────────────────
    listTimeBlocks: builder.query<{ success: boolean; data: TimeBlock[] }, { day?: string; start?: string; end?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.day) q.set('day', params.day);
        if (params?.start) q.set('start', params.start);
        if (params?.end) q.set('end', params.end);
        return `/api/billionaire/time-blocks?${q}`;
      },
      providesTags: ['TimeBlock'],
    }),

    createTimeBlock: builder.mutation<{ success: boolean; data: TimeBlock }, { blockDate?: string; timeLabel: string; activity: string; blockType?: BlockType; note?: string }>({
      query: (body) => ({ url: '/api/billionaire/time-blocks', method: 'POST', body }),
      invalidatesTags: ['TimeBlock', 'Analytics'],
    }),

    updateTimeBlock: builder.mutation<{ success: boolean; data: TimeBlock }, { id: string; body: Partial<Pick<TimeBlock, 'timeLabel' | 'activity' | 'blockType' | 'note'>> }>({
      query: ({ id, body }) => ({ url: `/api/billionaire/time-blocks/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['TimeBlock', 'Analytics'],
    }),

    deleteTimeBlock: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/api/billionaire/time-blocks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TimeBlock', 'Analytics'],
    }),

    seedTimeBlocks: builder.mutation<{ success: boolean; data: TimeBlock[] }, { blockDate?: string }>({
      query: (body) => ({ url: '/api/billionaire/time-blocks/seed', method: 'POST', body }),
      invalidatesTags: ['TimeBlock', 'Analytics'],
    }),

    // ── king's audit ─────────────────────────────────────────────────────────
    getKingsAudit: builder.query<KingsAuditResponse, void>({
      query: () => '/api/billionaire/kings-audit',
      providesTags: ['KingsAudit'],
    }),

    createKingsAuditItem: builder.mutation<{ success: boolean; data: KingsAuditItem }, { bucket: 'low' | 'high'; text: string }>({
      query: (body) => ({ url: '/api/billionaire/kings-audit', method: 'POST', body }),
      invalidatesTags: ['KingsAudit', 'Analytics'],
    }),

    deleteKingsAuditItem: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/api/billionaire/kings-audit/${id}`, method: 'DELETE' }),
      invalidatesTags: ['KingsAudit', 'Analytics'],
    }),

    seedKingsAudit: builder.mutation<KingsAuditResponse, void>({
      query: () => ({ url: '/api/billionaire/kings-audit/seed', method: 'POST' }),
      invalidatesTags: ['KingsAudit', 'Analytics'],
    }),

    // ── time value ───────────────────────────────────────────────────────────
    getTimeValue: builder.query<{ success: boolean; data: TimeValueProfile }, void>({
      query: () => '/api/billionaire/time-value',
      providesTags: ['TimeValue'],
    }),

    updateTimeValue: builder.mutation<{ success: boolean; data: TimeValueProfile }, Partial<{ weeklyHours: number; weeklyIncome: number; delegate: string[]; outsource: string[]; automate: string[]; delete: string[] }>>({
      query: (body) => ({ url: '/api/billionaire/time-value', method: 'PUT', body }),
      invalidatesTags: ['TimeValue'],
    }),

  }),
});

export const {
  useGetSummaryQuery,
  useGetAnalyticsQuery,
  useListMissionsQuery,
  useCreateMissionMutation,
  useUpdateMissionMutation,
  useDeleteMissionMutation,
  useRolloverMissionsMutation,
  useListTimeBlocksQuery,
  useCreateTimeBlockMutation,
  useUpdateTimeBlockMutation,
  useDeleteTimeBlockMutation,
  useSeedTimeBlocksMutation,
  useGetKingsAuditQuery,
  useCreateKingsAuditItemMutation,
  useDeleteKingsAuditItemMutation,
  useSeedKingsAuditMutation,
  useGetTimeValueQuery,
  useUpdateTimeValueMutation,
} = billionaireApi;
