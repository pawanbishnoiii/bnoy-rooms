import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Booking, Property } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { StatsCard } from '@/components/charts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, CreditCard, Activity } from 'lucide-react';

const MerchantPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch merchant's properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*, rooms(*)')
        .eq('merchant_id', user.id);

      if (propertiesError) throw propertiesError;

      // Fetch merchant's bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          user:profiles!bookings_user_id_fkey(*),
          property:properties!bookings_property_id_fkey(name, address)
        `)
        .in('property_id', propertiesData.map(p => p.id));

      if (bookingsError) throw bookingsError;

      // Map data to our frontend types
      const mappedProperties = propertiesData.map(mapDbPropertyToProperty);
      const mappedBookings = bookingsData.map(mapDbBookingToBooking);

      setProperties(mappedProperties);
      setBookings(mappedBookings);

      // Calculate statistics
      const revenue = mappedBookings.reduce((acc, booking) => acc + booking.total_amount, 0);
      setTotalRevenue(revenue);
      setTotalProperties(mappedProperties.length);
      setTotalBookings(mappedBookings.length);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      <h1 className="text-2xl font-semibold mb-4">Merchant Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total Properties"
          value={totalProperties}
          icon={<Building className="h-4 w-4" />}
          description="Number of properties listed"
        />
        <StatsCard
          title="Total Bookings"
          value={totalBookings}
          icon={<CreditCard className="h-4 w-4" />}
          description="Number of bookings made"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${totalRevenue}`}
          icon={<Activity className="h-4 w-4" />}
          description="Total revenue generated"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Your recent booking activities</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.property?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.user?.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{booking.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No bookings found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantPanel;

import { mapDbPropertyToProperty, mapDbBookingToBooking } from '@/utils/typeUtils';
