import React, { useState, useEffect } from 'react';
import { IndianRupee, Calendar, Hash, User, ExternalLink, Search, Download } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const NgoDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get('/profile/ngo/donations/history');
        setDonations(res.data.history || []);
      } catch (err) {
        toast.error("Failed to load donation records");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b-2 border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Donation ledger</h2>
          <p className="text-slate-600 font-medium mt-1">View all contributions and donor details for your tax records.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition shadow-sm">
          <Download size={16} /> Export 80G list
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center text-slate-400 font-medium italic">Syncing with registry...</div>
        ) : donations.map((d, idx) => (
          <div key={idx} className="bg-white border-2 border-slate-300 rounded-[2rem] p-6 hover:border-blue-500 transition-all group shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Donor Info */}
              <div className="flex items-center gap-4 min-w-[250px]">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-900 border border-slate-200">
                  {d.donorName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{d.donorName}</h4>
                  <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                    PAN: {d.panNumber || 'Not Provided'}
                  </p>
                </div>
              </div>

              {/* Campaign & Amount */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-widest">Campaign</p>
                <h5 className="text-sm font-bold text-slate-800 line-clamp-1">{d.campaignTitle}</h5>
              </div>

              {/* Transaction Details */}
              <div className="flex flex-col lg:items-end gap-1 min-w-[200px]">
                <p className="text-lg font-bold text-emerald-600">${d.amount.toLocaleString()}</p>
                <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                   <span className="flex items-center gap-1"><Calendar size={12}/> {d.donationDate}</span>
                </div>
              </div>

              {/* Blockchain Link */}
              <div className="flex items-center gap-4 lg:pl-6 border-l-0 lg:border-l-2 border-slate-100">
                <div className="text-right hidden sm:block">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Blockchain hash</p>
                   <p className="text-[10px] font-mono text-slate-600 truncate w-24">{d.transactionHash}</p>
                </div>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${d.transactionHash}`} 
                  target="_blank" 
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all shadow-sm"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NgoDonations;