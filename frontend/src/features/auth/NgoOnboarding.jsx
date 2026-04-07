import React, { useState,useEffect } from "react";
import NGORegistrationData from "../../contracts/NGORegistration.json";

import {
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Building,
  Users,
  CheckCircle,
  MapPin,
  Landmark,
  Plus,
  Trash2,
  CheckCircle2,
  Scale,
  Upload,
  FileCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { ethers } from "ethers";

const NgoOnboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const checkExistingDraft = async () => {
    try {
      // Create a new endpoint: GET /api/profile/ngo/my-draft
      const response = await api.get('/profile/ngo/my-draft'); 
      if (response.data) {
        // If they already have a profile, skip to stakeholders!
        setFormData(response.data); // Pre-fill their basic info
        setIsNgoVerified(true);
        setStep(4); 
        toast.success("RESUMING YOUR SAVED DRAFT");
      }
    } catch (err) {
      // If 404, it means they are a new user. No action needed.
    }
  };
  checkExistingDraft();
}, []);

  // 1. NGO Basic & Legal Data State
  const [formData, setFormData] = useState({
    ngoName: "",
    panNumber: "",
    contactEmail: "",
    contactPhone: "",
    registeredAddress: "",
    state: "",
    district: "",
    pinCode: "",
    registrationType: "",
    registrationNumber: "",
    incorporationDate: "",
    eightyGNumber: "",
    eightyGValidityDate: "",
    twelveANumber: "",
  });

  // 2. File State (Stores CID after upload)
  const [cids, setCids] = useState({
    registrationCertificateCid: "",
    eightyGCertificateCid: "",
    twelveACertificateCid: "",
  });

  // Local state to track selected file names for UI placeholder
  const [selectedFiles, setSelectedFiles] = useState({
    reg: null,
    eighty: null,
    twelve: null,
  });

  const [isNgoVerified, setIsNgoVerified] = useState(false);
  const [ngoVerifying, setNgoVerifying] = useState(false);

  // 3. Stakeholders State
  const [stakeholders, setStakeholders] = useState([
    {
      id: Date.now(),
      fullName: "",
      designation: "",
      panNumber: "",
      email: "",
      phone: "",
      isVerified: false,
    },
  ]);

  // --- VALIDATION LOGIC ---
  const validateStep = () => {
    if (step === 1) {
      if (
        !formData.ngoName ||
        !formData.panNumber ||
        !formData.contactEmail ||
        !formData.contactPhone
      ) {
        toast.error("PLEASE FILL ALL BASIC INFO FIELDS");
        return false;
      }
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
        toast.error("INVALID PAN FORMAT");
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
        toast.error("INVALID EMAIL FORMAT");
        return false;
      }
    }
    if (step === 2) {
      if (
        !formData.registeredAddress ||
        !formData.state ||
        !formData.district ||
        !formData.pinCode
      ) {
        toast.error("LOCATION DETAILS INCOMPLETE");
        return false;
      }
      if (!/^\d{6}$/.test(formData.pinCode)) {
        toast.error("INVALID PIN CODE (6 DIGITS)");
        return false;
      }
    }
    if (step === 3) {
      if (!cids.registrationCertificateCid || !cids.eightyGCertificateCid) {
        toast.error("PLEASE UPLOAD REQUIRED CERTIFICATES TO IPFS FIRST");
        return false;
      }
    }
    return true;
  };

  // --- API HANDLERS ---

  const handleFileUpload = async (file, field, cidKey) => {
    if (!file) return;
    const tId = toast.loading(`UPLOADING ${field.toUpperCase()}...`);
    const data = new FormData();
    data.append("file", file);

    try {
      const response = await api.post("/files/upload", data);
      setCids((prev) => ({ ...prev, [cidKey]: response.data }));
      toast.success(`${field.toUpperCase()} UPLOADED TO IPFS`, { id: tId });
    } catch (err) {
      toast.error("UPLOAD FAILED. CHECK SERVER.", { id: tId });
    }
  };

  const handleVerifyNgoPan = async () => {
    if (!formData.panNumber || !formData.ngoName) {
      toast.error("PLEASE ENTER NGO NAME AND PAN");
      return;
    }
    const tId = toast.loading("VERIFYING NGO PAN...");
    setNgoVerifying(true);
    try {
      await api.post("/profile/ngo/verify-pan", {
        fullName: formData.ngoName,
        panNumber: formData.panNumber,
      });
      setIsNgoVerified(true);
      toast.success("NGO PAN VERIFIED!", { id: tId });
    } catch (err) {
      toast.error(err.response?.data || "VERIFICATION FAILED", { id: tId });
    } finally {
      setNgoVerifying(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    const tId = toast.loading("PERSISTING NGO DATA...");

    // Combine formData and CIDs
    const finalPayload = { ...formData, ...cids };

    try {
      const response = await api.post("/profile/ngo/register", finalPayload);

      // TOKEN SWAP
      const newToken = response.data;
      if (newToken && typeof newToken === "string") {
        localStorage.setItem("token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      }

      toast.success("NGO REGISTERED SUCCESSFULLY", { id: tId });
      setStep(4);
    } catch (err) {
      toast.error("REGISTRATION FAILED", { id: tId });
    } finally {
      setLoading(false);
    }
  };

  // Step 4 Stakeholder handlers remain similar but added validation
  const verifyStakeholderPan = async (index) => {
    const s = stakeholders[index];
    if (!s.panNumber || !s.fullName) {
      toast.error("ENTER NAME AND PAN");
      return;
    }
    const tId = toast.loading("VERIFYING...");
    try {
      const res=await api.post("/profile/ngo/stakeholder/verify-pan", {
        fullName: s.fullName,
        panNumber: s.panNumber,
      });
      console.error("Stakeholder PAN verification response:", res);
      const updated = [...stakeholders];
      updated[index].isVerified = true;
      setStakeholders(updated);
      toast.success("VERIFIED", { id: tId });
    } catch (err) {
      toast.error("VERIFICATION FAILED", { id: tId });
    }
  };

  const saveStakeholderToDb = async (index) => {
    const s = stakeholders[index];
    if (!s.email || !s.phone) {
      toast.error("EMAIL & PHONE REQUIRED");
      return;
    }
    try {
      await api.post("/profile/ngo/stakeholder", s);
      toast.success("STAKEHOLDER SAVED");
    } catch (err) {
      toast.error("SAVE FAILED");
    }
  };

  const finalizeOnboarding = async () => {
    setLoading(true);
    const tId = toast.loading("GENERATING MASTER CID...");
    
    try {
      // 1. Get CID from Backend
      const response = await api.post(`/profile/ngo/final-submit?termsAccepted=true`);
      const masterCid = response.data;

      let txHash;

      // 2. Mock vs Production Logic
      if (import.meta.env.VITE_ENABLE_MOCK_BLOCKCHAIN === 'true') {
        toast.loading("MOCK MODE: GENERATING FAKE HASH...", { id: tId });
        await new Promise(resolve => setTimeout(resolve, 1000));
        txHash = "0x" + Math.random().toString(16).slice(2, 66).padEnd(64, '0');
      } else {
        // ETHERS V5 SYNTAX FIX
        if (!window.ethereum) throw new Error("PLEASE INSTALL METAMASK");

        // Use Web3Provider instead of BrowserProvider for v5
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Request accounts if not connected
        await provider.send("eth_requestAccounts", []);
        
        const signer = provider.getSigner();
        
        const contract = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_ADDRESS_REGISTRY, 
          NGORegistrationData.abi,
          signer
        );
        
        toast.loading("CONFIRM IN METAMASK...", { id: tId });
        const tx = await contract.applyAsNGO(masterCid);
        
        toast.loading("WAITING FOR BLOCK CONFIRMATION...", { id: tId });
        const receipt = await tx.wait();
        txHash = receipt.transactionHash; // In v5 it is transactionHash, not hash
      }

      // 3. Confirm to Backend
      await api.post('/profile/ngo/confirm-application', { 
          transactionHash: txHash 
      });

      toast.success("NGO ONBOARDED ON-CHAIN!", { id: tId });
      navigate('/ngo-dashboard');
    } catch (err) {
      console.error("Blockchain Error:", err);
      toast.error(err.message || "SUBMISSION FAILED", { id: tId });
    } finally {
      setLoading(false);
    }
  };

  const addStakeholder = () => {
    if (stakeholders.length < 5) {
      setStakeholders([
        ...stakeholders,
        {
          id: Date.now(),
          fullName: "",
          designation: "",
          panNumber: "",
          email: "",
          phone: "",
          isVerified: false,
        },
      ]);
    }
  };

  const updateStakeholder = (index, field, value) => {
    const updated = [...stakeholders];
    updated[index][field] = value;
    setStakeholders(updated);
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-100 px-4 pb-20 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/select-role")}
          className="group flex items-center gap-2 text-slate-700 font-bold mb-8 hover:text-blue-700 transition cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Exit to Selection
        </button>

        <div className="flex justify-between mb-12 relative px-4">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-300 z-0"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step >= i ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-500 border-2 border-slate-300"}`}
            >
              {step > i ? <Check size={18} strokeWidth={4} /> : i}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-200 min-h-[550px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Building className="text-blue-600" size={28} />
                <h2 className="text-3xl font-black tracking-tight">
                  NGO Basic Info
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup
                  label="NGO Name"
                  value={formData.ngoName}
                  onChange={(e) =>
                    setFormData({ ...formData, ngoName: e.target.value })
                  }
                  placeholder="Legal Name"
                />
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <InputGroup
                      label="PAN Number"
                      value={formData.panNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, panNumber: e.target.value })
                      }
                      placeholder="ABCDE1234F"
                    />
                  </div>
                  <button
                    onClick={handleVerifyNgoPan}
                    className={`px-6 h-[58px] rounded-2xl font-black text-xs transition-all ${isNgoVerified ? "bg-green-600 text-white" : "bg-slate-900 text-white hover:bg-black active:scale-95"}`}
                  >
                    {isNgoVerified ? <CheckCircle2 size={18} /> : "VERIFY"}
                  </button>
                </div>
                <InputGroup
                  label="Contact Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  placeholder="ngo@example.com"
                />
                <InputGroup
                  label="Contact Phone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  placeholder="10 Digit Number"
                />
              </div>
              <button
                onClick={() =>
                  validateStep() && isNgoVerified
                    ? setStep(2)
                    : !isNgoVerified && toast.error("VERIFY PAN FIRST")
                }
                className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition shadow-xl ${isNgoVerified ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              >
                Continue <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <MapPin className="text-blue-600" size={28} />
                <h2 className="text-3xl font-black tracking-tight">
                  Location Details
                </h2>
              </div>
              <InputGroup
                label="Registered Address"
                value={formData.registeredAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registeredAddress: e.target.value,
                  })
                }
                placeholder="Full Office Address"
              />
              <div className="grid md:grid-cols-3 gap-4">
                <InputGroup
                  label="State"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="State"
                />
                <InputGroup
                  label="District"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  placeholder="District"
                />
                <InputGroup
                  label="Pin Code"
                  value={formData.pinCode}
                  onChange={(e) =>
                    setFormData({ ...formData, pinCode: e.target.value })
                  }
                  placeholder="6 Digits"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-100 py-5 rounded-2xl font-black border border-slate-200"
                >
                  Back
                </button>
                <button
                  onClick={() => validateStep() && setStep(3)}
                  className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Landmark className="text-blue-600" size={28} />
                <h2 className="text-3xl font-black tracking-tight">
                  Legal & Tax
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <InputGroup
                  label="Registration Type"
                  value={formData.registrationType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationType: e.target.value,
                    })
                  }
                  placeholder="TRUST / SOCIETY"
                />
                <InputGroup
                  label="Registration No"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationNumber: e.target.value,
                    })
                  }
                  placeholder="Reg/123/XYZ"
                />
                <InputGroup
                  label="80G Number"
                  value={formData.eightyGNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, eightyGNumber: e.target.value })
                  }
                  placeholder="80G-XXXXX"
                />
                <InputGroup
                  label="12A Number"
                  value={formData.twelveANumber}
                  onChange={(e) =>
                    setFormData({ ...formData, twelveANumber: e.target.value })
                  }
                  placeholder="12A-XXXXX"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <FileInput
                  label="Reg. Certificate"
                  fileName={selectedFiles.reg?.name}
                  cid={cids.registrationCertificateCid}
                  onFileSelect={(file) =>
                    setSelectedFiles({ ...selectedFiles, reg: file })
                  }
                  onUpload={() =>
                    handleFileUpload(
                      selectedFiles.reg,
                      "Registration",
                      "registrationCertificateCid",
                    )
                  }
                />
                <FileInput
                  label="80G Form"
                  fileName={selectedFiles.eighty?.name}
                  cid={cids.eightyGCertificateCid}
                  onFileSelect={(file) =>
                    setSelectedFiles({ ...selectedFiles, eighty: file })
                  }
                  onUpload={() =>
                    handleFileUpload(
                      selectedFiles.eighty,
                      "80G Certificate",
                      "eightyGCertificateCid",
                    )
                  }
                />
                <FileInput
                  label="12A Form"
                  fileName={selectedFiles.twelve?.name}
                  cid={cids.twelveACertificateCid}
                  onFileSelect={(file) =>
                    setSelectedFiles({ ...selectedFiles, twelve: file })
                  }
                  onUpload={() =>
                    handleFileUpload(
                      selectedFiles.twelve,
                      "12A Certificate",
                      "twelveACertificateCid",
                    )
                  }
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-slate-100 py-5 rounded-2xl font-black border border-slate-200"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Final Register & Continue"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <Users className="text-blue-600" size={28} />
                  <h2 className="text-3xl font-black text-slate-900">
                    Stakeholders
                  </h2>
                </div>
                <button
                  onClick={addStakeholder}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 shadow-md hover:bg-blue-700 transition"
                >
                  <Plus size={14} strokeWidth={3} /> Add More
                </button>
              </div>
              <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {stakeholders.map((s, idx) => (
                  <div
                    key={s.id}
                    className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-200 relative group animate-in zoom-in-95"
                  >
                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase absolute -top-3 left-8 shadow-lg">
                      Member #{idx + 1}
                    </span>
                    <div className="grid md:grid-cols-2 gap-6 mt-2">
                      <InputGroup
                        label="Full Name"
                        value={s.fullName}
                        onChange={(e) =>
                          updateStakeholder(idx, "fullName", e.target.value)
                        }
                        placeholder="Signatory Name"
                      />
                      <InputGroup
                        label="Designation"
                        value={s.designation}
                        onChange={(e) =>
                          updateStakeholder(idx, "designation", e.target.value)
                        }
                        placeholder="Trustee / Director"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                      <InputGroup
                        label="Email"
                        type="email"
                        value={s.email}
                        onChange={(e) =>
                          updateStakeholder(idx, "email", e.target.value)
                        }
                        placeholder="email@example.com"
                      />
                      <InputGroup
                        label="Phone"
                        type="tel"
                        value={s.phone}
                        onChange={(e) =>
                          updateStakeholder(idx, "phone", e.target.value)
                        }
                        placeholder="10 Digit Number"
                      />
                    </div>
                    <div className="mt-4 flex gap-3 items-end">
                      <div className="flex-1">
                        <InputGroup
                          label="Stakeholder PAN"
                          value={s.panNumber}
                          onChange={(e) =>
                            updateStakeholder(idx, "panNumber", e.target.value)
                          }
                          placeholder="ABCDE1234F"
                        />
                      </div>
                      <button
                        onClick={() => verifyStakeholderPan(idx)}
                        className={`px-8 h-[52px] rounded-2xl font-black text-xs transition-all shadow-md ${s.isVerified ? "bg-green-600 text-white" : "bg-slate-900 text-white hover:bg-black active:scale-95"}`}
                      >
                        {s.isVerified ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={18} /> Verified
                          </span>
                        ) : (
                          "Verify PAN"
                        )}
                      </button>
                      {s.isVerified && (
                        <button
                          onClick={() => saveStakeholderToDb(idx)}
                          className="h-[52px] px-4 bg-blue-100 text-blue-700 rounded-2xl font-bold text-[10px] uppercase"
                        >
                          Save to DB
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 border-t border-slate-100 pt-6">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-slate-100 py-5 rounded-2xl font-black border border-slate-200"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl"
                >
                  Review & Terms
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Scale className="text-blue-600" size={28} />
                <h2 className="text-3xl font-black tracking-tight">
                  Legal Agreement
                </h2>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 max-h-[300px] overflow-y-auto text-slate-700 font-medium text-sm leading-relaxed overflow-x-hidden">
                <h4 className="font-black text-slate-900 mb-4 text-lg">
                  Terms & Conditions (v1.0)
                </h4>
                <p className="mb-4">
                  All donation data is immutable on the Polygon blockchain.
                </p>
              </div>
              <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-6 h-6 rounded-lg cursor-pointer accent-blue-600"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-bold text-slate-800 cursor-pointer"
                >
                  I accept the Terms & Conditions.
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-slate-100 py-5 rounded-2xl font-black border border-slate-200"
                >
                  Back
                </button>
                <button
                  onClick={finalizeOnboarding}
                  disabled={!termsAccepted || loading}
                  className="flex-[2] bg-slate-950 text-white py-5 rounded-2xl font-black text-lg shadow-2xl disabled:bg-slate-300 transition-all flex items-center justify-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Sign & Finalize Application"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="space-y-1 text-left">
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-4 tracking-widest">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium text-slate-900"
    />
  </div>
);

const FileInput = ({ label, onFileSelect, onUpload, fileName, cid }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
      {label}
    </label>
    <div
      className={`p-4 border-2 border-dashed rounded-2xl text-center transition-all ${cid ? "border-green-500 bg-green-50" : "border-slate-300 bg-white"}`}
    >
      {!cid ? (
        <div className="flex flex-col items-center gap-2">
          <label className="cursor-pointer flex flex-col items-center gap-1">
            <input
              type="file"
              className="hidden"
              onChange={(e) => onFileSelect(e.target.files[0])}
            />
            <Upload className="text-slate-400" size={20} />
            <span className="text-[10px] font-black text-slate-500 uppercase">
              {fileName ? fileName : "SELECT PDF"}
            </span>
          </label>
          {fileName && (
            <button
              onClick={onUpload}
              className="mt-2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              UPLOAD TO IPFS
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 text-green-600">
          <FileCheck size={24} />
          <span className="text-[9px] font-black uppercase">
            CID: {cid.slice(0, 10)}...
          </span>
        </div>
      )}
    </div>
  </div>
);

export default NgoOnboarding;
