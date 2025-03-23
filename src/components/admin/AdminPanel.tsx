
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Home, FileText, Building, MapPin, 
  TrendingUp, Calendar, ShieldAlert, Server,
  Settings2, Zap, BellRing
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [stats, setStats] = useState([
    { title: "Total Users", value: "...", icon: Users, link: "/admin/users", color: "bg-blue-100 text-blue-700" },
    { title: "Properties", value: "...", icon: Building, link: "/admin/properties", color: "bg-green-100 text-green-700" },
    { title: "Merchants", value: "...", icon: Home, link: "/admin/merchants", color: "bg-amber-100 text-amber-700" },
    { title: "Bookings", value: "...", icon: Calendar, link: "/admin/bookings", color: "bg-purple-100 text-purple-700" },
    { title: "Locations", value: "...", icon: MapPin, link: "/admin/locations", color: "bg-red-100 text-red-700" },
    { title: "Reviews", value: "...", icon: FileText, link: "/admin/reviews", color: "bg-indigo-100 text-indigo-700" },
  ]);
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    database: "loading",
    storage: "loading",
    authentication: "loading",
    api: "loading",
  });
  
  // Fetch dashboard data
  useEffect(() => {
    // Verify user is admin before fetching data
    if (userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view the admin dashboard.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        // Fetch properties count
        const { count: propertiesCount, error: propertiesError } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });
          
        // Fetch merchants count
        const { count: merchantsCount, error: merchantsError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'merchant');
          
        // Fetch bookings count
        const { count: bookingsCount, error: bookingsError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });
          
        // Fetch locations count
        const { count: locationsCount, error: locationsError } = await supabase
          .from('locations')
          .select('*', { count: 'exact', head: true });
          
        // Fetch reviews count
        const { count: reviewsCount, error: reviewsError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });
          
        if (usersError || propertiesError || merchantsError || bookingsError || locationsError || reviewsError) {
          throw new Error("Error fetching dashboard data");
        }
        
        // Update stats with real data
        setStats([
          { title: "Total Users", value: usersCount?.toString() || "0", icon: Users, link: "/admin/users", color: "bg-blue-100 text-blue-700" },
          { title: "Properties", value: propertiesCount?.toString() || "0", icon: Building, link: "/admin/properties", color: "bg-green-100 text-green-700" },
          { title: "Merchants", value: merchantsCount?.toString() || "0", icon: Home, link: "/admin/merchants", color: "bg-amber-100 text-amber-700" },
          { title: "Bookings", value: bookingsCount?.toString() || "0", icon: Calendar, link: "/admin/bookings", color: "bg-purple-100 text-purple-700" },
          { title: "Locations", value: locationsCount?.toString() || "0", icon: MapPin, link: "/admin/locations", color: "bg-red-100 text-red-700" },
          { title: "Reviews", value: reviewsCount?.toString() || "0", icon: FileText, link: "/admin/reviews", color: "bg-indigo-100 text-indigo-700" },
        ]);
        
        // Fetch recent activity
        const { data: recentBookings, error: recentBookingsError } = await supabase
          .from('bookings')
          .select('id, created_at, status, property:properties(name)')
          .order('created_at', { ascending: false })
          .limit(3);
          
        const { data: recentProperties, error: recentPropertiesError } = await supabase
          .from('properties')
          .select('id, name, created_at, is_verified')
          .order('created_at', { ascending: false })
          .limit(3);
          
        const { data: recentUsers, error: recentUsersError } = await supabase
          .from('profiles')
          .select('id, full_name, created_at, role')
          .order('created_at', { ascending: false })
          .limit(3);
          
        // Merge and sort recent activity
        const activity = [
          ...(recentBookings || []).map(booking => ({
            type: 'booking',
            id: booking.id,
            title: `New booking ${booking.status === 'confirmed' ? 'confirmed' : 'received'}`,
            description: `Booking for "${booking.property?.name || 'Unknown property'}"`,
            timestamp: booking.created_at,
            icon: Calendar,
            color: booking.status === 'confirmed' ? 'text-green-500' : 'text-amber-500'
          })),
          ...(recentProperties || []).map(property => ({
            type: 'property',
            id: property.id,
            title: `New property ${property.is_verified ? 'verified' : 'added'}`,
            description: `Property "${property.name}" was ${property.is_verified ? 'verified' : 'added'}`,
            timestamp: property.created_at,
            icon: Building,
            color: property.is_verified ? 'text-green-500' : 'text-blue-500'
          })),
          ...(recentUsers || []).map(user => ({
            type: 'user',
            id: user.id,
            title: `New ${user.role} signup`,
            description: `${user.full_name || 'User'} created an account`,
            timestamp: user.created_at,
            icon: Users,
            color: 'text-blue-500'
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
        
        setRecentActivity(activity);
        
        // Set system status
        setSystemStatus({
          database: "operational",
          storage: "operational",
          authentication: "operational",
          api: "operational",
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Data Loading Error",
          description: "Could not load dashboard data. Please try again later.",
          variant: "destructive"
        });
      }
    };

    fetchDashboardData();
  }, [userRole, navigate, toast]);
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Manage all aspects of the platform.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className="cursor-pointer hover:bg-accent/5 transition-colors" 
            onClick={() => navigate(stat.link)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">
                Click to manage {stat.title.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <activity.icon className={`h-5 w-5 ${activity.color} mt-0.5`} />
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-6">
                  <p className="text-muted-foreground">Loading activity data...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${systemStatus.database === 'operational' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span>Database</span>
                </div>
                <span className={`text-sm ${systemStatus.database === 'operational' ? 'text-green-500' : 'text-amber-500'}`}>
                  {systemStatus.database === 'loading' ? 'Checking...' : 'Operational'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${systemStatus.storage === 'operational' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span>Storage</span>
                </div>
                <span className={`text-sm ${systemStatus.storage === 'operational' ? 'text-green-500' : 'text-amber-500'}`}>
                  {systemStatus.storage === 'loading' ? 'Checking...' : 'Operational'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${systemStatus.authentication === 'operational' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span>Authentication</span>
                </div>
                <span className={`text-sm ${systemStatus.authentication === 'operational' ? 'text-green-500' : 'text-amber-500'}`}>
                  {systemStatus.authentication === 'loading' ? 'Checking...' : 'Operational'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${systemStatus.api === 'operational' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span>API</span>
                </div>
                <span className={`text-sm ${systemStatus.api === 'operational' ? 'text-green-500' : 'text-amber-500'}`}>
                  {systemStatus.api === 'loading' ? 'Checking...' : 'Operational'}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Version</span>
                  <span className="text-sm">v1.2.0</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-accent/5" onClick={() => navigate('/admin/properties/verification')}>
            <CardContent className="p-4 flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-orange-500" />
              <div>
                <h4 className="font-medium">Verify Properties</h4>
                <p className="text-sm text-muted-foreground">Review and approve property listings</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/5" onClick={() => navigate('/admin/system-settings')}>
            <CardContent className="p-4 flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-slate-500" />
              <div>
                <h4 className="font-medium">System Settings</h4>
                <p className="text-sm text-muted-foreground">Configure platform settings</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:bg-accent/5" onClick={() => navigate('/admin/reports')}>
            <CardContent className="p-4 flex items-center gap-3">
              <Server className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Generate Reports</h4>
                <p className="text-sm text-muted-foreground">Create platform analytics reports</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
