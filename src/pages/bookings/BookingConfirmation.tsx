
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Calendar, Home, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const BookingConfirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId || !user) return;

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

        if (error) {
          throw error;
        }

        if (!data) {
          toast({
            title: 'Booking not found',
            description: 'The booking you are looking for does not exist',
            variant: 'destructive',
          });
          navigate('/dashboard/student');
          return;
        }

        // Ensure user can only view their own bookings
        if (data.user_id !== user.id) {
          toast({
            title: 'Access denied',
            description: 'You do not have permission to view this booking',
            variant: 'destructive',
          });
          navigate('/dashboard/student');
          return;
        }

        setBooking(data as Booking);
      } catch (error: any) {
        console.error('Error fetching booking:', error);
        toast({
          title: 'Error',
          description: 'Failed to load booking information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, user, toast, navigate]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
          <p className="mb-6">The booking you are looking for does not exist or you don't have permission to view it.</p>
          <Button asChild>
            <Link to="/dashboard/student">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <Link to="/dashboard/student" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Booking Confirmation</h1>
            <p className="text-gray-600">
              Your booking request has been submitted successfully.
            </p>
          </div>
          
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                <ul className="space-y-3">
                  <li className="flex">
                    <Calendar className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <span className="block text-sm text-gray-500">Check-in Date</span>
                      <span className="font-medium">{formatDate(booking.check_in_date)}</span>
                    </div>
                  </li>
                  
                  {booking.check_out_date && (
                    <li className="flex">
                      <Calendar className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <span className="block text-sm text-gray-500">Check-out Date</span>
                        <span className="font-medium">{formatDate(booking.check_out_date)}</span>
                      </div>
                    </li>
                  )}
                  
                  <li className="flex">
                    <Clock className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <span className="block text-sm text-gray-500">Booking Type</span>
                      <span className="font-medium capitalize">{booking.time_frame}</span>
                    </div>
                  </li>
                  
                  {booking.number_of_guests && (
                    <li className="flex">
                      <User className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <span className="block text-sm text-gray-500">Guests</span>
                        <span className="font-medium">{booking.number_of_guests}</span>
                      </div>
                    </li>
                  )}
                  
                  <li className="flex">
                    <div className="rounded-full bg-primary w-5 h-5 flex items-center justify-center text-white text-xs mr-3">₹</div>
                    <div>
                      <span className="block text-sm text-gray-500">Total Amount</span>
                      <span className="font-medium">₹{booking.total_amount.toLocaleString()}</span>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Property Information</h3>
                {booking.property && (
                  <div className="flex">
                    <Home className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <div>
                      <span className="block font-medium">{booking.property.name}</span>
                      <span className="block text-sm text-gray-500">{booking.property.address}</span>
                      <span className="block text-sm text-gray-500 capitalize">{booking.property.type} • {booking.property.gender}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Booking Status</h3>
            <div className="flex items-center">
              <div className={`
                inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'}
              `}>
                {booking.status === 'pending' && 'Pending approval'}
                {booking.status === 'confirmed' && 'Confirmed'}
                {booking.status === 'cancelled' && 'Cancelled'}
                {booking.status === 'completed' && 'Completed'}
              </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              {booking.status === 'pending' && 'Your booking request is awaiting approval from the property owner. We will notify you once it is confirmed.'}
              {booking.status === 'confirmed' && 'Your booking has been confirmed by the property owner. You can proceed with your stay as planned.'}
              {booking.status === 'cancelled' && 'This booking has been cancelled. If you have any questions, please contact customer support.'}
              {booking.status === 'completed' && 'This booking has been completed. We hope you enjoyed your stay!'}
            </p>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 mb-4">
              Your booking reference: <span className="font-mono font-medium">{booking.id}</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/dashboard/student">View All Bookings</Link>
              </Button>
              
              {booking.property && (
                <Button asChild>
                  <Link to={`/property/${booking.property.id}`}>View Property</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default BookingConfirmation;
