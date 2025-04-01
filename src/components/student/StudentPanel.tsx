
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Booking, Favorite } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { mapDbBookingToBooking, mapDbFavoriteToFavorite } from '@/utils/typeUtils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookMarked, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudentPanel = () => {
  const { user } = useAuth();
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch recent bookings
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*, property:properties(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (bookingsError) throw bookingsError;
        
        // Fetch favorites
        const { data: favoritesData, error: favoritesError } = await supabase
          .from('favorites')
          .select('*, property:properties(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (favoritesError) throw favoritesError;
        
        // Map the data to the correct types
        const mappedBookings = bookingsData ? bookingsData.map(mapDbBookingToBooking) : [];
        const mappedFavorites = favoritesData ? favoritesData.map(fav => mapDbFavoriteToFavorite(fav)) : [];
        
        setRecentBookings(mappedBookings);
        setFavorites(mappedFavorites);
        
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudentData();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookMarked className="mr-2 h-5 w-5" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{booking.property?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.check_in_date).toLocaleDateString()} - {booking.status}
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/bookings/${booking.id}/confirmation`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/student/bookings">View All Bookings</Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No recent bookings found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              Favorite Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length > 0 ? (
              <div className="space-y-4">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{favorite.property?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{favorite.property?.monthly_price}/month
                      </p>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/properties/${favorite.property_id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/student/favorites">View All Favorites</Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No favorite properties found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPanel;
