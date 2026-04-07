import React from 'react';
import { Outlet } from 'react-router-dom';
import DonorNavbar from '../components/DonorNavbar';

const DonorDashboard = () => {
    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Horizontal Service Bar */}
            <DonorNavbar />
            
            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DonorDashboard;