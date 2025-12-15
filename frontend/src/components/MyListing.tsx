import React from "react";
type ListingLocationData = {
  location: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  neighborhood: string;
  isRemote: boolean;
  serviceRadius: number;
  exactLocation: boolean;
};
// Listing Location Section Component
const ListingLocationSection = () => {
  // Mock data - would come from state/props
  const [listingData, setListingData] = React.useState<ListingLocationData>({
    location: "New York, NY",
    address: "123 Pet Care Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    neighborhood: "Manhattan",
    isRemote: false, // for remote services like virtual consultations
    serviceRadius: 5, // miles
    exactLocation: false // whether to show exact address to clients
  });


  const handleInputChange = <K extends keyof ListingLocationData>(
    field: K,
    value: ListingLocationData[K]
  ) => {
    setListingData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Service Location</h3>
        <p className="text-sm text-muted-foreground">
          Set where you provide your pet sitting services
        </p>
      </div>

      {/* Main Location Card */}
      <div className="p-6 rounded-lg border bg-card space-y-4">
        {/* Location Type Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="space-y-1">
            <label className="text-sm font-medium">Service Type</label>
            <p className="text-xs text-muted-foreground">
              {listingData.isRemote ? 'Remote services only' : 'In-person pet care'}
            </p>
          </div>
          <button
            onClick={() => handleInputChange('isRemote', !listingData.isRemote)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${listingData.isRemote ? 'bg-blue-600' : 'bg-gray-200'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${listingData.isRemote ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        {!listingData.isRemote ? (
          /* In-Person Location Settings */
          <div className="space-y-4">
            {/* Address Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Street Address</label>
                <input
                  type="text"
                  value={listingData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                  placeholder="Enter your address"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Neighborhood</label>
                <input
                  type="text"
                  value={listingData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                  placeholder="e.g., Manhattan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <input
                  type="text"
                  value={listingData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <input
                  type="text"
                  value={listingData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                  placeholder="State"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code</label>
                <input
                  type="text"
                  value={listingData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="w-full p-2 rounded-md border bg-background"
                  placeholder="ZIP"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Radius (miles)</label>
                <select
                  value={listingData.serviceRadius}
                  onChange={(e) => handleInputChange('serviceRadius', parseInt(e.target.value))}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  <option value={1}>1 mile</option>
                  <option value={3}>3 miles</option>
                  <option value={5}>5 miles</option>
                  <option value={10}>10 miles</option>
                  <option value={15}>15 miles</option>
                  <option value={20}>20 miles</option>
                </select>
              </div>
            </div>

            {/* Location Visibility Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="space-y-1">
                <label className="text-sm font-medium">Show Exact Location</label>
                <p className="text-xs text-muted-foreground">
                  {listingData.exactLocation
                    ? 'Clients will see your full address'
                    : 'Clients will only see your neighborhood'
                  }
                </p>
              </div>
              <button
                onClick={() => handleInputChange('exactLocation', !listingData.exactLocation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${listingData.exactLocation ? 'bg-green-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${listingData.exactLocation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Map Preview Placeholder */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Location Preview</label>
              <div className="h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg mb-1">🗺️</div>
                  <p className="text-sm">Map preview would appear here</p>
                  <p className="text-xs">Service area: {listingData.serviceRadius} mile radius</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Remote Services Settings */
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 text-lg">💻</div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800">Remote Services</p>
                  <p className="text-xs text-blue-700">
                    You'll provide virtual consultations, training sessions, or remote pet monitoring services.
                    Clients will contact you to schedule online sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Service Description</label>
              <textarea
                placeholder="Describe your remote pet services (virtual consultations, training, etc.)"
                className="w-full p-3 rounded-md border bg-background min-h-[100px]"
              />
            </div>
          </div>
        )}

        {/* Current Location Summary */}
        <div className="p-4 rounded-lg bg-muted/30 border">
          <h4 className="text-sm font-medium mb-2">Current Location Settings</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>📍 {listingData.isRemote ? 'Remote Services' : listingData.location}</p>
            {!listingData.isRemote && (
              <>
                <p>🏠 {listingData.exactLocation ? 'Full address visible' : 'Neighborhood only'}</p>
                <p>📏 Service radius: {listingData.serviceRadius} miles</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Location Settings
        </button>
      </div>
    </div>
  );
};

export default ListingLocationSection;

// Usage in your main listing component:
/*
export default function CreateListing() {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create Pet Sitting Listing</h1>
        <p className="text-muted-foreground">Set up your pet sitting service profile</p>
      </div>
      
      <ListingLocationSection />
      
      {/* Other listing sections would go here * /}
    </div>
  );
}
*/