
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Building,
  Users,
  Settings,
  Map,
  Home,
  LogOut,
  Menu,
  X,
  ChevronDown,
  PlusSquare,
  ClipboardList,
  BookMarked,
  Star,
  Bell,
  MessageSquare,
  HelpCircle,
  Library
} from 'lucide-react';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, profile, userRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Loading your dashboard</h2>
          <p className="text-muted-foreground">Please wait while we load your information...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Determine navigation based on user role
  const getNavigationItems = () => {
    const commonItems = [
      {
        name: 'Dashboard',
        href: `/${userRole === 'admin' ? 'admin' : userRole === 'merchant' ? 'merchant' : 'student'}/dashboard`,
        icon: LayoutDashboard,
        current: location.pathname.endsWith('/dashboard')
      },
      {
        name: 'Settings',
        href: `/${userRole === 'admin' ? 'admin' : userRole === 'merchant' ? 'merchant' : 'student'}/settings`,
        icon: Settings,
        current: location.pathname.endsWith('/settings')
      }
    ];

    if (userRole === 'admin') {
      return [
        ...commonItems,
        {
          name: 'Users',
          href: '/admin/users',
          icon: Users,
          current: location.pathname.includes('/admin/users')
        },
        {
          name: 'Properties',
          href: '/admin/properties',
          icon: Building,
          current: location.pathname.includes('/admin/properties')
        },
        {
          name: 'Merchants',
          href: '/admin/merchants',
          icon: Library,
          current: location.pathname.includes('/admin/merchants')
        },
        {
          name: 'Locations',
          href: '/admin/locations',
          icon: Map,
          current: location.pathname.includes('/admin/locations')
        },
        {
          name: 'Bookings',
          href: '/admin/bookings',
          icon: BookMarked,
          current: location.pathname.includes('/admin/bookings')
        },
        {
          name: 'Reviews',
          href: '/admin/reviews',
          icon: Star,
          current: location.pathname.includes('/admin/reviews')
        }
      ];
    } else if (userRole === 'merchant') {
      return [
        ...commonItems,
        {
          name: 'My Properties',
          href: '/merchant/properties',
          icon: Building,
          current: location.pathname.includes('/merchant/properties')
        },
        {
          name: 'Add Property',
          href: '/merchant/properties/new',
          icon: PlusSquare,
          current: location.pathname.includes('/merchant/properties/new')
        },
        {
          name: 'Bookings',
          href: '/merchant/bookings',
          icon: BookMarked,
          current: location.pathname.includes('/merchant/bookings')
        },
        {
          name: 'Reviews',
          href: '/merchant/reviews',
          icon: Star,
          current: location.pathname.includes('/merchant/reviews')
        }
      ];
    } else {
      // Student
      return [
        ...commonItems,
        {
          name: 'My Bookings',
          href: '/student/bookings',
          icon: BookMarked,
          current: location.pathname.includes('/student/bookings')
        },
        {
          name: 'Favorites',
          href: '/student/favorites',
          icon: Star,
          current: location.pathname.includes('/student/favorites')
        },
        {
          name: 'My Reviews',
          href: '/student/reviews',
          icon: ClipboardList,
          current: location.pathname.includes('/student/reviews')
        }
      ];
    }
  };

  const navigation = getNavigationItems();

  // Get initials for avatar
  const getInitials = () => {
    if (!profile?.full_name) return 'U';
    return profile.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for larger screens */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl text-primary">Bnoy</span>
              <span className="font-light text-lg">Rooms</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={20} />
            </Button>
          </div>

          {/* User profile section */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {userRole === 'student' ? 'Student' : userRole === 'merchant' ? 'Merchant' : 'Administrator'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                      item.current 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t">
            <div className="space-y-3">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground"
                onClick={() => navigate('/')}
              >
                <Home className="mr-3 h-5 w-5" />
                Back to Home
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 h-16">
            {/* Mobile menu button and breadcrumb */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={20} />
              </Button>
              {/* Toggle sidebar button for desktop */}
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 hidden lg:inline-flex"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={20} />
              </Button>
              
              {/* Breadcrumb - can be made dynamic later */}
              <div className="hidden sm:flex items-center text-sm">
                <span className="text-muted-foreground">Dashboard</span>
                <ChevronDown size={14} className="mx-1 text-muted-foreground" />
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <HelpCircle size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MessageSquare size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell size={20} />
              </Button>
              {/* User menu dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(`/${userRole}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Account settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/')}>
                    <Home className="mr-2 h-4 w-4" />
                    Back to home
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
        
        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default DashboardLayout;
