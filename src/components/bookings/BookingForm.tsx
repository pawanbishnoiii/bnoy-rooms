
import { useState } from 'react';
import { useRouter } from '@/hooks/use-router';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TimeFrame } from "@/types";

interface BookingFormProps {
  propertyId: string;
  price: number;
  timeFrame: TimeFrame;
  onSuccess?: (bookingId: string) => void;
}

const formSchema = z.object({
  checkInDate: z.date({
    required_error: "Please select a check-in date.",
  }),
  checkOutDate: z.date({
    required_error: "Please select a check-out date.",
  }).optional(),
  numberOfGuests: z.number().min(1, {
    message: "At least 1 guest is required.",
  }),
  specialRequests: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const BookingForm = ({ propertyId, price, timeFrame, onSuccess }: BookingFormProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkInDate: new Date(),
      numberOfGuests: 1,
      specialRequests: '',
    },
  });

  const handleBookingSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book this property.",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);

    try {
      // Calculate total amount based on time frame
      const checkInDate = values.checkInDate;
      const checkOutDate = values.checkOutDate || checkInDate;
      
      let units = 1; // Default to 1 month for monthly bookings
      if (timeFrame === 'daily') {
        // Calculate days difference
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        units = Math.max(diffDays, 1);
      }

      const totalAmount = price * units;

      // Fix: Convert Date objects to ISO strings for Supabase
      const bookingData = {
        property_id: propertyId,
        user_id: user.id,
        check_in_date: values.checkInDate.toISOString(),
        check_out_date: (values.checkOutDate || values.checkInDate).toISOString(),
        time_frame: timeFrame,
        price_per_unit: price,
        total_amount: totalAmount,
        status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed', // Use exact string literal type
        number_of_guests: values.numberOfGuests,
        special_requests: values.specialRequests || '',
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Booking Successful",
        description: "Your booking request has been submitted.",
      });

      if (onSuccess && data) {
        onSuccess(data.id);
      } else if (data) {
        router.push(`/bookings/${data.id}/confirmation`);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error submitting your booking.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Property</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleBookingSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="checkInDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Check-in Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
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
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
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
                name="checkOutDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
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
                          disabled={(date) =>
                            date < form.getValues().checkInDate
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="numberOfGuests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Guests</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests</FormLabel>
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

            <div className="py-2">
              <div className="flex justify-between items-center">
                <span>Price ({timeFrame === 'daily' ? 'per day' : 'per month'})</span>
                <span>₹{price.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center font-bold mt-2">
                <span>Total amount</span>
                <span>₹{price.toLocaleString()}</span>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={form.handleSubmit(handleBookingSubmit)} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? "Processing..." : "Book Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingForm;
