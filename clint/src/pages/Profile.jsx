import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { updateAvatar, updateCurrentUser } from "../services/user.service";

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
    } catch (err) {
      alert("Failed to update profile photo");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- location update ---------------- */

  const handleUpdateLocation = async () => {
    try {
      setLoading(true);

      const res = await updateCurrentUser({
        state,
        district,
        city,
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

  const hideLocationRoles = ["CITIZEN", "SUPER_ADMIN", "CENTRAL_ADMIN"];
  const showStateOnly = user.role === "STATE_ADMIN";
  const showStateDistrict = ["DISTRICT_ADMIN", "DEPT_HEAD", "OFFICER"].includes(
    user.role
  );

  return (
    <div className="max-w-xl mx-auto space-y-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 rounded-xl shadow-sm">

      {/* HEADER */}
      <h2 className="text-xl font-semibold text-gray-800">
        My Profile
      </h2>

      {/* ---------------- Avatar ---------------- */}
      <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow">
        <img
          src={user.avatar?.url}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border"
        />

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm"
          />

          <button
            onClick={handleUpdateAvatar}
            disabled={loading}
            className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600
                       text-white px-4 py-1.5 rounded-full text-sm
                       hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Change Photo"}
          </button>
        </div>
      </div>

      {/* ---------------- Info ---------------- */}
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <Field label="Name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="Role" value={user.role.replace("_", " ")} />

        {canEditDepartment && (
          <div className="space-y-2 pt-2">
            <label className="text-sm text-gray-500">
              Department
            </label>

            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg text-sm"
            >
              <option value="">Select Department</option>
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <button
              onClick={handleUpdateDepartment}
              disabled={loading || !department}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm
                         hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Department"}
            </button>
          </div>
        )}

        <Field
          label="Joined On"
          value={dayjs(user.createdAt).format("DD MMM YYYY")}
        />
      </div>

      {/* ---------------- Location (ROLE RULES APPLIED) ---------------- */}
      {!hideLocationRoles.includes(user.role) && (
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <h3 className="font-medium text-gray-700">
            Location Access
          </h3>

          {/* STATE ADMIN → STATE ONLY */}
          {showStateOnly && (
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              className="w-full border px-3 py-2 rounded-lg text-sm"
            />
          )}

          {/* DISTRICT ADMIN / DEPT HEAD / OFFICER → STATE + DISTRICT */}
          {showStateDistrict && (
            <>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />

              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="District"
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
            </>
          )}

          <button
            onClick={handleUpdateLocation}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm
                       hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Location"}
          </button>
        </div>
      )}

      {/* ---------------- Logout ---------------- */}
      <button
        onClick={logout}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}

/* ---------- helper ---------- */

function Field({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">
        {value || "—"}
      </span>
    </div>
  );
}

export default Profile;
