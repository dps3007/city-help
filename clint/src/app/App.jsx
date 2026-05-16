import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { ToastContainer } from "react-toastify";

// Public pages
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Layout
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
import DistrictFeed from "../pages/feed/DistrictFeed";

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="surface max-w-md px-8 py-10 text-center">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600" />
          <h1 className="mt-5 text-2xl font-semibold text-white">Loading CityHelp</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Preparing your civic workspace, notifications, and complaint context.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2800}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />

      <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      {!isAuthenticated && (
        <>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}

      {/* ================= PROTECTED ROUTES ================= */}
      {isAuthenticated && (
        <>
          {/* block public auth pages */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />

          {/* ================= COMMON DASHBOARD LAYOUT ================= */}
          <Route element={<DashboardLayout />}>
            {/* ROOT */}
            <Route
              path="/"
              element={
                user.role === "CITIZEN" ? (
                  <CitizenDashboard />
                ) : (
                  <Navigate to="/admin/dashboard" replace />
                )
              }
            />

            {/* COMMON */}
            <Route path="complaints/:id" element={<ComplaintDetail />} />
            <Route path="feed" element={<DistrictFeed />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />

            {/* ================= CITIZEN ================= */}
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
          </Route>

          {/* ================= ADMIN ================= */}
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
    </>
  );
}

export default App;
