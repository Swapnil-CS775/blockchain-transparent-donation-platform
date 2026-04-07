import React, { useState, useEffect } from 'react';
import { 
  Milestone, Upload, CheckCircle, Clock, FileText, Camera, 
  ArrowLeft, IndianRupee, Lock, Unlock, Send, CloudUpload, Info, X, Wallet
} from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import DonationManagerData from "../../../contracts/DonationManager.json";

const MilestoneModule = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(null);

  useEffect(() => {
    fetchNGOCampaigns();
  }, []);

  const fetchNGOCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campaigns/my-campaigns');
      setCampaigns(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      toast.error("FAILED TO FETCH CAMPAIGNS");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-900 font-black animate-pulse uppercase tracking-widest">Syncing Blockchain Data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {viewMode === 'list' ? (
        <CampaignListView campaigns={campaigns} onSelect={(cap) => { setSelectedCampaign(cap); setViewMode('detail'); }} />
      ) : (
        <div className="space-y-8 pb-20">
          <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-slate-900 hover:text-blue-600 font-black transition">
            <ArrowLeft size={18} /> Back to My Campaigns
          </button>

          <CampaignHeader campaign={selectedCampaign} />

          <div className="grid lg:grid-cols-2 gap-8">
            {selectedCampaign?.milestones
            ?.slice() // Create a copy
            .sort((a, b) => a.milestoneNumber - b.milestoneNumber)
            .map((m, idx) => (
              <MilestoneCard 
                key={m.id} 
                milestone={m} 
                index={idx} 
                onOpenForm={() => { setActiveMilestone(m); setShowForm(true); }}
              />
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <ProofSubmissionForm 
          campaign={selectedCampaign}
          milestone={activeMilestone} 
          onClose={() => { setShowForm(false); fetchNGOCampaigns(); }}
        />
      )}
    </div>
  );
};

/* --- ENHANCED FORM WITH MASTER IPFS LOGIC --- */
const ProofSubmissionForm = ({ campaign, milestone, onClose }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    invoiceFile: null, invoiceCid: "",
    photoFile: null, photoCid: "",
    docsFile: null, docsCid: ""
  });

  const handleFileSelect = (field, file) => {
    if (file) setFormData(prev => ({ ...prev, [`${field}File`]: file, [`${field}Cid`]: "" }));
  };

  const uploadToIPFS = async (field) => {
    const file = formData[`${field}File`];
    if (!file) return;
    const tId = toast.loading(`UPLOADING ${file.name.toUpperCase()}...`);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await api.post('/ipfs/upload', data);
      setFormData(prev => ({ ...prev, [`${field}Cid`]: res.data.cid }));
      toast.success("VERIFIED ON IPFS", { id: tId });
    } catch (err) {
      toast.error("IPFS CONNECTION FAILED", { id: tId });
    }
  };

  const handleBlockchainSubmit = async () => {
    if (!formData.invoiceCid || !formData.description) {
      return toast.error("Description and Invoice are mandatory");
    }
    
    setSubmitting(true);
    const tId = toast.loading("PREPARING MASTER PROOF METADATA...");

    try {
      // 1. CREATE MASTER METADATA (Bundles all 3 CIDs + description)
      const masterMetadata = {
        milestoneTitle: milestone.title,
        description: formData.description,
        invoice: formData.invoiceCid,
        photos: formData.photoCid || null,
        docs: formData.docsCid || null,
        timestamp: new Date().toISOString()
      };

      // 2. UPLOAD MASTER JSON TO IPFS
      const metadataRes = await api.post('/ipfs/upload-json', masterMetadata);
      const masterCid = metadataRes.data.cid;

      toast.loading("SIGNING BLOCKCHAIN TRANSACTION...", { id: tId });

      // 3. BLOCKCHAIN INTEGRATION (submitProof call)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS_DONATION,
        DonationManagerData.abi,
        signer
      );

      // Call submitProof(uint campaignId, string memory ipfsHash)
      const tx = await contract.submitProof(campaign.blockchainCampaignId, masterCid);
      
      toast.loading("WAITING FOR ON-CHAIN CONFIRMATION...", { id: tId });
      await tx.wait();

      // 4. SYNC WITH BACKEND
      await api.post('/milestones/submit-proof-sync', {
        milestoneId: milestone.id,
        masterCid: masterCid,
        transactionHash: tx.hash,
        description: formData.description
      });

      toast.success("PROOF VERIFIED ON-CHAIN!", { id: tId });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.reason || "BLOCKCHAIN SUBMISSION FAILED", { id: tId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border-2 border-slate-300 overflow-hidden animate-in zoom-in-95">
        <div className="p-8 border-b-2 border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Evidence Submission</p>
            <h3 className="text-xl font-black text-slate-900 mt-1 uppercase">{milestone.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-900"><X size={20}/></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DedicatedUpload label="INVOICE / BILLS" file={formData.invoiceFile} onSelect={(f) => handleFileSelect('invoice', f)} onUpload={() => uploadToIPFS('invoice')} isUploaded={!!formData.invoiceCid} />
            <DedicatedUpload label="SITE PHOTOS" file={formData.photoFile} onSelect={(f) => handleFileSelect('photo', f)} onUpload={() => uploadToIPFS('photo')} isUploaded={!!formData.photoCid} />
            <DedicatedUpload label="OTHER DOCS" file={formData.docsFile} onSelect={(f) => handleFileSelect('docs', f)} onUpload={() => uploadToIPFS('docs')} isUploaded={!!formData.docsCid} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-900 uppercase ml-2 tracking-widest">Impact Description</label>
            <textarea 
              className="w-full p-5 bg-slate-50 rounded-3xl border-2 border-slate-300 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-600 min-h-[140px]"
              placeholder="Detail exactly how these funds were spent..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            onClick={handleBlockchainSubmit}
            disabled={submitting || !formData.invoiceCid}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:bg-slate-400"
          >
            <Send size={18} /> {submitting ? "PROCESSING..." : "SIGN & SUBMIT PROOF"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- UI COMPONENTS --- */

const DedicatedUpload = ({ label, file, onSelect, onUpload, isUploaded }) => (
  <div className="space-y-3">
    <p className="text-[10px] font-black text-slate-700 text-center uppercase tracking-widest">{label}</p>
    <div className={`p-6 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-3 transition-all ${isUploaded ? 'border-green-600 bg-green-50' : 'border-slate-400 bg-white hover:border-blue-500'}`}>
      <label className="flex flex-col items-center gap-2 cursor-pointer group w-full text-center">
        <Upload size={28} className={`transition-colors ${isUploaded ? "text-green-600" : "text-slate-900 group-hover:text-blue-600"}`} />
        <span className="text-[11px] font-black text-slate-900 truncate max-w-full uppercase">
          {file ? file.name : "NO FILE CHOSEN"}
        </span>
        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => onSelect(e.target.files[0])} />
      </label>
      {file && (
        <button onClick={onUpload} disabled={isUploaded} className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-md ${isUploaded ? 'bg-green-600 text-white cursor-default shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}>
          {isUploaded ? "ON IPFS" : "UPLOAD"}
        </button>
      )}
    </div>
  </div>
);

const MilestoneCard = ({ milestone, index, onOpenForm }) => {
  // Logic: Milestone funds released automatically in your contract
  const isUnlocked = milestone.status === 'RELEASED';
  const isCompleted = milestone.status === 'RELEASED' || milestone.status === 'SUBMITTED';

  return (
    <div className={`p-8 rounded-[3rem] border-2 shadow-sm transition-all ${isCompleted ? 'bg-green-50/50 border-green-300' : 'bg-white border-slate-300'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-slate-900 flex items-center gap-3 text-lg uppercase">
          <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm">{index + 1}</span>
          {milestone.title}
        </h3>
        <StatusIndicator status={milestone.status} />
      </div>
      <div className="space-y-1 mb-8">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-tighter">Budget Allocation</p>
        <p className="text-xl font-black text-slate-900 flex items-center gap-1.5">
          <span className="text-slate-900 mr-1">$</span> {milestone.amount} <span className="text-sm text-slate-500 font-bold">({milestone.percentage}%)</span>
        </p>
      </div>
      {isUnlocked ? (
        <button onClick={onOpenForm} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs hover:bg-blue-700 transition uppercase shadow-lg shadow-blue-50">Submit Work Proof</button>
      ) : (
        <div className="flex items-center justify-center py-5 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-400 text-slate-900">
           {isCompleted ? <CheckCircle size={24} className="text-green-600" /> : <Lock size={20} />}
           <span className="text-[11px] font-black text-green-600  ml-2">{isCompleted ? "Verified" : `Status: \`${milestone.status}\``}</span>
        </div>
      )}
    </div>
  );
};

const CampaignListView = ({ campaigns, onSelect }) => (
  <div className="space-y-8">
    <div className="px-2">
      <h1 className="text-3xl font-black text-slate-900 uppercase">Milestone Dashboard</h1>
      <p className="text-slate-600 font-black text-sm">Select a project to upload utilization proofs for released funds.</p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {campaigns.map(cap => (
        <div key={cap.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-300 hover:border-blue-600 hover:shadow-2xl transition-all flex flex-col gap-6">
            <div className="flex justify-between items-start gap-4">
                <h4 className="font-black text-slate-900 text-lg uppercase leading-tight line-clamp-2">{cap.title}</h4>
                <span className="shrink-0 px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-lg border-2 border-blue-200 tracking-widest">{cap.category}</span>
            </div>
            <div className="flex justify-between items-center pt-6 border-t-2 border-slate-200 mt-auto">
                <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${cap.status === 'ACTIVE' ? 'text-green-600' : 'text-slate-500'}`}>
                  <span className="w-3 h-3 rounded-full bg-current"></span>{cap.status}
                </span>
                <button onClick={() => onSelect(cap)} className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black rounded-xl hover:bg-blue-600 transition uppercase shadow-md w-40">Manage</button>
            </div>
        </div>
      ))}
    </div>
  </div>
);

const CampaignHeader = ({ campaign }) => (
  <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl border-4 border-slate-800">
    <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-blue-400 font-black text-xs uppercase tracking-widest">Active Project Selection</span>
          <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-black uppercase rounded-lg border-2 border-white/20">{campaign?.category}</span>
        </div>
        <h2 className="text-4xl font-black mt-2 uppercase">{campaign?.title}</h2>
        <div className="flex items-center gap-2 mt-4 border-b border-white/10 pb-4">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Target Goal:</span>
          <span className="text-2xl font-black text-white flex items-center">
            <span className="text-blue-400 mr-1">$</span>
            {Number(campaign?.targetAmount).toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-slate-300 text-sm mt-4 max-w-2xl leading-relaxed italic">"{campaign?.description}"</p>
    </div>
    <Milestone size={240} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
  </div>
);

const StatusIndicator = ({ status }) => {
  const config = {
    LOCKED: { color: "text-slate-900 bg-slate-100 border-slate-400", icon: <Lock size={12}/> },
    FUNDED: { color: "text-blue-700 bg-blue-50 border-blue-600", icon: <Unlock size={12}/> },
    SUBMITTED: { color: "text-yellow-700 bg-yellow-50 border-yellow-200", icon: <Clock size={12}/> },
    RELEASED: { color: "text-green-700 bg-green-50 border-green-200", icon: <CheckCircle size={12}/> }
  };
  const active = config[status] || config.LOCKED;
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 ${active.color}`}>
      {active.icon} {status}
    </div>
  );
};

export default MilestoneModule;