import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiBase } from "@/lib/auth";

const baseQuery = fetchBaseQuery({
    baseUrl: apiBase(),
    credentials: 'include',
})

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQuery,
    tagTypes: ['Auth', 'User', 'Profile', 'Booking', 'Pet'],
    endpoints: (builder) => ({
        getHealth: builder.query<{ message: string }, void>({
            query: () => '/health',
        }),
    }),
});

export const { useGetHealthQuery } = baseApi;