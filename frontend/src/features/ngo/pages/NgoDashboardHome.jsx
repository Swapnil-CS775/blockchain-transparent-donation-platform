import React, { useState, useEffect } from 'react';
import { IndianRupee, TrendingUp, Users, Award, DollarSign } from 'lucide-react';
import api from '../../../services/api';

const NgoDashboardHome = () => {
  const [stats, setStats] = useState({
    totalRaised: 0,
    activeCampaigns: 0,
    reputationScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/profile/ngo/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back!</h1>
        <p className="text-slate-500 font-medium">Here is what's happening with your campaigns today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 💰 Total Donation Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-300 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <DollarSign size={20} />
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total funds raised</p>
            </div>
            
            <div className="flex items-baseline gap-1">
               <span className="text-4xl font-black text-slate-950">
                 ${stats.totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
               </span>
            </div>
            
            <p className="text-[10px] font-bold text-emerald-600 mt-4 flex items-center gap-1 uppercase tracking-tighter">
              <TrendingUp size={12} /> Live blockchain balance
            </p>
          </div>
          
          {/* Subtle Background Pattern */}
          <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <DollarSign size={140} />
          </div>
        </div>

        {/* 📢 Active Campaigns Card */}
        <StatCard 
          title="Active campaigns" 
          value={stats.activeCampaigns} 
          icon={<Users className="text-blue-600" />} 
          color="blue"
        />

        {/* ⭐ Reputation Card */}
        <StatCard 
          title="Trust score" 
          value={`${stats.reputationScore}/10`} 
          icon={<Award className="text-amber-600" />} 
          color="amber"
        />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-300 shadow-sm flex flex-col justify-center">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 bg-${color}-50 rounded-xl`}>{icon}</div>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
    </div>
    <h3 className="text-4xl font-black text-slate-950">{value}</h3>
  </div>
);

export default NgoDashboardHome;