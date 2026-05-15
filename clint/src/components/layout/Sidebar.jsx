import { NavLink } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
import { ADMIN_MENU } from "../../config/adminMenu";
import { LayoutDashboard, FileText, AlertCircle, Trophy, User, Users, Zap, TrendingUp } from "lucide-react";

function Sidebar() {
  const { role } = useRole();

  // filter admin menu by role
  const adminMenu = ADMIN_MENU.filter(item =>
    item.roles.includes(role)
  );

  const iconMap = {
    dashboard: LayoutDashboard,
    complaint: FileText,
    feed: AlertCircle,
    rewards: Trophy,
    profile: User,
    admin: Users,
    leaderboard: TrendingUp,
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
      isActive
        ? "bg-primary-100 text-primary-700 border-l-4 border-primary-600"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  const NavItem = ({ to, icon: Icon, label, end = false }) => (
    <NavLink to={to} className={navLinkClass} end={end}>
      <Icon size={18} className="flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="w-64 bg-card border-r border-border shadow-sm flex flex-col h-screen sticky top-0">
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-600">CityHelp</h1>
            <p className="text-xs text-muted-foreground font-medium">Governance</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {/* Common */}
        <NavItem to="/feed" icon={iconMap.feed} label="District Feed" />

        {/* Citizen Menu */}
        {role === "CITIZEN" && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase px-4 tracking-wider">Citizen</p>
            </div>
            <NavItem to="/" icon={iconMap.dashboard} label="Dashboard" end />
            <NavItem to="/complaints/new" icon={iconMap.complaint} label="File Complaint" />
            <NavItem to="/complaints" icon={iconMap.complaint} label="My Complaints" end />
            <NavItem to="/rewards" icon={iconMap.rewards} label="Rewards" />
            <NavItem to="/profile" icon={iconMap.profile} label="Profile" />
          </>
        )}

        {/* Admin/Officer/Dept Head Menu */}
        {role !== "CITIZEN" && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase px-4 tracking-wider">Management</p>
            </div>
            {adminMenu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={navLinkClass}
              >
                <Users size={18} className="flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <NavItem to="/profile" icon={iconMap.profile} label="Profile" />
          </>
        )}

        {/* Leaderboard */}
        <div className="pt-4 pb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase px-4 tracking-wider">More</p>
        </div>
        <NavItem to="/leaderboard" icon={iconMap.leaderboard} label="Leaderboard" />
      </nav>

      {/* Footer Info */}
      <div className="border-t border-border p-4 space-y-2">
        <div className="bg-primary-50 rounded-lg p-3 border border-primary-200">
          <p className="text-xs font-semibold text-primary-700">🚀 v1.0</p>
          <p className="text-xs text-primary-600">CityHelp Platform</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
