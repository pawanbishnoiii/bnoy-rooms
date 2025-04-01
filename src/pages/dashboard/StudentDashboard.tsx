import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Booking, Favorite } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/charts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Eye, BookOpen, Heart, Calendar, Clock, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { mapDbBookingToBooking, mapDbFavoriteToFavorite } from '@/utils/typeUtils';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBookingCount, setActiveBookingCount] = useState(0);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, property:properties(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select(`*, property:properties(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (favoritesError) throw favoritesError;

      // Map the data to the correct types
      const mappedBookings = bookingsData.map(mapDbBookingToBooking);
      const mappedFavorites = favoritesData.map(mapDbFavoriteToFavorite);

      setBookings(mappedBookings);
      setFavorites(mappedFavorites);
      
      // Count active bookings (now using the correct booking status comparison)
      const activeCount = bookingsData.filter(b => 
        b.status === 'confirmed' || b.status === 'pending'
      ).length;
      
      setActiveBookingCount(activeCount);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`*, property:properties(*)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Use the correct mapping function
      setFavorites(data ? data.map(fav => mapDbFavoriteToFavorite(fav)) : []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your favorites. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      <h1 className="text-2xl font-semibold mb-4">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Active Bookings"
          value={activeBookingCount}
          icon={<Calendar />}
          description="Number of current and upcoming bookings"
        />
        <StatsCard
          title="Favorite Properties"
          value={favorites.length}
          icon={<Heart />}
          description="Properties saved for later"
        />
        {/* Add more stats cards as needed */}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Your upcoming and past bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Check-in Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.property?.name}</TableCell>
                  <TableCell>{new Date(booking.check_in_date).toLocaleDateString()}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/bookings/${booking.id}/confirmation`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Favorite Properties</CardTitle>
          <CardDescription>Properties you have saved</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {favorites.map((favorite) => (
                <TableRow key={favorite.id}>
                  <TableCell>{favorite.property?.name}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(favorite.created_at), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/properties/${favorite.property_id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Property
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
