import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL, withColdStartRetry } from './api';

export interface UploadResponse {
  success: boolean;
  data: {
    secure_url: string;
    public_id: string;
    resource_type: 'image' | 'video';
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    duration?: number;
  };
}

export interface MediaItem {
  url: string;
  public_id: string;
}

export interface TenantHistoryEntry {
  event: string;
  note: string;
  meta: {
    condition: string;
    takenAt: string;
    photos?: MediaItem[];
    videos?: MediaItem[];
  };
}

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: withColdStartRetry(fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  })),
  tagTypes: ['Upload', 'TenantHistory'],
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return {
          url: '/api/upload/image',
          method: 'POST',
          body: formData,
          // Don't set Content-Type header, let browser set it for multipart/form-data
        };
      },
    }),
    uploadVideo: builder.mutation<UploadResponse, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return {
          url: '/api/upload/video',
          method: 'POST',
          body: formData,
        };
      },
    }),
    addTenantHistory: builder.mutation<
      { success: boolean; data: any },
      { tenantId: string; entry: TenantHistoryEntry }
    >({
      query: ({ tenantId, entry }) => ({
        url: `/api/tenants/${tenantId}/history`,
        method: 'POST',
        body: entry,
      }),
      invalidatesTags: (result, error, { tenantId }) => [
        { type: 'TenantHistory', id: tenantId },
      ],
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadVideoMutation,
  useAddTenantHistoryMutation,
} = uploadApi;