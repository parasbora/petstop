import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useGetMyBookingsQuery,
  useUpdateBookingStatusMutation,
  type Booking,
  type BookingStatus,
} from '@/api/bookingApi'

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  DECLINED: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  CANCELLED: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  COMPLETED: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const formatRange = (start: string, end: string) => `${formatDate(start)} – ${formatDate(end)}`

export function BookingRow({ booking, perspective }: { booking: Booking; perspective: 'owner' | 'sitter' }) {
  const [updateStatus, { isLoading }] = useUpdateBookingStatusMutation()

  const act = async (status: BookingStatus) => {
    try {
      await updateStatus({ id: booking.id, status }).unwrap()
      const messages: Record<string, string> = {
        ACCEPTED: 'Booking accepted',
        DECLINED: 'Booking declined',
        CANCELLED: 'Booking cancelled',
        COMPLETED: 'Booking marked as completed',
      }
      toast.success(messages[status])
    } catch (err) {
      const msg = (err as { data?: string })?.data || 'Could not update booking'
      toast.error(msg)
    }
  }

  const counterpartName =
    perspective === 'owner' ? booking.petSitter?.name || 'Sitter' : booking.user?.name || 'Pet owner'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{counterpartName}</p>
        <p className="text-sm text-muted-foreground">{formatRange(booking.startDate, booking.endDate)}</p>
        {booking.message && (
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground/80">&ldquo;{booking.message}&rdquo;</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[booking.status]}`}>
          {booking.status.toLowerCase()}
        </span>
        {perspective === 'sitter' && booking.status === 'PENDING' && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              disabled={isLoading}
              onClick={() => act('DECLINED')}
            >
              Decline
            </Button>
            <Button size="sm" className="rounded-full" disabled={isLoading} onClick={() => act('ACCEPTED')}>
              Accept
            </Button>
          </>
        )}
        {perspective === 'sitter' && booking.status === 'ACCEPTED' && (
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={isLoading}
            onClick={() => act('COMPLETED')}
          >
            Mark completed
          </Button>
        )}
        {perspective === 'owner' && (booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full text-muted-foreground hover:text-foreground"
            disabled={isLoading}
            onClick={() => act('CANCELLED')}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <Calendar className="mb-4 h-8 w-8 text-muted-foreground/50" />
      <h3 className="text-lg font-medium text-foreground">No bookings yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">Book your first pet service.</p>
      <Link to="/browse" className="mt-5">
        <Button className="rounded-full px-5" size="sm">
          Browse sitters
        </Button>
      </Link>
    </div>
  )
}

// Bookings you made as a pet owner. Booking requests you receive as a sitter
// live on the Sitter Hub page instead, so this stays focused on one thing.
export default function BookingsSection() {
  const { data: myBookings, isLoading } = useGetMyBookingsQuery()

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!myBookings || myBookings.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="divide-y divide-border pt-2">
      {myBookings.map((b) => (
        <BookingRow key={b.id} booking={b} perspective="owner" />
      ))}
    </div>
  )
}
