
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showNavbar = true,
  showFooter = true
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {showNavbar && <Navbar />}
      <main className="flex-grow">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
