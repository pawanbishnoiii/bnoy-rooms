import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Property, Booking } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check, Calendar, Clock, User, Map, Home } from 'lucide-react';
import { format } from 'date-fns';
import PageLayout from '@/components/layout/PageLayout';
import { mapDbPropertyToProperty, mapDbBookingToBooking } from '@/utils/typeUtils';

const BookingConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBookingAndProperty();
    }
  }, [bookingId, user]);

  const fetchBookingAndProperty = async () => {
    setIsLoading(true);
    try {
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*, property:properties(*)')
        .eq('id', bookingId)
        .single();

      if (bookingError) {
        throw bookingError;
      }

      if (bookingData) {
        // Use the typeUtils to ensure proper mapping of property and booking data
        const property = mapDbPropertyToProperty(bookingData.property);
        const booking = mapDbBookingToBooking(bookingData);

        setProperty(property);
        setBooking(booking);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load booking details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading booking details...</div>;
  }

  if (!booking || !property) {
    return <div>Booking not found.</div>;
  }

  return (
    <PageLayout>
      <div className="container mx-auto mt-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Booking Confirmation</CardTitle>
            <CardDescription>
              Your booking at {property.name} has been confirmed.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Booking ID: {booking.id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4 text-gray-500" />
              <span>Property: {property.name}, {property.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Check-in: {format(new Date(booking.check_in_date), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Check-out: {format(new Date(booking.check_out_date), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Time Frame: {booking.time_frame}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>Number of Guests: {booking.number_of_guests}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Map className="h-4 w-4 text-gray-500" />
              <span>Total Amount: ${booking.total_amount}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/bookings">
              <Button>View Bookings</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BookingConfirmation;
