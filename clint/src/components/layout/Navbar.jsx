import { useAuth } from "../../context/AuthContext";
import { LogOut, Bell, User } from "lucide-react";
import Button from "../common/Button";

function Navbar() {
  const { user, logout } = useAuth();

  const roleLabel = {
    CITIZEN: "Citizen",
    ADMIN: "Admin",
    OFFICER: "Officer",
    DEPT_HEAD: "Department Head",
  };
 
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-foreground">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            {roleLabel[user?.role] || "User"}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* User Avatar & Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{roleLabel[user?.role] || "User"}</p>
            </div>
            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary-200 flex-shrink-0 bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Logout Button */}
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
