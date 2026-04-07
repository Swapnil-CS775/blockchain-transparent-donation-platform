import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Import for professional notifications
import { useAuthStore } from "./store/authStore.js";
import api from "./services/api.js";
import { useEffect } from "react";

// Importing all the necessary components and pages
import RootLayout from "./common/layouts/RootLayout";
import LandingPage from "./features/public/LandingPage";
import RoleSelection from "./features/auth/RoleSelection";
import DonorOnboarding from "./features/auth/DonorOnboarding";
import NgoOnboarding from "./features/auth/NgoOnboarding";

// NGO Dashboard Imports
import DashboardLayout from "./features/ngo/components/DashboardLayout";
import NgoDashboardHome from "./features/ngo/pages/NgoDashboardHome";
import ProfileModule from "./features/ngo/pages/ProfileModule";
import CampaignModule from "./features/ngo/pages/CampaignModule";
import MilestoneModule from "./features/ngo/pages/MilestoneModule";
import NgoDonations from "./features/ngo/pages/DonationModule";
import ReputationModule from "./features/ngo/pages/ReputationModule";

// Admin Dashboard Imports
import AdminDashboard from "./features/ngo/pages/admin/AdminDashboard";
import NgoVerification from "./features/ngo/pages/admin/NgoVerification";
import MilestoneRequests from "./features/ngo/pages/admin/MilestoneRequests";
import ManageVerifiers from "./features/ngo/pages/admin/ManageVerifiers";

//donor dashboard imports
import DonorDashboard from "./features/ngo/pages/donor/dashboard/DonorDashboard.jsx";
import ExploreNGOs from "./features/ngo/pages/donor/explore/ExploreNGOs.jsx";
import NgoDetails from "./features/ngo/pages/donor/explore/NgoDetails.jsx";
import ExploreCampaigns from "./features/ngo/pages/donor/explore/ExploreCampaigns.jsx";
import MyDonations from "./features/ngo/pages/donor/components/MyDonations.jsx";
import ReputationBadge from "./features/ngo/pages/donor/components/ReputationBadge.jsx";
import LedgerModule from "./features/ngo/pages/donor/components/Ledger.jsx";

function App() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);
  
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "0px", // Sharp corners as requested
            padding: "16px 24px",
            fontWeight: "500", // Black font weight for readability
            fontSize: "13px",
            marginTop: "45px",
            minWidth: "350px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
          // Faint Green with Solid Green Border
          success: {
            duration: 4000,
            style: {
              background: "#f0fdf4", // Faint Green
              color: "#166534", // Dark Green text
              border: "1px solid #bbf7d0",
              borderLeft: "6px solid #22c55e", // Solid Green highlight
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "#f0fdf4",
            },
          },
          // Faint Red with Solid Red Border
          error: {
            duration: 4000,
            style: {
              background: "#fef2f2", // Faint Red
              color: "#991b1b", // Dark Red text
              border: "1px solid #fecaca",
              borderLeft: "6px solid #ef4444", // Solid Red highlight
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fef2f2",
            },
          },
          // Loading State
          loading: {
            style: {
              background: "#f8fafc", // Faint Slate
              color: "#1e293b",
              border: "1px solid #e2e8f0",
              borderLeft: "6px solid #64748b",
            },
          },
        }}
      />
      <RootLayout>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth & Role Selection Flow */}
          <Route path="/select-role" element={<RoleSelection />} />

          {/* Onboarding Routes */}
          <Route path="/onboard/ngo" element={<NgoOnboarding />} />
          <Route path="/onboard/donor" element={<DonorOnboarding />} />

          {/* ---NGO DASHBOARD NESTED ROUTES --- */}
          {/* The DashboardLayout contains the Sidebar and the Right Panel shell */}
          <Route path="/ngo-dashboard" element={<DashboardLayout />}>
            <Route index element={<NgoDashboardHome />} />
            <Route path="profile" element={<ProfileModule />} />
            <Route path="campaigns" element={<CampaignModule />} />
            <Route path="milestones" element={<MilestoneModule />} />
            <Route path="donations" element={<NgoDonations />} />
            <Route path="reputation" element={<ReputationModule />} />
          </Route>

          {/* ---ADMIN DASHBOARD NESTED ROUTES --- */}
          <Route path="/admin" element={<AdminDashboard />}>
            {/* The index route handles what shows up at "/admin"*/}
            <Route index element={<NgoVerification />} />
            <Route path="ngos" element={<NgoVerification />} />
            <Route path="milestones" element={<MilestoneRequests />} />
            <Route path="verifiers" element={<ManageVerifiers />} />
          </Route>

          {/* ---DONOR DASHBOARD NESTED ROUTES --- */}
          <Route path="/donor" element={<DonorDashboard />}>
            <Route index element={<ExploreNGOs />} />
            <Route path="campaigns" element={<ExploreCampaigns />} />
            <Route path="explore" element={<ExploreNGOs />} />
            <Route path="ngo/:id" element={<NgoDetails />} />
            <Route path="history" element={<MyDonations />} />
            <Route path="stats" element={<ReputationBadge />} />
            <Route path="ledger" element={<LedgerModule />} />
          </Route>
        </Routes>
      </RootLayout>
    </Router>
  );
}

export default App;
