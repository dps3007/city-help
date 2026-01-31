import { NavLink } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import { ADMIN_MENU } from "../../config/adminMenu";

function Sidebar() {
  const { role } = useRole();

  const linkClass = ({ isActive }) =>
    `block rounded px-4 py-2 text-sm font-medium ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  // filter admin menu by role
  const adminMenu = ADMIN_MENU.filter(item =>
    item.roles.includes(role)
  );

  return (
    <aside className="w-64 bg-gray-400 border-r shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold text-blue-600">CityHelp</h1>
        <p className="text-xs text-gray-500">Governance Portal</p>
      </div>

      {/* Navigation */}
        <nav className="p-4 space-y-1">
            <NavLink to="/feed" className={linkClass}>
              District Feed
            </NavLink>

        {/* 🟢 CITIZEN MENU */}
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

        {/* 🔵 ADMIN / OFFICER / DEPT HEAD MENU */}
        {role !== "CITIZEN" && (
          <>
            {adminMenu.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={linkClass}
              >
                {item.label}
              </NavLink>
            ))}

            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
          </>
        )}

        {/* 🔷 COMMON */}
        <NavLink to="/leaderboard" className={linkClass}>
          Leaderboard
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
