import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
 
  return (
    <header className="flex items-center justify-between bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-6 py-3 shadow-sm dark:shadow-lg">
      {/* Left */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Welcome{user?.name ? `, ${user.name}` : ""}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {user?.role || "User Dashboard"}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8  rounded-full overflow-hidden border">
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
