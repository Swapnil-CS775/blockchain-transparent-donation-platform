import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, ShieldCheck, Wallet, Trash2, Search, Activity } from 'lucide-react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import NGORegistrationData from "../../../../contracts/NGORegistration.json";

const ManageVerifiers = () => {
  const [verifiers, setVerifiers] = useState([]);
  const [newVerifierWallet, setNewVerifierWallet] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifiers();
  }, []);

  const fetchVerifiers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/verifiers');
      setVerifiers(res.data);
    } catch (err) {
      toast.error("FAILED TO LOAD VERIFIER REGISTRY");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVerifier = async () => {
    if (!ethers.utils.isAddress(newVerifierWallet)) {
      return toast.error("INVALID ETHEREUM ADDRESS");
    }

    const tId = toast.loading("GRANTING BLOCKCHAIN PERMISSIONS...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS_REGISTRY,
        NGORegistrationData.abi,
        signer
      );

      const tx = await contract.addVerifier(newVerifierWallet);
      toast.loading("SYNCING WITH DISTRIBUTED LEDGER...", { id: tId });
      await tx.wait();

      await api.post(`/admin/verifiers/add?walletAddress=${newVerifierWallet}&txHash=${tx.hash}`);
      
      toast.success("VERIFIER ROLE GRANTED SUCCESSFULLY", { id: tId });
      setNewVerifierWallet("");
      fetchVerifiers();
    } catch (err) {
        console.log(err);
      toast.error(err.reason || "BLOCKCHAIN ASSIGNMENT FAILED", { id: tId });
    }
  };

  const handleRemoveVerifier = async (userId, walletAddress) => {
    const tId = toast.loading("REVOKING BLOCKCHAIN PERMISSIONS...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS_REGISTRY,
        NGORegistrationData.abi,
        signer
      );

      const tx = await contract.removeVerifier(walletAddress);
      await tx.wait();

      await api.delete(`/admin/verifiers/${userId}&transactionHash=${tx.hash}`);
      
      toast.success("VERIFIER ROLE REVOKED", { id: tId });
      fetchVerifiers();
    } catch (err) {
      toast.error("REVOCATION FAILED", { id: tId });
    }
  };

  return (
    <div className="max-w-5xl space-y-10">
      {/* Add Verifier Section */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><UserPlus size={24}/></div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 uppercase">Authorize New Verifier</h3>
            <p className="text-sm text-slate-500">Assign governance rights to a specific wallet address</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input 
              type="text"
              placeholder="0x... Enter Wallet Address"
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono focus:border-blue-500 focus:bg-white outline-none transition-all"
              value={newVerifierWallet}
              onChange={(e) => setNewVerifierWallet(e.target.value)}
            />
          </div>
          <button 
            onClick={handleAddVerifier}
            className="px-8 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md shadow-blue-200"
          >
            Authorize <ShieldCheck size={18}/>
          </button>
        </div>
      </div>

      {/* Verifier List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <Activity size={18} className="text-blue-600"/> Active Verifiers Registry
          </h3>
          <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">{verifiers.length} Authorized</span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-20 text-center text-slate-400 text-sm uppercase tracking-tighter animate-pulse">Querying Access Logs...</div>
          ) : verifiers.length === 0 ? (
            <div className="p-20 text-center text-slate-400 text-sm">No verifiers found in the registry.</div>
          ) : (
            verifiers.map(v => (
              <div key={v.id} className="p-6 flex justify-between items-center hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                    V
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Wallet Address</p>
                    <p className="font-mono text-slate-700 text-sm">{v.walletAddress}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveVerifier(v.id, v.walletAddress)}
                  className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Revoke Permissions"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageVerifiers;