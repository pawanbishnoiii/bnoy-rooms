
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, Building, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
          <span className="font-bold text-xl text-bnoy-600">Bnoy</span>
          <span className="font-light text-xl">Rooms</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-1">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className={`nav-link ${isActive('/properties') ? 'active' : ''}`}
            >
              Properties
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/dashboard/user" className="flex items-center space-x-1 p-2 rounded-full hover:bg-bnoy-50 transition-colors">
              <User size={18} className="text-bnoy-600" />
            </Link>
            <Link to="/dashboard/merchant" className="flex items-center space-x-1 p-2 rounded-full hover:bg-bnoy-50 transition-colors">
              <Building size={18} className="text-bnoy-600" />
            </Link>
            <Link to="/dashboard/admin" className="flex items-center space-x-1 p-2 rounded-full hover:bg-bnoy-50 transition-colors">
              <ShieldCheck size={18} className="text-bnoy-600" />
            </Link>
            <Link 
              to="/login" 
              className="btn-outline"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn-primary"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md text-bnoy-600"
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
              className={`px-4 py-2 rounded-md ${isActive('/') ? 'bg-bnoy-50 text-bnoy-600' : 'text-foreground'}`}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className={`px-4 py-2 rounded-md ${isActive('/properties') ? 'bg-bnoy-50 text-bnoy-600' : 'text-foreground'}`}
            >
              Properties
            </Link>
            <Link 
              to="/about" 
              className={`px-4 py-2 rounded-md ${isActive('/about') ? 'bg-bnoy-50 text-bnoy-600' : 'text-foreground'}`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`px-4 py-2 rounded-md ${isActive('/contact') ? 'bg-bnoy-50 text-bnoy-600' : 'text-foreground'}`}
            >
              Contact
            </Link>
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Dashboards</p>
              <div className="grid grid-cols-3 gap-2">
                <Link 
                  to="/dashboard/user" 
                  className="flex flex-col items-center p-3 rounded-lg bg-bnoy-50/50 hover:bg-bnoy-50 transition-colors"
                >
                  <User size={18} className="text-bnoy-600 mb-1" />
                  <span className="text-xs">User</span>
                </Link>
                <Link 
                  to="/dashboard/merchant" 
                  className="flex flex-col items-center p-3 rounded-lg bg-bnoy-50/50 hover:bg-bnoy-50 transition-colors"
                >
                  <Building size={18} className="text-bnoy-600 mb-1" />
                  <span className="text-xs">Merchant</span>
                </Link>
                <Link 
                  to="/dashboard/admin" 
                  className="flex flex-col items-center p-3 rounded-lg bg-bnoy-50/50 hover:bg-bnoy-50 transition-colors"
                >
                  <ShieldCheck size={18} className="text-bnoy-600 mb-1" />
                  <span className="text-xs">Admin</span>
                </Link>
              </div>
            </div>
            <div className="flex space-x-2 pt-2">
              <Link 
                to="/login" 
                className="btn-outline flex-1"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-primary flex-1"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
