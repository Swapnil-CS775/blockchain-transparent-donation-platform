import React, { useState, useEffect } from 'react';
import { Megaphone, Target, ListChecks, Info, LayoutGrid, Plus, Filter, IndianRupee, Eye ,Tag,Clock,CheckCircle2,X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { ethers } from 'ethers';
import DonationManagerData from "../../../contracts/DonationManager.json";

const CampaignModule = () => {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'manage'
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    category: "Education",
    coverImage: "",
  });

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const fetchMyCampaigns = async () => {
  try {
    setLoading(true);
    const res = await api.get('/campaigns/my-campaigns');
    console.log("res=",res)
    let data = res.data;

    // Forcefully parse until we get an object/array
    // This handles the "Double String" issue from the server
    for (let i = 0; i < 3; i++) { 
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
          console.log("data=",data)
        } catch (e) {
          break;
        }
      }
    }

    if (Array.isArray(data)) {
      setCampaigns(data);
    } else {
      setCampaigns([]);
    }
  } catch (err) {
    setCampaigns([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (activeTab === 'manage') fetchMyCampaigns();
  }, [activeTab]);

  const calculateMilestone = (percent) => {
    const amount = parseFloat(formData.targetAmount) || 0;
    return (amount * (percent / 100)).toFixed(2);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      return toast.error("PLEASE ENTER A VALID TARGET AMOUNT");
    }

    setLoading(true);
    const tId = toast.loading("WAITING FOR METAMASK...");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); 
      const signer = provider.getSigner();
      const donationContract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS_DONATION,
        DonationManagerData.abi,
        signer
      );

      const m1 = ethers.utils.parseUnits(calculateMilestone(30), 18);
      const m2 = ethers.utils.parseUnits(calculateMilestone(40), 18);
      const m3 = ethers.utils.parseUnits(calculateMilestone(30), 18);
      const totalTarget = m1.add(m2).add(m3);

      toast.loading("CONFIRMING ON BLOCKCHAIN...", { id: tId });
      const tx = await donationContract.createCampaign(totalTarget, m1, m2, m3);
      const receipt = await tx.wait();

      const event = receipt.events?.find(x => x.event === "CampaignCreated");
      const bId = event?.args?.campaignId.toNumber();

      toast.loading("SYNCING DATABASE...", { id: tId });
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        targetAmount: formData.targetAmount.toString(),
        coverImageCid: formData.coverImage || "default_image_cid", 
        blockchainCampaignId: bId,         
        transactionHash: receipt.transactionHash,
        milestones: [
          { title: "Initial Setup", budget: calculateMilestone(30), percentage: 30 },
          { title: "Core Implementation", budget: calculateMilestone(40), percentage: 40 },
          { title: "Final Delivery", budget: calculateMilestone(30), percentage: 30 }
        ]
      };

      await api.post('/campaigns/create', payload);
      toast.success("CAMPAIGN LIVE!", { id: tId });
      setFormData({ title: "", description: "", targetAmount: "", category: "Education", coverImage: "" });
      setActiveTab('manage'); // Switch to list view after creation
    } catch (err) {
      toast.error(err.response?.data?.message || err.message, { id: tId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Campaign Center</h1>
          <p className="text-slate-500 font-medium text-sm">Manage your transparent fundraising.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
          <TabBtn 
            active={activeTab === 'create'} 
            onClick={() => setActiveTab('create')} 
            icon={<Plus size={16}/>} 
            label="Launch New" 
          />
          <TabBtn 
            active={activeTab === 'manage'} 
            onClick={() => setActiveTab('manage')} 
            icon={<LayoutGrid size={16}/>} 
            label="My Campaigns" 
          />
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Your Existing Form Code */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <form onSubmit={handleCreateCampaign} className="space-y-6">
               <div className="flex items-center gap-2 text-blue-600 font-bold mb-4">
                 <Megaphone size={20} />
                 <span>Campaign Details</span>
               </div>
               <InputGroup 
                label="Campaign Title" 
                placeholder="e.g., Rural Education Drive"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Target Amount (INR)" 
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                />
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Category</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Education</option>
                    <option>Healthcare</option>
                    <option>Environment</option>
                    <option>Disaster Relief</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Description</label>
                <textarea 
                  rows="4"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <button disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition active:scale-95 disabled:bg-slate-300">
                {loading ? "PROCESSING..." : "LAUNCH ON BLOCKCHAIN"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
              <h3 className="text-lg font-black flex items-center gap-2 mb-6">
                <ListChecks className="text-blue-400" /> 30/40/30 Plan
              </h3>
              <div className="space-y-6">
                <MilestonePreview title="M1: Setup" percent="30%" amount={calculateMilestone(30)} />
                <MilestonePreview title="M2: Progress" percent="40%" amount={calculateMilestone(40)} />
                <MilestonePreview title="M3: Completion" percent="30%" amount={calculateMilestone(30)} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MANAGE CAMPAIGNS VIEW */
        <div className="space-y-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
             {['ALL', 'ACTIVE', 'COMPLETED'].map(s => (
               <button 
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-6 py-2 rounded-full text-xs font-bold border transition-all ${
                  filterStatus === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'
                }`}
               >
                 {s}
               </button>
             ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(campaigns) ? (
              campaigns
                .filter(c => filterStatus === 'ALL' || c.status === filterStatus)
                .map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign}  onView={openDetails}/>
                        ))
                    ) : (
                      <div className="col-span-full py-10 text-center text-red-500 font-bold">
                        Unexpected data format received from server.
                      </div>
                    )}
            {campaigns.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No campaigns found in this category.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {isModalOpen && (
        <CampaignDetailModal 
          campaign={selectedCampaign} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
    
  );
};

// Sub-components
const TabBtn = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
      active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    {icon} {label}
  </button>
);

const CampaignCard = ({ campaign,onView }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-blue-300 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
        <Target size={24} />
      </div>
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
        campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
      }`}>
        {campaign.status}
      </span>
    </div>
    
    <h3 className="text-lg font-bold text-slate-900 mb-1">{campaign.title}</h3>
    <p className="text-slate-500 text-xs font-medium mb-4 line-clamp-2">{campaign.description}</p>
    
    <div className="flex items-center gap-4 py-4 border-t border-slate-100">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase">Goal</p>
        <p className="text-sm font-black text-slate-900 flex items-center gap-1">
          <IndianRupee size={12}/> {campaign.targetAmount}
        </p>
      </div>
      <div className="ml-auto">
        <button 
        onClick={() => onView(campaign)}
        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors">
          <Eye size={14}/> View
        </button>
      </div>
    </div>
  </div>
);

// Reuse your existing MilestonePreview and InputGroup components here...
const InputGroup = ({ label, placeholder, type = "text", value, onChange }) => (
  <div className="space-y-1 text-left">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">{label}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-slate-900" />
  </div>
);

const MilestonePreview = ({ title, percent, amount }) => (
  <div className="relative pl-8">
    <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900"></div>
    <div className="flex justify-between items-center text-xs font-bold text-slate-300">
      <p>{title}</p>
      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{percent}</span>
    </div>
    <p className="text-lg font-black mt-0.5">$ {amount}</p>
  </div>
);

const CampaignDetailModal = ({ campaign, onClose }) => {
  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 bg-slate-50 border-b border-slate-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Tag size={14} className="font-bold" />
              <span className="text-[10px] font-black uppercase tracking-widest">{campaign.category}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">{campaign.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={24} className="rotate-45" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <StatBox label="Target Amount" value={`$${campaign.targetAmount}`} icon={<Target className="text-blue-600"/>} />
            <StatBox label="Blockchain ID" value={`#${campaign.blockchainCampaignId}`} icon={<LayoutGrid className="text-purple-600"/>} />
            <StatBox label="Launched On" value={new Date(campaign.createdAt).toLocaleDateString()} icon={<Clock className="text-orange-600"/>} />
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h4 className="font-black text-slate-900">Milestone Progress</h4>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">30/40/30 Smart Contract Verified</span>
            </div>
            
            <div className="space-y-4">
              {campaign.milestones
                ?.slice() // Create a shallow copy to avoid mutating state
                .sort((a, b) => a.milestoneNumber - b.milestoneNumber)
                .map((m, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{m.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Stage {m.milestoneNumber} • {m.percentage}% of total</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-sm">${m.amount}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      m.status === 'RELEASED' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Footprint */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-4">
             <div className="p-2 bg-white/10 rounded-xl">
                <Info size={20} className="text-blue-400" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Hash</p>
                <p className="text-[10px] font-mono truncate text-blue-300">{campaign.transactionHash}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, icon }) => (
  <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm">
    <div className="mb-2">{icon}</div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-black text-slate-900">{value}</p>
  </div>
);

export default CampaignModule;