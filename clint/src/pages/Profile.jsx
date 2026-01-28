import { useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { updateAvatar } from "../services/user.service";

function Profile() {
  const { user, logout, updateUser } = useAuth();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) return <p>Redirecting...</p>;


  const handleUpdateAvatar = async () => {
    if (!file) return alert("Select image first");

    try {
      setLoading(true);
      const res = await updateAvatar(file);

      updateUser(res.data.user); // ✅ ab backend se aa raha
    } catch (err) {
      console.error(err);
      alert("Failed to update profile photo");
    } finally {
      setLoading(false);
    }
  };
        


  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        My Profile
      </h2>

      {/* Avatar */}
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

      {/* Info */}
      <div className="bg-white rounded shadow p-4 space-y-3">
        <Field label="Name" value={user.name} />
        <Field label="Email" value={user.email} />
        <Field label="Role" value={user.role} />

        {user.department && (
          <Field
            label="Department"
            value={user.department}
          />
        )}

        <Field
          label="Joined On"
          value={dayjs(user.createdAt).format(
            "DD MMM YYYY"
          )}
        />
      </div>

      {/* Logout */}
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
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default Profile;
