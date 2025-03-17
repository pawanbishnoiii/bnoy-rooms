import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Booking, BookingStatus, GenderOption, TimeFrame, UserRole } from '@/types';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const BookingConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            property:properties(*),
            user:profiles(*)
          `)
          .eq('id', bookingId)
          .single();
          
        if (error) throw error;
        
        const bookingData: Booking = {
          id: data.id,
          property_id: data.property_id,
          user_id: data.user_id,
          check_in_date: data.check_in_date,
          check_out_date: data.check_out_date,
          time_frame: data.time_frame as TimeFrame,
          price_per_unit: data.price_per_unit,
          total_amount: data.total_amount,
          status: data.status as BookingStatus,
          created_at: data.created_at,
          updated_at: data.updated_at,
          property: data.property ? {
            id: data.property.id,
            merchant_id: data.property.merchant_id,
            name: data.property.name,
            type: data.property.type,
            gender: data.property.gender as GenderOption,
            description: data.property.description,
            location_id: data.property.location_id,
            address: data.property.address,
            latitude: data.property.latitude,
            longitude: data.property.longitude,
            daily_price: data.property.daily_price,
            monthly_price: data.property.monthly_price,
            is_verified: data.property.is_verified,
            created_at: data.property.created_at,
            updated_at: data.property.updated_at
          } : null,
          user: data.user && !data.user.error ? {
            id: data.user.id,
            full_name: data.user.full_name,
            role: data.user.role as UserRole,
            phone: data.user.phone,
            email: data.user.email,
            avatar_url: data.user.avatar_url,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at
          } : null,
          number_of_guests: data.number_of_guests,
          special_requests: data.special_requests
        };
        
        setBooking(bookingData);
      } catch (error: any) {
        console.error('Error fetching booking:', error);
        toast({
          title: "Error",
          description: "Could not load booking details. " + error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, supabase, toast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Loading booking details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2>Booking not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-4">Booking Confirmation</h1>

      <div className="mb-4">
        <strong>Booking ID:</strong> {booking.id}
      </div>

      <div className="mb-4">
        <strong>Property:</strong>{' '}
        {booking.property ? (
          <Link to={`/properties/${booking.property.id}`} className="text-blue-500 hover:underline">
            {booking.property.name}
          </Link>
        ) : (
          'Property details not available'
        )}
      </div>

      <div className="mb-4">
        <strong>Check-in Date:</strong>{' '}
        {format(new Date(booking.check_in_date), 'MMMM dd, yyyy')}
      </div>

      {booking.check_out_date && (
        <div className="mb-4">
          <strong>Check-out Date:</strong>{' '}
          {format(new Date(booking.check_out_date), 'MMMM dd, yyyy')}
        </div>
      )}

      <div className="mb-4">
        <strong>Time Frame:</strong> {booking.time_frame}
      </div>

      <div className="mb-4">
        <strong>Total Amount:</strong> ${booking.total_amount}
      </div>

      <div className="mb-4">
        <strong>Status:</strong> {booking.status}
      </div>

      <div className="mb-4">
        <strong>Booked on:</strong> {format(new Date(booking.created_at), 'MMMM dd, yyyy')}
      </div>

      <Button asChild>
        <Link to="/">
          Go to Homepage
        </Link>
      </Button>
    </div>
  );
};

export default BookingConfirmation;
