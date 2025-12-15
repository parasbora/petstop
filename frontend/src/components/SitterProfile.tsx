
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  MapPin,
  Star,
  Calendar,
  Heart,
  MessageCircle,
  Clock,
  PawPrint,
  CheckCircle,
  Shield,
  Briefcase
} from 'lucide-react';
import { useGetPetSitterProfileQuery } from '@/api/petApi';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define types based on your API response
type Service = {
  name: string;
  description: string;
  pricePerHour: number;
};

type Review = {
  id: number;
  author: string;
  rating: number;
  date: string;
  content: string;
};

type PetSitterApiDTO = {
  id: number;
  name: string;
  bio: string;
  location?: string;
  hourlyRate: number;
  experience?: number;
  serviceTypes?: string[];
  availability?: Array<{
    id: number;
    startDate: string;
    endDate: string;
  }>;
  userId?: number;
};

type SitterProfileData = {
  id: number;
  name: string;
  bio: string;
  location?: string;
  averageRating: number;
  reviewCount: number;
  profileImageUrl: string;
  experienceYears: number;
  specialties: string[];
  isVerified: boolean;
  services: Service[];
  reviews: Review[];
  responseRate: number;
  responseTime: string;
  hourlyRate: number;
  serviceTypes: string[];
  availability: Array<{
    id: number;
    startDate: string;
    endDate: string;
  }>;
};

// Helper function to map API data to component structure
const mapApiToSitterData = (apiData: PetSitterApiDTO): SitterProfileData => {
  // Create services from serviceTypes and hourlyRate
  const services: Service[] = (apiData.serviceTypes || []).map((serviceType: string) => {
    const serviceDescriptions: Record<string, string> = {
      'dog walking': 'A brisk walk and potty break for your furry friend',
      'overnight stays': 'Overnight care and supervision at your home',
      'daily visits': 'Regular check-ins for feeding and care',
      'walking': 'Exercise and outdoor time for your pet',
      'boarding': 'Extended care at sitter\'s location',
      'cat-sitting': 'Specialized care for feline friends',
      'grooming': 'Bathing, brushing, and hygiene services',
      'daycare': 'Daytime supervision and play',
      'training': 'Behavior and obedience training'
    };

    return {
      name: serviceType.charAt(0).toUpperCase() + serviceType.slice(1),
      description: serviceDescriptions[serviceType] || 'Professional pet care service',
      pricePerHour: apiData.hourlyRate || 0
    };
  });

  // Generate mock reviews (you would get this from your API)
  const reviews: Review[] = [
    { id: 1, author: 'Happy Pet Owner', rating: 5, date: '2024-11-30', content: `Excellent service! ${apiData.name} was wonderful with my pet.` },
    { id: 2, author: 'Satisfied Client', rating: 4, date: '2024-11-25', content: 'Reliable and professional. Will book again!' },
    { id: 3, author: 'Pet Lover', rating: 5, date: '2024-11-20', content: 'My pet was happy and well-cared for. Highly recommend!' },
  ];

  // Determine if sitter is verified (has userId)
  const isVerified = !!apiData.userId;

  return {
    id: apiData.id,
    name: apiData.name,
    bio: apiData.bio,
    location: apiData.location,
    averageRating: 4.8, // You might want to calculate this from actual reviews
    reviewCount: 24, // This should come from your API
    profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(apiData.name)}&background=random`,
    experienceYears: apiData.experience || 0,
    specialties: apiData.serviceTypes || [],
    isVerified,
    services,
    reviews,
    responseRate: 95, // Default value
    responseTime: 'Within 2 hours', // Default value
    hourlyRate: apiData.hourlyRate,
    serviceTypes: apiData.serviceTypes || [],
    availability: apiData.availability || []
  };
};

// Reusable Star Rating Component
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const STAR_COLOR_CLASS = "fill-primary text-primary";

  return (
    <div className="flex items-center space-x-0.5">
      {Array(fullStars).fill(0).map((_, i) => (
        <Star key={`full-${i}`} className={`w-4 h-4 ${STAR_COLOR_CLASS}`} />
      ))}
      {hasHalfStar && (
        <div className="relative w-4 h-4">
          <Star className="absolute top-0 left-0 w-4 h-4 text-muted-foreground" />
          <Star
            className={`absolute top-0 left-0 w-4 h-4 ${STAR_COLOR_CLASS}`}
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      )}
      {Array(emptyStars).fill(0).map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground" />
      ))}
    </div>
  );
};

// Loading Skeleton Component
const ProfileSkeleton = () => (
  <div className="min-h-screen p-3 sm:p-4 lg:p-6 font-Raleway bg-background">
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-md" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Main Profile Component
export default function SitterProfile() {
  // Get sitter ID from route params
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
  // Use the actual API hook with the sitterId from route params
  const { data: apiResponse, isLoading, isError } = useGetPetSitterProfileQuery({ id: id || '' });



  useEffect(() => {
    // If API returns empty/error and not loading, redirect to 404
    if (!isLoading && (isError || !apiResponse)) {
      navigate('/sitter-profile/not-found', {
        state: {
          message: `Pet sitter with ID "${id}" not found`,
          attemptedUrl: `/sitter-profile/${id}`
        }
      });
    }
  }, [isLoading, isError, apiResponse, id, navigate]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-center p-10">
        <h1 className="text-xl font-semibold">Petsitter not found</h1>
        <p className="text-gray-600">
          The sitter you are looking for doesn't exist or was removed.
        </p>
      </div>
    );
  }

  if (isError || !apiResponse) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Error loading pet sitter profile. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Map the API response to your component structure
  const sitter = mapApiToSitterData(apiResponse);



  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-background">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className='bg-background border-0'>
          <CardContent className="p-0 ">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Sitter Info and Image */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={sitter.profileImageUrl}
                      alt={`Profile of ${sitter.name}`}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-md object-cover border"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const img = e.currentTarget;
                        img.onerror = null;
                        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          sitter.name
                        )}&background=808080&color=FFFFFF`;
                      }}
                    />
                    {sitter.isVerified && (
                      <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                        {sitter.name}
                      </h1>
                    </div>

                    <div className="flex items-center text-muted-foreground mb-2">
                      <Briefcase className="w-4 h-4 mr-1.5 text-primary" />
                      <span className="text-sm">
                        {sitter.experienceYears} {sitter.experienceYears === 1 ? 'Year' : 'Years'} of Experience
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1.5 text-muted-foreground" />
                        <span className="font-medium">{sitter.location || 'Location not specified'}</span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center space-x-1">
                        <RatingStars rating={sitter.averageRating} />
                        <span className="font-semibold text-foreground">
                          {sitter.averageRating.toFixed(1)} ({sitter.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="mt-4">
                  <Separator className="mb-4" />
                  <h2 className="text-xl font-bold text-foreground mb-2">About Me</h2>
                  <p className="text-foreground leading-relaxed text-sm whitespace-pre-wrap">
                    {sitter.bio}
                  </p>
                </div>
              </div>

              {/* Quick Contact Card */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="w-4 h-4 mr-2" /> Book Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{sitter.hourlyRate}+
                    </p>
                    <p className="text-sm text-muted-foreground">Starting hourly rate</p>
                  </div>

                  <div className="space-y-2 ">
                    <Button className="w-full " size="default">
                      <Calendar className="w-4 h-4 " />
                      Request Booking
                    </Button>
                    <Button className="w-full" variant="outline" size="default">
                      <MessageCircle className="w-4 h-4 " />
                      Send Message
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Response Time:</span>
                      <span className="font-semibold ml-1 text-foreground">{sitter.responseTime}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MessageCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Response Rate:</span>
                      <span className="font-semibold ml-1 text-foreground">{sitter.responseRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Details Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Services & Pricing */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <PawPrint className="w-5 h-5 mr-2 text-primary" />
                Services Offered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sitter.services.length > 0 ? (
                  sitter.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center pb-4 last:pb-0">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-foreground">{service.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-lg font-bold text-primary">
                          ₹{service.pricePerHour}
                        </p>
                        <p className="text-sm text-muted-foreground">per hour</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic text-center py-4">No services listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary" />
                Key Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {sitter.specialties.length > 0 ? (
                  sitter.specialties.map((specialty, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm"
                    >
                      <CheckCircle className="w-3 h-3 mr-1.5" />
                      {specialty}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">No specialties listed</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Star className="w-5 h-5 mr-2 text-primary" />
              What Clients Say ({sitter.reviewCount} Reviews)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {sitter.reviews.map(review => (
                <Card key={review.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex  justify-between mb-2">
                      <div className="flex  ">
                        <div className="flex flex-col space">
                          <RatingStars rating={review.rating} />
                          <span className="font-semibold text-foreground">
                            {review.author}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-foreground text-sm">
                      "{review.content}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button variant="ghost">
                Read All {sitter.reviewCount} Reviews
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

