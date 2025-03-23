import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Building, Calendar, Home, MapPin, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Property, Booking, Facility, PropertyImage, Location } from '@/types';
import AIRecommendations from '@/components/properties/AIRecommendations';
import { GenderOption } from '@/types';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [recentlyViewedProperties, setRecentlyViewedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const gender: GenderOption = 'common'; // Use one of the allowed values: 'boys', 'girls', or 'common'

  useEffect(() => {
    if (user) {
      fetchUserData();
      
      // Set up real-time updates for bookings and favorites
      const bookingsChannel = supabase
        .channel('bookings-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('Received real-time update for bookings');
          fetchUserData();
        })
        .subscribe();
        
      const favoritesChannel = supabase
        .channel('favorites-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`
        }, () => {
          console.log('Received real-time update for favorites');
          fetchUserData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(bookingsChannel);
        supabase.removeChannel(favoritesChannel);
      };
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch active bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(
            id, name, address, monthly_price, daily_price, type,
            images:property_images(id, property_id, image_url, is_primary, created_at)
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch favorite properties
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          property_id,
          created_at,
          property:properties(
            id, name, address, monthly_price, daily_price, type, gender, description, location_id,
            longitude, latitude, merchant_id, is_verified, created_at, updated_at,
            location:locations(id, name, latitude, longitude, created_at),
            images:property_images(id, property_id, image_url, is_primary, created_at),
            facilities:property_facilities(
              facility:facilities(id, name, created_at)
            )
          )
        `)
        .eq('user_id', user.id);

      if (favoritesError) throw favoritesError;

      // Transform the bookings data
      const transformedBookings: Booking[] = bookingsData.map((booking: any) => ({
        ...booking,
        property: {
          ...booking.property,
          location: {
            id: '',
            name: booking.property.address.split(',')[0],
            latitude: 0,
            longitude: 0,
            created_at: ''
          } as Location,
          facilities: [] as Facility[],
          gender: 'common' as 'common' | 'boys' | 'girls',
          merchant_id: '',
          description: '',
          location_id: '',
          is_verified: false,
          updated_at: '',
          images: (booking.property.images || []).map((img: any) => ({
            id: img.id,
            property_id: img.property_id,
            image_url: img.image_url,
            is_primary: img.is_primary || false,
            created_at: img.created_at
          })) as PropertyImage[]
        } as Property
      }));

      // Transform the favorites data to properties
      const transformedFavorites: Property[] = favoritesData
        .filter((favorite: any) => favorite.property) // Filter out any null properties
        .map((favorite: any) => ({
          ...favorite.property,
          facilities: favorite.property.facilities
            ? favorite.property.facilities.map((f: any) => f.facility)
            : [],
          images: favorite.property.images || [],
          location: favorite.property.location || {
            id: '',
            name: favorite.property.address.split(',')[0],
            latitude: 0,
            longitude: 0,
            created_at: ''
          }
        }));

      setActiveBookings(transformedBookings);
      setFavoriteProperties(transformedFavorites);
      
      // For recently viewed, we'll just use the first 3 favorites for now
      // In a real app, you'd implement a separate recently viewed tracking system
      setRecentlyViewedProperties(transformedFavorites.slice(0, 3));

    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <Button onClick={() => navigate('/properties')}>
            Find Accommodation
          </Button>
        </div>

        <div className="grid gap-6">
          {/* AI Recommendations for the student */}
          <AIRecommendations userPreferences={{
            gender: profile?.preferred_gender_accommodation || profile?.gender || 'common',
            budget: profile?.max_budget || 10000, // Default budget
            amenities: ['WiFi', 'AC', 'Meals'],
            location: profile?.preferred_location || ''
          }} />

          {/* Main Tabs */}
          <Tabs defaultValue="bookings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="bookings">
                <Calendar className="h-4 w-4 mr-2" />
                My Bookings
              </TabsTrigger>
              <TabsTrigger value="favorites">
                <Star className="h-4 w-4 mr-2" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="recent">
                <Home className="h-4 w-4 mr-2" />
                Recently Viewed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="h-64 animate-pulse bg-muted"></Card>
                  ))}
                </div>
              ) : activeBookings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 h-40 md:h-auto bg-muted">
                          {booking.property?.images && booking.property.images.length > 0 ? (
                            <img 
                              src={booking.property.images[0].image_url} 
                              alt={booking.property.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Building className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="md:w-2/3 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.property?.name}</h3>
                              <p className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {booking.property?.address}
                              </p>
                            </div>
                            <Badge variant={booking.status === 'confirmed' ? 'default' : 'outline'}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Check-in</span>
                              <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Check-out</span>
                              <span className="font-medium">{booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Amount</span>
                              <span className="font-medium">₹{booking.total_amount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => navigate(`/bookings/${booking.id}/confirmation`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-lg font-medium mb-1">No active bookings</p>
                    <p className="text-sm text-muted-foreground mb-4">You don't have any active bookings at the moment</p>
                    <Button variant="outline" onClick={() => navigate('/properties')}>
                      Find Accommodation
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="h-64 animate-pulse bg-muted"></Card>
                  ))}
                </div>
              ) : favoriteProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {favoriteProperties.map((property) => (
                    <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0].image_url} 
                            alt={property.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Building className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge>{property.type}</Badge>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold">{property.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {property.location?.name || property.address}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <p className="font-medium">₹{property.monthly_price.toLocaleString()}<span className="text-xs text-muted-foreground">/month</span></p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/properties/${property.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
                    <Star className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-lg font-medium mb-1">No favorite properties</p>
                    <p className="text-sm text-muted-foreground mb-4">Save properties you like to find them quickly later</p>
                    <Button variant="outline" onClick={() => navigate('/properties')}>
                      Browse Properties
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="h-64 animate-pulse bg-muted"></Card>
                  ))}
                </div>
              ) : recentlyViewedProperties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {recentlyViewedProperties.map((property) => (
                    <Card key={property.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-48">
                        {property.images && property.images.length > 0 ? (
                          <img 
                            src={property.images[0].image_url} 
                            alt={property.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Building className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge>{property.type}</Badge>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="font-semibold">{property.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {property.location?.name || property.address}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <p className="font-medium">₹{property.monthly_price.toLocaleString()}<span className="text-xs text-muted-foreground">/month</span></p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/properties/${property.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center pt-6 pb-6">
                    <Home className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-lg font-medium mb-1">No recently viewed properties</p>
                    <p className="text-sm text-muted-foreground mb-4">Properties you view will appear here</p>
                    <Button variant="outline" onClick={() => navigate('/properties')}>
                      Browse Properties
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
