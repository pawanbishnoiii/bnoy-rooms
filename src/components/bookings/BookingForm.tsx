import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BookingStatus, GenderOption, Property, TimeFrame } from '@/types';

const formSchema = z.object({
  check_in_date: z.date({
    required_error: "A check-in date is required.",
  }),
  check_out_date: z.date({
    required_error: "A check-out date is required.",
  }),
  time_frame: z.enum(['daily', 'monthly'], {
    required_error: "Please select a time frame.",
  }),
  number_of_guests: z.number().min(1).max(10).default(1),
  special_requests: z.string().optional(),
});

interface BookingFormProps {
  property: Property;
}

const BookingForm: React.FC<BookingFormProps> = ({ property }) => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      check_in_date: new Date(),
      check_out_date: new Date(),
      time_frame: 'monthly',
      number_of_guests: 1,
      special_requests: '',
    },
  });

  const calculateTotalAmount = (values: z.infer<typeof formSchema>): number => {
    const { check_in_date, check_out_date, time_frame } = values;
    const pricePerUnit = time_frame === 'daily' ? property.daily_price : property.monthly_price;
  
    if (!pricePerUnit) {
      return 0;
    }
  
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
  
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return 0;
    }
  
    const timeDiff = checkOut.getTime() - checkIn.getTime();
  
    if (time_frame === 'daily') {
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return pricePerUnit * daysDiff;
    } else {
      const monthsDiff = (checkOut.getFullYear() - checkIn.getFullYear()) * 12 + (checkOut.getMonth() - checkIn.getMonth());
      return pricePerUnit * monthsDiff;
    }
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Calculate total amount based on selected dates and time frame
      const totalAmount = calculateTotalAmount(values);
      
      const bookingData = {
        property_id: property.id,
        user_id: user.id,
        check_in_date: values.check_in_date,
        check_out_date: values.check_out_date,
        time_frame: values.time_frame as TimeFrame,
        price_per_unit: values.time_frame === 'daily' ? property.daily_price : property.monthly_price,
        total_amount: totalAmount,
        status: 'pending' as BookingStatus, // Cast to BookingStatus type
        number_of_guests: values.number_of_guests,
        special_requests: values.special_requests,
      };
      
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Booking Submitted",
        description: "Your booking has been successfully submitted and is awaiting confirmation.",
      });
      
      router.push(`/bookings/${data.id}/confirmation`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error submitting your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="check_in_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-in date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarUI
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="check_out_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Check-out date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarUI
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < form.getValues('check_in_date')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="time_frame"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Frame</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time frame" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="number_of_guests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Guests</FormLabel>
              <FormControl>
                <Slider
                  defaultValue={[field.value]}
                  max={10}
                  min={1}
                  step={1}
                  onValueChange={(value) => field.onChange(value[0])}
                  className="max-w-md"
                />
              </FormControl>
              <p className="text-sm text-muted-foreground">
                Selected: {field.value} guest(s)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="special_requests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requests</FormLabel>
              <FormControl>
                <Input placeholder="Any special requests?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Booking"}
        </Button>
      </form>
    </Form>
  );
};

export default BookingForm;
