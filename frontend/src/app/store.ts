import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../slices/counterSlice';
import { baseApi } from '@/api/baseApi';
import { authReducer, syncAuth } from '../slices/authSlice'

import { onAuthChange } from "@/lib/auth";


export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

onAuthChange(() => {
  store.dispatch(syncAuth());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
