import React from 'react';
import { Outlet } from 'react-router-dom';
import NgoSidebar from './NgoSidebar';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Fixed Sidebar */}
      <NgoSidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;