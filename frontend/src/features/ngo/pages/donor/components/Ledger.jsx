import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, ArrowRight, ExternalLink, Filter, Clock, Search, Wallet } from 'lucide-react';
import api from '../../../../../services/api';
import toast from 'react-hot-toast';

const BlockchainLedger = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, ngo, admin, donation

    useEffect(() => { fetchLedger(); }, []);

    const fetchLedger = async () => {
        try {
            setLoading(true);
            const res = await api.get('/profile/donor/ledger'); // We will create this endpoint
            setTransactions(res.data);
        } catch (err) {
            toast.error("Failed to sync with ledger");
        } finally {
            setLoading(false);
        }
    };

    const filteredData = filter === 'all' 
        ? transactions 
        : transactions.filter(tx => tx.category.toLowerCase() === filter);

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-200 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Blockchain ledger</h2>
                    <p className="text-slate-600 font-medium mt-1">Real-time audit of all decentralized operations on the network.</p>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex bg-white p-1 rounded-2xl border-2 border-slate-300 shadow-sm">
                    {['all', 'ngo', 'admin', 'donation'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filter === type ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Cpu className="animate-spin text-blue-600" size={40} />
                    <p className="text-slate-600 font-bold tracking-widest text-[10px] uppercase">Accessing node...</p>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto space-y-4">
                    {filteredData.map((tx, idx) => (
                        <TransactionRow key={tx.hash || idx} tx={tx} />
                    ))}
                </div>
            )}
        </div>
    );
};

const TransactionRow = ({ tx }) => {
    // Helper to shorten addresses
    const shortAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "System";

    return (
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 hover:border-blue-500 transition-all shadow-sm group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Purpose & Category */}
                <div className="flex items-center gap-4 min-w-[280px]">
                    <div className={`p-3 rounded-xl border-2 ${
                        tx.category === 'ngo' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                        tx.category === 'admin' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">{tx.purpose}</h4>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock size={12} /> {tx.formattedDate}
                        </span>
                    </div>
                </div>

                {/* Sender -> Receiver */}
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                    <div className="text-center">
                        <p className="text-[9px] font-bold text-slate-400 mb-0.5">From</p>
                        <p className="text-xs font-mono text-slate-700">{shortAddress(tx.sender)}</p>
                    </div>
                    <ArrowRight size={14} className="text-slate-300" />
                    <div className="text-center">
                        <p className="text-[9px] font-bold text-slate-400 mb-0.5">To</p>
                        <p className="text-xs font-mono text-slate-700">{shortAddress(tx.receiver)}</p>
                    </div>
                </div>

                {/* Hash & External Link */}
                <div className="flex items-center justify-between lg:justify-end gap-6 lg:flex-1">
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 mb-0.5 tracking-wider">Transaction hash</p>
                        <p className="text-xs font-mono text-blue-600 truncate max-w-[150px]">{tx.hash}</p>
                    </div>
                    <a 
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all"
                    >
                        <ExternalLink size={18} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BlockchainLedger;