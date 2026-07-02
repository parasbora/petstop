import { baseApi } from "./baseApi";

export type BookingStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "COMPLETED";

export type Booking = {
  id: number;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  message: string | null;
  createdAt: string;
  petSitterId: number;
  userId: number;
  // Present on /mine (booking made as an owner)
  petSitter?: {
    id: number;
    name: string;
    user: { id: number; name: string | null } | null;
  };
  // Present on /requests (booking request against my sitter profile)
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
};

type ApiEnvelope<T> = { data: T };

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<
      Booking,
      { petSitterId: number; startDate: string; endDate: string; message?: string }
    >({
      query: (body) => ({
        url: "/bookings",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<Booking>) => response.data,
      transformErrorResponse: (error) => {
        if (error && "data" in error && error.data) {
          const data = error.data as { error?: string };
          return data.error || "Could not request booking";
        }
        return "Could not request booking";
      },
      invalidatesTags: ["Booking"],
    }),

    getMyBookings: builder.query<Booking[], void>({
      query: () => "/bookings/mine",
      transformResponse: (response: ApiEnvelope<Booking[]>) => response.data,
      providesTags: ["Booking"],
    }),

    getBookingRequests: builder.query<Booking[], void>({
      query: () => "/bookings/requests",
      transformResponse: (response: ApiEnvelope<Booking[]>) => response.data,
      providesTags: ["Booking"],
    }),

    updateBookingStatus: builder.mutation<Booking, { id: number; status: BookingStatus }>({
      query: ({ id, status }) => ({
        url: `/bookings/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      transformResponse: (response: ApiEnvelope<Booking>) => response.data,
      transformErrorResponse: (error) => {
        if (error && "data" in error && error.data) {
          const data = error.data as { error?: string };
          return data.error || "Could not update booking";
        }
        return "Could not update booking";
      },
      invalidatesTags: ["Booking"],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingRequestsQuery,
  useUpdateBookingStatusMutation,
} = bookingApi;
