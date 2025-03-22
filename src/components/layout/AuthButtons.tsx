
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, Building, Settings, LayoutDashboard, BookMarked, Star } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const AuthButtons = () => {
  const { user, profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="hidden md:inline-flex" 
          onClick={() => navigate('/auth/login')}
        >
          Log in
        </Button>
        <Button onClick={() => navigate('/auth/register')}>
          Register
        </Button>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      // Navigation will be handled in the signOut function
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggingOut(false);
      toast({
        title: 'Logout failed',
        description: 'There was a problem signing you out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const navigateToDashboard = () => {
    if (userRole === 'student') {
      navigate('/student/dashboard');
    } else if (userRole === 'merchant') {
      navigate('/merchant/dashboard');
    } else if (userRole === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  // Get first letters of name for avatar fallback
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
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
        
        <DropdownMenuItem onClick={navigateToDashboard}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        
        {userRole === 'student' && (
          <>
            <DropdownMenuItem onClick={() => navigate('/student/bookings')}>
              <BookMarked className="mr-2 h-4 w-4" />
              My Bookings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/student/favorites')}>
              <Star className="mr-2 h-4 w-4" />
              Favorites
            </DropdownMenuItem>
          </>
        )}
        
        {userRole === 'merchant' && (
          <DropdownMenuItem onClick={() => navigate('/merchant/properties')}>
            <Building className="mr-2 h-4 w-4" />
            My Properties
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className={isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButtons;
