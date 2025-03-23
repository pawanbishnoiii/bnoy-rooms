import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TimeFrame, Room, BookingStatus } from "@/types";

interface BookingFormProps {
  propertyId: string;
  price: number;
  timeFrame: TimeFrame;
  onSuccess?: (bookingId: string) => void;
  roomId?: string;
}

const formSchema = z.object({
  roomId: z.string().optional(),
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
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const BookingForm = ({ propertyId, price, timeFrame, onSuccess, roomId: defaultRoomId }: BookingFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalAmount, setTotalAmount] = useState(price);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: defaultRoomId || (location.state as any)?.selectedRoomId || '',
      checkInDate: new Date(),
      checkOutDate: timeFrame === 'daily' ? new Date(new Date().setDate(new Date().getDate() + 1)) : undefined,
      numberOfGuests: 1,
      specialRequests: '',
      checkInTime: '12:00',
      checkOutTime: '10:00',
    },
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('property_id', propertyId)
          .eq('is_available', true);
          
        if (error) throw error;
        
        setRooms(data || []);
        
        const roomIdToUse = defaultRoomId || (location.state as any)?.selectedRoomId;
        if (roomIdToUse && data) {
          const room = data.find(r => r.id === roomIdToUse);
          if (room) {
            setSelectedRoom(room);
            form.setValue('roomId', room.id);
            
            if (timeFrame === 'monthly' && room.monthly_price) {
              setTotalAmount(room.monthly_price);
            } else if (timeFrame === 'daily' && room.daily_price) {
              setTotalAmount(room.daily_price);
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching rooms:', error);
      }
    };
    
    if (propertyId) {
      fetchRooms();
    }
  }, [propertyId, defaultRoomId, location.state]);

  useEffect(() => {
    const checkInDate = form.getValues('checkInDate');
    const checkOutDate = form.getValues('checkOutDate');
    
    if (timeFrame === 'daily' && checkInDate && checkOutDate) {
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const roomPrice = selectedRoom?.daily_price || price;
      setTotalAmount(roomPrice * Math.max(diffDays, 1));
    } else {
      const roomPrice = selectedRoom?.monthly_price || price;
      setTotalAmount(roomPrice);
    }
  }, [form.watch('checkInDate'), form.watch('checkOutDate'), form.watch('roomId'), selectedRoom]);

  const handleRoomChange = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    setSelectedRoom(room || null);
    
    if (room) {
      if (timeFrame === 'monthly') {
        setTotalAmount(room.monthly_price);
      } else if (timeFrame === 'daily' && room.daily_price) {
        const checkInDate = form.getValues('checkInDate');
        const checkOutDate = form.getValues('checkOutDate');
        
        if (checkInDate && checkOutDate) {
          const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setTotalAmount(room.daily_price * Math.max(diffDays, 1));
        } else {
          setTotalAmount(room.daily_price);
        }
      }
    }
  };

  const handleBookingSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book this property.",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }

    setIsLoading(true);

    try {
      const checkInDate = values.checkInDate;
      const checkOutDate = values.checkOutDate || (timeFrame === 'daily' ? new Date(checkInDate.getTime() + 24*60*60*1000) : null);
      
      let units = 1;
      if (timeFrame === 'daily' && checkOutDate) {
        const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        units = Math.max(diffDays, 1);
      }

      const bookingData = {
        property_id: propertyId,
        room_id: values.roomId || null,
        user_id: user.id,
        check_in_date: checkInDate.toISOString().split('T')[0],
        check_out_date: checkOutDate ? checkOutDate.toISOString().split('T')[0] : null,
        check_in_time: values.checkInTime || '12:00',
        check_out_time: values.checkOutTime || '10:00',
        time_frame: timeFrame,
        price_per_unit: selectedRoom ? 
          (timeFrame === 'monthly' ? selectedRoom.monthly_price : selectedRoom.daily_price || 0) : 
          price,
        total_amount: totalAmount,
        status: 'pending' as BookingStatus,
        number_of_guests: values.numberOfGuests,
        special_requests: values.specialRequests || '',
        payment_status: 'pending',
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
        navigate(`/bookings/${data.id}/confirmation`);
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
        <CardTitle>Book Your Stay</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleBookingSubmit)} className="space-y-4">
            {rooms.length > 0 && (
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Room</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleRoomChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.room_number} - {room.capacity} {room.capacity > 1 ? 'beds' : 'bed'} - 
                            ₹{timeFrame === 'monthly' ? room.monthly_price : room.daily_price}/
                            {timeFrame === 'monthly' ? 'month' : 'day'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="checkInTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Time</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                          <SelectItem value="14:00">2:00 PM</SelectItem>
                          <SelectItem value="16:00">4:00 PM</SelectItem>
                          <SelectItem value="18:00">6:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {timeFrame === 'daily' && (
                <FormField
                  control={form.control}
                  name="checkOutTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-out Time</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

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
                      max={selectedRoom?.capacity || 4}
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

            <div className="py-2 space-y-2">
              <div className="flex justify-between items-center">
                <span>Price ({timeFrame === 'daily' ? 'per day' : 'per month'})</span>
                <span>₹{selectedRoom ? 
                  (timeFrame === 'monthly' ? selectedRoom.monthly_price : selectedRoom.daily_price)?.toLocaleString() : 
                  price.toLocaleString()}</span>
              </div>
              
              {timeFrame === 'daily' && form.watch('checkInDate') && form.watch('checkOutDate') && (
                <div className="flex justify-between items-center">
                  <span>Duration</span>
                  <span>
                    {(() => {
                      const checkInDate = form.getValues('checkInDate');
                      const checkOutDate = form.getValues('checkOutDate');
                      if (!checkOutDate) return '1 day';
                      
                      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                    })()}
                  </span>
                </div>
              )}
              
              {selectedRoom?.security_deposit && (
                <div className="flex justify-between items-center text-amber-600">
                  <span>Security Deposit (refundable)</span>
                  <span>₹{selectedRoom.security_deposit.toLocaleString()}</span>
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center font-bold">
                <span>Total amount</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              
              {selectedRoom?.security_deposit && (
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Total payable (incl. security deposit)</span>
                  <span>₹{(totalAmount + selectedRoom.security_deposit).toLocaleString()}</span>
                </div>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={form.handleSubmit(handleBookingSubmit)} 
          disabled={isLoading || (rooms.length > 0 && !form.getValues('roomId'))} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : "Book Now"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingForm;
