import { useAuth } from "../hooks/useAuth";

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <p className="text-gray-600">Loading profile...</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Profile
      </h2>

      <div className="bg-white rounded shadow-sm p-6 space-y-4">
        <ProfileRow label="Name" value={user.name} />
        <ProfileRow label="Email" value={user.email} />
        <ProfileRow label="Role" value={user.role} />
        <ProfileRow
          label="User ID"
          value={user.id || user._id}
        />
      </div>

      {/* Future settings */}
      <div className="bg-white rounded shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-2">
          Settings
        </h3>
        <p className="text-sm text-gray-500">
          Profile editing, password change, language
          preferences, and notification settings will be
          available in future versions.
        </p>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}

export default Profile;
