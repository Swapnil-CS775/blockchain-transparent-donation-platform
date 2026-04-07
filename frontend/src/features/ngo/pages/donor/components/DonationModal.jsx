import React, { useState } from 'react';
import { X, ShieldCheck, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import NGODonationData from '../../../../../contracts/DonationManager.json';
import MockUSDTData from '../../../../../contracts/MockUSDT.json';
import api from '../../../../../services/api';

const DonationModal = ({ isOpen, onClose, campaign,onSuccess ,contractAddress, usdtAddress }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Input, 2: Approve, 3: Donate

    if (!isOpen) return null;

    const handleDonation = async () => {
        if (!amount || isNaN(amount) || amount <= 0) {
            toast.error("PLEASE ENTER A VALID AMOUNT");
            return;
        }

        try {
            setLoading(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            
            // USDT uses 6 or 18 decimals usually. Let's assume 18 for Test USDT.
            const amountInWei = ethers.utils.parseUnits(amount, 18);

            // 1. CHECK ALLOWANCE & APPROVE
            const usdtContract = new ethers.Contract(usdtAddress, MockUSDTData.abi, signer);
            const donationContract = new ethers.Contract(contractAddress, NGODonationData.abi, signer);

            toast.loading("STEP 1: APPROVING USDT...", { id: "tx" });
            const approveTx = await usdtContract.approve(import.meta.env.VITE_CONTRACT_ADDRESS_DONATION, amountInWei);
            await approveTx.wait();

            // 2. DONATE TO ESCROW
            toast.loading("STEP 2: SENDING TO ESCROW...", { id: "tx" });
            const donateTx = await donationContract.donate(campaign.blockchainCampaignId, amountInWei);
            await donateTx.wait();

            const receipt = await donateTx.wait();
            const donationPayload = {
                campaignId: campaign.id,               // Database UUID
                blockchainCampaignId: campaign.blockchainCampaignId, // Smart Contract Index (0, 1, 2)
                amount: amount.toString(),             // Human readable "100.50"
                donorAddress: await signer.getAddress(),
                transactionHash: receipt.transactionHash,
                status: "SUCCESS"
            };

            await api.post('/profile/donor/donation/sync', donationPayload);

            toast.success("DONATION SECURED IN ESCROW!", { id: "tx" });
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.reason || "TRANSACTION FAILED", { id: "tx" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] border border-slate-400 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-slate-950 uppercase tracking-tighter flex items-center gap-2">
                        <ShieldCheck className="text-blue-600" size={20} /> Secure Donation
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Campaign</p>
                        <h4 className="text-lg font-bold text-slate-950">{campaign?.title}</h4>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Amount (USDT)</label>
                        <div className="relative">
                            <input 
                                type="number"
                                placeholder="0.00"
                                className="w-full p-5 bg-slate-50 border border-slate-300 rounded-2xl outline-none focus:border-blue-600 font-black text-2xl transition-all"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400">USDT</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <p className="text-xs text-blue-700 leading-relaxed font-medium">
                            Your funds will be held in a <strong>Smart Contract Escrow</strong>. 
                            Funds are only released to the NGO as they complete verified milestones.
                        </p>
                    </div>

                    <button 
                        disabled={loading}
                        onClick={handleDonation}
                        className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-300 disabled:opacity-50"
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin" /> Processing...</>
                        ) : (
                            <><Wallet size={20} /> Confirm Donation</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DonationModal;