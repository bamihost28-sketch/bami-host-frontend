import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL, withColdStartRetry } from './api';

// Types
export interface ScalableImpactNotification {
    id: string;
    userId: string;
    type: 'level_completion' | 'benchmark_achieved' | 'progress_reminder' | 'milestone_reached';
    title: string;
    message: string;
    levelId?: number;
    benchmarkId?: string;
    data?: any;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
}

export interface NotificationPreferences {
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    inAppNotifications: boolean;
    levelCompletions: boolean;
    benchmarkAchievements: boolean;
    progressReminders: boolean;
    milestoneReached: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface ProgressBenchmark {
    id: string;
    levelId: number;
    benchmarkType: string;
    description: string;
    targetValue: number;
    currentValue: number;
    isCompleted: boolean;
    lastUpdated: string;
    dataSource: string;
}

export interface LevelProgress {
    levelId: number;
    title: string;
    completed: boolean;
    completionDate?: string;
    benchmarks: ProgressBenchmark[];
    overallProgress: number;
}

export interface ScalableImpactProgress {
    userId: string;
    currentLevel: number;
    levels: LevelProgress[];
    lastAssessment: string;
}

// RTK Query API
export const scalableImpactApi = createApi({
    reducerPath: 'scalableImpactApi',
    baseQuery: withColdStartRetry(fetchBaseQuery({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            headers.set('content-type', 'application/json');
            return headers;
        },
    })),
    tagTypes: ['Notifications', 'NotificationPreferences', 'Progress', 'DashboardData'],
    endpoints: (builder) => ({
        // Notification Queries
        getNotifications: builder.query<ScalableImpactNotification[], { userId: string; limit?: number }>({
            query: ({ userId, limit = 50 }) => `/scalable-impact/notifications/${userId}?limit=${limit}`,
            providesTags: ['Notifications'],
        }),
        getNotificationPreferences: builder.query<NotificationPreferences, string>({
            query: (userId) => `/scalable-impact/notification-preferences/${userId}`,
            providesTags: ['NotificationPreferences'],
        }),

        // Notification Mutations
        createNotification: builder.mutation<void, ScalableImpactNotification>({
            query: (notification) => ({
                url: '/scalable-impact/notifications',
                method: 'POST',
                body: notification,
            }),
            invalidatesTags: ['Notifications'],
        }),
        sendEmailNotification: builder.mutation<void, { userId: string; subject: string; message: string; template: string }>({
            query: (data) => ({
                url: '/notifications/email',
                method: 'POST',
                body: data,
            }),
        }),
        sendPushNotification: builder.mutation<void, { userId: string; title: string; message: string; data?: any }>({
            query: (data) => ({
                url: '/notifications/push',
                method: 'POST',
                body: data,
            }),
        }),
        markNotificationAsRead: builder.mutation<void, string>({
            query: (notificationId) => ({
                url: `/scalable-impact/notifications/${notificationId}/read`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Notifications'],
        }),
        updateNotificationPreferences: builder.mutation<void, NotificationPreferences>({
            query: (preferences) => ({
                url: `/scalable-impact/notification-preferences/${preferences.userId}`,
                method: 'PUT',
                body: preferences,
            }),
            invalidatesTags: ['NotificationPreferences'],
        }),
        scheduleReminders: builder.mutation<void, { userId: string; frequency: string }>({
            query: (data) => ({
                url: '/scalable-impact/schedule-reminders',
                method: 'POST',
                body: data,
            }),
        }),
        deleteNotifications: builder.mutation<void, string>({
            query: (userId) => ({
                url: `/scalable-impact/notifications/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notifications'],
        }),

        // Progress Queries
        getProgress: builder.query<ScalableImpactProgress, string>({
            query: (userId) => `/scalable-impact/progress/${userId}`,
            providesTags: ['Progress'],
        }),
        getWallet: builder.query<any, string>({
            query: (userId) => `/wallet/${userId}`,
            providesTags: ['DashboardData'],
        }),
        getBig5: builder.query<any, string>({
            query: (userId) => `/big5/${userId}`,
            providesTags: ['DashboardData'],
        }),
        getContacts: builder.query<any, string>({
            query: (userId) => `/contacts/${userId}`,
            providesTags: ['DashboardData'],
        }),
        getLibrary: builder.query<any, string>({
            query: (userId) => `/library/${userId}`,
            providesTags: ['DashboardData'],
        }),
        getPortfolio: builder.query<any, string>({
            query: (userId) => `/portfolio/${userId}`,
            providesTags: ['DashboardData'],
        }),
        getReports: builder.query<any, string>({
            query: (userId) => `/reports/${userId}`,
            providesTags: ['DashboardData'],
        }),

        // Progress Mutations
        updateProgress: builder.mutation<void, { userId: string; progress: ScalableImpactProgress }>({
            query: ({ userId, progress }) => ({
                url: `/scalable-impact/progress/${userId}`,
                method: 'PUT',
                body: progress,
            }),
            invalidatesTags: ['Progress'],
        }),
    }),
});

// Export hooks
export const {
    useGetNotificationsQuery,
    useGetNotificationPreferencesQuery,
    useCreateNotificationMutation,
    useSendEmailNotificationMutation,
    useSendPushNotificationMutation,
    useMarkNotificationAsReadMutation,
    useUpdateNotificationPreferencesMutation,
    useScheduleRemindersMutation,
    useDeleteNotificationsMutation,
    useGetProgressQuery,
    useGetBig5Query,
    useGetContactsQuery,
    useGetLibraryQuery,
    useGetPortfolioQuery,
    useGetReportsQuery,
    useUpdateProgressMutation,
} = scalableImpactApi;
