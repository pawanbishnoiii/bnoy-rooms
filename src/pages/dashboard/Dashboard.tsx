
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminPanel from '@/components/admin/AdminPanel';
import StudentPanel from '@/components/student/StudentPanel';
import MerchantPanel from '@/components/merchant/MerchantPanel';
import BookingsList from '@/components/bookings/BookingsList';
import FavoritesList from '@/components/properties/FavoritesList';
import PropertiesList from '@/components/properties/PropertiesList';
import PropertyForm from '@/components/merchant/PropertyForm';
import MerchantPropertiesList from '@/components/merchant/MerchantPropertiesList';
import RoomManagement from '@/components/merchant/RoomManagement';
import ReviewsList from '@/components/reviews/ReviewsList';
import UsersList from '@/components/admin/UsersList';
import MerchantsList from '@/components/admin/MerchantsList';
import LocationsList from '@/components/admin/LocationsList';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Determine user role
  const userRole = profile?.role || 'student';

  // Handle property selection for room management
  const handlePropertySelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    navigate(`/dashboard/properties/${propertyId}/rooms`);
  };

  // Debug logging
  console.log('Dashboard rendering - Current path:', location.pathname);
  console.log('Dashboard rendering - User role:', userRole);
  console.log('Dashboard rendering - Profile:', profile);

  // Redirect to the appropriate dashboard section based on user role
  useEffect(() => {
    if (user && profile) {
      console.log('Dashboard effect - User role:', userRole);
      console.log('Dashboard effect - Current path:', location.pathname);
      
      // If user is at /dashboard with no further path
      if (location.pathname === '/dashboard') {
        console.log('Redirecting to appropriate dashboard for role:', userRole);
        
        switch (userRole) {
          case 'admin':
            navigate('/dashboard/overview', { replace: true });
            break;
          case 'merchant':
            console.log('Merchant user - redirecting to /dashboard/properties');
            navigate('/dashboard/properties', { replace: true });
            break;
          case 'student':
            navigate('/dashboard/bookings', { replace: true });
            break;
          default:
            navigate('/dashboard/bookings', { replace: true });
        }
      }
    }
  }, [user, profile, location.pathname, navigate, userRole]);

  return (
    <DashboardLayout>
      <Routes>
        {/* Admin Routes */}
        {userRole === 'admin' && (
          <>
            <Route path="overview" element={<AdminPanel />} />
            <Route path="users" element={<UsersList />} />
            <Route path="properties" element={<PropertiesList />} />
            <Route path="merchants" element={<MerchantsList />} />
            <Route path="locations" element={<LocationsList />} />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="reviews" element={<ReviewsList />} />
          </>
        )}
        
        {/* Merchant Routes */}
        {userRole === 'merchant' && (
          <>
            <Route path="overview" element={<MerchantPanel />} />
            <Route path="properties" element={<MerchantPropertiesList onSelectProperty={handlePropertySelect} />} />
            <Route path="properties/new" element={<PropertyForm />} />
            <Route path="properties/:propertyId/edit" element={<PropertyForm />} />
            <Route path="properties/:propertyId/rooms" element={
              <RoomManagement propertyId={selectedPropertyId || ''} />
            } />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="reviews" element={<ReviewsList />} />
          </>
        )}
        
        {/* Student Routes */}
        {userRole === 'student' && (
          <>
            <Route path="overview" element={<StudentPanel />} />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="favorites" element={<FavoritesList />} />
            <Route path="reviews" element={<ReviewsList />} />
          </>
        )}
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
