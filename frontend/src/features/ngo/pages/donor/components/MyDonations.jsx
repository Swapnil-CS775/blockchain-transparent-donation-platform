import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Loader2, FileText, CheckCircle2, Camera, CloudUpload, MessageSquare } from 'lucide-react';
import api from '../../../../../services/api';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import ReputationABI from '../../../../../contracts/ReputationManager.json';

const MyDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => { fetchMyHistory(); }, []);

    const fetchMyHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get('/profile/donor/donations/history');
            setDonations(res.data);
        } catch (err) {
            toast.error("Could not load donation history");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/30 p-6 md:p-10 space-y-10">
            <div className="border-b-2 border-slate-300 pb-6">
                <h2 className="text-3xl font-bold text-slate-950 tracking-tight">My impact</h2>
                <p className="text-slate-700 font-medium mt-1">Track your contributions and rate the organizations you've supported.</p>
            </div>

            {loading ? (
                <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                    {donations.map(item => (
                        <ImpactCard key={item.id} data={item} onRateSuccess={fetchMyHistory} />
                    ))}
                </div>
            )}
        </div>
    );
};

const viewProofFile = async (cid, label) => {
    if (!cid) return toast.error("File not found");
    const tId = toast.loading(`Opening ${label}...`);
    const gateways = [
        `http://127.0.0.1:8080/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        `https://ipfs.io/ipfs/${cid}`
    ];

    for (const url of gateways) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                const win = window.open();
                if (!win) { toast.error("Popup blocked!"); return; }
                win.document.title = label;
                win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                toast.dismiss(tId);
                return;
            }
        } catch (err) { console.warn(`Gateway failed: ${url}`); }
    }
    toast.error("Could not retrieve file", { id: tId });
};

const ImpactCard = ({ data, onRateSuccess }) => {
    const [rating, setRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [isRating, setIsRating] = useState(false);

    const handleRateNGO = async () => {
        if (rating === 0) return toast.error("Please select a star rating");
        try {
            setIsRating(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
                import.meta.env.VITE_CONTRACT_ADDRESS_REPUTATION, 
                ReputationABI.abi, 
                signer
            );

            toast.loading("Recording on-chain rating...", { id: "rate" });
            const tx = await contract.rateNGO(data.blockchainCampaignId, rating);
            await tx.wait();
            
            // Send both rating and description to backend
            await api.post(`/profile/donor/donations/${data.id}/rate`, {
                stars: rating,
                description: reviewComment,
                transactionHash: tx.hash,
            });

            toast.success("NGO rated successfully!", { id: "rate" });
            onRateSuccess();
        } catch (err) {
            toast.error("Rating failed", { id: "rate" });
        } finally {
            setIsRating(false);
        }
    };

    return (
        <div className="bg-white border-2 border-slate-400 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50 border-b-2 border-slate-300 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-950 text-white rounded-lg flex items-center justify-center font-bold">{data.ngoName.charAt(0)}</div>
                    <div>
                        <h4 className="font-bold text-slate-950">{data.campaignTitle}</h4>
                        <p className="text-xs font-bold text-slate-600">By {data.ngoName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-600">Your donation</p>
                    <p className="text-lg font-bold text-emerald-600">${data.amount.toLocaleString()}</p>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <div className="space-y-4">
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-blue-600" /> Milestone proofs
                    </h5>
                    <div className="grid grid-cols-1 gap-6">
                        {data.milestones.map((m, idx) => (
                            <MilestoneFileRow key={idx} milestone={m} index={idx} />
                        ))}
                    </div>
                </div>

                {data.milestones.some(m => m.masterIpfsHash) ? (
                    <div className="pt-8 border-t-2 border-slate-200 space-y-4">
                        <p className="text-sm font-bold text-slate-700 italic">How was your experience with this NGO?</p>
                        
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => setRating(star)}
                                        disabled={data.alreadyRated}
                                        className="p-1 transition-transform hover:scale-110"
                                    >
                                        <Star 
                                            size={32} 
                                            fill={star <= (data.onChainRating || rating) ? "#eab308" : "none"} 
                                            className={star <= (data.onChainRating || rating) ? "text-yellow-500" : "text-slate-300"}
                                        />
                                    </button>
                                ))}
                            </div>

                            {!data.alreadyRated && (
                                <>
                                    <textarea 
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm text-slate-700 outline-none focus:border-blue-500 transition-all h-24"
                                        placeholder="Tell us about the impact of this donation..."
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleRateNGO}
                                        disabled={isRating}
                                        className="w-fit px-8 py-3 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-md"
                                    >
                                        Submit review
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="pt-6 border-t-2 border-slate-200">
                        <p className="text-xs font-bold text-slate-500 tracking-widest text-center italic">
                            Rating available once NGO submits initial impact proof
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const MilestoneFileRow = ({ milestone, index }) => {
    const [metadata, setMetadata] = useState(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (milestone.masterIpfsHash) {
            const fetchMeta = async () => {
                setFetching(true);
                try {
                    const res = await fetch(`http://127.0.0.1:8080/ipfs/${milestone.masterIpfsHash}`).catch(() => 
                                     fetch(`https://gateway.pinata.cloud/ipfs/${milestone.masterIpfsHash}`));
                    const json = await res.json();
                    setMetadata(json);
                } catch (e) { console.error("Metadata fetch failed", e); }
                finally { setFetching(false); }
            };
            fetchMeta();
        }
    }, [milestone.masterIpfsHash]);

    if (!milestone.masterIpfsHash) return (
        <div className="p-4 rounded-xl border-2 border-slate-200 bg-slate-50 opacity-70 text-xs font-medium text-slate-600 italic">
            Milestone {index + 1}: No proof yet
        </div>
    );

    return (
        <div className="p-5 rounded-2xl border-2 border-blue-200 bg-blue-50/30 space-y-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <p className="text-[10px] font-bold text-blue-700 tracking-widest">Milestone {index + 1}</p>
                    <h6 className="font-bold text-slate-900">{metadata?.milestoneTitle || "Loading details..."}</h6>
                </div>
                {fetching && <Loader2 size={14} className="animate-spin text-blue-500" />}
            </div>

            {/* NGO Description Section */}
            {metadata?.description && (
                <div className="bg-white/60 p-4 rounded-xl border border-blue-100">
                    <p className="text-[9px] font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                        <MessageSquare size={10} /> NGO Message
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed italic">"{metadata.description}"</p>
                </div>
            )}

            {metadata && (
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => viewProofFile(metadata.invoice, "Invoice")} className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 rounded-lg text-[11px] font-bold text-blue-800 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <FileText size={14} /> Invoice
                    </button>
                    <button onClick={() => viewProofFile(metadata.photos, "Site photos")} className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 rounded-lg text-[11px] font-bold text-blue-800 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <Camera size={14} /> Site photos
                    </button>
                    <button onClick={() => viewProofFile(metadata.docs, "Report")} className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-300 rounded-lg text-[11px] font-bold text-blue-800 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                        <CloudUpload size={14} /> Report
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyDonations;