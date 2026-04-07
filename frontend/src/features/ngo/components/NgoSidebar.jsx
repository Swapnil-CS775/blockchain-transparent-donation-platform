import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  Milestone, 
  IndianRupee, 
  Star, 
  Building2, 
  Bell 
} from 'lucide-react';

const NgoSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/ngo-dashboard', end: true },
    { name: 'Campaigns', icon: <Megaphone size={20} />, path: 'campaigns' },
    { name: 'Milestones', icon: <Milestone size={20} />, path: 'milestones' },
    { name: 'Donations', icon: <IndianRupee size={20} />, path: 'donations' },
    { name: 'Reputation', icon: <Star size={20} />, path: 'reputation' },
    { name: 'NGO Profile', icon: <Building2 size={20} />, path: 'profile' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed top-0 left-0 pt-20 flex flex-col">
      <div className="px-6 py-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NGO Management</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}
            `}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-blue-600 transition font-bold text-sm">
          <Bell size={20} />
          Notifications
        </button>
      </div>
    </aside>
  );
};

export default NgoSidebar;