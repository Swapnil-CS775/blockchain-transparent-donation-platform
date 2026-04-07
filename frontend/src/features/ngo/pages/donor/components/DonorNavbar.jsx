import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Landmark, Megaphone, History, LayoutGrid } from 'lucide-react';

const DonorNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'NGO Registry', path: '/donor/explore', icon: <Landmark size={18} /> },
        { label: 'Active Campaigns', path: '/donor/campaigns', icon: <Megaphone size={18} /> },
        { label: 'My Donations', path: '/donor/history', icon: <History size={18} /> },
        { label: 'Stats', path: '/donor/stats', icon: <LayoutGrid size={18} /> },
        { 
        label: (
            <div className="flex items-center gap-2">
                <span>Ledger</span>
                <span className="relative flex h-2 w-2">
                    {/* The breathing/blinking outer ring */}
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-800 opacity-100"></span>
                    {/* The solid center dot */}
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            </div>
        ), 
        path: '/donor/ledger', 
        icon: <LayoutGrid size={18} /> 
    },
    ];

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-[100]">
            <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
                {menuItems.map((item) => {
                    // Logic to keep Registry active when viewing a specific NGO profile
                    const isActive = location.pathname === item.path || 
                                   (item.path === '/donor/explore' && location.pathname.startsWith('/donor/ngo'));
                    
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                isActive 
                                ? "bg-slate-900 text-white" 
                                : "text-slate-900 hover:bg-slate-50 hover:bg-slate-100"
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default DonorNavbar;