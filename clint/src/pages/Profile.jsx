import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { updateAvatar, updateCurrentUser } from "../services/user.service";

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
      console.error(err);
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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      alert("Failed to update department");
    } finally {
      setLoading(false);
    }
  };

  const canEditDepartment = ["DEPT_HEAD", "OFFICER", "WORKER"].includes(
    user.role
  );

  const canEditLocation = [
    "SUPER_ADMIN",
    "CENTRAL_ADMIN",
    "STATE_ADMIN",
    "DISTRICT_ADMIN",
    "DEPT_HEAD",
    "OFFICER",
    "WORKER",
    "CITIZEN",
  ].includes(user.role);

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        My Profile
      </h2>

      {/* ---------------- Avatar ---------------- */}
      <div className="flex items-center gap-4">
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
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {loading ? "Updating..." : "Change Photo"}
          </button>
        </div>
      </div>

      {/* ---------------- Info ---------------- */}
      <div className="bg-white rounded shadow p-4 space-y-3">
        <Field label="Name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="Role" value={user.role} />

        {canEditDepartment ? (
          <div className="space-y-2">
            <label className="text-sm text-gray-500">
              Department
            </label>

            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Department name"
              className="w-full border px-3 py-2 rounded text-sm"
            />

            <button
              onClick={handleUpdateDepartment}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Department"}
            </button>
          </div>
        ) : (
          <Field label="Department" value={user.department} />
        )}

        <Field
          label="Joined On"
          value={dayjs(user.createdAt).format("DD MMM YYYY")}
        />
      </div>

      {/* ---------------- Location Update ---------------- */}
      {canEditLocation && (
        <div className="bg-white rounded shadow p-4 space-y-3">
          <h3 className="font-medium text-gray-700">
            Location (for complaint access)
          </h3>

          <input
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="State"
            className="w-full border px-3 py-2 rounded text-sm"
          />

          {user.role !== "STATE_ADMIN" && (
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="District"
              className="w-full border px-3 py-2 rounded text-sm"
            />
          )}

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full border px-3 py-2 rounded text-sm"
          />

          <button
            onClick={handleUpdateLocation}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Location"}
          </button>
        </div>
      )}

      {/* ---------------- Logout ---------------- */}
      <button
        onClick={logout}
        className="bg-red-600 text-white px-4 py-2 rounded"
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
      <span className="font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

export default Profile;
