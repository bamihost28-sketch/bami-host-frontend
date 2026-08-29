import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  Folder,
  FoldersResponse,
  FolderResponse,
  FolderContentsResponse,
  CreateFolderRequest,
  CreateParentFolderRequest,
  CreateChildFolderRequest,
  UpdateFolderRequest,
  MoveFolderRequest,
  FoldersQueryParams,
  FolderStats,
  FolderDeletionValidation,
  FolderDeletionResponse,
  BulkDeletionRequest,
  BulkDeletionResponse
} from '../types/folders';
import { BASE_API_URL, withColdStartRetry } from './api';

export const foldersApi = createApi({
  reducerPath: 'foldersApi',
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
  tagTypes: ['Folder', 'FolderContents'],
  endpoints: (builder) => ({
    // Get all folders with optional query parameters
    getFolders: builder.query<FoldersResponse, FoldersQueryParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        Object.entries(params as any).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (key === 'parentFolder' && value === null) {
              searchParams.append(key, 'null');
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });

        const queryString = searchParams.toString();
        return `/api/folders${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Folder'],
    }),

    // Get root folders (folders without parents)
    getRootFolders: builder.query<FoldersResponse, FoldersQueryParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        searchParams.append('parentFolder', 'null');

        Object.entries(params as any).forEach(([key, value]) => {
          if (key !== 'parentFolder' && value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });

        const queryString = searchParams.toString();
        return `/api/folders?${queryString}`;
      },
      providesTags: ['Folder'],
    }),

    // Get single folder by ID
    getFolder: builder.query<FolderResponse, string>({
      query: (id) => `/api/folders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Folder', id }],
    }),

    // Get folder contents (subfolders and materials)
    getFolderContents: builder.query<FolderContentsResponse, { folderId: string; includeMaterials?: boolean; includeStats?: boolean }>({
      query: ({ folderId, includeMaterials, includeStats }) => {
        const searchParams = new URLSearchParams();
        if (includeMaterials) searchParams.append('includeMaterials', 'true');
        if (includeStats) searchParams.append('includeStats', 'true');
        
        const queryString = searchParams.toString();
        return `/api/folders/${folderId}${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result, error, { folderId }) => [
        { type: 'FolderContents', id: folderId },
        { type: 'Folder', id: folderId }
      ],
    }),

    // Get folders that can hold materials (Level 1 only)
    getFoldersForMaterials: builder.query<FoldersResponse, void>({
      query: () => '/api/folders/for-materials',
      providesTags: ['Folder'],
    }),

    // Get folder hierarchy tree view
    getFolderTree: builder.query<{ success: boolean; data: any }, void>({
      query: () => '/api/folders?view=tree',
      providesTags: ['Folder'],
    }),

    // Get folder stats
    getFolderStats: builder.query<{ success: boolean; data: FolderStats }, string | void>({
      query: (folderId) => 
        folderId ? `/api/folders/${folderId}/stats` : '/api/folders/stats',
      providesTags: ['Folder'],
    }),

    // Create parent folder (Level 0) - No parentFolder allowed
    createParentFolder: builder.mutation<FolderResponse, CreateParentFolderRequest>({
      query: (folderData) => ({
        url: '/api/folders/parent',
        method: 'POST',
        body: folderData, // No parentFolder field
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
      transformErrorResponse: (response: any) => {
        if (response.status === 400) {
          return {
            status: 400,
            data: response.data || { message: 'Parent folder creation failed' }
          };
        }
        return response;
      },
    }),

    // Create child folder (Level 1) - parentFolder required (must be Level 0)
    createChildFolder: builder.mutation<FolderResponse, CreateChildFolderRequest>({
      query: (folderData) => ({
        url: '/api/folders/child',
        method: 'POST',
        body: folderData,
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
      transformErrorResponse: (response: any) => {
        if (response.status === 400) {
          return {
            status: 400,
            data: response.data || { message: 'Child folder creation failed - parent must be Level 0 folder' }
          };
        }
        return response;
      },
    }),


    // Legacy create folder endpoint - kept for backward compatibility
    createFolder: builder.mutation<FolderResponse, CreateFolderRequest>({
      query: ({ endpoint, data }:any) => ({
        url: `/folders/${endpoint}`,
        method: 'POST',
        body: data,
      }),
    }),

    // Update existing folder
    updateFolder: builder.mutation<FolderResponse, UpdateFolderRequest>({
      query: ({ id, ...updates }) => ({
        url: `/api/folders/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Folder', id },
        { type: 'FolderContents', id },
        'Folder'
      ],
    }),

    // Validate folder deletion requirements
    validateFolderDeletion: builder.query<FolderDeletionValidation, string>({
      query: (folderId) => `/api/folders/${folderId}/validate-deletion`,
      providesTags: (result, error, folderId) => [{ type: 'Folder', id: folderId }],
    }),

    // Delete single folder with validation
    deleteFolder: builder.mutation<FolderDeletionResponse, string>({
      query: (id) => ({
        url: `/api/folders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
      transformErrorResponse: (response: any) => {
        if (response.status === 400) {
          return {
            status: 400,
            data: response.data || { 
              message: 'Folder deletion failed due to hierarchy or content restrictions'
            }
          };
        }
        if (response.status === 409) {
          return {
            status: 409,
            data: response.data || { 
              message: 'Cannot delete folder: contains subfolders or protected materials'
            }
          };
        }
        return response;
      },
    }),

    // Force delete folder (bypasses some restrictions)
    forceDeleteFolder: builder.mutation<FolderDeletionResponse, { folderId: string; cascade?: boolean }>({
      query: ({ folderId, cascade = false }) => ({
        url: `/api/folders/${folderId}?force=true&cascade=${cascade}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
    }),

    // Bulk delete folders with proper ordering
    bulkDeleteFolders: builder.mutation<BulkDeletionResponse, BulkDeletionRequest>({
      query: (request) => ({
        url: '/api/folders/bulk-delete',
        method: 'DELETE',
        body: request,
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
    }),

    // Move folder to different parent
    moveFolder: builder.mutation<FolderResponse, MoveFolderRequest>({
      query: ({ folderId, parentFolder }) => ({
        url: `/api/folders/${folderId}/move`,
        method: 'PUT',
        body: { parentFolder }, // Updated to match API spec
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
    }),

    // Move material to folder
    moveMaterialToFolder: builder.mutation<{ success: boolean; message: string }, { materialId: string; folder: string | null }>({
      query: ({ materialId, folder }) => ({
        url: `/api/materials/${materialId}/move`,
        method: 'PUT',
        body: { folder }, // Updated to match material API spec
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
    }),

    // Get folder breadcrumbs
    getFolderBreadcrumbs: builder.query<{ success: boolean; data: { id: string; name: string }[] }, string>({
      query: (folderId) => `/api/folders/${folderId}/breadcrumbs`,
      providesTags: (result, error, folderId) => [{ type: 'Folder', id: folderId }],
    }),

    // Duplicate folder
    duplicateFolder: builder.mutation<FolderResponse, { folderId: string; name?: string; parentId?: string }>({
      query: ({ folderId, ...options }) => ({
        url: `/api/folders/${folderId}/duplicate`,
        method: 'POST',
        body: options,
      }),
      invalidatesTags: ['Folder', 'FolderContents'],
    }),

    // Get folder permissions
    getFolderPermissions: builder.query<{ success: boolean; data: any[] }, string>({
      query: (folderId) => `/api/folders/${folderId}/permissions`,
      providesTags: (result, error, folderId) => [{ type: 'Folder', id: folderId }],
    }),

    // Update folder permissions
    updateFolderPermissions: builder.mutation<{ success: boolean; message: string }, { folderId: string; permissions: any[] }>({
      query: ({ folderId, permissions }) => ({
        url: `/api/folders/${folderId}/permissions`,
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: (result, error, { folderId }) => [{ type: 'Folder', id: folderId }],
    }),

    // Search within folder
    searchInFolder: builder.query<FolderContentsResponse, { folderId: string; searchTerm: string }>({
      query: ({ folderId, searchTerm }) => 
        `/api/folders/${folderId}/search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: (result, error, { folderId }) => [{ type: 'FolderContents', id: folderId }],
    }),

    // Validate folder creation (check level restrictions)
    validateFolderCreation: builder.query<{ success: boolean; canCreate: boolean; reason?: string }, { parentFolderId?: string | null }>({
      query: ({ parentFolderId }) => 
        parentFolderId 
          ? `/api/folders/validate?parentFolder=${parentFolderId}`
          : '/api/folders/validate',
      providesTags: ['Folder'],
    }),

    // New endpoint: Get child folders by parent ID
    getChildFolders: builder.query<FoldersResponse, string>({
      query: (parentId) => `/api/folders?parent=${parentId}`,
      providesTags: (result, error, parentId) => [{ type: 'Folder', id: parentId }],
    }),

    // Get single folder with materials (specific endpoint as requested)
    getFolderWithMaterials: builder.query<{ success: boolean; data: any }, string>({
      query: (folderId) => `/api/folders/${folderId}?includeMaterials=true`,
      providesTags: (result, error, folderId) => [
        { type: 'FolderContents', id: folderId },
        { type: 'Folder', id: folderId }
      ],
    }),
  }),
});

export const {
  useGetFoldersQuery,
  useGetRootFoldersQuery,
  useGetFolderQuery,
  useGetFolderContentsQuery,
  useGetFoldersForMaterialsQuery,
  useGetFolderTreeQuery,
  useGetFolderStatsQuery,
  // Specific folder creation hooks
  useCreateParentFolderMutation,
  useCreateChildFolderMutation,
  // Legacy create folder hook
  useCreateFolderMutation,
  useUpdateFolderMutation,
  // Folder deletion hooks
  useValidateFolderDeletionQuery,
  useDeleteFolderMutation,
  useForceDeleteFolderMutation,
  useBulkDeleteFoldersMutation,
  // Other operations
  useMoveFolderMutation,
  useMoveMaterialToFolderMutation,
  useGetFolderBreadcrumbsQuery,
  useDuplicateFolderMutation,
  useGetFolderPermissionsQuery,
  useUpdateFolderPermissionsMutation,
  useSearchInFolderQuery,
  useValidateFolderCreationQuery,
  // New hook: Get child folders by parent ID
  useGetChildFoldersQuery,
  // Get single folder with materials
  useGetFolderWithMaterialsQuery,
} = foldersApi;
