// Stub file for materials API
// This is a placeholder to prevent build errors
// The full implementation will be added when the materials feature is complete

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { withColdStartRetry } from './api';

export const materialsApi = createApi({
  reducerPath: 'materialsApi',
  baseQuery: withColdStartRetry(fetchBaseQuery({ baseUrl: '/api' })),
  endpoints: (builder) => ({
    getMaterials: builder.query({
      query: () => '/materials',
    }),
    getMaterial: builder.query({
      query: (id: string) => `/materials/${id}`,
    }),
    getMaterialsByFolder: builder.query({
      query: (folderId: string) => `/materials/folder/${folderId}`,
    }),
    searchMaterials: builder.query({
      query: (params: any) => ({
        url: '/materials/search',
        params,
      }),
    }),
    getMyMaterials: builder.query({
      query: () => '/materials/my',
    }),
    createMaterial: builder.mutation({
      query: (data: any) => ({
        url: '/materials',
        method: 'POST',
        body: data,
      }),
    }),
    updateMaterial: builder.mutation({
      query: ({ id, ...data }: any) => ({
        url: `/materials/${id}`,
        method: 'PUT',
        body: data,
      }),
    }),
    deleteMaterial: builder.mutation({
      query: (id: string) => ({
        url: `/materials/${id}`,
        method: 'DELETE',
      }),
    }),
    updateMaterialView: builder.mutation({
      query: (id: string) => ({
        url: `/materials/${id}/view`,
        method: 'POST',
      }),
    }),
    downloadMaterial: builder.mutation({
      query: (id: string) => ({
        url: `/materials/${id}/download`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetMaterialsQuery,
  useGetMaterialQuery,
  useGetMaterialsByFolderQuery,
  useSearchMaterialsQuery,
  useGetMyMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useUpdateMaterialViewMutation,
  useDownloadMaterialMutation,
} = materialsApi;
