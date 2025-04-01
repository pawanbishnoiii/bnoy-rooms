
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Home, CreditCard, Star, User, UserPlus, UserCheck, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { StatsCard, OverviewChart, RevenueChart } from '../charts';
import { mapDbPropertyToProperty } from '@/utils/typeUtils';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProperties: 0,
    verifiedProperties: 0,
    pendingProperties: 0,
    totalUsers: 0,
    totalMerchants: 0,
    totalBookings: 0,
    totalRevenue: 0,
    bookingsTrend: 0,
    revenueTrend: 0,
    usersTrend: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  
  useEffect(() => {
    fetchStatistics();
  }, []);
  
  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      // Fetch Properties Stats
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*');
        
      if (propertiesError) throw propertiesError;
      
      const verifiedProperties = properties ? properties.filter(p => p.is_verified).length : 0;
      const pendingProperties = properties ? properties.length - verifiedProperties : 0;
      
      // Fetch Users Stats
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (usersError) throw usersError;
      
      // Count merchants separately
      const merchants = users ? users.filter(u => u.role === 'merchant').length : 0;
      
      // Fetch Bookings Stats
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');
        
      if (bookingsError) throw bookingsError;
      
      // Calculate total revenue
      const totalRevenue = bookings 
        ? bookings.reduce((sum, booking) => {
            if (booking.status === 'confirmed' || booking.status === 'completed') {
              return sum + booking.total_amount;
            }
            return sum;
          }, 0)
        : 0;
      
      // Set mock trend data (would be calculated from historical data)
      const bookingsTrend = 12; // 12% up from last period
      const revenueTrend = 8; // 8% up from last period
      const usersTrend = 5; // 5% up from last period
      
      setStats({
        totalProperties: properties?.length || 0,
        verifiedProperties,
        pendingProperties,
        totalUsers: users?.length || 0,
        totalMerchants: merchants,
        totalBookings: bookings?.length || 0,
        totalRevenue,
        bookingsTrend,
        revenueTrend,
        usersTrend
      });
      
      // Set recent users for display
      setRecentUsers(users?.slice(0, 5) || []);
      
      // Prepare chart data (mocked - would come from actual data)
      const mockChartData = [
        { name: "Jan", total: 12 },
        { name: "Feb", total: 18 },
        { name: "Mar", total: 24 },
        { name: "Apr", total: 32 },
        { name: "May", total: 28 },
        { name: "Jun", total: 36 },
        { name: "Jul", total: 42 },
      ];
      setChartData(mockChartData);
      
      const mockRevenueData = [
        { name: "Jan", revenue: 8000 },
        { name: "Feb", revenue: 12000 },
        { name: "Mar", revenue: 10500 },
        { name: "Apr", revenue: 18000 },
        { name: "May", revenue: 15000 },
        { name: "Jun", revenue: 22000 },
        { name: "Jul", revenue: 28000 },
      ];
      setRevenueData(mockRevenueData);
      
    } catch (error) {
      console.error('Error fetching admin statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your platform statistics and performance.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Properties"
          value={stats.totalProperties}
          icon={<Building />}
          description="Listed properties on platform"
          trend={{ value: 12, label: "from last month", positive: true }}
        />
        
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<User />}
          description="Registered platform users"
          trend={{ value: stats.usersTrend, label: "from last month", positive: true }}
        />
        
        <StatsCard
          title="Bookings"
          value={stats.totalBookings}
          icon={<CalendarCheck />}
          description="Total bookings made"
          trend={{ value: stats.bookingsTrend, label: "from last period", positive: true }}
        />
        
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={<CreditCard />}
          description="Platform revenue"
          trend={{ value: stats.revenueTrend, label: "from last period", positive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverviewChart 
          title="New Users Overview" 
          data={chartData} 
        />
        
        <RevenueChart 
          data={revenueData} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>New users that have joined recently</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            ) : recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {user.role === 'admin' ? <UserCheck size={18} /> : 
                       user.role === 'merchant' ? <Building size={18} /> : <User size={18} />}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{user.full_name || 'Unnamed User'}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{user.role}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium mb-1">No recent users</h3>
                <p className="text-sm text-muted-foreground">
                  New users will appear here when they register
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
            <CardDescription>Property verification statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
                  <UserCheck size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Verified Properties</div>
                  <div className="text-2xl font-bold">{stats.verifiedProperties}</div>
                </div>
                <div className="text-green-600 text-sm">
                  {stats.totalProperties > 0 ? 
                    `${Math.round((stats.verifiedProperties / stats.totalProperties) * 100)}%` : 
                    '0%'}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Home size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Pending Verification</div>
                  <div className="text-2xl font-bold">{stats.pendingProperties}</div>
                </div>
                <div className="text-amber-600 text-sm">
                  {stats.totalProperties > 0 ? 
                    `${Math.round((stats.pendingProperties / stats.totalProperties) * 100)}%` : 
                    '0%'}
                </div>
              </div>
              
              <div className="mt-6">
                <div className="bg-secondary w-full h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ 
                      width: `${stats.totalProperties > 0 ? 
                        (stats.verifiedProperties / stats.totalProperties) * 100 : 0}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <div>0%</div>
                  <div>50%</div>
                  <div>100%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
