
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, Property } from '@/types';

interface SupabaseBooking {
  id: string;
  property_id: string;
  user_id: string;
  check_in_date: string;
  check_out_date: string | null;
  time_frame: "daily" | "monthly";
  price_per_unit: number;
  total_amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "processing" | "refunded";
  created_at: string;
  updated_at: string;
  property: Property;
  number_of_guests?: number;
  special_requests?: string;
}

const BookingConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Partial<SupabaseBooking> | null>(null);
  const [property, setProperty] = useState<Partial<Property> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId || !user) return;

      try {
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            property:properties(*)
          `)
          .eq('id', bookingId)
          .single();

        if (bookingError) throw bookingError;
        if (!bookingData) throw new Error('Booking not found');

        const propertyData = bookingData.property as Property;
        if (!propertyData) throw new Error('Property not found');

        setBooking(bookingData as SupabaseBooking);
        setProperty(propertyData);
      } catch (error: any) {
        console.error('Error fetching booking details:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, user, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-16 px-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!booking || !property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen py-16 px-4 bg-gray-50">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <p className="text-gray-500 mb-6">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Booking Confirmation</CardTitle>
                  <CardDescription>Booking Reference: {booking.id?.substring(0, 8)}</CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status || 'pending')}`}>
                  {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">{property.name}</h3>
                <p className="text-sm text-gray-500">{property.address}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Check-in Date</p>
                  <p className="font-medium">
                    {booking.check_in_date ? format(new Date(booking.check_in_date), 'dd MMM yyyy') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check-out Date</p>
                  <p className="font-medium">
                    {booking.check_out_date 
                      ? format(new Date(booking.check_out_date), 'dd MMM yyyy')
                      : booking.time_frame === 'monthly' 
                        ? format(new Date(booking.check_in_date || ''), 'dd MMM yyyy') + ' + 30 days'
                        : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Type</p>
                  <p className="font-medium capitalize">{booking.time_frame}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Number of Guests</p>
                  <p className="font-medium">{booking.number_of_guests || 1}</p>
                </div>
              </div>
              
              {booking.special_requests && (
                <div>
                  <p className="text-sm text-gray-500">Special Requests</p>
                  <p className="text-sm">{booking.special_requests}</p>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({booking.time_frame === 'daily' ? 'per day' : 'per month'})</span>
                  <span>₹{booking.price_per_unit?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span>{booking.time_frame === 'monthly' ? '1 month' : '1 day'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{booking.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg border-t">
              <Button variant="outline" onClick={() => window.history.back()}>
                Back
              </Button>
              
              {booking.status === 'pending' && (
                <Button variant="destructive">
                  Cancel Booking
                </Button>
              )}
              
              <Button onClick={() => window.print()}>
                Print / Download
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookingConfirmation;
