
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle, ArrowLeft, Calendar, MapPin, CreditCard, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, Property } from '@/types';

const BookingConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Partial<Booking> | null>(null);
  const [property, setProperty] = useState<Partial<Property> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId || !user) return;

      try {
        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            property:properties(*)
          `)
          .eq('id', bookingId)
          .eq('user_id', user.id)
          .single();

        if (bookingError) throw bookingError;
        if (!bookingData) throw new Error('Booking not found');

        // Safely handle property data
        const propertyData = bookingData.property as Property;
        if (!propertyData) throw new Error('Property not found');

        // Transform booking data to match Booking type
        const transformedBooking: Partial<Booking> = {
          id: bookingData.id,
          property_id: bookingData.property_id,
          user_id: bookingData.user_id,
          check_in_date: bookingData.check_in_date,
          check_out_date: bookingData.check_out_date,
          time_frame: bookingData.time_frame,
          price_per_unit: bookingData.price_per_unit,
          total_amount: bookingData.total_amount,
          status: bookingData.status,
          created_at: bookingData.created_at,
          updated_at: bookingData.updated_at,
          number_of_guests: bookingData.number_of_guests || 1,
          special_requests: bookingData.special_requests || '',
        };

        setBooking(transformedBooking);
        setProperty(propertyData);
      } catch (error: any) {
        console.error('Error fetching booking details:', error);
        toast({
          title: 'Error',
          description: error.message || 'Could not load booking details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, user, toast]);

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!booking || !property) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Booking Not Found</CardTitle>
            <CardDescription>The booking you're looking for doesn't exist or you don't have permission to view it.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Button variant="outline" className="mb-6" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-primary h-2"></div>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Booking Confirmation</CardTitle>
            <CardDescription>Your booking has been {booking.status}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-3">Property Details</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-bold">{property.name}</h4>
                        <p className="text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" /> {property.address}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-1.5 rounded-full mr-3">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Check-in</p>
                          <p className="text-sm">{format(new Date(booking.check_in_date || ''), 'PPP')}</p>
                        </div>
                      </div>
                      {booking.check_out_date && booking.time_frame === 'daily' && (
                        <div className="flex items-center">
                          <div className="bg-primary/10 p-1.5 rounded-full mr-3">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Check-out</p>
                            <p className="text-sm">{format(new Date(booking.check_out_date), 'PPP')}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-1.5 rounded-full mr-3">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Guests</p>
                          <p className="text-sm">{booking.number_of_guests || 1} guest(s)</p>
                        </div>
                      </div>
                      {booking.special_requests && (
                        <div>
                          <p className="text-sm font-medium">Special Requests</p>
                          <p className="text-sm mt-1">{booking.special_requests}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-3">Payment Details</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Booking ID</span>
                        <span className="font-mono text-sm">{booking.id?.substring(0, 8)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Price {booking.time_frame === 'daily' ? 'per day' : 'per month'}</span>
                        <span>₹{booking.price_per_unit?.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-bold">
                        <span>Total Amount</span>
                        <span>₹{booking.total_amount?.toLocaleString()}</span>
                      </div>

                      <div className="pt-4">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Payment will be collected at the property</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between bg-muted/50 p-6">
            <div>
              <p className="text-sm text-muted-foreground">For any queries, please contact us at</p>
              <p className="font-medium">support@bnoynest.com</p>
            </div>
            <Button onClick={() => window.print()}>Print Receipt</Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;
