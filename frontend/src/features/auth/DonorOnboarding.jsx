import React, { useState } from "react";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Scale,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast"; //

const DonorOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isPanVerified, setIsPanVerified] = useState(false);
  const [verifyingPan, setVerifyingPan] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // State for DTO mapping
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "India",
    panNumber: "",
  });

  // ... inside DonorOnboarding component
  const handleVerifyPan = async () => {
    if (!formData.panNumber || !formData.fullName) {
      toast.error("PLEASE ENTER FULL NAME AND PAN NUMBER FIRST");
      return;
    }

    // 1. Initialize the loading toast (Slate/Black background)
    const toastId = toast.loading("VERIFYING PAN WITH INCOME TAX DEPT...");

    setVerifyingPan(true);
    try {
      const response = await api.post("/profile/donor/verify-pan", {
        panNumber: formData.panNumber,
        fullName: formData.fullName,
      });

      if (response.status === 200) {
        // 2. Update the SAME toast to Success (Green background)
        toast.success("PAN VERIFIED SUCCESSFULLY!", { id: toastId });
        setIsPanVerified(true);
      }
    } catch (err) {
      // 3. Update the SAME toast to Error (Red background)
      const errorMsg = err.response?.data || "INVALID PAN DETAILS";
      console.error("errormsg=", errorMsg);
      toast.error(errorMsg.toUpperCase(), { id: toastId });
      setIsPanVerified(false);
    } finally {
      setVerifyingPan(false);
    }
  };

  // Handle Final Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Safety check
    if (!isPanVerified || !termsAccepted) {
      toast.error("PLEASE VERIFY PAN AND ACCEPT TERMS FIRST");
      return;
    }

    // 2. Initialize the loading toast (Slate/Black background)
    const toastId = toast.loading("CREATING YOUR SECURE DONOR PROFILE...");

    setLoading(true);
    try {
      // 3. Hits @PostMapping("/register") with full DTO
      const response = await api.post("/profile/donor/register", {
        ...formData,
        termsAccepted: termsAccepted,
      });

      // 4. Handle the new Token from backend
      const newToken = response.data;
      localStorage.setItem("token", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      // 5. Success Notification (Green & Sharp)
      toast.success("REGISTRATION COMPLETE! WELCOME TO NGO CHAIN.", {
        id: toastId,
      });

      // 6. Navigate to marketplace
      navigate("/donor"); 
    } catch (err) {
      // 7. Error Notification (Red & Sharp)
      const errorMsg =
        err.response?.data || "REGISTRATION FAILED. PLEASE TRY AGAIN.";
        console.error("error msg=", errorMsg);
      toast.error(errorMsg.toUpperCase(), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-slate-100 px-4 pb-12 font-sans text-slate-900">
      <div className="max-w-md mx-auto">
        {/* GLOBAL BACK BUTTON */}
        <button
          onClick={() => navigate("/select-role")}
          className="group flex items-center gap-2 text-slate-700 font-bold mb-6 hover:text-blue-700 transition cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Selection
        </button>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-200">
          <div className="text-center mb-8 border-b border-slate-100 pb-6">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Donor KYC</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputGroup
              label="Full Name"
              placeholder="As per PAN card"
              value={formData.fullName}
              onChange={(v) => setFormData({ ...formData, fullName: v })}
            />

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-4 tracking-widest">
                PAN Number
              </label>
              <div className="relative flex gap-2">
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  className="flex-1 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 font-black text-slate-900 uppercase"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      panNumber: e.target.value.toUpperCase(),
                    });
                    setIsPanVerified(false); // Reset verification if input changes
                  }}
                />
                <button
                  type="button"
                  onClick={handleVerifyPan}
                  disabled={verifyingPan || isPanVerified}
                  className={`px-4 rounded-xl font-black text-[10px] transition-all shadow-md ${isPanVerified ? "bg-green-600 text-white" : "bg-slate-900 text-white active:scale-95"}`}
                >
                  {verifyingPan ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : isPanVerified ? (
                    "VERIFIED"
                  ) : (
                    "VERIFY"
                  )}
                </button>
              </div>
            </div>

            <InputGroup
              label="Email Address"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(v) => setFormData({ ...formData, email: v })}
            />

            {/* TERMS AND CONDITIONS CHECKBOX */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <input
                type="checkbox"
                id="donorTerms"
                className="w-5 h-5 mt-0.5 cursor-pointer accent-blue-600"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label
                htmlFor="donorTerms"
                className="text-xs font-bold text-slate-800 cursor-pointer leading-tight"
              >
                I agree to the{" "}
                <span className="text-blue-600 hover:underline cursor-pointer">
                  Terms & Conditions
                </span>{" "}
                and authorize the digital signing of my profile.
              </label>
            </div>

            <button
              type="submit"
              disabled={!isPanVerified || !termsAccepted || loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-xl mt-4 disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Complete Registration <ArrowRight size={22} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Refined Typography
const InputGroup = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="space-y-1 text-left">
    <label className="text-[10px] font-bold text-slate-700 uppercase ml-4 tracking-widest">
      {label}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-black text-slate-900 placeholder:text-slate-400"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default DonorOnboarding;
