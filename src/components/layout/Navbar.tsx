
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import AuthButtons from '@/components/layout/AuthButtons';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { userRole } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'student':
        return '/student/dashboard';
      case 'merchant':
        return '/merchant/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container px-4 mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl text-primary">Bnoy</span>
          <span className="font-light text-xl">Rooms</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className={`nav-link ${isActive('/properties') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
            >
              Properties
            </Link>
            {userRole && (
              <Link 
                to={getDashboardLink()} 
                className={`nav-link ${location.pathname.includes('/dashboard') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
              >
                Dashboard
              </Link>
            )}
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
            >
              Contact
            </Link>
          </div>

          <AuthButtons />
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md text-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X size={24} className="animate-fade-in" />
          ) : (
            <Menu size={24} className="animate-fade-in" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg rounded-b-xl animate-slide-down">
          <div className="flex flex-col p-4 space-y-3">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-md ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className={`px-4 py-2 rounded-md ${isActive('/properties') ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
            >
              Properties
            </Link>
            {userRole && (
              <Link 
                to={getDashboardLink()} 
                className={`px-4 py-2 rounded-md ${location.pathname.includes('/dashboard') ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
              >
                Dashboard
              </Link>
            )}
            <Link 
              to="/about" 
              className={`px-4 py-2 rounded-md ${isActive('/about') ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`px-4 py-2 rounded-md ${isActive('/contact') ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
            >
              Contact
            </Link>
            <div className="pt-2 border-t border-border/50">
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
