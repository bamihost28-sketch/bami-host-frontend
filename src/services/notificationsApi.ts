import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from './api';

export interface Notification {
  id: string;
  _id?: string;
  title?: string;
  message: string;
  isRead: boolean;
  type?: string;
  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  data: Notification[];
}

interface NotificationCountResponse {
  success: boolean;
  unreadCount: number;
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => '/api/notifications',
      providesTags: ['Notifications'],
    }),
    getNotificationCount: builder.query<NotificationCountResponse, void>({
      query: () => '/api/notifications/count',
      providesTags: ['Notifications'],
    }),
    markAllRead: builder.mutation<void, void>({
      query: () => ({ url: '/api/notifications/read-all', method: 'PUT' }),
      invalidatesTags: ['Notifications'],
    }),
    markRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/notifications/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationCountQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
