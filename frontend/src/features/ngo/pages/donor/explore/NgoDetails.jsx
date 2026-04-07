import React, { useState, useEffect } from "react";
import { useParams,useLocation } from "react-router-dom";
import {
  ShieldCheck,
  MapPin,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Award,
  Info,
  ArrowUpRight,
} from "lucide-react";
import api from "../../../../../services/api";
import toast from "react-hot-toast";
import DonationModal from "../components/DonationModal";

const NgoDetails = () => {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const location = useLocation()
  const passedWallet = location.state?.passedScore;

  useEffect(() => {
    const fetchNgoDetails = async () => {
      try {
        const res = await api.get(`/profile/donor/ngo/${id}`);
        setNgo(res.data);
      } catch (err) {
        toast.error("COULD NOT LOAD PROFILE");
      } finally {
        setLoading(false);
      }
    };
    fetchNgoDetails();
  }, [id]);

  const fetchNgoDetails = async () => {
    try {
      const res = await api.get(`/profile/donor/ngo/${id}`);
      setNgo(res.data);
    } catch (err) {
      toast.error("COULD NOT LOAD PROFILE");
    }
  };

  useEffect(() => {
    fetchNgoDetails();
  }, [id]);

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-slate-500 uppercase tracking-widest animate-pulse">
        Loading Identity...
      </div>
    );
  if (!ngo)
    return (
      <div className="p-20 text-center font-bold text-red-500 uppercase tracking-widest">
        NGO Not Found
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: IDENTITY & TRUST (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-400 rounded-[2.5rem] p-8 space-y-6 sticky top-10">
            <div className="w-24 h-24 bg-slate-950 text-white rounded-3xl flex items-center justify-center text-4xl font-black">
              {ngo.ngoName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                  {ngo.ngoName}
                </h1>
                <ShieldCheck size={24} className="text-blue-600" />
              </div>
              <p className="text-sm font-bold text-emerald-600 uppercase italic">
                On-Chain Verified NGO
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-300">
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin size={18} className="text-slate-400" />
                <span className="text-sm font-medium">
                  {ngo.registeredAddress}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Info size={18} className="text-slate-400" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  {ngo.registrationType}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-300">
              <p className="text-[10px] font-normal text-slate-600 uppercase tracking-widest mb-4">
                Reputation Score
              </p>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-slate-950">
                  {passedWallet || "0.0"}
                </span>
                <div className="flex flex-col">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Award
                        key={i}
                        size={16}
                        fill={i < 4 ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    Community Rating
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BIO & CAMPAIGNS (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* About Section */}
          <div className="bg-white border border-slate-400 rounded-[2.5rem] p-10">
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>{" "}
              Organization Mission
            </h2>
            <p className="text-slate-700 leading-relaxed text-lg">
              {ngo.description ||
                "This organization has been verified on the blockchain registry. They are committed to transparency and direct impact through community-vetted milestones."}
            </p>
          </div>

          {/* Campaigns Placeholder */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-tighter">
                Active Campaigns
              </h2>
              <span className="bg-slate-950 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {ngo.activeCampaignsCount || 0} Open
              </span>
            </div>

            {/* 4. CAMPAIGN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ngo.campaigns &&
                ngo.campaigns.map((campaign) => {
                  // Calculate progress percentage
                  const progress = Math.min(
                    100,
                    (campaign.raisedAmount / campaign.targetAmount) * 100,
                  );

                  return (
                    <div
                      key={campaign.id}
                      className="bg-white border border-slate-400 rounded-[2rem] overflow-hidden flex flex-col group hover:border-blue-600 transition-all"
                    >
                      {/* Campaign Image */}
                      <div className="h-48 bg-slate-200 relative overflow-hidden">
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${campaign.coverImageCid}`}
                          alt={campaign.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop";
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-200">
                            {campaign.category}
                          </span>
                        </div>
                      </div>

                      {/* Campaign Info */}
                      <div className="p-6 flex-1 flex flex-col space-y-4">
                        <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1   tracking-tighter">
                          {campaign.title}
                        </h3>

                        {/* Progress Section */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <p className="text-[10px] font-normal text-slate-600 uppercase">
                              Funding Progress
                            </p>
                            <p className="text-xs font-black text-slate-900">
                              {progress.toFixed(0)}%
                            </p>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-blue-600 transition-all duration-1000"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <p className="text-sm font-black text-slate-950">
                              ${campaign.raisedAmount.toLocaleString()}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                              Goal: ${campaign.targetAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <button 
                        onClick={() => { setSelectedCampaign(campaign);
                            setIsModalOpen(true);
                            }}
                        className="w-full py-4 bg-slate-950 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                          Support Campaign <ArrowUpRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      <DonationModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          campaign={selectedCampaign}
          onSuccess={fetchNgoDetails}
          contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS_DONATION}
          usdtAddress={import.meta.env.VITE_USDT_TOKEN_ADDRESS}
      />
    </div>
  );
};

export default NgoDetails;
