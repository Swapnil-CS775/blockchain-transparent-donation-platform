import React, { useState, useEffect } from "react";
import {
  Search,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  Target,
  Users,
  TrendingUp,
} from "lucide-react";
import api from "../../../../../services/api";
import toast from "react-hot-toast";
import DonationModal from "../components/DonationModal";

const ExploreCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: "ACTIVE", label: "Accepting Donations" },
    { id: "FUNDED", label: "In Progress" },
    { id: "COMPLETED", label: "Finished" },
    { id: "HALTED", label: "Paused" },
  ];

  useEffect(() => {
    fetchCampaigns();
  }, [activeTab]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/profile/donor/explore/campaigns`, {
        params: { status: activeTab },
      });
      setCampaigns(res.data);
    } catch (err) {
      toast.error("Could not retrieve campaigns");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-10 space-y-8">
      {/* 1. Header & Service Bar */}
      <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-300 shadow-sm sticky top-4 z-50">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex bg-slate-200 p-1.5 rounded-2xl border border-slate-300 w-full lg:w-auto overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-slate-950 shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search causes or NGOs..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl outline-none focus:border-blue-600 font-medium text-slate-950 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Feed Section */}
      <div className="max-w-4xl mx-auto space-y-12 py-6">
        {loading ? (
          <div className="text-center py-24">
            <Loader2
              className="animate-spin mx-auto text-blue-600 mb-4"
              size={48}
            />
            <p className="text-lg font-bold text-slate-700">
              Fetching on-chain milestones...
            </p>
          </div>
        ) : campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <CampaignSocialCard
              key={campaign.id}
              campaign={campaign}
              onDonate={() => {
                setSelectedCampaign(campaign);
                setIsModalOpen(true);
              }}
            />
          ))
        ) : (
          /* ✨ NEW: Informative Empty State */
          <div className="text-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-slate-300" size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              There are currently no campaigns in the{" "}
              <span className="text-blue-600 font-bold">
                "{tabs.find((t) => t.id === activeTab)?.label}"
              </span>{" "}
              category. Check back later or explore other categories.
            </p>
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className="mt-8 text-sm font-bold text-blue-600 hover:underline underline-offset-4"
            >
              Browse Active Campaigns
            </button>
          </div>
        )}
      </div>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onSuccess={fetchCampaigns}
        contractAddress={import.meta.env.VITE_CONTRACT_ADDRESS_DONATION}
        usdtAddress={import.meta.env.VITE_USDT_TOKEN_ADDRESS}
      />
    </div>
  );
};

const CampaignSocialCard = ({ campaign, onDonate }) => {
  const progress = (campaign.raisedAmount / campaign.targetAmount) * 100;

  const fallbackImages = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1200&auto=format&fit=crop",
  ];

  const handleImageError = (e) => {
    // Pick a random image from the fallback list
    const randomFallback =
      fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    e.target.src = randomFallback;
  };

  const getMilestoneFill = (milestoneNum, targetAmt, raisedAmt) => {
    const segments = [0.3, 0.4, 0.3]; // 30-40-30 split
    const segmentWeight = segments[milestoneNum - 1];

    // Calculate the currency threshold for this milestone
    const previousWeights = segments
      .slice(0, milestoneNum - 1)
      .reduce((a, b) => a + b, 0);
    const startAmount = targetAmt * previousWeights;
    const endAmount = targetAmt * (previousWeights + segmentWeight);

    if (raisedAmt <= startAmount) return 0; // Not reached yet
    if (raisedAmt >= endAmount) return 100; // Fully covered

    // Partial fill calculation
    return ((raisedAmt - startAmount) / (targetAmt * segmentWeight)) * 100;
  };

  const getFundingFill = (num, targetAmt, raisedAmt) => {
    const segments = [0.3, 0.4, 0.3];
    const segmentWeight = segments[num - 1];
    const previousWeight = segments
      .slice(0, num - 1)
      .reduce((a, b) => a + b, 0);

    const start = targetAmt * previousWeight;
    const end = targetAmt * (previousWeight + segmentWeight);

    if (raisedAmt <= start) return 0;
    if (raisedAmt >= end) return 100;
    return ((raisedAmt - start) / (targetAmt * segmentWeight)) * 100;
  };

  // ✅ Helper 2: Calculate if this segment is OFFICIALLY RELEASED
  // If status is RELEASED/APPROVED, the whole segment (100%) is "Dark"
  const isExecutionComplete = (num, milestones) => {
    const m = milestones?.find((ms) => ms.milestoneNumber === num);
    return (
      m?.status === "RELEASED" ||
      m?.status === "APPROVED" ||
      m?.status === "COMPLETED"
    );
  };

  return (
    <div className="bg-white border-2 border-slate-300 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Header: NGO Profile Link */}
      <div className="p-6 flex items-center justify-between border-b-2 border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center font-bold text-xl">
            {campaign.ngoName?.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-950 text-base">
              {campaign.ngoName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Verified Entity
              </span>
            </div>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Launched
          </p>
          <p className="text-sm font-bold text-slate-950">
            {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Visuals */}
      <div className="aspect-video bg-slate-200 relative group">
        <img
          src={`https://gateway.pinata.cloud/ipfs/${campaign.coverImageCid}`}
          className="w-full h-full object-cover"
          alt={campaign.title}
          onError={handleImageError}
        />
        <div className="absolute top-6 left-6 flex gap-3">
          <span className="bg-slate-950 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg">
            {campaign.category}
          </span>
          <span className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg italic">
            {campaign.status}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight mb-3">
            {campaign.title}
          </h2>
          <p className="text-slate-700 font-medium leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Milestone Split Progress */}
        <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border-2 border-slate-100">
          <div className="flex justify-between items-end">
            <p className="text-sm font-bold text-slate-700">
              Milestone Progress (30-40-30 Split)
            </p>
            <p className="text-sm font-bold text-blue-600">
              {progress.toFixed(0)}% Target Met
            </p>
          </div>

          <div className="grid grid-cols-10 h-6 rounded-full overflow-hidden border-2 border-slate-300 bg-slate-100 relative shadow-inner">
            {[1, 2, 3].map((num) => {
              const fundingPercent = getFundingFill(
                num,
                campaign.targetAmount,
                campaign.raisedAmount,
              );
              const isDone = isExecutionComplete(num, campaign.milestones);

              return (
                <div
                  key={num}
                  className="relative border-r border-slate-200 last:border-0 bg-slate-100 group"
                  style={{ gridColumn: `span ${num === 2 ? 4 : 3}` }}
                >
                  {/* 1. FAINT BAR: Funding (Money Raised) */}
                  <div
                    className="absolute inset-0 bg-blue-200 transition-all duration-1000"
                    style={{ width: `${fundingPercent}%` }}
                  />

                  {/* 2. DARK BAR: Execution (Admin Released) */}
                  <div
                    className={`absolute inset-0 bg-blue-600 transition-all duration-700 ${isDone ? "opacity-100" : "opacity-0"}`}
                  />

                  {/* 3. TOOLTIP: Fixed to avoid "code-like" appearance */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-[100]">
                    <div className="bg-slate-900 text-white text-[10px] px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap">
                      <div className="font-black border-b border-slate-700 pb-1 mb-1">
                        PHASE {num}
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Raised:</span>
                        <span className="text-blue-400 font-bold">
                          {fundingPercent.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">Status:</span>
                        <span
                          className={
                            isDone
                              ? "text-emerald-400 font-bold"
                              : "text-amber-400 font-bold"
                          }
                        >
                          {isDone ? "RELEASED" : "PENDING"}
                        </span>
                      </div>
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1 shadow-xl"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-6 border-t-2 border-slate-50">
          <div className="flex gap-10 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-emerald-600" size={24} />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Raised
                </p>
                <p className="text-xl font-bold text-slate-950">
                  ${campaign.raisedAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="text-blue-600" size={24} />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Goal
                </p>
                <p className="text-xl font-bold text-slate-950">
                  ${campaign.targetAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {campaign.status === "ACTIVE" && (
            <button
              onClick={onDonate}
              className="w-full md:w-auto px-12 py-4 bg-slate-950 text-white rounded-2xl font-bold text-base hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
            >
              Support Campaign <ArrowUpRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreCampaigns;
