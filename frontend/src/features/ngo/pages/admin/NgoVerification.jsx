import React, { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink, CheckCircle, XCircle, FileText, Globe, UserCheck, AlertTriangle } from 'lucide-react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import NGORegistryData from "../../../../contracts/NGORegistration.json";

const NgoVerification = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingNgos();
  }, []);

  const fetchPendingNgos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/ngos', { params: { status: 'SUBMITTED' } });
      console.log("Responce data=",res.data);
      setNgos(res.data);
    } catch (err) {
      toast.error("FAILED TO FETCH NGO LIST");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ngo) => {
    const tId = toast.loading("INITIATING BLOCKCHAIN REGISTRATION...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS_REGISTRY,
        NGORegistryData.abi,
        signer
      );

      // Note: Assuming walletAddress is available or linked to User ID
      const tx = await contract.verifyNGO(ngo.walletAddress);
      toast.loading("WAITING FOR ON-CHAIN CONFIRMATION...", { id: tId });
      await tx.wait();

      await api.post(`/admin/ngos/${ngo.id}/verify`, { approve: true, reason: "",transactionHash:tx.hash });
      
      toast.success("NGO OFFICIALLY VERIFIED & REGISTERED", { id: tId });
      setSelectedNgo(null);
      fetchPendingNgos();
    } catch (err) {
        console.error("Verification error:", err);
      toast.error(err.reason || "VERIFICATION FAILED", { id: tId });
    }
  };

  const handleReject = async (ngoId) => {
    if (!rejectionReason) return toast.error("Please provide a rejection reason");
    const tId = toast.loading("PROCESSING REJECTION...");
    try {
      await api.post(`/admin/ngos/${ngoId}/verify`, { approve: false, reason: rejectionReason });
      toast.success("NGO REJECTED & NOTIFIED", { id: tId });
      setSelectedNgo(null);
      setRejectionReason("");
      fetchPendingNgos();
    } catch (err) {
      toast.error("REJECTION FAILED", { id: tId });
    }
  };

  const viewFile = (base64Data, label) => {
    if (!base64Data) return toast.error("File not found");
    
    const win = window.open();
    win.document.title = label;
    // Rendering as an iframe to handle PDF/Images within a data URL
    win.document.write(
      `<iframe src="data:application/pdf;base64,${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
    );
  };

  const base64ToBlob = (base64) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/pdf' });
  };

  if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse uppercase tracking-widest font-bold">Scanning Registry...</div>;

  return (
    <div className="space-y-6">
      {!selectedNgo ? (
        <div className="grid grid-cols-1 gap-4">
          {ngos.length === 0 ? (
            <div className="p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-300 text-center text-slate-400 font-bold uppercase">No Pending Onboarding Requests</div>
          ) : (
            ngos.map(ngo => (
              <div key={ngo.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex justify-between items-center hover:border-blue-500 transition-all group shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-bold text-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    {ngo.ngoName ? ngo.ngoName[0] : "?"}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">{ngo.ngoName}</h4>
                    <div className="flex gap-3">
                        <StatusBadge label="PAN" isVerified={ngo.panVerified} />
                        <StatusBadge label="NGO REG" isVerified={ngo.onboardingStatus === 'APPROVED'} />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNgo(ngo)}
                  className="px-8 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-all uppercase tracking-widest shadow-md"
                >
                  Review Application
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300 shadow-xl">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Application: {selectedNgo.ngoName}</h3>
            <button onClick={() => setSelectedNgo(null)} className="text-slate-400 hover:text-slate-900 font-bold uppercase text-[10px] tracking-widest px-4 py-2 border border-slate-200 rounded-lg">Close Review</button>
          </div>
          
          <div className="p-8 grid lg:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <DetailItem label="Registration Number" value={selectedNgo.registrationNumber} />
                <DetailItem label="Registration Type" value={selectedNgo.registrationType} />
                <DetailItem label="Incorporation Date" value={selectedNgo.incorporationDate || "Not Provided"} />
                <DetailItem label="Contact Email" value={selectedNgo.contactEmail} />
                <DetailItem label="Contact Phone" value={selectedNgo.contactPhone} />
                <DetailItem label="Address" value={`${selectedNgo.registeredAddress}, ${selectedNgo.district}, ${selectedNgo.state} - ${selectedNgo.pinCode}`} />
              </div>
              
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                 <DetailItem label="80G Number" value={selectedNgo.eightyGNumber} />
                 <DetailItem label="12A Number" value={selectedNgo.twelveANumber} />
              </div>
            </div>

            {/* Middle Column: Decrypted Documents */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} className="text-blue-600"/> Verified Documents (Decrypted)
              </h4>
              <div className="space-y-3">
                <DocPreview 
                    label="Registration Certificate" 
                    onClick={() => viewFile(selectedNgo.registrationCertificateBase64, "Registration Certificate")}
                />
                <DocPreview 
                    label="80G Certificate" 
                    onClick={() => viewFile(selectedNgo.eightyGCertificateBase64, "80G Certificate")}
                />
                <DocPreview 
                    label="12A Certificate" 
                    onClick={() => viewFile(selectedNgo.twelveACertificateBase64, "12A Certificate")}
                />
              </div>
            </div>

            {/* Right Column: Admin Action */}
            <div className="lg:col-span-1 bg-slate-900 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Decision Panel</p>
                <textarea 
                  className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-sm text-white outline-none focus:border-blue-500 transition-all h-40"
                  placeholder="Provide feedback to the NGO if rejecting..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3 mt-8">
                <button 
                  onClick={() => handleVerify(selectedNgo)}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
                >
                  <CheckCircle size={18} /> Approve & Verify On-Chain
                </button>
                <button 
                  onClick={() => handleReject(selectedNgo.id)}
                  className="w-full py-4 bg-transparent border border-red-500/50 text-red-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Reject Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ label, isVerified }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase ${
        isVerified ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
    }`}>
        {isVerified ? <UserCheck size={10}/> : <AlertTriangle size={10}/>}
        {label}: {isVerified ? 'Verified' : 'Pending'}
    </div>
);

const DetailItem = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-slate-800 font-semibold text-sm">{value || "N/A"}</p>
  </div>
);

const DocPreview = ({ label, onClick }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 transition-all group"
    >
      <div className="flex items-center gap-3">
        <FileText size={18} className="text-blue-600" />
        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{label}</span>
      </div>
      <ExternalLink size={14} className="text-slate-300 group-hover:text-blue-600" />
    </button>
);

export default NgoVerification;