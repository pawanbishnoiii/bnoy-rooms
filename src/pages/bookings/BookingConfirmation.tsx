
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, ArrowLeft, MapPin, Clock, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';

const BookingConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || !user) return;

      try {
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

        if (data) {
          // Handle potential errors in nested objects
          const userData = data.user && !data.user.error ? data.user : null;
          const propertyData = data.property && !data.property.error ? data.property : null;

          // Transform the booking data to match the Booking type
          const transformedBooking: Booking = {
            id: data.id,
            property_id: data.property_id,
            user_id: data.user_id,
            check_in_date: data.check_in_date,
            check_out_date: data.check_out_date,
            time_frame: data.time_frame,
            price_per_unit: data.price_per_unit,
            total_amount: data.total_amount,
            status: data.status,
            created_at: data.created_at,
            updated_at: data.updated_at,
            property: propertyData ? {
              id: propertyData.id,
              merchant_id: propertyData.merchant_id,
              name: propertyData.name,
              type: propertyData.type,
              gender: propertyData.gender,
              description: propertyData.description,
              location_id: propertyData.location_id,
              address: propertyData.address,
              latitude: propertyData.latitude,
              longitude: propertyData.longitude,
              daily_price: propertyData.daily_price,
              monthly_price: propertyData.monthly_price,
              is_verified: propertyData.is_verified,
              created_at: propertyData.created_at,
              updated_at: propertyData.updated_at,
            } : null,
            user: userData ? {
              id: userData.id,
              full_name: userData.full_name,
              role: userData.role,
              phone: userData.phone,
              email: userData.email,
              avatar_url: userData.avatar_url,
              created_at: userData.created_at,
              updated_at: userData.updated_at,
            } : null,
            // Add these properties for flexibility
            number_of_guests: data.number_of_guests || 1,
            special_requests: data.special_requests || '',
          };

          setBooking(transformedBooking);
        }
      } catch (error: any) {
        console.error('Error fetching booking:', error);
        toast({
          title: 'Error',
          description: 'Could not load booking details.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user, toast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg">Loading booking details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Booking Not Found</h1>
            <p className="mb-4">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="w-full max-w-3xl mx-auto animate-fade-in">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Booking Confirmation</CardTitle>
                <CardDescription>Booking ID: {booking.id}</CardDescription>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium capitalize">{booking.status}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Property Details</h3>
              <div className="bg-muted/40 p-4 rounded-lg">
                <h4 className="font-medium text-lg">{booking.property?.name}</h4>
                <div className="flex items-center mt-1 text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  <p>{booking.property?.address}</p>
                </div>
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs bg-primary/10 rounded-full capitalize">
                    {booking.property?.type}
                  </span>
                  <span className="inline-block ml-2 px-2 py-1 text-xs bg-primary/10 rounded-full capitalize">
                    {booking.property?.gender}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Check-in Date</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <div className="font-medium">
                    {format(new Date(booking.check_in_date), 'PPP')}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Check-out Date</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  <div className="font-medium">
                    {booking.check_out_date ? format(new Date(booking.check_out_date), 'PPP') : 'Not specified'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Time Frame</div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <div className="font-medium capitalize">{booking.time_frame}</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Number of Guests</div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  <div className="font-medium">{booking.number_of_guests || 1}</div>
                </div>
              </div>
            </div>

            {booking.special_requests && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Special Requests</div>
                <div className="bg-muted/40 p-3 rounded-lg flex items-start">
                  <FileText className="h-4 w-4 mr-2 mt-1 text-primary" />
                  <div>{booking.special_requests}</div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">Payment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price ({booking.time_frame})</span>
                  <span>₹{booking.price_per_unit}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{booking.total_amount}</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-stretch gap-4 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => navigate('/')}>
              Browse More Properties
            </Button>
            <Button>Download Receipt</Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
