import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import DashboardLayout from "../components/layout/DashboardLayout";

// Citizen
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import FileComplaint from "../pages/citizen/FileComplaint";
import MyComplaints from "../pages/citizen/MyComplaints";
import ComplaintDetail from "../pages/citizen/ComplaintDetail";
import Rewards from "../pages/citizen/Rewards";
import RewardHistoryPage from "../pages/citizen/RewardHistoryPage";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageComplaints from "../pages/admin/ManageComplaints";
import AdminUsers from "../pages/admin/AdminUsers";

// Common
import Leaderboard from "../pages/leaderboard/Leaderboard";
import Profile from "../pages/Profile";


function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <div style={{ padding: 40 }}>Loading CityHelp…</div>;

  return (
    <Routes>
      {/* ================= NOT AUTHENTICATED ================= */}
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          {/* block auth pages */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />

          {/* ================= COMMON LAYOUT ================= */}
          <Route element={<DashboardLayout />}>
            {/* ROOT DASHBOARD */}
            <Route
              index
              element={
                user.role === "CITIZEN" ? (
                  <CitizenDashboard />
                ) : (
                  <Navigate to="/admin/dashboard" replace />
                )
              }
            />

            {/* 🔥 COMMON COMPLAINT DETAIL (CITIZEN + ADMIN) */}
            <Route path="complaints/:id" element={<ComplaintDetail />} />

            {/* ================= CITIZEN ROUTES ================= */}
            {user.role === "CITIZEN" && (
              <>
                <Route path="complaints/new" element={<FileComplaint />} />
                <Route path="complaints" element={<MyComplaints />} />
                <Route path="rewards" element={<Rewards />} />
                <Route
                  path="rewards/history"
                  element={<RewardHistoryPage />}
                />
              </>
            )}

            {/* ================= COMMON ================= */}
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />

          </Route>

          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="complaints" element={<ManageComplaints />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;
