import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';
import { categoriesApi } from '../services/categoriesApi';
import { materialsApi } from '../services/materialsApi';
import { foldersApi } from '../services/foldersApi';
import { estatesApi } from '../services/estatesApi';
import { uploadApi } from '../services/uploadApi';
import { subscriptionsApi } from '../services/subscriptionsApi';
import { vendorsApi } from '../services/vendorsApi';
import { businessTypesApi } from '../services/businessTypesApi';
import { walletApi } from '../services/walletApi';
import { walletTransactionApi } from '../services/walletTransactionApi';
import { notificationsApi } from '../services/notificationsApi';
import { bankDepositsApi } from '../services/bankDepositsApi';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add the generated reducers as specific top-level slices
    [authApi.reducerPath]: authApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [materialsApi.reducerPath]: materialsApi.reducer,
    [foldersApi.reducerPath]: foldersApi.reducer,
    [estatesApi.reducerPath]: estatesApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    [vendorsApi.reducerPath]: vendorsApi.reducer,
    [businessTypesApi.reducerPath]: businessTypesApi.reducer,
    [walletApi.reducerPath]: walletApi.reducer,
    [walletTransactionApi.reducerPath]: walletTransactionApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
    [bankDepositsApi.reducerPath]: bankDepositsApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      categoriesApi.middleware,
      materialsApi.middleware,
      foldersApi.middleware,
      estatesApi.middleware,
      uploadApi.middleware,
      subscriptionsApi.middleware,
      vendorsApi.middleware,
      businessTypesApi.middleware,
      walletApi.middleware,
      walletTransactionApi.middleware,
      notificationsApi.middleware,
      bankDepositsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;