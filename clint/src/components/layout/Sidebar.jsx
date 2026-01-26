import { NavLink } from "react-router-dom";
import { useRole } from "../../hooks/useRole";

function Sidebar() {
  const { role } = useRole();

  const linkClass = ({ isActive }) =>
    `block rounded px-4 py-2 text-sm font-medium ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <aside className="w-64 bg-gray-400 border-r shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold text-blue-600">CityHelp</h1>
        <p className="text-xs text-gray-500">Governance Portal</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {/* Citizen Links */}
        {role === "CITIZEN" && (
          <>
            <NavLink to="/" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/complaints/new" className={linkClass}>
              File Complaint
            </NavLink>
            <NavLink to="/complaints" end className={linkClass}>
              My Complaints
            </NavLink>
            <NavLink to="/rewards" className={linkClass}>
              Rewards
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          </>
        )}

        {/* Admin / Officer / Dept Head Links */}
        {role !== "CITIZEN" && (
          <>
            <NavLink to="/" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/complaints" className={linkClass}>
              Manage Complaints
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          </>
        )}

        <NavLink to="/leaderboard" className={linkClass}>
          Leaderboard
        </NavLink>

      </nav>
    </aside>
  );
}

export default Sidebar;
