import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Award, Clock, Hash, AlertCircle,ExternalLink } from 'lucide-react';
import api from '../../../services/api';

const ReputationModule = () => {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const response = await api.get('/profile/ngo/reputation/summary');
        setReviews(response.data.reviews || []);
        setSummary(response.data.summary || { avgRating: 0, totalReviews: 0 });
      } catch (err) {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReputation();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ⭐ Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-300 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Platform average</p>
          <h2 className="text-6xl font-black text-slate-950">{summary.avgRating.toFixed(1)}</h2>
          <div className="flex gap-1 my-3 text-yellow-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} fill={s <= Math.round(summary.avgRating) ? "currentColor" : "none"} />
            ))}
          </div>
          <p className="text-xs font-bold text-slate-600">Verified donor satisfaction</p>
        </div>

        <div className="md:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="text-4xl font-bold tracking-tight">Community trust</h3>
             <p className="text-slate-400 mt-2 max-w-sm">This rating is calculated from on-chain feedback submitted by donors after milestone verification.</p>
             <div className="mt-6 flex gap-8">
                <div>
                   <p className="text-2xl font-bold">{summary.totalReviews}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total reviews</p>
                </div>
                <div>
                   <p className="text-2xl font-bold text-blue-400">100%</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">On-chain verified</p>
                </div>
             </div>
           </div>
           <Award className="absolute right-[-20px] bottom-[-20px] text-white/5 w-64 h-64" />
        </div>
      </div>

      {/* 💬 Review List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 px-2">Recent donor reviews</h3>
        
        {reviews.length > 0 ? reviews.map((rev, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border-2 border-slate-300 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-bold">
                  {rev.donorName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{rev.donorName}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Campaign: {rev.campaignTitle}</span>
                  </div>
                </div>
              </div>
              <div className="flex text-yellow-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} fill={s <= rev.rating ? "currentColor" : "none"} />
                ))}
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed italic mb-6">"{rev.comment}"</p>

            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
                <span className="flex items-center gap-1"><Clock size={12} /> {rev.date}</span>
                <span className="flex items-center gap-1 text-slate-400 underline font-mono tracking-tighter">
                   <Hash size={12} /> {rev.txHash.slice(0, 20)}...
                </span>
              </div>
              <a 
                 href={`https://sepolia.etherscan.io/tx/${rev.txHash}`}
                 target="_blank"
                 className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
              >
                Verify on blockchain <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-300">
            <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 font-medium">No reviews found for this NGO yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReputationModule;