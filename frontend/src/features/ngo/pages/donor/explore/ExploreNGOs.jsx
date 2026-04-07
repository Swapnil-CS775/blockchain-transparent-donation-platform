import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Star, ArrowUpRight, Loader2 } from 'lucide-react';
import api from '../../../../../services/api'; 
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import ReputationABI from '../../../../../contracts/ReputationManager.json';

const ExploreNGOs = () => {
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [sortBy, setSortBy] = useState("reputationDesc");
    const navigate = useNavigate();

    const categories = ["All", "Society", "Trust"];

    useEffect(() => {
        fetchVerifiedNGOs();
    }, [sortBy]);

    const fetchVerifiedNGOs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/profile/donor/explore/ngos', { params: { sort: sortBy } });
            setNgos(res.data);
        } catch (err) {
            toast.error("Could not retrieve NGO registry");
        } finally {
            setLoading(false);
        }
    };

    const filteredNgos = ngos.filter(ngo => {
        const matchesSearch = ngo.ngoName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "All" || ngo.registrationType === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50/30 p-6 md:p-10 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b-2 border-slate-200 pb-10">
                <div>
                    <h2 className="text-4xl font-bold text-slate-950 tracking-tight">
                        NGO <span className="text-blue-600">Registry</span>
                    </h2>
                    <p className="text-slate-700 text-lg font-medium mt-2">
                        Browse verified non-profits based on community trust and impact.
                    </p>
                </div>

                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                        type="text"
                        placeholder="Search organizations..."
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-300 rounded-2xl outline-none focus:border-blue-600 transition-all text-slate-950 text-base font-medium shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex bg-slate-200 p-1.5 rounded-2xl border border-slate-300">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeCategory === cat 
                                ? "bg-white text-slate-950 shadow-md" 
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-700">Sort by:</span>
                    <select 
                        className="bg-white border-2 border-slate-300 text-sm font-bold text-slate-950 px-5 py-3 rounded-2xl outline-none cursor-pointer focus:border-blue-600 shadow-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="reputationDesc">Highest Trust</option>
                        <option value="newest">Newest Joining</option>
                        <option value="activeCampaigns">Most Active</option>
                    </select>
                </div>
            </div>

            {/* NGO Grid */}
            {loading ? (
                <div className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600" size={40} />
                    <p className="text-lg font-bold text-slate-700 mt-4">Syncing registry data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {filteredNgos.map(ngo => (
                        <NGOCard key={ngo.id} ngo={ngo} navigate={navigate} />
                    ))}
                </div>
            )}
        </div>
    );
};

// ✨ Sub-component to handle individual On-Chain Score fetching
const NGOCard = ({ ngo, navigate }) => {
    const [onChainScore, setOnChainScore] = useState(null);

    useEffect(() => {
        if (ngo.walletAddress) {
            fetchOnChainScore();
        }
    }, [ngo.walletAddress]);

    const fetchOnChainScore = async () => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(
                import.meta.env.VITE_CONTRACT_ADDRESS_REPUTATION,
                ReputationABI.abi,
                provider
            );
            const score = await contract.getReputationScore(ngo.walletAddress);
            setOnChainScore((parseFloat(score.toString()) / 100).toFixed(1));
        } catch (err) {
            console.error("Score fetch error:", err);
            setOnChainScore(null); // Fallback to DB score
        }
    };

    return (
        <div className="group bg-white rounded-[2.5rem] border-2 border-slate-300 p-8 hover:border-blue-600 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
                    {ngo.ngoName.charAt(0)}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 rounded-xl border-2 border-amber-200 shadow-sm">
                    <Star size={18} fill="currentColor" />
                    <span className="font-bold text-lg">
                        {onChainScore || ngo.reputationScore?.toFixed(1) || "0.0"}
                    </span>
                </div>
            </div>

            <div className="space-y-2 mb-6 flex-grow">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-950 text-xl leading-tight group-hover:text-blue-600 transition-colors">
                        {ngo.ngoName}
                    </h3>
                    <ShieldCheck size={22} className="text-blue-600 flex-shrink-0" />
                </div>
                <p className="text-base text-slate-700 font-medium line-clamp-2">
                    {ngo.registeredAddress || "Address Hidden"}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-t-2 border-slate-100 mb-8">
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Entity</p>
                    <p className="text-sm font-bold text-slate-950">{ngo.registrationType}</p>
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Impact</p>
                    <p className="text-sm font-bold text-slate-950">{ngo.activeCampaignsCount || 0} Projects</p>
                </div>
            </div>

            <button 
                onClick={() => navigate(`/donor/ngo/${ngo.id}`,{
                    state: { passedScore: onChainScore }
                })} 
                className="w-full py-4 bg-slate-950 text-white rounded-2xl font-bold text-base hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
                View Profile <ArrowUpRight size={20} />
            </button>
        </div>
    );
};

export default ExploreNGOs;