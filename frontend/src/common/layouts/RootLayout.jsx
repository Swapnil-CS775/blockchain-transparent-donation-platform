import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RootLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-grow pt-16"> {/* Space for sticky navbar */}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;