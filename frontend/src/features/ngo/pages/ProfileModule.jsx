import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Globe, MapPin, Eye } from 'lucide-react'; // Added Eye icon
import api from '../../../services/api';
import toast from 'react-hot-toast';

const ProfileModule = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile/ngo/details');
        setProfile(response.data);
      } catch (err) {
        toast.error("FAILED TO LOAD PROFILE DATA");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Helper to view decrypted Base64 files
  const viewFile = (base64Data, label) => {
    if (!base64Data) return toast.error("File not found");
    
    const win = window.open();
    win.document.title = label;
    // Rendering as an iframe to handle PDF/Images within a data URL
    win.document.write(
      `<iframe src="data:application/pdf;base64,${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
    );
  };

  if (loading) return <div className="text-center pt-20 font-bold text-slate-400">DECRYPTING PROFILE DATA...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-start bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{profile?.ngoName}</h1>
            <div className="flex items-center gap-4 mt-1 text-slate-500 font-bold text-sm">
              <span className="flex items-center gap-1"><MapPin size={14}/> {profile?.district}, {profile?.state}</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">{profile?.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Registration Details */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" size={20}/> Registration Details
            </h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <DetailItem label="Registration Type" value={profile?.registrationType} />
              <DetailItem label="Registration No." value={profile?.registrationNumber} />
              <DetailItem label="Decrypted PAN" value={profile?.panNumber} />
              <DetailItem label="Wallet Address" value={profile?.walletAddress} isMono />
            </div>
          </section>

          {/* Decrypted Documents Section */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Globe className="text-blue-600" size={20}/> Verified Documents (Decrypted)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocPreview 
                label="Registration Certificate" 
                data={profile?.registrationCertificateBase64} 
                onClick={() => viewFile(profile?.registrationCertificateBase64, "Registration Certificate")}
              />
              <DocPreview 
                label="80G Certificate" 
                data={profile?.eightyGCertificateBase64} 
                onClick={() => viewFile(profile?.eightyGCertificateBase64, "80G Certificate")}
              />
              <DocPreview 
                label="12A Certificate" 
                data={profile?.twelveACertificateBase64} 
                onClick={() => viewFile(profile?.twelveACertificateBase64, "12A Certificate")}
              />
            </div>
          </section>
        </div>

        {/* Sidebar Info - Master CID remains as a reference */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
            <h4 className="font-black text-xl mb-2">On-Chain Reference</h4>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Your master application package is pinned to IPFS. This CID is stored on the blockchain for permanent auditing.
            </p>
            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Master CID</p>
              <p className="text-[11px] font-mono break-all mt-1">{profile?.masterApplicationCid}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Sub-components */
const DetailItem = ({ label, value, isMono }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-sm font-bold text-slate-700 mt-1 ${isMono ? 'font-mono text-blue-600 break-all' : ''}`}>{value || '---'}</p>
  </div>
);

const DocPreview = ({ label, data, onClick }) => (
  <button 
    onClick={onClick}
    disabled={!data}
    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all group w-full disabled:opacity-50"
  >
    <div className="text-left">
      <span className="text-[10px] font-bold text-slate-400 uppercase block">Document</span>
      <span className="text-xs font-black text-slate-700 group-hover:text-blue-700">{label}</span>
    </div>
    <Eye size={18} className="text-slate-400 group-hover:text-blue-600" />
  </button>
);

export default ProfileModule;