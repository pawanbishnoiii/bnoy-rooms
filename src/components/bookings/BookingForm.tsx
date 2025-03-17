
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar as CalendarIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property, TimeFrame, Booking } from '@/types';

const bookingSchema = z.object({
  check_in_date: z.date({
    required_error: "Check-in date is required"
  }),
  check_out_date: z.date().optional(),
  time_frame: z.enum(['daily', 'monthly'], {
    required_error: "Booking type is required"
  }),
  number_of_guests: z.number()
    .min(1, "At least 1 guest is required")
    .max(10, "Maximum 10 guests allowed"),
  special_requests: z.string().max(500, "Special requests cannot exceed 500 characters").optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  property: Property;
  onSuccess?: (booking: Booking) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ property, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      check_in_date: new Date(),
      time_frame: 'monthly',
      number_of_guests: 1,
      special_requests: '',
    },
  });

  const timeFrame = form.watch('time_frame');
  const checkInDate = form.watch('check_in_date');
  const checkOutDate = form.watch('check_out_date');
  const numberOfGuests = form.watch('number_of_guests');

  useEffect(() => {
    // Calculate total amount based on time frame and duration
    if (timeFrame === 'monthly') {
      setTotalAmount(property.monthly_price);
    } else if (timeFrame === 'daily' && property.daily_price) {
      // If check-out date is provided, calculate days difference
      if (checkOutDate) {
        const days = Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        setTotalAmount(property.daily_price * Math.max(1, days));
      } else {
        setTotalAmount(property.daily_price);
      }
    }
  }, [timeFrame, checkInDate, checkOutDate, property.monthly_price, property.daily_price]);

  const onSubmit = async (values: BookingFormValues) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to book this property',
        variant: 'destructive',
      });
      navigate('/auth/login', { state: { from: window.location.pathname } });
      return;
    }

    try {
      setIsSubmitting(true);

      const bookingData = {
        property_id: property.id,
        user_id: user!.id,
        check_in_date: format(values.check_in_date, 'yyyy-MM-dd'),
        check_out_date: values.check_out_date ? format(values.check_out_date, 'yyyy-MM-dd') : null,
        time_frame: values.time_frame,
        price_per_unit: values.time_frame === 'monthly' ? property.monthly_price : property.daily_price || 0,
        total_amount: totalAmount,
        status: 'pending',
        number_of_guests: values.number_of_guests,
        special_requests: values.special_requests || null,
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: 'Booking submitted',
        description: 'Your booking request has been successfully submitted!',
      });

      form.reset();

      if (onSuccess && data) {
        onSuccess(data as Booking);
      }

      // Redirect to booking confirmation page
      navigate(`/bookings/${data.id}/confirmation`);
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      toast({
        title: 'Booking failed',
        description: error.message || 'An error occurred while submitting your booking',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 sticky top-24">
      <h3 className="text-lg font-semibold mb-4">Book This Property</h3>
      
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-2xl font-bold">₹{property.monthly_price.toLocaleString()}</span>
          <span className="text-gray-500">/month</span>
        </div>
        {property.daily_price && (
          <div>
            <span className="text-lg font-medium">₹{property.daily_price.toLocaleString()}</span>
            <span className="text-gray-500">/day</span>
          </div>
        )}
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="time_frame"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <label htmlFor="monthly" className="cursor-pointer">Monthly</label>
                    </div>
                    
                    {property.daily_price ? (
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <label htmlFor="daily" className="cursor-pointer">Daily</label>
                      </div>
                    ) : null}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className={timeFrame === 'daily' ? 'grid grid-cols-2 gap-4' : ''}>
            <FormField
              control={form.control}
              name="check_in_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Check-in Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {timeFrame === 'daily' && (
              <FormField
                control={form.control}
                name="check_out_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < checkInDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <FormField
            control={form.control}
            name="number_of_guests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Guests</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      className="pl-10"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="special_requests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Requests (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special requirements or requests..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2 text-muted-foreground text-sm">
              <span>Service fee</span>
              <span>₹0</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Request to Book'}
          </Button>
        </form>
      </Form>
      
      <p className="text-xs text-center text-muted-foreground mt-4">
        You won't be charged yet. Payments will be processed after the owner accepts your booking.
      </p>
    </div>
  );
};

export default BookingForm;
