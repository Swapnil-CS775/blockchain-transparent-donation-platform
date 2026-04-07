import React from 'react';
import { ShieldCheck, ArrowRight, Heart, Globe, Lock, BarChart3, Link2, UserCheck, Search, Send, MapPin, Star } from 'lucide-react';

// Helper Component for the "O -> O -> O" Roadmap
const Step = ({ icon, label, step }) => (
  <div className="relative z-10 flex flex-col items-center group w-full md:w-auto">
    <div className="w-16 h-16 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-blue-600 shadow-xl group-hover:border-blue-600 transition-all duration-300">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="mt-4 text-center">
      <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-1">Step {step}</p>
      <h4 className="text-sm font-bold text-slate-800 whitespace-nowrap">{label}</h4>
    </div>
  </div>
);

// Helper Component for Feature Cards
const StepCard = ({ icon, title, desc }) => (
  <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:shadow-xl transition-all border border-slate-100">
    <div className="text-blue-600 mb-6">{icon}</div>
    <h3 className="text-2xl font-bold mb-4 text-slate-900">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

// Helper Component for Stats
const StatBox = ({ num, label }) => (
  <div>
    <div className="text-5xl font-black mb-2">{num}</div>
    <div className="text-blue-100 font-bold uppercase text-sm tracking-widest">{label}</div>
  </div>
);

const LandingPage = () => {
  return (
    <div className="bg-white pt-16">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <h1 className="text-7xl font-black text-slate-900 leading-tight mb-6">
              Empowerment <br/><span className="text-blue-600 underline decoration-blue-100">Traceable</span>.
            </h1>
            <p className="text-xl text-slate-500 mb-8 leading-relaxed max-w-lg">
              The first donation ecosystem in Kolhapur leveraging Polygon and IPFS to ensure your contribution reaches the exact hands it was meant for.
            </p>
            <div className="flex items-center gap-4">
              <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 hover:-translate-y-1 transition-all">
                Get Started
              </button>
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
                <div className="pl-6 text-sm font-bold text-slate-400">Trusted by 2k+ Donors</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000" className="rounded-[3rem] shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700" alt="Impact" />
            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-bounce">
              <div className="text-blue-600 font-black text-3xl">100%</div>
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">Transparency</div>
            </div>
          </div>
        </div>
      </section>

      {/* RoadMap Section (Connect -> Register -> Donate) */}
      <section id="how-to-use" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Start Your Journey</h2>
            <p className="text-slate-500 font-medium">Follow these simple steps to make a transparent impact.</p>
          </div>

          <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
            {/* Background Line (Desktop Only) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>

            <Step icon={<Link2 />} label="Connect Wallet" step="01" />
            <Step icon={<UserCheck />} label="Register" step="02" />
            <Step icon={<Search />} label="Explore NGOs" step="03" />
            <Step icon={<Send />} label="Donate" step="04" />
            <Step icon={<MapPin />} label="Track" step="05" />
            <Step icon={<Star />} label="Rate Impact" step="06" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">The Blockchain Advantage</h2>
            <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <StepCard icon={<Globe className="w-8 h-8"/>} title="Decentralized Identity" desc="Every NGO is assigned a unique DID on the Polygon network after strict government document verification." />
            <StepCard icon={<Lock className="w-8 h-8"/>} title="IPFS Encrypted Vault" desc="Legal documents (80G, 12A) are hashed and stored on IPFS, preventing tampering while maintaining public auditability." />
            <StepCard icon={<BarChart3 className="w-8 h-8"/>} title="Real-time Tracking" desc="Smart contracts emit events for every donation, allowing donors to track funds from their wallet to the NGO's campaign." />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="impact" className="py-24 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-center">
          <StatBox num="₹2.4M" label="Funds Secured" />
          <StatBox num="45+" label="Verified NGOs" />
          <StatBox num="10k+" label="Blockchain Logs" />
          <StatBox num="0" label="Intermediaries" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-8">About NGOChain</h2>
        <p className="text-xl text-slate-500 leading-relaxed mb-12">
          We built NGOChain to solve the 'Trust Deficit' in the social sector. By combining high-performance backend systems with Ethereum-compatible Layer 2 solutions, we provide a gateway for secure, transparent, and impactful philanthropy.
        </p>
        <div className="flex justify-center flex-wrap gap-8 md:gap-12">
          <div className="flex items-center gap-2 font-bold text-slate-800"><ShieldCheck className="text-green-500"/> Signzy Verified</div>
          <div className="flex items-center gap-2 font-bold text-slate-800"><ShieldCheck className="text-green-500"/> Polygon Secured</div>
          <div className="flex items-center gap-2 font-bold text-slate-800"><ShieldCheck className="text-green-500"/> IPFS Integrated</div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;