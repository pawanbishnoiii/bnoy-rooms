
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, CreditCard, Heart, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Booking, Favorite, Property } from '@/types';
import { format } from 'date-fns';
import { mapDbBookingToBooking, mapDbFavoriteToFavorite } from '@/utils/typeUtils';

const StudentPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);
  
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch recent bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          property:properties(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (bookingsError) throw bookingsError;
      
      // Fetch favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select(`
          *,
          property:properties(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (favoritesError) throw favoritesError;
      
      // Use the mappers to ensure type safety
      const mappedBookings = bookingsData ? bookingsData.map(booking => mapDbBookingToBooking(booking)) : [];
      const mappedFavorites = favoritesData ? favoritesData.map(favorite => mapDbFavoriteToFavorite(favorite)) : [];
      
      setBookings(mappedBookings);
      setFavorites(mappedFavorites);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your dashboard. Manage your bookings and preferences.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => navigate('/dashboard/bookings')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">My Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              View and manage your bookings
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => navigate('/dashboard/favorites')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Properties you've saved
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => navigate('/dashboard/reviews')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">My Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Reviews you've written
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your recent accommodation bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">No bookings yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't made any bookings yet.
                </p>
                <button 
                  onClick={() => navigate('/properties')}
                  className="text-sm text-primary hover:underline"
                >
                  Browse properties
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">{booking.property?.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {format(new Date(booking.check_in_date), 'dd MMM yyyy')}
                          {booking.check_out_date && ` - ${format(new Date(booking.check_out_date), 'dd MMM yyyy')}`}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{booking.property?.address}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/bookings/${booking.id}/confirmation`)}
                        className="text-xs text-primary hover:underline mt-2"
                      >
                        View booking details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Saved Properties</CardTitle>
            <CardDescription>Properties you've favorited</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">No favorites yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't added any properties to your favorites.
                </p>
                <button 
                  onClick={() => navigate('/properties')}
                  className="text-sm text-primary hover:underline"
                >
                  Discover properties
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="flex items-start gap-4">
                    <div 
                      className="h-12 w-12 rounded-md bg-gray-100 overflow-hidden"
                      style={{
                        backgroundImage: favorite.property && favorite.property.images && favorite.property.images.length > 0 ? 
                          `url(${favorite.property.images[0].image_url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{favorite.property?.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">₹{favorite.property?.monthly_price}/month</p>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{favorite.property?.address}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/properties/${favorite.property_id}`)}
                        className="text-xs text-primary hover:underline mt-2"
                      >
                        View property →
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => navigate('/dashboard/favorites')}
                  className="text-sm text-primary hover:underline flex items-center"
                >
                  View all favorites
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPanel;
