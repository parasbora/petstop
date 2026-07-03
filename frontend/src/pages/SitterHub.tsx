import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMeQuery } from '@/api/authApi'
import SitterDashboard from '@/components/SitterDashboard'
import ListingLocationSection from '@/components/MyListing'
import BecomeSitterWizard from '@/components/BecomeSitterWizard'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'listing', label: 'My listing' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function SitterHub() {
  const { data: user, isLoading } = useGetMeQuery()
  const isSitter = !!user?.petSitterId
  const [tab, setTab] = useState<TabId>('overview')

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6 py-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  // Not a sitter yet — go straight to the "become a sitter" form, no tabs.
  if (!isSitter) {
    return (
      <div className="mx-auto w-full max-w-3xl py-6">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Become a sitter
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Set up your listing in a few quick steps to start receiving bookings.
        </p>
        <div className="mt-10">
          <BecomeSitterWizard />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl py-6">
      <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        Sitter Hub
      </h1>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Manage your bookings and keep your listing up to date.
      </p>

      {/* Tabs */}
      <div className="mt-8 flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
              tab === t.id
                ? 'border-foreground font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'overview' && <SitterDashboard />}
        {tab === 'listing' && <ListingLocationSection />}
      </div>
    </div>
  )
}
