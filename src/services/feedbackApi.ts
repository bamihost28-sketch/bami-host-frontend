import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

export interface Feedback {
  id: string;
  subject: string;
  message: string;
  category: string;
  rating?: number | null;
  status: 'new' | 'reviewed' | 'in_progress' | 'done' | 'dismissed';
  submitted_by?: string;
  submitted_by_role?: string;
  tenant?: string | null;
  estate?: string | null;
  admin_response?: string | null;
  responded_by?: string | null;
  responded_at?: string | null;
  created_at: string;
  updated_at?: string;
}

interface FeedbackListResponse {
  success: boolean;
  count: number;
  total: number;
  total_pages: number;
  page: number;
  data: Feedback[];
}

interface FeedbackStatsResponse {
  success: boolean;
  data: Record<string, number>;
}

export interface CreateFeedbackBody {
  subject: string;
  message: string;
  category: string;
  rating?: number;
}

export interface RespondFeedbackBody {
  id: string;
  status?: string;
  admin_response?: string;
}

export const feedbackApi = createApi({
  reducerPath: 'feedbackApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Feedback'],
  endpoints: (builder) => ({
    getFeedback: builder.query<FeedbackListResponse, { status?: string; category?: string; page?: number; limit?: number } | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.status) qs.set('status', params.status);
        if (params?.category) qs.set('category', params.category);
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        const q = qs.toString();
        return `/api/feedback${q ? `?${q}` : ''}`;
      },
      providesTags: ['Feedback'],
    }),
    getFeedbackStats: builder.query<FeedbackStatsResponse, void>({
      query: () => '/api/feedback/stats',
      providesTags: ['Feedback'],
    }),
    createFeedback: builder.mutation<{ success: boolean; data: Feedback }, CreateFeedbackBody>({
      query: (body) => ({ url: '/api/feedback', method: 'POST', body }),
      invalidatesTags: ['Feedback'],
    }),
    respondFeedback: builder.mutation<{ success: boolean; data: Feedback }, RespondFeedbackBody>({
      query: ({ id, ...body }) => ({ url: `/api/feedback/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Feedback'],
    }),
    deleteFeedback: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/api/feedback/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Feedback'],
    }),
  }),
});

export const {
  useGetFeedbackQuery,
  useGetFeedbackStatsQuery,
  useCreateFeedbackMutation,
  useRespondFeedbackMutation,
  useDeleteFeedbackMutation,
} = feedbackApi;
