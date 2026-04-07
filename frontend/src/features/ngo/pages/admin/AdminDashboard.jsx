import React, { useState } from 'react';
import { 
  LayoutDashboard, ShieldCheck, CheckSquare, Users, 
  Activity, Bell
} from 'lucide-react';

// Sub-page Imports
import NgoVerification from './NgoVerification';
import MilestoneRequests from './MilestoneRequests';
import ManageVerifiers from './ManageVerifiers';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('ngos');
  const userRole = user?.role || 'SUPER_ADMIN'; 

  const renderContent = () => {
    switch (activeTab) {
      case 'ngos': return <NgoVerification />;
      case 'milestones': return <MilestoneRequests />;
      case 'verifiers': return <ManageVerifiers />;
      default: return <div className="p-10 uppercase text-slate-400">Select a Module</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans pt-20"> {/* pt-20 pulls content down from navbar */}
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 h-screen fixed left-0 top-0 text-white p-8 flex flex-col border-r border-slate-800">
        <div className="flex items-center gap-3 mt-16 mb-12 px-2">
          <div className="p-2 bg-blue-600 rounded-xl"><Activity size={24}/></div>
          <span className="font-bold text-xl tracking-tighter uppercase italic">Admin<span className="text-blue-500 font-medium">Node</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem id="ngos" label="NGO Verification" icon={<ShieldCheck size={18}/>} active={activeTab} onClick={setActiveTab} />
          <NavItem id="milestones" label="Milestone Proofs" icon={<CheckSquare size={18}/>} active={activeTab} onClick={setActiveTab} />
          
          {userRole === 'SUPER_ADMIN' && (
            <NavItem id="verifiers" label="Manage Verifiers" icon={<Users size={18}/>} active={activeTab} onClick={setActiveTab} />
          )}
        </nav>

        {/* Removed Wallet Hashes and Logout Button from here as requested */}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
              {activeTab.replace(/([A-Z])/g, ' $1')}
            </h1>
            <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">
              Governance & Oversight Portal
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
                <Bell size={20} />
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                {userRole[0]}
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ id, label, icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition-all ${
      active === id 
        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon} {label}
  </button>
);

export default AdminDashboard;