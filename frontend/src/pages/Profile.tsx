import { useState } from 'react'
import { useGetMeQuery } from '@/api/authApi'
import ListingLocationSection from '@/components/MyListing'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { RootState } from '@/store'
import {
  Calendar,
  Mail,
  PawPrint,
  User,
  Star,
  Plus,
  TrendingUp,
  CalendarDays,
  Settings
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'

// Loading Skeleton
const ProfileSkeleton = () => (
  <div className="container max-w-6xl mx-auto p-4 space-y-6">
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>

    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)

// Stats Card Component
const StatCard = ({ icon: Icon, value, label, color }: {
  icon: React.ComponentType<{ className?: string }>
  value: string,
  label: string,
  color: string
}) => (
  <Card className="bg-card">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-md ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function Profile() {


const isAuth = useSelector((s: RootState) => s.auth.isAuthenticated)
  const { data: userData, isLoading } = useGetMeQuery(undefined, {
    skip: !isAuth,
  })

  const [activeSection, setActiveSection] = useState('pets')

  if (isLoading) return <ProfileSkeleton />
  if (!userData) return <div>No user data found</div>

  const user = userData
  const isSitter = !!user.petSitterId

  // Format the join date
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  const sections = [
    { id: 'pets', label: 'My Pets', icon: PawPrint },
    { id: 'bookings', label: 'Bookings', icon: CalendarDays },
    { id: 'sitting', label: 'Sitting', icon: Star },
    { id: 'details', label: 'Details', icon: Settings }
  ]

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          Your Account
        </h1>
        <p className="text-muted-foreground">
          {isSitter ? 'Manage your pets and sitter services' : 'Manage your pets and bookings'}
        </p>
      </div>

      {/* Main Profile Card */}
      <Card className="bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row  sm:items-start gap-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background">
              <AvatarFallback className="text-lg sm:text-xl bg-primary text-primary-foreground">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4  sm:text-left">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold">{user.name || 'User'}</h2>
                  {isSitter && (
                    <Badge className="w-fit mx-auto sm:mx-0">
                      <Star className="h-3 w-3 mr-1" />
                      Pet Sitter
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex  gap-1.5  sm:justify-start">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="flex  gap-1.5  sm:justify-start">
                    <Calendar className="h-4 w-4" />
                    Joined {joinDate}
                  </div>
                </div>
              </div>

              {!isSitter && (
                <Button className="w-full sm:w-auto">
                  <PawPrint className="h-4 w-4 mr-2" />
                  Register for pet sitter
                </Button>
              )}
            </div>
          </div>

          {/* Sitter Stats (if applicable) - You can add these later when you have the data */}
          {isSitter && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">--</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-muted-foreground">Bookings</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">--</div>
                  <div className="text-sm text-muted-foreground">Response</div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid - Using placeholder data for now */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard
          icon={PawPrint}
          value="0"
          label="Pets"
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Calendar}
          value="0"
          label="Upcoming"
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          icon={TrendingUp}
          value="0"
          label="Total"
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          icon={User}
          value={isSitter ? "Both" : "Owner"}
          label="Role"
          color="bg-purple-500/10 text-purple-500"
        />
      </div>

      {/* Button Group Navigation */}
      <div className="flex flex-wrap gap-2 justify-start">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'default' : 'outline'}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[100px] sm:min-w-[120px]"
              size="sm"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{section.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Content Sections */}
      <div>
        {activeSection === 'pets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">My Pets</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Pet
              </Button>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-3xl mb-4">🐾</div>
                <h4 className="font-medium mb-2">No pets yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your pets to start booking services
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Pet
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bookings</h3>

              <Link to="/browse">
                <Button variant="outline" size="sm">
                  Browse Sitters
                </Button>
              </Link>

            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">No bookings yet</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {isSitter
                    ? 'Start accepting bookings from pet owners'
                    : 'Book your first pet service'
                  }
                </p>
                <Button>
                  {isSitter ? 'Setup Availability' : 'Browse Sitters'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'sitting' && (
          <div className="space-y-6">
            <ListingLocationSection />
          </div>
        )}

        {activeSection === 'details' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="p-3 rounded-lg bg-muted/50">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <div className="p-3 rounded-lg bg-muted/50">
                      {user.name || 'Not set'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Member Since</label>
                    <div className="p-3 rounded-lg bg-muted/50">
                      {joinDate}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account Type</label>
                    <div className="p-3 rounded-lg bg-muted/50">
                      {isSitter ? 'Pet Owner & Sitter' : 'Pet Owner'}
                      {user.petSitterId && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Sitter ID: {user.petSitterId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1">
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}