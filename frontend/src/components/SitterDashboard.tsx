import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMeQuery } from '@/api/authApi'
import { useGetPetSitterProfileQuery } from '@/api/petApi'
import { useGetBookingRequestsQuery } from '@/api/bookingApi'
import { BookingRow } from '@/components/BookingsSection'

type SitterProfileDTO = {
  rating?: number
  reviewCount?: number
}

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <div>
    <p className="text-2xl font-semibold text-foreground">{value}</p>
    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
  </div>
)

export default function SitterDashboard() {
  const { data: me } = useGetMeQuery()
  const petSitterId = me?.petSitterId

  const { data: profile, isLoading: loadingProfile } = useGetPetSitterProfileQuery(
    { id: String(petSitterId) },
    { skip: !petSitterId },
  )
  const { data: bookings, isLoading: loadingBookings } = useGetBookingRequestsQuery(undefined, {
    skip: !petSitterId,
  })

  const { pending, upcoming, completedCount } = useMemo(() => {
    const list = bookings ?? []
    const now = new Date()
    const pending = list.filter((b) => b.status === 'PENDING')
    const upcoming = list
      .filter((b) => b.status === 'ACCEPTED' && new Date(b.endDate) >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    const completedCount = list.filter((b) => b.status === 'COMPLETED').length
    return { pending, upcoming, completedCount }
  }, [bookings])

  if (!petSitterId) return null

  if (loadingProfile || loadingBookings) {
    return (
      <div className="space-y-6 pt-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const sitter = profile as SitterProfileDTO | undefined
  const rating = sitter?.rating ?? 0
  const reviewCount = sitter?.reviewCount ?? 0

  return (
    <div className="pt-2">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 border-b border-border pb-8 sm:grid-cols-4">
        <Stat value={rating.toFixed(1)} label="Rating" />
        <Stat value={reviewCount} label="Reviews" />
        <Stat value={pending.length} label="Pending" />
        <Stat value={completedCount} label="Completed" />
      </div>

      {/* Needs your response */}
      <div className="mt-8">
        <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Needs your response
        </h3>
        {pending.length > 0 ? (
          <div className="mt-2 divide-y divide-border">
            {pending.map((b) => (
              <BookingRow key={b.id} booking={b} perspective="sitter" />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm italic text-muted-foreground">Nothing needs your attention right now.</p>
        )}
      </div>

      {/* Upcoming bookings */}
      <div className="mt-10">
        <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Upcoming bookings
        </h3>
        {upcoming.length > 0 ? (
          <div className="mt-2 divide-y divide-border">
            {upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} perspective="sitter" />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm italic text-muted-foreground">No upcoming bookings.</p>
        )}
      </div>
    </div>
  )
}
