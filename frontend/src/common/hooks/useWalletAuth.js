import api from "../../services/api.js";
import { useAuthStore } from "../../store/authStore.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const useWalletAuth = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const loginWithWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("PLEASE INSTALL METAMASK!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];

      // 1. Get Nonce
      const { data: message } = await api.post("/auth/nonce", { walletAddress });

      // 2. Sign Message
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });

      // 3. Verify Signature & Get Role
      const { data: response } = await api.post("/auth/verify", {
        walletAddress,
        signature,
      });

      // Since response is now { token: "...", role: "..." }
      const token = response.token;
      const roleFromServer = response.role;
      const onboardingStatus = response.onboardingStatus || "PENDING"; // Default to PENDING if not provided
      
      setAuth(token, roleFromServer, walletAddress); 
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      toast.success(
        `CONNECTED: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      );

      if (roleFromServer === "NGO") {
          if (onboardingStatus ==="DRAFT"){
              navigate("/ngo-onboarding"); 
          } else if (onboardingStatus === "SUBMITTED") {
              navigate("/ngo-dashboard/profile"); 
          } else {
              navigate("/ngo-dashboard");
          }
      } else if (roleFromServer === "DONOR") {
          navigate("/donor"); 
      } else if(roleFromServer === "SUPER_ADMIN" || roleFromServer === "VERIFIER") {
          navigate("/admin");
      } else {
          navigate("/select-role"); // Default fallback
      }

      return true;
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      toast.error(errorMsg.toString().toUpperCase());
      return false;
    }
  };

  return { loginWithWallet };
};