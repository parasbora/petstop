import { useState } from 'react'
import ListingLocationSection from '@/components/MyListing'
import BookingsSection from '@/components/BookingsSection'
import PetsSection from '@/components/PetsSection'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PawPrint } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetMeQuery } from '@/api/authApi'

// Small uppercase section label
const Label = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{children}</h2>
)

const ProfileSkeleton = () => (
  <div className="mx-auto w-full max-w-3xl space-y-8 py-6">
    <div className="space-y-3">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-4 w-72" />
    </div>
    <div className="flex items-center gap-5">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
    <Skeleton className="h-px w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
)

const SECTIONS = [
  { id: 'pets', label: 'My pets' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'sitting', label: 'Sitting' },
  { id: 'details', label: 'Details' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export default function Profile() {
  const { data: userData, isLoading } = useGetMeQuery()
  const [activeSection, setActiveSection] = useState<SectionId>('pets')

  if (isLoading) return <ProfileSkeleton />
  if (!userData) return <div className="py-24 text-center text-muted-foreground">No user data found.</div>

  const user = userData
  const isSitter = !!user.petSitterId
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  const meta = [user.email, `Joined ${joinDate}`]

  return (
    <div className="mx-auto w-full max-w-3xl py-6">
      {/* Header */}
      <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        Your account
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        {isSitter ? 'Manage your pets and sitter services.' : 'Manage your pets and bookings.'}
      </p>

      {/* Identity */}
      <div className="mt-10 flex items-center gap-5">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-muted text-xl font-medium text-foreground">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-medium text-foreground">{user.name || 'User'}</h2>
            {isSitter && (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                Pet sitter
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-2.5">
                {i > 0 && <span className="text-border">·</span>}
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!isSitter && (
        <Button
          className="mt-6 rounded-full px-5"
          size="sm"
          onClick={() => setActiveSection('sitting')}
        >
          <PawPrint className="mr-2 h-4 w-4" />
          Become a pet sitter
        </Button>
      )}

      {/* Tabs */}
      <div className="mt-10 flex gap-6 border-b border-border">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
              activeSection === section.id
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-10">
        {activeSection === 'pets' && (
          <section>
            <Label>My pets</Label>
            <PetsSection />
          </section>
        )}

        {activeSection === 'bookings' && (
          <section>
            <div className="flex items-center justify-between">
              <Label>Bookings</Label>
              <Link to="/browse">
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                  Browse sitters
                </Button>
              </Link>
            </div>
            <BookingsSection isSitter={isSitter} />
          </section>
        )}

        {activeSection === 'sitting' && (
          <section>
            <ListingLocationSection />
          </section>
        )}

        {activeSection === 'details' && (
          <section>
            <Label>Account details</Label>
            <dl className="mt-4 divide-y divide-border">
              {[
                ['Email', user.email],
                ['Name', user.name || 'Not set'],
                ['Member since', joinDate],
                ['Account type', isSitter ? 'Pet owner & sitter' : 'Pet owner'],
                ...(user.petSitterId ? [['Sitter ID', `#${user.petSitterId}`]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-full px-5">
                Edit profile
              </Button>
              <Button variant="outline" size="sm" className="rounded-full px-5">
                Settings
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
