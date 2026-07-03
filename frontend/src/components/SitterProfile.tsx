import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Star, ArrowLeft, CalendarIcon } from 'lucide-react';
import { useGetPetSitterProfileQuery, useCreateReviewMutation } from '@/api/petApi';
import { useCreateBookingMutation } from '@/api/bookingApi';
import { useGetMeQuery } from '@/api/authApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// ---- Types (aligned with the backend GET /petsitters/:id response) ----
type ApiReview = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { id: number; name: string | null } | null;
};

type PetSitterApiDTO = {
  id: number;
  name: string;
  bio: string | null;
  location?: string;
  hourlyRate: number | null;
  experience?: number | null;
  serviceTypes?: string[];
  petTypes?: string[];
  rating?: number;
  reviewCount?: number;
  availability?: Array<{ id: number; startDate: string; endDate: string }>;
  userId?: number | null;
  reviews?: ApiReview[];
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  'dog walking': 'A brisk walk and potty break for your furry friend',
  'overnight stays': 'Overnight care and supervision',
  'daily visits': 'Regular check-ins for feeding and care',
  walking: 'Exercise and outdoor time for your pet',
  boarding: "Extended care at the sitter's location",
  'cat-sitting': 'Specialized care for feline friends',
  grooming: 'Bathing, brushing, and hygiene services',
  daycare: 'Daytime supervision and play',
  training: 'Behavior and obedience training',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// Small uppercase section label
const Label = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{children}</h2>
);

// Read-only star display
const RatingStars = ({ rating, className = 'h-3.5 w-3.5' }: { rating: number; className?: string }) => {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= full ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/40'}`}
        />
      ))}
    </div>
  );
};

// Interactive star picker
const StarInput = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            className={`h-6 w-6 ${
              (hover || value) >= n ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/40'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Review submission form (minimal)
const ReviewForm = ({ sitterId }: { sitterId: string }) => {
  const { data: me } = useGetMeQuery();
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!me) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link to="/login" className="text-foreground underline underline-offset-4 hover:no-underline">
          Log in
        </Link>{' '}
        to leave a review.
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Please select a star rating');
      return;
    }
    try {
      await createReview({ id: sitterId, rating, comment: comment.trim() || undefined }).unwrap();
      toast.success('Thanks for your review!');
      setRating(0);
      setComment('');
    } catch (err) {
      const msg = (err as { data?: { error?: string } })?.data?.error || 'Could not submit review';
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <StarInput value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)…"
        rows={2}
        maxLength={1000}
        className="w-full resize-none border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-foreground"
      />
      <Button type="submit" variant="outline" size="sm" disabled={isLoading} className="rounded-full">
        {isLoading ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  );
};

// A single-date picker (shadcn Popover + Calendar composition)
const DatePicker = ({
  value,
  onChange,
  placeholder,
  minDate,
}: {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder: string;
  minDate?: Date;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-empty={!value}
          className="w-full justify-start rounded-lg text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          <CalendarIcon className="h-4 w-4" />
          {value ? format(value, 'LLL d, yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          disabled={minDate ? { before: minDate } : undefined}
          defaultMonth={value ?? minDate}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
};

// Inline booking request form (shown when "Request booking" is clicked)
const BookingForm = ({ sitterId, onDone }: { sitterId: string; onDone: () => void }) => {
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please choose a start and end date');
      return;
    }
    if (endDate <= startDate) {
      toast.error('End date must be after the start date');
      return;
    }
    try {
      await createBooking({
        petSitterId: Number(sitterId),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        message: message.trim() || undefined,
      }).unwrap();
      toast.success('Booking requested — the sitter will respond soon.');
      onDone();
    } catch (err) {
      const msg = (err as { data?: string })?.data || 'Could not request booking';
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-4 border-t border-border pt-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Start date
          </label>
          <DatePicker
            value={startDate}
            onChange={(date) => {
              setStartDate(date);
              // Clear end date if it's now before the new start date
              if (date && endDate && endDate <= date) setEndDate(undefined);
            }}
            placeholder="Select start date"
            minDate={startOfToday()}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            End date
          </label>
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="Select end date"
            minDate={startDate ?? startOfToday()}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Note <span className="lowercase text-muted-foreground/60">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell the sitter about your pet and needs…"
          rows={3}
          maxLength={500}
          className="w-full resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-foreground"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="rounded-full px-5">
          {isLoading ? 'Requesting…' : 'Send request'}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} className="rounded-full px-5">
          Cancel
        </Button>
      </div>
    </form>
  );
};

const ProfileSkeleton = () => (
  <div className="mx-auto w-full max-w-3xl space-y-8 py-6">
    <div className="flex items-center gap-5">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <Skeleton className="h-px w-full" />
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

export default function SitterProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: apiResponse, isLoading, isError } = useGetPetSitterProfileQuery({ id: id || '' });
  const { data: me } = useGetMeQuery();
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (!isLoading && (isError || !apiResponse)) {
      navigate('/sitter-profile/not-found', {
        state: {
          message: `Pet sitter with ID "${id}" not found`,
          attemptedUrl: `/sitter-profile/${id}`,
        },
      });
    }
  }, [isLoading, isError, apiResponse, id, navigate]);

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !apiResponse) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Error loading pet sitter profile. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const sitter = apiResponse as PetSitterApiDTO;
  const rating = sitter.rating ?? 0;
  const reviewCount = sitter.reviewCount ?? 0;
  const experienceYears = sitter.experience ?? 0;
  const serviceTypes = sitter.serviceTypes ?? [];
  const petTypes = sitter.petTypes ?? [];
  const reviews = sitter.reviews ?? [];
  const availability = sitter.availability ?? [];
  const profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    sitter.name,
  )}&background=random`;
  const isOwnProfile = !!me && me.id === sitter.userId;

  // metadata pieces joined with middots
  const meta = [
    sitter.location || 'Location not specified',
    `${experienceYears} ${experienceYears === 1 ? 'year' : 'years'} experience`,
  ];

  return (
    <div className="mx-auto w-full max-w-3xl py-6">
      {/* Back */}
      <Link
        to="/browse"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Header */}
      <header className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
        <img
          src={profileImageUrl}
          alt={sitter.name}
          className="h-20 w-20 rounded-full object-cover"
        />
        <div className="min-w-0">
          <h1 className="font-newsreader text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            {sitter.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-2.5">
                {i > 0 && <span className="text-border">·</span>}
                {m}
              </span>
            ))}
            <span className="flex items-center gap-2.5">
              <span className="text-border">·</span>
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <RatingStars rating={rating} />
                {rating.toFixed(1)}
                <span className="text-muted-foreground">({reviewCount})</span>
              </span>
            </span>
          </div>
          {petTypes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {petTypes.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-2.5 py-0.5 text-xs capitalize text-muted-foreground"
                >
                  {t === 'dog' ? '🐶' : t === 'cat' ? '🐱' : '🐾'} {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Booking bar */}
      <div className="mt-10 border-y border-border py-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-3xl font-semibold text-foreground">₹{sitter.hourlyRate ?? 0}</span>
            <span className="text-sm text-muted-foreground"> /hr starting</span>
          </div>
          {!isOwnProfile && (
            <div className="ml-auto flex gap-2">
              {me ? (
                <Button
                  className="rounded-full px-5"
                  onClick={() => setShowBookingForm((v) => !v)}
                >
                  {showBookingForm ? 'Never mind' : 'Request booking'}
                </Button>
              ) : (
                <Link to="/login">
                  <Button className="rounded-full px-5">Log in to book</Button>
                </Link>
              )}
              <Button variant="outline" className="rounded-full px-5">
                Message
              </Button>
            </div>
          )}
        </div>

        {showBookingForm && me && (
          <BookingForm sitterId={id || ''} onDone={() => setShowBookingForm(false)} />
        )}
      </div>

      {/* About */}
      <section className="mt-14">
        <Label>About</Label>
        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">
          {sitter.bio || 'This sitter has not added a bio yet.'}
        </p>
      </section>

      {/* Services */}
      <section className="mt-14">
        <Label>Services</Label>
        {serviceTypes.length > 0 ? (
          <ul className="mt-4 divide-y divide-border">
            {serviceTypes.map((service, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 py-4 first:pt-0">
                <div>
                  <p className="text-[15px] font-medium capitalize text-foreground">{service}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {SERVICE_DESCRIPTIONS[service.toLowerCase()] || 'Professional pet care service'}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                  ₹{sitter.hourlyRate ?? 0}
                  <span className="text-muted-foreground/70"> /hr</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm italic text-muted-foreground">No services listed</p>
        )}
      </section>

      {/* Availability */}
      {availability.length > 0 && (
        <section className="mt-14">
          <Label>Availability</Label>
          <ul className="mt-4 space-y-2">
            {availability.map((a) => (
              <li key={a.id} className="text-sm text-foreground/90">
                {formatDate(a.startDate)} <span className="text-muted-foreground">–</span>{' '}
                {formatDate(a.endDate)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-14">
        <Label>Reviews ({reviewCount})</Label>

        {!isOwnProfile && (
          <div className="mt-6">
            <ReviewForm sitterId={id || ''} />
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="mt-8 divide-y divide-border">
            {reviews.map((review) => (
              <div key={review.id} className="py-6 first:pt-0">
                <div className="flex items-center justify-between">
                  <RatingStars rating={review.rating} />
                  <time className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</time>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {review.author?.name || 'Anonymous'}
                </p>
                {review.comment && (
                  <p className="mt-1.5 text-[15px] leading-7 text-foreground/80">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm italic text-muted-foreground">
            No reviews yet{!isOwnProfile ? ' — be the first.' : '.'}
          </p>
        )}
      </section>
    </div>
  );
}
