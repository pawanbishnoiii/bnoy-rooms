
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Building,
  BookMarked,
  MapPin,
  Star,
  Calendar,
  Banknote,
  Home,
  History,
  ArrowRight,
  Heart,
  MessageSquare,
  User,
  BookOpen
} from 'lucide-react';
import { Property, Booking, Location, PropertyImage } from '@/types';

const UserDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Get user's bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(
            id, 
            name, 
            address,
            monthly_price,
            daily_price,
            type,
            images:property_images(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // For now, let's just fetch some properties as favorites and recommended (placeholder)
      const { data: allProperties, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          images:property_images(*),
          location:locations(*)
        `)
        .is('is_verified', true)
        .limit(6);

      if (propertiesError) throw propertiesError;

      // Mock search history for now
      const mockSearches = [
        { id: 1, query: 'PG near Delhi University', date: new Date().toISOString() },
        { id: 2, query: 'Affordable hostel in Mumbai', date: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, query: 'Girls hostel near Bangalore', date: new Date(Date.now() - 172800000).toISOString() },
      ];

      // Map data to match our interfaces
      const mappedBookings: Booking[] = bookingsData?.map(booking => {
        const propertyData = booking.property;
        let propertyImages: PropertyImage[] = [];
        
        if (propertyData?.images) {
          propertyImages = propertyData.images.map((img: any) => ({
            id: img.id,
            property_id: img.property_id,
            image_url: img.image_url,
            is_primary: img.is_primary || false,
            created_at: img.created_at
          }));
        }
        
        const property: Property = propertyData ? {
          id: propertyData.id,
          merchant_id: '',  // Default value since not fetched
          name: propertyData.name,
          type: propertyData.type || '',
          gender: 'common', // Default value since not fetched
          description: null,
          location_id: null,
          address: propertyData.address,
          latitude: null,
          longitude: null,
          daily_price: propertyData.daily_price,
          monthly_price: propertyData.monthly_price,
          is_verified: true, // Default value since not fetched
          created_at: '',    // Default value since not fetched
          updated_at: '',    // Default value since not fetched
          images: propertyImages,
          location: null,
          facilities: []
        } : null;
        
        return {
          id: booking.id,
          property_id: booking.property_id,
          user_id: booking.user_id,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          time_frame: booking.time_frame,
          price_per_unit: booking.price_per_unit,
          total_amount: booking.total_amount,
          status: booking.status || 'pending',
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          property
        };
      }) || [];

      // Map properties
      const mappedProperties: Property[] = allProperties?.map(prop => {
        let locationData: Location | null = null;
        
        if (prop.location) {
          locationData = {
            id: prop.location.id || '',
            name: prop.location.name || '',
            latitude: prop.location.latitude || null,
            longitude: prop.location.longitude || null,
            created_at: prop.location.created_at || '',
          };
        }
        
        const propertyImages: PropertyImage[] = prop.images?.map((img: any) => ({
          id: img.id,
          property_id: img.property_id,
          image_url: img.image_url,
          is_primary: img.is_primary || false,
          created_at: img.created_at
        })) || [];
        
        return {
          id: prop.id,
          merchant_id: prop.merchant_id,
          name: prop.name,
          type: prop.type,
          gender: prop.gender,
          description: prop.description,
          location_id: prop.location_id,
          address: prop.address,
          latitude: prop.latitude,
          longitude: prop.longitude,
          daily_price: prop.daily_price,
          monthly_price: prop.monthly_price,
          is_verified: prop.is_verified || false,
          created_at: prop.created_at,
          updated_at: prop.updated_at,
          location: locationData,
          images: propertyImages,
          facilities: []
        };
      }) || [];
      
      // Set data to state
      setBookings(mappedBookings);
      setFavoriteProperties(mappedProperties.slice(0, 3));
      setRecommendedProperties(mappedProperties.slice(3));
      setRecentSearches(mockSearches);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error loading data',
        description: 'Could not load dashboard data. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBookingStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/properties')} 
            className="mt-4 md:mt-0"
          >
            <Search className="mr-2 h-4 w-4" />
            Find Accommodation
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-blue-100">
                  <BookMarked className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                  <h3 className="text-2xl font-bold">{bookings.filter(b => b.status === 'confirmed').length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-pink-100">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Favorites</p>
                  <h3 className="text-2xl font-bold">{favoriteProperties.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-green-100">
                  <History className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent Searches</p>
                  <h3 className="text-2xl font-bold">{recentSearches.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4 justify-start"
                onClick={() => navigate('/properties')}
              >
                <div className="flex items-center mb-2">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">Find Rooms</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Browse available accommodations
                </p>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4 justify-start"
                onClick={() => navigate('/student/bookings')}
              >
                <div className="flex items-center mb-2">
                  <BookMarked className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">My Bookings</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Manage your current bookings
                </p>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4 justify-start"
                onClick={() => navigate('/student/favorites')}
              >
                <div className="flex items-center mb-2">
                  <Heart className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">Favorites</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  View your saved properties
                </p>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex-col items-start p-4 justify-start"
                onClick={() => navigate('/student/settings')}
              >
                <div className="flex items-center mb-2">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">My Profile</span>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Update your personal details
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="searches">Recent Searches</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>Manage your current and upcoming accommodation bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading your bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-1">No bookings yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't made any bookings yet. Start by exploring available properties.
                    </p>
                    <Button onClick={() => navigate('/properties')}>
                      Find Accommodation
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id} 
                        className="flex flex-col sm:flex-row border rounded-lg overflow-hidden hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => navigate(`/student/bookings/${booking.id}`)}
                      >
                        <div className="w-full sm:w-1/4 h-32 sm:h-auto bg-gray-200 relative">
                          {booking.property?.images && booking.property.images.length > 0 ? (
                            <img 
                              src={booking.property.images[0].image_url} 
                              alt={booking.property?.name || 'Property'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                            <h3 className="font-medium text-lg">{booking.property?.name || 'Property'}</h3>
                            <span className={`text-xs rounded-full px-2 py-1 inline-flex items-center w-fit ${
                              getBookingStatusClass(booking.status)
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {booking.property?.address || 'Address not available'}
                          </div>
                          <div className="text-sm flex flex-wrap gap-2 mb-2">
                            <span className="inline-flex items-center text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(booking.check_in_date).toLocaleDateString()}
                              {booking.check_out_date && ` - ${new Date(booking.check_out_date).toLocaleDateString()}`}
                            </span>
                            <span className="inline-flex items-center text-muted-foreground">
                              <Banknote className="h-3 w-3 mr-1" />
                              ₹{booking.total_amount} 
                              ({booking.time_frame === 'monthly' ? 'Monthly' : 'Daily'})
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/student/bookings/${booking.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {bookings.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/student/bookings')}
                      >
                        View All Bookings
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Your Favorite Properties</CardTitle>
                <CardDescription>Quick access to properties you've saved</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading your favorites...</p>
                  </div>
                ) : favoriteProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-1">No favorites yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't saved any properties to your favorites yet.
                    </p>
                    <Button onClick={() => navigate('/properties')}>
                      Browse Properties
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteProperties.map((property) => (
                      <Card key={property.id} className="overflow-hidden hover:shadow-md transition">
                        <div className="h-40 bg-gray-200 relative">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0].image_url} 
                              alt={property.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium mb-1 line-clamp-1">{property.name}</h3>
                          <div className="text-xs text-muted-foreground flex items-center mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {property.location?.name || property.address}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-medium">
                              ₹{property.monthly_price}/month
                            </span>
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
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/student/favorites')}
                >
                  View All Favorites
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Recommended Tab */}
          <TabsContent value="recommended" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recommended For You</CardTitle>
                <CardDescription>Personalized accommodation suggestions based on your preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Finding recommendations for you...</p>
                  </div>
                ) : recommendedProperties.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-1">No recommendations yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We'll provide personalized recommendations as you use the platform more.
                    </p>
                    <Button onClick={() => navigate('/properties')}>
                      Browse Properties
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedProperties.map((property) => (
                      <Card key={property.id} className="overflow-hidden hover:shadow-md transition">
                        <div className="h-40 bg-gray-200 relative">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0].image_url} 
                              alt={property.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded">
                            Recommended
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium mb-1 line-clamp-1">{property.name}</h3>
                          <div className="text-xs text-muted-foreground flex items-center mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {property.location?.name || property.address}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-medium">
                              ₹{property.monthly_price}/month
                            </span>
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
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/properties')}
                >
                  Explore More Properties
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Recent Searches Tab */}
          <TabsContent value="searches" className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
                <CardDescription>Your recent property searches</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading your search history...</p>
                  </div>
                ) : recentSearches.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <h3 className="font-medium text-lg mb-1">No recent searches</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You haven't made any property searches yet.
                    </p>
                    <Button onClick={() => navigate('/properties')}>
                      Search Properties
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentSearches.map((search) => (
                      <div key={search.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                        <div className="flex items-center">
                          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{search.query}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground mr-3">
                            {new Date(search.date).toLocaleDateString()}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/properties?q=${encodeURIComponent(search.query)}`)}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Activity Card */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
                <CardDescription>Recent interactions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback>{profile?.full_name?.substring(0, 2) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">You viewed a property</p>
                      <p className="text-xs text-muted-foreground">3-BHK Apartment in Delhi</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback>{profile?.full_name?.substring(0, 2) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">You contacted a merchant</p>
                      <p className="text-xs text-muted-foreground">Regarding Girl's Hostel in Mumbai</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback>{profile?.full_name?.substring(0, 2) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">You saved a property</p>
                      <p className="text-xs text-muted-foreground">Luxury PG near Bangalore University</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Need Help Card */}
        <Card className="shadow-sm bg-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="p-3 rounded-full bg-primary/10 mr-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Need help finding accommodation?</h3>
                  <p className="text-sm text-muted-foreground">Our team is ready to assist you with your search</p>
                </div>
              </div>
              <Button>Contact Support</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
