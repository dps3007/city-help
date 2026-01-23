import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import DashboardLayout from "../components/layout/DashboardLayout";

import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import FileComplaint from "../pages/citizen/FileComplaint";
import MyComplaints from "../pages/citizen/MyComplaints";
import ComplaintDetail from "../pages/citizen/ComplaintDetail";
import Rewards from "../pages/citizen/Rewards";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageComplaints from "../pages/admin/ManageComplaints";
import Leaderboard from "../pages/leaderboard/Leaderboard";
import RewardHistoryPage from "../pages/citizen/RewardHistoryPage";


function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: 40, fontSize: 30 }}>
        Loading CityHelp…
      </div>
    );
  }

  return (
   <Routes>
  {!isAuthenticated ? (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </>
  ) : (
    <>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      <Route element={<DashboardLayout />}>
        {user?.role === "CITIZEN" ? (
          <>
            <Route index element={<CitizenDashboard />} />
            <Route path="complaints/new" element={<FileComplaint />} />
            <Route path="complaints" element={<MyComplaints />} />
            <Route path="complaints/:id" element={<ComplaintDetail />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="rewards/history" element={<RewardHistoryPage />} />
          </>
        ) : (
          <>
            <Route index element={<AdminDashboard />} />
            <Route path="complaints" element={<ManageComplaints />} />
            <Route path="complaints/:id" element={<ComplaintDetail />} />
          </>
        )}

        {/* ✅ LEADERBOARD – ONLY LOGGED IN */}
        <Route path="leaderboard" element={<Leaderboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )}
</Routes>

  );
}

export default App;
