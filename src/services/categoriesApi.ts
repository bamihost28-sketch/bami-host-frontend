import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  Category, 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  CategoryResponse, 
  CategoriesResponse 
} from '../types/categories';
import { BASE_API_URL, withColdStartRetry } from './api';

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
   baseQuery: withColdStartRetry(fetchBaseQuery({
      baseUrl: BASE_API_URL,
    prepareHeaders: (headers) => {
      // Get token directly from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  })),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // Get all categories
    getCategories: builder.query<CategoriesResponse, void>({
      query: () => '/api/categories',
      providesTags: ['Category'],
    }),
    
    // Get single category by ID
    getCategory: builder.query<CategoryResponse, string>({
      query: (id) => `/api/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),
    
    // Create new category
    createCategory: builder.mutation<CategoryResponse, CreateCategoryRequest>({
      query: (categoryData) => ({
        url: '/api/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),
    
    // Update existing category
    updateCategory: builder.mutation<CategoryResponse, UpdateCategoryRequest>({
      query: ({ id, ...updates }) => ({
        url: `/api/categories/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }],
    }),
    
    // Delete category
    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;