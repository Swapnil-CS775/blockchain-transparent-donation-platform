import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  IndianRupee,
  Clock,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  Camera,
  CloudUpload,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import api from "../../../../services/api";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import DonationManagerData from "../../../../contracts/DonationManager.json";

const MilestoneRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [proofMetadata, setProofMetadata] = useState(null);

  useEffect(() => {
    fetchPendingMilestones();
  }, []);

  console.log("Selected proof=", selectedProof);
  useEffect(() => {
    const fetchMetadata = async () => {
      if (selectedProof?.masterIpfsHash) {
        try {
          // Fetching the JSON content from IPFS via your backend or directly
          const res = await fetch(
            `https://ipfs.io/ipfs/${selectedProof.masterIpfsHash}`,
          );
          const data = await res.json();
          console.log("fetched data = ", data);
          setProofMetadata(data);
        } catch (err) {
          console.error("Failed to fetch IPFS metadata", err);
          setProofMetadata(null);
        }
      }
    };
    fetchMetadata();
  }, [selectedProof]);

  const fetchPendingMilestones = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/milestones/pending");
      console.log("Pending Milestone Requests:", res.data);
      setRequests(res.data);
    } catch (err) {
      toast.error("FAILED TO FETCH PROOF QUEUE");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMilestone = async (request) => {
    const tId = toast.loading("RELEASING FUNDS ON BLOCKCHAIN...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS_DONATION,
        DonationManagerData.abi,
        signer,
      );

      const tx = await contract.verifyMilestone(
        request.campaign.blockchainCampaignId,
      );
      toast.loading("MINING TRANSACTION...", { id: tId });
      await tx.wait();

      await api.post(`/admin/milestones/${request.id}/verify`, {
        approve: true,
        reason: "",
        transactionHash: tx.hash,
      });

      toast.success("FUNDS RELEASED SUCCESSFULLY", { id: tId });
      setSelectedProof(null);
      fetchPendingMilestones();
    } catch (err) {
      toast.error(err.reason || "BLOCKCHAIN ERROR", { id: tId });
    }
  };

  const handleRejectMilestone = async (milestoneId) => {
    if (!rejectionReason)
      return toast.error("Please provide a rejection reason");
    const tId = toast.loading("NOTIFYING NGO OF REJECTION...");
    try {
      await api.post(`/admin/milestones/${milestoneId}/verify`, {
        approve: false,
        reason: rejectionReason,
      });
      toast.success("PROOF REJECTED", { id: tId });
      setSelectedProof(null);
      setRejectionReason("");
      fetchPendingMilestones();
    } catch (err) {
      toast.error("SYNC FAILED", { id: tId });
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center text-slate-400 animate-pulse uppercase tracking-widest font-bold">
        Accessing Proof Registry...
      </div>
    );

  return (
    <div className="space-y-6">
      {!selectedProof ? (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="p-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-300 text-center text-slate-400 font-bold uppercase">
              Queue Clear: All Proofs Verified
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-6 rounded-[2rem] border border-slate-200 flex justify-between items-center hover:border-blue-500 transition-all group shadow-sm"
              >
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Milestone
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {req.milestoneNumber}
                    </h2>
                  </div>
                  <div className="w-px h-12 bg-slate-200"></div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-tight line-clamp-1">
                      {req.campaign.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 uppercase">
                        <IndianRupee size={12} /> {req.amount}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase font-medium">
                        <Clock size={12} /> Submitted:{" "}
                        {new Date(req.submissionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProof(req)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-blue-600 transition-all uppercase tracking-widest shadow-md"
                >
                  <Eye size={16} /> Inspect Proof
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden animate-in slide-in-from-right-8 duration-300 shadow-xl">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Verifying Milestone {selectedProof.milestoneNumber}
              </p>
              <h3 className="text-xl font-bold text-slate-900 uppercase mt-1">
                {selectedProof.campaign.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedProof(null)}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="p-8 grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  NGO Impact Description
                </p>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed italic">
                  "{selectedProof.proofDescription}"
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold text-slate-400  tracking-widest">
                  Evidence Documents
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <DocumentLink
                    label="Invoice / Billing"
                    cid={proofMetadata?.invoice}
                    icon={<FileText size={18} />}
                    color="blue"
                    onClick={() =>
                      viewProofFile(proofMetadata.invoice, "Milestone Invoice")
                    }
                  />
                  <DocumentLink
                    label="Site Photos"
                    cid={proofMetadata?.photos}
                    icon={<Camera size={18} />}
                    color="purple"
                    onClick={() =>
                      viewProofFile(proofMetadata.photos, "Site Evidence")
                    }
                  />
                  <DocumentLink
                    label="Additional Docs"
                    cid={proofMetadata?.docs}
                    icon={<CloudUpload size={18} />}
                    color="orange"
                    onClick={() =>
                      viewProofFile(
                        proofMetadata.docs,
                        "Additional Documentation",
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">
                  Verification Actions
                </p>
                <textarea
                  className="w-full p-4 bg-white border border-blue-100 rounded-2xl text-sm outline-none focus:border-blue-600 transition-all h-32 shadow-sm"
                  placeholder="Provide feedback for the NGO (Required for rejection)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRejectMilestone(selectedProof.id)}
                  className="py-4 bg-white border border-red-500 text-red-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <XCircle size={16} /> Reject Proof
                </button>
                <button
                  onClick={() => handleApproveMilestone(selectedProof)}
                  className="py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  <CheckCircle size={16} /> Approve & Release
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DocumentLink = ({ label, cid, icon, color, onClick }) => {
  if (!cid) return null;

  const colorClasses = {
    blue: "border-blue-100 hover:border-blue-600 bg-blue-50 text-blue-600 group-hover:bg-blue-600",
    purple:
      "border-purple-100 hover:border-purple-600 bg-purple-50 text-purple-600 group-hover:bg-purple-600",
    orange:
      "border-orange-100 hover:border-orange-600 bg-orange-50 text-orange-600 group-hover:bg-orange-600",
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white border rounded-2xl transition-all group shadow-sm ${selectedColor.split(" ")[0]} ${selectedColor.split(" ")[1]}`}
    >
      <div className="flex items-center gap-4 text-left">
        <div
          className={`p-2.5 rounded-xl group-hover:text-white transition-colors ${selectedColor.split(" ")[2]} ${selectedColor.split(" ")[3]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-900 uppercase">
            {label}
          </p>
          <p className="text-[9px] font-mono text-slate-400 truncate w-40">
            {cid}
          </p>
        </div>
      </div>
      <Eye
        className="text-slate-300 group-hover:text-slate-900 transition-colors"
        size={18}
      />
    </button>
  );
};

const viewProofFile = async (cid, label) => {
  if (!cid) return toast.error("File not found");

  const tId = toast.loading(`OPENING ${label}...`);
  try {
    // 1. Fetch the file from IPFS Gateway
    const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
    const blob = await response.blob();

    // 2. Create a local URL for the blob
    const fileUrl = URL.createObjectURL(blob);

    // 3. Open in new tab using your iframe logic
    const win = window.open();
    if (!win) throw new Error("Popup blocked! Please allow popups.");

    win.document.title = label;
    win.document.write(
      `<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`,
    );

    toast.dismiss(tId);
  } catch (err) {
    toast.error("GATEWAY TIMEOUT: Try again in a moment", { id: tId });
    console.error(err);
  }
};

export default MilestoneRequests;
