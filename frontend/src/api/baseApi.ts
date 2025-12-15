import { BaseQueryApi, createApi, FetchArgs, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiBase } from "@/lib/auth";
import { clearToken } from "@/lib/auth";
import { getToken } from "@/lib/auth";

const baseQuery = fetchBaseQuery({
    baseUrl: apiBase(),

    prepareHeaders: (headers) => {
        const token = getToken();
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },

})
const baseQueryWithAuth = async (args: string | FetchArgs, api: BaseQueryApi, extra: {}) => {
    const result = await baseQuery(args, api, extra);

    if (result?.error?.status === 401) {
        clearToken();
    }

    return result;
};
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithAuth,
    tagTypes: ['Auth', 'User', 'Profile'], 
    endpoints: (builder) => ({
        getHealth: builder.query<{ message: string }, void>({
            query: () => '/health',
        }),
    }),
});



export const { useGetHealthQuery } = baseApi