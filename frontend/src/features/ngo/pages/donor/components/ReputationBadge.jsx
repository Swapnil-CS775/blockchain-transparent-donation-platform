import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  PieChart,
  Award,
  Globe,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import {
  PieChart as RePie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../../../../services/api";

const ReputationBadge = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/profile/donor/stats/summary");
        console.log("Fetched Stats:", res.data);
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Zap className="animate-pulse text-blue-600" size={48} />
      </div>
    );

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-50/50 p-6 lg:p-12 space-y-10"
    >
      {/* Header: Animated Impact Banner */}
      <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <motion.span
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest"
            >
              Donor Passport
            </motion.span>
            <h1 className="text-5xl font-black tracking-tighter">
              Your Digital <br />{" "}
              <span className="text-blue-500">Philanthropy</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-md">
              Tracking every USDT through the 30-40-30 milestone escrow for
              total transparency.
            </p>
          </div>

          <div className="flex gap-6">
            <ImpactScoreCard
              label="Global Rank"
              // Use the rank from backend, or "1" as default if they are the only user
              value={`#${stats?.globalRank || "1"}`}
              icon={<Globe className="text-blue-400" />}
            />
            <ImpactScoreCard
              label="Trust Factor"
              // We can calculate this or use a default trust score
              value={stats?.trustFactor?.toFixed(1) || "10.0"}
              icon={<Award className="text-emerald-400" />}
            />
          </div>
        </div>
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Summary Card */}
        <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <TrendingUp className="text-blue-600" /> Donation Momentum
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyHistory}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="#2563eb"
                  radius={[10, 10, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-black text-slate-900 mb-6 self-start">
            Cause Allocation
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePie>
                <Pie
                  data={stats?.categories}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {stats?.categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </RePie>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 w-full">
            {stats?.categories.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs font-bold text-slate-600 uppercase">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Milestone Integrity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SmallMetric
          label="Total Donated"
          value={`$${stats?.totalAmount?.toLocaleString()}`}
          color="text-blue-600"
        />
        <SmallMetric
          label="NGOs Supported"
          value={stats?.ngoCount}
          color="text-emerald-600"
        />
        <SmallMetric
          label="Milestones Verified"
          value={stats?.verifiedMilestones}
          color="text-purple-600"
        />
        <SmallMetric label="Impact Ratio" value="98%" color="text-amber-600" />
      </div>
    </motion.div>
  );
};

const ImpactScoreCard = ({ label, value, icon }) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl text-center min-w-[140px]">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
      {label}
    </p>
    <p className="text-3xl font-black text-white">{value}</p>
  </div>
);

const SmallMetric = ({ label, value, color }) => (
  <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm">
    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

export default ReputationBadge;
