import React from 'react';
import { Heart, Building2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Choose Your Path</h1>
          <p className="text-slate-500 font-medium">How would you like to use NGOChain?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Donor Option */}
          <div 
            onClick={() => navigate('/onboard/donor')}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 cursor-pointer hover:border-blue-600 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <Heart className="text-blue-600 group-hover:text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">I am a Donor</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">I want to support verified causes and track my impact on the blockchain.</p>
            <div className="flex items-center text-blue-600 font-black text-sm gap-2">
              Select Donor <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* NGO Option */}
          <div 
            onClick={() => navigate('/onboard/ngo')}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 cursor-pointer hover:border-blue-600 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
              <Building2 className="text-green-600 group-hover:text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">I am an NGO</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">I want to list my organization, verify my documents via IPFS, and raise funds.</p>
            <div className="flex items-center text-green-600 font-black text-sm gap-2">
              Select NGO <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;