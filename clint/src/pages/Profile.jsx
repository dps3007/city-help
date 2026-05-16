import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/useAuth";
import { updateAvatar, updateCurrentUser } from "../services/user.service";
import SectionHeader from "../components/ui/SectionHeader";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import Button from "../components/common/Button";
import { MapPin, LogOut, Edit2, CheckCircle, Camera } from "lucide-react";
import { toast } from "react-toastify";

/* ---------------- constants ---------------- */

const DEPARTMENT_OPTIONS = [
  "GARBAGE",
  "ROADS",
  "WATER",
  "STREETLIGHT",
  "ELECTRICITY",
  "OTHER",
];

function Profile() {
  const { user, logout, updateUser } = useAuth();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    setState(user?.location?.state || "");
    setDistrict(user?.location?.district || "");
    setCity(user?.location?.city || "");
    setDepartment(user?.department || "");
  }, [user]);

  if (!user) return <p>Redirecting...</p>;

  /* ---------------- avatar update ---------------- */

  const handleUpdateAvatar = async () => {
    if (!file) return alert("Select image first");

    try {
      setLoading(true);
      const res = await updateAvatar(file);
      updateUser(res.data.user);
    } catch {
      alert("Failed to update profile photo");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- location update ---------------- */

  const handleUpdateLocation = async () => {
    if (!state.trim() || (showStateDistrict && !district.trim())) {
      alert("State and district are required for district feed");
      return;
    }

    try {
      setLoading(true);

      const res = await updateCurrentUser({
        state: state.trim(),
        district: district.trim(),
        city: city.trim(),
      });

      updateUser(res.data.user);
      alert("Location updated successfully");
    } catch {
      alert("Failed to update location");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- department update ---------------- */

  const handleUpdateDepartment = async () => {
    try {
      setLoading(true);
      const res = await updateCurrentUser({ department });
      updateUser(res.data.user);
      alert("Department updated successfully");
    } catch {
      alert("Failed to update department");
    } finally {
      setLoading(false);
    }
  };

  const canEditDepartment = ["DEPT_HEAD", "OFFICER", "WORKER"].includes(user.role);

  /* ---------------- ROLE-BASED LOCATION UI ---------------- */

  const hideLocationRoles = ["SUPER_ADMIN", "CENTRAL_ADMIN"];
  const showStateOnly = user.role === "STATE_ADMIN";
  const showStateDistrict = ["DISTRICT_ADMIN", "DEPT_HEAD", "OFFICER","CITIZEN"].includes(
    user.role
  );

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <SectionHeader
        eyebrow="Account"
        title="My Profile"
        description="Manage your personal information and preferences"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ================= MAIN COLUMN ================= */}
        <div className="space-y-6 lg:col-span-2">
          {/* AVATAR CARD */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Camera className="text-cyan-300" size={20} />
                <div>
                  <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                  <p className="text-sm text-slate-400">Upload a new profile photo</p>
                </div>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-end gap-6">
                <img
                  src={user.avatar?.url}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border border-white/10 object-cover"
                />
                <div className="flex-1 space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-full file:border-0 file:bg-cyan-500/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cyan-200 hover:file:bg-cyan-500/30"
                  />
                  <Button
                    onClick={handleUpdateAvatar}
                    disabled={loading || !file}
                    className="w-full"
                  >
                    {loading ? "Uploading..." : "Update Photo"}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* PERSONAL INFO CARD */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <InfoField label="Full Name" value={user.name} />
              <InfoField label="Email Address" value={user.email} />
              <InfoField label="Account Role" value={user.role.replace(/_/g, " ")} />
              <InfoField
                label="Member Since"
                value={dayjs(user.createdAt).format("DD MMM YYYY")}
              />
            </CardBody>
          </Card>

          {/* LOCATION CARD */}
          {!hideLocationRoles.includes(user.role) && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MapPin className="text-cyan-300" size={20} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Location</h3>
                    <p className="text-sm text-slate-400">Set your jurisdiction area</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* LOCATION DISPLAY */}
                {(state || district || city) && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-cyan-300 mb-3">
                      <CheckCircle size={16} />
                      <span className="text-xs font-semibold uppercase">Current Location</span>
                    </div>
                    <div className="space-y-1">
                      {city && <p className="text-sm text-white font-medium">{city}</p>}
                      {district && <p className="text-sm text-slate-300">{district}</p>}
                      {state && <p className="text-sm text-slate-400">{state}</p>}
                    </div>
                  </div>
                )}

                {/* LOCATION FORM */}
                <div className="space-y-3 pt-2">
                  {showStateOnly && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        State
                      </label>
                      <input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Enter your state"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                      />
                    </div>
                  )}

                  {showStateDistrict && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          State
                        </label>
                        <input
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="Enter your state"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          District
                        </label>
                        <input
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Enter your district"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          City
                        </label>
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter your city"
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                        />
                      </div>
                    </>
                  )}

                  <Button
                    onClick={handleUpdateLocation}
                    disabled={loading}
                    className="w-full mt-4"
                  >
                    {loading ? "Saving..." : "Save Location"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* DEPARTMENT CARD */}
          {canEditDepartment && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Department Assignment</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {department && (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-cyan-300 mb-2">
                      <CheckCircle size={16} />
                      <span className="text-xs font-semibold uppercase">Current Assignment</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{department}</p>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Select Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
                  >
                    <option value="">Choose a department</option>
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={handleUpdateDepartment}
                    disabled={loading || !department}
                    className="w-full mt-4"
                  >
                    {loading ? "Updating..." : "Update Department"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="space-y-6">
          {/* ACCOUNT STATUS CARD */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-white">Account Status</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-3">
                <CheckCircle className="text-green-400" size={20} />
                <div>
                  <p className="text-xs font-semibold uppercase text-green-300">Active</p>
                  <p className="text-xs text-green-200/80">Account is active</p>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Member Since</p>
                <p className="text-sm font-medium text-white">
                  {dayjs(user.createdAt).format("DD MMM YYYY")}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* LOGOUT CARD */}
          <Card>
            <CardBody>
              <Button
                onClick={logout}
                className="w-full bg-red-500/20 text-red-200 hover:bg-red-500/30"
              >
                <LogOut size={18} />
                Logout
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- helper ---------- */

function InfoField({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <span className="text-sm font-medium text-white">{value || "—"}</span>
    </div>
  );
}

export default Profile;
