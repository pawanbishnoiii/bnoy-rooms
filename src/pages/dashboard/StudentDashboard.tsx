
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BookingStatus, GenderOption, TimeFrame } from '@/types';
import { Badge } from '@/components/ui/badge';
import { BookText, Building, Calendar, CreditCard, Home, Package, Star } from 'lucide-react';
import { Property } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Types for bookings
interface Booking {
  id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string | null;
  user_id: string;
  time_frame: TimeFrame;
  price_per_unit: number;
  total_amount: number;
  status: BookingStatus;
  property: Property;
  created_at: string;
}

// Types for favorites
interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  property: Property;
  created_at: string;
}

const StudentDashboard = () => {
  const { user, profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Query bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(
            *,
            location:locations(name),
            images:property_images(image_url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Booking[];
    },
    enabled: !!user
  });

  // Query favorites
  const { data: favorites, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          property:properties(
            *,
            location:locations(name),
            images:property_images(image_url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Favorite[];
    },
    enabled: !!user
  });

  // Get booking status color
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Handle remove favorite
  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Property removed from favorites',
      });

      // Refetch favorites
      // This will be handled by the query invalidation
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove from favorites',
        variant: 'destructive'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || 'Student'}! Manage your accommodations and bookings.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Home className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="mr-2 h-4 w-4" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <BookText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {bookings?.filter(b => b.status === 'active' || b.status === 'confirmed').length || 0} active bookings
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favorites?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Properties in your favorites
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accommodation Preference</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {profile?.preferred_gender_accommodation as GenderOption || 'common'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your preferred accommodation type
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your most recent accommodation bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBookings ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                        <div className="w-full sm:w-24 h-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          {booking.property.images && booking.property.images.length > 0 ? (
                            <img 
                              src={booking.property.images.find((img: any) => img.is_primary)?.image_url || booking.property.images[0].image_url} 
                              alt={booking.property.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Building className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <h4 className="font-semibold">{booking.property.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {booking.property.location?.name || booking.property.address}
                              </p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-sm">
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(booking.check_in_date).toLocaleDateString()} 
                              {booking.check_out_date && ` - ${new Date(booking.check_out_date).toLocaleDateString()}`}
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="mr-1 h-3 w-3" />
                              ₹{booking.total_amount} ({booking.time_frame})
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {bookings.length > 3 && (
                      <div className="flex justify-center">
                        <Button variant="outline" onClick={() => handleTabChange('bookings')}>
                          View all bookings
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                    <h3 className="font-medium text-lg">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
                    <Button onClick={() => navigate('/properties')}>Find accommodations</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>Track all your accommodation bookings</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBookings ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                        <div className="w-full sm:w-32 h-32 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                          {booking.property.images && booking.property.images.length > 0 ? (
                            <img 
                              src={booking.property.images.find((img: any) => img.is_primary)?.image_url || booking.property.images[0].image_url} 
                              alt={booking.property.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Building className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-lg">{booking.property.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {booking.property.location?.name || booking.property.address}
                              </p>
                            </div>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm">
                            <div>
                              <div className="font-medium text-xs uppercase text-muted-foreground mb-1">Booking Period</div>
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {new Date(booking.check_in_date).toLocaleDateString()} 
                                {booking.check_out_date && ` - ${new Date(booking.check_out_date).toLocaleDateString()}`}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-xs uppercase text-muted-foreground mb-1">Payment</div>
                              <div className="flex items-center">
                                <CreditCard className="mr-1 h-4 w-4" />
                                ₹{booking.total_amount} ({booking.time_frame})
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-xs uppercase text-muted-foreground mb-1">Booking Date</div>
                              <div className="flex items-center">
                                <BookText className="mr-1 h-4 w-4" />
                                {new Date(booking.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/properties/${booking.property_id}`)}>
                              View Property
                            </Button>
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button size="sm" variant="destructive">
                                Cancel Booking
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                    <h3 className="font-medium text-lg">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
                    <Button onClick={() => navigate('/properties')}>Find accommodations</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Favorite Properties</CardTitle>
                <CardDescription>Properties you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingFavorites ? (
                  <div className="flex justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : favorites && favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((favorite) => (
                      <div key={favorite.id} className="border rounded-lg overflow-hidden">
                        <div className="h-40 relative">
                          {favorite.property.images && favorite.property.images.length > 0 ? (
                            <img 
                              src={favorite.property.images.find((img: any) => img.is_primary)?.image_url || favorite.property.images[0].image_url} 
                              alt={favorite.property.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Building className="h-10 w-10 text-gray-400" />
                            </div>
                          )}
                          <Button 
                            size="icon" 
                            variant="destructive"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full"
                            onClick={() => handleRemoveFavorite(favorite.id)}
                          >
                            <Star className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold">{favorite.property.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {favorite.property.location?.name || favorite.property.address}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <p className="font-bold">₹{favorite.property.monthly_price} <span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/properties/${favorite.property_id}`)}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="mx-auto h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                    <h3 className="font-medium text-lg">No favorites yet</h3>
                    <p className="text-muted-foreground mb-4">You haven't saved any properties to your favorites.</p>
                    <Button onClick={() => navigate('/properties')}>Browse properties</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
