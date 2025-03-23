import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Property, Room, TimeFrame } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Steps } from "@/components/ui/steps";

interface BookingData {
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  checkInTime: string;
  checkOutTime: string;
  timeFrame: TimeFrame;
  guests: number;
  specialRequests: string;
}

const BookingForm: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    checkInDate: undefined,
    checkOutDate: undefined,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    timeFrame: 'monthly',
    guests: 1,
    specialRequests: '',
  });
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [numberOfDays, setNumberOfDays] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (!propertyId) {
      toast({
        title: 'Error',
        description: 'Property ID is missing.',
        variant: 'destructive',
      });
      return;
    }

    const fetchProperty = async () => {
      try {
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single();

        if (propertyError) {
          throw propertyError;
        }

        if (propertyData) {
          setProperty(propertyData as Property);
        } else {
          toast({
            title: 'Error',
            description: 'Property not found.',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        console.error('Error fetching property:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load property details.',
          variant: 'destructive',
        });
      }
    };

    const fetchRooms = async () => {
      try {
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .eq('property_id', propertyId);

        if (roomsError) {
          throw roomsError;
        }

        setRooms(roomsData as Room[]);
      } catch (error: any) {
        console.error('Error fetching rooms:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load room details.',
          variant: 'destructive',
        });
      }
    };

    fetchProperty();
    fetchRooms();
  }, [propertyId, toast]);

  useEffect(() => {
    if (date?.from && date?.to && selectedRoom) {
      const timeDiff = date.to.getTime() - date.from.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setNumberOfDays(days);
      setBookingData({
        ...bookingData,
        checkInDate: date.from,
        checkOutDate: date.to,
      });
      const calculatedPrice = days * selectedRoom.monthly_price;
      setTotalPrice(calculatedPrice);
    }
  }, [date, selectedRoom, bookingData]);

  const handleRoomChange = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    setSelectedRoom(room || null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    setBookingData({
      ...bookingData,
      timeFrame: timeFrame,
    });
  };

  const steps = [
    {
      title: "Select Room",
      description: "Choose the room you'd like to book",
    },
    {
      title: "Choose Dates",
      description: "Pick your desired check-in and check-out dates",
    },
    {
      title: "Booking Details",
      description: "Provide additional information for your booking",
    },
    {
      title: "Confirm Booking",
      description: "Review and confirm your booking details",
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const createBooking = async () => {
    // Casting to any to avoid type issues with the database schema
    // that doesn't match our TypeScript definitions yet
    const bookingData: any = {
      property_id: property.id,
      room_id: selectedRoom?.id,
      user_id: user.id,
      check_in_date: bookingData.checkInDate,
      check_out_date: bookingData.checkOutDate,
      check_in_time: bookingData.checkInTime || '14:00',
      check_out_time: bookingData.checkOutTime || '12:00',
      time_frame: bookingData.timeFrame,
      price_per_unit: totalPrice / numberOfDays,
      total_amount: totalPrice,
      status: 'pending', // Use a string literal instead of BookingStatus enum
      number_of_guests: bookingData.guests,
      special_requests: bookingData.specialRequests,
      payment_status: 'pending'
    };

    try {
      const { data, error } = await supabase.from('bookings').insert(bookingData);

      if (error) {
        throw error;
      }

      toast({
        title: 'Booking Request Sent',
        description: 'Your booking request has been submitted and is awaiting confirmation.',
      });
      navigate('/student/bookings');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      <h1 className="text-2xl font-semibold mb-4">Book Your Stay at {property.name}</h1>

      <Steps steps={steps} currentStep={currentStep} className="mb-6" />
      <Separator className="mb-4" />

      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select a Room</h2>
          {rooms.map((room) => (
            <div key={room.id} className="border rounded p-4">
              <label className="flex items-center space-x-4">
                <Input
                  type="radio"
                  name="room"
                  value={room.id}
                  checked={selectedRoom?.id === room.id}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  className="h-5 w-5"
                />
                <span>
                  Room {room.room_number} - {room.capacity} beds - ${room.monthly_price} / month
                </span>
              </label>
            </div>
          ))}
          <Button onClick={nextStep} disabled={!selectedRoom}>
            Next: Choose Dates
          </Button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Choose Your Dates</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <CalendarUI
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                disabled={{ before: new Date() }}
                pagedNavigation
              />
            </PopoverContent>
          </Popover>
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Previous: Select Room
            </Button>
            <Button onClick={nextStep} disabled={!date?.from || !date?.to}>
              Next: Booking Details
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Booking Details</h2>
          <div>
            <Label htmlFor="guests">Number of Guests</Label>
            <Input
              type="number"
              id="guests"
              name="guests"
              value={bookingData.guests}
              onChange={handleInputChange}
              min="1"
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="specialRequests">Special Requests</Label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={bookingData.specialRequests}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <Label htmlFor="checkInTime">Check-In Time</Label>
            <Input
              type="time"
              id="checkInTime"
              name="checkInTime"
              value={bookingData.checkInTime}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="checkOutTime">Check-Out Time</Label>
            <Input
              type="time"
              id="checkOutTime"
              name="checkOutTime"
              value={bookingData.checkOutTime}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          <div>
            <Label>Time Frame</Label>
            <Select onValueChange={(value) => handleTimeFrameChange(value as TimeFrame)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time frame" defaultValue="monthly" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Previous: Choose Dates
            </Button>
            <Button onClick={nextStep}>Next: Confirm Booking</Button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Confirm Booking</h2>
          <p>Property: {property.name}</p>
          <p>Room: {selectedRoom?.room_number}</p>
          <p>Check-in Date: {bookingData.checkInDate?.toLocaleDateString()}</p>
          <p>Check-out Date: {bookingData.checkOutDate?.toLocaleDateString()}</p>
          <p>Number of Days: {numberOfDays}</p>
          <p>Total Price: ${totalPrice}</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              Previous: Booking Details
            </Button>
            <Button onClick={createBooking}>Confirm and Book</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
